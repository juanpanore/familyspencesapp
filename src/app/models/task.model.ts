export interface Expense {
    id: string;
    title: string;
    description?: string;
    period?: string;
    responsible?: string;
    value: number;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
    familyId?: string;
}
export interface Vacation {
    id: string;
    titulo: string;
}
export interface Task {
    id?: string;
    name: string;
    description: string;
    status: boolean;
    creationDate: string;
    idResponsible: string;
    familyId?: string;
    idExpenseve?: Expense | null;
    idVacations?: Vacation | null;
}
export interface CreateTaskDTO {
    name: string;
    description: string;
    status: boolean;
    creationDate: string;
    idResponsible: string;
    idExpenseve?: { id: string } | null;
    idVacations?: { id: string } | null;
}

