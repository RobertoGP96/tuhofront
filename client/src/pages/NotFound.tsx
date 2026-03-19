import { FileQuestion } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <FileQuestion className="mb-6 h-20 w-20 text-primary-navy opacity-60" />
      <h1 className="mb-2 text-8xl font-bold text-primary-navy">404</h1>
      <h2 className="mb-4 text-2xl font-semibold text-primary-navy">Pagina no encontrada</h2>
      <p className="mb-8 max-w-sm text-gray-500">
        La pagina que buscas no existe o ha sido movida.
      </p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}
