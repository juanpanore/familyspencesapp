import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

export interface AccountProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  relationship: { id: string; type: string } | null;
  family: { id: string; familyName: string } | null;
}

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getProfileById(userId: string): Observable<AccountProfile> {
    return this.http.get<AccountProfile>(
      `${this.apiUrl}/by-id/${userId}`,
      { headers: this.getHeaders() }
    );
  }

  updateProfile(email: string, data: ProfileUpdate): Observable<AccountProfile> {
    return this.http.patch<AccountProfile>(
      `${this.apiUrl}/${encodeURIComponent(email)}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  changePassword(email: string, payload: ChangePasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/${encodeURIComponent(email)}/change-password`,
      payload,
      { headers: this.getHeaders() }
    );
  }
}
