import { Router, Request, Response } from 'express';
import { 
  CalculationRequest, 
  CalculationResponse, 
  HistoryResponse, 
  HistoryClearResponse,
  ApiResponse,
  HistoryFilter,
  isHistoryFilter
} from '../types';
import { CalculationEngine, CalculationError } from '../services/CalculationEngine';
import { HistoryManager } from '../services/HistoryManager';
import { validateCalculationRequest } from '../middleware/validation';

const router = Router();

/**
 * POST /api/calculations
 * 計算を実行し、結果を履歴に保存
 */
router.post('/', validateCalculationRequest, async (req: Request, res: Response) => {
  try {
    const { expression, type }: CalculationRequest = req.body;

    let result: number;

    // 計算タイプに応じて計算を実行
    if (type === 'basic') {
      result = CalculationEngine.executeBasicCalculation(expression);
    } else if (type === 'tax-inclusive' || type === 'tax-exclusive') {
      // 税計算の場合、expressionを数値として解析
      const value = parseFloat(expression);
      if (isNaN(value)) {
        throw new CalculationError(
          'INVALID_EXPRESSION',
          '税計算には有効な数値を入力してください',
          expression
        );
      }
      result = CalculationEngine.executeTaxCalculation(value, type);
    } else {
      throw new CalculationError(
        'INVALID_EXPRESSION',
        `不明な計算タイプです: ${String(type)}`,
        expression
      );
    }

    // 履歴に保存
    const historyId = HistoryManager.saveCalculation(expression, result, type);

    // 成功レスポンス
    const responseData: CalculationResponse = {
      result,
      historyId
    };

    const response: ApiResponse<CalculationResponse> = {
      success: true,
      data: responseData
    };

    res.status(200).json(response);

  } catch (error) {
    // エラーハンドリング
    if (error instanceof CalculationError) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          message: error.message,
          code: error.type,
          details: {
            expression: error.expression,
            type: error.type
          }
        }
      };
      res.status(400).json(response);
    } else {
      // 予期しないエラー
      const response: ApiResponse<never> = {
        success: false,
        error: {
          message: 'サーバー内部エラーが発生しました',
          code: 'INTERNAL_SERVER_ERROR',
          details: process.env['NODE_ENV'] === 'development' ? String(error) : undefined
        }
      };
      res.status(500).json(response);
    }
  }
});

/**
 * GET /api/calculations/history
 * 計算履歴を取得（フィルタリング対応）
 */
router.get('/history', (req: Request, res: Response) => {
  try {
    const filterParam = req.query['filter'] as string | undefined;
    let filter: HistoryFilter | undefined;

    // フィルターパラメータの検証
    if (filterParam !== undefined) {
      if (!isHistoryFilter(filterParam)) {
        const response: ApiResponse<never> = {
          success: false,
          error: {
            message: `無効なフィルターです: ${filterParam}`,
            code: 'INVALID_FILTER',
            details: {
              validFilters: ['all', 'basic', 'tax-inclusive', 'tax-exclusive']
            }
          }
        };
        res.status(400).json(response);
        return;
      }
      filter = filterParam;
    }

    // 履歴を取得
    const history = HistoryManager.getHistory(filter);

    // 成功レスポンス
    const responseData: HistoryResponse = {
      history
    };

    const response: ApiResponse<HistoryResponse> = {
      success: true,
      data: responseData
    };

    res.status(200).json(response);

  } catch (error) {
    // エラーハンドリング
    const response: ApiResponse<never> = {
      success: false,
      error: {
        message: '履歴取得中にエラーが発生しました',
        code: 'HISTORY_FETCH_ERROR',
        details: process.env['NODE_ENV'] === 'development' ? String(error) : undefined
      }
    };
    res.status(500).json(response);
  }
});

/**
 * DELETE /api/calculations/history
 * 計算履歴を全削除
 */
router.delete('/history', (_req: Request, res: Response) => {
  try {
    // 履歴を全削除
    const deletedCount = HistoryManager.clearHistory();

    // 成功レスポンス
    const responseData: HistoryClearResponse = {
      message: `${deletedCount}件の履歴を削除しました`
    };

    const response: ApiResponse<HistoryClearResponse> = {
      success: true,
      data: responseData
    };

    res.status(200).json(response);

  } catch (error) {
    // エラーハンドリング
    const response: ApiResponse<never> = {
      success: false,
      error: {
        message: '履歴削除中にエラーが発生しました',
        code: 'HISTORY_DELETE_ERROR',
        details: process.env['NODE_ENV'] === 'development' ? String(error) : undefined
      }
    };
    res.status(500).json(response);
  }
});

/**
 * GET /api/calculations/history/stats
 * 履歴統計情報を取得（追加機能）
 */
router.get('/history/stats', (_req: Request, res: Response) => {
  try {
    const stats = HistoryManager.getHistoryStatistics();
    const totalCount = HistoryManager.getHistoryCount();

    const responseData = {
      totalCount,
      typeStatistics: stats
    };

    const response: ApiResponse<typeof responseData> = {
      success: true,
      data: responseData
    };

    res.status(200).json(response);

  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: {
        message: '統計情報取得中にエラーが発生しました',
        code: 'STATS_FETCH_ERROR',
        details: process.env['NODE_ENV'] === 'development' ? String(error) : undefined
      }
    };
    res.status(500).json(response);
  }
});

export default router;