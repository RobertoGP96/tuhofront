// Base types
export * from './base';

// Internal types
export * from './internal/accomodation';
export * from './internal/feeding';
export * from './internal/general';
export * from './internal/mantenice';
export * from './internal/transport';

// User types
export * from './user';

// Organitation types
export * from './area';
export * from './department';

// Procedure types
export * from './procedure';
export * from './secretary';

// Content types
export * from './news';
export * from './notification';

// Re-export commonly used types for convenience
export type { UserProfile as User, UserRole, AuthResponse, LoginCredentials } from './user';

