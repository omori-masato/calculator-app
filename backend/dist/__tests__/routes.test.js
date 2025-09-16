"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const HistoryManager_1 = require("../services/HistoryManager");
describe('API Routes', () => {
    let app;
    beforeAll(() => {
        app = (0, app_1.createApp)();
    });
    beforeEach(() => {
        HistoryManager_1.HistoryManager.clearHistory();
    });
    describe('POST /api/calculations', () => {
        describe('基本計算', () => {
            test('正常な計算リクエスト', async () => {
                const requestData = {
                    expression: '2 + 3',
                    type: 'basic'
                };
                const response = await (0, supertest_1.default)(app)
                    .post('/api/calculations')
                    .send(requestData)
                    .expect(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.result).toBe(5);
                expect(typeof response.body.data.historyId).toBe('string');
            });
            test('複雑な計算式', async () => {
                const requestData = {
                    expression: '10 * 2 + 5 - 3',
                    type: 'basic'
                };
                const response = await (0, supertest_1.default)(app)
                    .post('/api/calculations')
                    .send(requestData)
                    .expect(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.result).toBe(22);
            });
            test('小数点を含む計算', async () => {
                const requestData = {
                    expression: '3.14 * 2',
                    type: 'basic'
                };
                const response = await (0, supertest_1.default)(app)
                    .post('/api/calculations')
                    .send(requestData)
                    .expect(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.result).toBeCloseTo(6.28, 10);
            });
        });
        describe('税計算', () => {
            test('税込み計算', async () => {
                const requestData = {
                    expression: '100',
                    type: 'tax-inclusive'
                };
                const response = await (0, supertest_1.default)(app)
                    .post('/api/calculations')
                    .send(requestData)
                    .expect(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.result).toBe(110);
            });
            test('税抜き計算', async () => {
                const requestData = {
                    expression: '110',
                    type: 'tax-exclusive'
                };
                const response = await (0, supertest_1.default)(app)
                    .post('/api/calculations')
                    .send(requestData)
                    .expect(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.result).toBe(100);
            });
            test('小数点を含む税計算', async () => {
                const requestData = {
                    expression: '123.45',
                    type: 'tax-inclusive'
                };
                const response = await (0, supertest_1.default)(app)
                    .post('/api/calculations')
                    .send(requestData)
                    .expect(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.result).toBe(135.8);
            });
        });
        describe('エラーケース', () => {
            test('無効なリクエストボディ', async () => {
                await (0, supertest_1.default)(app)
                    .post('/api/calculations')
                    .send({})
                    .expect(400);
                await (0, supertest_1.default)(app)
                    .post('/api/calculations')
                    .send({ expression: '2 + 3' })
                    .expect(400);
                await (0, supertest_1.default)(app)
                    .post('/api/calculations')
                    .send({ type: 'basic' })
                    .expect(400);
            });
            test('無効な計算式', async () => {
                const response = await (0, supertest_1.default)(app)
                    .post('/api/calculations')
                    .send({
                    expression: '',
                    type: 'basic'
                })
                    .expect(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('EMPTY_EXPRESSION');
            });
            test('無効な計算タイプ', async () => {
                const response = await (0, supertest_1.default)(app)
                    .post('/api/calculations')
                    .send({
                    expression: '2 + 3',
                    type: 'invalid-type'
                })
                    .expect(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('INVALID_CALCULATION_TYPE');
            });
            test('ゼロ除算エラー', async () => {
                const response = await (0, supertest_1.default)(app)
                    .post('/api/calculations')
                    .send({
                    expression: '5 / 0',
                    type: 'basic'
                })
                    .expect(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('DIVISION_BY_ZERO');
            });
            test('危険な文字を含む計算式', async () => {
                const response = await (0, supertest_1.default)(app)
                    .post('/api/calculations')
                    .send({
                    expression: 'eval(alert(1))',
                    type: 'basic'
                })
                    .expect(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.code).toBe('INVALID_EXPRESSION');
            });
        });
    });
    describe('GET /api/calculations/history', () => {
        beforeEach(() => {
            HistoryManager_1.HistoryManager.saveCalculation('2 + 3', 5, 'basic');
            HistoryManager_1.HistoryManager.saveCalculation('100', 110, 'tax-inclusive');
            HistoryManager_1.HistoryManager.saveCalculation('110', 100, 'tax-exclusive');
        });
        test('全履歴取得', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/calculations/history')
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.history).toHaveLength(3);
            expect(Array.isArray(response.body.data.history)).toBe(true);
        });
        test('フィルタリングされた履歴取得', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/calculations/history?filter=basic')
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.history).toHaveLength(1);
            expect(response.body.data.history[0].type).toBe('basic');
        });
        test('税込み計算の履歴フィルタリング', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/calculations/history?filter=tax-inclusive')
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.history).toHaveLength(1);
            expect(response.body.data.history[0].type).toBe('tax-inclusive');
        });
        test('無効なフィルター', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/calculations/history?filter=invalid')
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('INVALID_FILTER');
        });
        test('空の履歴', async () => {
            HistoryManager_1.HistoryManager.clearHistory();
            const response = await (0, supertest_1.default)(app)
                .get('/api/calculations/history')
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.history).toHaveLength(0);
        });
    });
    describe('DELETE /api/calculations/history', () => {
        test('履歴の削除', async () => {
            HistoryManager_1.HistoryManager.saveCalculation('1 + 1', 2, 'basic');
            HistoryManager_1.HistoryManager.saveCalculation('2 + 2', 4, 'basic');
            expect(HistoryManager_1.HistoryManager.getHistoryCount()).toBe(2);
            const response = await (0, supertest_1.default)(app)
                .delete('/api/calculations/history')
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.message).toContain('2件の履歴を削除しました');
            expect(HistoryManager_1.HistoryManager.getHistoryCount()).toBe(0);
        });
        test('空の履歴の削除', async () => {
            const response = await (0, supertest_1.default)(app)
                .delete('/api/calculations/history')
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.message).toContain('0件の履歴を削除しました');
        });
    });
    describe('GET /api/calculations/history/stats', () => {
        test('統計情報の取得', async () => {
            HistoryManager_1.HistoryManager.saveCalculation('1 + 1', 2, 'basic');
            HistoryManager_1.HistoryManager.saveCalculation('2 + 2', 4, 'basic');
            HistoryManager_1.HistoryManager.saveCalculation('100', 110, 'tax-inclusive');
            const response = await (0, supertest_1.default)(app)
                .get('/api/calculations/history/stats')
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.totalCount).toBe(3);
            expect(response.body.data.typeStatistics.basic).toBe(2);
            expect(response.body.data.typeStatistics['tax-inclusive']).toBe(1);
            expect(response.body.data.typeStatistics['tax-exclusive']).toBe(0);
        });
        test('空の履歴での統計情報', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/calculations/history/stats')
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.totalCount).toBe(0);
            expect(response.body.data.typeStatistics.basic).toBe(0);
            expect(response.body.data.typeStatistics['tax-inclusive']).toBe(0);
            expect(response.body.data.typeStatistics['tax-exclusive']).toBe(0);
        });
    });
    describe('その他のエンドポイント', () => {
        test('ヘルスチェック', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health')
                .expect(200);
            expect(response.body.status).toBe('OK');
            expect(response.body.service).toBe('calculator-backend');
            expect(typeof response.body.timestamp).toBe('string');
        });
        test('存在しないエンドポイント', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/nonexistent')
                .expect(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('NOT_FOUND');
        });
    });
});
//# sourceMappingURL=routes.test.js.map