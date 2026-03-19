import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Settings, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { platformService } from '@/services/platform.service';
import type { NamedConfig } from '@/services/platform.service';

// --- Delete Confirmation Dialog ---

interface DeleteDialogProps {
  open: boolean;
  itemName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function DeleteDialog({ open, itemName, onClose, onConfirm }: DeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmar eliminacion</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Esta seguro de que desea eliminar <strong>{itemName}</strong>? Esta accion no se puede deshacer.
        </p>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={deleting}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Inline editable row ---

interface EditableRowProps {
  item: NamedConfig;
  onSave: (id: number, name: string) => Promise<void>;
  onDelete: (item: NamedConfig) => void;
}

function EditableRow({ item, onSave, onDelete }: EditableRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === item.name) {
      setEditing(false);
      setName(item.name);
      return;
    }
    setSaving(true);
    try {
      await onSave(item.id, trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(item.name);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0 group">
      {editing ? (
        <>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm flex-1"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-green-600 hover:bg-green-50 shrink-0"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            <Check size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:bg-gray-50 shrink-0"
            onClick={handleCancel}
            disabled={saving}
          >
            <X size={14} />
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-gray-800">{item.name}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-500 hover:bg-blue-50"
              title="Editar"
              onClick={() => setEditing(true)}
            >
              <Edit size={13} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:bg-red-50"
              title="Eliminar"
              onClick={() => onDelete(item)}
            >
              <Trash2 size={13} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// --- Config Section Card ---

interface ConfigSectionProps {
  title: string;
  items: NamedConfig[];
  loading: boolean;
  onAdd: (name: string) => Promise<void>;
  onSave: (id: number, name: string) => Promise<void>;
  onDelete: (item: NamedConfig) => void;
}

function ConfigSection({ title, items, loading, onAdd, onSave, onDelete }: ConfigSectionProps) {
  const [addValue, setAddValue] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);

  const handleAdd = async () => {
    const trimmed = addValue.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      await onAdd(trimmed);
      setAddValue('');
      setShowAddInput(false);
    } finally {
      setAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void handleAdd();
    if (e.key === 'Escape') {
      setShowAddInput(false);
      setAddValue('');
    }
  };

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base text-primary-navy">{title}</CardTitle>
        {!showAddInput && (
          <Button size="sm" variant="outline" onClick={() => setShowAddInput(true)}>
            <Plus size={14} className="mr-1" />
            Agregar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        {showAddInput && (
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Input
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 text-sm flex-1"
              placeholder="Nuevo nombre..."
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-600 hover:bg-green-50 shrink-0"
              onClick={() => void handleAdd()}
              disabled={adding || !addValue.trim()}
            >
              <Check size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:bg-gray-50 shrink-0"
              onClick={() => { setShowAddInput(false); setAddValue(''); }}
              disabled={adding}
            >
              <X size={14} />
            </Button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2 py-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Sin elementos registrados.</p>
        ) : (
          items.map((item) => (
            <EditableRow key={item.id} item={item} onSave={onSave} onDelete={onDelete} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

// --- Main Page ---

export default function AdminSettings() {
  const [transportTypes, setTransportTypes] = useState<NamedConfig[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<NamedConfig[]>([]);
  const [priorities, setPriorities] = useState<NamedConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    section: 'transport' | 'maintenance' | 'priority';
    item: NamedConfig;
  } | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tt, mt, pr] = await Promise.all([
        platformService.getTransportTypes(),
        platformService.getMaintenanceTypes(),
        platformService.getMaintenancePriorities(),
      ]);
      setTransportTypes(tt);
      setMaintenanceTypes(mt);
      setPriorities(pr);
    } catch {
      toast.error('Error al cargar la configuracion');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  // Transport handlers
  const handleAddTransport = async (name: string) => {
    const created = await platformService.createTransportType({ name });
    setTransportTypes((prev) => [...prev, created]);
    toast.success('Tipo de transporte creado');
  };

  const handleSaveTransport = async (id: number, name: string) => {
    const updated = await platformService.updateTransportType(id, { name });
    setTransportTypes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    toast.success('Tipo de transporte actualizado');
  };

  // Maintenance type handlers
  const handleAddMaintenance = async (name: string) => {
    const created = await platformService.createMaintenanceType({ name });
    setMaintenanceTypes((prev) => [...prev, created]);
    toast.success('Tipo de mantenimiento creado');
  };

  const handleSaveMaintenance = async (id: number, name: string) => {
    const updated = await platformService.updateMaintenanceType(id, { name });
    setMaintenanceTypes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    toast.success('Tipo de mantenimiento actualizado');
  };

  // Priority handlers
  const handleAddPriority = async (name: string) => {
    const created = await platformService.createMaintenancePriority({ name });
    setPriorities((prev) => [...prev, created]);
    toast.success('Prioridad creada');
  };

  const handleSavePriority = async (id: number, name: string) => {
    const updated = await platformService.updateMaintenancePriority(id, { name });
    setPriorities((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    toast.success('Prioridad actualizada');
  };

  // Delete handler
  const requestDelete = (
    section: 'transport' | 'maintenance' | 'priority',
    item: NamedConfig
  ) => {
    setDeleteTarget({ section, item });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { section, item } = deleteTarget;
    if (section === 'transport') {
      await platformService.deleteTransportType(item.id);
      setTransportTypes((prev) => prev.filter((t) => t.id !== item.id));
      toast.success('Tipo de transporte eliminado');
    } else if (section === 'maintenance') {
      await platformService.deleteMaintenanceType(item.id);
      setMaintenanceTypes((prev) => prev.filter((t) => t.id !== item.id));
      toast.success('Tipo de mantenimiento eliminado');
    } else {
      await platformService.deleteMaintenancePriority(item.id);
      setPriorities((prev) => prev.filter((p) => p.id !== item.id));
      toast.success('Prioridad eliminada');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="text-primary-navy" size={28} />
        <div>
          <h1 className="text-3xl font-bold text-primary-navy">Configuracion del Sistema</h1>
          <p className="text-gray-500 text-sm">Administre los tipos y prioridades del sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ConfigSection
          title="Tipos de Transporte"
          items={transportTypes}
          loading={loading}
          onAdd={handleAddTransport}
          onSave={handleSaveTransport}
          onDelete={(item) => requestDelete('transport', item)}
        />

        <ConfigSection
          title="Tipos de Mantenimiento"
          items={maintenanceTypes}
          loading={loading}
          onAdd={handleAddMaintenance}
          onSave={handleSaveMaintenance}
          onDelete={(item) => requestDelete('maintenance', item)}
        />

        <ConfigSection
          title="Prioridades de Mantenimiento"
          items={priorities}
          loading={loading}
          onAdd={handleAddPriority}
          onSave={handleSavePriority}
          onDelete={(item) => requestDelete('priority', item)}
        />
      </div>

      <DeleteDialog
        open={deleteDialogOpen}
        itemName={deleteTarget?.item.name ?? ''}
        onClose={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
