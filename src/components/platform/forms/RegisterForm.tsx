import { Button } from "primereact/button"
import { IconField } from "primereact/iconfield"
import { InputIcon } from "primereact/inputicon"
import { InputText } from "primereact/inputtext"
import { InputMask } from "primereact/inputmask"

export const RegisterForm = () => {
    return <form className="w-3/5 flex flex-col gap-2 p-8 items-center justify-center border-2 border-primary/25 rounded-sm">
        <div className="w-full mb-3">
            <h3 className="uppercase mb-3 font-bold text-primary text-2xl"> Registro</h3>
            <span className="text-gray-500 text-sm">Le damos la bienvenida al sistema. Para poder brindarle un servicio óptimo y adaptado a sus necesidades,
                le solicitamos que complete el formulario de registro a continuación. Esta información será tratada con estricta confidencialidad y se
                utilizará exclusivamente para mejorar su experiencia.
            </span>
        </div>
        <div className="w-full flex flex-row gap-2 flex-nowrap">
            <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="username">Nombres:</label>
                <IconField iconPosition="left" className="w-full">
                    <InputIcon className="pi pi-user"> </InputIcon>
                    <InputText id="username" placeholder="Nombre" className="w-full" aria-describedby="username-help" />
                </IconField>

            </div>
            <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="lastname">Apellidos:</label>
                <IconField iconPosition="left" className="w-full">
                    <InputIcon className="pi pi-user"> </InputIcon>
                    <InputText className="w-full" placeholder="Apellidos" id="lastname" aria-describedby="lastname-help" />
                </IconField>

            </div>
        </div>
        <div className="w-full flex flex-row gap-2 flex-nowrap ">
            <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="id">Carnet de Identidad:</label>
                <IconField iconPosition="left" className="w-full">
                    <InputIcon className="pi pi-id-card"> </InputIcon>
                    <InputMask className="w-full" id="id" mask="99999999999" placeholder="-----------"/>
                </IconField>
            </div>
            <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="email">Correo:</label>
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-envelope"> </InputIcon>
                    <InputText id="email" className="w-full" placeholder="ejemplo@ejemplo.cu" aria-describedby="email-help" />
                </IconField>
            </div>
        </div>
        <div className="w-full flex flex-row gap-2 flex-nowrap">
            <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="phone">Teléfono:</label>
                <IconField iconPosition="left" className="w-full">
                    <InputIcon className="pi pi-phone"> </InputIcon>
                    <InputText id="phone" placeholder="+53..." className="w-full" aria-describedby="phone-help" />
                </IconField>

            </div>
            <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="addres">Dirección:</label>
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-home"> </InputIcon>
                    <InputText id="addres" placeholder="Calle:" className="w-full" aria-describedby="addres-help" />
                </IconField>
            </div>
        </div>
        <div className="w-full flex flex-row justify-end mt-3 gap-2">
            <Button style={{ border: "none" }} className="btn-primary border-0" icon="pi pi-send" label="Registrar" />
        </div>
    </form>
}