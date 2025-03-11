import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { CFDI } from '../types';
import { useAuthStore } from '../store/authStore';
import { useCFDIStore } from '../store/cfdiStore';
import { initializeCatalogos } from '../store/catalogosStore';

import CFDIForm from '../components/cfdi/CFDIForm';

const CFDIFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { currentCFDI, loading, getCFDI, createCFDI, updateCFDI, clearCurrentCFDI } = useCFDIStore();
  const navigate = useNavigate();
  
  const isEditMode = !!id;
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Initialize catalogos
    initializeCatalogos();
    
    if (isEditMode && id) {
      getCFDI(id);
    }
    
    return () => {
      clearCurrentCFDI();
    };
  }, [id, user, navigate, isEditMode, getCFDI, clearCurrentCFDI]);
  
  const handleSubmit = async (data: CFDI) => {
    try {
      if (isEditMode && id) {
        await updateCFDI(id, data);
        toast.success('Factura actualizada correctamente');
      } else {
        await createCFDI(data);
        toast.success('Factura creada correctamente');
      }
      navigate('/facturas');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };
  
  const handleCancel = () => {
    navigate('/facturas');
  };
  
  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Editar Factura' : 'Nueva Factura'}
        </h1>
        <p className="text-gray-600">
          {isEditMode 
            ? 'Actualiza la información de la factura' 
            : 'Completa el formulario para generar un nuevo CFDI'}
        </p>
      </div>
      
      <CFDIForm
        initialData={isEditMode ? currentCFDI : undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CFDIFormPage;