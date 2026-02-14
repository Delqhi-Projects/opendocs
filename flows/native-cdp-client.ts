/**
 * Native CDP Client - High Performance Chrome DevTools Protocol Client
 * Direct WebSocket connection for ultra-fast browser automation
 */

import WebSocket from 'ws';

export interface CDPMessage {
  id: number;
  method: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: { code: number; message: string };
}

export interface CDPSession {
  id: string;
  targetId: string;
}

export interface ScreenshotOptions {
  format?: 'png' | 'jpeg';
  quality?: number;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
    scale?: number;
  };
  fromSurface?: boolean;
}

export interface NavigationOptions {
  url: string;
  timeout?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'networkidle0';
}

export class NativeCDPClient {
  private ws: WebSocket | null = null;
  private messageId = 0;
  private pending: Map<number, { resolve: (value: unknown) => void; reject: (reason: unknown) => void }> = new Map();
  private sessionId: string | null = null;
  private targetId: string | null = null;
  private connected = false;

  /**
   * Connect to Chrome DevTools Protocol endpoint
   */
  async connect(wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        this.connected = true;
        console.log('[CDP] Connected to', wsUrl);
        resolve();
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data.toString());
      });

      this.ws.on('error', (error) => {
        console.error('[CDP] Connection error:', error);
        reject(error);
      });

      this.ws.on('close', () => {
        this.connected = false;
        console.log('[CDP] Disconnected');
      });
    });
  }

  /**
   * Disconnect from CDP endpoint
   */
  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
      this.sessionId = null;
    }
  }

  /**
   * Send CDP command and wait for response
   */
  async send<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
    if (!this.ws || !this.connected) {
      throw new Error('Not connected to CDP');
    }

    const id = ++this.messageId;

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (value: unknown) => void, reject });

      const message: CDPMessage = { id, method, params };
      this.ws!.send(JSON.stringify(message));

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP command timeout: ${method}`));
        }
      }, 30000);
    });
  }

  /**
   * Handle incoming CDP messages
   */
  private handleMessage(data: string): void {
    try {
      const message: CDPMessage = JSON.parse(data);

      // Handle response to a command
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id)!;
        this.pending.delete(message.id);

        if (message.error) {
          reject(new Error(`CDP Error: ${message.error.message} (${message.error.code})`));
        } else {
          resolve(message.result);
        }
      }

      // Handle event messages (notifications)
      if (!message.id && message.method) {
        this.handleEvent(message.method, message.params);
      }
    } catch (error) {
      console.error('[CDP] Failed to parse message:', error);
    }
  }

  /**
   * Handle CDP events
   */
  private handleEvent(method: string, params?: Record<string, unknown>): void {
    console.log('[CDP Event]', method, params);

    switch (method) {
      case 'Target.targetCreated':
        this.targetId = (params as { targetInfo: { targetId: string } })?.targetInfo?.targetId;
        break;
      case 'Runtime.exceptionThrown':
        console.error('[CDP Exception]', params);
        break;
    }
  }

  /**
   * Create a new CDP session for a target
   */
  async createSession(targetId?: string): Promise<CDPSession> {
    const result = await this.send<{ sessionId: string }>('Target.createTarget', {
      url: 'about:blank',
      browserContextId: undefined
    });

    this.sessionId = result.sessionId;
    this.targetId = targetId || result.sessionId;

    return { id: result.sessionId, targetId: this.targetId };
  }

  /**
   * Attach to an existing target
   */
  async attachToTarget(targetId: string): Promise<string> {
    const result = await this.send<{ sessionId: string }>('Target.attachToTarget', {
      targetId,
      flatten: true
    });

    this.sessionId = result.sessionId;
    return result.sessionId;
  }

  /**
   * Navigate to a URL
   */
  async navigate(url: string, options?: Partial<NavigationOptions>): Promise<string> {
    const result = await this.send<{ loaderId: string }>('Page.navigate', {
      url,
      transitionType: undefined
    });

    // Wait for load event if requested
    if (options?.waitUntil) {
      await this.waitForLoadEvent(options.waitUntil);
    }

    return result.loaderId;
  }

  /**
   * Wait for page load event
   */
  private async waitForLoadEvent(waitUntil: string): Promise<void> {
    return new Promise((resolve) => {
      const handler = (method: string) => {
        if (method === `Page.${waitUntil}` || method === 'Page.loadEventFired') {
          resolve();
        }
      };

      // Simple timeout-based approach
      setTimeout(resolve, 5000);
    });
  }

  /**
   * Capture screenshot of page or element
   */
  async screenshot(options?: ScreenshotOptions): Promise<Buffer> {
    const result = await this.send<{ data: string }>('Page.captureScreenshot', {
      format: options?.format || 'png',
      quality: options?.quality,
      clip: options?.clip,
      fromSurface: options?.fromSurface ?? true
    });

    return Buffer.from(result.data, 'base64');
  }

  /**
   * Capture screenshot of specific element
   */
  async captureElement(selector: string): Promise<Buffer> {
    // First get element bounds
    const bounds = await this.getElementBounds(selector);

    // Capture viewport screenshot with clip
    return this.screenshot({
      format: 'jpeg',
      quality: 80,
      clip: {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        scale: 1
      }
    });
  }

  /**
   * Get element bounding box
   */
  async getElementBounds(selector: string): Promise<{ x: number; y: number; width: number; height: number }> {
    const result = await this.send<{ model: { layout: { offsetX: number; offsetY: number; width: number; height: number } } }>(
      'DOM.getBoundingClientRect',
      { selector }
    );

    const layout = result.model?.layout;
    return {
      x: layout?.offsetX || 0,
      y: layout?.offsetY || 0,
      width: layout?.width || 0,
      height: layout?.height || 0
    };
  }

  async click(selector: string): Promise<void> {
    const bounds = await this.getElementBounds(selector);
    const x = Math.floor(bounds.x + bounds.width / 2);
    const y = Math.floor(bounds.y + bounds.height / 2);

    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      clickCount: 1
    });

    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      clickCount: 1
    });
  }

  /**
   * Click on coordinates
   */
  async clickAt(x: number, y: number): Promise<void> {
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      clickCount: 1
    });

    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      clickCount: 1
    });
  }

  /**
   * Type text into element
   */
  async type(selector: string, text: string): Promise<void> {
    // Focus element
    await this.send('Runtime.evaluate', {
      expression: `document.querySelector('${selector}').focus()`,
      returnByValue: true
    });

    // Type each character
    for (const char of text) {
      await this.send('Input.dispatchKeyEvent', {
        type: 'keyDown',
        text: char,
        windowsVirtualKeyCode: char.charCodeAt(0)
      });

      await this.send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        text: char,
        windowsVirtualKeyCode: char.charCodeAt(0)
      });
    }
  }

  /**
   * Submit captcha solution
   */
  async submitCaptcha(solution: string, captchaType: string): Promise<boolean> {
    try {
      switch (captchaType) {
        case 'text':
        case 'image': {
          await this.type('input[type="text"], input[name="captcha"], #captcha-input', solution);
          await this.clickAt(400, 500);
          break;
        }
        case 'slider': {
          const distance = parseInt(solution, 10) || 200;
          await this.dragSlider(distance);
          break;
        }
        case 'hcaptcha':
        case 'recaptcha': {
          await this.clickAt(300, 300);
          break;
        }
        default:
          console.warn('[CDP] Unknown captcha type:', captchaType);
      }

      return true;
    } catch (error) {
      console.error('[CDP] Failed to submit captcha:', error);
      return false;
    }
  }

  /**
   * Drag slider to position (for slider captchas)
   */
  async dragSlider(distance: number): Promise<void> {
    const startX = 100;
    const startY = 300;

    // Mouse down
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: startX,
      y: startY,
      button: 'left',
      clickCount: 1
    });

    // Move to position in steps (anti-bot detection)
    const steps = 10;
    const stepSize = distance / steps;

    for (let i = 0; i < steps; i++) {
      await this.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: startX + stepSize * (i + 1),
        y: startY,
        button: 'left'
      });

      // Random delay between steps
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    }

    // Mouse up
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: startX + distance,
      y: startY,
      button: 'left',
      clickCount: 1
    });
  }

  /**
   * Evaluate JavaScript in page context
   */
  async evaluate<T = unknown>(expression: string): Promise<T> {
    const result = await this.send<{ result: { value: T } }>('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: false
    });

    return result.result?.value;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Select option from dropdown
   */
  async select(selector: string, value: string): Promise<void> {
    await this.send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('${selector}');
        if (el) {
          el.value = '${value}';
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      `,
      returnByValue: true
    });
  }

  /**
   * Extract text content from element
   */
  async extract(selector: string): Promise<string> {
    const result = await this.send<{ result: { value: string } }>('Runtime.evaluate', {
      expression: `
        (function() {
          const el = document.querySelector('${selector}');
          return el ? el.textContent.trim() : '';
        })()
      `,
      returnByValue: true
    });

    return result.result?.value || '';
  }
}

export default NativeCDPClient;
