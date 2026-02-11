export interface AIChatOptions { apiUrl?: string; model?: string; }
export class RightSidebarAIChat {
  private container: HTMLElement | null = null;
  constructor(containerId: string, options?: AIChatOptions) {
    this.container = document.getElementById(containerId);
    this.render();
  }
  private render(): void {
    if (!this.container) return;
    this.container.innerHTML = '<div class="ai-chat"><h3>AI Chat</h3></div>';
  }
  send(message: string): Promise<string> { return Promise.resolve(''); }
  destroy(): void { this.container = null; }
}