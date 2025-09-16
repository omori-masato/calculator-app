import { v4 as uuidv4 } from 'uuid';
import { CalculationHistory, CalculationType, HistoryFilter, isCalculationHistory, isHistoryFilter } from '../types';

/**
 * 履歴管理クラス
 * 
 * 計算履歴の管理を担当し、以下の機能を提供:
 * - 履歴の保存（最大10件制限）
 * - 履歴の取得（フィルタリング対応）
 * - 履歴の全削除
 * - メモリ内データ構造による高速アクセス
 */
export class HistoryManager {
  private static history: CalculationHistory[] = [];
  private static readonly MAX_HISTORY_COUNT: number = 10;

  /**
   * 計算履歴を保存
   * 
   * @param expression - 計算式
   * @param result - 計算結果
   * @param type - 計算タイプ
   * @returns 保存された履歴のID
   */
  public static saveCalculation(
    expression: string, 
    result: number, 
    type: CalculationType
  ): string {
    // 入力値の検証
    if (typeof expression !== 'string' || expression.trim() === '') {
      throw new Error('計算式が無効です');
    }

    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('計算結果が無効です');
    }

    // 新しい履歴エントリを作成
    const historyEntry: CalculationHistory = {
      id: uuidv4(),
      expression: expression.trim(),
      result: result,
      type: type,
      timestamp: new Date()
    };

    // 型ガードによる検証
    if (!isCalculationHistory(historyEntry)) {
      throw new Error('作成された履歴エントリが無効です');
    }

    // 履歴の先頭に追加（新しい順）
    this.history.unshift(historyEntry);

    // 最大件数を超えた場合は古いものを削除
    if (this.history.length > this.MAX_HISTORY_COUNT) {
      this.history = this.history.slice(0, this.MAX_HISTORY_COUNT);
    }

    return historyEntry.id;
  }

  /**
   * 計算履歴を取得（フィルタリング対応）
   * 
   * @param filter - フィルター条件（オプション）
   * @returns フィルタリングされた履歴配列（新しい順）
   */
  public static getHistory(filter?: HistoryFilter): CalculationHistory[] {
    // フィルターの検証
    if (filter !== undefined && !isHistoryFilter(filter)) {
      throw new Error(`無効なフィルターです: ${String(filter)}`);
    }

    // フィルターが指定されていない、または'all'の場合は全履歴を返す
    if (!filter || filter === 'all') {
      return [...this.history]; // 配列のコピーを返して外部からの変更を防ぐ
    }

    // 指定されたタイプでフィルタリング
    return this.history.filter(item => item.type === filter);
  }

  /**
   * 履歴を全削除
   * 
   * @returns 削除された件数
   */
  public static clearHistory(): number {
    const deletedCount = this.history.length;
    this.history = [];
    return deletedCount;
  }

  /**
   * 履歴件数を取得
   * 
   * @returns 現在の履歴件数
   */
  public static getHistoryCount(): number {
    return this.history.length;
  }

  /**
   * 指定されたIDの履歴を取得
   * 
   * @param id - 履歴ID
   * @returns 該当する履歴エントリ、見つからない場合はundefined
   */
  public static getHistoryById(id: string): CalculationHistory | undefined {
    if (typeof id !== 'string' || id.trim() === '') {
      return undefined;
    }

    return this.history.find(item => item.id === id);
  }

  /**
   * 履歴統計情報を取得
   * 
   * @returns 各計算タイプの件数統計
   */
  public static getHistoryStatistics(): Record<CalculationType, number> {
    const stats: Record<CalculationType, number> = {
      'basic': 0,
      'tax-inclusive': 0,
      'tax-exclusive': 0
    };

    for (const item of this.history) {
      stats[item.type]++;
    }

    return stats;
  }

  /**
   * 開発・テスト用: 履歴データを直接設定
   * 本番環境では使用しない
   * 
   * @param historyData - 設定する履歴データ
   */
  public static setHistoryForTesting(historyData: CalculationHistory[]): void {
    // 各エントリの妥当性を検証
    for (const entry of historyData) {
      if (!isCalculationHistory(entry)) {
        throw new Error('無効な履歴エントリが含まれています');
      }
    }

    this.history = [...historyData];
  }

  /**
   * 開発・テスト用: 現在の履歴データを取得
   * 本番環境では使用しない
   * 
   * @returns 現在の履歴データのコピー
   */
  public static getHistoryForTesting(): CalculationHistory[] {
    return [...this.history];
  }
}