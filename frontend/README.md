# 電卓アプリ フロントエンド

## 概要

React + TypeScript + Material-UIで実装された電卓アプリのフロントエンド部分です。

## 実装済み機能

### 基本機能
- ✅ 四則演算（+、-、×、÷）
- ✅ 小数点計算対応
- ✅ エラーハンドリング（ゼロ除算、不正な式など）

### 消費税計算機能
- ✅ 10%税込み計算（+10%）
- ✅ 10%税抜き計算（-10%）
- ✅ 小数点以下2桁精度での丸め処理

### 履歴管理機能
- ✅ 計算履歴の保存（最大10件）
- ✅ 履歴のフィルタリング（すべて/基本/税込/税抜）
- ✅ 履歴からの値再利用
- ✅ 履歴の全削除
- ✅ 相対時間表示（「〜分前」形式）

### 一時保存機能
- ✅ 2スロットでの値保存
- ✅ セッション管理（ブラウザ閉鎖時の削除）
- ✅ 保存値の呼び出し

### UI/UX
- ✅ レスポンシブデザイン（モバイル対応）
- ✅ キーボード入力対応
- ✅ Material-UI による美しいデザイン
- ✅ 統合ページ（計算機＋履歴の2画面構成）

## 技術仕様

### 使用技術
- **React**: 18.2.0
- **TypeScript**: 5.4.3
- **Material-UI**: 5.15.14
- **状態管理**: React Hooks (useState, useEffect, useCallback)
- **データ永続化**: localStorage（履歴）、sessionStorage（一時保存）

### アーキテクチャ
```
frontend/src/
├── components/          # UIコンポーネント
│   ├── Display.tsx           # 計算機ディスプレイ
│   ├── NumberPad.tsx         # 数字・演算子ボタン
│   ├── TaxCalculationButtons.tsx  # 税計算ボタン
│   ├── TemporarySaveButtons.tsx   # 一時保存ボタン
│   ├── HistoryPanel.tsx      # 履歴パネル
│   ├── CalculatorPanel.tsx   # 計算機パネル統合
│   └── UnifiedCalculator.tsx # メインコンテナ
├── hooks/              # カスタムフック
│   ├── useCalculator.ts      # 計算機状態管理
│   └── useHistory.ts         # 履歴状態管理
├── services/           # ビジネスロジック
│   └── calculationService.ts # 計算・履歴・一時保存サービス
├── utils/              # ユーティリティ
│   └── dateUtils.ts          # 日時関連処理
├── types/              # 型定義
│   └── index.ts              # 全型定義（バックエンドと同期）
├── App.tsx             # ルートコンポーネント
└── index.tsx           # エントリーポイント
```

### 型安全性
- フロントエンド・バックエンド間での型定義完全同期
- 型ガード関数による実行時検証
- TypeScript strict モード有効

## 開発・実行手順

### 1. 依存関係のインストール
```bash
cd frontend
npm install
```

### 2. 開発サーバー起動
```bash
npm start
```

### 3. ビルド
```bash
npm run build
```

### 4. テスト実行
```bash
npm test
```

## キーボードショートカット

| キー | 動作 |
|------|------|
| 0-9 | 数字入力 |
| + - * / | 演算子入力 |
| Enter, = | 計算実行 |
| Escape, C | クリア |
| Backspace | 最後の文字削除 |
| . | 小数点入力 |

## 設計思想

### ケン・トンプソンの UNIX 設計哲学に基づく実装

1. **問題の根本解決**
   - 一時的な解決策やモックデータを使わず、本格的な実装
   - eval() の安全な代替手段として Function コンストラクタを使用

2. **段階的検証**
   - 各コンポーネントが独立してテスト可能
   - 状態管理の透明性を確保

3. **長期的保守性**
   - コンポーネントの責務分離
   - 型安全性による実行時エラーの事前防止
   - 明瞭な命名規則とコメント

4. **透明性**
   - 全ての動作が後から検証可能
   - データフローの可視化
   - エラーハンドリングの明示

## パフォーマンス最適化

- **useCallback** による関数のメモ化
- **Styled Components** による効率的なCSS-in-JS
- **localStorage** / **sessionStorage** による軽量なデータ管理
- **定期更新の最適化**（履歴の相対時間表示など）

## ブラウザ対応

- Chrome（推奨）
- Firefox
- Safari
- Edge

## 今後の拡張予定

- 個別ページ（calculator.html、history.html ベース）の実装
- ルーティング機能（React Router）
- より高度な数学計算機能
- テーマ切り替え機能（ダーク/ライトモード）