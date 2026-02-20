import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Bus, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { transportService } from '../../services/internal.service';
import type { TransportProcedureForm, TransportProcedureType } from '../../types/internal.types';

interface TransportProcedureFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransportProcedureForm({ onSuccess, onCancel }: TransportProcedureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transportTypes, setTransportTypes] = useState<TransportProcedureType[]>([]);

  const [formData, setFormData] = useState<TransportProcedureForm>({
    procedure_type: 0,
    departure_time: '',
    return_time: '',
    departure_place: '',
    return_place: '',
    passengers: 1,
    description: '',
    round_trip: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadTransportTypes = async () => {
      try {
        const types = await transportService.getTypes();
        setTransportTypes(types);
        if (types.length > 0) {
          setFormData(prev => ({ ...prev, procedure_type: types[0].id }));
        }
      } catch (error) {
        console.error('Error loading transport types:', error);
        toast.error('No se pudieron cargar los tipos de transporte');
      }
    };

    loadTransportTypes();
  }, []);

  const handleInputChange = (field: keyof TransportProcedureForm, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.procedure_type) {
      newErrors.procedure_type = 'Este campo es requerido';
    }
    if (!formData.departure_time) {
      newErrors.departure_time = 'Este campo es requerido';
    }
    if (!formData.departure_place) {
      newErrors.departure_place = 'Este campo es requerido';
    }
    if (formData.round_trip && !formData.return_time) {
      newErrors.return_time = 'Este campo es requerido para viaje redondo';
    }
    if (formData.round_trip && !formData.return_place) {
      newErrors.return_place = 'Este campo es requerido para viaje redondo';
    }
    if (!formData.passengers || formData.passengers < 1) {
      newErrors.passengers = 'Debe ser al menos 1 pasajero';
    }
    if (!formData.description) {
      newErrors.description = 'Este campo es requerido';
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

      await transportService.create(formData);
      
      toast.success('Solicitud de transporte creada exitosamente');

      setFormData({
        procedure_type: transportTypes.length > 0 ? transportTypes[0].id : 0,
        departure_time: '',
        return_time: '',
        departure_place: '',
        return_place: '',
        passengers: 1,
        description: '',
        round_trip: false
      });
      setErrors({});
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating transport procedure:', error);
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
              <Bus className="text-secondary-lime w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">
                Solicitud <span className="text-secondary-lime">Transporte</span>
              </CardTitle>
              <CardDescription className="text-gray-300 font-medium">
                Complete el formulario para solicitar servicios de transporte
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* Tipo de Transporte */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Bus className="w-5 h-5 text-primary-navy" />
              <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Detalles del Servicio</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="procedure_type" className="text-xs font-bold uppercase text-gray-500">Tipo de Transporte</Label>
                <Select
                  value={formData.procedure_type.toString()}
                  onValueChange={(value) => handleInputChange('procedure_type', parseInt(value))}
                >
                  <SelectTrigger id="procedure_type" className="rounded-xl border-gray-100 bg-gray-50/50">
                    <SelectValue placeholder="Seleccione el tipo de transporte" />
                  </SelectTrigger>
                  <SelectContent>
                    {transportTypes.map((type) => (
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

            {/* Tipo de Viaje */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-500">Tipo de Viaje</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="round_trip"
                  checked={formData.round_trip}
                  onChange={(e) => handleInputChange('round_trip', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="round_trip" className="text-sm">Viaje redondo</Label>
              </div>
            </div>

            {/* Horarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="departure_time" className="text-xs font-bold uppercase text-gray-500">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Hora de Salida
                </Label>
                <Input
                  id="departure_time"
                  type="datetime-local"
                  value={formData.departure_time}
                  onChange={(e) => handleInputChange('departure_time', e.target.value)}
                  className="rounded-xl border-gray-100 bg-gray-50/50"
                />
                {errors.departure_time && (
                  <p className="text-sm text-red-500">{errors.departure_time}</p>
                )}
              </div>
              {formData.round_trip && (
                <div className="space-y-2">
                  <Label htmlFor="return_time" className="text-xs font-bold uppercase text-gray-500">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Hora de Regreso
                  </Label>
                  <Input
                    id="return_time"
                    type="datetime-local"
                    value={formData.return_time}
                    onChange={(e) => handleInputChange('return_time', e.target.value)}
                    className="rounded-xl border-gray-100 bg-gray-50/50"
                  />
                  {errors.return_time && (
                    <p className="text-sm text-red-500">{errors.return_time}</p>
                  )}
                </div>
              )}
            </div>

            {/* Lugares */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="departure_place" className="text-xs font-bold uppercase text-gray-500">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Lugar de Salida
                </Label>
                <Input
                  id="departure_place"
                  value={formData.departure_place}
                  onChange={(e) => handleInputChange('departure_place', e.target.value)}
                  placeholder="Ingrese el lugar de salida"
                  className="rounded-xl border-gray-100 bg-gray-50/50"
                />
                {errors.departure_place && (
                  <p className="text-sm text-red-500">{errors.departure_place}</p>
                )}
              </div>
              {formData.round_trip && (
                <div className="space-y-2">
                  <Label htmlFor="return_place" className="text-xs font-bold uppercase text-gray-500">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Lugar de Regreso
                  </Label>
                  <Input
                    id="return_place"
                    value={formData.return_place}
                    onChange={(e) => handleInputChange('return_place', e.target.value)}
                    placeholder="Ingrese el lugar de regreso"
                    className="rounded-xl border-gray-100 bg-gray-50/50"
                  />
                  {errors.return_place && (
                    <p className="text-sm text-red-500">{errors.return_place}</p>
                  )}
                </div>
              )}
            </div>

            {/* Cantidad de Pasajeros */}
            <div className="space-y-2">
              <Label htmlFor="passengers" className="text-xs font-bold uppercase text-gray-500">Cantidad de Pasajeros</Label>
              <Input
                id="passengers"
                type="number"
                min="1"
                value={formData.passengers}
                onChange={(e) => handleInputChange('passengers', parseInt(e.target.value) || 0)}
                className="rounded-xl border-gray-100 bg-gray-50/50"
              />
              {errors.passengers && (
                <p className="text-sm text-red-500">{errors.passengers}</p>
              )}
            </div>

            {/* Placa (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="plate" className="text-xs font-bold uppercase text-gray-500">Placa del Vehículo (Opcional)</Label>
              <Input
                id="plate"
                value={formData.plate || ''}
                onChange={(e) => handleInputChange('plate', e.target.value)}
                placeholder="Ingrese la placa del vehículo asignado"
                className="rounded-xl border-gray-100 bg-gray-50/50"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold uppercase text-gray-500">Descripción Detallada</Label>
              <textarea
                id="description"
                rows={4}
                className="flex min-h-[80px] w-full rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describa los detalles de la solicitud de transporte..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
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
