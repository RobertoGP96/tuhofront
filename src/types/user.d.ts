import { BaseModel } from './base';

/**
 * User role types
 */
export type UserRole = 
  | 'ADMIN'
  | 'STUDENT'
  | 'PROFESSOR'
  | 'STAFF'
  | 'EXTERNAL';

/**
 * User gender types
 */
export type UserGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

/**
 * User status types
 */
export type UserStatus = 'PENDING_ACTIVATION' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

/**
 * Base user interface
 */
export interface UserBase extends BaseModel {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  last_login: string | null; // ISO 8601 date string
  date_joined: string; // ISO 8601 date string
}

/**
 * User profile details
 */
export interface UserProfile extends UserBase {
  id_card: string; // Cuban ID card number (11 digits)
  phone: string | null; // Phone number
  address: string | null;
  date_of_birth: string | null; // ISO 8601 date string
  gender: UserGender | null;
  profile_picture: string | null; // URL to profile picture
  bio: string | null;
  
  // Academic information
  student_id: string | null;
  faculty: string | null;
  career: string | null;
  academic_year: number | null;
  
  // Additional user metadata
  user_type: UserRole;
  is_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  
  // Preferences
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

/**
 * User list item (for admin/user lists)
 */
export interface UserListItem extends Omit<UserProfile, 'preferences'> {
  full_name: string;
  role_display: string;
  status_display: string;
}

/**
 * Data needed to create a new user
 */
export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  id_card: string;
  user_type: UserRole;
  phone?: string | null;
  address?: string | null;
  date_of_birth?: string | null;
  gender?: UserGender | null;
  workplace?: string | null;
}

/**
 * Data needed to register a new user
 */
export type RegisterData = CreateUserData;

/**
 * Data needed to update an existing user
 */
export type UpdateUserData = Partial<Omit<CreateUserData, 'password' | 'password_confirm' | 'username' | 'id_card'>> & {
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
};

/**
 * User authentication response
 */
export interface AuthResponse {
  user: UserProfile;
  access: string;
  refresh: string;
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  access: string;
  refresh?: string;
}

/**
 * User login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
  remember_me?: boolean;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirm {
  token: string;
  new_password: string;
  new_password_confirm: string;
}

/**
 * User preferences update
 */
export interface UpdateUserPreferences {
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
}
