
import React, { useState } from "react";
import type { NoteState } from "../../../../types/internal/general";
import type { TransportProcedure } from "../../../../types/internal/transport";
import TransportComponent from "../../../../components/internal/TransportComponent";
import useDepartment from "../../../../hooks/general/use-department";
import useArea from "../../../../hooks/general/use-area";

export const Transport: React.FC = () => {

    const [procedure, setProcedure]= useState<TransportProcedure>({    id: 0,
    state: "PENDIENTE",
    user: null,
    department: { id: 0, name: "", area: null },
    area: { id: 0, name: "" },
    notes: [],
    nombre_tramite: "Tramite de Transporte",
    procedure_type: null,
    departure_time: new Date().toISOString(),
    return_time: new Date().toISOString(),
    departure_place: "",
    return_place: "",
    passengers: 1,
    description: "",
    plate: "",
    round_trip: false,
    document: ""
})

    const [procedures, setProcedures]= useState<TransportProcedure[]>([])
    
    const handleState=(state: string)=>{
        setProcedure({...procedure, state: state as NoteState})
    }
    const { areas } = useArea();
    const { departments } = useDepartment();
    return <section className="secretary flex flex-col flex-nowrap gap-2 backdrop-blur-2xl justify-start items-center pb-10 grow w-full border-t-2  border-gray-300 px-[15%] pt-8">
        <TransportComponent mode="form" procedure={procedure} setProcedures={setProcedures}  areas={areas} departments={departments} onStateChange={handleState}/>
    </section>
}