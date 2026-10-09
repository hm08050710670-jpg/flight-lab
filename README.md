# GOLF GUTS FLIGHT LAB（仮称）

ドライバーの弾道を画像で選ぶと、インパクト付近のヘッド軌道とフェースの向きの関係を図で確認できるスマートフォン向けWebアプリ（試作）。

## 構成

- `app/index.html` — 本体（弾道選択後に矢印リボンも表示する版）
- `app/index-noarrow.html` — 本体（ボールの飛行だけで見せる版）
- `mockups/guide-options.html` — UI案の比較ページ（検討用）
- `assets/` — 使用画像の元ファイル（HTMLには埋め込み済み）
- `tests/` — Playwright による動作確認スクリプト
- `docs/spec-v1.txt` — 初期仕様書（現行との差分は CHANGELOG 参照）

## 動作確認

```
cd tests && npm i playwright && node test.js
```

## 現行と初期仕様の主な差分

- 風の質問を廃止（結果の前提書きに風の注意を記載）
- 打点は4択ボタン → フェース写真をタップして判定（上下も参考記録）
- 右打ち固定（左打ちの仕組みは残置）
- 別例の切り替えを9分類すべてに拡張
- STEP 1/2 の案内表示、結果画面の下スワイプ案内 を追加
