import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { CFDI } from '../../types';
import Card from '../ui/Card';

interface DashboardStatsProps {
  cfdis: CFDI[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ cfdis }) => {
  // Calculate statistics
  const totalCFDIs = cfdis.length;
  const timbrados = cfdis.filter(cfdi => cfdi.estado === 'timbrado').length;
  const cancelados = cfdis.filter(cfdi => cfdi.estado === 'cancelado').length;
  const borradores = cfdis.filter(cfdi => cfdi.estado === 'borrador').length;
  
  // Calculate total amount for timbrados
  const totalAmount = cfdis
    .filter(cfdi => cfdi.estado === 'timbrado')
    .reduce((sum, cfdi) => sum + cfdi.total, 0);
  
  // Get recent CFDIs
  const recentCFDIs = [...cfdis]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  
  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'timbrado':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelado':
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FileText size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Facturas</p>
              <p className="text-2xl font-semibold">{totalCFDIs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Timbradas</p>
              <p className="text-2xl font-semibold">{timbrados}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Canceladas</p>
              <p className="text-2xl font-semibold">{cancelados}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Clock size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Borradores</p>
              <p className="text-2xl font-semibold">{borradores}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Monto Total Facturado">
          <div className="flex items-center justify-center py-6">
            <div className="p-4 rounded-full bg-green-100 text-green-600">
              <DollarSign size={32} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Facturado (MXN)</p>
              <p className="text-3xl font-bold">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        
        <Card title="Facturas Recientes">
          {recentCFDIs.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentCFDIs.map(cfdi => (
                <li key={cfdi.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(cfdi.estado)}
                      <div className="ml-3">
                        <p className="text-sm font-medium">{cfdi.receptor.nombre}</p>
                        <p className="text-xs text-gray-500">{new Date(cfdi.fechaEmision).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">${cfdi.total.toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-gray-500">No hay facturas recientes</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;