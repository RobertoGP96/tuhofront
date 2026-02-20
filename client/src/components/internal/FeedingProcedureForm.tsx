import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { feedingService } from '@/services/internal.service';
import type { FeedingDays, FeedingProcedureForm } from '@/types/internal.types';
import { Calendar, Plus, Trash2, Utensils } from 'lucide-react';
import React, { useState } from 'react';

interface FeedingProcedureFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FeedingProcedureForm({ onSuccess, onCancel }: FeedingProcedureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedingDays, setFeedingDays] = useState<FeedingDays[]>([
    { date: '', breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
  ]);

  const [formData, setFormData] = useState<FeedingProcedureForm>({
    feeding_type: 'RESTAURANT',
    start_day: '',
    end_day: '',
    description: '',
    amount: 1,
    feeding_days: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addFeedingDay = () => {
    setFeedingDays([...feedingDays, { date: '', breakfast: 0, lunch: 0, dinner: 0, snack: 0 }]);
  };

  const removeFeedingDay = (index: number) => {
    setFeedingDays(feedingDays.filter((_, i) => i !== index));
  };

  const updateFeedingDay = (index: number, field: keyof FeedingDays, value: string | number) => {
    const updatedDays = [...feedingDays];
    updatedDays[index] = { ...updatedDays[index], [field]: value };
    setFeedingDays(updatedDays);
  };

  const handleInputChange = (field: keyof FeedingProcedureForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.feeding_type) {
      newErrors.feeding_type = 'Este campo es requerido';
    }
    if (!formData.start_day) {
      newErrors.start_day = 'Este campo es requerido';
    }
    if (!formData.end_day) {
      newErrors.end_day = 'Este campo es requerido';
    }
    if (!formData.amount || formData.amount < 1) {
      newErrors.amount = 'Debe ser al menos 1 persona';
    }
    if (!formData.description) {
      newErrors.description = 'Este campo es requerido';
    }

    const validFeedingDays = feedingDays.filter(day => 
      day.date && (day.breakfast > 0 || day.lunch > 0 || day.dinner > 0 || day.snack > 0)
    );
    
    if (validFeedingDays.length === 0) {
      newErrors.feeding_days = 'Debe agregar al menos un día de alimentación con comidas seleccionadas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Por favor, corrija los errores en el formulario');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const validFeedingDays = feedingDays.filter(day => 
        day.date && (day.breakfast > 0 || day.lunch > 0 || day.dinner > 0 || day.snack > 0)
      );

      const procedureData = {
        ...formData,
        feeding_days: validFeedingDays
      };

      await feedingService.create(procedureData);
      
      alert('Solicitud de alimentación creada exitosamente');

      setFormData({
        feeding_type: 'RESTAURANT',
        start_day: '',
        end_day: '',
        description: '',
        amount: 1,
        feeding_days: []
      });
      setFeedingDays([{ date: '', breakfast: 0, lunch: 0, dinner: 0, snack: 0 }]);
      setErrors({});
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating feeding procedure:', error);
      alert('No se pudo crear la solicitud. Intente nuevamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <form onSubmit={onSubmit}>
        <Card className="shadow-2xl shadow-primary-navy/5 border-gray-100 rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary-navy p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <Utensils className="text-secondary-lime w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">
                Solicitud <span className="text-secondary-lime">Alimentación</span>
              </CardTitle>
              <CardDescription className="text-gray-300 font-medium">
                Complete el formulario para solicitar servicios de alimentación
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Tipo de Alimentación */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Utensils className="w-5 h-5 text-primary-navy" />
              <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Detalles del Servicio</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="feeding_type" className="text-xs font-bold uppercase text-gray-500">Tipo de Alimentación</Label>
                <Select
                  value={formData.feeding_type}
                  onValueChange={(value: 'RESTAURANT' | 'HOTELITO') => handleInputChange('feeding_type', value)}
                >
                  <SelectTrigger id="feeding_type" className="rounded-xl border-gray-100 bg-gray-50/50">
                    <SelectValue placeholder="Seleccione el tipo de alimentación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESTAURANT">Restaurante Especializado</SelectItem>
                    <SelectItem value="HOTELITO">Hotelito de posgrado de la UHO</SelectItem>
                  </SelectContent>
                </Select>
                {errors.feeding_type && (
                  <p className="text-sm text-red-500">{errors.feeding_type}</p>
                )}
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start_day" className="text-xs font-bold uppercase text-gray-500">Fecha de Inicio</Label>
                <Input
                  id="start_day"
                  type="date"
                  value={formData.start_day}
                  onChange={(e) => handleInputChange('start_day', e.target.value)}
                  className="rounded-xl border-gray-100 bg-gray-50/50"
                />
                {errors.start_day && (
                  <p className="text-sm text-red-500">{errors.start_day}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_day" className="text-xs font-bold uppercase text-gray-500">Fecha de Fin</Label>
                <Input
                  id="end_day"
                  type="date"
                  value={formData.end_day}
                  onChange={(e) => handleInputChange('end_day', e.target.value)}
                  className="rounded-xl border-gray-100 bg-gray-50/50"
                />
                {errors.end_day && (
                  <p className="text-sm text-red-500">{errors.end_day}</p>
                )}
              </div>
            </div>

            {/* Cantidad de Personas */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs font-bold uppercase text-gray-500">Cantidad de Personas</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseInt(e.target.value) || 0)}
                className="rounded-xl border-gray-100 bg-gray-50/50"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold uppercase text-gray-500">Descripción Detallada</Label>
              <textarea
                id="description"
                rows={4}
                className="flex min-h-[80px] w-full rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describa los detalles de la solicitud de alimentación..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>
            </div>

          {/* Días de Alimentación */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Días de Alimentación</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeedingDay}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Día
              </Button>
            </div>

            {feedingDays.map((day, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Día {index + 1}</span>
                    </div>
                    {feedingDays.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeedingDay(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Input
                        type="date"
                        value={day.date}
                        onChange={(e) => updateFeedingDay(index, 'date', e.target.value)}
                        className="rounded-xl border-gray-100 bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Desayunos</Label>
                      <Input
                        type="number"
                        min="0"
                        value={day.breakfast}
                        onChange={(e) => updateFeedingDay(index, 'breakfast', parseInt(e.target.value) || 0)}
                        className="rounded-xl border-gray-100 bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Almuerzos</Label>
                      <Input
                        type="number"
                        min="0"
                        value={day.lunch}
                        onChange={(e) => updateFeedingDay(index, 'lunch', parseInt(e.target.value) || 0)}
                        className="rounded-xl border-gray-100 bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cenas</Label>
                      <Input
                        type="number"
                        min="0"
                        value={day.dinner}
                        onChange={(e) => updateFeedingDay(index, 'dinner', parseInt(e.target.value) || 0)}
                        className="rounded-xl border-gray-100 bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Meriendas</Label>
                      <Input
                        type="number"
                        min="0"
                        value={day.snack}
                        onChange={(e) => updateFeedingDay(index, 'snack', parseInt(e.target.value) || 0)}
                        className="rounded-xl border-gray-100 bg-gray-50/50"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {errors.feeding_days && (
              <p className="text-sm text-red-500">{errors.feeding_days}</p>
            )}
          </div>

          {/* Botones */}
          <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold uppercase tracking-widest border-gray-200 hover:bg-gray-50">
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-primary-navy hover:bg-primary-navy/90 text-white px-10 py-6 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-primary-navy/20 active:scale-95 transition-all">
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </CardContent>
        </Card>
      </form>
    </div>

  );
};
