# TODO

ブラウザだけで動くシンプルな TODO アプリ（HTML / CSS / 素の JavaScript、依存パッケージなし）。

## 機能
- 追加（Enter）、完了チェック、削除（× ボタン）
- ダブルクリックで編集（Enter / フォーカス外しで確定、Esc で取り消し、空にすると削除）
- すべて / 未完了 / 完了済み の絞り込み（URL の `#/active` などで保持）
- 一括完了切り替え、完了済みの一括削除、残り件数の表示
- localStorage に自動保存（別タブの変更も反映）

## 使い方
```bash
npm start
```
→ http://localhost:5173 を開く

## テスト
```bash
npm test
```

## ファイル構成
| ファイル | 役割 |
| --- | --- |
| `index.html` | 画面の骨組み |
| `style.css` | 見た目（ダークモード対応） |
| `todo-core.js` | TODO の追加・完了・削除などのロジック（画面に依存しない） |
| `app.js` | 画面の描画・操作の受け付け・保存 |
| `test/todo-core.test.js` | ロジックのテスト |
| `serve.js` | 動作確認用のローカルサーバー |
