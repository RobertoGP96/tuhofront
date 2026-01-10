import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Password } from "primereact/password";
import type { FormEvent } from "react";
import { useState } from "react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import routes from '../../../routes/paths';
import "./Login.css";

export const LoginForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login({ username, password });
            // El login fue exitoso, el contexto se actualizó.
            // Ahora redirigimos.
            navigate(routes.home || '/');
        } catch (err: any) {
            // Manejar errores del backend
            let errorMessage = 'Error al iniciar sesión. Por favor, verifique sus credenciales.';
            
            if (err.response?.data) {
                const data = err.response.data;
                // El backend puede devolver 'detail', 'message' o 'response' con 'message'
                errorMessage = data.detail || data.message || data.response?.message || errorMessage;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return <form onSubmit={handleSubmit} className="relative flex flex-col gap-2 justify-center items-start p-10 border-primary/25 border rounded-xl shadow-2xl max-w-[500px] overflow-hidden">
        <img src="/img/logo/svg/IdUHo-02.svg" width={300} className="aspect-square absolute scale-200 rotate-6 -right-55 -bottom-25 z-0 opacity-45" alt="" />
        <div className="flex flex-col gap-2 items-start justify-center w-full" >
            <h1 className="font-bold uppercase text-xl text-primary">Inicio de Sesión</h1>
            <span className="text-sm font-light text-gray-600">Ingrese su nombre de usuario a continuación para iniciar sesión en su cuenta.</span>
        </div>
        
        {error && (
            <div className="w-full">
                <Message severity="error" text={error} className="w-full" />
            </div>
        )}

        <div className="flex flex-col gap-2 w-full">
            <label htmlFor="useritem" className="text-sm">Nombre de usuario:</label>
            <IconField iconPosition="left" className="w-full">
                <InputIcon className="pi pi-user"> </InputIcon>
                <InputText 
                    placeholder="su_usuario"
                    id="useritem" 
                    className="p-inputtext-sm w-full" 
                    aria-describedby="useritem-help" 
                    size="sm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                    type="text"
                />
            </IconField>
        </div>
        <div className="flex flex-col gap-2 w-full mb-3 passw-container">
            <label htmlFor="password" className="text-sm">Contraseña:</label>
            <Password 
                id="password" 
                inputStyle={{ width: "100%" }} 
                className="p-inputtext-sm w-full grow" 
                aria-describedby="password-help" 
                feedback={false} 
                tabIndex={1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
            />
        </div>
        <Button 
            className="btn-primary border-0 w-full" 
            label={loading ? "Iniciando sesión..." : "Iniciar"} 
            type="submit"
            disabled={loading}
            loading={loading}
        />
        <div className="flex flex-row gap-1 justify-center items-center">
            <NavLink to={routes.register}>
                <p className=" font-bold z-1">
                    Regístrate
                </p>
            </NavLink>
            <span className="text-sm text-gray-600"> Si no cuentas con la credenciales.</span>
        </div>
    </form>
}