"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const calculations_1 = __importDefault(require("./routes/calculations"));
const validation_1 = require("./middleware/validation");
const types_1 = require("./types");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    app.use((0, cors_1.default)({
        origin: process.env['NODE_ENV'] === 'production'
            ? ['http://localhost:3000', 'http://127.0.0.1:3000']
            : true,
        credentials: true,
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    app.use(express_1.default.json({
        limit: '1mb',
        strict: true,
    }));
    app.use(express_1.default.urlencoded({
        extended: true,
        limit: '1mb'
    }));
    if (process.env['NODE_ENV'] === 'development') {
        app.use((_req, _res, next) => {
            console.log(`${new Date().toISOString()} - ${_req.method} ${_req.path}`);
            if (_req.body && Object.keys(_req.body).length > 0) {
                console.log('Request body:', JSON.stringify(_req.body, null, 2));
            }
            next();
        });
    }
    app.get('/health', (_req, res) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            service: 'calculator-backend'
        });
    });
    app.use(types_1.API_PATHS.CALCULATIONS, calculations_1.default);
    app.use(validation_1.notFoundHandler);
    app.use(validation_1.errorHandler);
    return app;
}
exports.default = createApp;
//# sourceMappingURL=app.js.map