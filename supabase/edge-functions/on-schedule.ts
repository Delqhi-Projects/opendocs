import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface ScheduleEvent {
  automation_id: string
  trigger_id: string
  scheduled_time: string
  timezone: string
  pattern: string
}

interface AutomationSchedule {
  id: string
  automation_id: string
  cron_expression: string
  timezone: string
  is_active: boolean
  last_run?: string
  next_run?: string
}

serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    const event: ScheduleEvent = await req.json()
    
    const { data: schedule, error } = await supabase
      .from('automation_schedules')
      .select('*, automations(id, name, nodes, edges)')
      .eq('id', event.trigger_id)
      .eq('automation_id', event.automation_id)
      .eq('is_active', true)
      .single()
    
    if (error) {
      throw error
    }
    
    const scheduleData = schedule as AutomationSchedule & { automations: { id: string; name: string; nodes: unknown; edges: unknown } }
    
    await executeAutomation(
      supabase,
      scheduleData.automation_id,
      {
        trigger_type: 'schedule',
        schedule_id: scheduleData.id,
        cron_expression: scheduleData.cron_expression,
        scheduled_time: event.scheduled_time,
        timezone: event.timezone,
        timestamp: new Date().toISOString()
      }
    )
    
    await supabase
      .from('automation_schedules')
      .update({
        last_run: new Date().toISOString(),
        next_run: calculateNextRun(scheduleData.cron_expression, scheduleData.timezone)
      })
      .eq('id', scheduleData.id)
    
    return new Response(JSON.stringify({ 
      success: true, 
      automation_id: scheduleData.automation_id,
      automation_name: scheduleData.automations.name
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

function calculateNextRun(cronExpression: string, timezone: string): string {
  const next = new Date()
  next.setMinutes(next.getMinutes() + 1)
  
  return next.toISOString()
}

async function executeAutomation(
  supabase: ReturnType<typeof createClient>,
  automationId: string,
  context: Record<string, unknown>
): Promise<void> {
  await supabase.rpc('execute_automation', {
    automation_id: automationId,
    context: JSON.stringify(context)
  })
}
