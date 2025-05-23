
import { Calendar } from "primereact/calendar"
import { FileUpload } from "primereact/fileupload"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"

export const TitleLegalBody = () => {
    return <div className="w-full flex flex-col gap-2">
        <h3 className="uppercase mb-3 font-bold text-primary text-xl"> Datos de Solicitud</h3>
        <div className="w-full flex flex-row gap-2 flex-nowrap">
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="username">Tipo de Estudio:</label>
                <InputText id="username" aria-describedby="username-help" />

            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="lastname">Tipo de Uso:</label>
                <InputText id="lastname" aria-describedby="lastname-help" />
            </div>

            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="center">Organismo:</label>
                <InputText id="center" aria-describedby="center-help" placeholder="Organismo?" />
            </div>
        </div>
        <div className="w-full flex flex-col gap-2 ">



            <div className="flex flex-col justify-center items-center gap-2 w-full ">
                <span className="w-full flex flex-row gap-1 items-center justify-start">
                    <i className="pi pi-clip"></i>
                    <label htmlFor="document">Fotocopia de Título: (PDF):</label>
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
                    <label htmlFor="addres">Motivo:</label>
                    <InputTextarea
                        rows={5}
                        cols={30}
                        autoResize
                        style={{ height: "120px" }}
                        placeholder="Describa el motivo por el cual realiza la solicitud del tramite."
                    />
                </div>
            </div>
        </div>
        <div className="w-full flex flex-row gap-2 py-2">
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="function">Funcionario:</label>
                <InputText id="function" aria-describedby="function-help" />

            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="carrear">Carrera:</label>
                <InputText id="carrear" aria-describedby="carrear-selp" />
            </div>

            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="center">Año:</label>
                <Calendar view="year" dateFormat="yy" placeholder="----"/>
            </div>
        </div>

    </div>

}