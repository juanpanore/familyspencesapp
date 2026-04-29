import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { Router } from "@angular/router";
import { RegisterUserService, DocumentType, Relationship } from "../service/user/register-user.service";

@Component({
  selector: "app-register-user",
  templateUrl: "./register-user.component.html",
  styleUrls: ["./register-user.component.css"],
})
export class RegisterUserComponent implements OnInit {

  form!: FormGroup;
  documentTypes: DocumentType[] = [];
  relationships: Relationship[] = [];
  loading = false;
  successMessage = "";
  errorMessage = "";
  showPassword = false;
  showConfirmPassword = false;
  showCreditCard = false;
  showSuccessModal = false;
  userName = "";
  maxDate: string = "";

  readonly documentRules: Record<string, { pattern: RegExp, message: string }> = {
    'Cédula de ciudadanía':               { pattern: /^\d{6,10}$/,          message: 'Debe tener entre 6 y 10 dígitos numéricos' },
    'Cédula de extranjería':              { pattern: /^\d{6,10}$/,          message: 'Debe tener entre 6 y 10 dígitos numéricos' },
    'Tarjeta de identidad':               { pattern: /^\d{10,11}$/,         message: 'Debe tener entre 10 y 11 dígitos numéricos' },
    'Registro civil':                     { pattern: /^\d{10,11}$/,         message: 'Debe tener entre 10 y 11 dígitos numéricos' },
    'Pasaporte':                          { pattern: /^[a-zA-Z0-9]{5,9}$/,  message: 'Debe tener entre 5 y 9 caracteres alfanuméricos' },
    'Número de Identificación Tributaria':{ pattern: /^\d{9,10}$/,          message: 'El NIT debe tener entre 9 y 10 dígitos numéricos' },
    'Permiso especial de permanencia':    { pattern: /^[a-zA-Z0-9]{4,16}$/, message: 'Debe tener entre 4 y 16 caracteres alfanuméricos' },
  };

  readonly documentMaxLength: Record<string, number> = {
    'Cédula de ciudadanía':                10,
    'Cédula de extranjería':               10,
    'Tarjeta de identidad':                11,
    'Registro civil':                      11,
    'Pasaporte':                            9,
    'Número de Identificación Tributaria': 10,
    'Permiso especial de permanencia':     16,
  };

  constructor(
    private fb: FormBuilder,
    private srv: RegisterUserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.maxDate = new Date().toISOString().split('T')[0];
    this.buildForm();
    this.loadSelects();
  }

