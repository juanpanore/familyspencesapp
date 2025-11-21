import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { FamilymemberService } from '../service/familymember/familymember';
import { AuthService } from '../services/auth.service';

export interface FamilyMember {
  id?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  documentType: DocumentType;
  document: string;
  email: string;
  relationship: Relationship;
  creditCard: string;
  phone: string;
  address: string;
  password: string;
  family?: any;
}

export interface DocumentType {
  id: number;
  type?: string;
}

export interface Relationship {
  id: number;
  type?: string;
}

@Component({
  selector: 'app-familymember',
  templateUrl: './familymember.html',
  styleUrls: ['./familymember.css']
})
export class FamilymemberComponent implements OnInit {

  form!: FormGroup;
  members: FamilyMember[] = [];
  relationships: Relationship[] = [];
  documentTypes: DocumentType[] = [];

  isAddingMember = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private fmService: FamilymemberService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCatalogs();
    this.loadList();
  }

  buildForm(): void {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      documentType: ['', Validators.required],
      document: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      relationship: ['', Validators.required],
      creditCard: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^3\d{9}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/)
      ]]
    });
  }

  loadCatalogs(): void {
    this.fmService.getDocumentTypesForFamilyMember().subscribe({
      next: res => this.documentTypes = res,
      error: err => console.error('Error cargando documentos', err)
    });

    this.fmService.getRelationshipsForFamilyMember().subscribe({
      next: res => this.relationships = res,
      error: err => console.error('Error cargando relaciones', err)
    });
  }

  loadList(): void {
    this.fmService.getFamilyMembers().subscribe({
      next: res => this.members = res,
      error: err => console.error('Error consultando miembros', err)
    });
  }

  startAddMember(): void {
    this.isAddingMember = true;
    this.form.reset();
  }

  cancel(): void {
    this.isAddingMember = false;
    this.form.reset();
  }

  save(): void {
    if (this.form.invalid) return;

    const familyId = this.authService.getFamilyId();
    if (!familyId) return;

    const payload: FamilyMember = {
      ...this.form.value,
      documentType: { id: this.form.value.documentType },
      relationship: { id: this.form.value.relationship },
      family: { id: familyId }
    };

    this.fmService.addFamilyMember(payload).subscribe({
      next: () => {
        this.isAddingMember = false;
        this.form.reset();
        this.loadList();
      },
      error: err => console.error('Error creando miembro', err)
    });
  }
}
