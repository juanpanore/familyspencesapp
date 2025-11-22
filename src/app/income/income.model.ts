
// src/app/income/income.model.ts

// 1. MODELO PARA INGRESOS
export interface Income {
  id?: string;
  title: string;
  description: string;
  period: string;
  total: number;
  responsible: { id: string };
  family: string;
}

// 2. MODELO PARA RESPONSABLES (Miembros de la Familia)
export interface Responsible {
  id: string;
  fullName: string;
}

// 3. MODELO PARA LA FAMILIA (Parte del perfil)
export interface Family {
  id: string;
  familyName: string;
}

// 4. MODELO PARA EL PERFIL DE USUARIO (Devuelto por /api/users/profile)
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  familyId?: string;
  family?: Family;
}
