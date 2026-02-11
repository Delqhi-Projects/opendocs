export interface TableColumn { key: string; header: string; width?: string; sortable?: boolean; }
export interface TableOptions { title?: string; editable?: boolean; searchable?: boolean; pageSize?: number; }
export class TableBlock {
  private container: HTMLElement | null = null;
  private data: Record<string, unknown>[] = [];
  constructor(containerId: string, options?: TableOptions) {
    this.container = document.getElementById(containerId);
    this.render();
  }
  private render(): void {
    if (!this.container) return;
    this.container.innerHTML = '<div class="table-block"><h3>Datentabelle</h3></div>';
  }
  loadData(data: Record<string, unknown>[]): void { this.data = data; this.render(); }
  destroy(): void { this.container = null; }
}