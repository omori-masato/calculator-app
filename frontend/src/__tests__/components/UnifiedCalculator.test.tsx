import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnifiedCalculator } from '../../components/UnifiedCalculator';
import * as calculationService from '../../services/calculationService';

// calculationServiceをモック化
jest.mock('../../services/calculationService');
const mockCalculationService = calculationService as jest.Mocked<typeof calculationService>;

describe('UnifiedCalculator', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.resetAllMocks();
    
    // デフォルトのモックレスポンスを設定
    mockCalculationService.getCalculationHistory.mockResolvedValue({
      success: true,
      data: { history: [] }
    });
  });

  describe('レンダリング', () => {
    test('基本的な要素が正しくレンダリングされる', async () => {
      render(<UnifiedCalculator />);
      
      // ディスプレイ
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
      
      // 数字ボタン
      for (let i = 0; i <= 9; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
      
      // 演算子ボタン
      expect(screen.getByText('+')).toBeInTheDocument();
      expect(screen.getByText('−')).toBeInTheDocument();
      expect(screen.getByText('×')).toBeInTheDocument();
      expect(screen.getByText('÷')).toBeInTheDocument();
      
      // 機能ボタン
      expect(screen.getByText('=')).toBeInTheDocument();
      expect(screen.getByText('AC')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('⌫')).toBeInTheDocument();
      
      // 税計算ボタン
      expect(screen.getByText('税込')).toBeInTheDocument();
      expect(screen.getByText('税抜')).toBeInTheDocument();
      
      // 一時保存ボタン
      expect(screen.getByText('一時保存')).toBeInTheDocument();
      expect(screen.getByText('読込')).toBeInTheDocument();
      
      // 履歴セクション
      expect(screen.getByText('計算履歴')).toBeInTheDocument();
    });

    test('初期表示値が0である', () => {
      render(<UnifiedCalculator />);
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    });
  });

  describe('数字入力', () => {
    test('数字ボタンをクリックすると表示が更新される', async () => {
      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      await user.click(screen.getByText('5'));
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
      
      await user.click(screen.getByText('3'));
      expect(screen.getByDisplayValue('53')).toBeInTheDocument();
    });

    test('小数点を含む数字を入力できる', async () => {
      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      await user.click(screen.getByText('3'));
      await user.click(screen.getByText('.'));
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('4'));
      
      expect(screen.getByDisplayValue('3.14')).toBeInTheDocument();
    });

    test('キーボード入力が正しく動作する', async () => {
      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      const display = screen.getByDisplayValue('0');
      await user.click(display); // フォーカスを合わせる
      
      await user.keyboard('123');
      expect(screen.getByDisplayValue('123')).toBeInTheDocument();
    });
  });

  describe('演算子入力', () => {
    test('演算子ボタンをクリックすると計算式が更新される', async () => {
      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      await user.click(screen.getByText('5'));
      await user.click(screen.getByText('+'));
      await user.click(screen.getByText('3'));
      
      // 式が正しく構築されているかを検証（内部状態なので、実際の動作で確認）
      expect(screen.getByDisplayValue('3')).toBeInTheDocument();
    });

    test('複数の演算子を含む計算ができる', async () => {
      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('×'));
      await user.click(screen.getByText('2'));
      await user.click(screen.getByText('+'));
      await user.click(screen.getByText('5'));
      
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });
  });

  describe('基本計算', () => {
    test('計算が正しく実行される', async () => {
      mockCalculationService.calculateExpression.mockResolvedValueOnce({
        success: true,
        data: {
          result: 8,
          historyId: 'test-id'
        }
      });

      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      await user.click(screen.getByText('5'));
      await user.click(screen.getByText('+'));
      await user.click(screen.getByText('3'));
      await user.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('8')).toBeInTheDocument();
      });
      
      expect(mockCalculationService.calculateExpression).toHaveBeenCalledWith('5 + 3', 'basic');
    });

    test('Enterキーで計算が実行される', async () => {
      mockCalculationService.calculateExpression.mockResolvedValueOnce({
        success: true,
        data: {
          result: 15,
          historyId: 'test-id'
        }
      });

      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      const display = screen.getByDisplayValue('0');
      await user.click(display);
      
      await user.keyboard('10 + 5');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockCalculationService.calculateExpression).toHaveBeenCalledWith('10 + 5', 'basic');
      });
    });

    test('計算エラーが適切に表示される', async () => {
      mockCalculationService.calculateExpression.mockResolvedValueOnce({
        success: false,
        error: {
          message: 'ゼロで割ることはできません',
          code: 'DIVISION_BY_ZERO'
        }
      });

      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      await user.click(screen.getByText('5'));
      await user.click(screen.getByText('÷'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('エラー')).toBeInTheDocument();
      });
      
      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('ゼロで割ることはできません')).toBeInTheDocument();
      });
    });
  });

  describe('税計算', () => {
    test('税込み計算が正しく実行される', async () => {
      mockCalculationService.calculateExpression.mockResolvedValueOnce({
        success: true,
        data: {
          result: 110,
          historyId: 'test-id'
        }
      });

      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('税込'));
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('110')).toBeInTheDocument();
      });
      
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

      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('税抜'));
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('100')).toBeInTheDocument();
      });
      
      expect(mockCalculationService.calculateExpression).toHaveBeenCalledWith('110', 'tax-exclusive');
    });
  });

  describe('クリア機能', () => {
    test('ACボタンで全てクリアされる', async () => {
      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('2'));
      await user.click(screen.getByText('3'));
      
      expect(screen.getByDisplayValue('123')).toBeInTheDocument();
      
      await user.click(screen.getByText('AC'));
      
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    });

    test('Cボタンで表示のみクリアされる', async () => {
      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('2'));
      await user.click(screen.getByText('3'));
      
      await user.click(screen.getByText('C'));
      
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    });

    test('バックスペースボタンで一文字削除される', async () => {
      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('2'));
      await user.click(screen.getByText('3'));
      
      await user.click(screen.getByText('⌫'));
      
      expect(screen.getByDisplayValue('12')).toBeInTheDocument();
    });

    test('キーボードのバックスペースキーで削除される', async () => {
      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      const display = screen.getByDisplayValue('0');
      await user.click(display);
      
      await user.keyboard('456');
      await user.keyboard('{Backspace}');
      
      expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    });
  });

  describe('一時保存機能', () => {
    test('一時保存と読み込みが正しく動作する', async () => {
      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('2'));
      await user.click(screen.getByText('3'));
      await user.click(screen.getByText('+'));
      await user.click(screen.getByText('4'));
      await user.click(screen.getByText('5'));
      
      // 一時保存
      await user.click(screen.getByText('一時保存'));
      
      // クリア
      await user.click(screen.getByText('AC'));
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
      
      // 読み込み
      await user.click(screen.getByText('読込'));
      expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    });
  });

  describe('履歴表示', () => {
    test('計算履歴が正しく表示される', async () => {
      const mockHistory = [
        {
          id: 'hist-1',
          expression: '2 + 3',
          result: 5,
          type: 'basic' as const,
          timestamp: new Date('2025-01-01T12:00:00Z')
        },
        {
          id: 'hist-2',
          expression: '100',
          result: 110,
          type: 'tax-inclusive' as const,
          timestamp: new Date('2025-01-01T12:01:00Z')
        }
      ];

      mockCalculationService.getCalculationHistory.mockResolvedValueOnce({
        success: true,
        data: { history: mockHistory }
      });

      render(<UnifiedCalculator />);
      
      await waitFor(() => {
        expect(screen.getByText('2 + 3 = 5')).toBeInTheDocument();
        expect(screen.getByText('100 → 110 (税込)')).toBeInTheDocument();
      });
    });

    test('履歴のフィルタリングが動作する', async () => {
      const mockBasicHistory = [
        {
          id: 'hist-1',
          expression: '2 + 3',
          result: 5,
          type: 'basic' as const,
          timestamp: new Date('2025-01-01T12:00:00Z')
        }
      ];

      mockCalculationService.getCalculationHistory.mockResolvedValueOnce({
        success: true,
        data: { history: [] }
      });

      mockCalculationService.getCalculationHistory.mockResolvedValueOnce({
        success: true,
        data: { history: mockBasicHistory }
      });

      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      // フィルターを変更
      const filterSelect = screen.getByDisplayValue('すべて');
      await user.click(filterSelect);
      await user.click(screen.getByText('基本計算'));
      
      await waitFor(() => {
        expect(mockCalculationService.getCalculationHistory).toHaveBeenCalledWith('basic');
      });
    });

    test('履歴クリアボタンが動作する', async () => {
      mockCalculationService.clearHistory.mockResolvedValueOnce({
        success: true,
        data: {
          message: '履歴を削除しました'
        }
      });

      mockCalculationService.getCalculationHistory.mockResolvedValueOnce({
        success: true,
        data: { history: [] }
      });

      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      await user.click(screen.getByText('履歴クリア'));
      
      await waitFor(() => {
        expect(mockCalculationService.clearHistory).toHaveBeenCalled();
      });
    });
  });

  describe('ローディング状態', () => {
    test('計算中にローディング状態が表示される', async () => {
      // Promiseが解決されるのを制御するためのテスト用Promise
      let resolvePromise: (value: any) => void;
      const testPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockCalculationService.calculateExpression.mockReturnValueOnce(testPromise);

      const user = userEvent.setup();
      render(<UnifiedCalculator />);
      
      await user.click(screen.getByText('2'));
      await user.click(screen.getByText('+'));
      await user.click(screen.getByText('3'));
      
      // 計算を開始
      await user.click(screen.getByText('='));
      
      // ローディング状態を確認（実際のUIに依存）
      await waitFor(() => {
        expect(screen.getByText('=')).toBeDisabled();
      });
      
      // Promiseを解決
      resolvePromise({
        success: true,
        data: { result: 5, historyId: 'test' }
      });
      
      await waitFor(() => {
        expect(screen.getByText('=')).toBeEnabled();
      });
    });
  });
});