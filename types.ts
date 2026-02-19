/**
 * Barrel File - Flux Platform Types Ecosystem
 * Este arquivo centraliza todas as exportações dos tipos modulares.
 */

export * from '../tipos/dna.types'';
export * from '../tipos/user.types'';
export * from '../tipos/ads.types'';
export * from '../tipos/groups.types'';
export * from '../tipos/marketplace.types'';
export * from '../tipos/financial.types'';
export * from '../tipos/social.types'';

// Tipos utilitários globais
export interface PaginatedResponse<T> {
    data: T[];
    nextCursor?: number;
}

export interface Story {
    id: string;
    userId: string;
    username: string;
    userAvatar?: string;
    mediaUrl: string;
    type: 'image' | 'video';
    timestamp: number;
    viewed: boolean;
}

export type AppEventSource = 'frontend' | 'backend' | 'payment_gateway' | 'auth_service' | 'moderation_service';

export type AppEventType = 
  | 'user_login' | 'user_register' | 'user_error'
  | 'payment_intent' | 'payment_success' | 'payment_fail'
  | 'content_created' | 'content_deleted' | 'content_flagged'
  | 'group_joined' | 'group_created' | 'group_vip_access_granted'
  | 'system_health_check' | 'system_config_change';

export interface AppEvent {
  event_id: string;
  source: AppEventSource;
  type: AppEventType;
  timestamp: number;
  payload: any;
  user_id?: string;
  session_id?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  modelName: string;
  supportsSearch: boolean;
  supportsImages: boolean;
}
