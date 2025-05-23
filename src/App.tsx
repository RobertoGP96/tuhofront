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
        <div className="w-full flex flex-row justify-center items-center gap-3 py-2">
          <img
            className="aspect-square w-6"
            src="/img/logo/svg/IdUHo-06.svg"
            alt=""
          />
          <span>Universidad de Holguín.2025©</span>
        </div>
      </footer>
    </>
  );
}

export default App;
