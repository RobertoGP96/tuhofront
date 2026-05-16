import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { adminService } from '@/services/admin.service';
import type { User } from '@/types/auth.types';

const USER_TYPE_OPTIONS = [
  { value: 'USUARIO', label: 'Usuario' },
  { value: 'GESTOR_INTERNO', label: 'Gestor Trámites Internos' },
  { value: 'GESTOR_SECRETARIA', label: 'Gestor Secretaría Docente' },
  { value: 'GESTOR_RESERVAS', label: 'Gestor Reservas' },
  { value: 'ADMIN', label: 'Administrador' },
];

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: User) => void;
}

interface FormState {
  first_name: string;
  last_name: string;
  phone: string;
  user_type: string;
  is_active: boolean;
}

export function EditUserDialog({ user, open, onClose, onSaved }: EditUserDialogProps) {
  const [form, setForm] = useState<FormState>({
    first_name: '',
    last_name: '',
    phone: '',
    user_type: '',
    is_active: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        phone: user.phone ?? '',
        user_type: user.user_type ?? '',
        is_active: user.is_active ?? true,
      });
    }
  }, [user]);

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updated = await adminService.updateUser(user.id, {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || undefined,
        user_type: form.user_type || undefined,
        is_active: form.is_active,
      });
      toast.success('Usuario actualizado correctamente');
      onSaved(updated);
      onClose();
    } catch {
      toast.error('Error al actualizar el usuario');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary-navy">Editar Usuario</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">Nombre</Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                placeholder="Nombre"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Apellidos</Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                placeholder="Apellidos"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+53 5 000 0000"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user_type">Tipo de Usuario</Label>
            <Select
              value={form.user_type}
              onValueChange={(val) => handleChange('user_type', val)}
            >
              <SelectTrigger id="user_type">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {USER_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="is_active">Estado</Label>
            <Select
              value={form.is_active ? 'true' : 'false'}
              onValueChange={(val) => handleChange('is_active', val === 'true')}
            >
              <SelectTrigger id="is_active">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            className="bg-primary-navy hover:bg-primary-navy/90 text-white"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
