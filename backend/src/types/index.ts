/**
 * ===== 型定義同期ルール =====
 *
 * 【基本原則】一方の/types/index.tsを更新したら、もう一方の/types/index.tsも必ず同じ内容に更新する
 *
 * 【変更の責任】
 * - 型定義を変更した開発者は、両方のファイルを即座に同期させる
 * - 1つのtypes/index.tsの更新は禁止。必ず1つを更新したらもう一つも更新その場で行う。
 *
 * 【絶対に守るべき原則】
 * 1. フロントエンドとバックエンドで異なる型を作らない
 * 2. 同じデータ構造に対して複数の型を作らない
 * 3. 新しいプロパティは必ずオプショナルとして追加
 * 4. APIパスは必ずこのファイルで一元管理する
 * 5. コード内でAPIパスをハードコードしない
 * 6. 2つの同期されたtypes/index.tsを単一の真実源とする
 * 7. 大規模リファクタリングの時は型変更を最初に行い早期に問題検出
 */

// ==================== APIパス定義 ====================
export const API_PATHS = {
  CALCULATIONS: '/api/calculations',
  CALCULATIONS_HISTORY: '/api/calculations/history',
} as const;

// ==================== 計算関連の型定義 ====================

/**
 * 計算タイプの列挙
 * - basic: 基本四則演算
 * - tax-inclusive: 消費税込み計算（+10%）
 * - tax-exclusive: 消費税抜き計算（-10%）
 */
export type CalculationType = 'basic' | 'tax-inclusive' | 'tax-exclusive';

/**
 * 計算履歴エンティティ
 * 過去の計算結果を保存・表示するために使用
 */
export interface CalculationHistory {
  /** 一意識別子 */
  id: string;
  /** 計算式の文字列表現 */
  expression: string;
  /** 計算結果の数値 */
  result: number;
  /** 計算のタイプ */
  type: CalculationType;
  /** 計算実行時刻 */
  timestamp: Date;
}

/**
 * 一時保存スロット情報
 * 計算途中で値を一時的に保存するために使用
 */
export interface TemporarySaveSlot {
  /** スロット番号（1 or 2） */
  slot: 1 | 2;
  /** 保存された数値（nullの場合は空スロット） */
  value: number | null;
  /** 保存時刻（nullの場合は空スロット） */
  timestamp: Date | null;
}

/**
 * 一時保存の全体状態
 */
export interface TemporarySave {
  slot1: number | null;
  slot2: number | null;
}

/**
 * 計算機の現在状態
 * フロントエンドでの状態管理に使用
 */
export interface CalculatorState {
  /** 現在の表示値 */
  displayValue: string;
  /** 現在構築中の数式 */
  currentExpression: string;
  /** 最後の計算結果 */
  lastResult: number | null;
  /** 結果表示状態フラグ */
  isResultDisplayed: boolean;
  /** 一時保存状態 */
  temporarySave: TemporarySave;
}

/**
 * 履歴フィルターの種別
 */
export type HistoryFilter = 'all' | 'basic' | 'tax-inclusive' | 'tax-exclusive';

// ==================== API関連の型定義 ====================

/**
 * 計算実行APIのリクエスト
 * POST /api/calculations
 */
export interface CalculationRequest {
  /** 計算式 */
  expression: string;
  /** 計算タイプ */
  type: CalculationType;
}

/**
 * 計算実行APIのレスポンス
 * POST /api/calculations
 */
export interface CalculationResponse {
  /** 計算結果 */
  result: number;
  /** 履歴ID */
  historyId: string;
}

/**
 * 計算履歴取得APIのレスポンス
 * GET /api/calculations/history
 */
export interface HistoryResponse {
  /** 計算履歴の配列（新しい順） */
  history: CalculationHistory[];
}

/**
 * 履歴削除APIのレスポンス
 * DELETE /api/calculations/history
 */
export interface HistoryClearResponse {
  /** 削除完了メッセージ */
  message: string;
}

// ==================== エラー関連の型定義 ====================

/**
 * API共通エラーレスポンス
 */
export interface ApiError {
  /** エラーメッセージ */
  message: string;
  /** エラーコード */
  code?: string;
  /** 詳細情報（開発用） */
  details?: unknown;
}

/**
 * 計算エラーの種別
 */
export type CalculationErrorType = 
  | 'INVALID_EXPRESSION'    // 不正な計算式
  | 'DIVISION_BY_ZERO'      // ゼロ除算
  | 'OVERFLOW'              // 数値オーバーフロー
  | 'UNDERFLOW'             // 数値アンダーフロー
  | 'UNKNOWN_ERROR';        // その他のエラー

/**
 * 計算エラー情報
 */
export interface CalculationError {
  /** エラータイプ */
  type: CalculationErrorType;
  /** エラーメッセージ */
  message: string;
  /** エラーが発生した計算式 */
  expression?: string;
}

// ==================== ユーティリティ型 ====================

/**
 * APIレスポンスの共通構造
 */
export type ApiResponse<T> = {
  /** 成功フラグ */
  success: true;
  /** レスポンスデータ */
  data: T;
} | {
  /** 成功フラグ */
  success: false;
  /** エラー情報 */
  error: ApiError;
};

/**
 * ページネーション情報（将来拡張用）
 */
export interface Pagination {
  /** 現在のページ番号 */
  page: number;
  /** 1ページあたりの件数 */
  limit: number;
  /** 総件数 */
  total: number;
  /** 総ページ数 */
  totalPages: number;
}

/**
 * 設定情報（将来拡張用）
 */
export interface AppSettings {
  /** 消費税率（パーセント） */
  taxRate?: number;
  /** 履歴保存最大件数 */
  maxHistoryCount?: number;
  /** 計算精度（小数点以下桁数） */
  decimalPrecision?: number;
  /** 税計算の精度（小数点以下桁数） */
  taxCalculationPrecision?: number;
}

// ==================== 型ガード関数 ====================

/**
 * CalculationType型ガード
 */
export function isCalculationType(value: string): value is CalculationType {
  return ['basic', 'tax-inclusive', 'tax-exclusive'].includes(value);
}

/**
 * HistoryFilter型ガード
 */
export function isHistoryFilter(value: string): value is HistoryFilter {
  return ['all', 'basic', 'tax-inclusive', 'tax-exclusive'].includes(value);
}

/**
 * 有効な数値かどうかを判定
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * CalculationHistoryオブジェクトの型ガード
 */
export function isCalculationHistory(value: unknown): value is CalculationHistory {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj['id'] === 'string' &&
    typeof obj['expression'] === 'string' &&
    isValidNumber(obj['result']) &&
    isCalculationType(obj['type'] as string) &&
    obj['timestamp'] instanceof Date
  );
}