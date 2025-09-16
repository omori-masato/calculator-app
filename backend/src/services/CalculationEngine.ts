import { CalculationType, CalculationErrorType, isValidNumber } from '../types';

/**
 * 計算エンジンクラス
 * 
 * すべての計算処理を担当し、以下の機能を提供:
 * - 四則演算の正確な実行
 * - 消費税計算（税込み・税抜き）
 * - 数式の検証とエラーハンドリング
 * - 浮動小数点演算の精度管理
 */
export class CalculationEngine {
  private static readonly TAX_RATE: number = 0.1; // 10%消費税
  private static readonly MAX_SAFE_INTEGER: number = Number.MAX_SAFE_INTEGER;
  private static readonly MIN_SAFE_INTEGER: number = Number.MIN_SAFE_INTEGER;
  // private static readonly EPSILON: number = Number.EPSILON; // 将来の精度計算で使用予定

  /**
   * 基本四則演算を実行
   * 
   * @param expression - 計算式（例: "123 + 456"）
   * @returns 計算結果
   * @throws CalculationError - 計算エラー発生時
   */
  public static executeBasicCalculation(expression: string): number {
    try {
      // 入力検証
      this.validateExpression(expression);

      // 安全な式の評価
      const result = this.evaluateExpression(expression);

      // 結果検証
      this.validateResult(result, expression);

      return this.roundToSafeDecimal(result);
    } catch (error) {
      if (error instanceof CalculationError) {
        throw error;
      }
      throw new CalculationError(
        'UNKNOWN_ERROR',
        `計算中に予期しないエラーが発生しました: ${String(error)}`,
        expression
      );
    }
  }

  /**
   * 消費税計算を実行
   * 
   * @param value - 計算対象の金額
   * @param type - 計算タイプ（tax-inclusive: 税込み, tax-exclusive: 税抜き）
   * @returns 計算結果
   * @throws CalculationError - 計算エラー発生時
   */
  public static executeTaxCalculation(value: number, type: CalculationType): number {
    try {
      // 値の検証
      if (!isValidNumber(value)) {
        throw new CalculationError(
          'INVALID_EXPRESSION',
          '有効な数値を入力してください',
          String(value)
        );
      }

      let result: number;

      switch (type) {
        case 'tax-inclusive':
          // 税込み計算: 元の金額 × (1 + 税率)
          result = value * (1 + this.TAX_RATE);
          break;

        case 'tax-exclusive':
          // 税抜き計算: 税込み金額 ÷ (1 + 税率)
          result = value / (1 + this.TAX_RATE);
          break;

        default:
          throw new CalculationError(
            'INVALID_EXPRESSION',
            `無効な税計算タイプです: ${type}`,
            String(value)
          );
      }

      // 結果検証
      this.validateResult(result, `${value} (${type})`);

      // 税計算は小数点以下2桁で丸める
      return Math.round(result * 100) / 100;
    } catch (error) {
      if (error instanceof CalculationError) {
        throw error;
      }
      throw new CalculationError(
        'UNKNOWN_ERROR',
        `税計算中に予期しないエラーが発生しました: ${String(error)}`,
        String(value)
      );
    }
  }

  /**
   * 計算式の妥当性を検証
   * 
   * @param expression - 検証対象の計算式
   * @returns 妥当な場合はtrue
   * @throws CalculationError - 不正な式の場合
   */
  public static validateExpression(expression: string): boolean {
    if (typeof expression !== 'string' || expression.trim() === '') {
      throw new CalculationError(
        'INVALID_EXPRESSION',
        '計算式が空または無効です',
        expression
      );
    }

    // 危険な文字や関数を検出
    const dangerousPatterns = [
      /[a-zA-Z_]/,  // 変数名や関数名
      /\(/,         // 括弧（現在は非対応）
      /[;:]/,       // セミコロンやコロン
      /\[|\]/,      // 角括弧
      /\{|\}/       // 波括弧
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(expression)) {
        throw new CalculationError(
          'INVALID_EXPRESSION',
          '許可されていない文字が含まれています',
          expression
        );
      }
    }

    // 許可された文字のみかチェック（数字、演算子、小数点、スペース）
    const allowedPattern = /^[\d+\-*/.\s]+$/;
    if (!allowedPattern.test(expression)) {
      throw new CalculationError(
        'INVALID_EXPRESSION',
        '許可されていない文字が含まれています',
        expression
      );
    }

    // 演算子の連続や不正な配置をチェック
    if (this.hasInvalidOperatorSequence(expression)) {
      throw new CalculationError(
        'INVALID_EXPRESSION',
        '演算子の配置が不正です',
        expression
      );
    }

    return true;
  }

