import { useState } from "react"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { IconField } from "primereact/iconfield"
import { InputIcon } from "primereact/inputicon"
import { InputText } from "primereact/inputtext"
import { usersList } from "../../example/users"
import { Button } from "primereact/button"
import { ToggleButton, type ToggleButtonChangeEvent } from "primereact/togglebutton"

export const UsersAdmin: React.FC = () => {
    const [editMode, setEditMode] = useState<boolean>(false);

    const header = () => {


        return (
            <div className="flex flex-row justify-between items-center w-full">
                <div className="flex flex-row gap-2 items-center">
                    <Button icon="pi pi-plus " className="btn-primary" label="Registrar Usuario" />
                    <ToggleButton checked={editMode} onChange={(e: ToggleButtonChangeEvent) => setEditMode(e.value)} offIcon="pi pi-pencil" onIcon="pi pi-times" offLabel="Editar" className="-button-text" onLabel="Dejar de Editar" />
                </div>

                <div className="flex flex-row gap-2 items-center">
                    <Button icon="pi pi-filter" className="btn-secondary border-2" label="Filtros" />
                    <IconField iconPosition="left">
                        <InputIcon className="pi pi-search" />
                        <InputText placeholder="Buscar Usuario" />
                    </IconField>
                </div>
            </div>
        );
    }

    const firstColumn = () => {
        return <div className="pl-3 w-7">
            <i className="pi pi-user"></i>
        </div>
    }

    const ActionBody = () => {
        return <div className="flex flex-row gap-2 items-center justify-center w-5/10 p-0 text-gray-500">
            <button className="cursor-pointer hover:text-primary"><i className="pi pi-eye"></i></button>
            <button className=" cursor-pointer hover:text-primary"><i className="pi pi-asterisk"></i></button>
            <button className="cursor-pointer hover:text-primary"><i className="pi pi-pencil"></i></button>
            <button className="cursor-pointer hover:text-primary"><i className="pi pi-trash"></i></button>
        </div>
    }

    return (
        <section className="user-admin bg-white w-full h-full flex flex-col flex-1 overflow-x-hidden">
            <DataTable
                className="users-table w-full h-full flex-1 border border-gray-300 rounded-sm"
                value={usersList}
                paginator
                rows={15}
                dataKey="id"
                header={header}
                emptyMessage="No hay registrado nigún usuario."
                scrollable
                scrollHeight="flex"
            >
                <Column body={firstColumn} style={{width: "60px"}} />
                <Column field="name" header="Nombre" />
                <Column field="lastname" header="Apellidos" />
                <Column field="cid" header="Carnet" />
                <Column field="email" header="Correo" style={{ width: "10%" }} />
                <Column field="role" header="Rol" />
                <Column field="status" header="Estado" />
                <Column field="createdAt" header="Fecha de Registro" />
                {
                    editMode &&
                    <Column header="Acciones" body={ActionBody} />
                }
            </DataTable>
        </section>
    );
}