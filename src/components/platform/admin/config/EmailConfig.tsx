import { useState } from 'react'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import 'primeicons/primeicons.css'
import type { Email } from '../../../../types/platform/notification'
import emailMock from '../../../../../src/mocks/emailMock'

type Props = {
  initial?: Email
  onSave?: (updated: Email) => void
  onCancel?: () => void
}

/**
 * EmailConfig
 * Muestra y permite editar una configuración de correo (Email).
 * - initial: valores iniciales (si no se proporciona, se usa un objeto vacío con id -1)
 * - onSave: callback con el objeto actualizado
 * - onCancel: callback cuando el usuario cancela
 */
export default function EmailConfig({ initial, onSave, onCancel }: Props) {
  const [email, setEmail] = useState<Email>(
    initial ?? {
      id: -1,
      address: '',
      smtp_server: '',
      smtp_port: '',
      smtp_username: '',
      smtp_password: '',
    }
  )

  const [editing, setEditing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange<K extends keyof Email>(key: K, value: Email[K]) {
    setEmail(prev => ({ ...prev, [key]: value }))
  }

  function validate(e: Email) {
    if (!e.address) return 'La dirección es obligatoria'
    if (!e.smtp_server) return 'El servidor SMTP es obligatorio'
    if (!e.smtp_port) return 'El puerto SMTP es obligatorio'
    return null
  }

  function handleSave() {
    const v = validate(email)
    if (v) {
      setError(v)
      return
    }
    setError(null)

    // abrir diálogo de confirmación antes de ejecutar onSave
    confirmDialog({
      message: '¿Deseas guardar los cambios en la configuración de correo?',
      header: 'Confirmar guardado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, guardar',
      rejectLabel: 'Cancelar',
      accept: () => {
        setEditing(false)
        onSave?.(email)
      },
    })
  }

  function handleCancel() {
    setEditing(false)
    onCancel?.()
  }

  return (
    <div className="p-card" style={{ padding: 16, maxWidth: 720 }}>
      {/* PrimeReact ConfirmDialog root (necesario una sola vez por árbol) */}
      <ConfirmDialog />

      {/* Icono grande y encabezado aumentado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 68, height: 68, borderRadius: 8, background: 'var(--p-primary-color)', color: 'white', fontSize: 28 }}>
          <i className="pi pi-envelope" aria-hidden style={{ fontSize: 28 }} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 600 }}>Configuración de correo</h3>
          <small style={{ color: '#666' }}>Servidor SMTP y credenciales</small>
        </div>
      </div>

      <div className="p-fluid" style={{ marginTop: 12, width: '100%' }}>
        <div className="p-grid p-formgrid" style={{ width: '100%' }}>
          <div className="p-field p-col-12 p-md-12">
            <label htmlFor="address" className="p-d-block">Dirección (from)</label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon"><i className="pi pi-envelope" /></span>
              <InputText id="address" value={email.address} onChange={e => handleChange('address', e.target.value)} disabled={!editing} placeholder={initial?.address ?? emailMock.address} />
            </div>
          </div>

          <div className="p-field p-col-12 p-md-12">
            <label htmlFor="smtp_server" className="p-d-block">Servidor SMTP</label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon"><i className="pi pi-server" /></span>
              <InputText id="smtp_server" value={email.smtp_server} onChange={e => handleChange('smtp_server', e.target.value)} disabled={!editing} placeholder={initial?.smtp_server ?? emailMock.smtp_server} />
            </div>
          </div>

          <div className="p-field p-col-12 p-md-6">
            <label htmlFor="smtp_port" className="p-d-block">Puerto SMTP</label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon"><i className="pi pi-external-link" /></span>
              <InputText id="smtp_port" value={email.smtp_port} onChange={e => handleChange('smtp_port', e.target.value)} disabled={!editing} placeholder={initial?.smtp_port ?? emailMock.smtp_port} />
            </div>
          </div>

          <div className="p-field p-col-12 p-md-6">
            <label htmlFor="smtp_username" className="p-d-block">Usuario SMTP</label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon"><i className="pi pi-user" /></span>
              <InputText id="smtp_username" value={email.smtp_username} onChange={e => handleChange('smtp_username', e.target.value)} disabled={!editing} placeholder={initial?.smtp_username ?? emailMock.smtp_username} />
            </div>
          </div>

          <div className="p-field p-col-12 p-md-12">
            <label htmlFor="smtp_password" className="p-d-block">Contraseña SMTP</label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon"><i className="pi pi-lock" /></span>
              <InputText id="smtp_password" type="password" value={email.smtp_password} onChange={e => handleChange('smtp_password', e.target.value)} disabled={!editing} placeholder={initial?.smtp_password ?? emailMock.smtp_password} />
            </div>
          </div>
        </div>

        {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}

        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!editing ? (
            <Button label="Editar" icon="pi pi-pencil" className='p-button-primary' onClick={() => setEditing(true)} />
          ) : (
            <>
              <Button label="Guardar" icon="pi pi-save" className="p-button-primary" onClick={handleSave} />
              <Button label="Cancelar" icon="pi pi-times" className="p-button-secondary" onClick={handleCancel} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
