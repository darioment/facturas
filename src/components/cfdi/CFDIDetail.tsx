import React, { useState } from 'react';
import { ArrowLeft, Download, AlertTriangle, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { CFDI, Concepto } from '../../types';
import { useCFDIStore } from '../../store/cfdiStore';
import { generateCFDIXML, generateCFDIPDF } from '../../utils/cfdiUtils';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';

interface CFDIDetailProps {
  cfdi: CFDI;
}

const CFDIDetail: React.FC<CFDIDetailProps> = ({ cfdi }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { cancelCFDI } = useCFDIStore();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/facturas');
  };
  
  const confirmCancel = async () => {
    try {
      await cancelCFDI(cfdi.id);
      toast.success('Factura cancelada correctamente');
      setShowCancelModal(false);
    } catch (error: any) {
      toast.error(`Error al cancelar la factura: ${error.message}`);
    }
  };
  
  const downloadXML = () => {
    const xml = generateCFDIXML(cfdi);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CFDI_${cfdi.id}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const downloadPDF = () => {
    const pdf = generateCFDIPDF(cfdi);
    pdf.save(`CFDI_${cfdi.id}.pdf`);
  };
  
  const printCFDI = () => {
    const pdf = generateCFDIPDF(cfdi);
    pdf.autoPrint();
    window.open(pdf.output('bloburl'), '_blank');
  };
  
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'timbrado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handleBack}
          leftIcon={<ArrowLeft size={18} />}
        >
          Volver
        </Button>
        
        <div className="flex space-x-2">
          {cfdi.estado === 'timbrado' && (
            <Button
              variant="danger"
              onClick={() => setShowCancelModal(true)}
              leftIcon={<AlertTriangle size={18} />}
            >
              Cancelar CFDI
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={downloadXML}
            leftIcon={<Download size={18} />}
          >
            Descargar XML
          </Button>
          
          <Button
            variant="outline"
            onClick={downloadPDF}
            leftIcon={<Download size={18} />}
          >
            Descargar PDF
          </Button>
          
          <Button
            variant="outline"
            onClick={printCFDI}
            leftIcon={<Printer size={18} />}
          >
            Imprimir
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comprobante Fiscal Digital</h1>
            <p className="text-gray-500">
              {cfdi.serie || 'A'}-{cfdi.folio || '1'} | Fecha: {new Date(cfdi.fechaEmision).toLocaleString()}
            </p>
          </div>
          
          <div className={`px-4 py-2 rounded-full ${getStatusColor(cfdi.estado)}`}>
            <span className="text-sm font-medium capitalize">{cfdi.estado}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card title="Datos del Emisor">
            <div className="space-y-2">
              <p><span className="font-medium">RFC:</span> {cfdi.emisor.rfc}</p>
              <p><span className="font-medium">Nombre:</span> {cfdi.emisor.nombre}</p>
              <p><span className="font-medium">Régimen Fiscal:</span> {cfdi.emisor.regimenFiscal}</p>
              <p><span className="font-medium">Código Postal:</span> {cfdi.emisor.codigoPostal}</p>
            </div>
          </Card>
          
          <Card title="Datos del Receptor">
            <div className="space-y-2">
              <p><span className="font-medium">RFC:</span> {cfdi.receptor.rfc}</p>
              <p><span className="font-medium">Nombre:</span> {cfdi.receptor.nombre}</p>
              <p><span className="font-medium">Uso CFDI:</span> {cfdi.receptor.usoCFDI}</p>
              {cfdi.receptor.domicilioFiscal && (
                <p><span className="font-medium">Domicilio Fiscal:</span> {cfdi.receptor.domicilioFiscal}</p>
              )}
            </div>
          </Card>
        </div>
        
        <Card title="Conceptos" className="mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Unitario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importe
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cfdi.conceptos.map((concepto: Concepto, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {concepto.cantidad}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        <p>{concepto.descripcion}</p>
                        <p className="text-xs text-gray-400">Clave: {concepto.claveProductoServicio}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${concepto.precioUnitario.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${concepto.importe.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Impuestos:</h4>
            {cfdi.conceptos.map((concepto, index) => (
              <div key={index} className="ml-4">
                <p className="text-sm text-gray-600">Concepto {index + 1}:</p>
                <ul className="list-disc list-inside ml-4">
                  {concepto.impuestos.map((impuesto, impIndex) => (
                    <li key={impIndex} className="text-sm text-gray-500">
                      {impuesto.tipo} ({impuesto.tasa}%): ${impuesto.importe.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card title="Información de Pago">
            <div className="space-y-2">
              <p><span className="font-medium">Método de Pago:</span> {cfdi.informacionPago.metodoPago}</p>
              <p><span className="font-medium">Forma de Pago:</span> {cfdi.informacionPago.formaPago}</p>
              <p><span className="font-medium">Moneda:</span> {cfdi.informacionPago.moneda}</p>
              {cfdi.informacionPago.tipoCambio && (
                <p><span className="font-medium">Tipo de Cambio:</span> {cfdi.informacionPago.tipoCambio}</p>
              )}
            </div>
          </Card>
          
          <Card title="Totales">
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>${cfdi.subtotal.toFixed(2)}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Impuestos:</span>
                <span>${cfdi.totalImpuestos.toFixed(2)}</span>
              </p>
              <p className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${cfdi.total.toFixed(2)} {cfdi.informacionPago.moneda}</span>
              </p>
            </div>
          </Card>
        </div>
        
        {cfdi.timbreFiscalDigital.uuid && (
          <Card title="Timbre Fiscal Digital">
            <div className="space-y-2">
              <p><span className="font-medium">UUID:</span> {cfdi.timbreFiscalDigital.uuid}</p>
              <p><span className="font-medium">Fecha de Timbrado:</span> {cfdi.timbreFiscalDigital.fechaTimbrado}</p>
              <p><span className="font-medium">No. Certificado SAT:</span> {cfdi.timbreFiscalDigital.noCertificadoSAT}</p>
            </div>
          </Card>
        )}
      </div>
      
      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Confirmar Cancelación"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              No Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmCancel}
            >
              Sí, Cancelar Factura
            </Button>
          </div>
        }
      >
        <p>¿Está seguro que desea cancelar esta factura?</p>
        <p className="mt-2 text-sm text-gray-500">
          Esta acción notificará al SAT sobre la cancelación del CFDI. 
          Dependiendo del tiempo transcurrido desde su emisión, podría requerir la aceptación del receptor.
        </p>
      </Modal>
    </div>
  );
};

export default CFDIDetail;