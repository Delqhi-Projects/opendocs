export interface HealthOptions { apiUrl?: string; refreshInterval?: number; }
export class HealthDashboard {
  private container: HTMLElement | null = null;
  constructor(containerId: string = 'health-dashboard') {
    this.container = document.getElementById(containerId);
    this.render();
  }
  private render(): void {
    if (!this.container) return;
    this.container.innerHTML = '<div class="health-dashboard"><h3>Health</h3></div>';
  }
  refresh(): Promise<void> { return Promise.resolve(); }
  destroy(): void { this.container = null; }
}