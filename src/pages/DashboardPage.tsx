import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { useCFDIStore } from '../store/cfdiStore';
import { initializeCatalogos } from '../store/catalogosStore';

import DashboardStats from '../components/dashboard/DashboardStats';
import Button from '../components/ui/Button';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { cfdis, loading, fetchCFDIs } = useCFDIStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchCFDIs();
    initializeCatalogos();
  }, [user, navigate, fetchCFDIs]);
  
  const handleCreateCFDI = () => {
    navigate('/facturas/nueva');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bienvenido, {user?.email}</p>
        </div>
        
        <Button
          onClick={handleCreateCFDI}
          leftIcon={<Plus size={18} />}
        >
          Nueva Factura
        </Button>
      </div>
      
      <DashboardStats cfdis={cfdis} />
    </div>
  );
};

export default DashboardPage;