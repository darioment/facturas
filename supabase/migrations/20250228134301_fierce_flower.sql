/*
  # Create catalog tables for CFDI

  1. New Tables
    - `regimenes_fiscales` - Tax regimes
    - `usos_cfdi` - CFDI usage types
    - `metodos_pago` - Payment methods
    - `formas_pago` - Payment forms
    - `productos_servicios` - Products and services catalog
  
  2. Security
    - Enable RLS on all tables
    - Add policy for public read access to all catalog tables
*/

-- Tax regimes
CREATE TABLE IF NOT EXISTS regimenes_fiscales (
  id text PRIMARY KEY,
  codigo text NOT NULL,
  descripcion text NOT NULL
);

-- CFDI usage types
CREATE TABLE IF NOT EXISTS usos_cfdi (
  id text PRIMARY KEY,
  codigo text NOT NULL,
  descripcion text NOT NULL
);

-- Payment methods
CREATE TABLE IF NOT EXISTS metodos_pago (
  id text PRIMARY KEY,
  codigo text NOT NULL,
  descripcion text NOT NULL
);

-- Payment forms
CREATE TABLE IF NOT EXISTS formas_pago (
  id text PRIMARY KEY,
  codigo text NOT NULL,
  descripcion text NOT NULL
);

-- Products and services catalog
CREATE TABLE IF NOT EXISTS productos_servicios (
  id text PRIMARY KEY,
  codigo text NOT NULL,
  descripcion text NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE regimenes_fiscales ENABLE ROW LEVEL SECURITY;
ALTER TABLE usos_cfdi ENABLE ROW LEVEL SECURITY;
ALTER TABLE metodos_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE formas_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_servicios ENABLE ROW LEVEL SECURITY;

-- Add public read access policies
CREATE POLICY "Public read access for regimenes_fiscales"
  ON regimenes_fiscales
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access for usos_cfdi"
  ON usos_cfdi
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access for metodos_pago"
  ON metodos_pago
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access for formas_pago"
  ON formas_pago
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access for productos_servicios"
  ON productos_servicios
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial data for tax regimes
INSERT INTO regimenes_fiscales (id, codigo, descripcion)
VALUES
  ('601', '601', 'General de Ley Personas Morales'),
  ('603', '603', 'Personas Morales con Fines no Lucrativos'),
  ('605', '605', 'Sueldos y Salarios e Ingresos Asimilados a Salarios'),
  ('606', '606', 'Arrendamiento'),
  ('612', '612', 'Personas Físicas con Actividades Empresariales y Profesionales'),
  ('626', '626', 'Régimen Simplificado de Confianza')
ON CONFLICT (id) DO NOTHING;

-- Insert initial data for CFDI usage types
INSERT INTO usos_cfdi (id, codigo, descripcion)
VALUES
  ('G01', 'G01', 'Adquisición de mercancías'),
  ('G02', 'G02', 'Devoluciones, descuentos o bonificaciones'),
  ('G03', 'G03', 'Gastos en general'),
  ('P01', 'P01', 'Por definir')
ON CONFLICT (id) DO NOTHING;

-- Insert initial data for payment methods
INSERT INTO metodos_pago (id, codigo, descripcion)
VALUES
  ('PUE', 'PUE', 'Pago en una sola exhibición'),
  ('PPD', 'PPD', 'Pago en parcialidades o diferido')
ON CONFLICT (id) DO NOTHING;

-- Insert initial data for payment forms
INSERT INTO formas_pago (id, codigo, descripcion)
VALUES
  ('01', '01', 'Efectivo'),
  ('02', '02', 'Cheque nominativo'),
  ('03', '03', 'Transferencia electrónica de fondos'),
  ('04', '04', 'Tarjeta de crédito'),
  ('28', '28', 'Tarjeta de débito'),
  ('99', '99', 'Por definir')
ON CONFLICT (id) DO NOTHING;

-- Insert initial data for products and services
INSERT INTO productos_servicios (id, codigo, descripcion)
VALUES
  ('01010101', '01010101', 'No existe en el catálogo'),
  ('43231500', '43231500', 'Software funcional específico'),
  ('80101500', '80101500', 'Servicios de consultoría de negocios'),
  ('81111500', '81111500', 'Ingeniería de software o hardware'),
  ('84111500', '84111500', 'Servicios contables')
ON CONFLICT (id) DO NOTHING;