import { ChipAdminInfo } from "./ChipAdminInfo"

export const DashboardAdmin: React.FC = () => {
    return <section className="dashboard-admin w-full">
        <ChipAdminInfo label="Usuarios" cuantity="200" icon="bx bx-user bx-lg"/>
        <ChipAdminInfo label="Tramites" cuantity="1200" icon="bx bx-pencil bx-lg"/>
        <ChipAdminInfo label="Procesados" cuantity="700" icon="bx bx-file bx-lg"/>
        <ChipAdminInfo label="Completados" cuantity="500" icon="bx bx-check bx-lg"/>
        <div className="charts bg-amber-100 w-full h-full">
        </div>
    </section>
}