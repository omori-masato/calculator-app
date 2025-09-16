import { createApp } from './app';

/**
 * サーバーの起動とポート設定
 * 
 * 環境変数からポート番号を取得し、
 * Expressアプリケーションを起動
 */
const PORT = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3001;
const HOST = process.env['HOST'] || 'localhost';

// アプリケーションのインスタンスを作成
const app = createApp();

/**
 * サーバーの正常終了処理
 */
function gracefulShutdown(signal: string): void {
  console.log(`\n${signal} signal received.`);
  console.log('Closing HTTP server...');
  
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  // 10秒でタイムアウト
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// サーバーの起動
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Calculator Backend Server started`);
  console.log(`📍 Server running at: http://${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   POST   http://${HOST}:${PORT}/api/calculations`);
  console.log(`   GET    http://${HOST}:${PORT}/api/calculations/history`);
  console.log(`   DELETE http://${HOST}:${PORT}/api/calculations/history`);
  console.log(`   GET    http://${HOST}:${PORT}/api/calculations/history/stats`);
  console.log(`   GET    http://${HOST}:${PORT}/health`);
  console.log(`\n🔧 Press Ctrl+C to stop the server`);
});

// エラーハンドリング
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`❌ Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// 正常終了処理の設定
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未処理の例外やPromise拒否をキャッチ
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;