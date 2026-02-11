export interface DrawOptions { width?: number; height?: number; }
export class DrawBlock {
  private container: HTMLElement | null = null;
  constructor(containerId: string, options?: DrawOptions) {
    this.container = document.getElementById(containerId);
    this.render();
  }
  private render(): void {
    if (!this.container) return;
    this.container.innerHTML = '<div class="draw-block"><h3>Canvas</h3><canvas></canvas></div>';
  }
  clear(): void {}
  getImageData(): string { return ''; }
  destroy(): void { this.container = null; }
}