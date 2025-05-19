import "./App.css";

import "primereact/resources/themes/lara-light-blue/theme.css";
//import 'primereact/resources/primereact.min.css';


import { NavBar } from "./components/navbar/NavBar";
import { AppRoutes } from "./routes/Routes";

function App() {
  return (
    <>
      <NavBar />

      <AppRoutes />

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
