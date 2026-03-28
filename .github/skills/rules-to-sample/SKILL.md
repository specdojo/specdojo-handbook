---
name: rules-to-sample
description: '`docs/ja/handbook/rules` の更新内容を、`docs/ja/handbook/samples` の `*-sample.md` へ反映するための Skill です。'
---

# SKILL: rules-to-sample

`docs/ja/handbook/rules` の更新内容を、
`docs/ja/handbook/samples` の `*-sample.md` へ反映するための Skill です。

## 使いどころ

- 新しい `*-sample.md` を単一ファイルで新規作成したいとき
- `*-rules.md` 更新後に sample を同期したいとき
- 差分アップサートで既存 sample を保守したいとき
- 全 rules を一括で sample に同期したいとき

## 前提

- 共通運用ルール: `@file:.github/instructions/rules-to-sample.instructions.md`
- 命名対応: `<name>-rules.md` → `<name>-sample.md`
- 対象除外: `meta-*-rules.md` は sample 同期対象外
- 前提プロジェクト: 駄菓子屋の販売管理システムを構築するプロジェクト（固定）

## 実行フロー

1. 対象範囲を決める（個別/複数/全件）
2. rules を読み、必須章・必須表・禁止事項・最終チェックを抽出（`meta-*-rules.md` はスキップ）
3. 対応する sample を新規作成またはアップサート
4. 命名・章番号・見出し名称・業務文脈を整合
5. `npm run -s lint:md` で検証

## 注意事項

- rules 本文の丸写しではなく、ルールに準拠した最小の記述例として再構成する
- 既存 sample は全置換せず、差分アップサートを優先する
- 業務文脈は「駄菓子屋の販売管理システム構築プロジェクト」に統一し、他業種の題材を混在させない
- Frontmatter（`id` / `type` / `status`）と本文見出し順を rules と整合させる
- 曖昧語（十分/適切/問題ない）を避け、読み手が意図を判定できる記述にする
