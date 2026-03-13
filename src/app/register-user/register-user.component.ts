import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
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
  displayCreditCard = "";
  showSuccessModal = false;
  userName = "";
  maxDate: string = "";

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
        firstName: ["", [Validators.required, Validators.maxLength(50), this.onlyLettersValidator.bind(this)]],
        lastName: ["", [Validators.required, Validators.maxLength(50), this.onlyLettersValidator.bind(this), this.prohibitedNameValidator.bind(this)]],
        birthDate: ["", [Validators.required, this.validBirthDateValidator.bind(this)]],
        documentTypeId: ["", Validators.required],
        document: ["", [Validators.required, this.documentFormatValidator.bind(this)]],
        email: ["", [Validators.required, Validators.email]],
        relationshipId: ["", Validators.required],
        creditCard: ["", [Validators.required, Validators.minLength(13), Validators.maxLength(19), this.onlyCreditCardNumbers.bind(this)]],
        phone: ["", [Validators.required, this.onlyPhoneNumbersValidator.bind(this)]],
        address: ["", [Validators.required, Validators.maxLength(200)]],
        password: ["", [Validators.required, Validators.minLength(8), this.strongPasswordValidator.bind(this)]],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordsMatch },
    );
  }

  loadSelects() {
    this.srv.getDocumentTypes().subscribe({
      next: (d) => (this.documentTypes = d),
      error: () => {}
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

  /** Validador personalizado: solo permite letras y espacios */
  onlyLettersValidator(control: any) {
    if (!control.value) {
      return null;
    }
    const isValid = /^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]*$/.test(control.value);
    return isValid ? null : { invalidName: true };
  }

  /** Validador: Prohibir nombre "Cuenta Eliminada" */
  prohibitedNameValidator(control: any) {
    if (!control.value) {
      return null;
    }
    const isProhibited = control.value.trim().toLowerCase() === "cuenta eliminada";
    return isProhibited ? { prohibitedName: true } : null;
  }

  /** Validador de formato de documento según tipo */
  documentFormatValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const docType = this.form?.get('documentTypeId')?.value;
    if (!docType) {
      // Si no hay tipo de documento seleccionado, validar que sea numérico
      return /^[0-9]*$/.test(control.value) ? null : { invalidDocument: true };
    }

    const value = String(control.value);
    let isValid = false;
    let errorKey = 'invalidDocumentFormat';

    // Mapeo de tipos de documento y sus validaciones
    // 1: Cédula de ciudadanía (6-10 dígitos)
    // 2: Cédula de extranjería (6-10 dígitos)
    // 3: Tarjeta de identidad (10-11 dígitos)
    // 4: Registro civil (10-11 dígitos)
    // 5: Pasaporte (5-9 caracteres alfanuméricos)
    // 6: NIT (9-10 dígitos)
    // 7: Permiso especial de permanencia (4-16 caracteres alfanuméricos)

    switch (docType) {
      case 1: // Cédula de ciudadanía (6-10 dígitos)
      case 2: // Cédula de extranjería (6-10 dígitos)
        isValid = /^[0-9]{6,10}$/.test(value);
        if (!isValid && !/^[0-9]*$/.test(value)) errorKey = 'invalidDocument';
        if (!isValid && /^[0-9]*$/.test(value)) errorKey = 'invalidDocumentLength';
        return isValid ? null : { [errorKey]: true };

      case 3: // Tarjeta de identidad (10-11 dígitos)
      case 4: // Registro civil (10-11 dígitos)
        isValid = /^[0-9]{10,11}$/.test(value);
        if (!isValid && !/^[0-9]*$/.test(value)) errorKey = 'invalidDocument';
        if (!isValid && /^[0-9]*$/.test(value)) errorKey = 'invalidDocumentLength';
        return isValid ? null : { [errorKey]: true };

      case 5: // Pasaporte (5-9 caracteres alfanuméricos)
        isValid = /^[a-zA-Z0-9]{5,9}$/.test(value);
        return isValid ? null : { invalidDocumentFormat: true };

      case 6: // NIT (9-10 dígitos)
        isValid = /^[0-9]{9,10}$/.test(value);
        if (!isValid && !/^[0-9]*$/.test(value)) errorKey = 'invalidDocument';
        if (!isValid && /^[0-9]*$/.test(value)) errorKey = 'invalidDocumentLength';
        return isValid ? null : { [errorKey]: true };

      case 7: // Permiso especial de permanencia (4-16 caracteres alfanuméricos)
        isValid = /^[a-zA-Z0-9]{4,16}$/.test(value);
        return isValid ? null : { invalidDocumentFormat: true };

      default:
        return /^[0-9]*$/.test(value) ? null : { invalidDocument: true };
    }
  }

  /** Validador de edad según el tipo de documento */
  validBirthDateValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Validar que no sea menor de edad (menor a 18 años)
    if (age < 0) {
      return { invalidBirthDate: true };
    }

    if (isNaN(birthDate.getTime())) {
      return { invalidBirthDate: true };
    }

    const docTypeId = this.form?.get('documentTypeId')?.value;

    // Tarjeta de identidad (doc type 3): disponible solo para menores de edad
    if (docTypeId === 3 || docTypeId === '3') {
      if (age >= 18) {
        return { adultCannotUseIDCard: true };
      }
    }

    // Cédula de ciudadanía (doc type 1): disponible solo para mayores de edad
    if (docTypeId === 1 || docTypeId === '1') {
      if (age < 18) {
        return { minorCannotUseCitizenshipCard: true };
      }
    }

    return null;
  }

  /** Validador: Contraseña fuerte (mínimo 8 caracteres, mayúscula, número, carácter especial) */
  strongPasswordValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const password = control.value;
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasMinLength) {
      return { weakPassword: true };
    }

    if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
      return { insufficientPasswordStrength: true };
    }

    return null;
  }

  /** Validador personalizado: solo permite números para teléfono (7-10 dígitos) */
  onlyPhoneNumbersValidator(control: any) {
    if (!control.value) {
      return null;
    }
    const isValid = /^[0-9]*$/.test(control.value) && control.value.length >= 7 && control.value.length <= 10;
    if (!isValid) {
      if (!/^[0-9]*$/.test(control.value)) {
        return { invalidPhoneFormat: true };
      }
      if (control.value.length < 7 || control.value.length > 10) {
        return { invalidPhoneLength: true };
      }
    }
    return null;
  }

  /** Validador personalizado: solo números para tarjeta de crédito (13-19 dígitos) */
  onlyCreditCardNumbers(control: any) {
    if (!control.value) {
      return null;
    }
    const cleanValue = String(control.value).replace(/\D/g, '');
    if (!/^[0-9]*$/.test(cleanValue)) {
      return { invalidCreditCard: true };
    }
    if (cleanValue.length < 13 || cleanValue.length > 19) {
      return { invalidCreditCardLength: true };
    }
    return null;
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
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) score++;
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

  /** Sanear entrada de documento según el tipo */
  sanitizeDocumentInput(event: any) {
    const value = event.target.value || '';
    const docTypeId = this.form?.get('documentTypeId')?.value;

    let clean = value;
    // Pasaporte y Permiso especial: alfanuméricos
    if (docTypeId === 5 || docTypeId === 7 || docTypeId === '5' || docTypeId === '7') {
      clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    } else {
      // Todo lo demás: solo números
      clean = value.replace(/\D/g, '');
    }

    this.form.get('document')?.setValue(clean, { emitEvent: false });
  }

  /** Filtrar solo números en tarjeta de crédito (máx 19 dígitos) */
  formatCreditCard(event: any) {
    let value = event.target.value.replace(/\D/g, '').slice(0, 19);
    this.form.get('creditCard')?.setValue(value, { emitEvent: false });
  }

  /** Sanear entrada: permitir solo letras (incluye tildes y espacios) */
  formatOnlyLetters(event: any, fieldName: string) {
    const value = event.target.value || '';
    const clean = String(value).replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]/g, '');
    this.form.get(fieldName)?.setValue(clean, { emitEvent: false });
  }

  /** Sanear entrada: permitir solo dígitos, opcionalmente limitar longitud */
  formatOnlyDigits(event: any, fieldName: string, maxLen: number = 19) {
    const value = event.target.value || '';
    const clean = String(value).replace(/\D/g, '').slice(0, maxLen);
    this.form.get(fieldName)?.setValue(clean, { emitEvent: false });
  }

  togglePasswordVisibility(field: string) {
    if (field === "password") {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  submit() {
    this.successMessage = "";
    this.errorMessage = "";

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const v = this.form.value;

    const payload = {
      firstName: v.firstName,
      lastName: v.lastName,
      birthDate: v.birthDate,
      document: v.document,
      email: v.email,
      creditCard: v.creditCard,
      phone: v.phone,
      address: v.address,
      password: v.password,
      documentType: { id: v.documentTypeId },
      relationship: { id: v.relationshipId },
    };

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
