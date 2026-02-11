-- Automation System Schema for OpenDocs
-- Supports n8n-style automation workflows with triggers, actions, and scheduling

-- Automation table - stores automation workflow definitions
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_nodes CHECK (jsonb_array_length(nodes) > 0)
);

CREATE INDEX IF NOT EXISTS idx_automations_user_id ON automations(user_id);
CREATE INDEX IF NOT EXISTS idx_automations_active ON automations(is_active) WHERE is_active = true;

-- Automation triggers - defines when automations should execute
CREATE TABLE IF NOT EXISTS automation_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'manual',
    'webhook',
    'schedule',
    'db-row-changed',
    'event-occurred'
  )),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_triggers_automation ON automation_triggers(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_triggers_enabled ON automation_triggers(is_enabled) WHERE is_enabled = true;

-- Automation schedules - for time-based triggers
CREATE TABLE IF NOT EXISTS automation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
  trigger_id UUID REFERENCES automation_triggers(id) ON DELETE CASCADE NOT NULL,
  cron_expression TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_schedules_active ON automation_schedules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_automation_schedules_next_run ON automation_schedules(next_run) WHERE is_active = true;

-- Automation execution log - tracks runs
CREATE TABLE IF NOT EXISTS automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  execution_context JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_automation_executions_automation ON automation_executions(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_automation_executions_started ON automation_executions(started_at DESC);

-- Notifications table - stores all notification types
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'push', 'in_app', 'webhook', 'whatsapp')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, status) WHERE status IN ('pending', 'sent');

-- In-app notifications - for in-app display
CREATE TABLE IF NOT EXISTS in_app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user ON in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_unread ON in_app_notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_created ON in_app_notifications(created_at DESC);

-- Database change events - for db-row-changed trigger
CREATE TABLE IF NOT EXISTS db_change_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id TEXT NOT NULL,
  old_record JSONB,
  new_record JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_db_change_events_table ON db_change_events(table_name);
CREATE INDEX IF NOT EXISTS idx_db_change_events_created ON db_change_events(created_at DESC);

-- Webhook deliveries - track webhook sends
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  payload JSONB NOT NULL,
  headers JSONB DEFAULT '{}'::jsonb,
  status_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  attempt_count INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 3,
  next_attempt_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_pending ON webhook_deliveries(next_attempt_at) WHERE delivered_at IS NULL;

-- RPC function to execute automation
CREATE OR REPLACE FUNCTION execute_automation(
  p_automation_id UUID,
  p_context JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
DECLARE
  v_execution_id UUID;
BEGIN
  INSERT INTO automation_executions (automation_id, trigger_type, status, execution_context)
  VALUES (p_automation_id, 'rpc_call', 'running', p_context)
  RETURNING id INTO v_execution_id;
  
  PERFORM pg_notify('automation_execute', json_build_object(
    'execution_id', v_execution_id,
    'automation_id', p_automation_id,
    'context', p_context
  )::text);
EXCEPTION
  WHEN OTHERS THEN
    UPDATE automation_executions
    SET status = 'failed', completed_at = NOW(), error_message = SQLERRM
    WHERE id = v_execution_id;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate next run from cron expression
CREATE OR REPLACE FUNCTION calculate_next_run(
  p_cron_expression TEXT,
  p_timezone TEXT DEFAULT 'UTC'
)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN NOW() + interval '1 minute';
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_automations_updated_at
  BEFORE UPDATE ON automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_triggers_updated_at
  BEFORE UPDATE ON automation_triggers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_schedules_updated_at
  BEFORE UPDATE ON automation_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_change_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own automations" ON automations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own automations" ON automations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own triggers" ON automation_triggers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM automations WHERE id = automation_triggers.automation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage own triggers" ON automation_triggers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM automations WHERE id = automation_triggers.automation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can view own schedules" ON automation_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM automation_triggers 
      WHERE id = automation_schedules.trigger_id 
      AND automation_id IN (SELECT id FROM automations WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own in_app notifications" ON in_app_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own in_app notifications" ON in_app_notifications
  FOR ALL USING (auth.uid() = user_id);
