// src/app/models/notification.model.ts

export type NotificationType = 'GENERAL' | 'REMINDER' | 'ALERT';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface FsNotification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  message: string;
  read: boolean;
  createdAt: string | Date;
  readAt?: string | Date | null;
}

export interface FsNotificationCreateRequest {
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  message: string;
}

export interface FsNotificationBulkUpdateResponse {
  updatedCount: number;
  deletedCount?: number;
}
