import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// Componente principal de lista
const ItemList = ({
    apiEndpoint,
    CreateComponent,
    EditComponent,
    itemKeyExtractor = (item) => item.id,
    columns = []
}) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Cargar datos de la API
    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(apiEndpoint);
            if (!response.ok) throw new Error('Error al cargar los datos');
            const data = await response.json();
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [apiEndpoint]);

    // Handlers para CRUD
    const handleCreate = async (newItem) => {
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
            if (!response.ok) throw new Error('Error al crear');
            await fetchItems();
            setShowCreate(false);
        } catch (err) {
            alert('Error al crear: ' + err.message);
        }
    };

    const handleUpdate = async (updatedItem) => {
        try {
            const itemId = itemKeyExtractor(updatedItem);
            const response = await fetch(`${apiEndpoint}/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedItem)
            });
            if (!response.ok) throw new Error('Error al actualizar');
            await fetchItems();
            setShowEdit(false);
            setEditingItem(null);
        } catch (err) {
            alert('Error al actualizar: ' + err.message);
        }
    };

    const confirmDelete = (item) => {
        confirmDialog({
            message: '¿Estás seguro de eliminar este elemento?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => handleDelete(item)
        });
    };

    const handleDelete = async (item) => {
        try {
            const itemId = itemKeyExtractor(item);
            const response = await fetch(`${apiEndpoint}/${itemId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar');
            await fetchItems();
        } catch (err) {
            alert('Error al eliminar: ' + err.message);
        }
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setShowEdit(true);
    };

    // Template de acciones
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="p-button-info"
                    onClick={() => openEdit(rowData)}
                    tooltip="Editar"
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Eliminar"
                />
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <ProgressSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Message severity="error" text={error} className="w-full" />
                <Button
                    label="Reintentar"
                    icon="pi pi-refresh"
                    onClick={fetchItems}
                    className="mt-3"
                />
            </div>
        );
    }

    return (
        <div className="p-4">
            <ConfirmDialog />

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Lista de Elementos</h1>
                <Button
                    label="Crear Nuevo"
                    icon="pi pi-plus"
                    onClick={() => setShowCreate(true)}
                />
            </div>

            {/* Tabla de datos */}
            <DataTable
                value={items}
                dataKey={itemKeyExtractor}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage="No hay elementos para mostrar"
                className="p-datatable-striped"
            >
                {columns.map((col, index) => (
                    <Column
                        key={index}
                        field={col.field}
                        header={col.header}
                        sortable={col.sortable !== false}
                        body={col.body}
                    />
                ))}
                <Column
                    header="Acciones"
                    body={actionBodyTemplate}
                    exportable={false}
                    style={{ minWidth: '120px' }}
                />
            </DataTable>

            {/* Dialog de creación */}
            <Dialog
                header="Crear Elemento"
                visible={showCreate}
                style={{ width: '500px' }}
                onHide={() => setShowCreate(false)}
                modal
            >
                {CreateComponent && (
                    <CreateComponent
                        onSubmit={handleCreate}
                        onCancel={() => setShowCreate(false)}
                    />
                )}
            </Dialog>

            {/* Dialog de edición */}
            <Dialog
                header="Editar Elemento"
                visible={showEdit}
                style={{ width: '500px' }}
                onHide={() => {
                    setShowEdit(false);
                    setEditingItem(null);
                }}
                modal
            >
                {EditComponent && editingItem && (
                    <EditComponent
                        item={editingItem}
                        onSubmit={handleUpdate}
                        onCancel={() => {
                            setShowEdit(false);
                            setEditingItem(null);
                        }}
                    />
                )}
            </Dialog>
        </div>
    );
};

