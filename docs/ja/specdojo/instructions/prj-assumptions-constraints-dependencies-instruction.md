---
id: prj-assumptions-constraints-dependencies-instruction
type: instruction
status: draft
rulebook: prj-assumptions-constraints-dependencies-rulebook
---

# 前提・制約・依存関係 作成指示

## 1. 目的と前提

- 目的: 実行上の前提条件・制約事項・外部依存を明示する
- 参照ルール: `../rulebooks/prj-assumptions-constraints-dependencies-rulebook.md`
- 主な内容: 前提条件、制約事項、依存先、影響、対応方針

## 2. 入力情報

- 対象スコープ、関係者、参照元ドキュメント
- 制約、前提条件、未確定事項

## 3. 出力フォーマット

- Frontmatter は `id` / `type` / `status` を必須とする。
- 見出しは連番付きで、本文は 1. 目的と適用範囲から開始する。

## 4. 記述ルール

- 事実と判断を分離して記述する。
- 主要な表は列見出しを固定し、判定基準を明記する。
- 章参照は章タイトルで記述する。

## 5. 禁止事項

- 実装詳細の混入を禁止する。
- 曖昧語のみで結論を記述しない。

## 6. 最終チェック

- 必須項目が欠落していない。
- 参照ルールの禁止事項に抵触していない。
- Markdown lint でエラーがない。
