import React from "react";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 p-4">
      <section className="flex flex-col gap-2 backdrop-blur-2xl">
        <div className="flex flex-row gap-2 items-center">

        <img
          src="/black-logo.svg"
          className="aspect-square"
          width={60}
          alt="AR&E logo"
          />

        <h1 className="text-2xl font-bold text-pretty-blue-500">
          Bienvenido a la platadforma de Trámites de la Universidad de Holguín
        </h1>
          </div>
        <h1>Trámites</h1>
        <p>
          Plataforma oficial de la Universidad de Holguín diseñada para
          simplificar y agilizar los trámites académicos y administrativos. Aquí
          podrás gestionar tus procesos de manera eficiente, desde solicitudes
          de documentos hasta el seguimiento de tus trámites en tiempo real.
        </p>
        <p>
          Nuestro objetivo es ofrecerte una experiencia intuitiva y accesible,
          permitiéndote concentrarte en lo que realmente importa: tu desarrollo
          académico y profesional.
        </p>
      </section>
    </div>
  );
};

export default Home;
