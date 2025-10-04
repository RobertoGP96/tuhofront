import { AsideNav } from "../components/platform/admin/AsideNav"
import { Outlet } from "react-router-dom"

export const Admin: React.FC = () => {
    return (
        <section className="admin min-h-screen bg-white w-full border-t-2  border-gray-300">
            <AsideNav />
            <div className="bg-white-300 border-l-2 border-gray-400/35 p-5 flex-1">
                <div className=" w-full h-full">
                    <Outlet />
                </div>
            </div>
        </section>
    )
}