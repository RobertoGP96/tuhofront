import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Search, Users, Edit, Power, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService } from '@/services/admin.service';
import type { User } from '@/types/auth.types';
import { EditUserDialog } from './EditUserDialog';

const USER_TYPE_LABELS: Record<string, string> = {
  ESTUDIANTE: 'Estudiante',
  PROFESOR: 'Profesor',
  TRABAJADOR: 'Trabajador',
  EXTERNO: 'Externo',
  SECRETARIA_DOCENTE: 'Sec. Docente',
  ADMIN: 'Administrador',
};

const USER_TYPE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  SECRETARIA_DOCENTE: 'bg-blue-100 text-blue-800 border-blue-200',
  PROFESOR: 'bg-teal-100 text-teal-800 border-teal-200',
  TRABAJADOR: 'bg-orange-100 text-orange-800 border-orange-200',
  ESTUDIANTE: 'bg-sky-100 text-sky-800 border-sky-200',
  EXTERNO: 'bg-gray-100 text-gray-800 border-gray-200',
};

const PAGE_SIZE = 20;

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-36" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><Skeleton className="h-5 w-8" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Parameters<typeof adminService.getUsers>[0] = { page };
      if (debouncedSearch) params.search = debouncedSearch;
      if (userTypeFilter !== 'all') params.user_type = userTypeFilter;
      if (activeFilter !== 'all') params.is_active = activeFilter === 'active';

      const data = await adminService.getUsers(params);
      setUsers(data.results);
      setTotalCount(data.count);
    } catch {
      toast.error('Error al cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, userTypeFilter, activeFilter]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (setter: (val: string) => void) => (val: string) => {
    setter(val);
    setPage(1);
  };

  const handleToggleActive = async (user: User) => {
    setTogglingId(user.id);
    try {
      const updated = await adminService.updateUser(user.id, { is_active: !user.is_active });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(updated.is_active ? 'Usuario activado' : 'Usuario desactivado');
    } catch {
      toast.error('Error al cambiar el estado del usuario');
    } finally {
      setTogglingId(null);
    }
  };

  const handleEditOpen = (user: User) => {
    setEditingUser(user);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditingUser(null);
  };

  const handleUserSaved = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const displayName = (user: User) => {
    const full = [user.first_name, user.last_name].filter(Boolean).join(' ');
    return full || user.username;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Users className="text-primary-navy" size={28} />
          <div>
            <h1 className="text-3xl font-bold text-primary-navy">Gestion de Usuarios</h1>
            <p className="text-gray-500 text-sm">
              {totalCount > 0 ? `${totalCount} usuario${totalCount !== 1 ? 's' : ''} registrado${totalCount !== 1 ? 's' : ''}` : 'Sin usuarios'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre, email o carnet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={userTypeFilter} onValueChange={handleFilterChange(setUserTypeFilter)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tipo de usuario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
            <SelectItem value="PROFESOR">Profesor</SelectItem>
            <SelectItem value="TRABAJADOR">Trabajador</SelectItem>
            <SelectItem value="EXTERNO">Externo</SelectItem>
            <SelectItem value="SECRETARIA_DOCENTE">Sec. Docente</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
          </SelectContent>
        </Select>

        <Select value={activeFilter} onValueChange={handleFilterChange(setActiveFilter)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Listado de Usuarios</CardTitle>
          <CardDescription>Visualice y gestione los usuarios registrados en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Usuario</TableHead>
                <TableHead>Carnet</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Verificacion</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <SkeletonRows />
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-12">
                    No se encontraron usuarios con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="group">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-primary-navy leading-tight">
                          {displayName(user)}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {user.id_card || <span className="text-gray-300">—</span>}
                    </TableCell>
                    <TableCell>
                      {user.user_type ? (
                        <Badge
                          variant="outline"
                          className={USER_TYPE_COLORS[user.user_type] ?? 'bg-gray-100 text-gray-800'}
                        >
                          {USER_TYPE_LABELS[user.user_type] ?? user.user_type}
                        </Badge>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.is_active
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }
                      >
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Mail
                        size={16}
                        className={user.email_verified ? 'text-green-500' : 'text-gray-300'}
                        aria-label={user.email_verified ? 'Email verificado' : 'Email no verificado'}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                          title="Editar usuario"
                          onClick={() => handleEditOpen(user)}
                        >
                          <Edit size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${user.is_active
                            ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
                            : 'text-green-500 hover:bg-green-50 hover:text-green-600'
                          }`}
                          title={user.is_active ? 'Desactivar usuario' : 'Activar usuario'}
                          onClick={() => handleToggleActive(user)}
                          disabled={togglingId === user.id}
                        >
                          <Power size={15} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-2">
              <span className="text-sm text-gray-500">
                Pagina {page} de {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft size={15} />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Siguiente
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EditUserDialog
        user={editingUser}
        open={editOpen}
        onClose={handleEditClose}
        onSaved={handleUserSaved}
      />
    </div>
  );
}