  /**
   * 安全な数式評価
   * 
   * @private
   * @param expression - 評価する数式
   * @returns 計算結果
   */
  private static evaluateExpression(expression: string): number {
    // ゼロ除算のチェック
    if (this.containsDivisionByZero(expression)) {
      throw new CalculationError(
        'DIVISION_BY_ZERO',
        'ゼロで割ることはできません',
        expression
      );
    }

    // 安全な評価のため、Functionコンストラクタを使用
    // evalの代替として、よりセキュアな方法を採用
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const result = Function(`"use strict"; return (${expression})`)();
      
      if (typeof result !== 'number') {
        throw new CalculationError(
          'INVALID_EXPRESSION',
          '計算結果が数値ではありません',
          expression
        );
      }

      return result;
    } catch (error) {
      throw new CalculationError(
        'INVALID_EXPRESSION',
        '計算式を評価できませんでした',
        expression
      );
    }
  }

  /**
   * 演算子の不正な連続をチェック
   * 
   * @private
   * @param expression - チェック対象の式
   * @returns 不正な配置がある場合はtrue
   */
  private static hasInvalidOperatorSequence(expression: string): boolean {
    // 連続する演算子（++, --, **, //, +-, -+, *+, /+ など）
    const invalidSequences = /[+\-*/]{2,}/;
    
    // 演算子で始まる（+ または - で始まる場合は符号として許可）
    const startsWithInvalidOperator = /^[*/]/;
    
    // 演算子で終わる
    const endsWithOperator = /[+\-*/]$/;

    return invalidSequences.test(expression.replace(/^[+\-]/, '')) || // 先頭の符号は除外
           startsWithInvalidOperator.test(expression) ||
           endsWithOperator.test(expression.trim());
  }

  /**
   * ゼロ除算をチェック
   * 
   * @private
   * @param expression - チェック対象の式
   * @returns ゼロ除算が含まれている場合はtrue
   */
  private static containsDivisionByZero(expression: string): boolean {
    // "/0" または "/ 0" のパターンを検出
    const divisionByZeroPattern = /\/\s*0(?!\d)/;
    return divisionByZeroPattern.test(expression);
  }

  /**
   * 計算結果の妥当性を検証
   * 
   * @private
   * @param result - 検証対象の結果
   * @param expression - 元の計算式
   * @throws CalculationError - 結果が無効な場合
   */
  private static validateResult(result: number, expression: string): void {
    if (!isValidNumber(result)) {
      throw new CalculationError(
        'INVALID_EXPRESSION',
        '計算結果が無効な数値です（NaN または Infinity）',
        expression
      );
    }

    if (result > this.MAX_SAFE_INTEGER) {
      throw new CalculationError(
        'OVERFLOW',
        '計算結果が最大値を超えています',
        expression
      );
    }

    if (result < this.MIN_SAFE_INTEGER) {
      throw new CalculationError(
        'UNDERFLOW',
        '計算結果が最小値を下回っています',
        expression
      );
    }
  }

  /**
   * 浮動小数点数を安全な桁数に丸める
   * 
   * @private
   * @param value - 丸める値
   * @returns 丸められた値
   */
  private static roundToSafeDecimal(value: number): number {
    // 15桁の精度で丸める（IEEE 754 倍精度浮動小数点数の精度限界を考慮）
    const factor = Math.pow(10, 15);
    return Math.round(value * factor) / factor;
  }
}

/**
 * 計算エラークラス
 * 計算処理で発生するエラーを表現
 */
export class CalculationError extends Error {
  public readonly type: CalculationErrorType;
  public readonly expression?: string;

  constructor(type: CalculationErrorType, message: string, expression?: string) {
    super(message);
    this.name = 'CalculationError';
    this.type = type;
    if (expression !== undefined) {
      this.expression = expression;
    }
    
    // スタックトレースを正しく設定
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CalculationError);
    }
  }

  /**
   * エラー情報をオブジェクトとして取得
   */
  public toObject(): { type: CalculationErrorType; message: string; expression?: string } {
    return {
      type: this.type,
      message: this.message,
      ...(this.expression ? { expression: this.expression } : {})
    };
  }
}