import type { Email } from '../types/platform/notification'

export const emailMock: Email = {
  id: 1,
  address: 'noreply@mi-dominio.edu',
  smtp_server: 'smtp.mi-dominio.edu',
  smtp_port: '587',
  smtp_username: 'noreply@mi-dominio.edu',
  smtp_password: 'secret-password',
}

export default emailMock
