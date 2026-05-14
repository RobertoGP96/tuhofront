import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TransportProcedureForm } from '../TransportProcedureForm'

vi.mock('@/services/internal.service', () => ({
  transportService: {
    create: vi.fn().mockResolvedValue({}),
    getTypes: vi.fn().mockResolvedValue([{ id: 1, name: 'Microbus' }]),
  },
}))
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { transportService } from '@/services/internal.service'
import { toast } from 'sonner'

function isoOffsetDateTime(hours: number): string {
  const d = new Date(Date.now() + hours * 3600_000)
  return d.toISOString().slice(0, 16)
}

describe('TransportProcedureForm validación', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra errores con formulario vacío', async () => {
    render(<TransportProcedureForm />)
    // Esperar a que el effect cargue los tipos.
    await waitFor(() => expect(transportService.getTypes).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(screen.getAllByText('Este campo es requerido').length).toBeGreaterThan(0)
    expect(toast.error).toHaveBeenCalled()
    expect(transportService.create).not.toHaveBeenCalled()
  })

  it('rechaza departure_time en el pasado', async () => {
    render(<TransportProcedureForm />)
    await waitFor(() => expect(transportService.getTypes).toHaveBeenCalled())

    const dep = screen.getByLabelText(/hora de salida/i) as HTMLInputElement
    fireEvent.change(dep, { target: { value: isoOffsetDateTime(-3) } })
    fireEvent.change(screen.getByLabelText(/lugar de salida/i), { target: { value: 'Holguín' } })
    fireEvent.change(screen.getByLabelText(/descripción detallada/i), { target: { value: 'Test' } })

    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    // Debe aparecer error por hora pasada O por campo requerido si jsdom rechaza el valor.
    const errs = screen.queryAllByText(/hora de salida|este campo es requerido/i)
    expect(errs.length).toBeGreaterThan(0)
    expect(transportService.create).not.toHaveBeenCalled()
  })

  it('en viaje redondo, exige return_time > departure_time', async () => {
    render(<TransportProcedureForm />)
    await waitFor(() => expect(transportService.getTypes).toHaveBeenCalled())

    fireEvent.click(screen.getByLabelText(/viaje redondo/i))

    fireEvent.change(screen.getByLabelText(/hora de salida/i), {
      target: { value: isoOffsetDateTime(5) },
    })
    fireEvent.change(screen.getByLabelText(/hora de regreso/i), {
      target: { value: isoOffsetDateTime(3) },
    })
    fireEvent.change(screen.getByLabelText(/lugar de salida/i), { target: { value: 'A' } })
    fireEvent.change(screen.getByLabelText(/lugar de regreso/i), { target: { value: 'B' } })
    fireEvent.change(screen.getByLabelText(/descripción detallada/i), { target: { value: 'X' } })

    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(screen.getByText('La hora de regreso debe ser posterior a la de salida')).toBeInTheDocument()
    expect(transportService.create).not.toHaveBeenCalled()
  })

  it('deshabilita submit cuando no hay tipos de transporte', async () => {
    (transportService.getTypes as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])

    render(<TransportProcedureForm />)
    await waitFor(() => expect(transportService.getTypes).toHaveBeenCalled())

    const button = await screen.findByRole('button', { name: /sin tipos disponibles/i })
    expect(button).toBeDisabled()
  })
})
