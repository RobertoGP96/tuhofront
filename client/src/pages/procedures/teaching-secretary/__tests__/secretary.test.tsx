import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UnderNatProcedure } from '../UnderNatProcedure'
import { UnderInterProcedure } from '../UnderInterProcedure'
import { PostNatProcedure } from '../PostNatProcedure'
import { PostInterProcedure } from '../PostInterProcedure'
import { TitleLegalization } from '../TitleLegalization'

vi.mock('@/services/secretary-doc.service', () => ({
  secretaryDocService: { create: vi.fn().mockResolvedValue({}) },
}))
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { first_name: 'Test', last_name: 'User', email: 'test@uho.edu.cu' },
  }),
}))

import { secretaryDocService } from '@/services/secretary-doc.service'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

// Regex que captura el botón de envío en CUALQUIERA de los 5 formularios:
// "Enviar Solicitud", "Siguiente Paso", "Procesar Trámite", "Solicitar Legalización".
const SUBMIT_BUTTON = /enviar|siguiente|solicitar|procesar/i
// Label de la carrera/programa: cada formulario usa nombre distinto.
const CAREER_LABEL = /carrera|especialidad|programa|nombre del programa|maestría/i

// ---------------------------------------------------------------------------
// Validación común a TODOS los formularios (id_card 11 dígitos)
// ---------------------------------------------------------------------------
const FORMS: Array<{ name: string; Component: React.ComponentType }> = [
  { name: 'UnderNatProcedure', Component: UnderNatProcedure },
  { name: 'UnderInterProcedure', Component: UnderInterProcedure },
  { name: 'PostNatProcedure', Component: PostNatProcedure },
  { name: 'PostInterProcedure', Component: PostInterProcedure },
  { name: 'TitleLegalization', Component: TitleLegalization },
]

describe.each(FORMS)('$name validación común', ({ Component }) => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exige carné de identidad', () => {
    renderWithRouter(<Component />)
    fireEvent.change(screen.getByLabelText(/carné de identidad/i), { target: { value: '' } })

    fireEvent.click(screen.getByRole('button', { name: SUBMIT_BUTTON }))

    expect(screen.getByText('El carné de identidad es requerido')).toBeInTheDocument()
    expect(secretaryDocService.create).not.toHaveBeenCalled()
  })

  it('rechaza carné con menos de 11 dígitos', () => {
    renderWithRouter(<Component />)
    fireEvent.change(screen.getByLabelText(/carné de identidad/i), { target: { value: '12345' } })

    fireEvent.click(screen.getByRole('button', { name: SUBMIT_BUTTON }))

    expect(screen.getByText('El carné debe tener exactamente 11 dígitos numéricos')).toBeInTheDocument()
    expect(secretaryDocService.create).not.toHaveBeenCalled()
  })

  it('rechaza carné con letras', () => {
    renderWithRouter(<Component />)
    fireEvent.change(screen.getByLabelText(/carné de identidad/i), { target: { value: '0205051234A' } })

    fireEvent.click(screen.getByRole('button', { name: SUBMIT_BUTTON }))

    expect(screen.getByText('El carné debe tener exactamente 11 dígitos numéricos')).toBeInTheDocument()
    expect(secretaryDocService.create).not.toHaveBeenCalled()
  })

  it('exige carrera/programa', () => {
    renderWithRouter(<Component />)
    fireEvent.change(screen.getByLabelText(/carné de identidad/i), { target: { value: '02050512345' } })
    // No tocar el campo de carrera/programa
    fireEvent.click(screen.getByRole('button', { name: SUBMIT_BUTTON }))

    expect(screen.getByText('La carrera es requerida')).toBeInTheDocument()
    expect(secretaryDocService.create).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Formularios que SÍ exponen email/phone (UnderInter no los tiene)
// ---------------------------------------------------------------------------
const FORMS_WITH_EMAIL_PHONE: Array<{ name: string; Component: React.ComponentType }> = [
  { name: 'UnderNatProcedure', Component: UnderNatProcedure },
  { name: 'PostNatProcedure', Component: PostNatProcedure },
  { name: 'PostInterProcedure', Component: PostInterProcedure },
  { name: 'TitleLegalization', Component: TitleLegalization },
]

describe.each(FORMS_WITH_EMAIL_PHONE)('$name email/phone', ({ Component }) => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rechaza email mal formado', () => {
    renderWithRouter(<Component />)
    fireEvent.change(screen.getByLabelText(/carné de identidad/i), { target: { value: '02050512345' } })
    // El input career existe en los 5 formularios con id="career". Usamos el ID
    // porque algunos formularios tienen DOS elementos cuyo label hace match con
    // la regex (un Select de programa + el Input de carrera).
    const careerInput = document.getElementById('career') as HTMLInputElement
    fireEvent.change(careerInput, { target: { value: 'Informática' } })
    // 'foo@nodot' pasa la validación HTML5 (tiene @) pero falla nuestra regex (sin .)
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'foo@nodot' } })

    fireEvent.click(screen.getByRole('button', { name: SUBMIT_BUTTON }))

    expect(screen.getByText('Correo electrónico no válido')).toBeInTheDocument()
  })

  it('rechaza teléfono muy corto', () => {
    renderWithRouter(<Component />)
    fireEvent.change(screen.getByLabelText(/carné de identidad/i), { target: { value: '02050512345' } })
    // El input career existe en los 5 formularios con id="career". Usamos el ID
    // porque algunos formularios tienen DOS elementos cuyo label hace match con
    // la regex (un Select de programa + el Input de carrera).
    const careerInput = document.getElementById('career') as HTMLInputElement
    fireEvent.change(careerInput, { target: { value: 'Informática' } })
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '123' } })

    fireEvent.click(screen.getByRole('button', { name: SUBMIT_BUTTON }))

    expect(screen.getByText('Teléfono no válido')).toBeInTheDocument()
  })
})
