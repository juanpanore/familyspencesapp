import { Component, OnInit } from '@angular/core';
import { PetService } from './pet.service';

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

  // ID de familia
  familyId = '63580465-40d8-4b3e-b665-183ce642f880';

  showForm = false;
  petToDelete: any = null;
  

  isEditMode = false;
  petToEdit: any = null;

  constructor(private petService: PetService) {}

  ngOnInit() {
    this.loadPets();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  loadPets() {
    this.petService.getPetsByFamily(this.familyId).subscribe({
      next: (data) => {
        this.pets = data;
      },
      error: (err) => console.error('Error cargando mascotas:', err)
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
    this.petService.createPet(this.newPet, this.familyId).subscribe({
      next: (data) => {
        this.pets.push(data);
        this.resetForm();
        this.showForm = false;
      },
      error: (err) => console.error('Error creando mascota:', err)
    });
  }

  updatePet() {
    if (this.petToEdit) {
      this.petService.updatePet(this.petToEdit.id, this.newPet, this.familyId).subscribe({
        next: (updatedPet) => {
          const index = this.pets.findIndex(p => p.id === this.petToEdit.id);
          if (index !== -1) {
            this.pets[index] = updatedPet;
          }
          this.resetForm();
          this.showForm = false;
        },
        error: (err) => console.error('Error actualizando mascota:', err)
      });
    }
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
    this.petService.deletePet(pet.id, this.familyId).subscribe({
      next: () => {
        this.pets = this.pets.filter(p => p.id !== pet.id);
      },
      error: (err) => console.error('Error borrando mascota:', err)
    });
  }
}