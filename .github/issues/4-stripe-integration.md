# Stripe 決済システムの統合と Webhook 実装

**Labels:** enhancement

## 概要
Stripe Checkout を利用したサブスクリプションおよび従量課金フローの実装。

## 詳細
- Stripe Checkout セッション作成・完了フローの実装
- payment_intent.succeeded などの Webhook を受信するエンドポイントの作成
- 支払い完了後にデータベースの subscription_status を更新するハンドラの実装
- Hono (Bun) を使用した Webhook ハンドラの実装

## 受け入れ条件
- [ ] Stripe Checkout フローが動作する
- [ ] Webhook エンドポイントが Stripe からのイベントを正常に受信する
- [ ] 決済完了時にユーザーのサブスクリプション状態が更新される
- [ ] テストコードが追加されている
