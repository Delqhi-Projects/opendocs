import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface RowChangeEvent {
  table: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  record: Record<string, unknown>
  old_record?: Record<string, unknown>
  schema: string
}

interface AutomationTrigger {
  id: string
  automation_id: string
  type: 'db-row-changed'
  config: {
    table_name: string
    operation: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
    condition?: string
  }
}

serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    const event: RowChangeEvent = await req.json()
    
    const { data: triggers, error } = await supabase
      .from('automation_triggers')
      .select('*, automations(id, name, nodes, edges)')
      .eq('type', 'db-row-changed')
      .eq('config->>table_name', event.table)
      .or(`config->>operation.eq.${event.operation},config->>operation.eq.*`)
    
    if (error) {
      throw error
    }
    
    const results: Array<{ trigger_id: string; automation_id: string; executed: boolean; error?: string }> = []
    
    for (const trigger of triggers as Array<AutomationTrigger & { automations: { id: string; name: string; nodes: unknown; edges: unknown } }>) {
      try {
        let shouldTrigger = true
        
        if (trigger.config.condition) {
          const conditionMet = evaluateCondition(
            trigger.config.condition,
            event.record,
            event.old_record
          )
          shouldTrigger = conditionMet
        }
        
        if (shouldTrigger) {
          await executeAutomation(
            supabase,
            trigger.automation_id,
            {
              trigger_type: 'db-row-changed',
              event,
              timestamp: new Date().toISOString()
            }
          )
          
          results.push({
            trigger_id: trigger.id,
            automation_id: trigger.automation_id,
            executed: true
          })
        }
      } catch (err) {
        results.push({
          trigger_id: trigger.id,
          automation_id: trigger.automation_id,
          executed: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }
    
    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

function evaluateCondition(
  condition: string,
  record: Record<string, unknown>,
  oldRecord?: Record<string, unknown>
): boolean {
  try {
    const fn = new Function('record', 'oldRecord', `return ${condition}`)
    return fn(record, oldRecord)
  } catch {
    return false
  }
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
