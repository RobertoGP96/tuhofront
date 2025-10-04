// Tipos para la gestión de usuarios de la plataforma
export interface PlatformUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login?: string;
  profile: PlatformUserProfile;
  roles: Role[];
}

export interface PlatformUserProfile {
  id: number;
  user_id: number;
  phone?: string;
  address?: string;
  birth_date?: string;
  avatar?: string;
  user_type: UserType;
  department?: string;
  faculty?: string;
  student_id?: string;
  employee_id?: string;
  bio?: string;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  language: 'es' | 'en';
  theme: 'light' | 'dark' | 'auto';
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  timezone: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type: string;
  description?: string;
}

export interface UserType {
  id: number;
  name: string;
  code: 'student' | 'teacher' | 'admin' | 'secretary' | 'coordinator';
  description: string;
  permissions: Permission[];
  is_active: boolean;
}

// Tipos para notificaciones
export interface Notification {
  id: number;
  recipient: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

export interface NotificationType {
  id: number;
  name: string;
  code: 'system' | 'procedure' | 'academic' | 'announcement' | 'reminder';
  description: string;
  icon?: string;
  color?: string;
  is_active: boolean;
}

export interface NotificationPriority {
  id: number;
  name: string;
  level: 'low' | 'medium' | 'high' | 'urgent';
  color: string;
  order: number;
}

// Tipos para creación y actualización
export interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  password: string;
  user_type_id: number;
  roles?: number[];
  profile?: Partial<UserProfile>;
}

export interface UpdateUserData {
  email?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  is_active?: boolean;
  user_type_id?: number;
  roles?: number[];
}

export interface UpdateProfileData {
  phone?: string;
  address?: string;
  birth_date?: string;
  avatar?: File;
  department?: string;
  faculty?: string;
  student_id?: string;
  employee_id?: string;
  bio?: string;
  preferences?: Partial<UserPreferences>;
}

export interface CreateNotificationData {
  recipient_ids: number[];
  title: string;
  message: string;
  type_id: number;
  priority_id: number;
  action_url?: string;
  metadata?: Record<string, any>;
  send_email?: boolean;
  send_push?: boolean;
}

export interface CreateRoleData {
  name: string;
  description: string;
  permissions: number[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: number[];
  is_active?: boolean;
}

// Filtros y búsquedas
export interface UserFilters {
  search?: string;
  user_type?: string;
  is_active?: boolean;
  is_staff?: boolean;
  department?: string;
  faculty?: string;
  role_id?: number;
  created_from?: string;
  created_to?: string;
}

export interface NotificationFilters {
  is_read?: boolean;
  type_id?: number;
  priority_id?: number;
  created_from?: string;
  created_to?: string;
}

// Estadísticas
export interface UserStats {
  total_users: number;
  active_users: number;
  users_by_type: {
    students: number;
    teachers: number;
    admins: number;
    secretaries: number;
    coordinators: number;
  };
  new_users_this_month: number;
  login_stats: {
    today: number;
    this_week: number;
    this_month: number;
  };
}

export interface NotificationStats {
  total_notifications: number;
  unread_notifications: number;
  notifications_by_type: Record<string, number>;
  notifications_by_priority: Record<string, number>;
}