import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { localsService } from '@/services/locals.service';
import type { LocalCreate, LocalListItem, LocalType } from '@/types/locals.types';
import { LocalFormDialog } from './LocalFormDialog';

const TYPE_COLORS: Record<LocalType, string> = {
  AULA: 'bg-blue-100 text-blue-700 border-blue-200',
  LABORATORIO: 'bg-purple-100 text-purple-700 border-purple-200',
  AUDITORIO: 'bg-amber-100 text-amber-700 border-amber-200',
  SALA_REUNIONES: 'bg-teal-100 text-teal-700 border-teal-200',
  BIBLIOTECA: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  GIMNASIO: 'bg-orange-100 text-orange-700 border-orange-200',
  CAFETERIA: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  OTRO: 'bg-gray-100 text-gray-700 border-gray-200',
};

function TypeBadge({ type, label }: { type: LocalType; label: string }) {
  return (
    <Badge variant="outline" className={cn('font-medium', TYPE_COLORS[type] ?? TYPE_COLORS.OTRO)}>
      {label}
    </Badge>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-6 w-14 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-14 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-7 w-20 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface DeleteConfirmDialogProps {
  open: boolean;
  name: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function DeleteConfirmDialog({ open, name, onClose, onConfirm }: DeleteConfirmDialogProps) {
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
          Esta seguro de que desea eliminar el local <strong>{name}</strong>? Esta accion no se puede deshacer.
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

export function LocalsTab() {
  const [locals, setLocals] = useState<LocalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<LocalType | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LocalListItem | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LocalListItem | null>(null);

  const fetchLocals = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (typeFilter !== 'all') params.local_type = typeFilter;
      if (activeFilter !== 'all') params.is_active = activeFilter === 'true';
      if (search.trim()) params.search = search.trim();
      const data = await localsService.getLocals(params as Parameters<typeof localsService.getLocals>[0]);
      setLocals(data.results);
    } catch {
      toast.error('Error al cargar los locales');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, activeFilter, search]);

  useEffect(() => {
    void fetchLocals();
  }, [fetchLocals]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (local: LocalListItem) => {
    setEditing(local);
    setFormOpen(true);
  };

  const requestDelete = (local: LocalListItem) => {
    setDeleteTarget(local);
    setDeleteOpen(true);
  };

  const handleSave = async (data: LocalCreate, id?: number) => {
    if (id !== undefined) {
      const updated = await localsService.updateLocal(id, data);
      setLocals((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
      toast.success('Local actualizado');
    } else {
      const created = await localsService.createLocal(data);
      setLocals((prev) => [...prev, created]);
      toast.success('Local creado');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await localsService.deleteLocal(deleteTarget.id);
    setLocals((prev) => prev.filter((l) => l.id !== deleteTarget.id));
    toast.success('Local eliminado');
    setDeleteTarget(null);
  };

  const handleToggleActive = async (local: LocalListItem) => {
    try {
      const updated = await localsService.updateLocal(local.id, { is_active: !local.is_active });
      setLocals((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
      toast.success(updated.is_active ? 'Local activado' : 'Local desactivado');
    } catch {
      toast.error('Error al actualizar el local');
    }
  };

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 flex-wrap">
        <CardTitle className="text-lg text-primary-navy">Locales</CardTitle>
        <Button size="sm" onClick={openAdd}>
          <Plus size={15} className="mr-1" />
          Nuevo Local
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Input
            className="max-w-xs"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as LocalType | 'all')}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="AULA">Aula</SelectItem>
              <SelectItem value="LABORATORIO">Laboratorio</SelectItem>
              <SelectItem value="AUDITORIO">Auditorio</SelectItem>
              <SelectItem value="SALA_REUNIONES">Sala de Reuniones</SelectItem>
              <SelectItem value="BIBLIOTECA">Biblioteca</SelectItem>
              <SelectItem value="GIMNASIO">Gimnasio</SelectItem>
              <SelectItem value="CAFETERIA">Cafeteria</SelectItem>
              <SelectItem value="OTRO">Otro</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={activeFilter}
            onValueChange={(v) => setActiveFilter(v as 'all' | 'true' | 'false')}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Activos</SelectItem>
              <SelectItem value="false">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-28">Codigo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-24">Capacidad</TableHead>
              <TableHead className="w-20">Activo</TableHead>
              <TableHead className="w-32">Req. Aprobacion</TableHead>
              <TableHead className="text-right w-28">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton />
            ) : locals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-gray-400">
                  No hay locales registrados.
                </TableCell>
              </TableRow>
            ) : (
              locals.map((local) => (
                <TableRow key={local.id} className="group">
                  <TableCell className="font-mono text-sm font-medium text-gray-600">
                    {local.code}
                  </TableCell>
                  <TableCell className="font-medium text-gray-800">{local.name}</TableCell>
                  <TableCell>
                    <TypeBadge type={local.local_type} label={local.local_type_display} />
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{local.capacity}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'cursor-pointer select-none',
                        local.is_active
                          ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                      )}
                      onClick={() => void handleToggleActive(local)}
                    >
                      {local.is_active ? 'Si' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        local.requires_approval
                          ? 'bg-orange-100 text-orange-700 border-orange-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }
                    >
                      {local.requires_approval ? 'Si' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-500 hover:bg-blue-50"
                        title="Editar"
                        onClick={() => openEdit(local)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:bg-red-50"
                        title="Eliminar"
                        onClick={() => requestDelete(local)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <LocalFormDialog
        open={formOpen}
        editing={editing}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        name={deleteTarget?.name ?? ''}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
