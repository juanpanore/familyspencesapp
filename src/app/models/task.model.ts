export interface Reference {
  id: string;
}

export interface Expense {
  id: string;
  name?: string;
  amount?: number;
}

export interface Vacation {
  id: string;
  name?: string;
}

export interface Task {
  id?: string;
  name: string;
  description: string;
  status: boolean;
  creationDate: string;
  idResponsible?: string;
  idExpenseve?: Reference | null;
  idVacations?: Reference | null;
}
