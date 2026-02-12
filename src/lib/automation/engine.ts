import type { Automation, AutomationNode, AutomationNodeType } from '@/types/automation'

export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface ExecutionContext {
  automationId: string
  triggerType: string
  triggerData: Record<string, unknown>
  variables: Map<string, unknown>
  outputs: Map<string, unknown>
  errors: Array<{ nodeId: string; message: string; timestamp: string }>
  startTime: string
  endTime?: string
}

export type ExecutionCallback = (event: ExecutionEvent) => void

export interface ExecutionEvent {
  type: 'node_start' | 'node_complete' | 'node_error' | 'workflow_complete' | 'workflow_failed'
  nodeId?: string
  nodeType?: string
  output?: unknown
  error?: string
  timestamp: string
}

export class AutomationEngine {
  private automation: Automation | null = null
  private context: ExecutionContext | null = null
  private status: ExecutionStatus = 'idle'
  private callbacks: Set<ExecutionCallback> = new Set()
  private abortController: AbortController | null = null

  loadAutomation(automation: Automation): void {
    this.automation = automation
    this.status = 'idle'
  }

  async execute(triggerType: string = 'manual', triggerData: Record<string, unknown> = {}): Promise<ExecutionContext> {
    if (!this.automation) {
      throw new Error('No automation loaded')
    }

    this.abortController = new AbortController()
    this.status = 'running'

    this.context = {
      automationId: this.automation.id,
      triggerType,
      triggerData,
      variables: new Map(),
      outputs: new Map(),
      errors: [],
      startTime: new Date().toISOString()
    }

    this.emit({ type: 'node_start', nodeId: 'trigger', timestamp: this.context.startTime })

    try {
      await this.executeWorkflow()
      this.status = 'completed'
      this.context.endTime = new Date().toISOString()
      this.emit({ type: 'workflow_complete', timestamp: this.context.endTime })
    } catch (error) {
      this.status = 'failed'
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.context.errors.push({
        nodeId: 'engine',
        message: errorMessage,
        timestamp: new Date().toISOString()
      })
      this.context.endTime = new Date().toISOString()
      this.emit({ type: 'workflow_failed', error: errorMessage, timestamp: this.context.endTime })
    }

    return this.context
  }

  cancel(): void {
    this.abortController?.abort()
    this.status = 'cancelled'
    if (this.context) {
      this.context.endTime = new Date().toISOString()
    }
    this.emit({ type: 'workflow_failed', error: 'Cancelled', timestamp: new Date().toISOString() })
  }

  onExecution(callback: ExecutionCallback): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  private emit(event: ExecutionEvent): void {
    this.callbacks.forEach(cb => cb(event))
  }

  private async executeWorkflow(): Promise<void> {
    if (!this.automation || !this.context) return

    const nodes = this.automation.nodes
    const edges = this.automation.edges

    const triggerNode = nodes.find(n => n.type === 'trigger')
    if (!triggerNode) {
      throw new Error('No trigger node found')
    }

    const executedNodes = new Set<string>()
    const queue: Array<{ node: AutomationNode; output: unknown }> = []

    await this.executeNode(triggerNode, this.context.triggerData)

    const traverseGraph = (currentNodeId: string, output: unknown): void => {
      if (this.abortController?.signal.aborted) return

      const outgoingEdges = edges.filter(e => e.source === currentNodeId)

      for (const edge of outgoingEdges) {
        const targetNode = nodes.find(n => n.id === edge.target)
        if (targetNode && !executedNodes.has(targetNode.id)) {
          queue.push({ node: targetNode, output })
        }
      }
    }

    const processQueue = async (): Promise<void> => {
      while (queue.length > 0 && !this.abortController?.signal.aborted) {
        const { node, output } = queue.shift()!
        if (executedNodes.has(node.id)) continue

        try {
          const nodeOutput = await this.executeNode(node, output)
          traverseGraph(node.id, nodeOutput)
        } catch (error) {
          this.context?.errors.push({
            nodeId: node.id,
            message: error instanceof Error ? error.message : 'Unknown',
            timestamp: new Date().toISOString()
          })
        }
      }
    }

    await processQueue()

    if (this.context.errors.length > 0) {
      throw new Error(`Workflow completed with ${this.context.errors.length} error(s)`)
    }
  }

  private async executeNode(node: AutomationNode, input: unknown): Promise<unknown> {
    if (!this.context) return input

    const nodeType = node.subtype
    const config = node.data.config

    this.emit({
      type: 'node_start',
      nodeId: node.id,
      nodeType,
      timestamp: new Date().toISOString()
    })

    try {
      let output: unknown

      switch (nodeType) {
        case 'manual':
        case 'webhook':
        case 'schedule':
        case 'db-row-changed':
          output = input
          break
        case 'if-else':
        case 'switch':
        case 'wait':
        case 'send-email':
        case 'send-webhook':
        case 'update-db-row':
        case 'call-n8n':
        case 'openclaw-message':
          output = input
          break
        default:
          output = input
      }

      this.context.outputs.set(node.id, output)

      this.emit({
        type: 'node_complete',
        nodeId: node.id,
        nodeType,
        output,
        timestamp: new Date().toISOString()
      })

      return output
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown'

      this.emit({
        type: 'node_error',
        nodeId: node.id,
        nodeType,
        error: errorMessage,
        timestamp: new Date().toISOString()
      })

      throw error
    }
  }

  getStatus(): ExecutionStatus {
    return this.status
  }

  getContext(): ExecutionContext | null {
    return this.context
  }
}
