/**
 * Base interface for all timestamped models
 */
export interface TimeStampedModel {
  id: number | string;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

/**
 * Base interface for models with UUID primary key
 */
export interface UUIDModel extends TimeStampedModel {
  id: string; // UUID
}

/**
 * Base interface for models with status tracking
 */
export interface StatusMixin {
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  is_active: boolean;
}

/**
 * Base interface for models with tracking of who created/updated them
 */
export interface TrackingMixin {
  created_by: number | null; // User ID
  updated_by: number | null; // User ID
}

/**
 * Base interface for models with soft delete capability
 */
export interface SoftDeleteMixin {
  is_deleted: boolean;
  deleted_at: string | null; // ISO 8601 date string
}

/**
 * Base interface for models with file uploads
 */
export interface FileUploadMixin {
  file: string | null; // File path or URL
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
}

/**
 * Base interface for all models
 */
export interface BaseModel extends TimeStampedModel, StatusMixin, TrackingMixin, SoftDeleteMixin {
  // Common fields can be added here
}
