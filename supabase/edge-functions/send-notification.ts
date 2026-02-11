import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface NotificationRequest {
  user_id: string
  type: 'email' | 'push' | 'in_app' | 'webhook' | 'whatsapp'
  title: string
  body: string
  data?: Record<string, unknown>
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  scheduled_at?: string
}

interface NotificationPayload {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  data: Record<string, unknown>
  priority: string
  status: 'pending' | 'sent' | 'failed'
  created_at: string
  sent_at?: string
}

serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    const notification: NotificationRequest = await req.json()
    
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email, phone, webhook_url, notification_preferences')
      .eq('id', notification.user_id)
      .single()
    
    if (userError) {
      throw userError
    }
    
    const payload: NotificationPayload = {
      id: crypto.randomUUID(),
      user_id: notification.user_id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data ?? {},
      priority: notification.priority ?? 'normal',
      status: 'pending',
      created_at: new Date().toISOString()
    }
    
    const { data: stored, error: storeError } = await supabase
      .from('notifications')
      .insert(payload)
      .select()
      .single()
    
    if (storeError) {
      throw storeError
    }
    
    let sendResult: { success: boolean; error?: string } = { success: true }
    
    if (!notification.scheduled_at || new Date(notification.scheduled_at) <= new Date()) {
      sendResult = await sendNotification(supabase, payload, user, notification.type)
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      notification_id: payload.id,
      sent: sendResult.success,
      error: sendResult.error
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function sendNotification(
  supabase: ReturnType<typeof createClient>,
  payload: NotificationPayload,
  user: Record<string, unknown>,
  type: string
): Promise<{ success: boolean; error?: string }> {
  try {
    switch (type) {
      case 'email':
        await sendEmailNotification(supabase, payload, user)
        break
      case 'push':
        await sendPushNotification(supabase, payload, user)
        break
      case 'webhook':
        await sendWebhookNotification(payload, user)
        break
      case 'whatsapp':
        await sendWhatsAppNotification(supabase, payload, user)
        break
      case 'in_app':
        await storeInAppNotification(supabase, payload)
        break
    }
    
    await supabase
      .from('notifications')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', payload.id)
    
    return { success: true }
  } catch (err) {
    await supabase
      .from('notifications')
      .update({ status: 'failed' })
      .eq('id', payload.id)
    
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }
  }
}

async function sendEmailNotification(
  supabase: ReturnType<typeof createClient>,
  payload: NotificationPayload,
  user: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.functions.invoke('send-email', {
    body: {
      to: user.email,
      subject: payload.title,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">${payload.title}</h1>
          <p style="color: #4a4a4a; line-height: 1.6;">${payload.body}</p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
          <p style="color: #9a9a9a; font-size: 14px;">
            Sent by OpenDocs Automation
          </p>
        </div>
      `
    }
  })
  
  if (error) throw error
}

async function sendPushNotification(
  supabase: ReturnType<typeof createClient>,
  payload: NotificationPayload,
  user: Record<string, unknown>
): Promise<void> {
  await supabase.functions.invoke('send-push', {
    body: {
      title: payload.title,
      body: payload.body,
      data: payload.data
    }
  })
}

async function sendWebhookNotification(
  payload: NotificationPayload,
  user: Record<string, unknown>
): Promise<void> {
  const webhookUrl = (user.webhook_url as string) ?? ''
  
  if (!webhookUrl) {
    throw new Error('No webhook URL configured')
  }
  
  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-OpenDocs-Notification': 'true'
    },
    body: JSON.stringify({
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      timestamp: payload.created_at
    })
  })
}

async function sendWhatsAppNotification(
  supabase: ReturnType<typeof createClient>,
  payload: NotificationPayload,
  user: Record<string, unknown>
): Promise<void> {
  await supabase.functions.invoke('send-whatsapp', {
    body: {
      to: user.phone,
      message: `${payload.title}\n\n${payload.body}`
    }
  })
}

async function storeInAppNotification(
  supabase: ReturnType<typeof createClient>,
  payload: NotificationPayload
): Promise<void> {
  await supabase
    .from('in_app_notifications')
    .insert({
      user_id: payload.user_id,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      read: false,
      created_at: payload.created_at
    })
}
