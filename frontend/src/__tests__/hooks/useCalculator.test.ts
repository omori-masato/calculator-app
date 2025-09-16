import { renderHook, act } from '@testing-library/react';
import { useCalculator } from '../../hooks/useCalculator';
import * as calculationService from '../../services/calculationService';

// calculationServiceをモック化
jest.mock('../../services/calculationService');
const mockCalculationService = calculationService as jest.Mocked<typeof calculationService>;

describe('useCalculator', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.resetAllMocks();
  });

  describe('初期状態', () => {
    test('初期値が正しく設定されている', () => {
      const { result } = renderHook(() => useCalculator());
      
      expect(result.current.display).toBe('0');
      expect(result.current.expression).toBe('');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastResult).toBeNull();
    });
  });

  describe('数字入力', () => {
    test('数字を正しく入力できる', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('5');
      });
      
      expect(result.current.display).toBe('5');
      expect(result.current.expression).toBe('5');
    });

    test('複数桁の数字を入力できる', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('1');
        result.current.inputNumber('2');
        result.current.inputNumber('3');
      });
      
      expect(result.current.display).toBe('123');
      expect(result.current.expression).toBe('123');
    });

    test('小数点を含む数字を入力できる', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('3');
        result.current.inputNumber('.');
        result.current.inputNumber('1');
        result.current.inputNumber('4');
      });
      
      expect(result.current.display).toBe('3.14');
      expect(result.current.expression).toBe('3.14');
    });

    test('小数点の重複入力を防ぐ', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('3');
        result.current.inputNumber('.');
        result.current.inputNumber('1');
        result.current.inputNumber('.'); // 2回目の小数点
        result.current.inputNumber('4');
      });
      
      expect(result.current.display).toBe('3.14');
      expect(result.current.expression).toBe('3.14');
    });
  });

  describe('演算子入力', () => {
    test('演算子を正しく入力できる', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('5');
        result.current.inputOperator('+');
      });
      
      expect(result.current.display).toBe('5');
      expect(result.current.expression).toBe('5 + ');
    });

    test('複数の演算子を含む式を作成できる', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('1');
        result.current.inputNumber('0');
        result.current.inputOperator('*');
        result.current.inputNumber('2');
        result.current.inputOperator('+');
        result.current.inputNumber('5');
      });
      
      expect(result.current.display).toBe('5');
      expect(result.current.expression).toBe('10 * 2 + 5');
    });

    test('演算子の連続入力を適切に処理する', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('5');
        result.current.inputOperator('+');
        result.current.inputOperator('-'); // 演算子を変更
      });
      
      expect(result.current.display).toBe('5');
      expect(result.current.expression).toBe('5 - ');
    });
  });

  describe('計算実行', () => {
    test('基本計算が正しく実行される', async () => {
      mockCalculationService.calculateExpression.mockResolvedValueOnce({
        success: true,
        data: {
          result: 8,
          historyId: 'test-id'
        }
      });

      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('5');
        result.current.inputOperator('+');
        result.current.inputNumber('3');
      });

      await act(async () => {
        await result.current.calculate();
      });
      
      expect(result.current.display).toBe('8');
      expect(result.current.lastResult).toBe(8);
      expect(result.current.error).toBeNull();
      expect(mockCalculationService.calculateExpression).toHaveBeenCalledWith('5 + 3', 'basic');
    });

    test('税込み計算が正しく実行される', async () => {
      mockCalculationService.calculateExpression.mockResolvedValueOnce({
        success: true,
        data: {
          result: 110,
          historyId: 'test-id'
        }
      });

      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('1');
        result.current.inputNumber('0');
        result.current.inputNumber('0');
      });

      await act(async () => {
        await result.current.calculateTax('inclusive');
      });
      
      expect(result.current.display).toBe('110');
      expect(result.current.lastResult).toBe(110);
      expect(mockCalculationService.calculateExpression).toHaveBeenCalledWith('100', 'tax-inclusive');
    });

    test('税抜き計算が正しく実行される', async () => {
      mockCalculationService.calculateExpression.mockResolvedValueOnce({
        success: true,
        data: {
          result: 100,
          historyId: 'test-id'
        }
      });

      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('1');
        result.current.inputNumber('1');
        result.current.inputNumber('0');
      });

      await act(async () => {
        await result.current.calculateTax('exclusive');
      });
      
      expect(result.current.display).toBe('100');
      expect(result.current.lastResult).toBe(100);
      expect(mockCalculationService.calculateExpression).toHaveBeenCalledWith('110', 'tax-exclusive');
    });

    test('計算エラーが適切に処理される', async () => {
      mockCalculationService.calculateExpression.mockResolvedValueOnce({
        success: false,
        error: {
          message: 'ゼロで割ることはできません',
          code: 'DIVISION_BY_ZERO'
        }
      });

      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('5');
        result.current.inputOperator('/');
        result.current.inputNumber('0');
      });

      await act(async () => {
        await result.current.calculate();
      });
      
      expect(result.current.display).toBe('エラー');
      expect(result.current.error).toBe('ゼロで割ることはできません');
    });

    test('ローディング状態が適切に管理される', async () => {
      // Promiseが解決されるのを制御するためのテスト用Promise
      let resolvePromise: (value: any) => void;
      const testPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockCalculationService.calculateExpression.mockReturnValueOnce(testPromise);

      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('2');
        result.current.inputOperator('+');
        result.current.inputNumber('3');
      });

      // 計算を開始
      const calculatePromise = act(async () => {
        await result.current.calculate();
      });
      
      // ローディング状態をチェック
      expect(result.current.isLoading).toBe(true);
      
      // Promiseを解決
      resolvePromise({
        success: true,
        data: { result: 5, historyId: 'test' }
      });
      
      await calculatePromise;
      
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('クリア機能', () => {
    test('clearAllで全てクリアされる', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('1');
        result.current.inputNumber('2');
        result.current.inputNumber('3');
        result.current.inputOperator('+');
      });
      
      act(() => {
        result.current.clearAll();
      });
      
      expect(result.current.display).toBe('0');
      expect(result.current.expression).toBe('');
      expect(result.current.error).toBeNull();
      expect(result.current.lastResult).toBeNull();
    });

    test('clearDisplayで表示のみクリアされる', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('1');
        result.current.inputNumber('2');
        result.current.inputNumber('3');
      });
      
      act(() => {
        result.current.clearDisplay();
      });
      
      expect(result.current.display).toBe('0');
      expect(result.current.expression).toBe('123'); // 式は保持される
    });

    test('backspaceで一文字削除される', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('1');
        result.current.inputNumber('2');
        result.current.inputNumber('3');
      });
      
      act(() => {
        result.current.backspace();
      });
      
      expect(result.current.display).toBe('12');
      expect(result.current.expression).toBe('12');
    });

    test('一文字のときのbackspaceで0になる', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('5');
      });
      
      act(() => {
        result.current.backspace();
      });
      
      expect(result.current.display).toBe('0');
      expect(result.current.expression).toBe('');
    });
  });

  describe('一時保存機能', () => {
    test('一時保存と復元が正しく動作する', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.inputNumber('1');
        result.current.inputNumber('2');
        result.current.inputNumber('3');
        result.current.inputOperator('+');
        result.current.inputNumber('4');
        result.current.inputNumber('5');
      });
      
      act(() => {
        result.current.saveTemporary();
      });
      
      act(() => {
        result.current.clearAll();
      });
      
      expect(result.current.display).toBe('0');
      
      act(() => {
        result.current.loadTemporary();
      });
      
      expect(result.current.display).toBe('45');
      expect(result.current.expression).toBe('123 + 45');
    });

    test('保存データがないときの復元', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.loadTemporary();
      });
      
      expect(result.current.display).toBe('0');
      expect(result.current.expression).toBe('');
    });
  });
});