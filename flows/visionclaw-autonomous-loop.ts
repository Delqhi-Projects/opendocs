/**
 * VisionClaw Autonomous Loop
 * Gateway → Automation Engine → Steel Browser
 */

import { NativeCDPClient } from './native-cdp-client';
import { MistralVisionClient } from './mistral-vision-client';
import { Redis } from 'ioredis';
import { Pool } from 'pg';

interface AutomationStep {
  id: string;
  action: 'navigate' | 'click' | 'type' | 'select' | 'extract' | 'wait' | 'screenshot';
  selector?: string;
  value?: string;
  verifyWithVision?: boolean;
  waitAfter?: number;
}

interface AutomationTask {
  id: string;
  type: 'web_automation' | 'data_extraction' | 'form_filling' | 'account_creation';
  url: string;
  steps: AutomationStep[];
  maxIterations: number;
  timeout: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep: number;
}

export class VisionClawAutonomousLoop {
  private cdp: NativeCDPClient;
  private vision: MistralVisionClient;
  private redis: Redis;
  private pool: Pool;
  private steelBrowserUrl: string;
  private isRunning: boolean = false;
  private currentTask: AutomationTask | null = null;

  constructor() {
    this.cdp = new NativeCDPClient();
    this.vision = new MistralVisionClient();
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.pool = new Pool({
      connectionString: process.env.POSTGRES_URL || 'postgresql://ceo_admin:secure_pass@localhost:5432/sin_solver'
    });
    this.steelBrowserUrl = process.env.STEEL_BROWSER_URL || 'ws://localhost:50015';
  }

  /**
   * Start the autonomous loop
   */
  async start(): Promise<void> {
    this.isRunning = true;
    console.log('VisionClaw Autonomous Loop started');
    
    while (this.isRunning) {
      try {
        // Get next task from queue
        const taskId = await this.redis.rpop('visionclaw:task_queue');
        
        if (taskId) {
          await this.executeTask(taskId);
        } else {
          // Wait for new tasks
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Loop error:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Stop the autonomous loop
   */
  stop(): void {
    this.isRunning = false;
    console.log('VisionClaw Autonomous Loop stopped');
  }

  /**
   * Add task to queue
   */
  async queueTask(task: AutomationTask): Promise<void> {
    await this.redis.lpush('visionclaw:task_queue', task.id);
    
    // Store task in Postgres
    await this.pool.query(
      `INSERT INTO automation_tasks (id, type, url, steps, max_iterations, timeout, status, current_step)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 0)
       ON CONFLICT (id) DO UPDATE SET status = 'pending'`,
      [task.id, task.type, task.url, JSON.stringify(task.steps), task.maxIterations, task.timeout]
    );
  }

  /**
   * Execute a single task
   */
  private async executeTask(taskId: string): Promise<void> {
    // Load task from database
    const result = await this.pool.query(
      'SELECT * FROM automation_tasks WHERE id = $1',
      [taskId]
    );

    if (result.rows.length === 0) {
      console.log(`Task ${taskId} not found`);
      return;
    }

    this.currentTask = {
      ...result.rows[0],
      steps: result.rows[0].steps
    };

    try {
      // Update status to running
      await this.updateTaskStatus('running');
      
      // Connect to Steel Browser
      await this.cdp.connect(`${this.steelBrowserUrl}/devtools/page/1`);
      
      // Execute all steps
      for (let i = 0; i < this.currentTask.steps.length; i++) {
        this.currentTask.currentStep = i;
        await this.updateTaskStatus('running');
        
        const step = this.currentTask.steps[i];
        const stepResult = await this.executeStep(step);
        
        // Store step result
        await this.storeStepResult(taskId, step.id, stepResult);
        
        // Verify with vision if needed
        if (step.verifyWithVision) {
          const verified = await this.verifyWithVision();
          if (!verified.success) {
            if (step.onFailure === 'abort') {
              throw new Error(`Step ${step.id} verification failed`);
            } else if (step.onFailure === 'retry') {
              i--; // Retry this step
            }
          }
        }
        
        // Wait after step if specified
        if (step.waitAfter) {
          await new Promise(resolve => setTimeout(resolve, step.waitAfter));
        }
      }
      
      // Task completed successfully
      await this.updateTaskStatus('completed');
      
    } catch (error) {
      console.error(`Task ${taskId} failed:`, error);
      await this.updateTaskStatus('failed');
    } finally {
      await this.cdp.disconnect();
      this.currentTask = null;
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: AutomationStep): Promise<any> {
    switch (step.action) {
      case 'navigate':
        await this.cdp.navigate(step.value || this.currentTask!.url);
        return { success: true };
        
      case 'click':
        await this.cdp.click(step.selector!);
        return { success: true };
        
      case 'type':
        await this.cdp.type(step.selector!, step.value!);
        return { success: true };
        
      case 'select':
        await this.cdp.select(step.selector!, step.value!);
        return { success: true };
        
      case 'wait':
        await new Promise(resolve => setTimeout(resolve, parseInt(step.value || '1000')));
        return { success: true };
        
      case 'screenshot':
        const screenshot = await this.cdp.screenshot();
        return { success: true, screenshot: screenshot.toString('base64') };
        
      case 'extract':
        const extracted = await this.cdp.extract(step.selector!);
        return { success: true, data: extracted };
        
      default:
        throw new Error(`Unknown action: ${step.action}`);
    }
  }

  /**
   * Verify current state with vision AI
   */
  private async verifyWithVision(): Promise<{ success: boolean; analysis?: string }> {
    try {
      const screenshot = await this.cdp.screenshot();
      const result = await this.vision.analyzePage(screenshot);
      return {
        success: result.success,
        analysis: result.analysis
      };
    } catch (error) {
      console.error('Vision verification failed:', error);
      return { success: false };
    }
  }

  /**
   * Update task status in database
   */
  private async updateTaskStatus(status: string): Promise<void> {
    if (!this.currentTask) return;
    
    await this.pool.query(
      'UPDATE automation_tasks SET status = $1, current_step = $2, updated_at = NOW() WHERE id = $3',
      [status, this.currentTask.currentStep, this.currentTask.id]
    );
  }

  /**
   * Store step result
   */
  private async storeStepResult(taskId: string, stepId: string, result: any): Promise<void> {
    await this.pool.query(
      `INSERT INTO automation_step_results (task_id, step_id, result, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (task_id, step_id) DO UPDATE SET result = $3`,
      [taskId, stepId, JSON.stringify(result)]
    );
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<AutomationTask | null> {
    const result = await this.pool.query(
      'SELECT * FROM automation_tasks WHERE id = $1',
      [taskId]
    );
    
    if (result.rows.length === 0) return null;
    
    return {
      ...result.rows[0],
      steps: result.rows[0].steps
    };
  }

  /**
   * Stop a running task
   */
  async stopTask(taskId: string): Promise<void> {
    await this.pool.query(
      'UPDATE automation_tasks SET status = $1 WHERE id = $2',
      ['cancelled', taskId]
    );
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    this.stop();
    await this.redis.quit();
    await this.pool.end();
  }
}

export default VisionClawAutonomousLoop;
