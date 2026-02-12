import { useCallback, useState } from 'react'
import { createOpenClawClient } from './client'
import type {
  OpenClawConversation,
  OpenClawMessage,
  OpenClawContact,
  OpenClawSendMessageResponse
} from './types'

interface UseOpenClawOptions {
  apiKey: string
  baseUrl?: string
}

interface State {
  conversations: OpenClawConversation[]
  contacts: OpenClawContact[]
  selectedConversation: OpenClawConversation | null
  messages: OpenClawMessage[]
  isLoading: boolean
  error: string | null
}

export function useOpenClaw(options: UseOpenClawOptions) {
  const [state, setState] = useState<State>({
    conversations: [],
    contacts: [],
    selectedConversation: null,
    messages: [],
    isLoading: false,
    error: null
  })

  const client = createOpenClawClient(options.apiKey)

  const fetchConversations = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const conversations = await client.getConversations()
      setState(prev => ({ ...prev, conversations, isLoading: false }))
      return conversations
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed',
        isLoading: false 
      }))
      return []
    }
  }, [client])

  const fetchContacts = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const contacts = await client.getContacts()
      setState(prev => ({ ...prev, contacts, isLoading: false }))
      return contacts
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed',
        isLoading: false 
      }))
      return []
    }
  }, [client])

  const sendMessage = useCallback(async (
    recipient: string,
    text: string
  ): Promise<OpenClawSendMessageResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const result = await client.sendWhatsAppMessage(recipient, text)
      setState(prev => ({ ...prev, isLoading: false }))
      return result
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed',
        isLoading: false 
      }))
      throw error
    }
  }, [client])

  return {
    ...state,
    client,
    fetchConversations,
    fetchContacts,
    sendMessage,
    clearError: () => setState(prev => ({ ...prev, error: null }))
  }
}
