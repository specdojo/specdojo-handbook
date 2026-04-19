---
id: prj-deliverables-catalog-instruction
type: instruction
status: draft
rulebook: prj-deliverables-catalog-rulebook
---

# 成果物カタログ 作成指示

## 1. 目的と前提

- 目的: プロジェクト成果物の一覧と配置・派生関係を整理する
- 参照ルール: `../rulebooks/prj-deliverables-catalog-rulebook.md`
- 主な内容: 成果物一覧、目的、配置先、生成元、派生関係

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
