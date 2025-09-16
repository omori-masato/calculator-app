# 電卓アプリ デプロイメント情報

**プロジェクト名**: 電卓アプリケーション  
**作成日**: 2025-09-10  
**ステータス**: 🎉 デプロイ完了  

## デプロイ済みサービス

- **フロントエンド**: https://omori-masato.github.io/calculator-app/
- **バックエンド**: https://calculator-backend-production.up.railway.app
- **デプロイ方式**: GitHub Pages + Railway

## 本番環境設定

### バックエンド (Railway)
```
NODE_ENV=production
CORS_ORIGIN=https://omori-masato.github.io
```

### フロントエンド開発環境 (.env.development)
```
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_ENV=development
```

### フロントエンド本番環境 (.env.production)
```
REACT_APP_API_BASE_URL=https://calculator-backend-production.up.railway.app
REACT_APP_ENV=production
```

## デプロイ構成

### GitHub Pages (フロントエンド)
- **リポジトリ**: https://github.com/omori-masato/calculator-app
- **デプロイブランチ**: gh-pages-clean
- **ビルドコマンド**: `npm run build`
- **自動デプロイ**: プッシュ時

### Railway (バックエンド)
- **サービス名**: calculator-backend-production
- **リポジトリ連携**: GitHub (omori-masato/calculator-app)
- **Root Directory**: backend
- **ビルドコマンド**: 自動 (npm install && npm run build)
- **起動コマンド**: npm start
- **自動デプロイ**: プッシュ時

## CI/CD設定

### 手動デプロイ手順
1. **フロントエンド更新**:
   ```bash
   cd frontend
   npm run build
   git checkout gh-pages-clean
   cp build/* ../
   cp -r build/static ../
   git add . && git commit -m "フロントエンド更新"
   git push origin gh-pages-clean
   ```

2. **バックエンド更新**:
   ```bash
   git add . && git commit -m "バックエンド更新"
   git push origin master
   # Railwayが自動デプロイ
   ```

## 動作確認

### 基本機能テスト
- [ ] 電卓の基本演算（加算、減算、乗算、除算）
- [ ] 計算履歴の表示
- [ ] 税込み計算機能
- [ ] 一時保存機能

### API連携テスト
- [ ] POST /api/calculations - 計算実行
- [ ] GET /api/calculations/history - 履歴取得
- [ ] DELETE /api/calculations/history - 履歴削除
- [ ] GET /api/calculations/history/stats - 統計取得

## トラブルシューティング

### CORS エラー
- RailwayのCORS_ORIGINが正しく設定されているか確認
- フロントエンドのドメインが正確に指定されているか確認

### API接続エラー
- バックエンドURLが正しいか確認: https://calculator-backend-production.up.railway.app
- Railwayサービスが正常に稼働しているか確認

### GitHub Pages エラー
- gh-pages-cleanブランチが最新状態か確認
- index.htmlとstaticファイルが正しく配置されているか確認