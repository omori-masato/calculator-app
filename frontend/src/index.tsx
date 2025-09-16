/**
 * アプリケーションエントリーポイント
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// ルート要素を取得
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// React 18の新しいルート作成方式
const root = createRoot(container);

// アプリケーション描画
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);