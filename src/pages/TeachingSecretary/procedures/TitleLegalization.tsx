import { Calendar } from "primereact/calendar"
import { Dropdown } from "primereact/dropdown"
import { InputText } from "primereact/inputtext"

export const TitleLegalization = () => {
    return <div className="w-full flex flex-col gap-2">
        <h3 className="uppercase mb-3 font-bold text-primary text-xl">Legalización de Título</h3>
        <div className="w-full flex flex-row gap-2 flex-nowrap">
            <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="nombreCompleto">Nombre Completo:</label>
                <InputText id="nombreCompleto" />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="tipoTitulo">Tipo de Título:</label>
                <Dropdown 
                    id="tipoTitulo"
                    optionLabel="name"
                    options={[
                        { name: 'Pregrado Nacional', value: 'pregrado_nacional' },
                        { name: 'Pregrado Internacional', value: 'pregrado_internacional' },
                        { name: 'Postgrado Nacional', value: 'postgrado_nacional' },
                        { name: 'Postgrado Internacional', value: 'postgrado_internacional' },
                    ]}
                    showClear 
                    placeholder="Selecciona el tipo de título" 
                    className="w-full" 
                />
            </div>
        </div>
        
        <div className="w-full flex flex-row gap-2 py-2">
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="numeroTitulo">Número de Título:</label>
                <InputText id="numeroTitulo" />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="fechaExpedicion">Fecha de Expedición:</label>
                <Calendar 
                    id="fechaExpedicion" 
                    dateFormat="dd/mm/yy" 
                    showIcon 
                    className="w-full"
                />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="paisDestino">País de Destino:</label>
                <InputText id="paisDestino" />
            </div>
        </div>
    </div>
}
