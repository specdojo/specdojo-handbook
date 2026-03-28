# 全 rules のライフサイクルを一括実行

@file:.github/skills/rules-lifecycle-all/SKILL.md

`/docs/ja/handbook/rules` 配下の **すべての `*-rules.md`** を対象に、
各 rules について Phase 1（rules）→ Phase 2（derivatives）を順に実行してください。

## 対象ルール

- 対象は `docs/ja/handbook/rules/*-rules.md`
- `meta-*-rules.md` は対象外
- 実行順はファイル名昇順（再現性のため）

## 実行モード

- 既定は `Standard`（`standard`）で実行
- 明示指定がある場合のみ `manual` / `agent-max` / `agent-ultra` を使用

## 進め方

1. 対象 rules を列挙（`meta-*-rules.md` を除外）
2. 各 `<name>-rules.md` について以下を実行
   - Phase 1: ① agent draft → ② modify → ③ agent review → ④ human approve
   - Phase 2: ⑤ agent draft → ⑥ agent review → ⑦ human approve
3. 各ファイルの完了時に、変更ファイル・レビュー要点・未解決事項を記録
4. 全件終了後に `npm run -s lint:md` を実行して結果を報告

## 承認ゲート

- `PO` 承認が必要な ④/⑦ では、対象 `<name>` ごとに承認待ちを明示する
- 承認待ちの間は次の `<name>` へ進まない

## 出力形式

- 対象一覧（処理順）
- `<name>` ごとの結果
  - `rules`: updated / created / no-change
  - `instruction`: updated / created / no-change
  - `sample`: updated / created / no-change
  - review 指摘（あれば）
  - 承認結果（④/⑦）
- 全体サマリ（成功件数 / 差し戻し件数）
- lint 結果
