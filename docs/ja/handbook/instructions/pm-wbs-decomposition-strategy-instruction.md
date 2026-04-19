---
id: pm-wbs-decomposition-strategy-instruction
type: instruction
status: draft
rulebook: pm-wbs-decomposition-strategy-rulebook
---

# WBS 分解戦略 作成指示

## 1. 目的と前提

- 目的: 成果物カタログをWBSへ分解する粒度・命名・分割方針を定義する。
- 参照ルール: `../rulebooks/pm-wbs-decomposition-strategy-rulebook.md`
- 主な内容: 分解原則、分解手順、粒度と完了条件、命名規則。

## 2. 入力情報

- 成果物カタログ（成果物ID、成果物説明、依存）
- 対象スコープと優先度
- 体制情報（責任者、レビュー者）
- 既存WBSまたはテンプレートの有無

## 3. 出力フォーマット

- Frontmatter は `id` / `type` / `status` を必須とする。
- `id` は `pm-wbs-decomposition-strategy`、`type` は `project` を使用する。
- 本文は次の見出し順で作成する。

1. 概要
2. 分解原則
3. 分解手順
4. 分解粒度と完了条件
5. 命名規則とID付番
6. 関連ドキュメント

## 4. 記述ルール

- 分解の起点、分割単位、レビュー観点を明記する。
- タスク粒度の基準と完了条件を定義し、判定可能にする。
- 命名規則と採番規則を明記し、改版時ルールを示す。

## 5. 禁止事項

- 分解単位や完了条件を未記載にしない。
- 命名規則なしでWBS項目を追加しない。
- 実装詳細を本文に記載しない。

## 6. 最終チェック

- 必須見出しが欠落していない。
- 分解原則、粒度基準、完了条件が記載されている。
- 関連ドキュメントが空欄でない（`（本書のみ）` 可）。
