import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FamilyMember, Relationship , DocumentType } from 'src/app/familymember/familymember';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class FamilymemberService {
  private baseUrl = 'http://localhost:8080';
  private membersUrl = `${this.baseUrl}/api/v1/family/members`;
  private documentTypesUrl = `${this.baseUrl}/api/document-types`;
  private relationshipsUrl = `${this.baseUrl}/api/relationships`;

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getFamilyMembers(): Observable<FamilyMember[]> {
    const familyId = this.authService.getFamilyId();
    if (!familyId) throw new Error('FamilyId no disponible');

    return this.http.get<FamilyMember[]>(
      `${this.membersUrl}?familyId=${familyId}`,
      { headers: this.getHeaders() }
    );
  }



  addFamilyMember(member: FamilyMember): Observable<FamilyMember> {
    const familyId = this.authService.getFamilyId();
    if (!familyId) {
      throw new Error('FamilyId no disponible');
    }
    const url = `${this.membersUrl}?familyId=${familyId}`;
    return this.http.post<FamilyMember>(url, member, { headers: this.getHeaders() });
  }

    getDocumentTypesForFamilyMember(): Observable<DocumentType[]> {
    return this.http.get<DocumentType[]>(this.documentTypesUrl, { headers: this.getHeaders() });
  }

  getRelationshipsForFamilyMember(): Observable<Relationship[]> {
    return this.http.get<Relationship[]>(this.relationshipsUrl, { headers: this.getHeaders() });
  }
}
