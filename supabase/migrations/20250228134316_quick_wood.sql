/*
  # Create logs table for audit trail

  1. New Tables
    - `logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `action` (text) - Type of action performed
      - `entity_type` (text) - Type of entity affected
      - `entity_id` (uuid) - ID of the entity affected
      - `details` (jsonb) - Additional details about the action
      - `ip_address` (text) - IP address of the user
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `logs` table
    - Add policy for admins to read all logs
*/

CREATE TABLE IF NOT EXISTS logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert logs
CREATE POLICY "Users can insert logs"
  ON logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow admins to read all logs
CREATE POLICY "Admins can read all logs"
  ON logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Create function to log CFDI actions
CREATE OR REPLACE FUNCTION log_cfdi_action()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO logs (user_id, action, entity_type, entity_id, details)
    VALUES (NEW.user_id, 'create', 'cfdi', NEW.id, json_build_object('estado', NEW.estado));
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if estado changed
    IF OLD.estado <> NEW.estado THEN
      INSERT INTO logs (user_id, action, entity_type, entity_id, details)
      VALUES (NEW.user_id, 'update', 'cfdi', NEW.id, json_build_object(
        'old_estado', OLD.estado,
        'new_estado', NEW.estado
      ));
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO logs (user_id, action, entity_type, entity_id, details)
    VALUES (OLD.user_id, 'delete', 'cfdi', OLD.id, json_build_object('estado', OLD.estado));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for CFDI actions
CREATE TRIGGER cfdi_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON cfdis
FOR EACH ROW EXECUTE FUNCTION log_cfdi_action();