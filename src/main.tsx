import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import 'primeicons/primeicons.css'
import 'boxicons/css/boxicons.min.css';
// PrimeReact base styles and a default theme. You can change the theme file below
// to any other theme included in primereact (for example 'saga-blue', 'luna-amber',
// 'vela-blue', 'lara-light-indigo', etc.).
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';

import { PrimeReactProvider } from 'primereact/api';
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/auth'

// Configuración del QueryClient con mejores defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
    },
  },
})

const root = document.getElementById('root')!;

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PrimeReactProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PrimeReactProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
