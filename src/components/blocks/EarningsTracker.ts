export interface EarningsOptions { apiUrl?: string; }
export class EarningsTracker {
  private container: HTMLElement | null = null;
  constructor(containerId: string, options?: EarningsOptions) {
    this.container = document.getElementById(containerId);
    this.render();
  }
  private render(): void {
    if (!this.container) return;
    this.container.innerHTML = '<div class="earnings-tracker"><h3>Earnings</h3></div>';
  }
  refresh(): Promise<void> { return Promise.resolve(); }
  destroy(): void { this.container = null; }
}
export function initEarningsTracker(containerId: string): EarningsTracker {
  return new EarningsTracker(containerId);
}