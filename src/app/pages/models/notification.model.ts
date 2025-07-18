// src/app/models/notification.model.ts
export interface NotificationModel {
  id: string;
  message: string;
  type?: string;
  created_at: string;
  is_read?: boolean;
  receiver_id?: string;
}
