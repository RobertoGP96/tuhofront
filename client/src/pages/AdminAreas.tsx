import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Building2, Edit, Plus, Trash2 } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
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
import { platformService } from '@/services/platform.service';
import type { Area, Department } from '@/services/platform.service';

// --- Department Dialog ---

interface DeptDialogProps {
  open: boolean;
  initial: string;
  title: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

function DeptDialog({ open, initial, title, onClose, onSave }: DeptDialogProps) {
  const [name, setName] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(initial);
  }, [initial, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onSave(trimmed);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="dept-name">Nombre</Label>
            <Input
              id="dept-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del departamento"
              required
              minLength={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Area Dialog ---

interface AreaDialogProps {
  open: boolean;
  initialName: string;
  initialDept: number | '';
  departments: Department[];
  title: string;
  onClose: () => void;
  onSave: (name: string, department: number) => Promise<void>;
}

function AreaDialog({ open, initialName, initialDept, departments, title, onClose, onSave }: AreaDialogProps) {
  const [name, setName] = useState(initialName);
  const [dept, setDept] = useState<number | ''>(initialDept);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(initialName);
    setDept(initialDept);
  }, [initialName, initialDept, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !dept) return;
    setSaving(true);
    try {
      await onSave(trimmed, dept as number);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="area-name">Nombre</Label>
            <Input
              id="area-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del area"
              required
              minLength={2}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="area-dept">Departamento</Label>
            <Select
              value={dept !== '' ? String(dept) : ''}
              onValueChange={(v) => setDept(Number(v))}
            >
              <SelectTrigger id="area-dept">
                <SelectValue placeholder="Seleccionar departamento" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !name.trim() || !dept}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page ---

export default function AdminAreas() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [deptFilter, setDeptFilter] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);

  // Department dialog state
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Area dialog state
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'dept' | 'area'; id: number; name: string } | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [depts, allAreas] = await Promise.all([
        platformService.getDepartments(),
        platformService.getAreas(),
      ]);
      setDepartments(depts);
      setAreas(allAreas);
    } catch {
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const filteredAreas = deptFilter === 'all'
    ? areas
    : areas.filter((a) => a.department === deptFilter);

  const getDeptName = (id: number) => departments.find((d) => d.id === id)?.name ?? String(id);

  // Department handlers
  const handleSaveDept = async (name: string) => {
    if (editingDept) {
      const updated = await platformService.updateDepartment(editingDept.id, { name });
      setDepartments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      toast.success('Departamento actualizado');
    } else {
      const created = await platformService.createDepartment({ name });
      setDepartments((prev) => [...prev, created]);
      toast.success('Departamento creado');
    }
  };

  const openEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptDialogOpen(true);
  };

  const openAddDept = () => {
    setEditingDept(null);
    setDeptDialogOpen(true);
  };

  // Area handlers
  const handleSaveArea = async (name: string, department: number) => {
    if (editingArea) {
      const updated = await platformService.updateArea(editingArea.id, { name, department });
      setAreas((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      toast.success('Area actualizada');
    } else {
      const created = await platformService.createArea({ name, department });
      setAreas((prev) => [...prev, created]);
      toast.success('Area creada');
    }
  };

  const openEditArea = (area: Area) => {
    setEditingArea(area);
    setAreaDialogOpen(true);
  };

  const openAddArea = () => {
    setEditingArea(null);
    setAreaDialogOpen(true);
  };

  // Delete handler
  const requestDelete = (type: 'dept' | 'area', id: number, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'dept') {
      await platformService.deleteDepartment(deleteTarget.id);
      setDepartments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setAreas((prev) => prev.filter((a) => a.department !== deleteTarget.id));
      toast.success('Departamento eliminado');
    } else {
      await platformService.deleteArea(deleteTarget.id);
      setAreas((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast.success('Area eliminada');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="text-primary-navy" size={28} />
        <h1 className="text-3xl font-bold text-primary-navy">Areas y Departamentos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departments */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-primary-navy">Departamentos</CardTitle>
            <Button size="sm" onClick={openAddDept}>
              <Plus size={15} className="mr-1" />
              Nuevo
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-7 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : departments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-gray-400 py-8">
                      No hay departamentos registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((dept) => (
                    <TableRow key={dept.id} className="group">
                      <TableCell className="font-medium text-gray-800">{dept.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-blue-500 hover:bg-blue-50"
                            title="Editar"
                            onClick={() => openEditDept(dept)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:bg-red-50"
                            title="Eliminar"
                            onClick={() => requestDelete('dept', dept.id, dept.name)}
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
        </Card>

        {/* Areas */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-primary-navy">Areas</CardTitle>
            <Button size="sm" onClick={openAddArea}>
              <Plus size={15} className="mr-1" />
              Nueva
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={deptFilter === 'all' ? 'all' : String(deptFilter)}
              onValueChange={(v) => setDeptFilter(v === 'all' ? 'all' : Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los departamentos</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead className="text-right w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-7 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredAreas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-400 py-8">
                      No hay areas registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAreas.map((area) => (
                    <TableRow key={area.id} className="group">
                      <TableCell className="font-medium text-gray-800">{area.name}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {area.department_name ?? getDeptName(area.department)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-blue-500 hover:bg-blue-50"
                            title="Editar"
                            onClick={() => openEditArea(area)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:bg-red-50"
                            title="Eliminar"
                            onClick={() => requestDelete('area', area.id, area.name)}
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
        </Card>
      </div>

      {/* Department Dialog */}
      <DeptDialog
        open={deptDialogOpen}
        initial={editingDept?.name ?? ''}
        title={editingDept ? 'Editar Departamento' : 'Nuevo Departamento'}
        onClose={() => { setDeptDialogOpen(false); setEditingDept(null); }}
        onSave={handleSaveDept}
      />

      {/* Area Dialog */}
      <AreaDialog
        open={areaDialogOpen}
        initialName={editingArea?.name ?? ''}
        initialDept={editingArea?.department ?? ''}
        departments={departments}
        title={editingArea ? 'Editar Area' : 'Nueva Area'}
        onClose={() => { setAreaDialogOpen(false); setEditingArea(null); }}
        onSave={handleSaveArea}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        itemName={deleteTarget?.name ?? ''}
        onClose={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
