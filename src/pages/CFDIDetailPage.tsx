import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuthStore } from '../store/authStore';
import { useCFDIStore } from '../store/cfdiStore';

import CFDIDetail from '../components/cfdi/CFDIDetail';
import Card from '../components/ui/Card';

const CFDIDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { currentCFDI, loading, getCFDI, clearCurrentCFDI } = useCFDIStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (id) {
      getCFDI(id);
    }
    
    return () => {
      clearCurrentCFDI();
    };
  }, [id, user, navigate, getCFDI, clearCurrentCFDI]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!currentCFDI) {
    return (
      <Card>
        <div className="text-center py-8">
          <h2 className="text-xl font-medium text-gray-900">Factura no encontrada</h2>
          <p className="mt-2 text-gray-500">La factura que estás buscando no existe o no tienes permisos para verla.</p>
          <button
            className="mt-4 text-blue-600 hover:text-blue-800"
            onClick={() => navigate('/facturas')}
          >
            Volver a la lista de facturas
          </button>
        </div>
      </Card>
    );
  }
  
  return <CFDIDetail cfdi={currentCFDI} />;
};

export default CFDIDetailPage;