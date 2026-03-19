import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { LocalListItem, LocalCreate, LocalType } from '@/types/locals.types';

const LOCAL_TYPES: { value: LocalType; label: string }[] = [
  { value: 'AULA', label: 'Aula' },
  { value: 'LABORATORIO', label: 'Laboratorio' },
  { value: 'AUDITORIO', label: 'Auditorio' },
  { value: 'SALA_REUNIONES', label: 'Sala de Reuniones' },
  { value: 'BIBLIOTECA', label: 'Biblioteca' },
  { value: 'GIMNASIO', label: 'Gimnasio' },
  { value: 'CAFETERIA', label: 'Cafeteria' },
  { value: 'OTRO', label: 'Otro' },
];

interface LocalFormState {
  name: string;
  code: string;
  local_type: LocalType | '';
  capacity: string;
  description: string;
  requires_approval: boolean;
  is_active: boolean;
}

const EMPTY_FORM: LocalFormState = {
  name: '',
  code: '',
  local_type: '',
  capacity: '',
  description: '',
  requires_approval: false,
  is_active: true,
};

function formFromLocal(local: LocalListItem): LocalFormState {
  return {
    name: local.name,
    code: local.code,
    local_type: local.local_type,
    capacity: String(local.capacity),
    description: '',
    requires_approval: local.requires_approval,
    is_active: local.is_active,
  };
}

interface LocalFormDialogProps {
  open: boolean;
  editing: LocalListItem | null;
  onClose: () => void;
  onSave: (data: LocalCreate, id?: number) => Promise<void>;
}

export function LocalFormDialog({ open, editing, onClose, onSave }: LocalFormDialogProps) {
  const [form, setForm] = useState<LocalFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(editing ? formFromLocal(editing) : EMPTY_FORM);
  }, [editing, open]);

  const set = (field: keyof LocalFormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isValid =
    form.name.trim().length >= 2 &&
    form.code.trim().length >= 1 &&
    form.local_type !== '' &&
    form.capacity !== '' &&
    !isNaN(Number(form.capacity)) &&
    Number(form.capacity) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    try {
      const data: LocalCreate = {
        name: form.name.trim(),
        code: form.code.trim(),
        local_type: form.local_type as LocalType,
        capacity: Number(form.capacity),
        description: form.description.trim() || undefined,
        requires_approval: form.requires_approval,
        is_active: form.is_active,
      };
      await onSave(data, editing?.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Local' : 'Nuevo Local'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="local-name">Nombre</Label>
              <Input
                id="local-name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Nombre del local"
                required
                minLength={2}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="local-code">Codigo</Label>
              <Input
                id="local-code"
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                placeholder="Ej: AULA-01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="local-type">Tipo</Label>
              <Select
                value={form.local_type}
                onValueChange={(v) => set('local_type', v)}
              >
                <SelectTrigger id="local-type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {LOCAL_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="local-capacity">Capacidad</Label>
              <Input
                id="local-capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => set('capacity', e.target.value)}
                placeholder="Personas"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="local-description">Descripcion (opcional)</Label>
            <Textarea
              id="local-description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Descripcion del local..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
              <input
                type="checkbox"
                checked={form.requires_approval}
                onChange={(e) => set('requires_approval', e.target.checked)}
                className="h-4 w-4"
              />
              Requiere aprobacion
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => set('is_active', e.target.checked)}
                className="h-4 w-4"
              />
              Activo
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !isValid}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
