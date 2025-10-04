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
import { BrowserRouter, Routes, Route } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/auth'

const queryClient = new QueryClient()

const root = document.getElementById('root')!;

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PrimeReactProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/*" element={<App />} />
            </Routes>
          </BrowserRouter>
        </PrimeReactProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
