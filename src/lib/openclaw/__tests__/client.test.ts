import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { OpenClawClient, createOpenClawClient } from '../client'
import type {
  OpenClawConfig,
  OpenClawSendMessageRequest,
  OpenClawSendMessageResponse,
  OpenClawWebhookPayload,
  OpenClawConversation,
  OpenClawContact,
  OpenClawMessage,
} from '../types'

global.fetch = vi.fn()

describe('OpenClaw Client', () => {
  let client: OpenClawClient
  const mockApiKey = 'test-api-key-123'
  
  beforeEach(() => {
    client = createOpenClawClient(mockApiKey, {
      timeout: 30000,
      retries: 3,
    })
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should create client with default base URL', () => {
      const defaultClient = createOpenClawClient(mockApiKey)
      expect(defaultClient).toBeInstanceOf(OpenClawClient)
    })

    it('should create client with custom base URL', () => {
      const customClient = createOpenClawClient(mockApiKey, {
        credentials: { baseUrl: 'https://custom-api.example.com' },
      })
      expect(customClient).toBeInstanceOf(OpenClawClient)
    })
  })

  describe('sendMessage', () => {
    it('should send WhatsApp message successfully', async () => {
      const mockResponse: OpenClawSendMessageResponse = {
        messageId: 'msg-123456',
        status: 'sent',
        timestamp: new Date().toISOString(),
      }

      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.sendWhatsAppMessage(
        '+1234567890',
        'Hello, World!'
      )

      expect(result.messageId).toBe('msg-123456')
      expect(result.status).toBe('sent')
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openclaw.delqhi.com/api/v1/messages/send',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`,
          }),
          body: JSON.stringify({
            platform: 'whatsapp',
            recipient: '+1234567890',
            type: 'text',
            content: { text: 'Hello, World!' },
            options: undefined,
          }),
        })
      )
    })

    it('should send template message successfully', async () => {
      const mockResponse: OpenClawSendMessageResponse = {
        messageId: 'template-123',
        status: 'delivered',
        timestamp: new Date().toISOString(),
      }

      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.sendTemplateMessage(
        'whatsapp',
        '+1234567890',
        'welcome_template',
        { name: 'John', company: 'ACME' }
      )

      expect(result.messageId).toBe('template-123')
      expect(result.status).toBe('delivered')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openclaw.delqhi.com/api/v1/messages/send',
        expect.objectContaining({
          body: JSON.stringify({
            platform: 'whatsapp',
            recipient: '+1234567890',
            type: 'template',
            content: {
              templateName: 'welcome_template',
              templateParameters: { name: 'John', company: 'ACME' },
            },
          }),
        })
      )
    })

    it('should throw error on API failure', async () => {
      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid recipient' }),
      })

      await expect(
        client.sendWhatsAppMessage('invalid', 'test')
      ).rejects.toThrow('Invalid recipient')
    })

    it('should throw error on network failure', async () => {
      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        client.sendWhatsAppMessage('+1234567890', 'test')
      ).rejects.toThrow('Network error')
    })
  })

  describe('getConversations', () => {
    it('should fetch conversations successfully', async () => {
      const mockConversations: OpenClawConversation[] = [
        {
          id: 'conv-1',
          platform: 'whatsapp',
          contact: {
            id: 'contact-1',
            phone: '+1234567890',
            name: 'John Doe',
          },
          lastMessage: {
            id: 'msg-1',
            content: 'Hello',
            timestamp: new Date().toISOString(),
            direction: 'inbound',
          },
          unreadCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConversations,
      })

      const result = await client.getConversations()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('conv-1')
      expect(result[0].contact.name).toBe('John Doe')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openclaw.delqhi.com/api/v1/conversations',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`,
          }),
        })
      )
    })
  })

  describe('getMessages', () => {
    it('should fetch messages for conversation', async () => {
      const mockMessages: OpenClawMessage[] = [
        {
          id: 'msg-1',
          content: 'Hello!',
          direction: 'inbound',
          timestamp: new Date().toISOString(),
          type: 'text',
        },
        {
          id: 'msg-2',
          content: 'Hi there!',
          direction: 'outbound',
          timestamp: new Date().toISOString(),
          type: 'text',
        },
      ]

      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMessages,
      })

      const result = await client.getMessages('conv-123', 50)

      expect(result).toHaveLength(2)
      expect(result[0].content).toBe('Hello!')
      expect(result[1].content).toBe('Hi there!')
    })

    it('should use default limit when not specified', async () => {
      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

      await client.getMessages('conv-123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=50'),
        expect.any(Object)
      )
    })
  })

  describe('getContacts', () => {
    it('should fetch contacts successfully', async () => {
      const mockContacts: OpenClawContact[] = [
        {
          id: 'contact-1',
          phone: '+1234567890',
          name: 'John Doe',
          avatar: 'https://example.com/avatar.jpg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockContacts,
      })

      const result = await client.getContacts()

      expect(result).toHaveLength(1)
      expect(result[0].phone).toBe('+1234567890')
    })
  })

  describe('markAsRead', () => {
    it('should mark conversation as read', async () => {
      const mockFetch = global.fetch as unknown as vi.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      await client.markAsRead('conv-123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openclaw.delqhi.com/api/v1/conversations/conv-123/read',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`,
          }),
        })
      )
    })
  })

  describe('parseWebhookPayload', () => {
    it('should parse message_received event', () => {
      const payload: OpenClawWebhookPayload = {
        event: 'message_received',
        data: {
          conversationId: 'conv-123',
          message: {
            id: 'msg-456',
            content: 'Test message',
            direction: 'inbound',
            timestamp: new Date().toISOString(),
            type: 'text',
          },
        },
      }

      const result = client.parseWebhookPayload(payload)

      expect(result).not.toBeNull()
      expect(result?.type).toBe('text')
      expect(result?.conversationId).toBe('conv-123')
      expect(result?.message.id).toBe('msg-456')
    })

    it('should return null for unknown events', () => {
      const payload: OpenClawWebhookPayload = {
        event: 'unknown_event',
        data: {},
      }

      const result = client.parseWebhookPayload(payload)

      expect(result).toBeNull()
    })
  })

  describe('verifyWebhookSignature', () => {
    it('should return false when webhook secret is not configured', () => {
      const noSecretClient = createOpenClawClient(mockApiKey, {
        credentials: { webhookSecret: undefined },
      })

      const result = noSecretClient.verifyWebhookSignature(
        '{"test": true}',
        'some-signature'
      )

      expect(result).toBe(false)
    })
  })
})

describe('OpenClaw Client Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Message Sending Flow', () => {
    it('should handle complete WhatsApp messaging flow', async () => {
      const client = createOpenClawClient('test-api-key')
      
      const mockConversations: OpenClawConversation[] = [
        {
          id: 'conv-1',
          platform: 'whatsapp',
          contact: {
            id: 'contact-1',
            phone: '+1234567890',
            name: 'John Doe',
          },
          lastMessage: {
            id: 'msg-1',
            content: 'Hello',
            timestamp: new Date().toISOString(),
            direction: 'inbound',
          },
          unreadCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      const mockMessages: OpenClawMessage[] = [
        {
          id: 'msg-1',
          content: 'Hello',
          direction: 'inbound',
          timestamp: new Date().toISOString(),
          type: 'text',
        },
      ]

      const mockFetch = global.fetch as unknown as vi.Mock
      
      // Mock getConversations
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConversations,
      })
      
      // Mock getMessages
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMessages,
      })
      
      // Mock sendMessage
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          messageId: 'new-msg-1',
          status: 'sent',
          timestamp: new Date().toISOString(),
        }),
      })

      // Execute flow
      const conversations = await client.getConversations()
      const messages = await client.getMessages(conversations[0].id)
      
      await client.sendWhatsAppMessage(
        conversations[0].contact.phone,
        'Thank you for your message!'
      )

      expect(conversations).toHaveLength(1)
      expect(messages).toHaveLength(1)
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })
  })
})
