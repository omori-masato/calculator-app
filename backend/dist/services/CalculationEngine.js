"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculationError = exports.CalculationEngine = void 0;
const types_1 = require("../types");
class CalculationEngine {
    static TAX_RATE = 0.1;
    static MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
    static MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
    static executeBasicCalculation(expression) {
        try {
            this.validateExpression(expression);
            const result = this.evaluateExpression(expression);
            this.validateResult(result, expression);
            return this.roundToSafeDecimal(result);
        }
        catch (error) {
            if (error instanceof CalculationError) {
                throw error;
            }
            throw new CalculationError('UNKNOWN_ERROR', `計算中に予期しないエラーが発生しました: ${String(error)}`, expression);
        }
    }
    static executeTaxCalculation(value, type) {
        try {
            if (!(0, types_1.isValidNumber)(value)) {
                throw new CalculationError('INVALID_EXPRESSION', '有効な数値を入力してください', String(value));
            }
            let result;
            switch (type) {
                case 'tax-inclusive':
                    result = value * (1 + this.TAX_RATE);
                    break;
                case 'tax-exclusive':
                    result = value / (1 + this.TAX_RATE);
                    break;
                default:
                    throw new CalculationError('INVALID_EXPRESSION', `無効な税計算タイプです: ${type}`, String(value));
            }
            this.validateResult(result, `${value} (${type})`);
            return Math.round(result * 100) / 100;
        }
        catch (error) {
            if (error instanceof CalculationError) {
                throw error;
            }
            throw new CalculationError('UNKNOWN_ERROR', `税計算中に予期しないエラーが発生しました: ${String(error)}`, String(value));
        }
    }
    static validateExpression(expression) {
        if (typeof expression !== 'string' || expression.trim() === '') {
            throw new CalculationError('INVALID_EXPRESSION', '計算式が空または無効です', expression);
        }
        const dangerousPatterns = [
            /[a-zA-Z_]/,
            /\(/,
            /[;:]/,
            /\[|\]/,
            /\{|\}/
        ];
        for (const pattern of dangerousPatterns) {
            if (pattern.test(expression)) {
                throw new CalculationError('INVALID_EXPRESSION', '許可されていない文字が含まれています', expression);
            }
        }
        const allowedPattern = /^[\d+\-*/.\s]+$/;
        if (!allowedPattern.test(expression)) {
            throw new CalculationError('INVALID_EXPRESSION', '許可されていない文字が含まれています', expression);
        }
        if (this.hasInvalidOperatorSequence(expression)) {
            throw new CalculationError('INVALID_EXPRESSION', '演算子の配置が不正です', expression);
        }
        return true;
    }
    static evaluateExpression(expression) {
        if (this.containsDivisionByZero(expression)) {
            throw new CalculationError('DIVISION_BY_ZERO', 'ゼロで割ることはできません', expression);
        }
        try {
            const result = Function(`"use strict"; return (${expression})`)();
            if (typeof result !== 'number') {
                throw new CalculationError('INVALID_EXPRESSION', '計算結果が数値ではありません', expression);
            }
            return result;
        }
        catch (error) {
            throw new CalculationError('INVALID_EXPRESSION', '計算式を評価できませんでした', expression);
        }
    }
    static hasInvalidOperatorSequence(expression) {
        const invalidSequences = /[+\-*/]{2,}/;
        const startsWithInvalidOperator = /^[*/]/;
        const endsWithOperator = /[+\-*/]$/;
        return invalidSequences.test(expression.replace(/^[+\-]/, '')) ||
            startsWithInvalidOperator.test(expression) ||
            endsWithOperator.test(expression.trim());
    }
    static containsDivisionByZero(expression) {
        const divisionByZeroPattern = /\/\s*0(?!\d)/;
        return divisionByZeroPattern.test(expression);
    }
    static validateResult(result, expression) {
        if (!(0, types_1.isValidNumber)(result)) {
            throw new CalculationError('INVALID_EXPRESSION', '計算結果が無効な数値です（NaN または Infinity）', expression);
        }
        if (result > this.MAX_SAFE_INTEGER) {
            throw new CalculationError('OVERFLOW', '計算結果が最大値を超えています', expression);
        }
        if (result < this.MIN_SAFE_INTEGER) {
            throw new CalculationError('UNDERFLOW', '計算結果が最小値を下回っています', expression);
        }
    }
    static roundToSafeDecimal(value) {
        const factor = Math.pow(10, 15);
        return Math.round(value * factor) / factor;
    }
}
exports.CalculationEngine = CalculationEngine;
class CalculationError extends Error {
    type;
    expression;
    constructor(type, message, expression) {
        super(message);
        this.name = 'CalculationError';
        this.type = type;
        if (expression !== undefined) {
            this.expression = expression;
        }
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CalculationError);
        }
    }
    toObject() {
        return {
            type: this.type,
            message: this.message,
            ...(this.expression ? { expression: this.expression } : {})
        };
    }
}
exports.CalculationError = CalculationError;
//# sourceMappingURL=CalculationEngine.js.map