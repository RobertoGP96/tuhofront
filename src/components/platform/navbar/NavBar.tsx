import { Menubar } from "primereact/menubar";
import type { MenuItem } from "primereact/menuitem";
import "./NavBar.css";

import { NavLink, useNavigate } from "react-router";
import { useState } from "react";
import { UserChipMenu } from "../userchip/UserChipMenu";
import { ToggleButton, type ToggleButtonChangeEvent } from "primereact/togglebutton";

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
            { label: "Alimentacion", icon: "bx bx-restaurant bx-sm" },
            { label: "Hospedaje", icon: "bx bxs-hotel bx-sm" },
            { label: "Transporte", icon: "bx bxs-bus bx-sm" },
            { label: "Mantenimiento", icon: "bx bxs-wrench bx-sm" },
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
                { label: "Nacional", icon: "bx bx-globe bx-sm", command: () => { RouterApp("/secretary/undernat") } },
                { label: "Internacional", icon: "bx bx-send bx-sm", command: () => { RouterApp("/secretary/underinter") } }
              ]
            },
            {
              label: "Postgrado",
              icon: "bx bx-briefcase bx-sm",
              items: [
                { label: "Nacional", icon: "bx bx-globe bx-sm", command: () => { RouterApp("/secretary/postnat") } },
                { label: "Internacional", icon: "bx bx-send bx-sm", command: () => { RouterApp("/secretary/postinter") } }
              ]
            },
            {
              label: "Legalización de Título",
              icon: "bx bxs-certification bx-sm",
              command: () => { RouterApp("/secretary/legaliz") }
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
  const [checked, setChecked] = useState<boolean>(false);
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
          <ToggleButton onLabel="" offLabel="" onIcon="pi pi-sign-out" offIcon="pi pi-sign-in" checked={checked} onChange={(e: ToggleButtonChangeEvent) => setChecked(e.value)} className="" />

          {
            !checked ? <>
              <NavLink to={"/login"}>
                <p className="text-sm font-bold">Inicia sesion</p>
              </NavLink>
              <p>o</p>
              <NavLink to={"/register"}>
                <p className="text-sm text-primary font-bold m-0">
                  Regístrate
                </p>
              </NavLink>
            </> :
              <UserChipMenu user={{ name: "Username", last: "", addres: "", email: "", phone: "", role: "", id: "" }} />
          }
        </div>
      </div>
    </nav>
  );
};
