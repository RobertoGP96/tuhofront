import { useState } from "react"
import { PersonalInfo } from "../platform/forms/utils/PersonalInfo";
import { TitleLegalBody } from "./forms/TitleLegalBody";
import { TitleRegisterInfo } from "./forms/TitleRegisterInfo";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";

export const TitleLegalization = () => {

    const [estate, setState] = useState();

    return <form action="" className="w-5/6 px-[50px] py-[40px] border bg-white border-primary/25 rounded-sm shadow-2xl flex flex-col justify-center items-center gap-2 ">
        <div className="w-full">
        <img src="/img/logo/secretaria/Hoja-carta-09.jpg" width={250} className="aspect-auto" alt="secretaria identificador" />

        </div>
        <h1 className="text-2xl text-primary font-bold uppercase my-4">Legalizacion de Título</h1>
        <PersonalInfo/>
        <Divider layout="horizontal"/>
        <TitleLegalBody/>
        <Divider layout="horizontal"/>
        <TitleRegisterInfo/>
        <div className="w-full flex flex-row gap-2 justify-end items-center pt-4">
            <Button icon="pi pi-trash"  className="btn-secondary" label="Limpiar"/>
            <Button icon="pi pi-send" className="btn-primary" label="Enviar"/>
        </div>
    </form>
}