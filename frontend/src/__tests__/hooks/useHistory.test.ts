import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../../hooks/useHistory';
import * as calculationService from '../../services/calculationService';
import { CalculationType } from '../../types';

// calculationServiceをモック化
jest.mock('../../services/calculationService');
const mockCalculationService = calculationService as jest.Mocked<typeof calculationService>;

describe('useHistory', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.resetAllMocks();
  });

  describe('初期状態', () => {
    test('初期値が正しく設定されている', () => {
      const { result } = renderHook(() => useHistory());
      
      expect(result.current.history).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.filter).toBe('all');
    });
  });

  describe('履歴の読み込み', () => {
    test('履歴が正常に読み込まれる', async () => {
      const mockHistory = [
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
      ];

      mockCalculationService.getCalculationHistory.mockResolvedValueOnce({
        success: true,
        data: {
          history: mockHistory
        }
      });

      const { result } = renderHook(() => useHistory());
      
      await act(async () => {
        await result.current.loadHistory();
      });
      
      expect(result.current.history).toEqual(mockHistory);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockCalculationService.getCalculationHistory).toHaveBeenCalledWith('all');
    });

    test('履歴読み込みエラーが適切に処理される', async () => {
      mockCalculationService.getCalculationHistory.mockResolvedValueOnce({
        success: false,
        error: {
          message: '履歴の取得に失敗しました',
          code: 'HISTORY_FETCH_ERROR'
        }
      });

      const { result } = renderHook(() => useHistory());
      
      await act(async () => {
        await result.current.loadHistory();
      });
      
      expect(result.current.history).toEqual([]);
      expect(result.current.error).toBe('履歴の取得に失敗しました');
    });

    test('ローディング状態が適切に管理される', async () => {
      // Promiseが解決されるのを制御するためのテスト用Promise
      let resolvePromise: (value: any) => void;
      const testPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockCalculationService.getCalculationHistory.mockReturnValueOnce(testPromise);

      const { result } = renderHook(() => useHistory());
      
      // 履歴読み込みを開始
      const loadPromise = act(async () => {
        await result.current.loadHistory();
      });
      
      // ローディング状態をチェック
      expect(result.current.isLoading).toBe(true);
      
      // Promiseを解決
      resolvePromise({
        success: true,
        data: { history: [] }
      });
      
      await loadPromise;
      
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('フィルタリング', () => {
    test('フィルターが正しく変更される', async () => {
      const mockBasicHistory = [
        {
          id: 'hist-1',
          expression: '2 + 3',
          result: 5,
          type: 'basic' as CalculationType,
          timestamp: new Date('2025-01-01T00:00:00Z')
        }
      ];

      mockCalculationService.getCalculationHistory.mockResolvedValueOnce({
        success: true,
        data: {
          history: mockBasicHistory
        }
      });

      const { result } = renderHook(() => useHistory());
      
      await act(async () => {
        await result.current.setFilter('basic');
      });
      
      expect(result.current.filter).toBe('basic');
      expect(result.current.history).toEqual(mockBasicHistory);
      expect(mockCalculationService.getCalculationHistory).toHaveBeenCalledWith('basic');
    });

    test('税込みフィルターが正しく動作する', async () => {
      const mockTaxHistory = [
        {
          id: 'hist-1',
          expression: '100',
          result: 110,
          type: 'tax-inclusive' as CalculationType,
          timestamp: new Date('2025-01-01T00:00:00Z')
        }
      ];

      mockCalculationService.getCalculationHistory.mockResolvedValueOnce({
        success: true,
        data: {
          history: mockTaxHistory
        }
      });

      const { result } = renderHook(() => useHistory());
      
      await act(async () => {
        await result.current.setFilter('tax-inclusive');
      });
      
      expect(result.current.filter).toBe('tax-inclusive');
      expect(result.current.history).toEqual(mockTaxHistory);
      expect(mockCalculationService.getCalculationHistory).toHaveBeenCalledWith('tax-inclusive');
    });

    test('税抜きフィルターが正しく動作する', async () => {
      const mockTaxExclusiveHistory = [
        {
          id: 'hist-1',
          expression: '110',
          result: 100,
          type: 'tax-exclusive' as CalculationType,
          timestamp: new Date('2025-01-01T00:00:00Z')
        }
      ];

      mockCalculationService.getCalculationHistory.mockResolvedValueOnce({
        success: true,
        data: {
          history: mockTaxExclusiveHistory
        }
      });

      const { result } = renderHook(() => useHistory());
      
      await act(async () => {
        await result.current.setFilter('tax-exclusive');
      });
      
      expect(result.current.filter).toBe('tax-exclusive');
      expect(result.current.history).toEqual(mockTaxExclusiveHistory);
      expect(mockCalculationService.getCalculationHistory).toHaveBeenCalledWith('tax-exclusive');
    });
  });

  describe('履歴のクリア', () => {
    test('履歴が正常にクリアされる', async () => {
      // 最初に履歴を読み込み
      mockCalculationService.getCalculationHistory.mockResolvedValueOnce({
        success: true,
        data: {
          history: [
            {
              id: 'hist-1',
              expression: '2 + 3',
              result: 5,
              type: 'basic' as CalculationType,
              timestamp: new Date()
            }
          ]
        }
      });

      const { result } = renderHook(() => useHistory());
      
      await act(async () => {
        await result.current.loadHistory();
      });
      
      expect(result.current.history).toHaveLength(1);

      // 履歴をクリア
      mockCalculationService.clearHistory.mockResolvedValueOnce({
        success: true,
        data: {
          message: '1件の履歴を削除しました'
        }
      });

      mockCalculationService.getCalculationHistory.mockResolvedValueOnce({
        success: true,
        data: {
          history: []
        }
      });

      await act(async () => {
        await result.current.clearHistory();
      });
      
      expect(result.current.history).toEqual([]);
      expect(mockCalculationService.clearHistory).toHaveBeenCalled();
    });

    test('履歴クリアエラーが適切に処理される', async () => {
      mockCalculationService.clearHistory.mockResolvedValueOnce({
        success: false,
        error: {
          message: '履歴の削除に失敗しました',
          code: 'HISTORY_DELETE_ERROR'
        }
      });

      const { result } = renderHook(() => useHistory());
      
      await act(async () => {
        await result.current.clearHistory();
      });
      
      expect(result.current.error).toBe('履歴の削除に失敗しました');
    });
  });

  describe('履歴の更新', () => {
    test('履歴が自動的に更新される', async () => {
      const initialHistory = [
        {
          id: 'hist-1',
          expression: '2 + 3',
          result: 5,
          type: 'basic' as CalculationType,
          timestamp: new Date('2025-01-01T00:00:00Z')
        }
      ];

      const updatedHistory = [
        ...initialHistory,
        {
          id: 'hist-2',
          expression: '10 * 2',
          result: 20,
          type: 'basic' as CalculationType,
          timestamp: new Date('2025-01-01T00:01:00Z')
        }
      ];

      // 最初の読み込み
      mockCalculationService.getCalculationHistory.mockResolvedValueOnce({
        success: true,
        data: {
          history: initialHistory
        }
      });

      const { result } = renderHook(() => useHistory());
      
      await act(async () => {
        await result.current.loadHistory();
      });
      
      expect(result.current.history).toEqual(initialHistory);

      // 更新された履歴の読み込み
      mockCalculationService.getCalculationHistory.mockResolvedValueOnce({
        success: true,
        data: {
          history: updatedHistory
        }
      });

      await act(async () => {
        await result.current.refreshHistory();
      });
      
      expect(result.current.history).toEqual(updatedHistory);
    });
  });

  describe('エラー状態のクリア', () => {
    test('エラーが正しくクリアされる', async () => {
      // エラーを発生させる
      mockCalculationService.getCalculationHistory.mockResolvedValueOnce({
        success: false,
        error: {
          message: 'エラーメッセージ',
          code: 'TEST_ERROR'
        }
      });

      const { result } = renderHook(() => useHistory());
      
      await act(async () => {
        await result.current.loadHistory();
      });
      
      expect(result.current.error).toBe('エラーメッセージ');

      // エラーをクリア
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBeNull();
    });
  });
});