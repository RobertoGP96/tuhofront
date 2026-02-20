import { Calendar, Hotel, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { accommodationService } from '../../services/internal.service';
import type { AccommodationProcedureForm, FeedingDays, Guest } from '../../types/internal.types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AccommodationProcedureFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AccommodationProcedureForm({ onSuccess, onCancel }: AccommodationProcedureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([
    { name: '', sex: 'M', identification: '' }
  ]);
  const [feedingDays, setFeedingDays] = useState<FeedingDays[]>([
    { date: '', breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
  ]);

  const [formData, setFormData] = useState<AccommodationProcedureForm>({
    accommodation_type: 'HOTEL',
    start_day: '',
    end_day: '',
    description: '',
    guests: [],
    feeding_days: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addGuest = () => {
    setGuests([...guests, { name: '', sex: 'M', identification: '' }]);
  };

  const removeGuest = (index: number) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const updateGuest = (index: number, field: keyof Guest, value: string) => {
    const updatedGuests = [...guests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setGuests(updatedGuests);
  };

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

  const handleInputChange = (field: keyof AccommodationProcedureForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.accommodation_type) {
      newErrors.accommodation_type = 'Este campo es requerido';
    }
    if (!formData.start_day) {
      newErrors.start_day = 'Este campo es requerido';
    }
    if (!formData.end_day) {
      newErrors.end_day = 'Este campo es requerido';
    }
    if (!formData.description) {
      newErrors.description = 'Este campo es requerido';
    }

    const validGuests = guests.filter(guest => guest.name && guest.identification);
    if (validGuests.length === 0) {
      newErrors.guests = 'Debe agregar al menos un huésped con nombre y identificación';
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
      
      const validGuests = guests.filter(guest => guest.name && guest.identification);
      const validFeedingDays = feedingDays.filter(day => 
        day.date && (day.breakfast > 0 || day.lunch > 0 || day.dinner > 0 || day.snack > 0)
      );

      const procedureData = {
        ...formData,
        guests: validGuests,
        feeding_days: validFeedingDays
      };

      await accommodationService.create(procedureData);
      
      toast.success('Solicitud de alojamiento creada exitosamente');

      setFormData({
        accommodation_type: 'HOTEL',
        start_day: '',
        end_day: '',
        description: '',
        guests: [],
        feeding_days: []
      });
      setGuests([{ name: '', sex: 'M', identification: '' }]);
      setFeedingDays([{ date: '', breakfast: 0, lunch: 0, dinner: 0, snack: 0 }]);
      setErrors({});
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating accommodation procedure:', error);
      toast.error('No se pudo crear la solicitud. Intente nuevamente');
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
              <Hotel className="text-secondary-lime w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">
                Solicitud <span className="text-secondary-lime">Alojamiento</span>
              </CardTitle>
              <CardDescription className="text-gray-300 font-medium">
                Complete el formulario para solicitar servicios de alojamiento
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* Tipo de Alojamiento */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Hotel className="w-5 h-5 text-primary-navy" />
              <h3 className="font-bold text-primary-navy uppercase text-sm tracking-wider">Detalles del Servicio</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="accommodation_type" className="text-xs font-bold uppercase text-gray-500">Tipo de Alojamiento</Label>
                <Select
                  value={formData.accommodation_type}
                  onValueChange={(value: 'HOTEL' | 'POSGRADO') => handleInputChange('accommodation_type', value)}
                >
                  <SelectTrigger id="accommodation_type" className="rounded-xl border-gray-100 bg-gray-50/50">
                    <SelectValue placeholder="Seleccione el tipo de alojamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOTEL">Instalaciones Hoteleras</SelectItem>
                    <SelectItem value="POSGRADO">Hotelito de posgrado de la UHO</SelectItem>
                  </SelectContent>
                </Select>
                {errors.accommodation_type && (
                  <p className="text-sm text-red-500">{errors.accommodation_type}</p>
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

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold uppercase text-gray-500">Descripción Detallada</Label>
              <textarea
                id="description"
                rows={4}
                className="flex min-h-20 w-full rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describa los detalles de la solicitud de alojamiento..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

          {/* Huéspedes */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Huéspedes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGuest}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Huésped
              </Button>
            </div>

            {guests.map((guest, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Huésped {index + 1}</span>
                    {guests.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGuest(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre Completo</Label>
                      <Input
                        value={guest.name}
                        onChange={(e) => updateGuest(index, 'name', e.target.value)}
                        placeholder="Nombre del huésped"
                        className="rounded-xl border-gray-100 bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sexo</Label>
                      <Select
                        value={guest.sex}
                        onValueChange={(value: 'M' | 'F') => updateGuest(index, 'sex', value)}
                      >
                        <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Identificación</Label>
                      <Input
                        value={guest.identification}
                        onChange={(e) => updateGuest(index, 'identification', e.target.value)}
                        placeholder="Número de identificación"
                        className="rounded-xl border-gray-100 bg-gray-50/50"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {errors.guests && (
              <p className="text-sm text-red-500">{errors.guests}</p>
            )}
          </div>

          {/* Días de Alimentación (Opcional) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Días de Alimentación (Opcional)</Label>
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
          </div>

          </div>
        </CardContent>
        </Card>
      </form>
    </div>
  );
};
