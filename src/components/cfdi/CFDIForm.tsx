import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

import { CFDI, Concepto, Impuesto } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useCatalogosStore } from '../../store/catalogosStore';
import { calculateTax, validateCFDI, calculateCFDITotals } from '../../utils/cfdiUtils';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';

interface CFDIFormProps {
  initialData?: CFDI;
  onSubmit: (data: CFDI) => void;
  onCancel: () => void;
}

const CFDIForm: React.FC<CFDIFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { user } = useAuthStore();
  const { 
    regimenesFiscales, 
    usosCFDI, 
    metodosPago, 
    formasPago, 
    productosServicios,
    fetchCatalogos 
  } = useCatalogosStore();
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const defaultValues: Partial<CFDI> = {
    emisor: {
      rfc: '',
      nombre: '',
      regimenFiscal: '',
      codigoPostal: ''
    },
    receptor: {
      rfc: '',
      nombre: '',
      usoCFDI: ''
    },
    conceptos: [
      {
        id: uuidv4(),
        descripcion: '',
        claveProductoServicio: '',
        cantidad: 1,
        precioUnitario: 0,
        importe: 0,
        impuestos: [
          {
            tipo: 'IVA',
            tasa: 16,
            importe: 0
          }
        ]
      }
    ],
    informacionPago: {
      metodoPago: '',
      formaPago: '',
      moneda: 'MXN'
    },
    timbreFiscalDigital: {},
    total: 0,
    subtotal: 0,
    totalImpuestos: 0,
    estado: 'borrador',
    fechaEmision: new Date().toISOString(),
    ...initialData
  };
  
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CFDI>({
    defaultValues: defaultValues as CFDI
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'conceptos'
  });

  const watchConceptos = watch('conceptos');
  const cantidades = useWatch({ control, name: fields.map((field, index) => `conceptos.${index}.cantidad`) });
  const preciosUnitarios = useWatch({ control, name: fields.map((field, index) => `conceptos.${index}.precioUnitario`) });

  // Fetch catalogos on mount
  useEffect(() => {
    fetchCatalogos();
  }, [fetchCatalogos]);
  
  // Calculate importe for each concepto when cantidad or precioUnitario changes
  useEffect(() => {
    let subtotal = 0;
    let totalImpuestos = 0;

    fields.forEach((field, index) => {
      const cantidad = cantidades[index] || 0;
      const precioUnitario = preciosUnitarios[index] || 0;
      const importe = cantidad * precioUnitario;
      setValue(`conceptos.${index}.importe`, importe);

      const concepto = watchConceptos[index];
      if (concepto && concepto.impuestos) {
        let conceptoImpuestos = 0;
        concepto.impuestos.forEach((impuesto, impIndex) => {
          const impImporte = calculateTax(importe, impuesto.tasa);
          setValue(`conceptos.${index}.impuestos.${impIndex}.importe`, impImporte);
          conceptoImpuestos += impImporte;
        });
        totalImpuestos += conceptoImpuestos;
      }

      subtotal += importe;
    });

    const total = subtotal + totalImpuestos;
    setValue('subtotal', subtotal);
    setValue('totalImpuestos', totalImpuestos);
    setValue('total', total);
  }, [cantidades, preciosUnitarios, watchConceptos, setValue, fields]);
  
  const handleAddConcepto = () => {
    append({
      id: uuidv4(),
      descripcion: '',
      claveProductoServicio: '',
      cantidad: 1,
      precioUnitario: 0,
      importe: 0,
      impuestos: [
        {
          tipo: 'IVA',
          tasa: 16,
          importe: 0
        }
      ]
    });
  };
  
  const handleAddImpuesto = (conceptoIndex: number) => {
    const currentConcepto = watchConceptos[conceptoIndex];
    const currentImpuestos = currentConcepto.impuestos || [];
    
    // Check if we already have all three tax types
    const hasIVA = currentImpuestos.some(imp => imp.tipo === 'IVA');
    const hasISR = currentImpuestos.some(imp => imp.tipo === 'ISR');
    const hasIEPS = currentImpuestos.some(imp => imp.tipo === 'IEPS');
    
    let newTipo: 'IVA' | 'ISR' | 'IEPS' = 'IVA';
    let newTasa = 16;
    
    if (!hasIVA) {
      newTipo = 'IVA';
      newTasa = 16;
    } else if (!hasISR) {
      newTipo = 'ISR';
      newTasa = 10;
    } else if (!hasIEPS) {
      newTipo = 'IEPS';
      newTasa = 8;
    } else {
      toast.warning('Ya se han agregado todos los tipos de impuestos disponibles');
      return;
    }
    
    const importe = calculateTax(currentConcepto.importe, newTasa);
    
    const newImpuestos = [
      ...currentImpuestos,
      {
        tipo: newTipo,
        tasa: newTasa,
        importe
      }
    ];
    
    setValue(`conceptos.${conceptoIndex}.impuestos`, newImpuestos);
  };
  
  const handleRemoveImpuesto = (conceptoIndex: number, impuestoIndex: number) => {
    const currentConcepto = watchConceptos[conceptoIndex];
    const currentImpuestos = [...currentConcepto.impuestos];
    
    if (currentImpuestos.length <= 1) {
      toast.warning('Debe haber al menos un impuesto por concepto');
      return;
    }
    
    currentImpuestos.splice(impuestoIndex, 1);
    setValue(`conceptos.${conceptoIndex}.impuestos`, currentImpuestos);
  };
   
  const onFormSubmit = (data: CFDI) => {
    // Validate CFDI data
    const { isValid, errors } = validateCFDI(data);
    
    if (!isValid) {
      setValidationErrors(errors);
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }
    
    // Add user ID
    if (user) {
      data.userId = user.id;
    }
    
    // Submit the form
    onSubmit(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emisor */}
        <Card title="Datos del Emisor">
          <div className="space-y-4">
            <Input
              label="RFC"
              fullWidth
              error={validationErrors.emisorRfc || errors.emisor?.rfc?.message}
              {...register('emisor.rfc', { 
                required: 'El RFC es obligatorio',
                onChange: () => setValidationErrors(prevState => ({ ...prevState, emisorRfc: '' }))
              })}
            />
            
            <Input
              label="Nombre o Razón Social"
              fullWidth
              error={validationErrors.emisorNombre || errors.emisor?.nombre?.message}
              {...register('emisor.nombre', { required: 'El nombre es obligatorio' })}
            />
            
            <Select
              label="Régimen Fiscal"
              fullWidth
              options={regimenesFiscales.map(rf => ({ value: rf.codigo, label: `${rf.codigo} - ${rf.descripcion}` }))}
              error={validationErrors.emisorRegimenFiscal || errors.emisor?.regimenFiscal?.message}
              {...register('emisor.regimenFiscal', { required: 'El régimen fiscal es obligatorio' })}
            />
            
            <Input
              label="Código Postal"
              fullWidth
              error={errors.emisor?.codigoPostal?.message}
              {...register('emisor.codigoPostal', { 
                required: 'El código postal es obligatorio',
                pattern: {
                  value: /^\d{5}$/,
                  message: 'El código postal debe tener 5 dígitos'
                }
              })}
            />
          </div>
        </Card>
        
        {/* Receptor */}
        <Card title="Datos del Receptor">
          <div className="space-y-4">
            <Input
              label="RFC"
              fullWidth
              error={validationErrors.receptorRfc || errors.receptor?.rfc?.message}
              {...register('receptor.rfc', {
                required: 'El RFC es obligatorio',
                onChange: () => setValidationErrors(prevState => ({ ...prevState, receptorRfc: '' }))
              })}
            />

            <Input
              label="Nombre o Razón Social"
              fullWidth
              error={validationErrors.receptorNombre || errors.receptor?.nombre?.message}
              {...register('receptor.nombre', { required: 'El nombre es obligatorio' })}
            />
            
            <Select
              label="Uso de CFDI"
              fullWidth
              options={usosCFDI.map(uso => ({ value: uso.codigo, label: `${uso.codigo} - ${uso.descripcion}` }))}
              error={validationErrors.receptorUsoCFDI || errors.receptor?.usoCFDI?.message}
              {...register('receptor.usoCFDI', { required: 'El uso de CFDI es obligatorio' })}
            />
            
            <Input
              label="Domicilio Fiscal (Código Postal)"
              fullWidth
              error={errors.receptor?.domicilioFiscal?.message}
              {...register('receptor.domicilioFiscal', { 
                pattern: {
                  value: /^\d{5}$/,
                  message: 'El código postal debe tener 5 dígitos'
                }
              })}
            />
          </div>
        </Card>
      </div>
      
      {/* Conceptos */}
      <Card 
        title="Conceptos" 
        subtitle="Agregue los productos o servicios que desea facturar"
        footer={
          <Button
            type="button"
            variant="outline"
            onClick={handleAddConcepto}
            leftIcon={<Plus size={16} />}
          >
            Agregar Concepto
          </Button>
        }
      >
        {validationErrors.conceptos && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
            {validationErrors.conceptos}
          </div>
        )}
        
        {fields.map((field, index) => (
          <div key={field.id} className="mb-6 p-4 border border-gray-200 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium">Concepto #{index + 1}</h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                  leftIcon={<Trash2 size={16} />}
                >
                  Eliminar
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select
                label="Clave de Producto/Servicio"
                fullWidth
                options={productosServicios.map(ps => ({ value: ps.codigo, label: `${ps.codigo} - ${ps.descripcion}` }))}
                error={validationErrors[`concepto${index}ClaveProductoServicio`] || errors.conceptos?.[index]?.claveProductoServicio?.message}
                {...register(`conceptos.${index}.claveProductoServicio`, { required: 'La clave es obligatoria' })}
              />
              
              <Input
                label="Descripción"
                fullWidth
                error={validationErrors[`concepto${index}Descripcion`] || errors.conceptos?.[index]?.descripcion?.message}
                {...register(`conceptos.${index}.descripcion`, { required: 'La descripción es obligatoria' })}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                label="Cantidad"
                type="number"
                min="0.01"
                step="0.01"
                fullWidth
                error={validationErrors[`concepto${index}Cantidad`] || errors.conceptos?.[index]?.cantidad?.message}
                {...register(`conceptos.${index}.cantidad`, { 
                  required: 'La cantidad es obligatoria',
                  valueAsNumber: true,
                  min: {
                    value: 0.01,
                    message: 'La cantidad debe ser mayor a cero'
                  }
                })}
              />
              
              <Input
                label="Precio Unitario"
                type="number"
                min="0.01"
                step="0.01"
                fullWidth
                error={validationErrors[`concepto${index}PrecioUnitario`] || errors.conceptos?.[index]?.precioUnitario?.message}
                {...register(`conceptos.${index}.precioUnitario`, { 
                  required: 'El precio es obligatorio',
                  valueAsNumber: true,
                  min: {
                    value: 0.01,
                    message: 'El precio debe ser mayor a cero'
                  }
                })}
              />
              
              <Input
                label="Importe"
                type="number"
                readOnly
                fullWidth
                {...register(`conceptos.${index}.importe`, { valueAsNumber: true })}
              />
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-sm font-medium">Impuestos</h5>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddImpuesto(index)}
                  leftIcon={<Plus size={14} />}
                >
                  Agregar Impuesto
                </Button>
              </div>
              
              {watchConceptos[index].impuestos.map((impuesto, impIndex) => (
                <div key={impIndex} className="flex items-center space-x-4 mb-2">
                  <Select
                    label="Tipo"
                    options={[
                      { value: 'IVA', label: 'IVA' },
                      { value: 'ISR', label: 'ISR' },
                      { value: 'IEPS', label: 'IEPS' }
                    ]}
                    {...register(`conceptos.${index}.impuestos.${impIndex}.tipo`)}
                  />
                  
                  <Input
                    label="Tasa %"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`conceptos.${index}.impuestos.${impIndex}.tasa`, { 
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: 'La tasa debe ser mayor o igual a cero'
                      }
                    })}
                  />
                  
                  <Input
                    label="Importe"
                    type="number"
                    readOnly
                    {...register(`conceptos.${index}.impuestos.${impIndex}.importe`, { valueAsNumber: true })}
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveImpuesto(index, impIndex)}
                    className="mt-6"
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
      
      {/* Información de Pago */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Información de Pago">
          <div className="space-y-4">
            <Select
              label="Método de Pago"
              fullWidth
              options={metodosPago.map(mp => ({ value: mp.codigo, label: `${mp.codigo} - ${mp.descripcion}` }))}
              error={validationErrors.metodoPago || errors.informacionPago?.metodoPago?.message}
              {...register('informacionPago.metodoPago', { required: 'El método de pago es obligatorio' })}
            />
            
            <Select
              label="Forma de Pago"
              fullWidth
              options={formasPago.map(fp => ({ value: fp.codigo, label: `${fp.codigo} - ${fp.descripcion}` }))}
              error={validationErrors.formaPago || errors.informacionPago?.formaPago?.message}
              {...register('informacionPago.formaPago', { required: 'La forma de pago es obligatoria' })}
            />
            
            <Select
              label="Moneda"
              fullWidth
              options={[
                { value: 'MXN', label: 'Peso Mexicano (MXN)' },
                { value: 'USD', label: 'Dólar Americano (USD)' },
                { value: 'EUR', label: 'Euro (EUR)' }
              ]}
              error={validationErrors.moneda || errors.informacionPago?.moneda?.message}
              {...register('informacionPago.moneda', { required: 'La moneda es obligatoria' })}
            />
            
            {watch('informacionPago.moneda') !== 'MXN' && (
              <Input
                label="Tipo de Cambio"
                type="number"
                min="0.01"
                step="0.01"
                fullWidth
                {...register('informacionPago.tipoCambio', { 
                  valueAsNumber: true,
                  min: {
                    value: 0.01,
                    message: 'El tipo de cambio debe ser mayor a cero'
                  }
                })}
              />
            )}
          </div>
        </Card>
        
        <Card title="Totales">
          <div className="space-y-4">
            <Input
              label="Subtotal"
              type="number"
              readOnly
              fullWidth
              {...register('subtotal', { valueAsNumber: true })}
            />
            
            <Input
              label="Impuestos"
              type="number"
              readOnly
              fullWidth
              {...register('totalImpuestos', { valueAsNumber: true })}
            />
            
            <Input
              label="Total"
              type="number"
              readOnly
              fullWidth
              className="text-lg font-bold"
              {...register('total', { valueAsNumber: true })}
            />
          </div>
        </Card>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          leftIcon={<Save size={18} />}
        >
          Guardar CFDI
        </Button>
      </div>
    </form>
  );
};

export default CFDIForm;
