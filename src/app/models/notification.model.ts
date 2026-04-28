// src/app/models/notification.model.ts

export type NotificationType =
  | 'INFO'
  | 'WARNING'
  | 'ERROR'
  | 'SUCCESS'
  | 'EXPENSE_ADDED'
  | 'BUDGET_EXCEEDED'
  | 'PAYMENT_DUE';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

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
  count: number;
  message: string;
}
