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
        lastName: ["", [Validators.required, Validators.maxLength(50), this.onlyLettersValidator.bind(this)]],
        birthDate: ["", Validators.required],
        documentTypeId: ["", Validators.required],
        document: ["", [Validators.required, this.onlyNumbersValidator.bind(this)]],
        email: ["", [Validators.required, Validators.email]],
        relationshipId: ["", Validators.required],
        creditCard: ["", [Validators.required, Validators.minLength(13), Validators.maxLength(19), this.onlyCreditCardNumbers.bind(this)]],
        phone: ["", [Validators.required, this.onlyPhoneNumbersValidator.bind(this)]],
        address: ["", [Validators.required, Validators.maxLength(200)]],
        password: ["", [Validators.required, Validators.minLength(6)]],
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
  }

  /** Validador personalizado: solo permite letras y espacios */
  onlyLettersValidator(control: any) {
    if (!control.value) {
      return null;
    }
    const isValid = /^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]*$/.test(control.value);
    return isValid ? null : { invalidName: true };
  }

  /** Validador personalizado: solo permite números entre 6 y 15 dígitos */
  onlyNumbersValidator(control: any) {
    if (!control.value) {
      return null;
    }
    const isValid = /^[0-9]*$/.test(control.value) && control.value.length >= 6 && control.value.length <= 15;
    if (!isValid) {
      if (!/^[0-9]*$/.test(control.value)) {
        return { invalidDocument: true };
      }
      if (control.value.length < 6 || control.value.length > 15) {
        return { invalidLength: true };
      }
    }
    return null;
  }

  /** Validador personalizado: solo permite números entre 7 y 10 dígitos para teléfono */
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
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
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
    this.router.navigate(["/"]);
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
