
import React from "react";
import { LoginForm } from "../components/platform/login/LoginForm";

export const Login: React.FC = () => {
    return <section className="flex flex-col flex-nowrap gap-2  justify-center items-center pb-10 grow w-full bg-white border-t-2  border-gray-300">
        <LoginForm />
    </section>
}