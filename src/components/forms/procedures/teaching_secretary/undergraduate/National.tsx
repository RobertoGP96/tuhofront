

import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { PersonalInfo } from "../../../utils/PersonalInfo";
import { TitleRegisterInfo } from "../../../utils/TitleRegisterInfo";
import { UnderNatInfo } from "../../../utils/queryinfo/UnderNatInfo";

export const UnderNat = () => {
    return <form action="" className="w-5/6 px-[50px] py-[40px] border border-primary/25 rounded-sm shadow-2xl flex flex-col justify-center items-center gap-2 ">
        <div className="w-full">
            <img src="/img/logo/secretaria/Hoja-carta-09.jpg" width={250} className="aspect-auto" alt="secretaria identificador" />
        </div>
        <h1 className="text-2xl text-primary font-bold uppercase my-4">Formulario para Trámite de Pregrado Nacional.</h1>
        <PersonalInfo />
        <Divider layout="horizontal" />
        <UnderNatInfo />
        <Divider layout="horizontal" />
        <TitleRegisterInfo />
        <div className="w-full flex flex-row gap-2 justify-end items-center pt-4">
            <Button icon="pi pi-trash" className="btn-secondary" label="Limpiar" />
            <Button icon="pi pi-send" className="btn-primary" label="Enviar" />
        </div>
    </form>
}