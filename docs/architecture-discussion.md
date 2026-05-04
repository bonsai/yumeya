# Architecture Decision Records (ADR)

## ADR 001: Frontend Stack - Vite + React + TypeScript

### Status
Accepted

### Context
夢データの記録・目標管理を行うSPAが必要。開発速度と型安全性を重視。

### Decision
- **Vite**: 高速な開発サーバーとビルド
- **React 19**: UIライブラリ
- **TypeScript**: 型安全性の確保
- **Tailwind CSS 4**: ユーティリティファーストCSS
- **Radix UI**: アクセシブルなコンポーネント

### Consequences
- ✅ 高速な開発体験
- ✅ 豊富なエコシステム
- ✅ Bun でのパッケージ管理が可能
- ⚠️ バンドルサイズの最適化が必要

---

## ADR 002: Backend Stack - Hono + Bun

### Status
Accepted

### Context
軽量で高速なAPIサーバーが必要。TypeScriptで統一し、エッジランタイムも視野に入れる。

### Decision
- **Hono**: 軽量Webフレームワーク（150行程度でAPI構築可能）
- **Bun**: JavaScriptランタイム（Node.js互換、高速）
- **Zod**: リクエストバリデーション（#5）
- **Stripe SDK**: 決済処理（#4）

### Consequences
- ✅ シンプルで学習コストが低い
- ✅ Bunの高速性を活かせる
- ✅ Cloudflare Workers等への移行が容易
- ⚠️ 大規模なバックエンドロジックには不向き

---

## ADR 003: Database - Firebase Firestore

### Status
Accepted

### Context
リアルタイム同期が可能なNoSQLデータベースが必要。認証・セキュリティルールとの統合が重要。

### Decision
- **Firebase Firestore**: メインデータベース
- **Firebase Authentication**: 認証基盤
- **セキュリティルール**: データアクセス制御
- **Firestore エミュレータ**: 結合テスト用（#6）

### Data Models
```
users/{userId}
  - email, displayName, subscription_status
  - goals/{goalId}
    - title, description, progress
    - objectives/{objectiveId}
      - title, keyResults[{id, title, progress}]
  - dreams/{dreamId}
    - content, emotions[], tags[], analyzedAt
```

### Consequences
- ✅ リアルタイム同期が容易
- ✅ スケーラブル
- ✅ Firebase エコシステムとの親和性
- ⚠️ リレーショナルなクエリが苦手
- ⚠️ セキュリティルールの設計が重要

---

## ADR 004: Monorepo Structure - Bun Workspaces + Turbo

### Status
Accepted

### Context
フロントエンド・バックエンド・共有型定義を一元管理したい。

### Decision
- **Bun Workspaces**: パッケージ管理
- **Turbo**: タスク実行の最適化
- **共有パッケージ**: `shared/` に型定義を集約

### Structure
```
yumeya/
  ├── client/     # Vite + React
  ├── server/     # Hono + Bun
  ├── shared/     # TypeScript型定義
  └── docs/       # ドキュメント
```

### Consequences
- ✅ コード共有が容易
- ✅ 一元的な依存関係管理
- ✅ CI/CDの効率化
- ⚠️ モノレポ運用の学習コスト

---

## ADR 005: Testing Strategy - Jest + Docker Compose

### Status
Accepted

### Context
クライアント・サーバー両方のテストが必要。CI環境での結合テストも重要。

### Decision
- **Jest**: クライアント・サーバーのユニットテスト
- **@testing-library/react**: Reactコンポーネントテスト
- **Firestore エミュレータ**: バックエンド結合テスト（#6）
- **Docker Compose**: 統合テスト環境（#7）
- **GitHub Actions**: CI/CDパイプライン

### Test Pyramid
```
E2E Tests (Docker Compose)
  ↓
Integration Tests (Firestore Emulator)
  ↓
Unit Tests (Jest)
```

### Consequences
- ✅ 多層的なテストカバレッジ
- ✅ CIでの自動テスト実行
- ✅ ローカルでのデバッグが容易（#8: SQLite backup）
- ⚠️ テスト環境のメンテナンスコスト

---

## ADR 006: Payment Integration - Stripe

