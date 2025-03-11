export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Emisor {
  rfc: string;
  nombre: string;
  regimenFiscal: string;
  codigoPostal: string;
}

export interface Receptor {
  rfc: string;
  nombre: string;
  usoCFDI: string;
  domicilioFiscal?: string;
  regimenFiscalReceptor?: string;
}

export interface Impuesto {
  tipo: 'IVA' | 'ISR' | 'IEPS';
  tasa: number;
  importe: number;
}

export interface Concepto {
  id: string;
  descripcion: string;
  claveProductoServicio: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  impuestos: Impuesto[];
}

export interface InformacionPago {
  metodoPago: string;
  formaPago: string;
  moneda: string;
  tipoCambio?: number;
}

export interface TimbreFiscalDigital {
  uuid?: string;
  fechaTimbrado?: string;
  selloCFD?: string;
  noCertificadoSAT?: string;
  selloSAT?: string;
}

export interface CFDI {
  id: string;
  userId: string;
  emisor: Emisor;
  receptor: Receptor;
  conceptos: Concepto[];
  informacionPago: InformacionPago;
  timbreFiscalDigital: TimbreFiscalDigital;
  total: number;
  subtotal: number;
  totalImpuestos: number;
  estado: 'borrador' | 'timbrado' | 'cancelado';
  fechaEmision: string;
  serie?: string;
  folio?: string;
  created_at: string;
  updated_at: string;
}

export interface CatalogoItem {
  id: string;
  descripcion: string;
  codigo: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export interface CFDIState {
  cfdis: CFDI[];
  currentCFDI: CFDI | null;
  loading: boolean;
  error: string | null;
  fetchCFDIs: () => Promise<void>;
  getCFDI: (id: string) => Promise<void>;
  createCFDI: (cfdi: Omit<CFDI, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCFDI: (id: string, cfdi: Partial<CFDI>) => Promise<void>;
  deleteCFDI: (id: string) => Promise<void>;
  cancelCFDI: (id: string) => Promise<void>;
  clearCurrentCFDI: () => void;
}

export interface CatalogosState {
  regimenesFiscales: CatalogoItem[];
  usosCFDI: CatalogoItem[];
  metodosPago: CatalogoItem[];
  formasPago: CatalogoItem[];
  productosServicios: CatalogoItem[];
  loading: boolean;
  error: string | null;
  fetchCatalogos: () => Promise<void>;
}