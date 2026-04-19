---
name: rulebook-to-instruction
description: '`docs/ja/handbook/rulebooks` の更新内容を、`docs/ja/handbook/instructions` の `*-instruction.md` へ反映するための Skill です。'
---

# SKILL: rulebook-to-instruction

`docs/ja/handbook/rulebooks` の更新内容を、
`docs/ja/handbook/instructions` の `*-instruction.md` へ反映するための Skill です。

## 使いどころ

- 新しい `*-instruction.md` を単一ファイルで新規作成したいとき
- `*-rulebook.md` 更新後に instruction を同期したいとき
- 差分アップサートで既存 instruction を保守したいとき
- 全 rules を一括で同期したいとき

## 前提

- 共通運用ルール: `@file:.github/instructions/rulebook-to-instruction.instructions.md`
- 命名対応: `<name>-rulebook.md` → `<name>-instruction.md`
- 出力先ディレクトリ: `docs/ja/handbook/instructions/`
- 対象除外: `meta-*-rulebook.md` は instruction 同期対象外

## 引数仕様（複数対象対応）

- `/rulebook-to-instruction <file1> <file2> ...` のような複数指定を受け付ける。
- 区切りはスペース / 改行 / カンマを受け付ける。
- 相対パスと絶対パスの両方を受け付ける。
- `-rulebook.md` を含む完全指定と、`-rulebook.md` を省略した短縮指定の両方を受け付ける。
  - 例: `imp-business-rulebook.md`
  - 例: `imp-business`（`docs/ja/handbook/rulebooks/imp-business-rulebook.md` として解釈）
- 同一対象の重複指定は 1 件に正規化する。
- 引数なしの場合は、現在開いているファイルを単一対象として扱う。

## 複数対象の実行ルール

- 正規化後の対象を 1 ファイルずつ独立に判定し、順次実行する。
- `meta-*-rulebook.md` に該当する対象は、その対象のみスキップする。
- ある対象で失敗しても他対象の処理は継続する。
- 最後に対象ごとの結果（更新 / 新規 / スキップ / 失敗）を一覧で出力する。

## 実行フロー

1. 引数有無を判定し、対象一覧を正規化する（未指定時は開いている 1 件）
2. 対象を 1 ファイルずつ順に処理する
3. 各対象 rules を読み、必須章・必須表・禁止事項・最終チェックを抽出（`meta-*-rulebook.md` は対象単位でスキップ）
4. 対応する instruction を新規作成またはアップサート
5. 命名・章番号・責務境界（index vs term）を整合
6. 対象ごとの結果を集約して出力する
7. `npm run -s lint:md` で検証

## 注意事項

- rules 本文の丸写しではなく、生成AIへの実行指示として再構成する
- 既存 instruction は全置換せず、差分アップサートを優先する
- 実装依存の詳細（SQL全文、具体クラス名等）は追加しない
