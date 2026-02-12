import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  executeAutomation,
  topologicalSort,
} from '../automation-engine'
import {
  sendEmailAction,
  sendWebhookAction,
  updateDatabaseRowAction,
  evaluateCondition,
  substituteVariables,
  getNestedValue,
} from '../action-handlers'
import { Automation, AutomationNode, AutomationEdge } from '@/types/automation'

global.fetch = vi.fn()

describe('Automation Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('topologicalSort', () => {
    it('should sort nodes in dependency order', () => {
      const nodes: AutomationNode[] = [
        { id: '1', type: 'trigger', subtype: 'manual', data: { config: {} } },
        { id: '2', type: 'action', subtype: 'send-email', data: { config: {} } },
        { id: '3', type: 'action', subtype: 'send-webhook', data: { config: {} } },
      ]

      const edges: AutomationEdge[] = [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '1', target: '3' },
      ]

      const sorted = topologicalSort(nodes, edges)
      expect(sorted.length).toBe(3)
      expect(sorted[0].id).toBe('1')
      expect(['2', '3']).toContain(sorted[1].id)
      expect(['2', '3']).toContain(sorted[2].id)
    })

    it('should handle single node', () => {
      const nodes: AutomationNode[] = [
        { id: '1', type: 'trigger', subtype: 'manual', data: { config: {} } },
      ]

      const edges: AutomationEdge[] = []

      const sorted = topologicalSort(nodes, edges)
      expect(sorted.length).toBe(1)
      expect(sorted[0].id).toBe('1')
    })

    it('should handle complex dependency chains', () => {
      const nodes: AutomationNode[] = [
        { id: 'trigger', type: 'trigger', subtype: 'manual', data: { config: {} } },
        { id: 'task1', type: 'action', subtype: 'send-email', data: { config: {} } },
        { id: 'task2', type: 'action', subtype: 'send-webhook', data: { config: {} } },
        { id: 'task3', type: 'action', subtype: 'update-db-row', data: { config: {} } },
        { id: 'final', type: 'action', subtype: 'send-email', data: { config: {} } },
      ]

      const edges: AutomationEdge[] = [
        { id: 'e1', source: 'trigger', target: 'task1' },
        { id: 'e2', source: 'task1', target: 'task2' },
        { id: 'e3', source: 'task2', target: 'task3' },
        { id: 'e4', source: 'task3', target: 'final' },
      ]

      const sorted = topologicalSort(nodes, edges)
      const triggerIndex = sorted.findIndex((n) => n.id === 'trigger')
      const finalIndex = sorted.findIndex((n) => n.id === 'final')

      expect(triggerIndex).toBe(0)
      expect(finalIndex).toBe(sorted.length - 1)
    })
  })

  describe('executeAutomation', () => {
    it('should execute automation with trigger and actions', async () => {
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

      const context = { userId: 'user-123', documentId: 'doc-456' }

      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sent: true, messageId: 'msg-123' }),
      })

      const result = await executeAutomation(automation, context)

      expect(result.status).toBe('success')
      expect(result.automationId).toBe('test-automation')
      expect(result.nodeResults.length).toBe(2)
    })

    it('should handle automation without trigger node', async () => {
      const automation: Automation = {
        id: 'test-automation',
        name: 'Test Automation',
        nodes: [
          { id: '1', type: 'action', subtype: 'send-email', data: { config: {} } },
        ],
        edges: [],
        enabled: true,
      }

      const context = {}

      await expect(executeAutomation(automation, context)).rejects.toThrow('No trigger node found')
    })

    it('should stop execution on node error', async () => {
      const automation: Automation = {
        id: 'test-automation',
        name: 'Test Automation',
        nodes: [
          { id: '1', type: 'trigger', subtype: 'manual', data: { config: {} } },
          { id: '2', type: 'action', subtype: 'send-email', data: { config: { to: 'test@example.com' } } },
          { id: '3', type: 'action', subtype: 'send-webhook', data: { config: { url: 'http://example.com' } } },
        ],
        edges: [
          { id: 'e1', source: '1', target: '2' },
          { id: 'e2', source: '2', target: '3' },
        ],
        enabled: true,
      }

      const context = {}

      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockResolvedValueOnce({
        ok: false,
      })

      const result = await executeAutomation(automation, context)

      expect(result.status).toBe('error')
      expect(result.nodeResults[1].status).toBe('error')
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

  describe('sendEmailAction', () => {
    it('should send email with correct parameters', async () => {
      const node: AutomationNode = {
        id: '1',
        type: 'action',
        subtype: 'send-email',
        data: {
          config: {
            to: 'user@example.com',
            subject: 'Test Subject',
            body: 'Test Body',
          },
        },
      }

      const context = { userName: 'John' }

      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sent: true, messageId: 'msg-123' }),
      })

      const result = await sendEmailAction(node, context)

      expect(result.sent).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/automation/email',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            to: 'user@example.com',
            subject: 'Test Subject',
            body: 'Test Body',
            headers: {},
          }),
        })
      )
    })

    it('should throw error on failed email send', async () => {
      const node: AutomationNode = {
        id: '1',
        type: 'action',
        subtype: 'send-email',
        data: {
          config: {
            to: 'user@example.com',
            subject: 'Test',
            body: 'Test',
          },
        },
      }

      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockResolvedValueOnce({
        ok: false,
      })

      await expect(sendEmailAction(node, {})).rejects.toThrow('Failed to send email')
    })
  })

  describe('sendWebhookAction', () => {
    it('should send webhook with correct parameters', async () => {
      const node: AutomationNode = {
        id: '1',
        type: 'action',
        subtype: 'send-webhook',
        data: {
          config: {
            url: 'http://example.com/api',
            method: 'POST',
            body: '{"test": true}',
          },
        },
      }

      const context = {}

      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const result = await sendWebhookAction(node, context)

      expect(result.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
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

      const context = {}

      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      const result = await updateDatabaseRowAction(node, context)

      expect(result.updated).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/automation/db-update',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            table: 'users',
            id: 'user-123',
            data: { name: 'John' },
          }),
        })
      )
    })
  })

  describe('evaluateCondition', () => {
    it('should evaluate simple conditions', () => {
      const context = { status: 'active', count: 5 }

      expect(evaluateCondition('context.status === "active"', context)).toBe(true)
      expect(evaluateCondition('context.count > 10', context)).toBe(false)
      expect(evaluateCondition('context.count >= 5', context)).toBe(true)
    })

    it('should return false on invalid conditions', () => {
      const context = {}

      expect(evaluateCondition('invalid syntax {{{', context)).toBe(false)
    })

    it('should handle complex conditions', () => {
      const context = { isAdmin: true, isOwner: false }

      expect(evaluateCondition('context.isAdmin === true', context)).toBe(true)
      expect(evaluateCondition('context.isAdmin && !context.isOwner', context)).toBe(true)
    })
  })
})