  buildForm() {
    this.form = this.fb.group(
      {
        firstName: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)*$/)]],
        lastName: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)*$/)]],
        birthDate: ["", Validators.required],
        documentTypeId: ["", Validators.required],
        document: ["", [Validators.required, Validators.pattern(/\S/)]],
        email: ["", [Validators.required, Validators.email]],
        relationshipId: ["", Validators.required],
        creditCard: ["", [Validators.pattern(/^\d{13,19}$/)]],
        phone: ["", [Validators.required, Validators.pattern(/^3\d{9}$/)]],
        address: ["", [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
        password: ["", [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*¿?&._-]).{8,}$/)]],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordsMatch },
    );

    // Dynamic document validation based on document type
    this.form.get('documentTypeId')?.valueChanges.subscribe(selectedId => {
      const selected = this.documentTypes.find(dt => dt.id === selectedId);
      const rule = selected ? this.documentRules[selected.type] : null;
      const control = this.form.get('document');
      control?.setValidators(rule
        ? [Validators.required, Validators.pattern(rule.pattern)]
        : [Validators.required]
      );
      control?.updateValueAndValidity();
    });
  }

  loadSelects() {
    this.srv.getDocumentTypes().subscribe({
      next: (d) => (this.documentTypes = d),
      error: () => {
        this.errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté activo.';
      }
    });

    this.srv.getRelationships().subscribe({
      next: (r) => (this.relationships = r),
      error: () => {}
    });

    // Re-validar documento y fecha cuando el tipo de documento cambia
    this.form.get('documentTypeId')?.valueChanges.subscribe(() => {
      this.form.get('document')?.updateValueAndValidity();
      this.form.get('birthDate')?.updateValueAndValidity();
    });
  }

  passwordsMatch(group: FormGroup) {
    const p = group.get("password")?.value;
    const c = group.get("confirmPassword")?.value;
    return p === c ? null : { passwordsMismatch: true };
  }

  strengthScore(): number {
    const pw = this.form.get("password")?.value || "";
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[@$!#%*¿?&._-]/.test(pw)) score++;
    return score;
  }

  getStrengthColor(): string {
    const score = this.strengthScore();
    if (score <= 1) return "#ef4444";
    if (score === 2) return "#f59e0b";
    if (score === 3) return "#eab308";
    if (score === 4) return "#84cc16";
    return "#22c55e";
  }

  getStrengthWidth(): string {
    const score = this.strengthScore();
    return `${(score / 5) * 100}%`;
  }

  getStrengthText(): string {
    const score = this.strengthScore();
    if (score <= 1) return "Muy débil";
    if (score === 2) return "Débil";
    if (score === 3) return "Aceptable";
    if (score === 4) return "Fuerte";
    return "Muy fuerte";
  }


getPasswordErrors(): string[] {
  const pw: string = this.form.get('password')?.value || '';
  const errors: string[] = [];

  if (pw.length < 8)
    errors.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(pw))
    errors.push('Al menos una letra mayúscula');
  if (!/[a-z]/.test(pw))
    errors.push('Al menos una letra minúscula');
  if (!/\d/.test(pw))
    errors.push('Al menos un número');
  if (!/[@$!#%*¿?&._-]/.test(pw))
    errors.push('Al menos un carácter especial (@$!#%*¿?&._-)');

  return errors;
}

  /** Format credit card: only digits, max 19 */
  formatCreditCard(event: any) {
    let value = event.target.value.replace(/\D/g, '').slice(0, 19);
    this.form.get('creditCard')?.setValue(value, { emitEvent: false });
  }

  /** Sanitize input: only letters and spaces */
  formatOnlyLetters(event: any, fieldName: string) {
    const value = event.target.value || '';
    const clean = String(value).replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]/g, '');
    this.form.get(fieldName)?.setValue(clean, { emitEvent: false });
  }

  /** Sanitize input: only digits */
  formatOnlyDigits(event: any, fieldName: string, maxLen: number = 19) {
    const value = event.target.value || '';
    const clean = String(value).replace(/\D/g, '').slice(0, maxLen);
    this.form.get(fieldName)?.setValue(clean, { emitEvent: false });
  }

  /** Keypress filter for document field based on type */
  onDocumentKeypress(event: KeyboardEvent): boolean {
    const selectedId = this.form.get('documentTypeId')?.value;
    const selected = this.documentTypes.find(dt => dt.id === selectedId);
    if (!selected) return true;

    const alphanumericTypes = ['Pasaporte', 'Permiso especial de permanencia'];
    if (alphanumericTypes.includes(selected.type)) {
      return /^[a-zA-Z0-9]$/.test(event.key);
    }
    return /^\d$/.test(event.key);
  }

  get currentDocumentMaxLength(): number {
    const selectedId = this.form.get('documentTypeId')?.value;
    const selected = this.documentTypes.find(dt => dt.id === selectedId);
    return selected ? (this.documentMaxLength[selected.type] ?? 15) : 15;
  }

  get documentErrorMessage(): string {
    const selectedId = this.form.get('documentTypeId')?.value;
    const selected = this.documentTypes.find(dt => dt.id === selectedId);
    return selected ? (this.documentRules[selected.type]?.message ?? 'Documento inválido') : 'Documento debe tener entre 6 y 15 dígitos';
  }

  togglePasswordVisibility(field: string) {
    if (field === "password") {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  /** Validate age vs document type */
  private getAgeValidationError(): string | null {
    const birthDate = this.form.get('birthDate')?.value;
    const docTypeId = this.form.get('documentTypeId')?.value;
    if (!birthDate || !docTypeId) return null;

    const selected = this.documentTypes.find(dt => dt.id === docTypeId);
    if (!selected) return null;

    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    const isAdult = age >= 18;
    if (selected.type === 'Tarjeta de identidad' && isAdult) {
      return 'Una persona mayor de edad no puede registrarse con Tarjeta de identidad.';
    }
    if (selected.type === 'Cédula de ciudadanía' && !isAdult) {
      return 'Una persona menor de edad no puede registrarse con Cédula de ciudadanía.';
    }
    return null;
  }

  /** Validate forbidden name */
  private getForbiddenNameError(): string | null {
    const first = (this.form.get('firstName')?.value || '').trim().toLowerCase();
    const last = (this.form.get('lastName')?.value || '').trim().toLowerCase();
    if (first.includes('cuenta') || first.includes('eliminada') ||
        last.includes('cuenta') || last.includes('eliminada')) {
      return 'El nombre "Cuenta Eliminada" no está permitido.';
    }
    return null;
  }

  submit() {
    this.successMessage = "";
    this.errorMessage = "";

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Validate forbidden name
    const nameError = this.getForbiddenNameError();
    if (nameError) {
      this.errorMessage = nameError;
      return;
    }

    // Validate age vs document type
    const ageError = this.getAgeValidationError();
    if (ageError) {
      this.errorMessage = ageError;
      return;
    }

    this.loading = true;
    const v = this.form.value;

    const payload: any = {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      birthDate: v.birthDate,
      document: v.document.trim(),
      email: v.email.trim(),
      phone: v.phone,
      address: v.address.trim(),
      password: v.password,
      documentType: { id: v.documentTypeId },
      relationship: { id: v.relationshipId },
    };
    if (v.creditCard) {
      payload.creditCard = v.creditCard;
    }

    this.srv.registerUser(payload).subscribe({
      next: () => {
        this.loading = false;
        this.userName = v.firstName;
        this.showSuccessModal = true;
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.error || "Error al registrar usuario.";
      },
    });
  }

  closeModal() {
    this.showSuccessModal = false;
    this.form.reset();
    this.router.navigate(["/login"]);
  }

  field(name: string) {
    return this.form.get(name);
  }

  hasValue(fieldName: string): boolean {
    const value = this.form.get(fieldName)?.value;
    return value !== null && value !== undefined && value !== "";
  }

  isFocused(fieldName: string): boolean {
    return document.activeElement === document.getElementById(fieldName);
  }
}
