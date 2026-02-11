import { postJson } from "@/services/apiClient";
import type { N8nNodeConfig } from "@/types/n8n";

export type N8nNodeDefinition = {
  type: string;
  name: string;
  category?: string;
  description?: string;
};

export async function listN8nNodes(): Promise<N8nNodeDefinition[]> {
  return await postJson("/api/n8n/nodes", {});
}

export async function createN8nWorkflow(title: string): Promise<{ ok: true; id: string }> {
  return await postJson("/api/n8n/workflows/create", { title });
}

export async function updateN8nNode(payload: {
  workflowId: string;
  nodeId?: string;
  config: N8nNodeConfig;
}): Promise<{ ok: true; nodeId: string }> {
  return await postJson("/api/n8n/nodes/update", payload);
}

export async function connectN8nNodes(payload: {
  workflowId: string;
  sourceNodeId: string;
  targetNodeId: string;
}): Promise<{ ok: true }>
{
  return await postJson("/api/n8n/nodes/connect", payload);
}

export async function toggleN8nNode(payload: {
  workflowId: string;
  nodeId: string;
  disabled: boolean;
}): Promise<{ ok: true }>
{
  return await postJson("/api/n8n/nodes/toggle", payload);
}

export async function executeN8nWorkflow(workflowId: string): Promise<{ ok: true; executionId: string }> {
  return await postJson("/api/n8n/workflows/execute", { workflowId });
}
