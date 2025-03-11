import { jsPDF } from 'jspdf';
import { CFDI, Concepto } from '../types';

// Generate XML for CFDI
export const generateCFDIXML = (cfdi: CFDI): string => {
  // This is a simplified version - in a real app, this would generate valid XML according to SAT specifications
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante 
  xmlns:cfdi="http://www.sat.gob.mx/cfd/4" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  Version="4.0" 
  Serie="${cfdi.serie || 'A'}" 
  Folio="${cfdi.folio || '1'}" 
  Fecha="${cfdi.fechaEmision}" 
  FormaPago="${cfdi.informacionPago.formaPago}" 
  MetodoPago="${cfdi.informacionPago.metodoPago}" 
  Moneda="${cfdi.informacionPago.moneda}" 
  ${cfdi.informacionPago.tipoCambio ? `TipoCambio="${cfdi.informacionPago.tipoCambio}"` : ''} 
  SubTotal="${cfdi.subtotal.toFixed(2)}" 
  Total="${cfdi.total.toFixed(2)}">
  <cfdi:Emisor 
    Rfc="${cfdi.emisor.rfc}" 
    Nombre="${cfdi.emisor.nombre}" 
    RegimenFiscal="${cfdi.emisor.regimenFiscal}" />
  <cfdi:Receptor 
    Rfc="${cfdi.receptor.rfc}" 
    Nombre="${cfdi.receptor.nombre}" 
    UsoCFDI="${cfdi.receptor.usoCFDI}" 
    ${cfdi.receptor.domicilioFiscal ? `DomicilioFiscalReceptor="${cfdi.receptor.domicilioFiscal}"` : ''} 
    ${cfdi.receptor.regimenFiscalReceptor ? `RegimenFiscalReceptor="${cfdi.receptor.regimenFiscalReceptor}"` : ''} />
  <cfdi:Conceptos>
    ${cfdi.conceptos.map(concepto => `
    <cfdi:Concepto 
      ClaveProdServ="${concepto.claveProductoServicio}" 
      Cantidad="${concepto.cantidad}" 
      Descripcion="${concepto.descripcion}" 
      ValorUnitario="${concepto.precioUnitario.toFixed(2)}" 
      Importe="${concepto.importe.toFixed(2)}">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          ${concepto.impuestos.map(impuesto => `
          <cfdi:Traslado 
            Base="${concepto.importe.toFixed(2)}" 
            Impuesto="${impuesto.tipo === 'IVA' ? '002' : impuesto.tipo === 'ISR' ? '001' : '003'}" 
            TipoFactor="Tasa" 
            TasaOCuota="${(impuesto.tasa / 100).toFixed(6)}" 
            Importe="${impuesto.importe.toFixed(2)}" />
          `).join('')}
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
    `).join('')}
  </cfdi:Conceptos>
  ${cfdi.timbreFiscalDigital.uuid ? `
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital 
      xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" 
      xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" 
      Version="1.1" 
      UUID="${cfdi.timbreFiscalDigital.uuid}" 
      FechaTimbrado="${cfdi.timbreFiscalDigital.fechaTimbrado}" 
      SelloCFD="${cfdi.timbreFiscalDigital.selloCFD}" 
      NoCertificadoSAT="${cfdi.timbreFiscalDigital.noCertificadoSAT}" 
      SelloSAT="${cfdi.timbreFiscalDigital.selloSAT}" />
  </cfdi:Complemento>
  ` : ''}
</cfdi:Comprobante>`;

  return xml;
};

// Generate PDF for CFDI
export const generateCFDIPDF = (cfdi: CFDI): jsPDF => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(18);
  doc.text('Comprobante Fiscal Digital', 105, 20, { align: 'center' });
  
  // Add CFDI status
  doc.setFontSize(12);
  
  if (cfdi.estado === 'timbrado') {
    doc.setTextColor(0, 128, 0);
  } else if (cfdi.estado === 'cancelado') {
    doc.setTextColor(255, 0, 0);
  } else {
    doc.setTextColor(0, 0, 0);
  }
  doc.text(`Estado: ${cfdi.estado.toUpperCase()}`, 105, 30, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  // Add emisor info
  doc.setFontSize(10);
  doc.text('EMISOR', 20, 45);
  doc.text(`RFC: ${cfdi.emisor.rfc}`, 20, 50);
  doc.text(`Nombre: ${cfdi.emisor.nombre}`, 20, 55);
  doc.text(`Régimen Fiscal: ${cfdi.emisor.regimenFiscal}`, 20, 60);
  
  // Add receptor info
  doc.text('RECEPTOR', 120, 45);
  doc.text(`RFC: ${cfdi.receptor.rfc}`, 120, 50);
  doc.text(`Nombre: ${cfdi.receptor.nombre}`, 120, 55);
  doc.text(`Uso CFDI: ${cfdi.receptor.usoCFDI}`, 120, 60);
  
  // Add invoice details
  doc.text(`Serie: ${cfdi.serie || 'A'}`, 20, 75);
  doc.text(`Folio: ${cfdi.folio || '1'}`, 60, 75);
  doc.text(`Fecha: ${new Date(cfdi.fechaEmision).toLocaleString()}`, 100, 75);
  
  // Add payment info
  doc.text(`Método de Pago: ${cfdi.informacionPago.metodoPago}`, 20, 85);
  doc.text(`Forma de Pago: ${cfdi.informacionPago.formaPago}`, 80, 85);
  doc.text(`Moneda: ${cfdi.informacionPago.moneda}`, 140, 85);
  
  // Add concepts table
  doc.line(20, 95, 190, 95);
  doc.text('Cantidad', 20, 100);
  doc.text('Descripción', 50, 100);
  doc.text('Precio Unit.', 120, 100);
  doc.text('Importe', 160, 100);
  doc.line(20, 102, 190, 102);
  
  let y = 110;
  cfdi.conceptos.forEach((concepto: Concepto) => {
    doc.text(concepto.cantidad.toString(), 20, y);
    doc.text(concepto.descripcion, 50, y);
    doc.text(concepto.precioUnitario.toFixed(2), 120, y);
    doc.text(concepto.importe.toFixed(2), 160, y);
    y += 10;
  });
  
  // Add totals
  doc.line(20, y, 190, y);
  y += 10;
  doc.text('Subtotal:', 120, y);
  doc.text(cfdi.subtotal.toFixed(2), 160, y);
  y += 10;
  doc.text('Impuestos:', 120, y);
  doc.text(cfdi.totalImpuestos.toFixed(2), 160, y);
  y += 10;
  doc.setFontSize(12);
  doc.text('Total:', 120, y);
  doc.text(cfdi.total.toFixed(2), 160, y);
  
  // Add fiscal stamp if available
  if (cfdi.timbreFiscalDigital.uuid) {
    y += 20;
    doc.setFontSize(10);
    doc.text('TIMBRE FISCAL DIGITAL', 105, y, { align: 'center' });
    y += 10;
    doc.text(`UUID: ${cfdi.timbreFiscalDigital.uuid}`, 20, y);
    y += 10;
    doc.text(`Fecha de Timbrado: ${cfdi.timbreFiscalDigital.fechaTimbrado}`, 20, y);
    y += 10;
    doc.text(`No. Certificado SAT: ${cfdi.timbreFiscalDigital.noCertificadoSAT}`, 20, y);
  }
  
  return doc;
};

// Calculate totals for a CFDI
export const calculateCFDITotals = (conceptos: Concepto[]) => {
  let subtotal = 0;
  let totalImpuestos = 0;
  
  conceptos.forEach(concepto => {
    subtotal += concepto.importe;
    concepto.impuestos.forEach(impuesto => {
      totalImpuestos += impuesto.importe;
    });
  });
  
  const total = subtotal + totalImpuestos;
  
  return {
    subtotal,
    totalImpuestos,
    total
  };
};

// Calculate tax for a concept
export const calculateTax = (importe: number, tasa: number) => {
  return importe * (tasa / 100);
};

// Validate CFDI data according to SAT rules
export const validateCFDI = (cfdi: Partial<CFDI>) => {
  const errors: Record<string, string> = {};
  
  // Validate emisor
  if (!cfdi.emisor?.rfc) {
    errors.emisorRfc = 'El RFC del emisor es obligatorio';
  } else if (!/^[A-Z&Ñ]{3,4}\d{6}(?:[A-Z\d]{3})?$/.test(cfdi.emisor.rfc)) {
    errors.emisorRfc = 'El RFC del emisor no tiene un formato válido';
  }
  
  if (!cfdi.emisor?.nombre) {
    errors.emisorNombre = 'El nombre del emisor es obligatorio';
  }
  
  if (!cfdi.emisor?.regimenFiscal) {
    errors.emisorRegimenFiscal = 'El régimen fiscal del emisor es obligatorio';
  }
  
  // Validate receptor
  if (!cfdi.receptor?.rfc) {
    errors.receptorRfc = 'El RFC del receptor es obligatorio';
  } else if (!/^[A-Z&Ñ]{3,4}\d{6}(?:[A-Z\d]{3})?$/.test(cfdi.receptor.rfc)) {
    errors.receptorRfc = 'El RFC del receptor no tiene un formato válido';
  }
  
  if (!cfdi.receptor?.nombre) {
    errors.receptorNombre = 'El nombre del receptor es obligatorio';
  }
  
  if (!cfdi.receptor?.usoCFDI) {
    errors.receptorUsoCFDI = 'El uso de CFDI es obligatorio';
  }
  
  // Validate conceptos
  if (!cfdi.conceptos || cfdi.conceptos.length === 0) {
    errors.conceptos = 'Debe agregar al menos un concepto';
  } else {
    cfdi.conceptos.forEach((concepto, index) => {
      if (!concepto.claveProductoServicio) {
        errors[`concepto${index}ClaveProductoServicio`] = `La clave de producto/servicio del concepto ${index + 1} es obligatoria`;
      }
      
      if (!concepto.descripcion) {
        errors[`concepto${index}Descripcion`] = `La descripción del concepto ${index + 1} es obligatoria`;
      }
      
      if (!concepto.cantidad || concepto.cantidad <= 0) {
        errors[`concepto${index}Cantidad`] = `La cantidad del concepto ${index + 1} debe ser mayor a cero`;
      }
      
      if (!concepto.precioUnitario || concepto.precioUnitario <= 0) {
        errors[`concepto${index}PrecioUnitario`] = `El precio unitario del concepto ${index + 1} debe ser mayor a cero`;
      }
    });
  }
  
  // Validate informacion de pago
  if (!cfdi.informacionPago?.metodoPago) {
    errors.metodoPago = 'El método de pago es obligatorio';
  }
  
  if (!cfdi.informacionPago?.formaPago) {
    errors.formaPago = 'La forma de pago es obligatoria';
  }
  
  if (!cfdi.informacionPago?.moneda) {
    errors.moneda = 'La moneda es obligatoria';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};