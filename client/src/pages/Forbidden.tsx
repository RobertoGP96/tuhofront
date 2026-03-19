import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <ShieldAlert className="mb-6 h-20 w-20 text-primary-navy opacity-60" />
      <h1 className="mb-2 text-8xl font-bold text-primary-navy">403</h1>
      <h2 className="mb-4 text-2xl font-semibold text-primary-navy">Acceso denegado</h2>
      <p className="mb-8 max-w-sm text-gray-500">
        No tienes permiso para acceder a esta pagina.
      </p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}
