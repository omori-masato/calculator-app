"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CalculationEngine_1 = require("../services/CalculationEngine");
describe('CalculationEngine', () => {
    describe('executeBasicCalculation', () => {
        describe('正常ケース', () => {
            test('基本的な四則演算', () => {
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('2 + 3')).toBe(5);
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('10 - 4')).toBe(6);
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('7 * 8')).toBe(56);
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('15 / 3')).toBe(5);
            });
            test('小数点を含む計算', () => {
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('1.5 + 2.5')).toBe(4);
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('3.14 * 2')).toBeCloseTo(6.28, 10);
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('10.5 / 2.1')).toBeCloseTo(5, 10);
            });
            test('複数の演算を含む計算', () => {
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('2 + 3 * 4')).toBe(14);
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('10 - 2 * 3')).toBe(4);
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('20 / 4 + 1')).toBe(6);
            });
            test('負の数を含む計算', () => {
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('-5 + 3')).toBe(-2);
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('10 + -3')).toBe(7);
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('-2 * -4')).toBe(8);
            });
            test('スペースを含む計算式', () => {
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('  2   +   3  ')).toBe(5);
                expect(CalculationEngine_1.CalculationEngine.executeBasicCalculation('10*2')).toBe(20);
            });
        });
        describe('異常ケース', () => {
            test('ゼロ除算', () => {
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeBasicCalculation('5 / 0');
                }).toThrow(CalculationEngine_1.CalculationError);
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeBasicCalculation('10 / 0');
                }).toThrow('ゼロで割ることはできません');
            });
            test('不正な計算式', () => {
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeBasicCalculation('');
                }).toThrow(CalculationEngine_1.CalculationError);
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeBasicCalculation('abc');
                }).toThrow(CalculationEngine_1.CalculationError);
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeBasicCalculation('2 +');
                }).toThrow(CalculationEngine_1.CalculationError);
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeBasicCalculation('+ 2');
                }).toThrow(CalculationEngine_1.CalculationError);
            });
            test('危険な文字を含む式', () => {
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeBasicCalculation('eval(alert(1))');
                }).toThrow(CalculationEngine_1.CalculationError);
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeBasicCalculation('2 + (3 * 4)');
                }).toThrow(CalculationEngine_1.CalculationError);
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeBasicCalculation('Math.pow(2, 3)');
                }).toThrow(CalculationEngine_1.CalculationError);
            });
            test('連続する演算子', () => {
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeBasicCalculation('2 ++ 3');
                }).toThrow(CalculationEngine_1.CalculationError);
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeBasicCalculation('5 -- 2');
                }).toThrow(CalculationEngine_1.CalculationError);
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeBasicCalculation('3 ** 2');
                }).toThrow(CalculationEngine_1.CalculationError);
            });
        });
    });
    describe('executeTaxCalculation', () => {
        describe('税込み計算', () => {
            test('基本的な税込み計算', () => {
                expect(CalculationEngine_1.CalculationEngine.executeTaxCalculation(100, 'tax-inclusive')).toBe(110);
                expect(CalculationEngine_1.CalculationEngine.executeTaxCalculation(1000, 'tax-inclusive')).toBe(1100);
            });
            test('小数点を含む税込み計算', () => {
                expect(CalculationEngine_1.CalculationEngine.executeTaxCalculation(123.45, 'tax-inclusive')).toBe(135.8);
                expect(CalculationEngine_1.CalculationEngine.executeTaxCalculation(99.99, 'tax-inclusive')).toBe(109.99);
            });
            test('小数点以下の丸め処理', () => {
                expect(CalculationEngine_1.CalculationEngine.executeTaxCalculation(123.456, 'tax-inclusive')).toBe(135.8);
                expect(CalculationEngine_1.CalculationEngine.executeTaxCalculation(1.234, 'tax-inclusive')).toBe(1.36);
            });
        });
        describe('税抜き計算', () => {
            test('基本的な税抜き計算', () => {
                expect(CalculationEngine_1.CalculationEngine.executeTaxCalculation(110, 'tax-exclusive')).toBe(100);
                expect(CalculationEngine_1.CalculationEngine.executeTaxCalculation(1100, 'tax-exclusive')).toBe(1000);
            });
            test('小数点を含む税抜き計算', () => {
                expect(CalculationEngine_1.CalculationEngine.executeTaxCalculation(135.8, 'tax-exclusive')).toBeCloseTo(123.45, 1);
                expect(CalculationEngine_1.CalculationEngine.executeTaxCalculation(109.99, 'tax-exclusive')).toBeCloseTo(99.99, 1);
            });
            test('小数点以下の丸め処理', () => {
                const result = CalculationEngine_1.CalculationEngine.executeTaxCalculation(111.11, 'tax-exclusive');
                expect(result).toBeCloseTo(101.01, 2);
            });
        });
        describe('異常ケース', () => {
            test('無効な数値', () => {
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeTaxCalculation(NaN, 'tax-inclusive');
                }).toThrow(CalculationEngine_1.CalculationError);
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeTaxCalculation(Infinity, 'tax-inclusive');
                }).toThrow(CalculationEngine_1.CalculationError);
            });
            test('無効な計算タイプ', () => {
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeTaxCalculation(100, 'invalid-type');
                }).toThrow(CalculationEngine_1.CalculationError);
            });
            test('基本計算タイプでの税計算呼び出し', () => {
                expect(() => {
                    CalculationEngine_1.CalculationEngine.executeTaxCalculation(100, 'basic');
                }).toThrow(CalculationEngine_1.CalculationError);
            });
        });
    });
    describe('validateExpression', () => {
        test('有効な計算式', () => {
            expect(CalculationEngine_1.CalculationEngine.validateExpression('2 + 3')).toBe(true);
            expect(CalculationEngine_1.CalculationEngine.validateExpression('10.5 * 2')).toBe(true);
            expect(CalculationEngine_1.CalculationEngine.validateExpression('-5 + 10')).toBe(true);
            expect(CalculationEngine_1.CalculationEngine.validateExpression('100/20')).toBe(true);
        });
        test('無効な計算式', () => {
            expect(() => {
                CalculationEngine_1.CalculationEngine.validateExpression('');
            }).toThrow('計算式が空または無効です');
            expect(() => {
                CalculationEngine_1.CalculationEngine.validateExpression('   ');
            }).toThrow('計算式が空または無効です');
            expect(() => {
                CalculationEngine_1.CalculationEngine.validateExpression('abc + 123');
            }).toThrow('許可されていない文字が含まれています');
            expect(() => {
                CalculationEngine_1.CalculationEngine.validateExpression('2 + 3; alert(1)');
            }).toThrow('許可されていない文字が含まれています');
        });
    });
});
describe('CalculationError', () => {
    test('エラーオブジェクトの作成', () => {
        const error = new CalculationEngine_1.CalculationError('DIVISION_BY_ZERO', 'テストエラーメッセージ', '5 / 0');
        expect(error.type).toBe('DIVISION_BY_ZERO');
        expect(error.message).toBe('テストエラーメッセージ');
        expect(error.expression).toBe('5 / 0');
        expect(error.name).toBe('CalculationError');
    });
    test('toObjectメソッド', () => {
        const error = new CalculationEngine_1.CalculationError('INVALID_EXPRESSION', 'テストエラー', 'invalid');
        const errorObj = error.toObject();
        expect(errorObj.type).toBe('INVALID_EXPRESSION');
        expect(errorObj.message).toBe('テストエラー');
        expect(errorObj.expression).toBe('invalid');
    });
});
//# sourceMappingURL=CalculationEngine.test.js.map