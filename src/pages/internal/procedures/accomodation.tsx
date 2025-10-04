
import React, { useState } from "react";
import type { NoteState } from "../../../types/internal/general";
import AccommodationComponent from "../../../components/internal/AccommodationComponent";
import type { AccommodationProcedure } from "../../../types/internal/accomodation";
import { useAccommodationProcedures } from "../../../hooks/internal";

export const Accomodation: React.FC = () => {

    const [procedure, setProcedure] = useState<AccommodationProcedure>({
        id: 0,
        state: "PENDIENTE",
        user: null,
        department: { id: 0, name: "", area: null },
        area: { id: 0, name: "" },
        notes: [],
        nombre_tramite: "Tramite de Alojamiento",
        accommodation_type: "A",
        start_day: new Date().toISOString().split('T')[0],
        end_day: new Date().toISOString().split('T')[0],
        description: "",
        guests: [],
        feeding_days: [],
        document: ""
    })

    const { refetch: refetchAccommodation } = useAccommodationProcedures();
    const setProcedures = ((): React.Dispatch<React.SetStateAction<AccommodationProcedure[]>> => {
        return (() => { void refetchAccommodation(); }) as unknown as React.Dispatch<React.SetStateAction<AccommodationProcedure[]>>;
    })();

    const handleState = (state: string) => {
        setProcedure({ ...procedure, state: state as NoteState })
    }
    return <section className="secretary flex flex-col flex-nowrap gap-2 backdrop-blur-2xl justify-start items-center pb-10 grow w-full border-t-2  border-gray-300 px-[15%] pt-8">
        <AccommodationComponent mode="form" procedure={procedure} setProcedures={setProcedures} areas={[]} departments={[]} onStateChange={handleState} />
    </section>
}