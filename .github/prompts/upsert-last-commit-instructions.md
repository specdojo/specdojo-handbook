# 直近コミット差分の rules から instructions をアップサート

@file:.github/skills/rules-to-instruction/SKILL.md

`HEAD~1..HEAD` の差分に含まれる
`/docs/ja/handbook/rulebooks/*-rulebook.md` のみを対象に、
対応する `/docs/ja/handbook/instructions/*-instruction.md` を作成または更新してください。

## 対象抽出

1. `HEAD~1..HEAD` の変更ファイルを取得する
   - `HEAD~1` が存在しない場合（初回コミット等）は `HEAD` 単体の変更として扱う
2. `docs/ja/handbook/rulebooks/*-rulebook.md` に一致するものだけを対象にする
   - `meta-*-rulebook.md` は対象外とする
3. 対象が0件なら「更新不要」と明示して終了する

## 対応ルール

- 対応先は `rules` と同名の `<name>-instruction.md`
  - 例: `utc-index-rulebook.md` → `utc-index-instruction.md`
- `meta-*-rulebook.md` は `*-instruction.md` 作成/更新の対象外とする
- 対応する instruction が存在しない場合は新規作成
- 存在する場合はアップサート（不足項目追記・不整合修正）

## 生成要件

- 見出し順・必須項目・必須表・禁止事項・最終チェックを rules と整合
- index/term などの責務境界を維持
- 曖昧語を避け、判定可能な指示にする
- ルール本文の丸写しは避け、生成AI実行テンプレートとして再構成

## 出力

- 対象 rules ファイル一覧
- 変更した instruction ファイル一覧
- 各ファイルの反映要点（1〜3行）
- lint結果（`npm run -s lint:md`）
