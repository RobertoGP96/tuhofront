import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Wrench, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { maintenanceService, createMaintenanceFormData } from '../../services/internal.service';
import type { MaintanceProcedureForm, MaintanceProcedureType, MaintancePriority } from '../../types/internal.types';

interface MaintenanceProcedureFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MaintenanceProcedureForm({ onSuccess, onCancel }: MaintenanceProcedureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [procedureTypes, setProcedureTypes] = useState<MaintanceProcedureType[]>([]);
  const [priorities, setPriorities] = useState<MaintancePriority[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<MaintanceProcedureForm>({
    description: '',
    picture: undefined,
    procedure_type: 0,
    priority: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [typesData, prioritiesData] = await Promise.all([
          maintenanceService.getTypes(),
          maintenanceService.getPriorities()
        ]);
        
        setProcedureTypes(typesData);
        setPriorities(prioritiesData);
        
        if (typesData.length > 0) {
          setFormData(prev => ({ ...prev, procedure_type: typesData[0].id }));
        }
        if (prioritiesData.length > 0) {
          setFormData(prev => ({ ...prev, priority: prioritiesData[0].id }));
        }
      } catch (error) {
        console.error('Error loading maintenance data:', error);
        toast.error('No se pudieron cargar los datos de mantenimiento');
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: keyof MaintanceProcedureForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, seleccione un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        return;
      }

      setSelectedFile(file);
      setFormData(prev => ({ ...prev, picture: file }));

      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, picture: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description) {
      newErrors.description = 'Este campo es requerido';
    }
    if (!formData.procedure_type) {
      newErrors.procedure_type = 'Este campo es requerido';
    }
    if (!formData.priority) {
      newErrors.priority = 'Este campo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija los errores en el formulario');
      return;
    }

    try {
      setIsSubmitting(true);

      const formDataToSend = createMaintenanceFormData(formData);
      await maintenanceService.create(formDataToSend);
      
      toast.success('Solicitud de mantenimiento creada exitosamente');

      setFormData({
        description: '',
        picture: undefined,
        procedure_type: procedureTypes.length > 0 ? procedureTypes[0].id : 0,
        priority: priorities.length > 0 ? priorities[0].id : 0
      });
      setSelectedFile(null);
      setImagePreview(null);
      setErrors({});
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating maintenance procedure:', error);
      toast.error('No se pudo crear la solicitud. Intente nuevamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <Card className="shadow-2xl shadow-primary-navy/5 border-gray-100 rounded-3xl overflow-hidden">
        <CardHeader className="bg-primary-navy p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <Wrench className="text-secondary-lime w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">
                Solicitud <span className="text-secondary-lime">Mantenimiento</span>
              </CardTitle>
              <CardDescription className="text-gray-300 font-medium">
                Complete el formulario para solicitar servicios de mantenimiento
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* Tipo de Mantenimiento */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Wrench className="w-5 h-5 text-primary-navy" />
              <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Detalles del Servicio</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="procedure_type" className="text-xs font-bold uppercase text-gray-500">Tipo de Mantenimiento</Label>
                <Select
                  value={formData.procedure_type.toString()}
                  onValueChange={(value) => handleInputChange('procedure_type', parseInt(value))}
                >
                  <SelectTrigger id="procedure_type" className="rounded-xl border-gray-100 bg-gray-50/50">
                    <SelectValue placeholder="Seleccione el tipo de mantenimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {procedureTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.procedure_type && (
                  <p className="text-sm text-red-500">{errors.procedure_type}</p>
                )}
              </div>
            </div>

            {/* Prioridad */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-xs font-bold uppercase text-gray-500">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Prioridad
              </Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) => handleInputChange('priority', parseInt(value))}
              >
                <SelectTrigger id="priority" className="rounded-xl border-gray-100 bg-gray-50/50">
                  <SelectValue placeholder="Seleccione la prioridad" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.id} value={priority.id.toString()}>
                      {priority.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority}</p>
              )}
            </div>

            {/* Descripción del Problema */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold uppercase text-gray-500">Descripción del Problema</Label>
              <textarea
                id="description"
                rows={6}
                className="flex min-h-[120px] w-full rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describa detalladamente el problema o mantenimiento requerido..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

          {/* Fotografía (Opcional) */}
          <div className="space-y-6">
            <Label className="text-base font-medium">Fotografía del Problema (Opcional)</Label>
            
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Haga clic para seleccionar una imagen o arrástrela aquí
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF hasta 5MB
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="max-w-full h-auto rounded-lg border border-gray-200 max-h-96 object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  >
                    Eliminar
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Archivo seleccionado: {selectedFile?.name}
                </p>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="bg-primary-navy hover:bg-primary-navy/90 text-white px-6 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary-navy/20 hover:shadow-primary-navy/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
