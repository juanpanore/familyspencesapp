export enum CategoryType {
    ALIMENTACION = 'ALIMENTACION',
    CUENTAS_Y_SERVICIOS = 'CUENTAS_Y_SERVICIOS',
    VIVIENDA = 'VIVIENDA',
    TRANSPORTE = 'TRANSPORTE',
    EDUCACION = 'EDUCACION',
    ROPA = 'ROPA',
    SALUD = 'SALUD',
    TECNOLOGIA = 'TECNOLOGIA',
    SEGUROS = 'SEGUROS',
    DEPORTE = 'DEPORTE',
    OCIO = 'OCIO',
    OTROS = 'OTROS'
}

export enum BudgetPeriod {
    DIARIO = 'DIARIO',
    SEMANAL = 'SEMANAL',
    QUINCENAL = 'QUINCENAL',
    MENSUAL = 'MENSUAL',
    BIMESTRAL = 'BIMESTRAL',
    TRIMESTRAL = 'TRIMESTRAL',
    SEMESTRAL = 'SEMESTRAL',
    ANUAL = 'ANUAL'
}

export interface Category {
    id?: string;
    familyId?: string;
    name: string;

    categoryType: CategoryType;
    description?: string;
    allocatedBudget: number;
    budgetPeriod: BudgetPeriod;
}