### Status
Proposed (see #4)

### Context
サブスクリプション・従量課金の収益化モデルが必要。

### Decision
- **Stripe Checkout**: 決済フロー
- **Stripe Webhooks**: 支払い完了イベントの受信
- **Hono Webhook Handler**: `payment_intent.succeeded` の処理
- **subscription_status**: ユーザーの課金状態管理

### Consequences
- ✅ 信頼性の高い決済基盤
- ✅ サブスクリプション管理が容易
- ⚠️ Webhookのセキュリティ検証が必要
- ⚠️ 決済関連のエラーハンドリングが重要

---

## ADR 007: Debug & Backup Strategy

### Status
Proposed (see #8)

### Context
本番データのデバッグを安全に行う仕組みが必要。

### Decision
- **jsonl export**: 行指向JSONでのエクスポート
- **csv export**: 表計算ソフトでの閲覧用
- **SQLite backup**: ローカルデバッグ用データベース
- **Hono Export API**: 管理者用エクスポートエンドポイント

### Consequences
- ✅ 安全なデバッグ環境
- ✅ データのポータビリティ
- ✅ ローカルでの迅速な問題解決
- ⚠️ 機密データの取り扱いに注意

---

## ADR 008: CI/CD & Workflows

### Status
Accepted

### Context
自動テスト・コードレビュー・イシュー管理の自動化が必要。

### Decision
- **GitHub Actions**: CI/CDパイプライン
- **Jest Tests workflow**: 自動テスト実行
- **Devin Review**: AIコードレビュー
- **Issue-to-Branch**: イシュー作成時の自動ブランチ作成
- **Bun setup**: 高速なパッケージインストール

### Workflows
```
push to main
  → Jest Tests
  → Devin Review
  → (if labeled) Issue-to-Branch
```

### Consequences
- ✅ 自動化による品質保証
- ✅ 開発フローの標準化
- ✅ AIを活用したコードレビュー
- ⚠️ ワークフロー設定の保守

---

## Stack Inventory (棚卸し)

| Category | Technology | Status | Purpose |
|----------|-----------|--------|---------|
| Frontend | Vite | ✅ Active | Build tool |
| Frontend | React 19 | ✅ Active | UI library |
| Frontend | TypeScript | ✅ Active | Type safety |
| Frontend | Tailwind CSS 4 | ✅ Active | Styling |
| Frontend | Radix UI | ✅ Active | Components |
| Frontend | Jest | ✅ Active | Testing |
| Backend | Hono | ✅ Active | API framework |
| Backend | Bun | ✅ Active | Runtime |
| Backend | Zod | 📋 Planned | Validation (#5) |
| Backend | Stripe SDK | 📋 Planned | Payments (#4) |
| Database | Firebase Firestore | ✅ Active | Main DB |
| Database | Firebase Auth | ✅ Active | Authentication |
| Database | SQLite | 📋 Planned | Debug backup (#8) |
| Monorepo | Bun Workspaces | ✅ Active | Package mgmt |
| Monorepo | Turbo | ✅ Active | Task runner |
| Testing | Jest | ✅ Active | Unit tests |
| Testing | Firestore Emulator | 📋 Planned | Integration (#6) |
| Testing | Docker Compose | 📋 Planned | E2E tests (#7) |
| CI/CD | GitHub Actions | ✅ Active | Automation |
| CI/CD | Devin Review | ✅ Active | AI review |
| Debug | jsonl/csv export | 📋 Planned | Backup (#8) |

**Legend**: ✅ Active | 📋 Planned | 🚧 In Progress

## 📎 まとめ：迷ったらシンプルに始めよう

これまでの議論を経て、「Vite + Firebase」は、小規模プロジェクトにとって非常に強力な選択肢です。

結論として、以下の2パターンを提示します。

1. **まずは「Vite + Firebase」で始める (推奨)**：今後、Cloudflare Workersなどの追加が必要になることはおそらくなく、プロジェクトの成長に合わせてFirebase Functionsなどで対応していくのがベストです。
2. **Cloudflare Workersは「選択肢」としてキープ**：将来的に、Firebase Functionsでは難しい特殊なエッジ処理やレイテンシの極限までの削減が必要になった場合に検討する。

最終的には、「APIサーバーのロジックをどこに書くか」というトレードオフの違いです。まずは最もシンプルな「Vite + Firebase」でプロトタイプを作り、動かしてみるのが、今回のプロジェクトにとっては最適なスタート地点と言えるでしょう。
