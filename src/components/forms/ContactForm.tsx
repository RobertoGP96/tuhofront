import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"

export const ContactForm = () => {
    return <form className="w-3/5 flex flex-col gap-2 p-8 items-center justify-center border-2 border-primary/25 rounded-2xl">
        <h3 className="uppercase mb-3 font-bold text-primary"> Información de Contacto</h3>
        <div className="w-full flex flex-row gap-2 flex-nowrap">
            <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="username">Nombres:</label>
                <InputText id="username" aria-describedby="username-help" />

            </div>
            <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="lastname">Apellidos:</label>
                <InputText id="lastname" aria-describedby="lastname-help" />

            </div>
        </div>
        <div className="w-full flex flex-row gap-2 flex-nowrap ">
            <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="id">Carnet de Identidad:</label>
                <InputText id="id" aria-describedby="id-help" />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="email">Correo:</label>
                <InputText id="email" aria-describedby="email-help" />

            </div>
        </div>
        <div className="w-full flex flex-row gap-2 flex-nowrap">
            <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="phone">Teléfono:</label>
                <InputText id="phone" aria-describedby="phone-help" />

            </div>
            <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="addres">Dirección:</label>
                <InputText id="addres" aria-describedby="addres-help" />
            </div>
        </div>
        <div className="w-full flex flex-row justify-end mt-3">
            <Button style={{border: "none"}} className="btn-primary border-0" icon="pi pi-send" label="Enviar"/>
        </div>
    </form>
}