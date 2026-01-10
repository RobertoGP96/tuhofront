import { Menubar } from "primereact/menubar";
import type { MenuItem } from "primereact/menuitem";
import "./NavBar.css";

import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import routes from '../../../routes/paths';
import { UserChipMenu } from "../userchip/UserChipMenu";

export const NavBar = () => {
  const [active, setActive] = useState<string>("home");
  const RouterApp = useNavigate();
  const location = useLocation();

  // Actualizar el estado active basado en la ruta actual
  useEffect(() => {
    const path = location.pathname;
    if (path === routes.home) {
      setActive("home");
    } else if (path === routes.news) {
      setActive("news");
    } else if (path === routes.support) {
      setActive("contact");
    } else if (path.startsWith("/secretary/") || path.startsWith(routes.procedures.internal.root)) {
      setActive("procedures");
    } else {
      setActive("");
    }
  }, [location.pathname]);

  const items: MenuItem[] = [
    {
      label: "Inicio",
      icon: "bx bx-home bx-sm",
      className: active === "home" ? "active" : "",
      command: () => { 
        setActive("home");
        RouterApp(routes.home);
      }
    },
    {
      label: "Noticias",
      icon: "bx bx-news bx-sm",
      className: active === "news" ? "active" : "",
      command: () => { 
        setActive("news");
        RouterApp(routes.news);
      }
    },
    {
      label: "Trámites",
      icon: "bx bx-edit bx-sm",
      className: active === "procedures" ? "active" : "",
            items: [
            {
              label: "Internos",
              icon: "bx bx-plus bx-sm",
              items: [
                { 
                  label: "Alimentacion", 
                  icon: "bx bx-restaurant bx-sm",
                  command: () => { 
                    setActive("procedures");
                    RouterApp(`${routes.procedures.internal.root}/procedures/feeding`);
                  }
                },
                { 
                  label: "Hospedaje", 
                  icon: "bx bxs-hotel bx-sm",
                  command: () => { 
                    setActive("procedures");
                    RouterApp(`${routes.procedures.internal.root}/procedures/accommodation`);
                  }
                },
                { 
                  label: "Transporte", 
                  icon: "bx bxs-bus bx-sm",
                  command: () => { 
                    setActive("procedures");
                    RouterApp(`${routes.procedures.internal.root}/procedures/transport`);
                  }
                },
                { 
                  label: "Mantenimiento", 
                  icon: "bx bxs-wrench bx-sm",
                  command: () => { 
                    setActive("procedures");
                    RouterApp(`${routes.procedures.internal.root}/procedures/maintenance`);
                  }
                },
              ],
            },
        {
          label: "Secretaría Docente",
          icon: "bx bx-book bx-sm",
          items: [
            {
              label: "Pregrado",
              icon: "bx bxs-graduation bx-sm",
              items: [
                { 
                  label: "Nacional", 
                  icon: "bx bx-globe bx-sm", 
                  command: () => { 
                    setActive("procedures");
                    RouterApp(routes.procedures.secretary.undernat);
                  } 
                },
                { 
                  label: "Internacional", 
                  icon: "bx bx-send bx-sm", 
                  command: () => { 
                    setActive("procedures");
                    RouterApp(routes.procedures.secretary.underinter);
                  } 
                }
              ]
            },
            {
              label: "Postgrado",
              icon: "bx bx-briefcase bx-sm",
              items: [
                { 
                  label: "Nacional", 
                  icon: "bx bx-globe bx-sm", 
                  command: () => { 
                    setActive("procedures");
                    RouterApp(routes.procedures.secretary.postnat);
                  } 
                },
                { 
                  label: "Internacional", 
                  icon: "bx bx-send bx-sm", 
                  command: () => { 
                    setActive("procedures");
                    RouterApp(routes.procedures.secretary.postinter);
                  } 
                }
              ]
            },
            {
              label: "Legalización de Título",
              icon: "bx bxs-certification bx-sm",
              command: () => { 
                  setActive("procedures");
                  RouterApp(routes.procedures.secretary.legaliz);
                }
            }
          ],
        },
        {
          label: "Locales",
          icon: "bx bx-desktop bx-sm",
          items: [
            {
              label: "Aulas Especializadas",
              icon: "bx bx-building bx-sm"
            },
            {
              label: "Laboratorios",
              icon: "bx bxs-flask bx-sm"
            },
          ],
        },
      ],
    },

    {
      label: "Contactenos",
      icon: "bx bx-support bx-sm",
      className: active === "contact" ? "active" : "",
      command: () => { 
        setActive("contact");
        RouterApp(routes.support);
      }
    },
  ];
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white max-h-[65px] ">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto h-full">
        <a
          href="https://www.uho.edu.cu/"
          className="flex items-center space-x-6 rtl:space-x-reverse"
        >
          <img
            src="/img/logo/svg/IdUHo.svg"
            className="h-11 aspect-auto"
            alt="Flowbite Logo"
          />
        </a>
        <div>
          <Menubar className="menu-navbar menu-adapt" model={items} />
        </div>
        <div className="flex flex-row gap-2 justify-center items-center">
          {isAuthenticated && user ? (
            <UserChipMenu user={user} onLogout={logout} />
          ) : (
            <>
              <NavLink to={routes.login}>
                <p className="text-sm font-bold">Inicia sesión</p>
              </NavLink>
              <p>o</p>
              <NavLink to={routes.register}>
                <p className="text-sm text-primary font-bold m-0">
                  Regístrate
                </p>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
