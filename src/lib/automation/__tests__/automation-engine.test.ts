import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { executeAutomation } from '../automation-engine'
import { updateDatabaseRowAction, evaluateCondition } from '../action-handlers'
import type { Automation, AutomationNode } from '@/types/automation'

declare global {
  var fetch: vi.Mock
}

global.fetch = vi.fn()

describe('Automation Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('executeAutomation', () => {
    it('should execute automation and return result', async () => {
      const automation: Automation = {
        id: 'test-automation',
        name: 'Test Automation',
        nodes: [
          { id: '1', type: 'trigger', subtype: 'manual', data: { config: {} } },
          { id: '2', type: 'action', subtype: 'update-db-row', data: { config: { table: 'test' } } },
        ],
        edges: [{ id: 'e1', source: '1', target: '2' }],
        enabled: true,
      }

      global.fetch.mockResolvedValueOnce({ ok: true })

      const result = await executeAutomation(automation, {})

      expect(result.automationId).toBe('test-automation')
      expect(result.nodeResults.length).toBeGreaterThanOrEqual(1)
    })

    it('should return error status when no trigger node', async () => {
      const automation: Automation = {
        id: 'test-automation',
        name: 'Test Automation',
        nodes: [
          { id: '1', type: 'action', subtype: 'send-email', data: { config: {} } },
        ],
        edges: [],
        enabled: true,
      }

      const result = await executeAutomation(automation, {})

      expect(result.status).toBe('error')
    })

    it('should stop execution on node error', async () => {
      const automation: Automation = {
        id: 'test-automation',
        name: 'Test Automation',
        nodes: [
          { id: '1', type: 'trigger', subtype: 'manual', data: { config: {} } },
          { id: '2', type: 'action', subtype: 'send-email', data: { config: { to: 'test@example.com' } } },
        ],
        edges: [{ id: 'e1', source: '1', target: '2' }],
        enabled: true,
      }

      global.fetch.mockResolvedValueOnce({ ok: false })

      const result = await executeAutomation(automation, {})

      expect(result.status).toBe('error')
    })
  })
})

describe('Action Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('updateDatabaseRowAction', () => {
    it('should update database row', async () => {
      const node: AutomationNode = {
        id: '1',
        type: 'action',
        subtype: 'update-db-row',
        data: {
          config: {
            table: 'users',
            id: 'user-123',
            data: { name: 'John' },
          },
        },
      }

      global.fetch.mockResolvedValueOnce({ ok: true })

      const result = await updateDatabaseRowAction(node, {})

      expect(result.updated).toBe(true)
    })
  })

  describe('evaluateCondition', () => {
    it('should evaluate conditions with context as scope', () => {
      const context = { status: 'active', count: 5 }

      expect(evaluateCondition('status == "active"', context)).toBe(true)
      expect(evaluateCondition('count > 10', context)).toBe(false)
      expect(evaluateCondition('count >= 5', context)).toBe(true)
    })

    it('should return false on invalid conditions', () => {
      expect(evaluateCondition('invalid syntax {{{', {})).toBe(false)
    })
  })
})
