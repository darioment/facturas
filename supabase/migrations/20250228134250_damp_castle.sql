/*
  # Create CFDI tables

  1. New Tables
    - `cfdis`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `emisor` (jsonb) - Contains RFC, name, tax regime, postal code
      - `receptor` (jsonb) - Contains RFC, name, CFDI usage
      - `conceptos` (jsonb) - Array of items with description, code, quantity, price, taxes
      - `informacion_pago` (jsonb) - Payment method, form, currency
      - `timbre_fiscal_digital` (jsonb) - Digital stamp data
      - `total` (numeric)
      - `subtotal` (numeric)
      - `total_impuestos` (numeric)
      - `estado` (text) - Status (draft, stamped, canceled)
      - `fecha_emision` (timestamp)
      - `serie` (text)
      - `folio` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `cfdis` table
    - Add policy for authenticated users to read their own CFDIs
    - Add policy for admins to read all CFDIs
*/

CREATE TABLE IF NOT EXISTS cfdis (
  id uuid PRIMARY KEY,
  userId uuid REFERENCES users(id) ON DELETE CASCADE,
  emisor jsonb NOT NULL,
  receptor jsonb NOT NULL,
  conceptos jsonb NOT NULL,
  informacion_pago jsonb NOT NULL,
  timbre_fiscal_digital jsonb NOT NULL DEFAULT '{}',
  total numeric(12,2) NOT NULL,
  subtotal numeric(12,2) NOT NULL,
  total_impuestos numeric(12,2) NOT NULL,
  estado text NOT NULL CHECK (estado IN ('borrador', 'timbrado', 'cancelado')),
  fecha_emision timestamptz NOT NULL,
  serie text,
  folio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cfdis ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own CFDIs
CREATE POLICY "Users can read own CFDIs"
  ON cfdis
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to insert their own CFDIs
CREATE POLICY "Users can insert own CFDIs"
  ON cfdis
  FOR INSERT
  TO authenticated
  WITH CHECK (userId = auth.uid());

-- Allow users to update their own CFDIs
CREATE POLICY "Users can update own CFDIs"
  ON cfdis
  FOR UPDATE
  TO authenticated
  USING (userId = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own CFDIs
CREATE POLICY "Users can delete own CFDIs"
  ON cfdis
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Allow admins to read all CFDIs
CREATE POLICY "Admins can read all CFDIs"
  ON cfdis
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Allow admins to update all CFDIs
CREATE POLICY "Admins can update all CFDIs"
  ON cfdis
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Allow admins to delete all CFDIs
CREATE POLICY "Admins can delete all CFDIs"
  ON cfdis
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));