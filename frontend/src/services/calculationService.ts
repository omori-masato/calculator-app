/**
 * 計算サービス
 * 計算ロジック、履歴管理、一時保存機能を提供
 */
import { 
  CalculationType, 
  CalculationHistory, 
  CalculatorState, 
  TemporarySave,
  isValidNumber,
  isCalculationType 
} from '../types/index';

export class CalculationService {
  private static instance: CalculationService;

  private constructor() {}

  public static getInstance(): CalculationService {
    if (!CalculationService.instance) {
      CalculationService.instance = new CalculationService();
    }
    return CalculationService.instance;
  }

  /**
   * 基本四則演算の実行
   */
  public executeBasicCalculation(expression: string): number {
    try {
      // 安全な計算式の作成（×と÷を*と/に変換）
      const safeExpression = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^0-9+\-*/.() ]/g, ''); // 不正な文字を除去
      
      // eval の代わりに Function コンストラクタを使用（より安全）
      const result = Function(`"use strict"; return (${safeExpression})`)();
      
      if (!isValidNumber(result)) {
        throw new Error('Invalid calculation result');
      }

      // 浮動小数点の精度問題を解決
      return Math.round(result * 100000000) / 100000000;
    } catch (error) {
      throw new Error('計算式が無効です');
    }
  }

  /**
   * 消費税計算の実行
   */
  public executeTaxCalculation(value: number, type: CalculationType): number {
    if (!isValidNumber(value)) {
      throw new Error('無効な数値です');
    }

    let result: number;
    
    switch (type) {
      case 'tax-inclusive':
        result = Math.round(value * 1.1 * 100) / 100;
        break;
      case 'tax-exclusive':
        result = Math.round((value / 1.1) * 100) / 100;
        break;
      default:
        throw new Error('無効な税計算タイプです');
    }

    if (!isValidNumber(result)) {
      throw new Error('税計算でエラーが発生しました');
    }

    return result;
  }

  /**
   * 計算式の検証
   */
  public validateExpression(expression: string): boolean {
    if (!expression || typeof expression !== 'string') {
      return false;
    }

    // 基本的な文字のみ許可
    const allowedChars = /^[0-9+\-*/.×÷() ]+$/;
    if (!allowedChars.test(expression)) {
      return false;
    }

    // 括弧の対応確認
    let openCount = 0;
    for (const char of expression) {
      if (char === '(') openCount++;
      if (char === ')') openCount--;
      if (openCount < 0) return false;
    }
    
    return openCount === 0;
  }
}

/**
 * 履歴管理サービス
 */
export class HistoryService {
  private static readonly STORAGE_KEY = 'calculatorHistory';
  private static readonly MAX_HISTORY_COUNT = 10;

  /**
   * 計算履歴を保存
   */
  public static saveCalculation(calculation: Omit<CalculationHistory, 'id'>): void {
    try {
      const history = this.getHistory();
      const newCalculation: CalculationHistory = {
        ...calculation,
        id: Date.now().toString(),
      };

      history.unshift(newCalculation);
      
      // 最大件数を超えた場合は古い履歴を削除
      if (history.length > this.MAX_HISTORY_COUNT) {
        history.splice(this.MAX_HISTORY_COUNT);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('履歴保存に失敗しました:', error);
    }
  }

  /**
   * 計算履歴を取得
   */
  public static getHistory(): CalculationHistory[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const history = JSON.parse(stored);
      
      // 型安全性の確保
      return history
        .map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        .filter((item: any): item is CalculationHistory => 
          typeof item.id === 'string' &&
          typeof item.expression === 'string' &&
          isValidNumber(item.result) &&
          isCalculationType(item.type) &&
          item.timestamp instanceof Date
        );
    } catch (error) {
      console.error('履歴取得に失敗しました:', error);
      return [];
    }
  }

  /**
   * 履歴をフィルタリング
   */
  public static getFilteredHistory(filter: string): CalculationHistory[] {
    const allHistory = this.getHistory();
    
    if (filter === 'all') {
      return allHistory;
    }

    if (isCalculationType(filter)) {
      return allHistory.filter(item => item.type === filter);
    }

    return allHistory;
  }

  /**
   * すべての履歴を削除
   */
  public static clearAllHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('履歴削除に失敗しました:', error);
    }
  }

  /**
   * サンプル履歴データの初期化
   */
  public static initializeSampleHistory(): void {
    const existingHistory = this.getHistory();
    if (existingHistory.length === 0) {
      const sampleHistory: Omit<CalculationHistory, 'id'>[] = [
        { expression: '1500 + 税10%', result: 1650, type: 'tax-inclusive', timestamp: new Date(Date.now() - 60000) },
        { expression: '100 + 200', result: 300, type: 'basic', timestamp: new Date(Date.now() - 120000) },
        { expression: '1100 - 税10%', result: 1000, type: 'tax-exclusive', timestamp: new Date(Date.now() - 180000) },
        { expression: '50 × 3', result: 150, type: 'basic', timestamp: new Date(Date.now() - 240000) },
        { expression: '2000 + 税10%', result: 2200, type: 'tax-inclusive', timestamp: new Date(Date.now() - 300000) },
        { expression: '25 + 25', result: 50, type: 'basic', timestamp: new Date(Date.now() - 360000) }
      ];

      sampleHistory.forEach(item => this.saveCalculation(item));
    }
  }
}

/**
 * 一時保存サービス
 */
export class TemporarySaveService {
  private static readonly STORAGE_KEY = 'calculatorTempSave';

  /**
   * 値を指定スロットに保存
   */
  public static saveToSlot(slot: 1 | 2, value: number): void {
    if (!isValidNumber(value)) {
      throw new Error('無効な数値です');
    }

    try {
      const currentSave = this.getTemporarySave();
      currentSave[`slot${slot}`] = value;
      
      // セッションストレージを使用（ブラウザ閉鎖時に削除される）
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentSave));
    } catch (error) {
      console.error(`スロット${slot}への保存に失敗しました:`, error);
    }
  }

  /**
   * 指定スロットから値を取得
   */
  public static recallFromSlot(slot: 1 | 2): number | null {
    try {
      const currentSave = this.getTemporarySave();
      return currentSave[`slot${slot}`];
    } catch (error) {
      console.error(`スロット${slot}からの取得に失敗しました:`, error);
      return null;
    }
  }

  /**
   * 一時保存の全体状態を取得
   */
  public static getTemporarySave(): TemporarySave {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return { slot1: null, slot2: null };
      }

      const parsed = JSON.parse(stored);
      return {
        slot1: isValidNumber(parsed.slot1) ? parsed.slot1 : null,
        slot2: isValidNumber(parsed.slot2) ? parsed.slot2 : null,
      };
    } catch (error) {
      console.error('一時保存データの取得に失敗しました:', error);
      return { slot1: null, slot2: null };
    }
  }

  /**
   * 全ての一時保存をクリア
   */
  public static clearAll(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('一時保存のクリアに失敗しました:', error);
    }
  }
}