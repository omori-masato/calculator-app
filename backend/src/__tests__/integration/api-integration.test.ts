import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../../app';
import { HistoryManager } from '../../services/HistoryManager';

describe('API統合テスト', () => {
  let app: Application;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    // 各テスト前に履歴をクリア
    HistoryManager.clearHistory();
  });

  describe('エンドツーエンドのワークフロー', () => {
    test('完全な計算ワークフローが正常に動作する', async () => {
      // 1. 基本計算を実行
      const basicCalcResponse = await request(app)
        .post('/api/calculations')
        .send({
          expression: '10 + 5',
          type: 'basic'
        })
        .expect(200);

      expect(basicCalcResponse.body.success).toBe(true);
      expect(basicCalcResponse.body.data.result).toBe(15);
      const firstHistoryId = basicCalcResponse.body.data.historyId;

      // 2. 税込み計算を実行
      const taxInclusiveResponse = await request(app)
        .post('/api/calculations')
        .send({
          expression: '100',
          type: 'tax-inclusive'
        })
        .expect(200);

      expect(taxInclusiveResponse.body.success).toBe(true);
      expect(taxInclusiveResponse.body.data.result).toBe(110);
      const secondHistoryId = taxInclusiveResponse.body.data.historyId;

      // 3. 税抜き計算を実行
      const taxExclusiveResponse = await request(app)
        .post('/api/calculations')
        .send({
          expression: '220',
          type: 'tax-exclusive'
        })
        .expect(200);

      expect(taxExclusiveResponse.body.success).toBe(true);
      expect(taxExclusiveResponse.body.data.result).toBe(200);

      // 4. 履歴を確認（全て）
      const historyResponse = await request(app)
        .get('/api/calculations/history')
        .expect(200);

      expect(historyResponse.body.success).toBe(true);
      expect(historyResponse.body.data.history).toHaveLength(3);

      // 履歴が新しい順にソートされていることを確認
      const history = historyResponse.body.data.history;
      expect(history[0].expression).toBe('220');
      expect(history[0].result).toBe(200);
      expect(history[0].type).toBe('tax-exclusive');
      
      expect(history[1].expression).toBe('100');
      expect(history[1].result).toBe(110);
      expect(history[1].type).toBe('tax-inclusive');
      
      expect(history[2].expression).toBe('10 + 5');
      expect(history[2].result).toBe(15);
      expect(history[2].type).toBe('basic');

      // 5. フィルタリングされた履歴を確認（基本計算のみ）
      const basicHistoryResponse = await request(app)
        .get('/api/calculations/history?filter=basic')
        .expect(200);

      expect(basicHistoryResponse.body.data.history).toHaveLength(1);
      expect(basicHistoryResponse.body.data.history[0].id).toBe(firstHistoryId);

      // 6. フィルタリングされた履歴を確認（税込み計算のみ）
      const taxInclusiveHistoryResponse = await request(app)
        .get('/api/calculations/history?filter=tax-inclusive')
        .expect(200);

      expect(taxInclusiveHistoryResponse.body.data.history).toHaveLength(1);
      expect(taxInclusiveHistoryResponse.body.data.history[0].id).toBe(secondHistoryId);

      // 7. 統計情報を確認
      const statsResponse = await request(app)
        .get('/api/calculations/history/stats')
        .expect(200);

      expect(statsResponse.body.success).toBe(true);
      expect(statsResponse.body.data.totalCount).toBe(3);
      expect(statsResponse.body.data.typeStatistics.basic).toBe(1);
      expect(statsResponse.body.data.typeStatistics['tax-inclusive']).toBe(1);
      expect(statsResponse.body.data.typeStatistics['tax-exclusive']).toBe(1);

      // 8. 履歴を削除
      const deleteResponse = await request(app)
        .delete('/api/calculations/history')
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.data.message).toContain('3件の履歴を削除しました');

      // 9. 履歴が削除されたことを確認
      const emptyHistoryResponse = await request(app)
        .get('/api/calculations/history')
        .expect(200);

      expect(emptyHistoryResponse.body.data.history).toHaveLength(0);
    });

    test('複数の複雑な計算を順次実行', async () => {
      const calculations = [
        { expression: '123 + 456', type: 'basic', expectedResult: 579 },
        { expression: '1000 - 234', type: 'basic', expectedResult: 766 },
        { expression: '25 * 4', type: 'basic', expectedResult: 100 },
        { expression: '144 / 12', type: 'basic', expectedResult: 12 },
        { expression: '3.14 * 2', type: 'basic', expectedResult: 6.28 },
        { expression: '500', type: 'tax-inclusive', expectedResult: 550 },
        { expression: '1100', type: 'tax-exclusive', expectedResult: 1000 }
      ];

      const results = [];

      // 順次計算を実行
      for (const calc of calculations) {
        const response = await request(app)
          .post('/api/calculations')
          .send({
            expression: calc.expression,
            type: calc.type
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        
        if (calc.type === 'basic' && calc.expectedResult !== Math.floor(calc.expectedResult)) {
          // 浮動小数点の比較はtoBeCloseToを使用
          expect(response.body.data.result).toBeCloseTo(calc.expectedResult, 10);
        } else {
          expect(response.body.data.result).toBe(calc.expectedResult);
        }
        
        results.push({
          id: response.body.data.historyId,
          expression: calc.expression,
          result: response.body.data.result,
          type: calc.type
        });
      }

      // 履歴が正しく保存されていることを確認
      const historyResponse = await request(app)
        .get('/api/calculations/history')
        .expect(200);

      expect(historyResponse.body.data.history).toHaveLength(calculations.length);

      // 各タイプの統計を確認
      const statsResponse = await request(app)
        .get('/api/calculations/history/stats')
        .expect(200);

      expect(statsResponse.body.data.totalCount).toBe(7);
      expect(statsResponse.body.data.typeStatistics.basic).toBe(5);
      expect(statsResponse.body.data.typeStatistics['tax-inclusive']).toBe(1);
      expect(statsResponse.body.data.typeStatistics['tax-exclusive']).toBe(1);
    });
  });

  describe('エラーハンドリングの統合テスト', () => {
    test('様々なエラーケースが適切に処理される', async () => {
      // 1. ゼロ除算エラー
      const divisionByZeroResponse = await request(app)
        .post('/api/calculations')
        .send({
          expression: '10 / 0',
          type: 'basic'
        })
        .expect(400);

      expect(divisionByZeroResponse.body.success).toBe(false);
      expect(divisionByZeroResponse.body.error.code).toBe('DIVISION_BY_ZERO');

      // 2. 不正な計算式
      const invalidExpressionResponse = await request(app)
        .post('/api/calculations')
        .send({
          expression: 'abc + def',
          type: 'basic'
        })
        .expect(400);

      expect(invalidExpressionResponse.body.success).toBe(false);
      expect(invalidExpressionResponse.body.error.code).toBe('INVALID_EXPRESSION');

      // 3. 危険な式
      const dangerousExpressionResponse = await request(app)
        .post('/api/calculations')
        .send({
          expression: 'eval("alert(1)")',
          type: 'basic'
        })
        .expect(400);

      expect(dangerousExpressionResponse.body.success).toBe(false);
      expect(dangerousExpressionResponse.body.error.code).toBe('INVALID_EXPRESSION');

      // 4. 無効な計算タイプ
      const invalidTypeResponse = await request(app)
        .post('/api/calculations')
        .send({
          expression: '2 + 3',
          type: 'invalid-type'
        })
        .expect(400);

      expect(invalidTypeResponse.body.success).toBe(false);
      expect(invalidTypeResponse.body.error.code).toBe('INVALID_CALCULATION_TYPE');

      // 5. 空の計算式
      const emptyExpressionResponse = await request(app)
        .post('/api/calculations')
        .send({
          expression: '',
          type: 'basic'
        })
        .expect(400);

      expect(emptyExpressionResponse.body.success).toBe(false);
      expect(emptyExpressionResponse.body.error.code).toBe('EMPTY_EXPRESSION');

      // エラーが発生した計算は履歴に保存されないことを確認
      const historyResponse = await request(app)
        .get('/api/calculations/history')
        .expect(200);

      expect(historyResponse.body.data.history).toHaveLength(0);
    });

    test('無効なフィルターパラメータのテスト', async () => {
      // 計算を1つ実行
      await request(app)
        .post('/api/calculations')
        .send({
          expression: '5 + 5',
          type: 'basic'
        })
        .expect(200);

      // 無効なフィルターでリクエスト
      const invalidFilterResponse = await request(app)
        .get('/api/calculations/history?filter=invalid-filter')
        .expect(400);

      expect(invalidFilterResponse.body.success).toBe(false);
      expect(invalidFilterResponse.body.error.code).toBe('INVALID_FILTER');
    });
  });

  describe('パフォーマンステスト', () => {
    test('大量の計算リクエストを処理できる', async () => {
      const startTime = Date.now();
      const numRequests = 50;
      const promises = [];

      // 並行して複数の計算リクエストを送信
      for (let i = 0; i < numRequests; i++) {
        const promise = request(app)
          .post('/api/calculations')
          .send({
            expression: `${i} + ${i + 1}`,
            type: 'basic'
          });
        promises.push(promise);
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 全てのリクエストが成功することを確認
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.result).toBe(index + (index + 1));
      });

      // 処理時間が合理的であることを確認（50リクエストを10秒以内）
      expect(duration).toBeLessThan(10000);

      // 履歴が正しく管理されていることを確認（最新10件のみ保持）
      const historyResponse = await request(app)
        .get('/api/calculations/history')
        .expect(200);

      expect(historyResponse.body.data.history).toHaveLength(10);
      
      // 最新の10件が保持されていることを確認
      const history = historyResponse.body.data.history;
      expect(history[0].expression).toBe('49 + 50');
      expect(history[0].result).toBe(99);
      expect(history[9].expression).toBe('40 + 41');
      expect(history[9].result).toBe(81);

      console.log(`パフォーマンステスト: ${numRequests}リクエストを${duration}msで処理`);
    });

    test('履歴の最大件数制限が適切に動作する', async () => {
      // 12件の計算を実行（制限は10件）
      for (let i = 1; i <= 12; i++) {
        await request(app)
          .post('/api/calculations')
          .send({
            expression: `${i} * 2`,
            type: 'basic'
          })
          .expect(200);
      }

      // 履歴が10件に制限されていることを確認
      const historyResponse = await request(app)
        .get('/api/calculations/history')
        .expect(200);

      expect(historyResponse.body.data.history).toHaveLength(10);

      // 最新の10件が保持されていることを確認
      const history = historyResponse.body.data.history;
      expect(history[0].expression).toBe('12 * 2'); // 最新
      expect(history[0].result).toBe(24);
      expect(history[9].expression).toBe('3 * 2');  // 10番目
      expect(history[9].result).toBe(6);

      // 統計情報も正しいことを確認
      const statsResponse = await request(app)
        .get('/api/calculations/history/stats')
        .expect(200);

      expect(statsResponse.body.data.totalCount).toBe(10);
    });
  });

  describe('境界値テスト', () => {
    test('大きな数値の計算', async () => {
      const response = await request(app)
        .post('/api/calculations')
        .send({
          expression: '999999999 + 1',
          type: 'basic'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBe(1000000000);
    });

    test('小数点以下の精度テスト', async () => {
      const response = await request(app)
        .post('/api/calculations')
        .send({
          expression: '0.1 + 0.2',
          type: 'basic'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      // JavaScriptの浮動小数点誤差を考慮
      expect(response.body.data.result).toBeCloseTo(0.3, 10);
    });

    test('税計算の丸め処理テスト', async () => {
      // 税込み計算（小数点以下の丸め）
      const taxInclusiveResponse = await request(app)
        .post('/api/calculations')
        .send({
          expression: '333.33',
          type: 'tax-inclusive'
        })
        .expect(200);

      expect(taxInclusiveResponse.body.success).toBe(true);
      expect(taxInclusiveResponse.body.data.result).toBe(366.66);

      // 税抜き計算（小数点以下の丸め）
      const taxExclusiveResponse = await request(app)
        .post('/api/calculations')
        .send({
          expression: '366.66',
          type: 'tax-exclusive'
        })
        .expect(200);

      expect(taxExclusiveResponse.body.success).toBe(true);
      expect(taxExclusiveResponse.body.data.result).toBeCloseTo(333.33, 2);
    });
  });
});