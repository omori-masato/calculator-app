import { calculateExpression, clearHistory, getCalculationHistory } from '../../services/calculationService';
import { CalculationType } from '../../types';

// Fetchのモック設定
global.fetch = jest.fn();

describe('calculationService', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.resetAllMocks();
  });

  describe('calculateExpression', () => {
    describe('正常ケース', () => {
      test('基本計算の成功', async () => {
        const mockResponse = {
          success: true,
          data: {
            result: 5,
            historyId: 'test-id-123'
          }
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

        const result = await calculateExpression('2 + 3', 'basic');
        
        expect(result).toEqual({
          success: true,
          data: {
            result: 5,
            historyId: 'test-id-123'
          }
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/calculations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            expression: '2 + 3',
            type: 'basic'
          }),
        });
      });

      test('税込み計算の成功', async () => {
        const mockResponse = {
          success: true,
          data: {
            result: 110,
            historyId: 'test-id-456'
          }
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

        const result = await calculateExpression('100', 'tax-inclusive');
        
        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith('/api/calculations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            expression: '100',
            type: 'tax-inclusive'
          }),
        });
      });

      test('税抜き計算の成功', async () => {
        const mockResponse = {
          success: true,
          data: {
            result: 100,
            historyId: 'test-id-789'
          }
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

        const result = await calculateExpression('110', 'tax-exclusive');
        
        expect(result).toEqual(mockResponse);
      });
    });

    describe('エラーケース', () => {
      test('サーバーエラーのハンドリング', async () => {
        const mockErrorResponse = {
          success: false,
          error: {
            message: 'ゼロで割ることはできません',
            code: 'DIVISION_BY_ZERO'
          }
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => mockErrorResponse
        });

        const result = await calculateExpression('5 / 0', 'basic');
        
        expect(result).toEqual(mockErrorResponse);
      });

      test('ネットワークエラーのハンドリング', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await calculateExpression('2 + 3', 'basic');
        
        expect(result).toEqual({
          success: false,
          error: {
            message: '通信エラーが発生しました。しばらく時間をおいて再度お試しください。',
            code: 'NETWORK_ERROR'
          }
        });
      });

      test('無効なJSONレスポンスのハンドリング', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => {
            throw new SyntaxError('Unexpected token');
          }
        });

        const result = await calculateExpression('2 + 3', 'basic');
        
        expect(result).toEqual({
          success: false,
          error: {
            message: 'サーバーからの応答を処理できませんでした。',
            code: 'PARSE_ERROR'
          }
        });
      });
    });
  });

  describe('getCalculationHistory', () => {
    test('履歴取得の成功', async () => {
      const mockHistoryData = {
        success: true,
        data: {
          history: [
            {
              id: 'hist-1',
              expression: '2 + 3',
              result: 5,
              type: 'basic' as CalculationType,
              timestamp: new Date('2025-01-01T00:00:00Z')
            },
            {
              id: 'hist-2',
              expression: '100',
              result: 110,
              type: 'tax-inclusive' as CalculationType,
              timestamp: new Date('2025-01-01T00:01:00Z')
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHistoryData
      });

      const result = await getCalculationHistory();
      
      expect(result).toEqual(mockHistoryData);
      expect(global.fetch).toHaveBeenCalledWith('/api/calculations/history');
    });

    test('フィルタリングされた履歴取得', async () => {
      const mockFilteredData = {
        success: true,
        data: {
          history: [
            {
              id: 'hist-1',
              expression: '2 + 3',
              result: 5,
              type: 'basic' as CalculationType,
              timestamp: new Date('2025-01-01T00:00:00Z')
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFilteredData
      });

      const result = await getCalculationHistory('basic');
      
      expect(result).toEqual(mockFilteredData);
      expect(global.fetch).toHaveBeenCalledWith('/api/calculations/history?filter=basic');
    });

    test('履歴取得エラーのハンドリング', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await getCalculationHistory();
      
      expect(result).toEqual({
        success: false,
        error: {
          message: '履歴の取得に失敗しました。',
          code: 'HISTORY_FETCH_ERROR'
        }
      });
    });
  });

  describe('clearHistory', () => {
    test('履歴削除の成功', async () => {
      const mockResponse = {
        success: true,
        data: {
          message: '5件の履歴を削除しました'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await clearHistory();
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/calculations/history', {
        method: 'DELETE'
      });
    });

    test('履歴削除エラーのハンドリング', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await clearHistory();
      
      expect(result).toEqual({
        success: false,
        error: {
          message: '履歴の削除に失敗しました。',
          code: 'HISTORY_DELETE_ERROR'
        }
      });
    });
  });
});