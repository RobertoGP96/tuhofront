import { AsideNav } from "../components/platform/admin/AsideNav"
import { useState } from "react";
import { UsersAdmin } from "../components/platform/admin/users/Users";
import { StructureAdmin } from "../components/platform/admin/structure/StructureAdmin";
import { RolesAdmin } from "../components/platform/admin/rols/Rols";
import { DashboardAdmin } from "../components/platform/admin/dashboard/Dashboard";


export const Admin: React.FC = () => {

    const [view, setView] = useState<string>("dashborad");

    const renderView = (component: string) => {
        switch (component) {
            case "users-admin":
                return <UsersAdmin />
            case "structure-admin":
                return <StructureAdmin />
            case "rols-admin":
                return <RolesAdmin />
            case "dashboard-admin":
                return <DashboardAdmin />
            default:
                break;
        }
    }

    return <section className="admin min-h-screen bg-white w-full border-t-2  border-gray-300">
        <AsideNav handleView={setView} />
        <div className="bg-white-300 border-l-2 border-gray-400/35 p-5">
            <div className=" w-full h-full">
                {renderView(view)}
            </div>
        </div>
    </section>
}