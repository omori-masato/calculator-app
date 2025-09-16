"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const types_1 = require("../types");
const CalculationEngine_1 = require("../services/CalculationEngine");
const HistoryManager_1 = require("../services/HistoryManager");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/', validation_1.validateCalculationRequest, async (req, res) => {
    try {
        const { expression, type } = req.body;
        let result;
        if (type === 'basic') {
            result = CalculationEngine_1.CalculationEngine.executeBasicCalculation(expression);
        }
        else if (type === 'tax-inclusive' || type === 'tax-exclusive') {
            const value = parseFloat(expression);
            if (isNaN(value)) {
                throw new CalculationEngine_1.CalculationError('INVALID_EXPRESSION', '税計算には有効な数値を入力してください', expression);
            }
            result = CalculationEngine_1.CalculationEngine.executeTaxCalculation(value, type);
        }
        else {
            throw new CalculationEngine_1.CalculationError('INVALID_EXPRESSION', `不明な計算タイプです: ${String(type)}`, expression);
        }
        const historyId = HistoryManager_1.HistoryManager.saveCalculation(expression, result, type);
        const responseData = {
            result,
            historyId
        };
        const response = {
            success: true,
            data: responseData
        };
        res.status(200).json(response);
    }
    catch (error) {
        if (error instanceof CalculationEngine_1.CalculationError) {
            const response = {
                success: false,
                error: {
                    message: error.message,
                    code: error.type,
                    details: {
                        expression: error.expression,
                        type: error.type
                    }
                }
            };
            res.status(400).json(response);
        }
        else {
            const response = {
                success: false,
                error: {
                    message: 'サーバー内部エラーが発生しました',
                    code: 'INTERNAL_SERVER_ERROR',
                    details: process.env['NODE_ENV'] === 'development' ? String(error) : undefined
                }
            };
            res.status(500).json(response);
        }
    }
});
router.get('/history', (req, res) => {
    try {
        const filterParam = req.query['filter'];
        let filter;
        if (filterParam !== undefined) {
            if (!(0, types_1.isHistoryFilter)(filterParam)) {
                const response = {
                    success: false,
                    error: {
                        message: `無効なフィルターです: ${filterParam}`,
                        code: 'INVALID_FILTER',
                        details: {
                            validFilters: ['all', 'basic', 'tax-inclusive', 'tax-exclusive']
                        }
                    }
                };
                res.status(400).json(response);
                return;
            }
            filter = filterParam;
        }
        const history = HistoryManager_1.HistoryManager.getHistory(filter);
        const responseData = {
            history
        };
        const response = {
            success: true,
            data: responseData
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: {
                message: '履歴取得中にエラーが発生しました',
                code: 'HISTORY_FETCH_ERROR',
                details: process.env['NODE_ENV'] === 'development' ? String(error) : undefined
            }
        };
        res.status(500).json(response);
    }
});
router.delete('/history', (_req, res) => {
    try {
        const deletedCount = HistoryManager_1.HistoryManager.clearHistory();
        const responseData = {
            message: `${deletedCount}件の履歴を削除しました`
        };
        const response = {
            success: true,
            data: responseData
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: {
                message: '履歴削除中にエラーが発生しました',
                code: 'HISTORY_DELETE_ERROR',
                details: process.env['NODE_ENV'] === 'development' ? String(error) : undefined
            }
        };
        res.status(500).json(response);
    }
});
router.get('/history/stats', (_req, res) => {
    try {
        const stats = HistoryManager_1.HistoryManager.getHistoryStatistics();
        const totalCount = HistoryManager_1.HistoryManager.getHistoryCount();
        const responseData = {
            totalCount,
            typeStatistics: stats
        };
        const response = {
            success: true,
            data: responseData
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: {
                message: '統計情報取得中にエラーが発生しました',
                code: 'STATS_FETCH_ERROR',
                details: process.env['NODE_ENV'] === 'development' ? String(error) : undefined
            }
        };
        res.status(500).json(response);
    }
});
exports.default = router;
//# sourceMappingURL=calculations.js.map