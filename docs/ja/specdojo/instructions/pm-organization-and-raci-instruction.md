---
id: pm-organization-and-raci-instruction
type: instruction
status: draft
rulebook: pm-organization-and-raci-rulebook
---

# 組織体制と RACI 作成指示

## 1. 目的と前提

- 目的: 体制図と責任分担マトリクスを定義する。
- 参照ルール: `../rulebooks/pm-organization-and-raci-rulebook.md`
- 主な内容: 組織体制、役割定義、RACI、権限委譲、エスカレーション。

## 2. 入力情報

- 組織体制情報（組織、責任者、報告ライン）
- 役割定義（責務、成果物、代替担当）
- 主要タスク一覧（R/A/C/Iの割当）
- 権限委譲とエスカレーションルール

## 3. 出力フォーマット

- Frontmatter は `id` / `type` / `status` を必須とする。
- `id` は `pm-organization-and-raci`、`type` は `project` を使用する。
- 本文は次の見出し順で作成する。

1. 概要
2. プロジェクト体制図
3. 役割定義
4. RACI マトリクス
5. 権限委譲とエスカレーション
6. 関連ドキュメント

## 4. 記述ルール

- 役割ごとに責務と意思決定範囲を明記する。
- RACI は主要タスク単位で定義する。
- エスカレーションは条件と連絡先を明記する。

## 5. 禁止事項

- 役割定義を役職名のみで記載しない。
- RACI を未定義のままにしない。
- エスカレーション先を未記載にしない。

## 6. 最終チェック

- 必須見出しが欠落していない。
- 主要タスクに対する R/A/C/I が定義されている。
- 関連ドキュメントが空欄でない（`（本書のみ）` 可）。
