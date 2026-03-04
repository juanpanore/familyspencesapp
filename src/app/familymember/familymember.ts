import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
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

type UIState = 'list' | 'form';
type AlertType = 'success' | 'error' | 'processing' | null;

export function passwordMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pass    = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass && confirm && pass !== confirm ? { passwordMismatch: true } : null;
  };
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

  uiState: UIState = 'list';
  alertType: AlertType = null;
  alertMessage = '';
  maxDate = '';
  isSubmitting = false;

  passwordStrength: 'weak' | 'medium' | 'strong' | null = null;
  showCreditCard = false;
  showPassword   = false;
  showConfirm    = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private fmService: FamilymemberService
  ) {}

  ngOnInit(): void {
    this.setMaxDate();
    this.buildForm();
    this.loadCatalogs();
    this.loadList();
  }

  buildForm(): void {
    this.form = this.fb.group({
      firstName:       ['', Validators.required],
      lastName:        ['', Validators.required],
      birthDate:       ['', Validators.required],
      documentType:    ['', Validators.required],
      document:        ['', [Validators.required, Validators.minLength(6)]],
      email:           ['', [Validators.required, Validators.email]],
      relationship:    ['', Validators.required],
      creditCard:      ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
      phone:           ['', [Validators.required, Validators.pattern(/^3\d{9}$/)]],
      address:         ['', [Validators.required, Validators.minLength(5)]],
      password:        ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&._-]).{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator() });
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


  startAddMember(): void {
    this.uiState = 'form';
    this.alertType = null;
    this.passwordStrength = null;
    this.form.reset();
  }

  cancel(): void {
    this.uiState = 'list';
    this.alertType = null;
    this.passwordStrength = null;
    this.form.reset();
  }

  checkPasswordStrength(value: string): void {
    if (!value) { this.passwordStrength = null; return; }
    const hasUpper   = /[A-Z]/.test(value);
    const hasLower   = /[a-z]/.test(value);
    const hasNumber  = /\d/.test(value);
    const hasSpecial = /[@$!%#*?&._-]/.test(value);
    const score = [value.length >= 8, hasUpper, hasLower, hasNumber, hasSpecial]
      .filter(Boolean).length;
    this.passwordStrength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
  }

  onlyNumbers(event: KeyboardEvent): boolean {
  return /\d/.test(event.key);
}

loadList(): void {
  this.fmService.getFamilyMembers().subscribe({
    next: res => this.members = res,
    error: err => console.error('Error consultando miembros', err)
  });
}

save(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const familyId = this.authService.getFamilyId();
  if (!familyId) return;

  const payload: FamilyMember = {
    ...this.form.value,
    documentType: { id: this.form.value.documentType },
    relationship: { id: this.form.value.relationship },
    family:       { id: familyId }
  };

  this.isSubmitting = true;
  this.showAlert('processing', 'Registrando miembro...');

  this.fmService.addFamilyMember(payload).subscribe({
    next: () => {
      this.isSubmitting = false;
      this.uiState = 'list';
      this.passwordStrength = null;
      this.form.reset();
      this.showAlert('success', '¡Miembro registrado exitosamente!');
      this.autoDismissAlert(4000);
      setTimeout(() => this.loadList(), 1000); 
    },
    error: (err) => {
      console.error('Error registrando miembro', err);
      this.isSubmitting = false;
      const msg = err?.error?.error || err?.error?.message || 'Ocurrió un error al registrar el miembro. Verifica los datos e intenta nuevamente.';
      this.showAlert('error', msg);
    }
  });
}


  private showAlert(type: AlertType, message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }

  private autoDismissAlert(ms: number): void {
    setTimeout(() => {
      this.alertType = null;
      this.alertMessage = '';
    }, ms);
  }

  dismissAlert(): void {
    this.alertType = null;
    this.alertMessage = '';
  }



  get isProcessing(): boolean {
    return this.alertType === 'processing';
  }

  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c?.invalid && c?.touched);
  }

  private setMaxDate(): void {
    this.maxDate = new Date().toISOString().split('T')[0];
  }
}