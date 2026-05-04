# UX as Novel: Yumeya User Journey

## Chapter 1: The Dream Awakens

朝の光が差し込む部屋。佐藤は目を覚まし、昨夜見た夢を思い出そうとしていた。不思議なことに、夢の断片が鮮明に残っている。彼はスマホを手に取り、Yumeya アプリを開いた。

「昨日の夢を記録しよう」

彼はアプリの「夢を記録」ボタンをタップした。シンプルな入力画面が表示される。夢の内容を自由に書き込む。感情タグを選択し、「保存」を押す。これだけで、彼の夢データが Firestore に保存された。

## Chapter 2: The Goal Takes Shape

数日後、佐藤は「目標管理」セクションを開いた。彼は「小説を書く」という大きな目標を設定した。Objective として「毎日30分書く」を追加し、Key Result として「月に10話完成させる」を設定した。

カンバンビューが表示される。各タスクが「未着手」「進行中」「完了」の列に整理されている。直感的なドラッグ＆ドロップでタスクを移動できる。進捗率がリアルタイムで更新され、彼のモチベーションが高まっていくのを感じた。

## Chapter 3: The Analysis Deepens

ある日、アプリが通知を送ってきた。「あなたの夢と目標に関連するデータを分析しました」。

彼は通知をタップした。Dream-Parse Service による解析結果が表示されている。夢の中で現れた象徴的なシーンが、彼の目標達成への心理的ブロックに関連していることが示唆されていた。感情分析では「不安」と「期待」が混在していることがわかった。

「なるほど、そういうことか」

彼はこの洞察を元に、目標の進め方を調整することにした。

## Chapter 4: The Payment Bridge

アプリの機能をフル活用したい佐藤は、プレミアムプランへのアップグレードを決意した。Stripe Checkout の画面が表示される。クレジットカード情報を入力し、支払いを完了する。

数秒後、Webhook が Hono サーバーに届いた。`payment_intent.succeeded` イベントが処理され、彼のアカウントの `subscription_status` が更新された。プレミアム機能が即座に解放される。

「これで高度な分析機能が使えるようになった」

## Chapter 5: The Debug Session

開発チームの田中は、あるユーザーからのバグ報告を調査していた。彼は Firestore のデータをローカルにバックアップすることにした。

```bash
curl -X POST https://api.yumeya.app/admin/backup \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"format": "sqlite"}'
```

数秒後、SQLite ファイルがダウンロードされた。彼はローカルの SQLite クライアントでデータを開き、問題のユーザーデータを詳しく調査した。jsonl や csv 形式でもエクスポートでき、デバッグが格段に楽になった。

## Chapter 6: The Test Suite

CI パイプラインが緑色に光っている。Jest Tests workflow が正常に完了した。新しく追加された API バリデーション（Zod）のテストが全て通過した。

バックエンドの Hono エンドポイントに対するユニットテストも追加された。Docker Compose を使用した結合テスト環境では、Firestore エミュレータを使った E2E テストが実行されている。

「品質は守られている」

田中は安心して、次のフィーチャーブランチに切り替えた。

## Epilogue: The Dream Continues

佐藤は今日も夢を記録し、目標に向かって進んでいく。彼のデータは安全に保存され、必要に応じて分析され、彼の成長を支えている。

Yumeya は、夢と現実を繋ぐ架け橋として、彼の人生の一部となった。

---

*This novel-style UX document illustrates the core user journeys and technical features planned for the Yumeya project, based on the created issues and architecture discussion.*
