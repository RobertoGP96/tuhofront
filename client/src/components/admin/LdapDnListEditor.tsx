import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LdapDnListEditorProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function LdapDnListEditor({
  value,
  onChange,
  placeholder,
  disabled,
}: LdapDnListEditorProps) {
  const [draft, setDraft] = useState('');

  const handleAdd = () => {
    const dn = draft.trim();
    if (!dn || value.includes(dn)) return;
    onChange([...value, dn]);
    setDraft('');
  };

  const handleRemove = (dn: string) => {
    onChange(value.filter((x) => x !== dn));
  };

  return (
    <div className="space-y-2">
      {value.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Sin DNs definidos.</p>
      ) : (
        <ul className="space-y-1">
          {value.map((dn) => (
            <li
              key={dn}
              className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1"
            >
              <code className="flex-1 text-xs break-all">{dn}</code>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:bg-red-50"
                onClick={() => handleRemove(dn)}
                disabled={disabled}
                title="Eliminar"
              >
                <Trash2 size={13} />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          placeholder={placeholder ?? 'cn=...,ou=groups,dc=uho,dc=edu,dc=cu'}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          disabled={disabled}
        />
        <Button type="button" onClick={handleAdd} disabled={disabled || !draft.trim()}>
          <Plus size={14} className="mr-1" />
          Añadir
        </Button>
      </div>
    </div>
  );
}
