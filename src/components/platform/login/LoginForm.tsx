import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { Password } from "primereact/password"
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

import "./Login.css"
import { NavLink } from "react-router";
import routes from '../../../routes/paths';

export const LoginForm = () => {
    return <form action="" className="relative flex flex-col gap-2 justify-center items-start p-10 border-primary/25 border rounded-xl shadow-2xl max-w-[500px] overflow-hidden">
        <img src="/img/logo/svg/IdUHo-02.svg" width={300} className="aspect-square absolute scale-200 rotate-6 -right-55 -bottom-25 z-0 opacity-45" alt="" />
        <div className="flex flex-col gap-2 items-start justify-center w-full" >
            <h1 className="font-bold uppercase text-xl text-primary">Inicio de Sesión</h1>
            <span className="text-sm font-light text-gray-600">Ingrese su correo electrónico a continuación para iniciar sesión en su cuenta.</span>
        </div>
        <div className="flex flex-col gap-2 w-full">
            <label htmlFor="useritem" className="text-sm">Correo:</label>
            <IconField iconPosition="left" className="w-full">
                <InputIcon className="pi pi-envelope"> </InputIcon>
                <InputText placeholder="ejemplo@ejemplo.cu" id="useritem" className="p-inputtext-sm w-full" aria-describedby="useritem-help" size="sm" />
            </IconField>
        </div>
        <div className="flex flex-col gap-2 w-full mb-3 passw-container">
            <label htmlFor="username" className="text-sm">Contraseña:</label>
            <Password id="username" inputStyle={{ width: "100%" }} className="p-inputtext-sm w-full grow" aria-describedby="username-help" feedback={false} tabIndex={1} />
        </div>
        <Button className="btn-primary border-0 w-full" label="Inciar" />
        <div className="flex flex-row gap-1 justify-center items-center">
                        <NavLink to={routes.register}>
                <p className=" font-bold z-1">
                    Regístrate
                </p>
            </NavLink>
            <span className="text-sm text-gray-600"> Si no cuentas con la credenciales.</span>
        </div>
    </form>
}