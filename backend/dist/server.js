"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const PORT = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3001;
const HOST = process.env['HOST'] || 'localhost';
const app = (0, app_1.createApp)();
function gracefulShutdown(signal) {
    console.log(`\n${signal} signal received.`);
    console.log('Closing HTTP server...');
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}
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
server.on('error', (error) => {
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
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
exports.default = server;
//# sourceMappingURL=server.js.map