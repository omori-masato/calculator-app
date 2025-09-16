import { Request, Response, NextFunction } from 'express';
import { CalculationRequest, CalculationType, isCalculationType, ApiResponse } from '../types';

/**
 * 計算リクエストのバリデーション
 * 
 * リクエストボディの型安全性を保証し、
 * 不正なデータの早期検出を行う
 */
export function validateCalculationRequest(
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  try {
    const body = req.body as unknown;

    // リクエストボディの存在確認
    if (!body || typeof body !== 'object') {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          message: 'リクエストボディが不正です',
          code: 'INVALID_REQUEST_BODY'
        }
      };
      res.status(400).json(response);
      return;
    }

    const requestData = body as Record<string, unknown>;

    // expressionフィールドの検証
    if (typeof requestData['expression'] !== 'string') {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          message: 'expression フィールドは文字列である必要があります',
          code: 'INVALID_EXPRESSION_TYPE',
          details: {
            received: typeof requestData['expression'],
            expected: 'string'
          }
        }
      };
      res.status(400).json(response);
      return;
    }

    if ((requestData['expression'] as string).trim() === '') {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          message: 'expression フィールドは空であってはいけません',
          code: 'EMPTY_EXPRESSION'
        }
      };
      res.status(400).json(response);
      return;
    }

    // typeフィールドの検証
    if (typeof requestData['type'] !== 'string') {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          message: 'type フィールドは文字列である必要があります',
          code: 'INVALID_TYPE_FIELD',
          details: {
            received: typeof requestData['type'],
            expected: 'string'
          }
        }
      };
      res.status(400).json(response);
      return;
    }

    if (!isCalculationType(requestData['type'] as string)) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          message: `無効な計算タイプです: ${requestData['type'] as string}`,
          code: 'INVALID_CALCULATION_TYPE',
          details: {
            received: requestData['type'],
            validTypes: ['basic', 'tax-inclusive', 'tax-exclusive']
          }
        }
      };
      res.status(400).json(response);
      return;
    }

    // バリデーション成功 - 型安全なリクエストとして次のミドルウェアへ
    req.body = {
      expression: (requestData['expression'] as string).trim(),
      type: requestData['type'] as CalculationType
    } as CalculationRequest;

    next();

  } catch (error) {
    // 予期しないバリデーションエラー
    const response: ApiResponse<never> = {
      success: false,
      error: {
        message: 'バリデーション処理中にエラーが発生しました',
        code: 'VALIDATION_ERROR',
        details: process.env['NODE_ENV'] === 'development' ? String(error) : undefined
      }
    };
    res.status(500).json(response);
  }
}

/**
 * 一般的なエラーハンドリングミドルウェア
 * 
 * Express.jsの標準エラーハンドリングパターンに従い、
 * 全てのエラーを統一的にキャッチして処理する
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // エラーログの出力（本番環境では適切なロギングシステムを使用）
  console.error('予期しないエラーが発生しました:', error);

  // レスポンスが既に送信されている場合は、デフォルトのエラーハンドラーに委譲
  if (res.headersSent) {
    next(error);
    return;
  }

  // 統一されたエラーレスポンス
  const response: ApiResponse<never> = {
    success: false,
    error: {
      message: 'サーバー内部エラーが発生しました',
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env['NODE_ENV'] === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    }
  };

  res.status(500).json(response);
}

/**
 * 404 Not Foundハンドラー
 * 
 * 定義されていないルートに対する統一的な404レスポンス
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse<never> = {
    success: false,
    error: {
      message: `リクエストされたエンドポイントが見つかりません: ${req.method} ${req.path}`,
      code: 'NOT_FOUND',
      details: {
        method: req.method,
        path: req.path,
        availableEndpoints: [
          'POST /api/calculations',
          'GET /api/calculations/history',
          'DELETE /api/calculations/history',
          'GET /api/calculations/history/stats'
        ]
      }
    }
  };

  res.status(404).json(response);
}