
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { IconField } from "primereact/iconfield"
import { InputIcon } from "primereact/inputicon"
import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button"
import { structureList } from "../../example/structure"

export const StructureAdmin: React.FC = () => {

    const header = () => {


        return (
            <div className="flex flex-row justify-between items-center w-full">
                <Button icon="pi pi-plus " className="btn-primary" label="Añadir" />


                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText placeholder="Buscar..." />
                </IconField>
            </div>
        );
    }

    const firstColumn = () => {
        return <div className="pl-3">
            <i className="pi pi-box"></i>
        </div>
    }

    const ActionBody = () => {
        return <div className="flex flex-row gap-2 items-start justify-start w-5/10 p-0 text-gray-500">
            <button className="cursor-pointer hover:text-primary"><i className="pi pi-pencil"></i></button>
            <button className="cursor-pointer hover:text-primary"><i className="pi pi-trash"></i></button>
        </div>
    }

    return (
        <section className="user-admin bg-white w-full h-full flex flex-col flex-1 overflow-x-hidden">
            <DataTable
                className="users-table w-full h-full flex-1 border border-gray-300 rounded-sm"
                value={structureList}
                paginator
                rows={15}
                dataKey="id"
                header={header}
                emptyMessage="No hay registrado nigún usuario."
                scrollable
                scrollHeight="flex"
            >
                <Column body={firstColumn} style={{ width: "50px" }} />
                <Column field="name" header="Nombre" style={{ width: "30%" }} />
                <Column field="createdAt" header="Fecha de Registro" style={{ width: "20%" }} />

                <Column header="Acciones" body={ActionBody} />
            </DataTable>
        </section>
    );
}