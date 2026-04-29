export interface Income {
  id?: string;
  title: string;
  description: string;
  period: string;
  total: number;
  responsible: { id: string };
  family: string;
}

export interface Responsible {
  id: string;
  fullName: string;
}

export interface Family {
  id: string;
  familyName: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  familyId?: string;
  family?: Family;
}
