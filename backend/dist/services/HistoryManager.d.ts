import { CalculationHistory, CalculationType, HistoryFilter } from '../types';
export declare class HistoryManager {
    private static history;
    private static readonly MAX_HISTORY_COUNT;
    static saveCalculation(expression: string, result: number, type: CalculationType): string;
    static getHistory(filter?: HistoryFilter): CalculationHistory[];
    static clearHistory(): number;
    static getHistoryCount(): number;
    static getHistoryById(id: string): CalculationHistory | undefined;
    static getHistoryStatistics(): Record<CalculationType, number>;
    static setHistoryForTesting(historyData: CalculationHistory[]): void;
    static getHistoryForTesting(): CalculationHistory[];
}
//# sourceMappingURL=HistoryManager.d.ts.map