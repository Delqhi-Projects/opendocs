import type { Node, Edge } from '@xyflow/react'

export type AutomationNodeType =
  | 'manual'
  | 'webhook'
  | 'schedule'
  | 'db-row-changed'
  | 'if-else'
  | 'switch'
  | 'wait'
  | 'send-email'
  | 'send-webhook'
  | 'update-db-row'
  | 'call-n8n'
  | 'openclaw-message'
  | 'ai-prompt'

export interface AutomationNodeData extends Record<string, unknown> {
  label?: string
  type?: AutomationNodeType
  config?: NodeConfig
}

export interface NodeConfig {
  table?: string
  operation?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  condition?: string
  webhookUrl?: string
  schedule?: string
  timezone?: string
  waitDuration?: number
  emailTo?: string
  emailSubject?: string
  emailBody?: string
  n8nWorkflowId?: string
  openclawAction?: string
  openclawPhone?: string
  openclawMessage?: string
  aiPrompt?: string
  aiModel?: string
}

export interface Automation {
  id: string
  name: string
  description?: string
  nodes: Array<Node<AutomationNodeData>>
  edges: Array<Edge>
  isActive: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface AutomationTrigger {
  id: string
  automationId: string
  type: AutomationNodeType
  config: NodeConfig
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface AutomationSchedule {
  id: string
  automationId: string
  triggerId: string
  cronExpression: string
  timezone: string
  isActive: boolean
  lastRun?: string
  nextRun?: string
  createdAt: string
  updatedAt: string
}

export interface AutomationExecution {
  id: string
  automationId: string
  triggerType: string
  triggerConfig: Record<string, unknown>
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: string
  completedAt?: string
  errorMessage?: string
  executionContext: Record<string, unknown>
}

export type NotificationType = 'email' | 'push' | 'in_app' | 'webhook' | 'whatsapp'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown>
  priority: NotificationPriority
  status: NotificationStatus
  createdAt: string
  sentAt?: string
  readAt?: string
}

export interface InAppNotification {
  id: string
  userId: string
  title: string
  body: string
  data: Record<string, unknown>
  read: boolean
  createdAt: string
  readAt?: string
}

export interface DbChangeEvent {
  id: string
  tableName: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  recordId: string
  oldRecord?: Record<string, unknown>
  newRecord?: Record<string, unknown>
  userId?: string
  createdAt: string
}

export interface WebhookDelivery {
  id: string
  url: string
  payload: Record<string, unknown>
  headers: Record<string, string>
  statusCode?: number
  responseBody?: string
  errorMessage?: string
  attemptCount: number
  maxAttempts: number
  nextAttemptAt?: string
  deliveredAt?: string
  createdAt: string
}
