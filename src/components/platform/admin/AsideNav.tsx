import type { UserRole } from '@/types/user';
import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../context/auth';
import routes from '../../../routes/paths';
import "./AsideNav.css";

// Helper function to get role display name
const getRoleDisplayName = (role?: UserRole): string => {
    const roleMap: Record<UserRole, string> = {
        'ADMIN': 'Administrador',
        'STUDENT': 'Estudiante',
        'PROFESSOR': 'Profesor',
        'STAFF': 'Personal',
        'INTERNAL': 'Usuario Interno'
    };
    return role ? roleMap[role] : 'Usuario';
};

// Menu items configuration
const getMenuItems = (userRole: UserRole | undefined, navigate: (path: string) => void): MenuItem[] => {
    // Base menu items available to all authenticated users
    const baseItems: MenuItem[] = [
        {
            label: "Dashboard",
            icon: "pi pi-objects-column",
            command: () => { navigate(routes.admin.dashboard) }
        }
    ];

    // Admin-only menu items
    const adminItems: MenuItem[] = [
        {
            label: "Noticias",
            icon: "pi pi-file-edit",
            command: () => { navigate(routes.admin.news) },
            visible: userRole === 'ADMIN'
        },
        {
            label: "Usuarios",
            icon: "pi pi-users",
            command: () => { navigate(routes.admin.users) },
            visible: userRole === 'ADMIN'
        },
        {
            label: "Roles",
            icon: "pi pi-shield",
            command: () => { navigate(routes.admin.roles) },
            visible: userRole === 'ADMIN'
        },
        {
            label: "Correo",
            icon: "pi pi-envelope",
            command: () => { navigate(routes.admin.email) },
            visible: userRole === 'ADMIN'
        },
        {
            label: "Estructura",
            icon: "pi pi-sitemap",
            command: () => { navigate(routes.admin.structure) },
            visible: userRole === 'ADMIN' || userRole === 'STAFF'
        },
        {
            label: "Trámites",
            icon: "pi pi-copy",
            command: () => { navigate(routes.admin.procedures) },
            visible: userRole === 'ADMIN' || userRole === 'STAFF' || userRole === 'INTERNAL'
        }
    ].filter(item => item.visible !== false);

    // Secretary menu items
    const secretaryItems: MenuItem[] = [
        {
            label: "Trámites",
            icon: "pi pi-file-edit",
            command: () => { navigate(routes.admin.secretary.procedures) }
        },
        {
            label: "Personal",
            icon: "pi pi-users",
            command: () => { navigate(routes.admin.secretary.personal) }
        },
        {
            label: "Configuración",
            icon: "bx bx-cog",
            command: () => { navigate(routes.admin.secretary.config) }
        }
    ];

    // Internal menu items
    const internalItems: MenuItem[] = [
        {
            label: "Trámites",
            icon: "bx bx-restaurant",
            command: () => { navigate(routes.admin.internal.procedures) }
        },
        {
            label: "Personal",
            icon: "pi pi-users",
            command: () => { navigate(routes.admin.internal.personal) }
        },
        {
            label: "Configuración",
            icon: "bx bx-cog",
            command: () => { navigate(routes.admin.internal.config) }
        }
    ];

    // Build menu based on user role
    const menuItems: MenuItem[] = [
        {
            label: "General",
            items: [...baseItems, ...(userRole === 'ADMIN' || userRole === 'STAFF' ? adminItems : [])]
        }
    ];

    // Add Secretary section for ADMIN and STAFF roles
    if (userRole === 'ADMIN' || userRole === 'STAFF') {
        menuItems.push(
            { separator: true },
            {
                label: "Secretaría",
                items: secretaryItems
            }
        );
    }

    // Add Internal section for ADMIN and INTERNAL roles
    if (userRole === 'ADMIN' || userRole === 'INTERNAL') {
        menuItems.push(
            { separator: true },
            {
                label: "Internos",
                items: internalItems
            }
        );
    }

    // For STUDENT and PROFESSOR roles, only show basic items
    if (userRole === 'STUDENT' || userRole === 'PROFESSOR') {
        return [
            {
                label: "Menú Principal",
                items: baseItems
            }
        ];
    }

    return menuItems;
};

export const AsideNav: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userRole = user?.user_type as UserRole | undefined;
    
    const items = getMenuItems(userRole, navigate);
    const roleDisplayName = getRoleDisplayName(userRole);

    return (
        <aside className="flex flex-col gap-2 p-2 h-full">
            <div className="flex flex-row gap-2 p-2 border-b-2 border-gray-200">
                <Avatar 
                    icon={userRole === 'ADMIN' ? 'pi pi-shield' : 
                          userRole === 'STAFF' ? 'pi pi-users' : 
                          userRole === 'PROFESSOR' ? 'pi pi-user-edit' : 'pi pi-user'}
                    size="large"
                    className="bg-primary text-white"
                />
                <div className="w-3/4 flex flex-col justify-center items-start p-1 overflow-hidden">
                    <span className="text-sm font-bold truncate w-full">
                        {user?.first_name} {user?.last_name}
                    </span>
                    <span className="text-gray-600 text-xs font-medium">
                        {roleDisplayName}
                    </span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <Menu 
                    className="aside-admin w-full" 
                    model={items} 
                    style={{ width: '100%' }}
                />
            </div>
        </aside>
    );
};