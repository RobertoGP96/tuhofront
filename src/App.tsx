import "./App.css";

import "primereact/resources/themes/lara-light-blue/theme.css";
//import 'primereact/resources/primereact.min.css';


import { NavBar } from "./components/platform/navbar/NavBar";
import { AppRoutes } from "./routes/Routes";
import { AddFooter } from "./components/platform/addfooter/AddFooter";

function App() {
  return (
    <>
      <NavBar />

      <AppRoutes />

      <footer className="flex flex-col justify-center items-start w-screen text-sm font-bold">
        <AddFooter />
        <div className="w-full flex flex-row justify-center items-center gap-3">
          <img
            className="aspect-square w-10"
            src="/img/logo/svg/IdUHo-03.svg"
            alt=""
          />
          <span>2025© Universidad de Holguín.</span>
        </div>
      </footer>
    </>
  );
}

export default App;
