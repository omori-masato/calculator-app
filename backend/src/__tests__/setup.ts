/**
 * Jest テストセットアップファイル
 * 
 * 全テストで共通して使用される設定や
 * モックの初期化を行う
 */

// テスト環境の設定
process.env['NODE_ENV'] = 'test';

// タイムゾーンの固定（テストの再現性を保証）
process.env['TZ'] = 'Asia/Tokyo';

// コンソール出力の抑制（テスト中は不要なログを非表示）
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  // 各テスト前にコンソール出力を抑制
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  // 各テスト後にコンソール出力を復元
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// 全テスト終了後のクリーンアップ
afterAll(() => {
  // タイマーやリソースのクリーンアップ
  jest.clearAllTimers();
});

// セットアップファイル用のダミーテスト
describe('Setup', () => {
  test('should initialize test environment', () => {
    expect(process.env['NODE_ENV']).toBe('test');
  });
});