import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { useCFDIStore } from '../store/cfdiStore';

import CFDIList from '../components/cfdi/CFDIList';
import Button from '../components/ui/Button';

const CFDIListPage: React.FC = () => {
  const { user } = useAuthStore();
  const { cfdis, loading, fetchCFDIs } = useCFDIStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchCFDIs();
  }, [user, navigate, fetchCFDIs]);
  
  const handleCreateCFDI = () => {
    navigate('/facturas/nueva');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-600">Gestiona tus comprobantes fiscales digitales</p>
        </div>
        
        <Button
          onClick={handleCreateCFDI}
          leftIcon={<Plus size={18} />}
        >
          Nueva Factura
        </Button>
      </div>
      
      <CFDIList cfdis={cfdis} isLoading={loading} />
    </div>
  );
};

export default CFDIListPage;