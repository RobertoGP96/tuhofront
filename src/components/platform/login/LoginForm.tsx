import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { Password } from "primereact/password"
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Message } from "primereact/message";

import "./Login.css"
import { NavLink, useNavigate } from "react-router-dom";
import routes from '../../../routes/paths';
import { authService } from '../../../services/auth/auth';

export const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await authService.login({ email, password });
            
            // Login exitoso - redirigir al perfil o página principal
            if (response.user) {
                navigate(routes.profile || '/');
            }
        } catch (err: any) {
            // Manejar errores del backend
            let errorMessage = 'Error al iniciar sesión. Por favor, verifique sus credenciales.';
            
            if (err.response?.data) {
                const data = err.response.data;
                // El backend puede devolver 'message' o 'response' con 'message'
                errorMessage = data.message || data.response?.message || errorMessage;
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
            <span className="text-sm font-light text-gray-600">Ingrese su correo electrónico a continuación para iniciar sesión en su cuenta.</span>
        </div>
        
        {error && (
            <div className="w-full">
                <Message severity="error" text={error} className="w-full" />
            </div>
        )}

        <div className="flex flex-col gap-2 w-full">
            <label htmlFor="useritem" className="text-sm">Correo:</label>
            <IconField iconPosition="left" className="w-full">
                <InputIcon className="pi pi-envelope"> </InputIcon>
                <InputText 
                    placeholder="ejemplo@ejemplo.cu" 
                    id="useritem" 
                    className="p-inputtext-sm w-full" 
                    aria-describedby="useritem-help" 
                    size="sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    type="email"
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