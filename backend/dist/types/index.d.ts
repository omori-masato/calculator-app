export declare const API_PATHS: {
    readonly CALCULATIONS: "/api/calculations";
    readonly CALCULATIONS_HISTORY: "/api/calculations/history";
};
export type CalculationType = 'basic' | 'tax-inclusive' | 'tax-exclusive';
export interface CalculationHistory {
    id: string;
    expression: string;
    result: number;
    type: CalculationType;
    timestamp: Date;
}
export interface TemporarySaveSlot {
    slot: 1 | 2;
    value: number | null;
    timestamp: Date | null;
}
export interface TemporarySave {
    slot1: number | null;
    slot2: number | null;
}
export interface CalculatorState {
    displayValue: string;
    currentExpression: string;
    lastResult: number | null;
    isResultDisplayed: boolean;
    temporarySave: TemporarySave;
}
export type HistoryFilter = 'all' | 'basic' | 'tax-inclusive' | 'tax-exclusive';
export interface CalculationRequest {
    expression: string;
    type: CalculationType;
}
export interface CalculationResponse {
    result: number;
    historyId: string;
}
export interface HistoryResponse {
    history: CalculationHistory[];
}
export interface HistoryClearResponse {
    message: string;
}
export interface ApiError {
    message: string;
    code?: string;
    details?: unknown;
}
export type CalculationErrorType = 'INVALID_EXPRESSION' | 'DIVISION_BY_ZERO' | 'OVERFLOW' | 'UNDERFLOW' | 'UNKNOWN_ERROR';
export interface CalculationError {
    type: CalculationErrorType;
    message: string;
    expression?: string;
}
export type ApiResponse<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: ApiError;
};
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface AppSettings {
    taxRate?: number;
    maxHistoryCount?: number;
    decimalPrecision?: number;
    taxCalculationPrecision?: number;
}
export declare function isCalculationType(value: string): value is CalculationType;
export declare function isHistoryFilter(value: string): value is HistoryFilter;
export declare function isValidNumber(value: unknown): value is number;
export declare function isCalculationHistory(value: unknown): value is CalculationHistory;
//# sourceMappingURL=index.d.ts.map