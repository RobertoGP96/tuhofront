import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AccommodationProcedureForm } from '../AccommodationProcedureForm'

vi.mock('@/services/internal.service', () => ({
  accommodationService: { create: vi.fn().mockResolvedValue({}) },
}))
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { accommodationService } from '@/services/internal.service'
import { toast } from 'sonner'

function isoOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

describe('AccommodationProcedureForm validación', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra errores al enviar formulario vacío', () => {
    render(<AccommodationProcedureForm />)
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(screen.getAllByText('Este campo es requerido').length).toBeGreaterThan(0)
    expect(toast.error).toHaveBeenCalled()
    expect(accommodationService.create).not.toHaveBeenCalled()
  })

  it('rechaza start_day en el pasado', () => {
    render(<AccommodationProcedureForm />)
    fireEvent.change(screen.getByLabelText(/fecha de inicio/i), { target: { value: isoOffset(-3) } })
    fireEvent.change(screen.getByLabelText(/fecha de fin/i), { target: { value: isoOffset(2) } })
    fireEvent.change(screen.getByLabelText(/descripción detallada/i), { target: { value: 'Test' } })

    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(screen.getByText('La fecha de inicio no puede ser anterior a hoy')).toBeInTheDocument()
    expect(accommodationService.create).not.toHaveBeenCalled()
  })

  it('rechaza end_day <= start_day', () => {
    render(<AccommodationProcedureForm />)
    const same = isoOffset(2)
    fireEvent.change(screen.getByLabelText(/fecha de inicio/i), { target: { value: same } })
    fireEvent.change(screen.getByLabelText(/fecha de fin/i), { target: { value: same } })
    fireEvent.change(screen.getByLabelText(/descripción detallada/i), { target: { value: 'Test' } })

    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(screen.getByText('La fecha de fin debe ser posterior a la de inicio')).toBeInTheDocument()
    expect(accommodationService.create).not.toHaveBeenCalled()
  })

  it('rechaza si no hay huésped con nombre e identificación', () => {
    render(<AccommodationProcedureForm />)
    fireEvent.change(screen.getByLabelText(/fecha de inicio/i), { target: { value: isoOffset(1) } })
    fireEvent.change(screen.getByLabelText(/fecha de fin/i), { target: { value: isoOffset(2) } })
    fireEvent.change(screen.getByLabelText(/descripción detallada/i), { target: { value: 'Test' } })
    // Huésped queda vacío

    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(screen.getByText(/al menos un huésped/i)).toBeInTheDocument()
    expect(accommodationService.create).not.toHaveBeenCalled()
  })

  it('marca huésped incompleto si solo tiene nombre o solo identificación', () => {
    render(<AccommodationProcedureForm />)
    fireEvent.change(screen.getByLabelText(/fecha de inicio/i), { target: { value: isoOffset(1) } })
    fireEvent.change(screen.getByLabelText(/fecha de fin/i), { target: { value: isoOffset(2) } })
    fireEvent.change(screen.getByLabelText(/descripción detallada/i), { target: { value: 'Test' } })

    // Llenar solo el nombre del primer huésped
    fireEvent.change(screen.getByPlaceholderText(/nombre del huésped/i), { target: { value: 'Juan' } })

    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    // Como no tiene identificación, sigue siendo "al menos un huésped..."
    expect(screen.getByText(/al menos un huésped|huéspedes incompletos/i)).toBeInTheDocument()
    expect(accommodationService.create).not.toHaveBeenCalled()
  })
})
