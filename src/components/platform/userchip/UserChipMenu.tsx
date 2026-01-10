import { Avatar } from "primereact/avatar"
import { Badge } from "primereact/badge"
import { Menu } from "primereact/menu"
import type { MenuItem } from "primereact/menuitem"
import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import routes from '../../../routes/paths'

import type { User } from '@/types/users/auth'

interface UserChipMenuProps {
  user: User;
  onLogout: () => void;
}

export const UserChipMenu = ({ user, onLogout }: UserChipMenuProps) => {
    const menu = useRef<Menu>(null);
    const userRouter = useNavigate();

    const menuItems: MenuItem[] = [
        {
            label: 'Perfil',
            icon: 'pi pi-fw pi-user',
            command: () => userRouter(routes.profile)
        },
        {
            label: 'Notificaciones',
            icon: 'pi pi-bell',
            command: () => { console.log("Settings") }
        },
        {
            label: 'Mis Trámites',
            icon: 'pi pi-fw pi-file',
            command: () => userRouter(routes.procedures.root)
        },
        {
            label: 'Salir',
            icon: 'pi pi-fw pi-sign-out',
            command: onLogout // Usar la función de logout del contexto
        },
    ];

    // Añadir el item de Administrar solo si el usuario es admin
    if (user.is_staff) {
        menuItems.push({
            label: 'Administrar',
            icon: 'pi pi-cog',
            command: () => userRouter(routes.admin.root)
        });
    }

    const displayName = user.first_name || user.email || 'Usuario';

    return <div className="flex justify-center items-center gap-2 rounded-full max-h-[60px] ring-1 ring-blue-950/30 border-secondary/65 bg-primary-100 px-1 py-1">
        <Avatar shape="circle" className="p-overlay-badge" size="normal" label={displayName.charAt(0).toUpperCase()} icon="pi pi-user">
            <Badge value="" severity="danger" />
        </Avatar>
        <span className="text-sm text-gray-500">{displayName}</span>
        <button onClick={(event) => menu.current?.toggle(event)} className="cursor-pointer flex justify-center items-center rounded-full hover:bg-gray-400/30 transition-all duration-300 ease-in-out p-1">
            <i className="pi pi-angle-down"></i>
        </button>
        <Menu className="menu-navbar" model={menuItems} ref={menu} popup={true} id="popup_menu" />
    </div>
}