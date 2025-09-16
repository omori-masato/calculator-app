import { HistoryManager } from '../services/HistoryManager';
import { CalculationHistory } from '../types';

describe('HistoryManager', () => {
  beforeEach(() => {
    // 各テスト前に履歴をクリア
    HistoryManager.clearHistory();
  });

  describe('saveCalculation', () => {
    test('基本的な履歴保存', () => {
      const id = HistoryManager.saveCalculation('2 + 3', 5, 'basic');
      
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
      expect(HistoryManager.getHistoryCount()).toBe(1);
    });

    test('複数の履歴保存', () => {
      HistoryManager.saveCalculation('2 + 3', 5, 'basic');
      HistoryManager.saveCalculation('10 * 2', 20, 'basic');
      HistoryManager.saveCalculation('100', 110, 'tax-inclusive');

      expect(HistoryManager.getHistoryCount()).toBe(3);
    });

    test('履歴の順序（新しい順）', () => {
      const id1 = HistoryManager.saveCalculation('1 + 1', 2, 'basic');
      const id2 = HistoryManager.saveCalculation('2 + 2', 4, 'basic');
      const id3 = HistoryManager.saveCalculation('3 + 3', 6, 'basic');

      const history = HistoryManager.getHistory();
      
      expect(history).toHaveLength(3);
      expect(history[0]?.id).toBe(id3); // 最新
      expect(history[1]?.id).toBe(id2);
      expect(history[2]?.id).toBe(id1); // 最古
    });

    test('最大件数制限（10件）', () => {
      // 12件の履歴を保存
      for (let i = 1; i <= 12; i++) {
        HistoryManager.saveCalculation(`${i} + ${i}`, i * 2, 'basic');
      }

      const history = HistoryManager.getHistory();
      expect(history).toHaveLength(10); // 最大10件
      
      // 最新の10件が保持されているかチェック
      expect(history[0]?.expression).toBe('12 + 12');
      expect(history[9]?.expression).toBe('3 + 3');
    });

    test('無効な入力値', () => {
      expect(() => {
        HistoryManager.saveCalculation('', 5, 'basic');
      }).toThrow('計算式が無効です');

      expect(() => {
        HistoryManager.saveCalculation('   ', 5, 'basic');
      }).toThrow('計算式が無効です');

      expect(() => {
        HistoryManager.saveCalculation('2 + 3', NaN, 'basic');
      }).toThrow('計算結果が無効です');

      expect(() => {
        HistoryManager.saveCalculation('2 + 3', Infinity, 'basic');
      }).toThrow('計算結果が無効です');
    });
  });

  describe('getHistory', () => {
    beforeEach(() => {
      // テスト用のサンプルデータを準備
      HistoryManager.saveCalculation('2 + 3', 5, 'basic');
      HistoryManager.saveCalculation('100', 110, 'tax-inclusive');
      HistoryManager.saveCalculation('110', 100, 'tax-exclusive');
      HistoryManager.saveCalculation('10 * 5', 50, 'basic');
    });

    test('全履歴取得（フィルターなし）', () => {
      const history = HistoryManager.getHistory();
      expect(history).toHaveLength(4);
    });

    test('全履歴取得（allフィルター）', () => {
      const history = HistoryManager.getHistory('all');
      expect(history).toHaveLength(4);
    });

    test('基本計算のフィルタリング', () => {
      const basicHistory = HistoryManager.getHistory('basic');
      expect(basicHistory).toHaveLength(2);
      expect(basicHistory.every(item => item.type === 'basic')).toBe(true);
    });

    test('税込み計算のフィルタリング', () => {
      const taxInclusiveHistory = HistoryManager.getHistory('tax-inclusive');
      expect(taxInclusiveHistory).toHaveLength(1);
      expect(taxInclusiveHistory[0]?.type).toBe('tax-inclusive');
      expect(taxInclusiveHistory[0]?.expression).toBe('100');
    });

    test('税抜き計算のフィルタリング', () => {
      const taxExclusiveHistory = HistoryManager.getHistory('tax-exclusive');
      expect(taxExclusiveHistory).toHaveLength(1);
      expect(taxExclusiveHistory[0]?.type).toBe('tax-exclusive');
      expect(taxExclusiveHistory[0]?.expression).toBe('110');
    });

    test('存在しない履歴タイプのフィルタリング', () => {
      HistoryManager.clearHistory();
      HistoryManager.saveCalculation('1 + 1', 2, 'basic');
      
      const emptyHistory = HistoryManager.getHistory('tax-inclusive');
      expect(emptyHistory).toHaveLength(0);
    });

    test('無効なフィルター', () => {
      expect(() => {
        // @ts-expect-error テスト用の無効な型
        HistoryManager.getHistory('invalid-filter');
      }).toThrow('無効なフィルターです');
    });

    test('返される配列の独立性', () => {
      const history1 = HistoryManager.getHistory();
      const history2 = HistoryManager.getHistory();
      
      // 配列のインスタンスが異なることを確認
      expect(history1).not.toBe(history2);
      expect(history1).toEqual(history2);
    });
  });

  describe('clearHistory', () => {
    test('履歴の全削除', () => {
      HistoryManager.saveCalculation('1 + 1', 2, 'basic');
      HistoryManager.saveCalculation('2 + 2', 4, 'basic');
      HistoryManager.saveCalculation('3 + 3', 6, 'basic');

      expect(HistoryManager.getHistoryCount()).toBe(3);

      const deletedCount = HistoryManager.clearHistory();
      
      expect(deletedCount).toBe(3);
      expect(HistoryManager.getHistoryCount()).toBe(0);
      expect(HistoryManager.getHistory()).toHaveLength(0);
    });

    test('空の履歴の削除', () => {
      const deletedCount = HistoryManager.clearHistory();
      
      expect(deletedCount).toBe(0);
      expect(HistoryManager.getHistoryCount()).toBe(0);
    });
  });

  describe('getHistoryById', () => {
    test('有効なIDでの履歴取得', () => {
      const id = HistoryManager.saveCalculation('5 + 5', 10, 'basic');
      const history = HistoryManager.getHistoryById(id);
      
      expect(history).toBeDefined();
      expect(history?.id).toBe(id);
      expect(history?.expression).toBe('5 + 5');
      expect(history?.result).toBe(10);
      expect(history?.type).toBe('basic');
    });

    test('存在しないIDでの履歴取得', () => {
      const history = HistoryManager.getHistoryById('non-existent-id');
      expect(history).toBeUndefined();
    });

    test('無効なIDでの履歴取得', () => {
      expect(HistoryManager.getHistoryById('')).toBeUndefined();
      expect(HistoryManager.getHistoryById('   ')).toBeUndefined();
    });
  });

  describe('getHistoryStatistics', () => {
    test('統計情報の取得', () => {
      HistoryManager.saveCalculation('1 + 1', 2, 'basic');
      HistoryManager.saveCalculation('2 + 2', 4, 'basic');
      HistoryManager.saveCalculation('100', 110, 'tax-inclusive');
      HistoryManager.saveCalculation('110', 100, 'tax-exclusive');
      HistoryManager.saveCalculation('200', 220, 'tax-inclusive');

      const stats = HistoryManager.getHistoryStatistics();
      
      expect(stats.basic).toBe(2);
      expect(stats['tax-inclusive']).toBe(2);
      expect(stats['tax-exclusive']).toBe(1);
    });

    test('空の履歴での統計情報', () => {
      const stats = HistoryManager.getHistoryStatistics();
      
      expect(stats.basic).toBe(0);
      expect(stats['tax-inclusive']).toBe(0);
      expect(stats['tax-exclusive']).toBe(0);
    });
  });

  describe('テスト用メソッド', () => {
    test('setHistoryForTesting', () => {
      const testHistory: CalculationHistory[] = [
        {
          id: 'test-id-1',
          expression: 'test expression',
          result: 42,
          type: 'basic',
          timestamp: new Date('2025-01-01T00:00:00Z')
        }
      ];

      HistoryManager.setHistoryForTesting(testHistory);
      
      const history = HistoryManager.getHistoryForTesting();
      expect(history).toEqual(testHistory);
      expect(HistoryManager.getHistoryCount()).toBe(1);
    });

    test('無効な履歴データでのsetHistoryForTesting', () => {
      const invalidHistory = [
        {
          id: 'test-id',
          // expression フィールドが欠如
          result: 42,
          type: 'basic',
          timestamp: new Date()
        }
      ];

      expect(() => {
        // @ts-expect-error テスト用の無効なデータ
        HistoryManager.setHistoryForTesting(invalidHistory);
      }).toThrow('無効な履歴エントリが含まれています');
    });
  });
});