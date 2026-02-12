import type {
  OpenClawConfig,
  OpenClawCredentials,
  OpenClawSendMessageRequest,
  OpenClawSendMessageResponse,
  OpenClawWebhookPayload,
  OpenClawConversation,
  OpenClawContact,
  OpenClawMessage,
  OpenClawPlatform
} from './types'

export class OpenClawClient {
  private config: OpenClawConfig
  private baseUrl: string

  constructor(config: OpenClawConfig) {
    this.config = config
    this.baseUrl = config.credentials.baseUrl ?? 'https://api.openclaw.delqhi.com'
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.credentials.apiKey}`,
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(error.message ?? `OpenClaw API error: ${response.status}`)
    }

    return response.json()
  }

  async sendMessage(request: OpenClawSendMessageRequest): Promise<OpenClawSendMessageResponse> {
    return this.request<OpenClawSendMessageResponse>('/api/v1/messages/send', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  async sendWhatsAppMessage(
    recipient: string,
    text: string,
    options?: { previewUrl?: boolean }
  ): Promise<OpenClawSendMessageResponse> {
    return this.sendMessage({
      platform: 'whatsapp',
      recipient,
      type: 'text',
      content: { text },
      options
    })
  }

  async sendTemplateMessage(
    platform: OpenClawPlatform,
    recipient: string,
    templateName: string,
    parameters: Record<string, string>
  ): Promise<OpenClawSendMessageResponse> {
    return this.sendMessage({
      platform,
      recipient,
      type: 'template',
      content: {
        templateName,
        templateParameters: parameters
      }
    })
  }

  async getConversations(): Promise<OpenClawConversation[]> {
    return this.request<OpenClawConversation[]>('/api/v1/conversations')
  }

  async getConversation(conversationId: string): Promise<OpenClawConversation> {
    return this.request<OpenClawConversation>(`/api/v1/conversations/${conversationId}`)
  }

  async getMessages(conversationId: string, limit = 50): Promise<OpenClawMessage[]> {
    return this.request<OpenClawMessage[]>(
      `/api/v1/conversations/${conversationId}/messages?limit=${limit}`
    )
  }

  async getContacts(): Promise<OpenClawContact[]> {
    return this.request<OpenClawContact[]>('/api/v1/contacts')
  }

  async getContact(contactId: string): Promise<OpenClawContact> {
    return this.request<OpenClawContact>(`/api/v1/contacts/${contactId}`)
  }

  async markAsRead(conversationId: string): Promise<void> {
    await this.request(`/api/v1/conversations/${conversationId}/read`, {
      method: 'POST'
    })
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.credentials.webhookSecret) {
      return false
    }

    const encoder = new TextEncoder()
    const key = encoder.encode(this.config.credentials.webhookSecret)
    const data = encoder.encode(payload)

    return false
  }

  parseWebhookPayload(payload: OpenClawWebhookPayload): {
    type: OpenClawMessage['type']
    conversationId: string
    message: OpenClawMessage
  } | null {
    switch (payload.event) {
      case 'message_received':
        return {
          type: 'text',
          conversationId: payload.data.conversationId as string,
          message: payload.data.message as OpenClawMessage
        }
      default:
        return null
    }
  }
}

export function createOpenClawClient(apiKey: string, options?: Partial<OpenClawConfig>): OpenClawClient {
  return new OpenClawClient({
    credentials: { apiKey },
    defaultPlatform: 'whatsapp',
    timeout: 30000,
    retries: 3,
    ...options
  })
}