describe('Helper Functions', () => {
  describe('substituteVariables', () => {
    it('should substitute simple variables', () => {
      const context = { userName: 'John', userEmail: 'john@example.com' }

      const result = substituteVariables('Hello {{userName}}!', context)

      expect(result).toBe('Hello "John"!')
    })

    it('should substitute nested variables', () => {
      const context = { user: { profile: { name: 'John' } } }

      const result = substituteVariables('Hello {{user.profile.name}}!', context)

      expect(result).toBe('Hello "John"!')
    })

    it('should handle missing variables', () => {
      const context = {}

      const result = substituteVariables('Hello {{user.name}}!', context)

      expect(result).toBe('Hello undefined!')
    })

    it('should substitute multiple variables', () => {
      const context = { firstName: 'John', lastName: 'Doe' }

      const result = substituteVariables('{{firstName}} {{lastName}}', context)

      expect(result).toBe('"John" "Doe"')
    })
  })

  describe('getNestedValue', () => {
    it('should get nested values', () => {
      const obj = {
        user: {
          profile: {
            name: 'John',
          },
        },
      }

      expect(getNestedValue(obj, 'user.profile.name')).toBe('John')
      expect(getNestedValue(obj, 'user.profile')).toEqual({ name: 'John' })
    })

    it('should return undefined for missing paths', () => {
      const obj = { user: { name: 'John' } }

      expect(getNestedValue(obj, 'user.email')).toBeUndefined()
      expect(getNestedValue(obj, 'company.name')).toBeUndefined()
    })

    it('should handle empty paths', () => {
      const obj = { name: 'John' }

      expect(getNestedValue(obj, '')).toBe(obj)
    })
  })
})
