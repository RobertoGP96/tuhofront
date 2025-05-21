import React from "react";
import { SupportForm } from "../components/platform/forms/Support";

export const Contact: React.FC = () => {
    return <>
        <section className="flex flex-col flex-nowrap gap-2 items-center pb-10 grow w-full py-5 px-[10%] border-t-2  border-gray-300">
            <SupportForm />
        </section>
    </>
}