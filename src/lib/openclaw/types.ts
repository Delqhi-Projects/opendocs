export type OpenClawPlatform = 'whatsapp' | 'messenger' | 'instagram' | 'facebook'

export interface OpenClawMessage {
  id: string
  platform: OpenClawPlatform
  from: string
  to: string
  type: 'text' | 'image' | 'document' | 'video' | 'audio' | 'location' | 'template'
  content: OpenClawContent
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface OpenClawContent {
  text?: string
  mediaUrl?: string
  mimeType?: string
  caption?: string
  templateName?: string
  templateParameters?: Record<string, string>
  location?: {
    latitude: number
    longitude: number
    name?: string
    address?: string
  }
}

export interface OpenClawSendMessageRequest {
  platform: OpenClawPlatform
  recipient: string
  type: OpenClawMessage['type']
  content: OpenClawContent
  options?: {
    previewUrl?: boolean
    tracking?: Record<string, string>
  }
}

export interface OpenClawSendMessageResponse {
  success: boolean
  messageId?: string
  error?: string
}

export interface OpenClawWebhookPayload {
  event: 'message_received' | 'message_sent' | 'delivery_status' | 'read'
  platform: OpenClawPlatform
  messageId: string
  timestamp: string
  data: Record<string, unknown>
}

export interface OpenClawContact {
  id: string
  platform: OpenClawPlatform
  phone?: string
  name?: string
  profilePic?: string
  lastMessage?: string
  lastSeen?: string
}

export interface OpenClawConversation {
  id: string
  platform: OpenClawPlatform
  contact: OpenClawContact
  messages: OpenClawMessage[]
  unreadCount: number
  lastMessageAt: string
}

export interface OpenClawCredentials {
  apiKey: string
  webhookSecret?: string
  baseUrl?: string
}

export interface OpenClawConfig {
  credentials: OpenClawCredentials
  defaultPlatform?: OpenClawPlatform
  timeout?: number
  retries?: number
}
