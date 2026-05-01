---
id: prj-success-criteria-and-acceptance-criteria-instruction
type: instruction
status: draft
rulebook: prj-success-criteria-and-acceptance-criteria-rulebook
---

# 成功基準と受入条件 作成指示

## 1. 目的と前提

- 目的: プロジェクト成功の判定基準と受入条件を明確化する
- 参照ルール: `../rulebooks/prj-success-criteria-and-acceptance-criteria-rulebook.md`
- 主な内容: 成功指標、完了定義、受入条件、判定方法、承認者

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
