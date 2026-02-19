import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Card, Checkbox, Divider, Form, Input, message, Typography } from 'antd';
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import * as yup from "yup";
import { useAuth } from "../../../context/auth";
import routes from '../../../routes/paths';
import "./Login.css";

const { Title, Text } = Typography;

// Schema de validación con Yup
const loginSchema = yup.object().shape({
  username: yup
    .string()
    .required("El nombre de usuario es requerido")
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .trim(),
  password: yup
    .string()
    .required("La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  rememberMe: yup.boolean().default(false)
});

type LoginFormData = yup.InferType<typeof loginSchema>;

// Constantes para el control de intentos de inicio de sesión
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutos en milisegundos
const LOCKOUT_STORAGE_KEY = 'login_lockout';
const ATTEMPTS_STORAGE_KEY = 'login_attempts';

export const LoginForm = () => {
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const { 
    control,
    handleSubmit, 
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false
    }
  });

  const password = watch('password', '');

  // Cargar credenciales guardadas y verificar bloqueo al montar
  useEffect(() => {
    // Cargar credenciales guardadas
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedUsername && savedRememberMe) {
      setValue('username', savedUsername);
      setValue('rememberMe', true);
    }

    // Verificar si hay un bloqueo activo
    const savedLockUntil = localStorage.getItem(LOCKOUT_STORAGE_KEY);
    const savedAttempts = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    
    if (savedLockUntil) {
      const lockTime = parseInt(savedLockUntil, 10);
      if (Date.now() < lockTime) {
        setIsLocked(true);
        setLockUntil(lockTime);
        setLoginAttempts(savedAttempts ? parseInt(savedAttempts, 10) : MAX_LOGIN_ATTEMPTS);
      } else {
        // Limpiar bloqueo expirado
        localStorage.removeItem(LOCKOUT_STORAGE_KEY);
        localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
      }
    } else if (savedAttempts) {
      setLoginAttempts(parseInt(savedAttempts, 10));
    }
  }, [setValue]);

  // Verificar bloqueo periódicamente
  useEffect(() => {
    if (!isLocked || !lockUntil) return;

    const lockTimer = setInterval(() => {
      if (Date.now() > lockUntil) {
        setIsLocked(false);
        setLockUntil(null);
        setLoginAttempts(0);
        localStorage.removeItem(LOCKOUT_STORAGE_KEY);
        localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
        message.success('El bloqueo ha sido levantado. Puede intentar nuevamente.');
      }
    }, 1000);

    return () => clearInterval(lockTimer);
  }, [isLocked, lockUntil]);

  const handleLogin = async (data: LoginFormData) => {
    if (isLocked) {
      const timeLeft = Math.ceil(((lockUntil || 0) - Date.now()) / 1000 / 60);
      message.error(`Demasiados intentos fallidos. Intente nuevamente en ${timeLeft} minuto(s).`);
      return;
    }

    try {
      // Guardar o eliminar credenciales según rememberMe
      if (data.rememberMe) {
        localStorage.setItem('rememberedUsername', data.username);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberMe');
      }

      // Intentar iniciar sesión
      await login( 
        data.username.trim(), 
        data.password 
    );
      
      // Limpiar intentos fallidos después de un inicio de sesión exitoso
      setLoginAttempts(0);
      localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
      localStorage.removeItem(LOCKOUT_STORAGE_KEY);
      
      message.success('¡Inicio de sesión exitoso!');
      
      // Redirigir a la ruta de origen o a la página principal
      const redirectTo = searchParams.get('redirectTo') || routes.home || '/';
      navigate(redirectTo, { replace: true });

    } catch (error: any) {
      const newLoginAttempts = loginAttempts + 1;
      setLoginAttempts(newLoginAttempts);
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, newLoginAttempts.toString());

      const attemptsLeft = MAX_LOGIN_ATTEMPTS - newLoginAttempts;
      let errorMessage = 'Credenciales incorrectas. Por favor, verifique sus datos.';
      
      if (newLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_TIME;
        setIsLocked(true);
        setLockUntil(lockTime);
        localStorage.setItem(LOCKOUT_STORAGE_KEY, lockTime.toString());
        errorMessage = `Demasiados intentos fallidos. La cuenta ha sido bloqueada por ${LOCKOUT_TIME / 60000} minutos.`;
      } else if (attemptsLeft > 0) {
        errorMessage = `Credenciales incorrectas. Le quedan ${attemptsLeft} intento(s).`;
      }

      // Extraer mensaje de error de la API si existe
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      message.error({
        content: errorMessage,
        duration: 5,
      });
    }
  };

  // Calcular tiempo restante de bloqueo
  const getRemainingLockTime = () => {
    if (!lockUntil) return 0;
    return Math.ceil(((lockUntil || 0) - Date.now()) / 1000 / 60);
  };

  return (
    <div className="login-container" style={{ maxWidth: '420px', margin: '0 auto', padding: '24px' }}>
      <Card 
        hoverable 
        className="login-card"
        style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img 
            src="/img/logo/svg/IdUHo-02.svg" 
            alt="Logo de la aplicación" 
            style={{ height: '64px', marginBottom: '16px' }} 
          />
          <Title level={3} style={{ marginBottom: '8px' }}>Inicio de Sesión</Title>
          <Text type="secondary">Ingrese sus credenciales para acceder a su cuenta.</Text>
        </div>

        {searchParams.get('registered') === 'true' && (
          <div style={{ marginBottom: '16px' }}>
            <div className="ant-alert ant-alert-success" role="alert">
              <div className="ant-alert-content">
                <div className="ant-alert-message">¡Registro exitoso! Por favor inicie sesión.</div>
              </div>
            </div>
          </div>
        )}

        {isLocked && (
          <div style={{ marginBottom: '16px' }}>
            <div className="ant-alert ant-alert-error" role="alert">
              <div className="ant-alert-content">
                <div className="ant-alert-message">
                  Cuenta bloqueada temporalmente. Intente nuevamente en {getRemainingLockTime()} minuto(s).
                </div>
              </div>
            </div>
          </div>
        )}

        <Form
          name="login"
          onFinish={handleSubmit(handleLogin)}
          layout="vertical"
          size="large"
          className="login-form"
        >
          <Form.Item
            label="Nombre de usuario"
            validateStatus={errors.username ? 'error' : ''}
            help={errors.username?.message}
          >
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Ingrese su nombre de usuario"
                  disabled={isSubmitting || isLocked}
                  autoComplete="username"
                  status={errors.username ? 'error' : ''}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>Contraseña</span>
                <NavLink to="/forgot-password" style={{ fontSize: '12px' }}>
                  ¿Olvidó su contraseña?
                </NavLink>
              </div>
            }
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Ingrese su contraseña"
                  disabled={isSubmitting || isLocked}
                  autoComplete="current-password"
                  status={errors.password ? 'error' : ''}
                  visibilityToggle={!isLocked}
                />
              )}
            />
          </Form.Item>

          <Form.Item>
            <Controller
              name="rememberMe"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Checkbox 
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  disabled={isSubmitting || isLocked}
                >
                  Recordar mi cuenta
                </Checkbox>
              )}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="login-form-button"
              block
              loading={isSubmitting}
              disabled={isLocked}
              size="large"
              style={{ marginTop: '8px' }}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </Form.Item>

          <Divider style={{ margin: '16px 0' }}>
            <Text type="secondary">O</Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Text>
              ¿No tienes una cuenta?{' '}
              <NavLink to={routes.register} style={{ fontWeight: 500 }}>
                Regístrate
              </NavLink>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};