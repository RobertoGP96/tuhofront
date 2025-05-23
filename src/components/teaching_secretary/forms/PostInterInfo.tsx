
import { Calendar } from "primereact/calendar"
import { Checkbox } from "primereact/checkbox"
import { Dropdown } from "primereact/dropdown"
import { InputText } from "primereact/inputtext"



export const PostInterInfo = () => {
    type typeP = {
        label: string
    }
    const procedureType: typeP[] = [
        {
            label: "Tipo1"

        }, {
            label: "Tipo2"
        }
    ]

    return <div className="w-full flex flex-col gap-2">
        <h3 className="uppercase mb-3 font-bold text-primary text-xl"> Datos de Solicitud</h3>
        <div className="w-full flex flex-row gap-2 flex-nowrap">
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="username">Tipo de Estudio:</label>
                <InputText id="username" aria-describedby="username-help" disabled value={"Postgrado"} />

            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="lastname">Tipo de Uso:</label>
                <InputText id="lastname" aria-describedby="lastname-help" disabled value={"Internacional"} />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="center">Tipo de Trámite:</label>
                <Dropdown
                    showClear placeholder="Selecciona el tipo" className="w-full" options={procedureType} optionLabel="label" />
            </div>
        </div>
        <div className="w-full flex flex-row gap-2 py-5">

            <div className="flex flex-row flex-wrap items-start justify-around gap-3 w-1/3">
                <h3 className="w-full">Interés:</h3>
                <div className="flex align-items-center">
                    <Checkbox inputId="option1" name="option" />
                    <label htmlFor="option1" className="ml-2">Estatal</label>
                </div>
                <div className="flex align-items-center">
                    <Checkbox inputId="option2" name="option" />
                    <label htmlFor="option2" className="ml-2">Particular</label>
                </div>
            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="center">Organismo:</label>
                <InputText id="center" aria-describedby="center-help" placeholder="Organismo?" />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
                <label htmlFor="function">Funcionario:</label>
                <InputText id="function" aria-describedby="function-help" />
            </div>


        </div>
        <div className="w-full flex flex-row gap-2 py-2">

            <div className="flex flex-col gap-2 w-1/4">
                <label htmlFor="center">Año:</label>
                <Calendar view="year" dateFormat="yy" placeholder="----" />
            </div>
            <div className="flex flex-col gap-2 w-1/4">
                <label htmlFor="center">Tipo de Programa:</label>
                <Dropdown optionLabel="name"
                    showClear placeholder="Selecciona el tipo" className="w-full" />
            </div>
            <div className="flex flex-col gap-2 w-2/4">
                <label htmlFor="program-name">Nombre del Programa:</label>
                <InputText id="program-name" aria-describedby="program-name-help" />
            </div>

        </div>
    </div>

}