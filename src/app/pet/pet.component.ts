import { Component, OnInit } from '@angular/core';
import { PetService } from './pet.service';
import { AuthService } from '../services/auth.service'; // 🆕 Importar AuthService

@Component({
  selector: 'app-pet',
  templateUrl: './pet.component.html',
  styleUrls: ['./pet.component.css']
})
export class PetComponent implements OnInit {

  pets: any[] = [];

  newPet = {
    fullName: '',
    petType: '',
    breed: '',
    birthDate: ''
  };

  // 🆕 Variables para obtener desde AuthService
  familyId: string = '';
  userId: string = '';

  showForm = false;
  petToDelete: any = null;
  
  isEditMode = false;
  petToEdit: any = null;

  // 🆕 Toast notifications (opcional, como en Tasks)
  showToast = false;
  toastTitle = '';
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private petService: PetService,
    private authService: AuthService // 🆕 Inyectar AuthService
  ) {}

  ngOnInit() {
    // 🆕 Obtener familyId desde AuthService
    this.familyId = this.authService.getFamilyId() || '';
    this.userId = this.authService.getUserId() || '';

    if (!this.familyId) {
      console.error('❌ No se pudo obtener el familyId del usuario autenticado');
      this.showToastNotification(
        'Error',
        'No se pudo obtener la información de la familia',
        'error'
      );
      return;
    }

    console.log(`✅ Family ID obtenido: ${this.familyId}`);
    this.loadPets();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  loadPets() {
    if (!this.familyId) return;

    this.petService.getPetsByFamily(this.familyId).subscribe({
      next: (data) => {
        this.pets = data;
        console.log(`✅ ${data.length} mascotas cargadas`);
      },
      error: (err) => {
        console.error('❌ Error cargando mascotas:', err);
        this.showToastNotification(
          'Error',
          'No se pudieron cargar las mascotas',
          'error'
        );
      }
    });
  }

  editPet(pet: any) {
    this.isEditMode = true;
    this.petToEdit = pet;
    this.showForm = true;
    
    this.newPet = {
      fullName: pet.fullName,
      petType: pet.petType,
      breed: pet.breed,
      birthDate: pet.birthDate
    };
  }

  savePet() {
    if (this.isEditMode) {
      this.updatePet();
    } else {
      this.createPet();
    }
  }

  createPet() {
    if (!this.familyId) return;

    this.petService.createPet(this.newPet, this.familyId).subscribe({
      next: (data) => {
        console.log(`✅ Mascota "${data.fullName}" creada exitosamente`);
        this.pets.push(data);
        this.resetForm();
        this.showForm = false;
        this.showToastNotification(
          'Mascota creada',
          `"${data.fullName}" ha sido creada correctamente`,
          'success'
        );
      },
      error: (err) => {
        console.error('❌ Error creando mascota:', err);
        this.showToastNotification(
          'Error',
          'No se pudo crear la mascota',
          'error'
        );
      }
    });
  }

  updatePet() {
    if (!this.petToEdit || !this.familyId) return;

    this.petService.updatePet(this.petToEdit.id, this.newPet, this.familyId).subscribe({
      next: (updatedPet) => {
        console.log(`✅ Mascota "${updatedPet.fullName}" actualizada exitosamente`);
        const index = this.pets.findIndex(p => p.id === this.petToEdit.id);
        if (index !== -1) {
          this.pets[index] = updatedPet;
        }
        this.resetForm();
        this.showForm = false;
        this.showToastNotification(
          'Mascota actualizada',
          `"${updatedPet.fullName}" ha sido actualizada correctamente`,
          'success'
        );
      },
      error: (err) => {
        console.error('❌ Error actualizando mascota:', err);
        this.showToastNotification(
          'Error',
          'No se pudo actualizar la mascota',
          'error'
        );
      }
    });
  }

  resetForm() {
    this.newPet = { fullName: '', petType: '', breed: '', birthDate: '' };
    this.isEditMode = false;
    this.petToEdit = null;
  }

  confirmDelete(pet: any) {
    this.petToDelete = pet;
  }

  cancelDelete() {
    this.petToDelete = null;
  }

  deletePetConfirmed() {
    if (this.petToDelete) {
      this.deletePet(this.petToDelete);
      this.petToDelete = null;
    }
  }

  deletePet(pet: any) {
    if (!this.familyId) return;

    this.petService.deletePet(pet.id, this.familyId).subscribe({
      next: () => {
        console.log(`✅ Mascota "${pet.fullName}" eliminada exitosamente`);
        this.pets = this.pets.filter(p => p.id !== pet.id);
        this.showToastNotification(
          'Mascota eliminada',
          `"${pet.fullName}" ha sido eliminada correctamente`,
          'success'
        );
      },
      error: (err) => {
        console.error('❌ Error borrando mascota:', err);
        this.showToastNotification(
          'Error',
          'No se pudo eliminar la mascota',
          'error'
        );
      }
    });
  }

  // 🆕 Método para mostrar notificaciones toast (opcional, como en Tasks)
  showToastNotification(title: string, message: string, type: 'success' | 'error'): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}