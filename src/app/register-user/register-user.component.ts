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
  showSuccessModal = false;
  userName = "";

  constructor(
    private fb: FormBuilder,
    private srv: RegisterUserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadSelects();
  }

  buildForm() {
    this.form = this.fb.group(
      {
        firstName: ["", [Validators.required, Validators.maxLength(50)]],
        lastName: ["", [Validators.required, Validators.maxLength(50)]],
        birthDate: ["", Validators.required],
        documentTypeId: ["", Validators.required],
        document: ["", [Validators.required, Validators.maxLength(30)]],
        email: ["", [Validators.required, Validators.email]],
        relationshipId: ["", Validators.required],
        creditCard: ["", [Validators.required, Validators.minLength(12), Validators.maxLength(19)]],
        phone: ["", [Validators.required, Validators.minLength(7)]],
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

  onDateInput(event: any) {
    let value = event.target.value.replace(/\D/g, "");

    if (value.length > 8) value = value.substring(0, 8);

    let formatted = "";
    if (value.length >= 2) formatted = value.substring(0, 2);
    if (value.length >= 4) formatted += "/" + value.substring(2, 4);
    if (value.length === 8) formatted += "/" + value.substring(4, 8);

    event.target.value = formatted;

    if (value.length === 8) {
      const day = value.substring(0, 2);
      const month = value.substring(2, 4);
      const year = value.substring(4, 8);

      this.form.patchValue({ birthDate: `${year}-${month}-${day}` }, { emitEvent: false });
    }
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
      error: (err) => {
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

  openDatePicker() {
    const input: any = document.getElementById("birthDate");
    if (input && input.showPicker) {
      input.showPicker();
    }
  }

}
