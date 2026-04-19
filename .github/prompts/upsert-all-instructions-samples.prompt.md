# docs-contents-guide を正として instruction / sample を一括アップサート

@file:.github/skills/upsert-all-instructions-samples/SKILL.md

`/upsert-all-instructions-samples` は、上記 SKILL に定義された手順と実行ルールに従って実行してください。

## 入力の扱い

- 引数がある場合は、その引数セットを対象として処理する。
- 引数がない場合は、docs-contents-guide の全対象を処理する。
- 引数解釈（短縮名、複数指定、相対/絶対パス、重複正規化）および対象判定は SKILL の規則に従う。

## 実行方針

- docs-contents-guide の `推奨ファイル名` を正として対象を抽出する。
- 対象除外、失敗時継続、各ステップの詳細は SKILL の定義を正とする。
- 処理完了後に `npm run -s lint:md` を実行する。

## 出力

- 対象ごとの結果（更新 / 新規 / スキップ / 失敗）
- 変更ファイル一覧
- lint 結果