// Ejemplo de componente de creación con PrimeReact
const ExampleCreateForm = ({ onSubmit, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        if (!name.trim()) {
            alert('El nombre es requerido');
            return;
        }
        onSubmit({ name, description });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label htmlFor="name" className="font-semibold">
                    Nombre <span className="text-red-500">*</span>
                </label>
                <InputText
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ingresa el nombre"
                    className="w-full"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="description" className="font-semibold">
                    Descripción
                </label>
                <InputTextarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ingresa la descripción"
                    rows={4}
                    className="w-full"
                />
            </div>

            <div className="flex justify-end gap-2 mt-3">
                <Button
                    label="Cancelar"
                    icon="pi pi-times"
                    onClick={onCancel}
                    severity="secondary"
                    outlined
                />
                <Button
                    label="Crear"
                    icon="pi pi-check"
                    onClick={handleSubmit}
                />
            </div>
        </div>
    );
};

// Ejemplo de componente de edición con PrimeReact
const ExampleEditForm = ({ item, onSubmit, onCancel }) => {
    const [name, setName] = useState(item.name || '');
    const [description, setDescription] = useState(item.description || '');

    const handleSubmit = () => {
        if (!name.trim()) {
            alert('El nombre es requerido');
            return;
        }
        onSubmit({ ...item, name, description });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label htmlFor="edit-name" className="font-semibold">
                    Nombre <span className="text-red-500">*</span>
                </label>
                <InputText
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="edit-description" className="font-semibold">
                    Descripción
                </label>
                <InputTextarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full"
                />
            </div>

            <div className="flex justify-end gap-2 mt-3">
                <Button
                    label="Cancelar"
                    icon="pi pi-times"
                    onClick={onCancel}
                    severity="secondary"
                    outlined
                />
                <Button
                    label="Guardar"
                    icon="pi pi-check"
                    onClick={handleSubmit}
                />
            </div>
        </div>
    );
};

// Demo con datos de ejemplo
export default function App() {
    const [mockData, setMockData] = useState([
        { id: 1, name: 'Elemento 1', description: 'Descripción del elemento 1', status: 'Activo' },
        { id: 2, name: 'Elemento 2', description: 'Descripción del elemento 2', status: 'Inactivo' },
        { id: 3, name: 'Elemento 3', description: 'Descripción del elemento 3', status: 'Activo' },
        { id: 4, name: 'Elemento 4', description: 'Descripción del elemento 4', status: 'Activo' },
        { id: 5, name: 'Elemento 5', description: 'Descripción del elemento 5', status: 'Inactivo' }
    ]);

    const mockApiEndpoint = 'https://api.example.com/items';

    // Interceptar fetch para simular API
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
        if (url.startsWith(mockApiEndpoint)) {
            await new Promise(resolve => setTimeout(resolve, 500));

            if (!options || options.method === 'GET') {
                return {
                    ok: true,
                    json: async () => mockData
                };
            }

            if (options.method === 'POST') {
                const newItem = JSON.parse(options.body);
                const id = Math.max(...mockData.map(i => i.id), 0) + 1;
                const itemWithDefaults = { ...newItem, id, status: 'Activo' };
                setMockData([...mockData, itemWithDefaults]);
                return { ok: true, json: async () => itemWithDefaults };
            }

            if (options.method === 'PUT') {
                const updatedItem = JSON.parse(options.body);
                setMockData(mockData.map(item =>
                    item.id === updatedItem.id ? updatedItem : item
                ));
                return { ok: true, json: async () => updatedItem };
            }

            if (options.method === 'DELETE') {
                const id = parseInt(url.split('/').pop());
                setMockData(mockData.filter(item => item.id !== id));
                return { ok: true, json: async () => ({ success: true }) };
            }
        }
        return originalFetch(url, options);
    };

    // Definición de columnas para la tabla
    const columns = [
        { field: 'id', header: 'ID', sortable: true },
        { field: 'name', header: 'Nombre', sortable: true },
        { field: 'description', header: 'Descripción', sortable: true },
        {
            field: 'status',
            header: 'Estado',
            sortable: true,
            body: (rowData) => (
                <span className={`px-2 py-1 rounded text-sm ${rowData.status === 'Activo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {rowData.status}
                </span>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <ItemList
                apiEndpoint={mockApiEndpoint}
                CreateComponent={ExampleCreateForm}
                EditComponent={ExampleEditForm}
                itemKeyExtractor={(item) => item.id}
                columns={columns}
            />
        </div>
    );
}