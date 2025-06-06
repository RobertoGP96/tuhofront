import { Avatar } from "primereact/avatar"
import { Menu } from "primereact/menu"
import type { MenuItem } from "primereact/menuitem"
import { useNavigate } from "react-router"
import "./AsideNav.css"
interface AsideNavProps {
  handleView: (view: string) => void;
}

export const AsideNav: React.FC<AsideNavProps> = ({ handleView }) => {
    const AdminRouter = useNavigate()
    const items: MenuItem[] = [
        {
            label: "General",
            items: [
                {
                    label: "Dashboard",
                    icon: "pi pi-objects-column",
                    command: () => { handleView("dashboard-admin") }
                },
                {
                    label: "Noticias",
                    icon: "pi pi-file-edit",
                    command: () => { handleView("users") }
                },
                {
                    label: "Usuarios",
                    icon: "pi pi-users",
                    command: () => { handleView("users-admin") }
                },
                {
                    label: "Roles",
                    icon: "pi pi-shield",
                    command: () => { handleView("rols-admin") }
                },
                {
                    label: "Correo",
                    icon: "pi pi-envelope",
                    command: () => { AdminRouter("admin-users") }
                },
                {
                    label: "Estructura",
                    icon: "pi pi-sitemap",
                    command: () => { handleView("structure-admin") }
                },
            ]
        },
        {
            label: "Secretaría",
            items: [
                {
                    label: "Trámites",
                    icon: "pi pi-file-edit",
                    command: () => { AdminRouter("/") }
                },
                {
                    label: "Personal",
                    icon: "pi pi-users",
                },
            ]
        },
        {
            label: "Internos",
            items: [
                {
                    label: "Alimentación",
                    icon: "bx bx-restaurant",
                    command: () => { AdminRouter("/") }
                },
                {
                    label: "Hospedaje",
                    icon: "bx bx-hotel",
                },
                {
                    label: "Transporte",
                    icon: "bx bxs-truck",
                },
                {
                    label: "Mantenimiento",
                    icon: "bx bxs-wrench",
                },
            ]
        }

    ]

    return <aside className="flex flex-col gap-2 p-2">
        <div className="flex flex-row gap-2 p-2 border-b-2 border-gray-200">
            <Avatar icon="bx bxs-hard-hat" size="large" />
            <div className="w-3/4 flex flex-col justify-center items-start p-1">
                <span className="text-sm font-bold">
                    {"Admin Name"}
                </span>
                <span className="text-gray-400 text-sm">
                    {"Role"}
                </span>
            </div>
        </div>
        <Menu className="aside-admin" model={items} style={{ maxWidth: "200px" }} />
    </aside>
}