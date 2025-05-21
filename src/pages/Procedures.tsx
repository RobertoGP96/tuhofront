import { DataTable } from "primereact/datatable";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import React, { useState } from "react";

export const Procedures: React.FC = () => {

    const header = () => {
        return (
            <div className="flex flex-row justify-end">
                
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText placeholder="Buscar trámite" />
                </IconField>
            </div>
        );
    }

    const [procedures, setProcedure] = useState<[]>([])

    return <section className="secretary flex flex-col flex-nowrap backdrop-blur-2xl justify-start items-center pb-10 grow w-full border-t-2  border-gray-300 px-[7%] pt-8">
        <div className="w-full bg-white p-4 text-xl flex flex-row gap-2 items-center text-secondary">
            <i className="bx bx-collection bx-md"></i> <h1 className="">Mis Trámites </h1>
        </div>
        <DataTable style={{ width: '100%', height: '100%' }} className="w-full" value={procedures} paginator rows={15} dataKey="id" header={header} emptyMessage="No tiene registrado nigún trámite.">

        </DataTable>
    </section>
}