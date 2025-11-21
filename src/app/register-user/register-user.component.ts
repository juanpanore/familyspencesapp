import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterUserService, DocumentType, Relationship } from '../service/user/register-user.service';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent implements OnInit {

  form!: FormGroup;
  documentTypes: DocumentType[] = [];
  relationships: Relationship[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private srv: RegisterUserService) { }

  ngOnInit(): void {
    this.buildForm();
    this.loadSelects();
  }

  buildForm() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      birthDate: ['', Validators.required],
      documentTypeId: ['', Validators.required],
      document: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      relationshipId: ['', Validators.required],
      creditCard: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(19)]],
      phone: ['', [Validators.required, Validators.minLength(7)]],
      address: ['', [Validators.required, Validators.maxLength(200)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  loadSelects() {
    this.srv.getDocumentTypes().subscribe({ next: d => this.documentTypes = d, error: () => {} });
    this.srv.getRelationships().subscribe({ next: r => this.relationships = r, error: () => {} });
  }

  passwordsMatch(group: FormGroup) {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p === c ? null : { passwordsMismatch: true };
  }

  strengthScore(): number {
    const pw = this.form.get('password')?.value || '';
    let score = 0;
    if (pw.length >= 6) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  submit() {
    this.successMessage = '';
    this.errorMessage = '';
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
      relationship: { id: v.relationshipId }
    };

    this.srv.registerUser(payload).subscribe({
      next: res => {
        this.loading = false;
        this.successMessage = 'Usuario registrado correctamente.';
        this.form.reset();
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err?.error?.error || 'Error al registrar usuario.';
      }
    });
  }

  field(name: string) { return this.form.get(name); }

}
