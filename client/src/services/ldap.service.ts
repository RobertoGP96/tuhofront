import apiClient from '../lib/api-client';
import type { UserRole } from '../types/auth.types';

export type LdapGroupType =
  | 'GroupOfNamesType'
  | 'PosixGroupType'
  | 'ActiveDirectoryGroupType'
  | 'NestedActiveDirectoryGroupType';

export type LdapTlsRequireCert = 'never' | 'allow' | 'demand' | 'hard';

/**
 * Proveedores de autenticación externa soportados. Para añadir uno nuevo
 * (OAuth2, SAML, ...) se debe extender este tipo y la enum del backend
 * (`LdapConfig.PROVIDER_CHOICES`).
 */
export type AuthProvider = 'ldap' | 'http_api';

export type HttpApiMethod = 'POST' | 'GET';

export interface LdapConfig {
  id: number;
  enabled: boolean;
  provider: AuthProvider;

  // ----- LDAP -----
  server_uri: string;
  use_start_tls: boolean;
  connect_timeout: number;
  tls_require_cert: LdapTlsRequireCert;
  bind_dn: string;
  user_search_base: string;
  user_search_filter: string;
  attr_username: string;
  attr_email: string;
  attr_first_name: string;
  attr_last_name: string;
  attr_id_card: string;
  group_search_base: string;
  group_search_filter: string;
  group_type: LdapGroupType;

  // ----- HTTP API -----
  http_api_base_url: string;
  http_api_login_path: string;
  http_api_method: HttpApiMethod;
  http_api_username_field: string;
  http_api_password_field: string;
  http_api_extra_headers: Record<string, string>;
  http_api_verify_ssl: boolean;
  http_api_timeout: number;
  http_api_success_field: string;
  http_api_user_path: string;
  http_api_attr_username: string;
  http_api_attr_email: string;
  http_api_attr_first_name: string;
  http_api_attr_last_name: string;
  http_api_attr_id_card: string;
  http_api_attr_personal_photo: string;
  http_api_groups_path: string;
  http_api_email_template: string;

  // ----- Comunes -----
  group_to_role_map: Record<string, UserRole>;
  default_role: UserRole;
  make_staff_groups: string[];
  make_superuser_groups: string[];
  auto_create_users: boolean;
  fallback_to_local: boolean;
  sync_on_login: boolean;

  last_test_at: string | null;
  last_test_ok: boolean | null;
  last_test_message: string;

  updated_at: string;
  updated_by: number | null;

  // Solo GET: presencia de secrets en el entorno del backend.
  bind_password_present?: boolean;
  http_api_token_present?: boolean;
}

export interface LdapTestRequest {
  // LDAP overrides
  server_uri?: string;
  bind_dn?: string;
  bind_password?: string;
  user_search_base?: string;
  user_search_filter?: string;
  group_search_base?: string;
  group_search_filter?: string;
  // HTTP API overrides
  http_api_base_url?: string;
  http_api_login_path?: string;
  http_api_method?: HttpApiMethod;
  http_api_username_field?: string;
  http_api_password_field?: string;
  http_api_extra_headers?: Record<string, string>;
  // Comunes
  test_username?: string;
  test_password?: string;
}

/**
 * Atributos extraídos por el provider HTTP API después de un `test()`.
 * Cada campo refleja lo que se mapearía al modelo `User` en un login real.
 */
export interface ExtractedAttrs {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  id_card?: string;
  personal_photo?: string;
  groups?: string[];
}

export interface LdapTestResponse {
  ok: boolean;
  message: string;
  details: Record<string, unknown>;
  bind_ok?: boolean;
  user_dn?: string | null;
  user_attrs?: Record<string, string[]> | null;
  groups?: string[];
  status?: number;
  extracted?: ExtractedAttrs;
}

export const ldapService = {
  async getConfig(): Promise<LdapConfig> {
    const { data } = await apiClient.get<LdapConfig>('/settings/ldap/');
    return data;
  },

  async updateConfig(patch: Partial<LdapConfig>): Promise<LdapConfig> {
    const { data } = await apiClient.patch<LdapConfig>('/settings/ldap/', patch);
    return data;
  },

  async testConnection(payload: LdapTestRequest = {}): Promise<LdapTestResponse> {
    const { data } = await apiClient.post<LdapTestResponse>('/settings/ldap/test/', payload);
    return data;
  },
};
