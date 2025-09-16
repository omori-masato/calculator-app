import { formatTimestamp } from '../../utils/dateUtils';

describe('dateUtils', () => {
  describe('formatTimestamp', () => {
    test('日付が正しい形式でフォーマットされる', () => {
      const testDate = new Date('2025-01-15T14:30:45.123Z');
      const formatted = formatTimestamp(testDate);
      
      // 日本時間での表示を期待 (UTC+9)
      expect(formatted).toBe('2025/01/15 23:30:45');
    });

    test('午前中の時間が正しく表示される', () => {
      const testDate = new Date('2025-06-10T02:15:30.000Z');
      const formatted = formatTimestamp(testDate);
      
      expect(formatted).toBe('2025/06/10 11:15:30');
    });

    test('年末年始の日付が正しく表示される', () => {
      const testDate = new Date('2024-12-31T15:00:00.000Z');
      const formatted = formatTimestamp(testDate);
      
      expect(formatted).toBe('2025/01/01 00:00:00');
    });

    test('月日が一桁の場合にゼロパディングされる', () => {
      const testDate = new Date('2025-03-05T06:07:08.000Z');
      const formatted = formatTimestamp(testDate);
      
      expect(formatted).toBe('2025/03/05 15:07:08');
    });

    test('うるう年の2月29日が正しく表示される', () => {
      const testDate = new Date('2024-02-29T12:00:00.000Z');
      const formatted = formatTimestamp(testDate);
      
      expect(formatted).toBe('2024/02/29 21:00:00');
    });

    test('文字列の日付が正しく処理される', () => {
      const testDateString = '2025-07-20T18:45:00.000Z';
      const formatted = formatTimestamp(testDateString);
      
      expect(formatted).toBe('2025/07/21 03:45:00');
    });

    test('数値のタイムスタンプが正しく処理される', () => {
      const testTimestamp = new Date('2025-09-15T09:30:00.000Z').getTime();
      const formatted = formatTimestamp(testTimestamp);
      
      expect(formatted).toBe('2025/09/15 18:30:00');
    });

    test('無効な日付の場合にエラーを投げる', () => {
      expect(() => {
        formatTimestamp('invalid-date');
      }).toThrow('無効な日付です');
      
      expect(() => {
        formatTimestamp(NaN);
      }).toThrow('無効な日付です');
      
      expect(() => {
        formatTimestamp(new Date('invalid'));
      }).toThrow('無効な日付です');
    });

    test('nullやundefinedの場合にエラーを投げる', () => {
      expect(() => {
        formatTimestamp(null as any);
      }).toThrow('日付が指定されていません');
      
      expect(() => {
        formatTimestamp(undefined as any);
      }).toThrow('日付が指定されていません');
    });

    test('極端に古い日付も正しく処理される', () => {
      const oldDate = new Date('1900-01-01T00:00:00.000Z');
      const formatted = formatTimestamp(oldDate);
      
      expect(formatted).toBe('1900/01/01 09:00:00');
    });

    test('極端に未来の日付も正しく処理される', () => {
      const futureDate = new Date('2099-12-31T23:59:59.999Z');
      const formatted = formatTimestamp(futureDate);
      
      expect(formatted).toBe('2100/01/01 08:59:59');
    });
  });

  describe('タイムゾーン対応', () => {
    test('異なる環境でも日本時間で統一される', () => {
      // テスト環境のタイムゾーンが設定されていることを確認
      expect(process.env.TZ).toBe('Asia/Tokyo');
      
      const testDate = new Date('2025-12-25T00:00:00.000Z');
      const formatted = formatTimestamp(testDate);
      
      // UTC 00:00 は JST 09:00
      expect(formatted).toBe('2025/12/25 09:00:00');
    });

    test('サマータイム期間でも正しく動作する（日本にはサマータイムなし）', () => {
      // 北米のサマータイム期間に相当する時期でテスト
      const summerDate = new Date('2025-07-15T12:00:00.000Z');
      const winterDate = new Date('2025-01-15T12:00:00.000Z');
      
      const summerFormatted = formatTimestamp(summerDate);
      const winterFormatted = formatTimestamp(winterDate);
      
      // どちらも同じ時差（+9時間）で表示される
      expect(summerFormatted).toBe('2025/07/15 21:00:00');
      expect(winterFormatted).toBe('2025/01/15 21:00:00');
    });
  });
});