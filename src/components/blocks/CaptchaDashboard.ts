export interface DashboardOptions { apiUrl?: string; }
export class CaptchaDashboard {
  private container: HTMLElement | null = null;
  constructor(containerId: string, options?: DashboardOptions) {
    this.container = document.getElementById(containerId);
    this.render();
  }
  private render(): void {
    if (!this.container) return;
    this.container.innerHTML = '<div class="captcha-dashboard"><h3>Dashboard</h3></div>';
  }
  refresh(): Promise<void> { return Promise.resolve(); }
  destroy(): void { this.container = null; }
}