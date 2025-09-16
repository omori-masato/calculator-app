"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_PATHS = void 0;
exports.isCalculationType = isCalculationType;
exports.isHistoryFilter = isHistoryFilter;
exports.isValidNumber = isValidNumber;
exports.isCalculationHistory = isCalculationHistory;
exports.API_PATHS = {
    CALCULATIONS: '/api/calculations',
    CALCULATIONS_HISTORY: '/api/calculations/history',
};
function isCalculationType(value) {
    return ['basic', 'tax-inclusive', 'tax-exclusive'].includes(value);
}
function isHistoryFilter(value) {
    return ['all', 'basic', 'tax-inclusive', 'tax-exclusive'].includes(value);
}
function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}
function isCalculationHistory(value) {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const obj = value;
    return (typeof obj['id'] === 'string' &&
        typeof obj['expression'] === 'string' &&
        isValidNumber(obj['result']) &&
        isCalculationType(obj['type']) &&
        obj['timestamp'] instanceof Date);
}
//# sourceMappingURL=index.js.map