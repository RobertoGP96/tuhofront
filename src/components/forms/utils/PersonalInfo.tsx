
import { InputText } from "primereact/inputtext"

export const PersonalInfo = () => {
    return <>
        <h3 className=" w-full uppercase mb-3 font-bold text-primary text-xl"> Información de Contacto</h3>
        <div className="w-full flex flex-row gap-4 flex-nowrap">
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="username">Nombres:</label>
                <InputText id="username" aria-describedby="username-help" placeholder="Escriba su nombre."/>
            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="lastname">Apellidos:</label>
                <InputText id="lastname" aria-describedby="lastname-help" placeholder="Escriba sus apellidos."/>

            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="id">Carnet de Identidad:</label>
                <InputText id="id" aria-describedby="id-help" placeholder="Escriba su número de carnet." />
            </div>
        </div>

        <div className="w-full flex flex-row gap-4 flex-nowrap">
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="email">Correo:</label>
                <InputText id="email" aria-describedby="email-help"placeholder="ejemplo@ejemplo.cu" />

            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="phone">Teléfono:</label>
                <InputText id="phone" aria-describedby="phone-help" placeholder="(+53)..." />

            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="addres">Dirección:</label>
                <InputText id="addres" aria-describedby="addres-help" placeholder="%"/>
            </div>
        </div>

    </>

}