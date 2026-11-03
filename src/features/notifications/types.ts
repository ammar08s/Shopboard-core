export type NotificationTone = 'success' | 'info' | 'warning' | 'error';

export interface NotificationInput {
  title: string;
  message: string;
  tone?: NotificationTone;
  announce?: boolean;
}

export interface Notification extends NotificationInput {
  id: number;
  tone: NotificationTone;
}

export type Notify = (notification: NotificationInput) => void;
