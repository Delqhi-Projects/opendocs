/**
 * Earnings Calculation Flow
 * Worker Results → Earnings Service → Wallet
 */

import { Pool } from 'pg';
import { EarningsService } from './earnings-service';

interface WorkerResult {
  userId: string;
  taskType: 'captcha' | 'survey' | 'referral';
  taskId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
  completedAt: string;
}

interface WalletUpdate {
  userId: string;
  newBalance: number;
  totalEarned: number;
  transactionId: string;
}

export class EarningsCalculationFlow {
  private pool: Pool;
  private earningsService: EarningsService;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.POSTGRES_URL || 'postgresql://ceo_admin:secure_pass@localhost:5432/sin_solver'
    });
    this.earningsService = new EarningsService();
  }

  /**
   * Process worker result and update wallet
   */
  async processWorkerResult(result: WorkerResult): Promise<WalletUpdate> {
    // Step 1: Validate result
    await this.validateResult(result);

    // Step 2: Calculate earnings with bonuses
    const calculatedEarnings = this.calculateEarnings(result);

    // Step 3: Record earnings transaction
    const earningsId = await this.recordEarnings({
      userId: result.userId,
      amount: calculatedEarnings.amount,
      currency: result.currency,
      source: result.taskType,
      taskId: result.taskId,
      metadata: {
        ...result.metadata,
        baseRate: calculatedEarnings.baseRate,
        bonus: calculatedEarnings.bonus,
        completedAt: result.completedAt
      }
    });

    // Step 4: Update wallet
    const walletUpdate = await this.updateWallet(result.userId, calculatedEarnings.amount);

    // Step 5: Sync to Supabase for real-time updates
    await this.syncToSupabase({
      earningsId,
      walletUpdate,
      result
    });

    // Step 6: Send notification (optional)
    await this.notifyUser(result.userId, calculatedEarnings.amount, result.currency);

    return {
      ...walletUpdate,
      transactionId: earningsId
    };
  }

  /**
   * Validate worker result
   */
  private async validateResult(result: WorkerResult): Promise<void> {
    if (!result.userId) {
('Missing      throw new Error userId');
    }
    if (!result.taskId) {
      throw new Error('Missing taskId');
    }
    if (!result.amount || result.amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Check for duplicate
    const existing = await this.pool.query(
      'SELECT id FROM earnings WHERE task_id = $1 AND user_id = $2',
      [result.taskId, result.userId]
    );
    
    if (existing.rows.length > 0) {
      throw new Error('Duplicate task result');
    }
  }

  /**
   * Calculate earnings with bonuses
   */
  private calculateEarnings(result: WorkerResult): { amount: number; baseRate: number; bonus: number } {
    // Base rates by task type
    const baseRates: Record<string, number> = {
      captcha: 0.003,
      survey: 0.50,
      referral: 5.00
    };

    const baseRate = baseRates[result.taskType] || 0;
    let bonus = 0;

    // Bonus calculations
    if (result.taskType === 'captcha' && result.metadata?.solveTimeMs < 5000) {
      // Speed bonus for fast captcha solving
      bonus = baseRate * 0.5;
    }

    if (result.taskType === 'survey' && result.metadata?.completionRate > 95) {
      // Quality bonus
      bonus = result.amount * 0.1;
    }

    return {
      amount: result.amount + bonus,
      baseRate,
      bonus
    };
  }

  /**
   * Record earnings to database
   */
  private async recordEarnings(data: {
    userId: string;
    amount: number;
    currency: string;
    source: string;
    taskId: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    const result = await this.pool.query(
      `INSERT INTO earnings (user_id, amount, currency, source, task_id, metadata, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'completed')
       RETURNING id`,
      [data.userId, data.amount, data.currency, data.source, data.taskId, JSON.stringify(data.metadata || {})]
    );
    return result.rows[0].id;
  }

  /**
   * Update wallet balance
   */
  private async updateWallet(userId: string, amount: number): Promise<{ newBalance: number; totalEarned: number }> {
    const result = await this.pool.query(
      `UPDATE wallets 
       SET balance = balance + $1, 
           total_earned = total_earned + $1,
           updated_at = NOW()
       WHERE user_id = $2
       RETURNING balance, total_earned`,
      [amount, userId]
    );

    if (result.rows.length === 0) {
      // Create wallet if doesn't exist
      const newWallet = await this.pool.query(
        `INSERT INTO wallets (user_id, balance, total_earned)
         VALUES ($1, $2, $2)
         RETURNING balance, total_earned`,
        [userId, amount]
      );
      return {
        newBalance: newWallet.rows[0].balance,
        totalEarned: newWallet.rows[0].total_earned
      };
    }

    return {
      newBalance: result.rows[0].balance,
      totalEarned: result.rows[0].total_earned
    };
  }

  /**
   * Sync to Supabase for real-time updates
   */
  private async syncToSupabase(data: {
    earningsId: string;
    walletUpdate: { newBalance: number; totalEarned: number };
    result: WorkerResult;
  }): Promise<void> {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.log('Supabase not configured, skipping sync');
        return;
      }

      await fetch(`${supabaseUrl}/rest/v1/rpc/notify_earnings_update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          p_user_id: data.result.userId,
          p_amount: data.result.amount,
          p_new_balance: data.walletUpdate.newBalance,
          p_source: data.result.taskType
        })
      });
    } catch (error) {
      console.error('Supabase sync failed:', error);
    }
  }

  /**
   * Notify user of earnings
   */
  private async notifyUser(userId: string, amount: number, currency: string): Promise<void> {
    // Get user's notification preference
    // For now, just log
    console.log(`User ${userId} earned ${currency} ${amount.toFixed(2)}`);
  }

  /**
   * Get wallet balance for user
   */
  async getWallet(userId: string): Promise<{ balance: number; pendingBalance: number; totalEarned: number }> {
    const result = await this.pool.query(
      'SELECT balance, pending_balance, total_earned FROM wallets WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return { balance: 0, pendingBalance: 0, totalEarned: 0 };
    }

    return result.rows[0];
  }
}

export default EarningsCalculationFlow;
