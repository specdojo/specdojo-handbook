---
name: rules-to-input
description: `docs/ja/handbook/rules` の更新内容を、`docs/ja/handbook/templates` の `*-input-template.md` へ反映するための Skill です。
---

# SKILL: rules-to-input

`docs/ja/handbook/rules` の更新内容を、
`docs/ja/handbook/templates` の `*-input-template.md` へ反映するための Skill です。

## 使いどころ

- 新しい `*-input-template.md` を単一ファイルで新規作成したいとき
- `*-rules.md` 更新後に input template を同期したいとき
- 差分アップサートで既存 input template を保守したいとき
- 全 rules を一括で input template に同期したいとき

## 前提

- 共通運用ルール: `@file:.github/instructions/rules-to-input-template.instructions.md`
- 命名対応: `<name>-rules.md` → `<name>-input-template.md`
- 対象除外: `meta-*-rules.md` は input template 同期対象外

## 実行フロー

1. 対象範囲を決める（個別/複数/全件）
2. rules を読み、必須章・記述ガイド・禁止事項・最終チェックを抽出（`meta-*-rules.md` はスキップ）
3. 対応する input template を新規作成またはアップサート
4. 命名・見出し順・記入ガイダンス（何を書くべきか）を整合
5. `npm run -s lint:md` で検証

## 注意事項

- rules 本文の丸写しではなく、人間が清書前に情報を整理できる入力シートとして再構成する
- 既存 input template は全置換せず、差分アップサートを優先する
- 空欄を許容せず、不明項目は `未確定` と明記する方針を維持する
- Frontmatter（`id` / `type` / `status`）と本文見出し順を rules と整合させる
