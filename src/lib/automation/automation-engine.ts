import { Automation, AutomationNode, AutomationEdge, AutomationExecution } from '@/types/automation';
import {
  sendEmailAction,
  sendWebhookAction,
  updateDatabaseRowAction,
  callN8nWorkflow,
  sendOpenClawMessage,
  evaluateCondition,
  ExecutionContext,
} from './action-handlers';

export async function executeAutomation(
  automation: Automation,
  context: ExecutionContext
): Promise<AutomationExecution> {
  const nodeResults: AutomationExecution['nodeResults'] = [];

  const execution: AutomationExecution = {
    id: crypto.randomUUID(),
    automationId: automation.id,
    status: 'running',
    startedAt: new Date().toISOString(),
    nodeResults: [],
  };

  try {
    const triggerNode = findTriggerNode(automation.nodes);
    if (!triggerNode) {
      throw new Error('No trigger node found');
    }

    const sortedNodes = topologicalSort(automation.nodes, automation.edges);

    for (const node of sortedNodes) {
      const result = await executeNode(node, context, nodeResults);
      nodeResults.push(result);

      if (result.status === 'error') {
        execution.status = 'error';
        execution.nodeResults = nodeResults;
        execution.finishedAt = new Date().toISOString();
        return execution;
      }
    }

    execution.status = 'success';
    execution.nodeResults = nodeResults;
    execution.finishedAt = new Date().toISOString();
    return execution;
  } catch {
    execution.status = 'error';
    execution.nodeResults = nodeResults;
    execution.finishedAt = new Date().toISOString();
    return execution;
  }
}

function findTriggerNode(nodes: AutomationNode[]): AutomationNode | null {
  return nodes.find((n) => n.type === 'trigger') || null;
}

function topologicalSort(
  nodes: AutomationNode[],
  edges: AutomationEdge[]
): AutomationNode[] {
  const sorted: AutomationNode[] = [];
  const visited = new Set<string>();
  const temp = new Set<string>();

  function visit(nodeId: string): void {
    if (temp.has(nodeId)) return;
    if (visited.has(nodeId)) return;

    temp.add(nodeId);

    const outgoing = edges.filter((e) => e.source === nodeId).map((e) => e.target);

    for (const targetId of outgoing) {
      visit(targetId);
    }

    temp.delete(nodeId);
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      sorted.push(node);
    }
  }

  const trigger = findTriggerNode(nodes);
  if (trigger) {
    visit(trigger.id);
  } else {
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        visit(node.id);
      }
    }
  }

  return sorted;
}

async function executeNode(
  node: AutomationNode,
  context: ExecutionContext,
  _previousResults: AutomationExecution['nodeResults']
): Promise<AutomationExecution['nodeResults'][0]> {
  try {
    let output: unknown;

    switch (node.subtype) {
      case 'webhook':
      case 'schedule':
      case 'manual':
      case 'db-row-changed':
        output = context;
        break;

      case 'if-else':
        output = evaluateCondition(
          node.data.config.condition as string,
          context
        );
        break;

      case 'wait':
        await new Promise((resolve) =>
          setTimeout(resolve, (node.data.config.duration as number) * 1000)
        );
        output = context;
        break;

      case 'send-email':
        output = await sendEmailAction(node, context);
        break;

      case 'send-webhook':
        output = await sendWebhookAction(node, context);
        break;

      case 'update-db-row':
        output = await updateDatabaseRowAction(node, context);
        break;

      case 'call-n8n':
        output = await callN8nWorkflow(node, context);
        break;

      case 'openclaw-message':
        output = await sendOpenClawMessage(node, context);
        break;

      default:
        output = context;
    }

    return {
      nodeId: node.id,
      status: 'success',
      output,
      duration: Math.random() * 100,
    };
  } catch (error) {
    return {
      nodeId: node.id,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Math.random() * 100,
    };
  }
}
