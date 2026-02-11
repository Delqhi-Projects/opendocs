export type N8nNodeConfig = {
  nodeType: string;
  name: string;
  parameters: Record<string, unknown>;
  disabled?: boolean;
};

export type N8nBlockData = {
  title: string;
  node: N8nNodeConfig;
  connections: string[]; // blockIds of connected N8n blocks
  workflowId?: string; // optional n8n workflow id
};
