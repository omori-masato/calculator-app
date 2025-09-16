"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryManager = void 0;
const uuid_1 = require("uuid");
const types_1 = require("../types");
class HistoryManager {
    static history = [];
    static MAX_HISTORY_COUNT = 10;
    static saveCalculation(expression, result, type) {
        if (typeof expression !== 'string' || expression.trim() === '') {
            throw new Error('計算式が無効です');
        }
        if (typeof result !== 'number' || !isFinite(result)) {
            throw new Error('計算結果が無効です');
        }
        const historyEntry = {
            id: (0, uuid_1.v4)(),
            expression: expression.trim(),
            result: result,
            type: type,
            timestamp: new Date()
        };
        if (!(0, types_1.isCalculationHistory)(historyEntry)) {
            throw new Error('作成された履歴エントリが無効です');
        }
        this.history.unshift(historyEntry);
        if (this.history.length > this.MAX_HISTORY_COUNT) {
            this.history = this.history.slice(0, this.MAX_HISTORY_COUNT);
        }
        return historyEntry.id;
    }
    static getHistory(filter) {
        if (filter !== undefined && !(0, types_1.isHistoryFilter)(filter)) {
            throw new Error(`無効なフィルターです: ${String(filter)}`);
        }
        if (!filter || filter === 'all') {
            return [...this.history];
        }
        return this.history.filter(item => item.type === filter);
    }
    static clearHistory() {
        const deletedCount = this.history.length;
        this.history = [];
        return deletedCount;
    }
    static getHistoryCount() {
        return this.history.length;
    }
    static getHistoryById(id) {
        if (typeof id !== 'string' || id.trim() === '') {
            return undefined;
        }
        return this.history.find(item => item.id === id);
    }
    static getHistoryStatistics() {
        const stats = {
            'basic': 0,
            'tax-inclusive': 0,
            'tax-exclusive': 0
        };
        for (const item of this.history) {
            stats[item.type]++;
        }
        return stats;
    }
    static setHistoryForTesting(historyData) {
        for (const entry of historyData) {
            if (!(0, types_1.isCalculationHistory)(entry)) {
                throw new Error('無効な履歴エントリが含まれています');
            }
        }
        this.history = [...historyData];
    }
    static getHistoryForTesting() {
        return [...this.history];
    }
}
exports.HistoryManager = HistoryManager;
//# sourceMappingURL=HistoryManager.js.map