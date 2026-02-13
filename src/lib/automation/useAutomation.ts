import { useCallback, useEffect, useRef, useState } from 'react'
import { AutomationEngine, type ExecutionContext, type ExecutionEvent, type ExecutionStatus } from './engine'
import type { Automation } from '@/types/automation'

interface UseAutomationOptions {
  onComplete?: (context: ExecutionContext) => void
  onError?: (error: string, context: ExecutionContext) => void
  onNodeStart?: (nodeId: string, nodeType: string) => void
  onNodeComplete?: (nodeId: string, output: unknown) => void
  onNodeError?: (nodeId: string, error: string) => void
}

export function useAutomation(automation: Automation | null, options: UseAutomationOptions = {}) {
  const engineRef = useRef<AutomationEngine | null>(null)
  const [status, setStatus] = useState<ExecutionStatus>('idle')
  const [context, setContext] = useState<ExecutionContext | null>(null)
  const [currentNode, setCurrentNode] = useState<string | null>(null)

  useEffect(() => {
    if (!automation) return

    const engine = new AutomationEngine()
    engine.loadAutomation(automation)
    engineRef.current = engine

    const unsubscribe = engine.onExecution((event: ExecutionEvent) => {
      switch (event.type) {
        case 'node_start':
          setCurrentNode(event.nodeId ?? null)
          options.onNodeStart?.(event.nodeId!, event.nodeType!)
          break
        case 'node_complete':
          setCurrentNode(null)
          options.onNodeComplete?.(event.nodeId!, event.output)
          break
        case 'node_error':
          setCurrentNode(null)
          options.onNodeError?.(event.nodeId!, event.error!)
          break
        case 'workflow_complete':
          setStatus('completed')
          options.onComplete?.(engine.getContext()!)
          break
        case 'workflow_failed':
          setStatus('failed')
          options.onError?.(event.error!, engine.getContext()!)
          break
      }
    })

    return () => {
      engine.cancel()
      unsubscribe()
    }
  }, [automation, options])

  const execute = useCallback(async (triggerType = 'manual', triggerData: Record<string, unknown> = {}) => {
    if (!engineRef.current) return null

    setStatus('running')
    const result = await engineRef.current.execute(triggerType, triggerData)
    setContext(result)
    return result
  }, [])

  const cancel = useCallback(() => {
    engineRef.current?.cancel()
    setStatus('cancelled')
  }, [])

  const reset = useCallback(() => {
    engineRef.current?.cancel()
    setStatus('idle')
    setContext(null)
    setCurrentNode(null)
  }, [])

  return {
    status,
    context,
    currentNode,
    execute,
    cancel,
    reset,
    isIdle: status === 'idle',
    isRunning: status === 'running',
    isCompleted: status === 'completed',
    isFailed: status === 'failed',
    isCancelled: status === 'cancelled'
  }
}
