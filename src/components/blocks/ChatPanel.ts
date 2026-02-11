export interface ChatOptions { apiUrl?: string; }
export default class ChatPanel {
  private container: HTMLElement | null = null;
  constructor(apiService?: unknown) {
    this.container = document.querySelector('.ai-messages');
    this.init();
  }
  private init(): void {}
  send(message: string): Promise<string> { return Promise.resolve(''); }
  destroy(): void { this.container = null; }
}