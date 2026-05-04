# かんばんボード

## 📋 TODO（未着手）

### イシュー #4: Stripe 決済システムの統合と Webhook 実装
- **ラベル**: enhancement
- **詳細**: Stripe Checkout を利用したサブスクリプションおよび従量課金フローの実装
- **タスク**:
  - [ ] Stripe Checkout セッション作成・完了フローの実装
  - [ ] `payment_intent.succeeded` などの Webhook を受信するエンドポイントの作成
  - [ ] 支払い完了後にデータベースの `subscription_status` を更新するハンドラの実装
  - [ ] Hono (Bun) を使用した Webhook ハンドラの実装
  - [ ] テストコードの追加

### イシュー #5: API バリデーションとテストコードの拡充
- **ラベル**: enhancement
- **詳細**: Zod 等を用いたリクエストスキーマのバリデーション実装と、サーバーサイド（Hono/Bun）のユニットテスト追加
- **タスク**:
  - [ ] Zod を使用したリクエストバリデーションが実装されている
  - [ ] Hono の主要 API エンドポイントにテストが追加されている
  - [ ] 目標階層（Goal > Objective > Key Result）の整合性チェックが実装されている
  - [ ] テストが CI (Jest Tests workflow) で実行される

### イシュー #6: Firebase Firestore 結合テストの実装
- **ラベル**: enhancement
- **詳細**: Firestore エミュレータを使用したデータ永続化の結合テスト実装
- **タスク**:
  - [ ] Firestore エミュレータを使用したテスト環境が構築されている
  - [ ] 主要な CRUD 操作に対する結合テストが実装されている
  - [ ] CI (Jest Tests workflow) で Firestore エミュレータを使用したテストが実行される
  - [ ] テスト用のセットアップ・ティアダウン処理が実装されている

### イシュー #7: Docker Compose を用いた結合テスト環境の構築
- **ラベル**: enhancement
- **詳細**: Docker Compose を使用した統合テスト環境の構築とテスト実行フローの実装
- **タスク**:
  - [ ] docker-compose.yml が作成されている
  - [ ] docker compose up でテスト環境が起動する
  - [ ] API に対する E2E テストが実装されている
  - [ ] CI ワークフローで Docker Compose を使用した結合テストが実行される
  - [ ] テスト用の初期データシード処理が実装されている

### イシュー #8: DBバックアップ機能の実装（デバッグ用：jsonl, csv, sqlite）
- **ラベル**: enhancement
- **詳細**: デバッグ目的でデータベースの内容を jsonl、csv、sqlite 形式でバックアップする機能の実装
- **タスク**:
  - [ ] jsonl 形式でのデータエクスポートが実装されている
  - [ ] csv 形式でのデータエクスポートが実装されている
  - [ ] SQLite 形式でのバックアップが実装されている
  - [ ] エクスポート用の API エンドポイントが作成されている
  - [ ] バックアップデータを使用したローカルデバッグが可能になっている

---

## 🔨 DOING（進行中）

*現在進行中のタスクはありません*

---

## ✅ DONE（完了）

### イシュー #1-3: 初期セットアップ（完了）
- [x] Vite + React + TypeScript フロントエンド構築
- [x] Hono + Bun バックエンド構築
- [x] Firebase Firestore 統合
- [x] モノレポ構造の構築（Bun Workspaces + Turbo）
- [x] Jest テスト環境のセットアップ
- [x] GitHub Actions ワークフローの追加（Devin Review、Issue-to-Branch）
- [x] アーキテクチャドキュメントの作成（ADR形式）
- [x] 収益化戦略ドキュメントの作成
- [x] UX ノベル形式ドキュメントの作成
- [x] メインブランチの変更（feat/bhvr-monorepo → main）

---

## 📊 進捗サマリー

| 項目 | 数 | 割合 |
|------|-----|------|
| 総イシュー数 | 8 | 100% |
| TODO | 5 | 62.5% |
| DOING | 0 | 0% |
| DONE | 3 | 37.5% |

---

*最終更新: 2026-05-04*
