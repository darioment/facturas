import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { CatalogosState, CatalogoItem } from '../types';

export const useCatalogosStore = create<CatalogosState>((set) => ({
  regimenesFiscales: [],
  usosCFDI: [],
  metodosPago: [],
  formasPago: [],
  productosServicios: [],
  loading: false,
  error: null,

  fetchCatalogos: async () => {
    try {
      set({ loading: true, error: null });
      
      // Fetch all catalogs in parallel
      const [
        regimenesFiscalesRes,
        usosCFDIRes,
        metodosPagoRes,
        formasPagoRes,
        productosServiciosRes
      ] = await Promise.all([
        supabase.from('regimenes_fiscales').select('*'),
        supabase.from('usos_cfdi').select('*'),
        supabase.from('metodos_pago').select('*'),
        supabase.from('formas_pago').select('*'),
        supabase.from('productos_servicios').select('*')
      ]);

      // Check for errors
      if (regimenesFiscalesRes.error) throw regimenesFiscalesRes.error;
      if (usosCFDIRes.error) throw usosCFDIRes.error;
      if (metodosPagoRes.error) throw metodosPagoRes.error;
      if (formasPagoRes.error) throw formasPagoRes.error;
      if (productosServiciosRes.error) throw productosServiciosRes.error;

      set({ 
        regimenesFiscales: regimenesFiscalesRes.data as CatalogoItem[],
        usosCFDI: usosCFDIRes.data as CatalogoItem[],
        metodosPago: metodosPagoRes.data as CatalogoItem[],
        formasPago: formasPagoRes.data as CatalogoItem[],
        productosServicios: productosServiciosRes.data as CatalogoItem[],
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  }
}));

// Initialize with mock data for development
export const initializeCatalogos = () => {
  // This would be replaced with actual data from the database in production
  useCatalogosStore.setState({
    regimenesFiscales: [
      { id: '601', codigo: '601', descripcion: 'General de Ley Personas Morales' },
      { id: '603', codigo: '603', descripcion: 'Personas Morales con Fines no Lucrativos' },
      { id: '605', codigo: '605', descripcion: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
      { id: '606', codigo: '606', descripcion: 'Arrendamiento' },
      { id: '612', codigo: '612', descripcion: 'Personas Físicas con Actividades Empresariales y Profesionales' },
      { id: '626', codigo: '626', descripcion: 'Régimen Simplificado de Confianza' }
    ],
    usosCFDI: [
      { id: 'G01', codigo: 'G01', descripcion: 'Adquisición de mercancías' },
      { id: 'G02', codigo: 'G02', descripcion: 'Devoluciones, descuentos o bonificaciones' },
      { id: 'G03', codigo: 'G03', descripcion: 'Gastos en general' },
      { id: 'P01', codigo: 'P01', descripcion: 'Por definir' }
    ],
    metodosPago: [
      { id: 'PUE', codigo: 'PUE', descripcion: 'Pago en una sola exhibición' },
      { id: 'PPD', codigo: 'PPD', descripcion: 'Pago en parcialidades o diferido' }
    ],
    formasPago: [
      { id: '01', codigo: '01', descripcion: 'Efectivo' },
      { id: '02', codigo: '02', descripcion: 'Cheque nominativo' },
      { id: '03', codigo: '03', descripcion: 'Transferencia electrónica de fondos' },
      { id: '04', codigo: '04', descripcion: 'Tarjeta de crédito' },
      { id: '28', codigo: '28', descripcion: 'Tarjeta de débito' },
      { id: '99', codigo: '99', descripcion: 'Por definir' }
    ],
    productosServicios: [
      { id: '01010101', codigo: '01010101', descripcion: 'No existe en el catálogo' },
      { id: '43231500', codigo: '43231500', descripcion: 'Software funcional específico' },
      { id: '80101500', codigo: '80101500', descripcion: 'Servicios de consultoría de negocios' },
      { id: '81111500', codigo: '81111500', descripcion: 'Ingeniería de software o hardware' },
      { id: '84111500', codigo: '84111500', descripcion: 'Servicios contables' }
    ],
    loading: false,
    error: null
  });
};