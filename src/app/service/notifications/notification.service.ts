// src/app/service/notifications/notification.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FsNotification,
  FsNotificationBulkUpdateResponse,
  FsNotificationCreateRequest,
  NotificationPriority,
  NotificationType,
} from '../../models/notification.model';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api/v1/notifications';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getAll(): Observable<FsNotification[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<FsNotification[]>(this.apiUrl, { headers });
  }

  getByUserId(userId: string): Observable<FsNotification[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<FsNotification[]>(`${this.apiUrl}/user/${userId}`, {
      headers,
    });
  }

  getUnreadByUserId(userId: string): Observable<FsNotification[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<FsNotification[]>(
      `${this.apiUrl}/user/${userId}/unread`,
      { headers }
    );
  }

  getUnreadCount(userId: string): Observable<number> {
    const headers = this.getAuthHeaders();
    return this.http.get<number>(
      `${this.apiUrl}/user/${userId}/unread/count`,
      { headers }
    );
  }

  getRecentByUserId(userId: string): Observable<FsNotification[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<FsNotification[]>(
      `${this.apiUrl}/user/${userId}/recent`,
      { headers }
    );
  }

  getByUserIdAndType(
    userId: string,
    type: NotificationType
  ): Observable<FsNotification[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<FsNotification[]>(
      `${this.apiUrl}/user/${userId}/type/${type}`,
      { headers }
    );
  }

  getByUserIdAndPriority(
    userId: string,
    priority: NotificationPriority
  ): Observable<FsNotification[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<FsNotification[]>(
      `${this.apiUrl}/user/${userId}/priority/${priority}`,
      { headers }
    );
  }

  create(request: FsNotificationCreateRequest): Observable<FsNotification> {
    const headers = this.getAuthHeaders();
    return this.http.post<FsNotification>(this.apiUrl, request, { headers });
  }

  markAsRead(id: string): Observable<FsNotification> {
    const headers = this.getAuthHeaders();
    return this.http.put<FsNotification>(
      `${this.apiUrl}/${id}/read`,
      {},
      { headers }
    );
  }

  markAllAsReadByUser(
    userId: string
  ): Observable<FsNotificationBulkUpdateResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<FsNotificationBulkUpdateResponse>(
      `${this.apiUrl}/user/${userId}/read-all`,
      {},
      { headers }
    );
  }

  delete(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  deleteReadByUser(
    userId: string
  ): Observable<FsNotificationBulkUpdateResponse> {
    const headers = this.getAuthHeaders();
    return this.http.delete<FsNotificationBulkUpdateResponse>(
      `${this.apiUrl}/user/${userId}/read`,
      { headers }
    );
  }
}
