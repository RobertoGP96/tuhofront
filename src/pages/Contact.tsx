import React from "react";
import { SuportForm } from "../components/forms/Suport";

export const Contact: React.FC = () => {
    return <>
        <section className="flex flex-col flex-nowrap gap-2 items-center pb-10 grow w-full bg-white py-5 px-[10%] border-t-2  border-gray-300">
            <SuportForm />
        </section>
    </>
}