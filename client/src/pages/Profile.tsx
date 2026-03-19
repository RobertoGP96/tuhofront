import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, CreditCard, Pencil, X, KeyRound, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import type { User as UserType } from '../types/auth.types';
import { USER_TYPE_OPTIONS } from '../types/auth.types';

type ProfileFormData = {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  date_of_birth: string;
};

type PasswordFormData = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

function VerifiedBadge({ verified, label }: { verified: boolean | undefined; label: string }) {
  if (verified === undefined) return null;
  return verified ? (
    <Badge className="gap-1 bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
      <CheckCircle size={12} />
      {label} verificado
    </Badge>
  ) : (
    <Badge className="gap-1 bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
      <XCircle size={12} />
      {label} sin verificar
    </Badge>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | undefined }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-0.5 text-gray-400 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-700 font-medium">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const userTypeLabel = USER_TYPE_OPTIONS.find((o) => o.value === user?.user_type)?.label ?? user?.user_type ?? '—';

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      phone: user?.phone ?? '',
      address: user?.address ?? '',
      date_of_birth: user?.date_of_birth ?? '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: { old_password: '', new_password: '', confirm_password: '' },
  });

  function handleEditToggle() {
    if (editMode) {
      profileForm.reset({
        first_name: user?.first_name ?? '',
        last_name: user?.last_name ?? '',
        phone: user?.phone ?? '',
        address: user?.address ?? '',
        date_of_birth: user?.date_of_birth ?? '',
      });
    }
    setEditMode((prev) => !prev);
  }

  async function onSaveProfile(data: ProfileFormData) {
    if (!user?.id) return;
    setSavingProfile(true);
    try {
      const updated = await authService.updateProfile(String(user.id), data);
      authService.setStoredUser(updated);
      // Refresh auth context by re-fetching current user
      const fresh = await authService.getCurrentUser();
      authService.setStoredUser(fresh);
      // Trigger context update by re-logging with stored tokens (soft refresh)
      toast.success('Perfil actualizado correctamente');
      setEditMode(false);
    } catch {
      toast.error('No se pudo actualizar el perfil');
    } finally {
      setSavingProfile(false);
    }
  }

  async function onSavePassword(data: PasswordFormData) {
    if (data.new_password !== data.confirm_password) {
      passwordForm.setError('confirm_password', { message: 'Las contraseñas no coinciden' });
      return;
    }
    setSavingPassword(true);
    try {
      await authService.changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
      });
      toast.success('Contraseña cambiada correctamente');
      passwordForm.reset();
    } catch {
      toast.error('No se pudo cambiar la contraseña. Verifique su contraseña actual.');
    } finally {
      setSavingPassword(false);
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-400">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-black uppercase text-primary-navy">Mi Perfil</h1>

      {/* Profile Card */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-bold text-primary-navy flex items-center gap-2">
            <User size={18} />
            Información Personal
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditToggle}
            className={cn(
              'gap-1',
              editMode && 'border-red-200 text-red-600 hover:bg-red-50'
            )}
          >
            {editMode ? (
              <>
                <X size={14} />
                Cancelar
              </>
            ) : (
              <>
                <Pencil size={14} />
                Editar
              </>
            )}
          </Button>
        </CardHeader>

        <CardContent>
          {/* Verification badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <VerifiedBadge verified={(user as UserType & { email_verified?: boolean }).email_verified} label="Email" />
            <VerifiedBadge verified={(user as UserType & { phone_verified?: boolean }).phone_verified} label="Teléfono" />
          </div>

          {editMode ? (
            <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input id="first_name" {...profileForm.register('first_name')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="last_name">Apellidos</Label>
                  <Input id="last_name" {...profileForm.register('last_name')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" {...profileForm.register('phone')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="date_of_birth">Fecha de nacimiento</Label>
                  <Input id="date_of_birth" type="date" {...profileForm.register('date_of_birth')} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" {...profileForm.register('address')} />
                </div>
              </div>

              {/* Read-only fields shown in edit mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div className="space-y-1">
                  <Label className="text-gray-400">Usuario</Label>
                  <Input value={user.username} disabled className="bg-gray-50 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-400">Correo electrónico</Label>
                  <Input value={user.email} disabled className="bg-gray-50 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-400">Carnet de identidad</Label>
                  <Input value={user.id_card ?? '—'} disabled className="bg-gray-50 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-400">Tipo de usuario</Label>
                  <Input value={userTypeLabel} disabled className="bg-gray-50 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={handleEditToggle} disabled={savingProfile}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-primary-navy hover:bg-primary-navy/90 text-white"
                >
                  {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              <div className="space-y-1 sm:pr-6">
                <InfoRow icon={<User size={16} />} label="Nombre completo" value={`${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || undefined} />
                <InfoRow icon={<Mail size={16} />} label="Correo electrónico" value={user.email} />
                <InfoRow icon={<Phone size={16} />} label="Teléfono" value={user.phone} />
                <InfoRow icon={<MapPin size={16} />} label="Dirección" value={user.address} />
              </div>
              <div className="space-y-1 pt-2 sm:pt-0 sm:pl-6">
                <InfoRow icon={<User size={16} />} label="Usuario" value={user.username} />
                <InfoRow icon={<CreditCard size={16} />} label="Carnet de identidad" value={user.id_card} />
                <InfoRow icon={<Calendar size={16} />} label="Fecha de nacimiento" value={user.date_of_birth} />
                <InfoRow icon={<Briefcase size={16} />} label="Tipo de usuario" value={userTypeLabel} />
                {user.workplace && (
                  <InfoRow icon={<Briefcase size={16} />} label="Centro de trabajo" value={user.workplace} />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-primary-navy flex items-center gap-2">
            <KeyRound size={18} />
            Cambiar Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onSavePassword)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="old_password">Contraseña actual</Label>
                <Input
                  id="old_password"
                  type="password"
                  autoComplete="current-password"
                  {...passwordForm.register('old_password', { required: true })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new_password">Nueva contraseña</Label>
                <Input
                  id="new_password"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register('new_password', { required: true, minLength: 8 })}
                />
                {passwordForm.formState.errors.new_password?.type === 'minLength' && (
                  <p className="text-xs text-red-500">Mínimo 8 caracteres</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm_password">Confirmar contraseña</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register('confirm_password', { required: true })}
                />
                {passwordForm.formState.errors.confirm_password && (
                  <p className="text-xs text-red-500">
                    {passwordForm.formState.errors.confirm_password.message ?? 'Campo requerido'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={savingPassword}
                className="bg-primary-navy hover:bg-primary-navy/90 text-white"
              >
                {savingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
