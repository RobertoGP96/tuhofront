
import React, { useState } from "react";
import FeedingComponent from "../../../../components/internal/FeedingComponent";
import useDepartment from "../../../../hooks/general/use-department";
import useArea from "../../../../hooks/general/use-area";
import type { FeedingProcedure } from "../../../../types/internal/feeding";
import type { NoteState } from "../../../../types/internal/general";
import { useFeedingProcedures } from "../../../../hooks/internal";

export const Feeding: React.FC = () => {

    const [procedure, setProcedure]= useState<FeedingProcedure>({    id: 0,
    state: "PENDIENTE",
    user: null,
    department: { id: 0, name: "", area: null },
    area:{ id: 0, name: "" },
    notes: [],
    nombre_tramite: "Trámite de Alimentación",
    feeding_type: "A",
    start_day: new Date().toISOString().split('T')[0],
    end_day: new Date().toISOString().split('T')[0],
    description: "",
    ammount: 0,
    feeding_days: [],
    document: ""}) 
    const { refetch: refetchFeeding } = useFeedingProcedures();
    // setProcedures mantiene la firma esperada por FeedingComponent pero en realidad
    // fuerza un refetch del listado (no mantenemos estado local en esta página)
    const setProcedures = ((): React.Dispatch<React.SetStateAction<FeedingProcedure[]>> => {
        return (() => { void refetchFeeding(); }) as unknown as React.Dispatch<React.SetStateAction<FeedingProcedure[]>>;
    })();
    
    const handleState=(state: string)=>{
        setProcedure({...procedure, state: state as NoteState})
    }
    const { areas } = useArea();
    const { departments } = useDepartment();
    return <section className="secretary flex flex-col flex-nowrap gap-2 backdrop-blur-2xl justify-start items-center pb-10 grow w-full border-t-2  border-gray-300 px-[15%] pt-8">
        <FeedingComponent mode="form" procedure={procedure} setProcedures={setProcedures}  areas={areas} departments={departments} onStateChange={handleState}/>
    </section>
}