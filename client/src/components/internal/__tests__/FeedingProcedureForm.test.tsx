import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FeedingProcedureForm } from '../FeedingProcedureForm'

// Mock del service para que .create() no llame al backend real.
vi.mock('@/services/internal.service', () => ({
  feedingService: {
    create: vi.fn().mockResolvedValue({}),
  },
}))

// Mock de sonner para inspeccionar toasts.
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { feedingService } from '@/services/internal.service'
import { toast } from 'sonner'

function isoOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

describe('FeedingProcedureForm validación', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra errores al enviar el formulario vacío', () => {
    render(<FeedingProcedureForm />)
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(screen.getAllByText('Este campo es requerido').length).toBeGreaterThan(0)
    expect(toast.error).toHaveBeenCalledWith('Por favor, corrija los errores en el formulario')
    expect(feedingService.create).not.toHaveBeenCalled()
  })

  it('rechaza fecha de inicio en el pasado', () => {
    render(<FeedingProcedureForm />)
    const past = isoOffset(-5)
    const future = isoOffset(5)

    fireEvent.change(screen.getByLabelText(/fecha de inicio/i), { target: { value: past } })
    fireEvent.change(screen.getByLabelText(/fecha de fin/i), { target: { value: future } })
    fireEvent.change(screen.getByLabelText(/descripción detallada/i), { target: { value: 'Test' } })

    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(screen.getByText('La fecha de inicio no puede ser anterior a hoy')).toBeInTheDocument()
    expect(feedingService.create).not.toHaveBeenCalled()
  })

  it('rechaza end_day <= start_day', () => {
    render(<FeedingProcedureForm />)
    const start = isoOffset(3)

    fireEvent.change(screen.getByLabelText(/fecha de inicio/i), { target: { value: start } })
    fireEvent.change(screen.getByLabelText(/fecha de fin/i), { target: { value: start } })
    fireEvent.change(screen.getByLabelText(/descripción detallada/i), { target: { value: 'Test' } })

    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(screen.getByText('La fecha de fin debe ser posterior a la de inicio')).toBeInTheDocument()
    expect(feedingService.create).not.toHaveBeenCalled()
  })

  it('rechaza si no hay días de alimentación con comidas', () => {
    render(<FeedingProcedureForm />)
    fireEvent.change(screen.getByLabelText(/fecha de inicio/i), { target: { value: isoOffset(1) } })
    fireEvent.change(screen.getByLabelText(/fecha de fin/i), { target: { value: isoOffset(2) } })
    fireEvent.change(screen.getByLabelText(/descripción detallada/i), { target: { value: 'Test' } })
    // amount tiene valor 1 por defecto; no se cambia.

    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(screen.getByText(/al menos un día de alimentación/i)).toBeInTheDocument()
    expect(feedingService.create).not.toHaveBeenCalled()
  })
})
