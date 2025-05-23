import { Calendar } from "primereact/calendar"
import { AsideNav } from "../components/platform/admin/AsideNav"
import type { Nullable } from "primereact/ts-helpers";
import { useState } from "react";


export const Admin: React.FC = () => {

    const [date, setDate] = useState<Nullable<Date>>();
    
    return <section className="admin min-h-screen bg-white w-full border-t-2  border-gray-300">
        <AsideNav />
        <div className="bg-white-300 border-l-2 border-gray-400/35 p-5">
            <div className=" w-full">
                <Calendar value={date} onChange={(e) => setDate(e.value)} inline/>
            </div>
        </div>
    </section>
}