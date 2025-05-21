
import { InputText } from "primereact/inputtext"

export const TitleRegisterInfo = () => {
    return <div className="w-full gap-2 flex-wrap flex flex-col  items-center">
        <h3 className="w-full uppercase mb-3 font-bold text-primary text-xl"> Registro de Títulos</h3>
        <div className="w-full flex flex-row gap-2">
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="tomo">Tomo:</label>
                <InputText id="tomo" aria-describedby="tomo-help" placeholder="---" />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="folio">Folio:</label>
                <InputText id="folio" aria-describedby="folio-help" placeholder="---" />

            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="numid">Número:</label>
                <InputText id="numid" aria-describedby="numid-help" placeholder="---" />
            </div>
        </div>
    </div>
}