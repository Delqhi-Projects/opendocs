export interface N8NBlockOptions {
  title?: string;
  n8nUrl?: string;
  onWorkflowExecute?: (workflowId: string) => void;
}

interface N8NWorkflowData {
  id: string;
  name: string;
  active: boolean;
  nodes?: { length?: number };
}

export class N8NBlock {
  private container: HTMLElement | null = null;
  private options: Required<N8NBlockOptions>;
  private workflows: Array<{id: string; name: string; active: boolean; nodes: number}> = [];
  private activeWorkflowId: string | null = null;

  constructor(containerId: string, options: N8NBlockOptions = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      title: options.title || 'n8n Workflows',
      n8nUrl: options.n8nUrl || 'http://localhost:5678',
      onWorkflowExecute: options.onWorkflowExecute || (() => {})
    };
    this.init();
  }

  private init(): void {
    this.render();
    this.attachEventListeners();
    this.loadWorkflows();
  }

  private render(): void {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="n8n-block">
        <div class="n8n-header">
          <h3>${this.options.title}</h3>
          <span>n8n</span>
        </div>
        <div class="n8n-content">
          <div class="n8n-url">
            <label>n8n URL</label>
            <input type="text" value="${this.options.n8nUrl}">
          </div>
          <button class="n8n-refresh-btn">Refresh</button>
          <button class="n8n-create-btn">+ New Workflow</button>
        </div>
        <div class="n8n-workflows"></div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    const refreshBtn = this.container?.querySelector('.n8n-refresh-btn');
    const createBtn = this.container?.querySelector('.n8n-create-btn');
    const urlInput = this.container?.querySelector('input[type="text"]') as HTMLInputElement | null;
    
    refreshBtn?.addEventListener('click', () => this.loadWorkflows());
    createBtn?.addEventListener('click', () => this.createWorkflow());
    
    if (urlInput) {
      urlInput.addEventListener('change', () => {
        this.options.n8nUrl = urlInput.value;
      });
    }
  }

  async loadWorkflows(): Promise<void> {
    try {
      const response = await fetch(`${this.options.n8nUrl}/api/workflows`);
      if (response.ok) {
        const data = await response.json();
        this.workflows = (data.data || []).map((w: N8NWorkflowData) => ({
          id: w.id,
          name: w.name,
          active: w.active,
          nodes: w.nodes?.length || 0
        }));
        this.renderWorkflows();
      }
    } catch (error) {
      console.warn('n8n not accessible');
      this.renderWorkflows();
    }
  }

  private renderWorkflows(): void {
    const container = this.container?.querySelector('.n8n-workflows');
    if (!container) return;
    
    if (this.workflows.length === 0) {
      container.innerHTML = '<div class="n8n-empty">No workflows found</div>';
      return;
    }
    
    container.innerHTML = this.workflows.map(w => `
      <div class="n8n-workflow-item" data-id="${w.id}">
        <span style="background:${w.active ? '#00ff9d' : '#666'}"></span>
        <div><div>${w.name}</div><div>${w.nodes} nodes</div></div>
        <button class="n8n-execute-btn" data-id="${w.id}">Execute</button>
      </div>
    `).join('');
    
    container.querySelectorAll('.n8n-execute-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.target as HTMLElement).dataset.id || '';
        this.executeWorkflow(id);
      });
    });
  }

  async executeWorkflow(workflowId: string): Promise<void> {
    this.options.onWorkflowExecute(workflowId);
    try {
      await fetch(`${this.options.n8nUrl}/api/workflows/${workflowId}/execute`, { method: 'POST' });
      await this.loadWorkflows();
    } catch (error) {
      console.error('Failed:', error);
    }
  }

  private selectWorkflow(workflowId: string): void {
    this.activeWorkflowId = workflowId;
  }

  private createWorkflow(): void {
    window.open(`${this.options.n8nUrl}/workflow/new`, '_blank');
  }

  destroy(): void {
    this.container = null;
  }
}