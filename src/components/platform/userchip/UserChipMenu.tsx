import { Avatar } from "primereact/avatar"
import { Badge } from "primereact/badge"
import { Menu } from "primereact/menu"
import type { MenuItem } from "primereact/menuitem"
import { useRef } from "react"
import { useNavigate } from "react-router"


type user = {
    name: string,
    last: string,
    email: string,
    phone: string,
    id: string,
    addres: string,
    role: string
}

export const UserChipMenu = ({ user }: { user: user }) => {
    const menu = useRef<Menu>(null);
    const userRouter = useNavigate();
    const menuItems: MenuItem[] = [
        {
            label: 'Perfil',
            icon: 'pi pi-fw pi-user',
            command: () => userRouter("/porfile")
        },
        {
            label: 'Notificaciones',
            icon: 'pi pi-bell',
            command: () => { console.log("Settings") }
        },
        {
            label: 'Mis Trámites',
            icon: 'pi pi-fw pi-file',
            command: () => userRouter("/procedures")
        },
        {
            label: 'Salir',
            icon: 'pi pi-fw pi-sign-out',
            command: () => { console.log("Logout") }
        },
        {
            label: 'Administrar',
            icon: 'pi pi-cog',
            command: () => userRouter("/admin")
        },
    ];
    return <div className="flex justify-center items-center gap-2 rounded-full max-h-[60px] border-4 border-secondary/65 bg-primary-100 px-1 py-1">
        <Avatar shape="circle" className="p-overlay-badge" size="normal" label={user.name.charAt(0)} icon={user ? "pi pi-user" : ""}>
            <Badge value="" severity="danger" />
        </Avatar>
        <span className="text-sm text-gray-500">{user.name}</span>
        <button onClick={(event) => menu.current?.toggle(event)} className="cursor-pointer flex justify-center items-center rounded-full hover:bg-gray-400/30 transition-all duration-300 ease-in-out p-1">
            <i className="pi pi-angle-down"></i>
        </button>
        <Menu className="menu-navbar" model={menuItems} ref={menu} popup={true} id="popup_menu" />
    </div>
}