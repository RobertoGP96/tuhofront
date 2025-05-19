import { Button } from "primereact/button"
import { FileUpload } from "primereact/fileupload"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import "./Suport.css"

export const SuportForm = () => {
    return <form className="w-3/5 flex flex-col gap-2 p-8 items-center justify-center border-2 border-primary/25 rounded-2xl">
        <div className="w-full flex flex-col gap-2 pb-2">
            <h3 className="uppercase mb-3 font-bold text-primary text-2xl"> Atención a la Población</h3>
            <p className="text-gray-500">
                Nos esforzamos por brindar un servicio de calidad y cercanía a todos los ususarios.
                Nos comprometemos a escuchar sus necesidades, preocupaciones y para poder ofrecerles
                la mejor atención posible.
            </p>
            <p> Complete la información siguiente para realizar la consulta.</p>
        </div>
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

        <div className="flex flex-col justify-center items-center gap-2 w-full ">
            <span className="w-full flex flex-row gap-1 items-center justify-start">
                <i className="pi pi-clip"></i>
                <label htmlFor="document">Documento (PDF):</label>
            </span>
            <div className="border-2 border-dashed border-primary/25 rounded-lg w-full h-20 flex flex-row justify-center items-center">
                <FileUpload
                    chooseLabel="Adjuntar"
                    className="file-upload-component"
                    mode="basic"
                    url="/api/upload"
                    accept="application/pdf"
                    maxFileSize={1000000}
                />
            </div>
        </div>


        <div className="w-full flex flex-row gap-2 ">
            <div className="flex flex-col gap-2 w-full">
                <label htmlFor="addres">Descripción:</label>
                <InputTextarea
                    rows={5}
                    cols={30}
                    autoResize
                    style={{ height: "120px" }}
                    placeholder="Describa brevemente su solicitud o el problema que presenta"
                />
            </div>
        </div>
        <div className="w-full flex flex-row justify-end mt-3">
            <Button style={{ border: "none" }} className="btn-primary border-0" icon="pi pi-send" label="Enviar" />
        </div>
    </form>
}