/**
 * Earnings Service - Track and manage user earnings
 * Records earnings from various tasks (captcha, surveys, etc.)
 */

export interface EarningsRecord {
  userId: string;
  amount: number;
  currency: string;
  source: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
}

export interface WalletBalance {
  userId: string;
  balance: number;
  currency: string;
  totalEarned: number;
  totalWithdrawn: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'earning' | 'withdrawal' | 'bonus' | 'deduction';
  source: string;
  taskId?: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export class EarningsService {
  private dbUrl: string;
  private apiKey: string;

  constructor() {
    this.dbUrl = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/earnings';
    this.apiKey = process.env.EARNINGS_API_KEY || '';
  }

  /**
   * Record a new earning
   */
  async record(earnings: EarningsRecord): Promise<Transaction> {
    const transaction: Transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: earnings.userId,
      amount: earnings.amount,
      currency: earnings.currency,
      type: 'earning',
      source: earnings.source,
      taskId: earnings.taskId,
      timestamp: new Date(),
      status: 'completed'
    };

    console.log('[Earnings] Recorded:', transaction);
    return transaction;
  }

  /**
   * Get wallet balance for user
   */
  async getBalance(userId: string): Promise<WalletBalance> {
    const balance: WalletBalance = {
      userId,
      balance: 0,
      currency: 'USD',
      totalEarned: 0,
      totalWithdrawn: 0
    };

    return balance;
  }

  /**
   * Get transaction history
   */
  async getTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    return [];
  }

  /**
   * Withdraw earnings
   */
  async withdraw(userId: string, amount: number): Promise<Transaction> {
    const transaction: Transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      amount: -amount,
      currency: 'USD',
      type: 'withdrawal',
      source: 'user_request',
      timestamp: new Date(),
      status: 'pending'
    };

    return transaction;
  }

  /**
   * Calculate earnings from task results
   */
  calculateTaskEarnings(taskType: string, result: Record<string, unknown>): number {
    const rates: Record<string, number> = {
      captcha_text: 0.003,
      captcha_image: 0.005,
      captcha_slider: 0.008,
      captcha_hcaptcha: 0.01,
      captcha_recaptcha: 0.015,
      survey: 0.50,
      offer: 1.00,
      referral: 5.00
    };

    return rates[taskType] || 0;
  }
}

export default EarningsService;
