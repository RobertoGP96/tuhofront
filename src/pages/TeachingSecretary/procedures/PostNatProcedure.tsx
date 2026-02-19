import { Calendar } from "primereact/calendar"
import { Dropdown } from "primereact/dropdown"
import { InputText } from "primereact/inputtext"

export const PostNatProcedure = () => {
    return <div className="w-full flex flex-col gap-2">
        <h3 className="uppercase mb-3 font-bold text-primary text-xl">Datos de Solicitud - Título Nacional de Postgrado</h3>
        <div className="w-full flex flex-row gap-2 flex-nowrap">
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="tipoEstudio">Tipo de Estudio:</label>
                <InputText id="tipoEstudio" disabled value={"Postgrado"} />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="tipoUso">Tipo de Uso:</label>
                <InputText id="tipoUso" disabled value={"Nacional"} />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="tipoTramite">Tipo de Trámite:</label>
                <Dropdown 
                    id="tipoTramite"
                    optionLabel="name"
                    showClear 
                    placeholder="Selecciona el tipo" 
                    className="w-full" 
                />
            </div>
        </div>
        
        <div className="w-full flex flex-row gap-2 py-2">
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="funcionario">Funcionario:</label>
                <InputText id="funcionario" />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="programa">Programa de Postgrado:</label>
                <InputText id="programa" />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="anio">Año de Graduación:</label>
                <Calendar view="year" dateFormat="yy" placeholder="----" />
            </div>
        </div>
    </div>
}
