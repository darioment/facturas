import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Trash2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

import { CFDI } from '../../types';
import { useCFDIStore } from '../../store/cfdiStore';
import { generateCFDIXML, generateCFDIPDF } from '../../utils/cfdiUtils';

import Table from '../ui/Table';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface CFDIListProps {
  cfdis: CFDI[];
  isLoading: boolean;
}

const CFDIList: React.FC<CFDIListProps> = ({ cfdis, isLoading }) => {
  const [selectedCFDI, setSelectedCFDI] = useState<CFDI | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { deleteCFDI, cancelCFDI } = useCFDIStore();
  const navigate = useNavigate();
  
  const handleViewCFDI = (cfdi: CFDI) => {
    navigate(`/facturas/${cfdi.id}`);
  };
  
  const handleEditCFDI = (cfdi: CFDI) => {
    navigate(`/facturas/editar/${cfdi.id}`);
  };
  
  const handleDeleteClick = (cfdi: CFDI) => {
    setSelectedCFDI(cfdi);
    setShowDeleteModal(true);
  };
  
  const handleCancelClick = (cfdi: CFDI) => {
    setSelectedCFDI(cfdi);
    setShowCancelModal(true);
  };
  
  const confirmDelete = async () => {
    if (selectedCFDI) {
      try {
        await deleteCFDI(selectedCFDI.id);
        toast.success('Factura eliminada correctamente');
      } catch (error: any) {
        toast.error(`Error al eliminar la factura: ${error.message}`);
      } finally {
        setShowDeleteModal(false);
        setSelectedCFDI(null);
      }
    }
  };
  
  const confirmCancel = async () => {
    if (selectedCFDI) {
      try {
        await cancelCFDI(selectedCFDI.id);
        toast.success('Factura cancelada correctamente');
      } catch (error: any) {
        toast.error(`Error al cancelar la factura: ${error.message}`);
      } finally {
        setShowCancelModal(false);
        setSelectedCFDI(null);
      }
    }
  };
  
  const downloadXML = (cfdi: CFDI) => {
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
  
  const downloadPDF = (cfdi: CFDI) => {
    const pdf = generateCFDIPDF(cfdi);
    pdf.save(`CFDI_${cfdi.id}.pdf`);
  };
  
  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'timbrado':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'cancelado':
        return <AlertTriangle size={18} className="text-red-500" />;
      default:
        return <Clock size={18} className="text-yellow-500" />;
    }
  };
  
  const columns = [
    {
      header: 'Estado',
      accessor: (cfdi: CFDI) => (
        <div className="flex items-center">
          {getStatusIcon(cfdi.estado)}
          <span className="ml-2 capitalize">{cfdi.estado}</span>
        </div>
      ),
      className: 'w-24'
    },
    {
      header: 'Fecha',
      accessor: (cfdi: CFDI) => new Date(cfdi.fechaEmision).toLocaleDateString(),
      className: 'w-32'
    },
    {
      header: 'Receptor',
      accessor: (cfdi: CFDI) => (
        <div>
          <div className="font-medium">{cfdi.receptor.nombre}</div>
          <div className="text-xs text-gray-500">{cfdi.receptor.rfc}</div>
        </div>
      )
    },
    {
      header: 'Total',
      accessor: (cfdi: CFDI) => (
        <div className="font-medium text-right">
          ${cfdi.total.toFixed(2)} {cfdi.informacionPago.moneda}
        </div>
      ),
      className: 'w-32 text-right'
    },
    {
      header: 'Acciones',
      accessor: (cfdi: CFDI) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewCFDI(cfdi);
            }}
            leftIcon={<FileText size={16} />}
          >
            Ver
          </Button>
          
          {cfdi.estado === 'timbrado' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelClick(cfdi);
              }}
              leftIcon={<AlertTriangle size={16} />}
            >
              Cancelar
            </Button>
          )}
          
          {cfdi.estado === 'borrador' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditCFDI(cfdi);
                }}
              >
                Editar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(cfdi);
                }}
                leftIcon={<Trash2 size={16} />}
              >
                Eliminar
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              downloadXML(cfdi);
            }}
            leftIcon={<Download size={16} />}
          >
            XML
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              downloadPDF(cfdi);
            }}
            leftIcon={<Download size={16} />}
          >
            PDF
          </Button>
        </div>
      ),
      className: 'w-auto'
    }
  ];
  
  return (
    <div>
      <Table
        columns={columns}
        data={cfdis}
        keyExtractor={(cfdi) => cfdi.id}
        onRowClick={handleViewCFDI}
        isLoading={isLoading}
        emptyMessage="No hay facturas disponibles"
      />
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </div>
        }
      >
        <p>¿Está seguro que desea eliminar esta factura?</p>
        <p className="mt-2 text-sm text-gray-500">Esta acción no se puede deshacer.</p>
      </Modal>
      
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

export default CFDIList;
