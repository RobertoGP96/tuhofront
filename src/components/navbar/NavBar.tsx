import { Menubar } from "primereact/menubar";
import type { MenuItem } from "primereact/menuitem";
import "./NavBar.css";

export const NavBar = () => {
  const items: MenuItem[] = [
    {
      label: "Trámites",
      icon: "bx bx-tag",
      items: [
        {
          label: "Internos",
          items: [
            { label: "Comedor", icon: "" },
            { label: "Tranporte", icon: "pi pi-truck" },
            { label: "Entrada" },
            { label: "Salida" },
          ],
        },
        {
          label: "Secretaría Docente",
          icon: "",
          items:[
            {
              label:"Certificacion de título"
            },
            {
              label:"Plan tematico"
            },{
              label:"Certificacion de notas"
            }
          ],
        },
      ],
    },
    {
      label: "Contactenos",
      icon: "pi pi-user",
    },
    {
      label: "Ajustes",
      icon: "pi pi-setting",
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
            src="/img/logo/svg/IdUHo-02.svg"
            className="h-11 aspect-auto"
            alt="Flowbite Logo"
          />
        </a>
        <div>
          <Menubar model={items} />
        </div>
      </div>
    </nav>
  );
};
