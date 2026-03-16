// src/app/notifications/notifications.component.ts

import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FsNotification } from '../models/notification.model';
import { NotificationService } from '../service/notifications/notification.service';
import { AuthService } from '../services/auth.service';

type NotificationViewMode = 'all' | 'unread' | 'recent';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  notifications: FsNotification[] = [];
  unreadCount = 0;
  loading = false;

  // para mostrar mensajes de error
  errorMessage: string | null = null;
  error: string | null = null;

  viewMode: NotificationViewMode = 'unread';

  private userId: string | null = null;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initUserIdFromToken();
  }

  // ================== MANEJO DE ERROR ==================

  private setError(message: string | null): void {
    this.errorMessage = message;
    this.error = message;
  }

  // ================== USER ID DESDE AUTH SERVICE ==================

  private initUserIdFromToken(): void {
    // 1. Verificamos si hay token válido
    if (!this.authService.isAuthenticated()) {
      this.setError('Debes iniciar sesión para ver tus notificaciones.');
      return;
    }

    // 2. Pedimos el userId al AuthService (él decodifica el token)
    const uid = this.authService.getUserId();

    if (!uid) {
      this.setError('No se pudo obtener el userId desde el token.');
      return;
    }

    this.userId = uid;

    // 3. Cargamos datos
    this.loadNotifications();
    this.loadUnreadCount();
  }

  // ================== CARGA DE DATOS ==================

  loadNotifications(): void {
    if (!this.userId) return;

    this.loading = true;
    this.setError(null);

    let request$: Observable<FsNotification[]>;

    switch (this.viewMode) {
      case 'all':
        request$ = this.notificationService.getByUserId(this.userId);
        break;
      case 'recent':
        request$ = this.notificationService.getRecentByUserId(this.userId);
        break;
      case 'unread':
      default:
        request$ = this.notificationService.getUnreadByUserId(this.userId);
        break;
    }

    request$.subscribe({
      next: (data: FsNotification[]) => {
        this.notifications = data;
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.setError('Error cargando notificaciones.');
        this.loading = false;
      },
    });
  }

  reload(): void {
    this.loadNotifications();
  }

  onChangeView(mode: NotificationViewMode): void {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    this.loadNotifications();
  }

  private loadUnreadCount(): void {
    if (!this.userId) return;

    this.notificationService.getUnreadCount(this.userId).subscribe({
      next: (count: number) => (this.unreadCount = count),
      error: (err: unknown) => console.error(err),
    });
  }

  // ================== ACCIONES ==================

  markAsRead(notification: FsNotification): void {
    if (!notification.id || notification.read) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: (updated: FsNotification) => {
        notification.read = true;
        notification.readAt = updated.readAt;
        this.loadUnreadCount();

        if (this.viewMode === 'unread') {
          this.notifications = this.notifications.filter(
            (n) => n.id !== notification.id
          );
        }
      },
      error: (err: unknown) => {
        console.error(err);
        this.setError('No se pudo marcar como leída.');
      },
    });
  }

  markAllAsRead(): void {
    if (!this.userId || this.notifications.length === 0) return;

    this.notificationService
      .markAllAsReadByUser(this.userId)
      .subscribe({
        next: () => {
          this.notifications = this.notifications.map((n) => ({
            ...n,
            read: true,
          }));
          this.loadUnreadCount();
          if (this.viewMode === 'unread') {
            this.notifications = [];
          }
        },
        error: (err: unknown) => {
          console.error(err);
          this.setError('No se pudieron marcar todas como leídas.');
        },
      });
  }

  deleteNotification(notification: FsNotification): void {
    if (!notification.id) return;
    if (!confirm('¿Eliminar esta notificación?')) return;

    this.notificationService.delete(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(
          (n) => n.id !== notification.id
        );
        this.loadUnreadCount();
      },
      error: (err: unknown) => {
        console.error(err);
        this.setError('No se pudo eliminar la notificación.');
      },
    });
  }

  deleteAllRead(): void {
    this.deleteReadNotifications();
  }

  deleteReadNotifications(): void {
    if (!this.userId) return;
    if (!confirm('¿Eliminar todas las notificaciones leídas?')) return;

    this.notificationService.deleteReadByUser(this.userId).subscribe({
      next: () => {
        if (this.viewMode === 'all') {
          this.notifications = this.notifications.filter((n) => !n.read);
        }
      },
      error: (err: unknown) => {
        console.error(err);
        this.setError('No se pudieron eliminar las notificaciones leídas.');
      },
    });
  }

  // ================== HELPERS ==================

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString();
  }
}
