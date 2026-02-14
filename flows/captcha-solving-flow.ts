/**
 * Captcha Solving Flow - Orchestrator
 * Coordinates captcha-vision → captcha-worker → steel-browser
 */

import { NativeCDPClient } from './native-cdp-client';
import { MistralVisionClient } from './mistral-vision-client';
import { EarningsService } from './earnings-service';

interface CaptchaSolveRequest {
  url: string;
  captchaType: 'text' | 'image' | 'slider' | 'hcaptcha' | 'recaptcha';
  elementSelector?: string;
}

interface CaptchaSolveResponse {
  success: boolean;
  solution?: string;
  confidence: number;
  solveTimeMs: number;
  earnings?: {
    amount: number;
    currency: string;
  };
}

export class CaptchaSolvingFlow {
  private cdp: NativeCDPClient;
  private vision: MistralVisionClient;
  private earnings: EarningsService;
  private steelBrowserUrl: string;

  constructor() {
    this.cdp = new NativeCDPClient();
    this.vision = new MistralVisionClient();
    this.earnings = new EarningsService();
    this.steelBrowserUrl = process.env.STEEL_BROWSER_URL || 'ws://localhost:50015';
  }

  /**
   * Main entry point for captcha solving flow
   */
  async solve(request: CaptchaSolveRequest): Promise<CaptchaSolveResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Connect to Steel Browser
      await this.cdp.connect(`${this.steelBrowserUrl}/devtools/page/1`);
      
      // Step 2: Navigate to URL
      await this.cdp.navigate(request.url);
      
      // Step 3: Capture captcha screenshot
      const screenshot = await this.cdp.captureElement(request.elementSelector || '#captcha-image');
      
      // Step 4: Analyze with Mistral Vision
      const visionResult = await this.vision.analyzeCaptcha(screenshot, request.captchaType);
      
      // Step 5: Submit solution
      const submitResult = await this.cdp.submitCaptcha(visionResult.text, request.captchaType);
      
      // Step 6: Verify solution
      const verified = await this.verifySolution();
      
      // Step 7: Calculate earnings if successful
      let earnings;
      if (verified) {
        earnings = await this.recordEarnings(request.captchaType);
      }
      
      const solveTimeMs = Date.now() - startTime;
      
      return {
        success: verified,
        solution: visionResult.text,
        confidence: visionResult.confidence,
        solveTimeMs,
        earnings
      };
      
    } catch (error) {
      console.error('Captcha solving failed:', error);
      return {
        success: false,
        confidence: 0,
        solveTimeMs: Date.now() - startTime
      };
    } finally {
      await this.cdp.disconnect();
    }
  }

  /**
   * Verify captcha solution was accepted
   */
  private async verifySolution(): Promise<boolean> {
    try {
      const screenshot = await this.cdp.screenshot();
      const result = await this.vision.verifyCaptchaSolved(screenshot);
      return result.solved;
    } catch {
      return false;
    }
  }

  /**
   * Record earnings to wallet
   */
  private async recordEarnings(captchaType: string): Promise<{ amount: number; currency: string }> {
    // Earnings rates by captcha type
    const rates: Record<string, number> = {
      text: 0.003,
      image: 0.005,
      slider: 0.008,
      hcaptcha: 0.01,
      recaptcha: 0.015
    };
    
    const amount = rates[captchaType] || 0.003;
    
    await this.earnings.record({
      userId: 'system',
      amount,
      currency: 'USD',
      source: 'captcha',
      taskId: `captcha-${Date.now()}`
    });
    
    return { amount, currency: 'USD' };
  }
}

export default CaptchaSolvingFlow;
