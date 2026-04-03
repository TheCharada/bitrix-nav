export type BitrixEntityType = 'im-user' | 'im-chat';

export interface BitrixRecentItem {
  id: string | number;
  title: string;
  entityType: BitrixEntityType;
  avatar?: string;
  customData?: Record<string, unknown>;
}

export interface BitrixRecentResponse {
  dialog?: {
    items?: BitrixRecentItem[];
  };
}
