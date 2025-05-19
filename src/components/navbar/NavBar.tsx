import { Menubar } from "primereact/menubar";
import type { MenuItem } from "primereact/menuitem";
import "./NavBar.css";
import { Avatar } from "primereact/avatar";

import { NavLink, useNavigate } from "react-router";
import { useState } from "react";

export const NavBar = () => {
  const [active, setActive] = useState<string>("home")
  const RouterApp = useNavigate()
  const items: MenuItem[] = [
    {
      label: "Inicio",
      icon: "bx bx-home bx-sm",
      command: () => { RouterApp("/") }
    },
    {
      label: "Noticias",
      icon: "bx bx-news bx-sm",
      command: () => { RouterApp("/news") }
    },
    {
      label: "Trámites",
      icon: "bx bx-edit bx-sm",
      items: [
        {
          label: "Internos",
          icon: "bx bx-plus bx-sm",
          items: [
            { label: "Comedor", icon: "bx bx-restaurant bx-sm" },
            { label: "Transporte", icon: "bx bx-bus bx-sm" },
            { label: "Entrada", icon: "bx bx-log-in bx-sm" },
            { label: "Salida", icon: "bx bx-log-out bx-sm" },
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
                { label: "Nacional", icon: "bx bx-globe bx-sm" },
                { label: "Internacional", icon: "bx bx-send bx-sm" }
              ]
            },
            {
              label: "Postgrado",
              icon: "bx bx-briefcase bx-sm",
              items: [
                { label: "Nacional", icon: "bx bx-globe bx-sm" },
                { label: "Internacional", icon: "bx bx-send bx-sm" }
              ]
            }
          ],
        },
        {
          label: "Laboratorios",
          icon: "bx bx-desktop bx-sm",
          items: [
            {
              label: "Aulas especializadas",
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
      command: () => { RouterApp("/support") }
    },
  ];
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
          <Menubar model={items} />
        </div>
        <div className="flex flex-row gap-2 justify-center items-center">
          <Avatar shape="circle" icon="pi pi-user" />

          <NavLink to={"/login"}>
            <p className="text-sm">Inicia sesion</p>
          </NavLink>
          <p>o</p>
          <NavLink to={"/register"}>
            <p className="text-sm text-primary">
              Regístrate
            </p>
          </NavLink>

        </div>
      </div>
    </nav>
  );
};
