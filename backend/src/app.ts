import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import calculationsRouter from './routes/calculations';
import { errorHandler, notFoundHandler } from './middleware/validation';
import { API_PATHS } from './types';

/**
 * Express アプリケーションの設定と初期化
 * 
 * セキュリティ、CORS、ルーティングなどの
 * 基本的なミドルウェアを設定
 */
export function createApp(): Application {
  const app = express();

  // セキュリティヘッダーの設定
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Material-UIのインラインスタイルを許可
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // 開発環境での制約を緩和
  }));

  // CORS設定
  app.use(cors({
    origin: process.env['NODE_ENV'] === 'production' 
      ? ['http://localhost:3000', 'http://127.0.0.1:3000'] // 本番環境では特定のオリジンのみ許可
      : true, // 開発環境では全オリジンを許可
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // JSON パーサーの設定
  app.use(express.json({
    limit: '1mb', // リクエストサイズ制限
    strict: true, // 厳密なJSONパースを要求
  }));

  // URL エンコードされたデータのパース
  app.use(express.urlencoded({ 
    extended: true,
    limit: '1mb'
  }));

  // リクエストログ（開発環境のみ）
  if (process.env['NODE_ENV'] === 'development') {
    app.use((_req, _res, next) => {
      console.log(`${new Date().toISOString()} - ${_req.method} ${_req.path}`);
      if (_req.body && Object.keys(_req.body as Record<string, unknown>).length > 0) {
        console.log('Request body:', JSON.stringify(_req.body, null, 2));
      }
      next();
    });
  }

  // ヘルスチェックエンドポイント
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'calculator-backend'
    });
  });

  // APIルートの設定
  // API_PATHSを使用してエンドポイントパスを一元管理
  app.use(API_PATHS.CALCULATIONS, calculationsRouter);

  // 404 ハンドラー（全ルートの最後に配置）
  app.use(notFoundHandler);

  // エラーハンドリングミドルウェア（最後に配置）
  app.use(errorHandler);

  return app;
}

export default createApp;