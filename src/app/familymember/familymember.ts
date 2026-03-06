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
  firstName:       ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)*$/)]],
  lastName:        ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)*$/)]],
  birthDate:       ['', Validators.required],
  documentType:    ['', Validators.required],
  document:        ['', [Validators.required, Validators.pattern(/\S/)]],
  email:           ['', [Validators.required, Validators.email]],
  relationship:    ['', Validators.required],
  creditCard:      ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
  phone:           ['', [Validators.required, Validators.pattern(/^3\d{9}$/)]],
  address:         ['', [Validators.required, Validators.minLength(5), Validators.pattern(/\S/)]],
  password:        ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*¿?&._-]).{8,}$/)]],
  confirmPassword: ['', Validators.required]
}, { validators: passwordMatchValidator() });

  this.form.get('documentType')?.valueChanges.subscribe(selectedId => {
    const selected = this.documentTypes.find(dt => dt.id === selectedId);
    const rule     = selected ? this.documentRules[selected.type!] : null;
    const control  = this.form.get('document');
    control?.setValidators(rule
      ? [Validators.required, Validators.pattern(rule.pattern)]
      : [Validators.required]
    );
    control?.updateValueAndValidity();
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
    const hasSpecial = /[@$!%#*¿?&._-]/.test(value);
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

readonly documentRules: Record<string, { pattern: RegExp, message: string }> = {
  'Cédula de ciudadanía':               { pattern: /^\d{6,10}$/,        message: 'Debe tener entre 6 y 10 dígitos numéricos' },
  'Cédula de extranjería':              { pattern: /^\d{6,10}$/,        message: 'Debe tener entre 6 y 10 dígitos numéricos' },
  'Tarjeta de identidad':               { pattern: /^\d{10,11}$/,       message: 'Debe tener entre 10 y 11 dígitos numéricos' },
  'Registro civil':                     { pattern: /^\d{10,11}$/,       message: 'Debe tener entre 10 y 11 dígitos numéricos' },
  'Pasaporte':                          { pattern: /^[a-zA-Z0-9]{5,9}$/, message: 'Debe tener entre 5 y 9 caracteres alfanuméricos' },
  'Número de Identificación Tributaria':{ pattern: /^\d{9,10}$/,        message: 'El NIT debe tener entre 9 y 10 dígitos numéricos' },
  'Permiso especial de permanencia':    { pattern: /^[a-zA-Z0-9]{4,16}$/, message: 'Debe tener entre 4 y 16 caracteres alfanuméricos' },
};

get documentErrorMessage(): string {
  const selectedId = this.form.get('documentType')?.value;
  const selected   = this.documentTypes.find(dt => dt.id === selectedId);
  return selected ? (this.documentRules[selected.type!]?.message ?? 'Documento inválido') : 'Documento inválido';
}

readonly documentMaxLength: Record<string, number> = {
  'Cédula de ciudadanía':                10,
  'Cédula de extranjería':               10,
  'Tarjeta de identidad':                11,
  'Registro civil':                      11,
  'Pasaporte':                            9,
  'Número de Identificación Tributaria': 10,
  'Permiso especial de permanencia':     16,
};

get currentDocumentMaxLength(): number {
  const selectedId = this.form.get('documentType')?.value;
  const selected   = this.documentTypes.find(dt => dt.id === selectedId);
  return selected ? (this.documentMaxLength[selected.type!] ?? 20) : 20;
}

onDocumentKeypress(event: KeyboardEvent): boolean {
  const selectedId = this.form.get('documentType')?.value;
  const selected   = this.documentTypes.find(dt => dt.id === selectedId);
  if (!selected) return true;

  const alphanumericTypes = ['Pasaporte', 'Permiso especial de permanencia'];
  const isAlphanumeric    = alphanumericTypes.includes(selected.type!);

  if (isAlphanumeric) {
    return /^[a-zA-Z0-9]$/.test(event.key); 
  } else {
    return /^\d$/.test(event.key); 
  }
}

save(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const familyId = this.authService.getFamilyId();
  if (!familyId) return;

const v = this.form.value;

const payload: FamilyMember = {
  firstName:    v.firstName.trim(),
  lastName:     v.lastName.trim(),
  birthDate:    v.birthDate,
  document:     v.document.trim(),
  email:        v.email.trim(),
  creditCard:   v.creditCard,
  phone:        v.phone,
  address:      v.address.trim(),
  password:     v.password,
  documentType: { id: v.documentType },
  relationship: { id: v.relationship },
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