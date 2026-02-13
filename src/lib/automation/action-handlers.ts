import { AutomationNode } from '@/types/automation';
import { Parser } from 'expr-eval';
import { z } from 'zod';

export type ExecutionContext = Record<string, unknown>;

const parser = new Parser();

const SendEmailSchema = z.object({
  to: z.string().max(254),
  subject: z.string().max(200),
  body: z.string().max(50000),
  headers: z.record(z.string(), z.string()).optional()
});

const SendWebhookSchema = z.object({
  url: z.string().url().max(2048),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  body: z.string().max(100000).optional()
});

const SendMessageSchema = z.object({
  platform: z.enum(['telegram', 'discord', 'slack', 'whatsapp']),
  recipient: z.string().min(1).max(500),
  message: z.string().min(1).max(4000)
});

export async function sendEmailAction(
  node: AutomationNode,
  context: ExecutionContext
): Promise<{ sent: boolean; messageId: string }> {
  const config = node.data.config;
  const headersString = config.headers as string;
  
  const validated = SendEmailSchema.parse({
    to: substituteVariables(config.to as string, context),
    subject: substituteVariables(config.subject as string, context),
    body: substituteVariables(config.body as string, context),
    headers: headersString ? parseHeaders(headersString, context) : {}
  });
  
  const response = await fetch('/api/automation/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated),
  });

  if (!response.ok) {
    throw new Error('Failed to send email');
  }

  return response.json();
}

export async function sendWebhookAction(
  node: AutomationNode,
  context: ExecutionContext
): Promise<{ status: number; response: unknown }> {
  const config = node.data.config;
  const headersString = config.headers as string;
  
  const validated = SendWebhookSchema.parse({
    url: substituteVariables(config.url as string, context),
    method: config.method || 'POST',
    body: config.body ? substituteVariables(config.body as string, context) : undefined
  });
  
  const response = await fetch(validated.url, {
    method: validated.method,
    headers: {
      'Content-Type': 'application/json',
      ...parseHeaders(headersString, context),
    },
    body: validated.body ? JSON.stringify(validated.body) : undefined,
  });

  return {
    status: response.status,
    response: await response.json().catch(() => ({})),
  };
}

export async function updateDatabaseRowAction(
  node: AutomationNode,
  context: ExecutionContext
): Promise<{ updated: boolean }> {
  const config = node.data.config;
  const response = await fetch('/api/automation/db-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      table: config.table,
      id: substituteVariables(config.id as string, context),
      data: config.data,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update database row');
  }

  return { updated: true };
}

export async function callN8nWorkflow(
  node: AutomationNode,
  _context: ExecutionContext
): Promise<{ executed: boolean; executionId: string }> {
  const config = node.data.config;
  const response = await fetch('/api/automation/n8n-execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowId: config.workflowId,
      payload: config.payload,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to execute n8n workflow');
  }

  return response.json();
}

export async function sendOpenClawMessage(
  node: AutomationNode,
  context: ExecutionContext
): Promise<{ sent: boolean; messageId: string }> {
  const config = node.data.config;
  
  const validated = SendMessageSchema.parse({
    platform: config.platform,
    recipient: substituteVariables(config.recipient as string, context),
    message: substituteVariables(config.message as string, context),
  });
  
  const response = await fetch('/api/openclaw/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated),
  });

  if (!response.ok) {
    throw new Error('Failed to send OpenClaw message');
  }

  return response.json();
}

export function evaluateCondition(
  condition: string,
  context: ExecutionContext
): boolean {
  try {
    const substitutedCondition = substituteVariables(condition, context);
    const expression = parser.parse(substitutedCondition);
    return Boolean(expression.evaluate(context as Record<string, import('expr-eval').Value>));
  } catch (error) {
    console.warn('Condition evaluation failed:', error);
    return false;
  }
}

function substituteVariables(
  template: string,
  context: ExecutionContext
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const value = getNestedValue(context, path.trim());
    return JSON.stringify(value);
  });
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

function parseHeaders(
  headersString: string,
  context: ExecutionContext
): Record<string, string> {
  try {
    const parsed = JSON.parse(substituteVariables(headersString, context));
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}
