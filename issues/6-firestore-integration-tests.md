# Firebase Firestore 結合テストの実装

**Labels:** enhancement

## 概要
Firebase Firestore を使用したデータ永続化の結合テスト実装。

## 詳細
- Firestore エミュレータを使用した結合テスト環境の構築
- 目標管理（Goal > Objective > Key Result）の CRUD 操作に対する結合テスト
- 夢データの保存・取得・検索に対するテスト
- CI 環境での Firestore エミュレータ起動とテスト実行フローの構築

## 受け入れ条件
- [ ] Firestore エミュレータを使用したテスト環境が構築されている
- [ ] 主要な CRUD 操作に対する結合テストが実装されている
- [ ] CI (Jest Tests workflow) で Firestore エミュレータを使用したテストが実行される
- [ ] テスト用のセットアップ・ティアダウン処理が実装されている
