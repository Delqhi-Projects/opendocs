export interface CaptchaOptions { apiUrl?: string; }
export class CaptchaWidget {
  private container: HTMLElement | null = null;
  constructor(containerId: string, options?: CaptchaOptions) {
    this.container = document.getElementById(containerId);
    this.render();
  }
  private render(): void {
    if (!this.container) return;
    this.container.innerHTML = '<div class="captcha-widget"><h3>CAPTCHA</h3></div>';
  }
  solve(image: string): Promise<string> { return Promise.resolve(''); }
  destroy(): void { this.container = null; }
}