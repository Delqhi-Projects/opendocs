export type AutomationNodeType = 
  | "webhook" 
  | "schedule" 
  | "db-row-changed"
  | "manual"
  | "if-else"
  | "switch"
  | "wait"
  | "send-email"
  | "send-webhook"
  | "update-db-row"
  | "call-n8n"
  | "openclaw-message";

export interface AutomationNode {
  id: string;
  type: "trigger" | "logic" | "action";
  subtype: AutomationNodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, unknown>;
    description?: string;
  };
}

export interface AutomationEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

export interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
  executionCount: number;
}

export interface AutomationExecution {
  id: string;
  automationId: string;
  status: "running" | "success" | "error";
  startedAt: string;
  finishedAt?: string;
  nodeResults: {
    nodeId: string;
    status: "success" | "error" | "skipped";
    output?: unknown;
    error?: string;
    duration: number;
  }[];
}

export const AUTOMATION_NODE_DEFINITIONS: Record<AutomationNodeType, {
  category: "trigger" | "logic" | "action";
  label: string;
  description: string;
  icon: string;
  color: string;
  inputs: number;
  outputs: number;
  configSchema: {
    key: string;
    label: string;
    type: "text" | "number" | "select" | "json" | "boolean";
    options?: string[];
    required: boolean;
    placeholder?: string;
  }[];
}> = {
  // Triggers
  webhook: {
    category: "trigger",
    label: "Webhook",
    description: "Trigger via HTTP POST request",
    icon: "Globe",
    color: "#3b82f6",
    inputs: 0,
    outputs: 1,
    configSchema: [
      { key: "path", label: "Webhook Path", type: "text", required: true, placeholder: "/webhook/my-automation" },
      { key: "method", label: "HTTP Method", type: "select", options: ["POST", "GET"], required: true },
    ],
  },
  schedule: {
    category: "trigger",
    label: "Schedule",
    description: "Trigger on a schedule (cron)",
    icon: "Clock",
    color: "#8b5cf6",
    inputs: 0,
    outputs: 1,
    configSchema: [
      { key: "cron", label: "Cron Expression", type: "text", required: true, placeholder: "0 9 * * *" },
      { key: "timezone", label: "Timezone", type: "text", required: false, placeholder: "Europe/Berlin" },
    ],
  },
  "db-row-changed": {
    category: "trigger",
    label: "DB Row Changed",
    description: "Trigger when database row changes",
    icon: "Database",
    color: "#10b981",
    inputs: 0,
    outputs: 1,
    configSchema: [
      { key: "table", label: "Table Name", type: "text", required: true },
      { key: "operation", label: "Operation", type: "select", options: ["INSERT", "UPDATE", "DELETE", "*"], required: true },
    ],
  },
  manual: {
    category: "trigger",
    label: "Manual",
    description: "Trigger manually via button",
    icon: "MousePointerClick",
    color: "#f59e0b",
    inputs: 0,
    outputs: 1,
    configSchema: [],
  },
  // Logic
  "if-else": {
    category: "logic",
    label: "If/Else",
    description: "Branch based on condition",
    icon: "GitBranch",
    color: "#6366f1",
    inputs: 1,
    outputs: 2,
    configSchema: [
      { key: "condition", label: "Condition", type: "text", required: true, placeholder: "{{input.value}} > 100" },
    ],
  },
  switch: {
    category: "logic",
    label: "Switch",
    description: "Multi-path branching",
    icon: "Split",
    color: "#6366f1",
    inputs: 1,
    outputs: 4,
    configSchema: [
      { key: "expression", label: "Expression", type: "text", required: true, placeholder: "{{input.status}}" },
      { key: "cases", label: "Cases (JSON)", type: "json", required: true, placeholder: '["active", "pending", "done"]' },
    ],
  },
  wait: {
    category: "logic",
    label: "Wait",
    description: "Delay execution",
    icon: "Timer",
    color: "#6366f1",
    inputs: 1,
    outputs: 1,
    configSchema: [
      { key: "duration", label: "Duration (seconds)", type: "number", required: true, placeholder: "5" },
    ],
  },
  // Actions
  "send-email": {
    category: "action",
    label: "Send Email",
    description: "Send email notification",
    icon: "Mail",
    color: "#ec4899",
    inputs: 1,
    outputs: 1,
    configSchema: [
      { key: "to", label: "To", type: "text", required: true },
      { key: "subject", label: "Subject", type: "text", required: true },
      { key: "body", label: "Body", type: "text", required: true },
    ],
  },
  "send-webhook": {
    category: "action",
    label: "Send Webhook",
    description: "Send HTTP request",
    icon: "Send",
    color: "#ec4899",
    inputs: 1,
    outputs: 1,
    configSchema: [
      { key: "url", label: "URL", type: "text", required: true },
      { key: "method", label: "Method", type: "select", options: ["POST", "GET", "PUT", "DELETE"], required: true },
      { key: "headers", label: "Headers (JSON)", type: "json", required: false },
      { key: "body", label: "Body (JSON)", type: "json", required: false },
    ],
  },
  "update-db-row": {
    category: "action",
    label: "Update DB Row",
    description: "Modify database record",
    icon: "Database",
    color: "#ec4899",
    inputs: 1,
    outputs: 1,
    configSchema: [
      { key: "table", label: "Table", type: "text", required: true },
      { key: "id", label: "Row ID", type: "text", required: true, placeholder: "{{input.id}}" },
      { key: "data", label: "Data (JSON)", type: "json", required: true },
    ],
  },
  "call-n8n": {
    category: "action",
    label: "Call n8n",
    description: "Execute n8n workflow",
    icon: "Zap",
    color: "#ec4899",
    inputs: 1,
    outputs: 1,
    configSchema: [
      { key: "workflowId", label: "Workflow ID", type: "text", required: true },
      { key: "payload", label: "Payload (JSON)", type: "json", required: false },
    ],
  },
  "openclaw-message": {
    category: "action",
    label: "OpenClaw Message",
    description: "Send WhatsApp/Meta message",
    icon: "MessageCircle",
    color: "#ec4899",
    inputs: 1,
    outputs: 1,
    configSchema: [
      { key: "platform", label: "Platform", type: "select", options: ["whatsapp", "messenger"], required: true },
      { key: "recipient", label: "Recipient", type: "text", required: true },
      { key: "message", label: "Message", type: "text", required: true },
    ],
  },
};
