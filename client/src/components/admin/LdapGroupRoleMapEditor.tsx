import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { USER_TYPE_OPTIONS, type UserRole } from '@/types/auth.types';

interface LdapGroupRoleMapEditorProps {
  value: Record<string, UserRole>;
  onChange: (next: Record<string, UserRole>) => void;
  disabled?: boolean;
}

export function LdapGroupRoleMapEditor({
  value,
  onChange,
  disabled,
}: LdapGroupRoleMapEditorProps) {
  const [newDn, setNewDn] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('USUARIO');

  const entries = Object.entries(value);

  const handleAdd = () => {
    const dn = newDn.trim();
    if (!dn) return;
    onChange({ ...value, [dn]: newRole });
    setNewDn('');
  };

  const handleRemove = (dn: string) => {
    const next = { ...value };
    delete next[dn];
    onChange(next);
  };

  const handleUpdateRole = (dn: string, role: UserRole) => {
    onChange({ ...value, [dn]: role });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Mapea el DN de un grupo LDAP al <code>user_type</code> que recibirán
        sus miembros. El primer grupo que coincida (en orden de inserción)
        define el rol. Si ninguno coincide se usa <em>rol por defecto</em>.
      </p>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Sin mapeos definidos.</p>
      ) : (
        <div className="space-y-2">
          {entries.map(([dn, role]) => (
            <div
              key={dn}
              className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2"
            >
              <code className="flex-1 text-xs break-all">{dn}</code>
              <Select
                value={role}
                onValueChange={(v) => handleUpdateRole(dn, v as UserRole)}
                disabled={disabled}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50"
                onClick={() => handleRemove(dn)}
                disabled={disabled}
                title="Eliminar"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 pt-2 border-t border-gray-100">
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-600">DN del grupo</label>
          <Input
            placeholder="cn=profesores,ou=groups,dc=uho,dc=edu,dc=cu"
            value={newDn}
            onChange={(e) => setNewDn(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Rol</label>
          <Select
            value={newRole}
            onValueChange={(v) => setNewRole(v as UserRole)}
            disabled={disabled}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
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
        <Button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !newDn.trim()}
        >
          <Plus size={14} className="mr-1" />
          Añadir
        </Button>
      </div>
    </div>
  );
}
