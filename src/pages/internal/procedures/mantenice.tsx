
import React, { useState } from "react";
import type { NoteState } from "../../../types/internal/general";
import type { MaintanceProcedure } from "../../../types/internal/mantenice";
import MaintanceComponent from "../../../components/internal/MaintanceComponent";
import useDepartment from "../../../hooks/general/use-department";
import useArea from "../../../hooks/general/use-area";

export const Maintence: React.FC = () => {

    const [procedure, setProcedure] = useState<MaintanceProcedure>({
    state: "PENDIENTE", 
    user: null,
    department: { id: 0, name: "", area: null },
    area: { id: 0, name: "" },
    notes: [],
    nombre_tramite: "Tramite de Mantenimiento",
    procedure_type: null,
    priority: null,
    description: "",
    picture: null,
    document: ""
    })

    const [procedures, setProcedures] = useState<MaintanceProcedure[]>([])

    const handleState = (state: string) => {
        setProcedure({ ...procedure, state: state as NoteState })
    }
    const { areas } = useArea();
    const { departments } = useDepartment();
    return <section className="secretary flex flex-col flex-nowrap gap-2 backdrop-blur-2xl justify-start items-center pb-10 grow w-full border-t-2  border-gray-300 px-[15%] pt-8">
        <MaintanceComponent mode="form" procedure={procedure} setProcedures={setProcedures} areas={areas} departments={departments} onStateChange={handleState} />
    </section>
}