"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCalculationRequest = validateCalculationRequest;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const types_1 = require("../types");
function validateCalculationRequest(req, res, next) {
    try {
        const body = req.body;
        if (!body || typeof body !== 'object') {
            const response = {
                success: false,
                error: {
                    message: 'リクエストボディが不正です',
                    code: 'INVALID_REQUEST_BODY'
                }
            };
            res.status(400).json(response);
            return;
        }
        const requestData = body;
        if (typeof requestData['expression'] !== 'string') {
            const response = {
                success: false,
                error: {
                    message: 'expression フィールドは文字列である必要があります',
                    code: 'INVALID_EXPRESSION_TYPE',
                    details: {
                        received: typeof requestData['expression'],
                        expected: 'string'
                    }
                }
            };
            res.status(400).json(response);
            return;
        }
        if (requestData['expression'].trim() === '') {
            const response = {
                success: false,
                error: {
                    message: 'expression フィールドは空であってはいけません',
                    code: 'EMPTY_EXPRESSION'
                }
            };
            res.status(400).json(response);
            return;
        }
        if (typeof requestData['type'] !== 'string') {
            const response = {
                success: false,
                error: {
                    message: 'type フィールドは文字列である必要があります',
                    code: 'INVALID_TYPE_FIELD',
                    details: {
                        received: typeof requestData['type'],
                        expected: 'string'
                    }
                }
            };
            res.status(400).json(response);
            return;
        }
        if (!(0, types_1.isCalculationType)(requestData['type'])) {
            const response = {
                success: false,
                error: {
                    message: `無効な計算タイプです: ${requestData['type']}`,
                    code: 'INVALID_CALCULATION_TYPE',
                    details: {
                        received: requestData['type'],
                        validTypes: ['basic', 'tax-inclusive', 'tax-exclusive']
                    }
                }
            };
            res.status(400).json(response);
            return;
        }
        req.body = {
            expression: requestData['expression'].trim(),
            type: requestData['type']
        };
        next();
    }
    catch (error) {
        const response = {
            success: false,
            error: {
                message: 'バリデーション処理中にエラーが発生しました',
                code: 'VALIDATION_ERROR',
                details: process.env['NODE_ENV'] === 'development' ? String(error) : undefined
            }
        };
        res.status(500).json(response);
    }
}
function errorHandler(error, _req, res, next) {
    console.error('予期しないエラーが発生しました:', error);
    if (res.headersSent) {
        next(error);
        return;
    }
    const response = {
        success: false,
        error: {
            message: 'サーバー内部エラーが発生しました',
            code: 'INTERNAL_SERVER_ERROR',
            details: process.env['NODE_ENV'] === 'development' ? {
                message: error.message,
                stack: error.stack
            } : undefined
        }
    };
    res.status(500).json(response);
}
function notFoundHandler(req, res) {
    const response = {
        success: false,
        error: {
            message: `リクエストされたエンドポイントが見つかりません: ${req.method} ${req.path}`,
            code: 'NOT_FOUND',
            details: {
                method: req.method,
                path: req.path,
                availableEndpoints: [
                    'POST /api/calculations',
                    'GET /api/calculations/history',
                    'DELETE /api/calculations/history',
                    'GET /api/calculations/history/stats'
                ]
            }
        }
    };
    res.status(404).json(response);
}
//# sourceMappingURL=validation.js.map