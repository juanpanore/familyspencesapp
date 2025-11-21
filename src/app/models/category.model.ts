export interface Category {
    id: string;
    name: string;
    categoryType: 'INGRESO' | 'EGRESO';
    budgetPeriod: 'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'ANUAL';
    familyId?: string | null;
}
