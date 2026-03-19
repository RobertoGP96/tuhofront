import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Calendar, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { localsService } from '@/services/locals.service';
import type { LocalListItem, ReservationPurpose } from '@/types/locals.types';

const PURPOSE_OPTIONS: { value: ReservationPurpose; label: string }[] = [
  { value: 'CLASE', label: 'Clase' },
  { value: 'EXAMEN', label: 'Examen' },
  { value: 'REUNION', label: 'Reunión' },
  { value: 'EVENTO', label: 'Evento' },
  { value: 'TALLER', label: 'Taller' },
  { value: 'CONFERENCIA', label: 'Conferencia' },
  { value: 'ESTUDIO', label: 'Estudio' },
  { value: 'OTRO', label: 'Otro' },
];

type FormValues = {
  local: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  purpose: ReservationPurpose | '';
  purpose_detail: string;
  expected_attendees: number;
  responsible_name: string;
  responsible_phone: string;
  responsible_email: string;
  setup_requirements: string;
  observation: string;
};

export default function ReservationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedLocalId = searchParams.get('local') ?? '';

  const [locals, setLocals] = useState<LocalListItem[]>([]);
  const [localsLoading, setLocalsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      local: preselectedLocalId,
      purpose: '',
      expected_attendees: 1,
    },
  });

  const watchedLocal = watch('local');
  const selectedLocalObj = locals.find((l) => String(l.id) === watchedLocal);

  useEffect(() => {
    setLocalsLoading(true);
    localsService
      .getActiveLocals()
      .then(setLocals)
      .catch(() => toast.error('No se pudo cargar la lista de locales'))
      .finally(() => setLocalsLoading(false));
  }, []);

  async function onSubmit(values: FormValues) {
    if (!values.purpose) {
      toast.error('Selecciona el propósito de la reserva');
      return;
    }

    const startIso = `${values.start_date}T${values.start_time}:00`;
    const endIso = `${values.end_date}T${values.end_time}:00`;

    const startMs = new Date(startIso).getTime();
    const endMs = new Date(endIso).getTime();

    if (endMs <= startMs) {
      toast.error('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    const durationMs = endMs - startMs;
    const durationMin = durationMs / 60000;

    if (durationMin < 30) {
      toast.error('La duración mínima de la reserva es 30 minutos');
      return;
    }

    if (durationMin > 480) {
      toast.error('La duración máxima de la reserva es 8 horas');
      return;
    }

    if (selectedLocalObj && values.expected_attendees > selectedLocalObj.capacity) {
      toast.error(
        `Los asistentes esperados (${values.expected_attendees}) superan la capacidad del local (${selectedLocalObj.capacity})`
      );
      return;
    }

    setSubmitting(true);
    try {
      await localsService.createReservation({
        local: values.local,
        start_time: startIso,
        end_time: endIso,
        purpose: values.purpose as ReservationPurpose,
        purpose_detail: values.purpose_detail,
        expected_attendees: Number(values.expected_attendees),
        responsible_name: values.responsible_name,
        responsible_phone: values.responsible_phone,
        responsible_email: values.responsible_email,
        setup_requirements: values.setup_requirements || undefined,
        observation: values.observation || undefined,
      });
      toast.success('Reserva creada exitosamente');
      navigate('/locals/my-reservations');
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      const detail = e.response?.data;
      if (detail) {
        const first = Object.values(detail)[0];
        toast.error(Array.isArray(first) ? first[0] : 'Error al crear la reserva');
      } else {
        toast.error('Error al crear la reserva. Intenta nuevamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-navy transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          Volver
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-navy flex items-center justify-center">
            <Calendar size={20} className="text-secondary-lime" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-navy">Nueva Reserva</h1>
            <p className="text-sm text-gray-400">
              {selectedLocalObj ? selectedLocalObj.name : 'Completa el formulario para reservar un local'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Local & dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Espacio y horario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Local selector */}
              <div className="space-y-1.5">
                <Label htmlFor="local">
                  Local <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchedLocal}
                  onValueChange={(v) => setValue('local', v, { shouldValidate: true })}
                  disabled={localsLoading}
                >
                  <SelectTrigger id="local" className={errors.local ? 'border-red-400' : ''}>
                    <SelectValue placeholder={localsLoading ? 'Cargando...' : 'Selecciona un local'} />
                  </SelectTrigger>
                  <SelectContent>
                    {locals.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.name} — {l.code} (cap. {l.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  {...register('local', { required: 'Selecciona un local' })}
                />
                {errors.local && (
                  <p className="text-xs text-red-500">{errors.local.message}</p>
                )}
              </div>

              {/* Start */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start_date">
                    Fecha inicio <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...register('start_date', { required: 'Requerido' })}
                    className={errors.start_date ? 'border-red-400' : ''}
                  />
                  {errors.start_date && (
                    <p className="text-xs text-red-500">{errors.start_date.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="start_time">
                    Hora inicio <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="start_time"
                    type="time"
                    {...register('start_time', { required: 'Requerido' })}
                    className={errors.start_time ? 'border-red-400' : ''}
                  />
                  {errors.start_time && (
                    <p className="text-xs text-red-500">{errors.start_time.message}</p>
                  )}
                </div>
              </div>

              {/* End */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="end_date">
                    Fecha fin <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    {...register('end_date', { required: 'Requerido' })}
                    className={errors.end_date ? 'border-red-400' : ''}
                  />
                  {errors.end_date && (
                    <p className="text-xs text-red-500">{errors.end_date.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end_time">
                    Hora fin <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="end_time"
                    type="time"
                    {...register('end_time', { required: 'Requerido' })}
                    className={errors.end_time ? 'border-red-400' : ''}
                  />
                  {errors.end_time && (
                    <p className="text-xs text-red-500">{errors.end_time.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purpose */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Propósito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>
                  Tipo de propósito <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('purpose')}
                  onValueChange={(v) => setValue('purpose', v as ReservationPurpose, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el propósito" />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="purpose_detail">
                  Detalle del propósito <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="purpose_detail"
                  placeholder="Describe el propósito de la reserva..."
                  rows={3}
                  {...register('purpose_detail', { required: 'El detalle es obligatorio' })}
                  className={errors.purpose_detail ? 'border-red-400' : ''}
                />
                {errors.purpose_detail && (
                  <p className="text-xs text-red-500">{errors.purpose_detail.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expected_attendees">
                  Asistentes esperados <span className="text-red-500">*</span>
                  {selectedLocalObj && (
                    <span className="text-xs text-gray-400 ml-1">
                      (máx. {selectedLocalObj.capacity})
                    </span>
                  )}
                </Label>
                <Input
                  id="expected_attendees"
                  type="number"
                  min={1}
                  max={selectedLocalObj?.capacity}
                  {...register('expected_attendees', {
                    required: 'Requerido',
                    min: { value: 1, message: 'Mínimo 1 asistente' },
                    valueAsNumber: true,
                  })}
                  className={errors.expected_attendees ? 'border-red-400' : ''}
                />
                {errors.expected_attendees && (
                  <p className="text-xs text-red-500">{errors.expected_attendees.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Responsible */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos del responsable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="responsible_name">
                  Nombre completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="responsible_name"
                  placeholder="Nombre del responsable"
                  {...register('responsible_name', { required: 'El nombre es obligatorio' })}
                  className={errors.responsible_name ? 'border-red-400' : ''}
                />
                {errors.responsible_name && (
                  <p className="text-xs text-red-500">{errors.responsible_name.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="responsible_phone">
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="responsible_phone"
                    placeholder="+53 5..."
                    {...register('responsible_phone', { required: 'Requerido' })}
                    className={errors.responsible_phone ? 'border-red-400' : ''}
                  />
                  {errors.responsible_phone && (
                    <p className="text-xs text-red-500">{errors.responsible_phone.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="responsible_email">
                    Correo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="responsible_email"
                    type="email"
                    placeholder="correo@ejemplo.cu"
                    {...register('responsible_email', {
                      required: 'Requerido',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
                    })}
                    className={errors.responsible_email ? 'border-red-400' : ''}
                  />
                  {errors.responsible_email && (
                    <p className="text-xs text-red-500">{errors.responsible_email.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="setup_requirements">Requerimientos de montaje</Label>
                <Textarea
                  id="setup_requirements"
                  placeholder="Mobiliario, equipos, disposición especial..."
                  rows={2}
                  {...register('setup_requirements')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="observation">Observaciones</Label>
                <Textarea
                  id="observation"
                  placeholder="Cualquier información adicional..."
                  rows={2}
                  {...register('observation')}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-primary-navy hover:bg-primary-navy/90 text-white flex items-center gap-2"
            >
              <Send size={16} />
              {submitting ? 'Enviando...' : 'Crear reserva'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
