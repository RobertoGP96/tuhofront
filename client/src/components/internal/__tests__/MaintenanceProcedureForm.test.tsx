import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MaintenanceProcedureForm } from '../MaintenanceProcedureForm'

vi.mock('@/services/internal.service', () => ({
  maintenanceService: {
    create: vi.fn().mockResolvedValue({}),
    getTypes: vi.fn().mockResolvedValue([{ id: 1, name: 'Eléctrico' }]),
    getPriorities: vi.fn().mockResolvedValue([{ id: 1, name: 'Alta' }]),
  },
  createMaintenanceFormData: vi.fn((data) => data),
}))
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { maintenanceService } from '@/services/internal.service'
import { toast } from 'sonner'

describe('MaintenanceProcedureForm validación', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra error si descripción está vacía', async () => {
    render(<MaintenanceProcedureForm />)
    await waitFor(() => expect(maintenanceService.getTypes).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(screen.getByText('Este campo es requerido')).toBeInTheDocument()
    expect(toast.error).toHaveBeenCalled()
    expect(maintenanceService.create).not.toHaveBeenCalled()
  })

  it('deshabilita submit cuando no hay tipos cargados', async () => {
    (maintenanceService.getTypes as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])

    render(<MaintenanceProcedureForm />)
    await waitFor(() => expect(maintenanceService.getTypes).toHaveBeenCalled())

    const button = await screen.findByRole('button', { name: /sin datos disponibles/i })
    expect(button).toBeDisabled()
  })

  it('deshabilita submit cuando no hay prioridades cargadas', async () => {
    (maintenanceService.getPriorities as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])

    render(<MaintenanceProcedureForm />)
    await waitFor(() => expect(maintenanceService.getPriorities).toHaveBeenCalled())

    const button = await screen.findByRole('button', { name: /sin datos disponibles/i })
    expect(button).toBeDisabled()
  })

  it('habilita el submit cuando ambos catálogos están cargados', async () => {
    render(<MaintenanceProcedureForm />)
    const button = await screen.findByRole('button', { name: /^enviar solicitud$/i })
    await waitFor(() => expect(button).not.toBeDisabled())
  })
})
