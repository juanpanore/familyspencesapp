export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  createdAt: Date;
  readAt: Date | null;
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  EXPENSE_ADDED = 'EXPENSE_ADDED',
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
  PAYMENT_DUE = 'PAYMENT_DUE'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}
