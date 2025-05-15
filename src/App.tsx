import "./App.css";

import "primereact/resources/themes/lara-light-blue/theme.css";
import { NavBar } from "./components/navbar/NavBar";

function App() {
  return (
    <>
      <NavBar />
      <section className="flex flex-col flex-nowrap gap-2 grow w-full bg-white">
        <article className="card-info w-full flex flex-col justify-end items-center  h-[450px] overflow-clip">
          <div className="w-full flex flex-col gap-3 items-center justify-center bg-black/15 backdrop-blur-sm z-0 p-4">
            <img
              src="/img/logo/svg/IdUHo-01.svg"
              className=" w-[200px] "
              alt=""
            />
            <h1 className="text-white text-pretty uppercase">
              Plataforma de Trámites de la Universidad de Holguín.
            </h1>
          </div>
        </article>
        <article className="py-8">
          <ul className="w-full flex flex-col px-[15%] gap-2 justify-center items-baseline">
            <li className=" p-4 w-full flex flex-row justify-center items-start border border-gray-300 gap-2 cursor-pointer hover:border-primary/45 rounded-sm transition shadow-md">
              <div className="w-[75px] border-2 border-primary rounded-sm p-2 flex justify-center items-center aspect-square mt-1">
                <i className="pi pi-tag"></i>
              </div>
              <div className="px-4 w-full">
                <h5 className=" uppercase text-primary font-bold mb-2">
                  sistema en línea
                </h5>
                <p className="font-light">
                  Facilita la gestión administrativa y académica de la comunidad
                  universitaria. Su implementación busca optimizar los procesos
                  internos y mejorar la comunicación entre los diferentes
                  actores involucrados en la vida universitaria.
                </p>
              </div>
            </li>
            <li className=" p-4 w-full flex flex-row justify-center items-start border border-gray-300 gap-2 cursor-pointer hover:border-primary/65 rounded-sm transition shadow-md">
              <div className="w-[75px]  border-2 border-primary rounded-sm p-2 flex justify-center items-center aspect-square mt-1">
                <i className="pi pi-tag"></i>
              </div>
              <div className="card-body w-full px-4">
                <h5 className="w-full uppercase text-primary font-bold mb-2">Tramites Administrativos </h5>
                <p className="font-light">
                  Agiliza los trámites relacionados con la
                  inscripción, matrícula, solicitud de documentos, entre otros.
                </p>
              </div>
            </li>
            <li className=" p-4 w-full flex flex-row justify-center items-start border border-gray-300 gap-2 cursor-pointer hover:border-primary/65 rounded-sm transition shadow-md">
              <div className="w-[75px] border-2 border-primary rounded-sm p-2 flex justify-center items-center aspect-square mt-1">
                <i className="pi pi-tag"></i>
              </div>
              <div className="px-4 w-full">
                <h5 className=" uppercase text-primary font-bold mb-2">Digitalizacion</h5>
                <p className="font-light">
                  Promover la digitalización de los servicios universitarios para garantizar una experiencia más cómoda y eficiente.
                </p>
              </div>
            </li>
            <li className=" p-4 w-full flex flex-row justify-center items-start border border-gray-300 gap-2 cursor-pointer hover:border-primary/65 rounded-sm transition shadow-md">
              <div className="w-[75px] border-2 border-primary rounded-sm p-2 flex justify-center items-center aspect-square mt-1">
                <i className="pi pi-tag"></i>
              </div>
              <div className="px-4 w-full">
                <h5 className=" uppercase text-primary font-bold mb-2">Digitalizacion</h5>
                <p className="font-light">
                  Promover la digitalización de los servicios universitarios para garantizar una experiencia más cómoda y eficiente.
                </p>
              </div>
            </li>
          </ul>
        </article>
      </section>
      <footer className="w-screen text-sm font-bold px-1.5 flex justify-center items-center p-3 max-h-[60px]">
        <img
          className="aspect-square w-10"
          src="/img/logo/svg/IdUHo-03.svg"
          alt=""
        />
        <span>2025© Universidad de Holguín.</span>
      </footer>
    </>
  );
}

export default App;
