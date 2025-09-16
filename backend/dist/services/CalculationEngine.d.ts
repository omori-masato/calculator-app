import { CalculationType, CalculationErrorType } from '../types';
export declare class CalculationEngine {
    private static readonly TAX_RATE;
    private static readonly MAX_SAFE_INTEGER;
    private static readonly MIN_SAFE_INTEGER;
    static executeBasicCalculation(expression: string): number;
    static executeTaxCalculation(value: number, type: CalculationType): number;
    static validateExpression(expression: string): boolean;
    private static evaluateExpression;
    private static hasInvalidOperatorSequence;
    private static containsDivisionByZero;
    private static validateResult;
    private static roundToSafeDecimal;
}
export declare class CalculationError extends Error {
    readonly type: CalculationErrorType;
    readonly expression?: string;
    constructor(type: CalculationErrorType, message: string, expression?: string);
    toObject(): {
        type: CalculationErrorType;
        message: string;
        expression?: string;
    };
}
//# sourceMappingURL=CalculationEngine.d.ts.map