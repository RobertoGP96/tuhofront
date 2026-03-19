import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Newspaper, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { platformService } from '@/services/platform.service';
import type { NewsItem, NewsCategory, NewsPayload } from '@/services/platform.service';

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'ACADEMIC', label: 'Academica' },
  { value: 'MANAGEMENT', label: 'Administrativa' },
  { value: 'STUDENT', label: 'Estudiantil' },
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'SPORTS', label: 'Deportiva' },
  { value: 'RESEARCH', label: 'Investigacion' },
  { value: 'EXTENSION', label: 'Extension Universitaria' },
];

const CATEGORY_COLORS: Record<NewsCategory, string> = {
  GENERAL: 'bg-gray-100 text-gray-700 border-gray-200',
  ACADEMIC: 'bg-blue-100 text-blue-700 border-blue-200',
  MANAGEMENT: 'bg-purple-100 text-purple-700 border-purple-200',
  STUDENT: 'bg-sky-100 text-sky-700 border-sky-200',
  CULTURAL: 'bg-pink-100 text-pink-700 border-pink-200',
  SPORTS: 'bg-orange-100 text-orange-700 border-orange-200',
  RESEARCH: 'bg-teal-100 text-teal-700 border-teal-200',
  EXTENSION: 'bg-green-100 text-green-700 border-green-200',
};

const PAGE_SIZE = 15;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface NewsFormData {
  title: string;
  category: NewsCategory;
  summary: string;
  body: string;
  is_published: boolean;
  featured: boolean;
  tags: string;
}

const EMPTY_FORM: NewsFormData = {
  title: '',
  category: 'GENERAL',
  summary: '',
  body: '',
  is_published: false,
  featured: false,
  tags: '',
};

function newsToForm(item: NewsItem): NewsFormData {
  return {
    title: item.title,
    category: item.category,
    summary: item.summary ?? '',
    body: item.body,
    is_published: item.is_published,
    featured: item.featured,
    tags: item.tags,
  };
}

// --- News Dialog ---

interface NewsDialogProps {
  open: boolean;
  initial: NewsFormData;
  dialogTitle: string;
  onClose: () => void;
  onSave: (data: NewsPayload) => Promise<void>;
}

function NewsDialog({ open, initial, dialogTitle, onClose, onSave }: NewsDialogProps) {
  const [form, setForm] = useState<NewsFormData>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial);
  }, [initial, open]);

  const set = <K extends keyof NewsFormData>(key: K, value: NewsFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        category: form.category,
        summary: form.summary.trim() || undefined,
        body: form.body.trim(),
        is_published: form.is_published,
        featured: form.featured,
        tags: form.tags.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="news-title">Titulo</Label>
            <Input
              id="news-title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Titulo de la noticia"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="news-category">Categoria</Label>
              <Select value={form.category} onValueChange={(v) => set('category', v as NewsCategory)}>
                <SelectTrigger id="news-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="news-tags">Etiquetas (separadas por coma)</Label>
              <Input
                id="news-tags"
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="universidad, noticias"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="news-summary">Resumen (opcional)</Label>
            <Input
              id="news-summary"
              value={form.summary}
              onChange={(e) => set('summary', e.target.value)}
              placeholder="Breve resumen de la noticia"
              maxLength={300}
            />
            <p className="text-xs text-gray-400 text-right">{form.summary.length}/300</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="news-body">Contenido</Label>
            <Textarea
              id="news-body"
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              placeholder="Contenido completo de la noticia..."
              rows={6}
              required
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => set('is_published', e.target.checked)}
                className="accent-primary-navy"
              />
              <span className="text-sm">Publicado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="accent-primary-navy"
              />
              <span className="text-sm">Destacado</span>
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !form.title.trim() || !form.body.trim()}>
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
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page ---

export default function AdminNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await platformService.getNews({ page, page_size: PAGE_SIZE });
      setNews(data.results);
      setTotalCount(data.count);
    } catch {
      toast.error('Error al cargar las noticias');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchNews();
  }, [fetchNews]);

  const handleSave = async (payload: NewsPayload) => {
    if (editingItem) {
      const updated = await platformService.updateNews(editingItem.id, payload);
      setNews((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      toast.success('Noticia actualizada');
    } else {
      const created = await platformService.createNews(payload);
      setNews((prev) => [created, ...prev]);
      setTotalCount((c) => c + 1);
      toast.success('Noticia creada');
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const requestDelete = (item: NewsItem) => {
    setDeleteTarget({ id: item.id, title: item.title });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await platformService.deleteNews(deleteTarget.id);
    setNews((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    setTotalCount((c) => c - 1);
    toast.success('Noticia eliminada');
    setDeleteTarget(null);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const getCategoryLabel = (cat: NewsCategory) =>
    CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Newspaper className="text-primary-navy" size={28} />
          <div>
            <h1 className="text-3xl font-bold text-primary-navy">Gestion de Noticias</h1>
            <p className="text-gray-500 text-sm">
              {totalCount > 0 ? `${totalCount} noticia${totalCount !== 1 ? 's' : ''}` : 'Sin noticias'}
            </p>
          </div>
        </div>
        <Button onClick={openAdd}>
          <Plus size={15} className="mr-1" />
          Nueva Noticia
        </Button>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-primary-navy">Listado de Noticias</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Titulo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-52" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-7 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : news.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400 py-12">
                    No hay noticias registradas.
                  </TableCell>
                </TableRow>
              ) : (
                news.map((item) => (
                  <TableRow key={item.id} className="group">
                    <TableCell>
                      <p className="font-medium text-gray-800 max-w-xs truncate">{item.title}</p>
                      {item.featured && (
                        <span className="text-xs text-amber-600 font-medium">Destacada</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={CATEGORY_COLORS[item.category]}
                      >
                        {getCategoryLabel(item.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={item.is_published
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'}
                      >
                        {item.is_published ? 'Publicada' : 'Borrador'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {item.publication_date
                        ? formatDate(item.publication_date)
                        : formatDate(item.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-blue-500 hover:bg-blue-50"
                          title="Editar"
                          onClick={() => openEdit(item)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400 hover:bg-red-50"
                          title="Eliminar"
                          onClick={() => requestDelete(item)}
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

          {!loading && totalPages > 1 && (
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

      <NewsDialog
        open={dialogOpen}
        initial={editingItem ? newsToForm(editingItem) : EMPTY_FORM}
        dialogTitle={editingItem ? 'Editar Noticia' : 'Nueva Noticia'}
        onClose={() => { setDialogOpen(false); setEditingItem(null); }}
        onSave={handleSave}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        itemName={deleteTarget?.title ?? ''}
        onClose={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
