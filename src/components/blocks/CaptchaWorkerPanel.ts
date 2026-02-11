export interface WorkerPanelOptions { apiUrl?: string; }
export class CaptchaWorkerPanel {
  private container: HTMLElement | null = null;
  constructor(containerId: string, options?: WorkerPanelOptions) {
    this.container = document.getElementById(containerId);
    this.render();
  }
  private render(): void {
    if (!this.container) return;
    this.container.innerHTML = '<div class="captcha-worker-panel"><h3>Worker Panel</h3></div>';
  }
  refresh(): Promise<void> { return Promise.resolve(); }
  destroy(): void { this.container = null; }
}