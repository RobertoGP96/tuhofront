import React from "react";
import { RegisterForm } from "../components/forms/RegisterForm";


export const Register: React.FC = () => {
    return <section className="flex flex-col flex-nowrap gap-2  justify-center items-center pb-10 grow w-full bg-white border-t-2  border-gray-300 px-[10%]">
        <RegisterForm/>
    </section>
}