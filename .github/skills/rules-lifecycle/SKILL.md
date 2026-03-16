# SKILL: rules-lifecycle

`*-rules.md` の作成からその派生成果物（instruction / input-template）の作成までを、
エージェントと人間のレビューサイクルで進めるワークフロー Skill です。

## 使いどころ

- 新規の `*-rules.md` を作成し、そのまま派生成果物まで一貫して仕上げたいとき
- WBS アイテム単位でルールと派生成果物の完成度をトラッキングしたいとき
- Phase 1（rules）完了後に Phase 2（derivatives）へ進む判断を人間が行いたいとき

## 前提

- すべての入力/出力パスは `docs/ja/handbook/` 配下を基準とする
- `meta-*-rules.md` は本ワークフローの対象外

## 役割ラベルと担当主体

この Skill では、プロジェクト標準の `PO / BA / ARC / QE` をそのまま使い、
各ラベルに対して「誰が実行するか（人 / Agent）」を固定する。

| ラベル | 主な責務                                           | 担当主体  |
| ------ | -------------------------------------------------- | --------- |
| `PO`   | フェーズゲート判断、最終承認、進行可否の決定       | **人**    |
| `BA`   | 内容妥当性の修正、業務観点の追記・調整             | **人**    |
| `ARC`  | rules/derivatives の下書き作成、構造・整合レビュー | **Agent** |
| `QE`   | lint・禁止事項・責務境界の品質確認                 | **Agent** |

### 運用ルール

- `PO` と `BA` は必ず人が担当する（承認と意思決定は人のみ）。
- `ARC` と `QE` は Agent が担当する（同一 Agent が兼務してよい）。
- 本 Skill のデフォルト実行では、`ARC=Agent` が作成・レビューを実行し、`QE=Agent` が品質観点を補強する。
- 役割を入れ替える場合も、`PO/BA=人`、`ARC/QE=Agent` の制約は維持する。

### 参照リソース

| 種別           | パス / 参照                                          |
| -------------- | ---------------------------------------------------- |
| rules 作成     | `@file:.github/skills/upsert-rules/SKILL.md`         |
| instruction    | `@file:.github/skills/rules-to-instruction/SKILL.md` |
| input-template | `@file:.github/skills/rules-to-input/SKILL.md`       |
| sample         | `@file:.github/skills/rules-to-sample/SKILL.md`      |
| 運用ルール     | `@file:.github/instructions/rules.instructions.md`   |

## ワークフロー概要

```text
Phase 1 (rules)                Phase 2 (derivatives)
─────────────────              ──────────────────────
 ① agent draft                  ⑤ agent draft
 ② human modify                 ⑥ agent review
 ③ agent review                 ⑦ human approve
 ④ human approve                   → status: ready
    → status: ready
    → Phase 2 へ
```

- Phase 1 と Phase 2 は **直列** で実行する（Phase 1 完了が Phase 2 の前提）
- 各ステップの完了は **人間の明示的な承認** で確定する

### ステップ別担当（役割ラベル × 人/Agent）

| ステップ | 作業                        | 主担当ラベル | 実担当 |
| -------- | --------------------------- | ------------ | ------ |
| ①        | agent draft (rules)         | `ARC`        | Agent  |
| ②        | human modify (rules)        | `BA`         | 人     |
| ③        | agent review (rules)        | `QE`         | Agent  |
| ④        | human approve (rules)       | `PO`         | 人     |
| ⑤        | agent draft (derivatives)   | `ARC`        | Agent  |
| ⑥        | agent review (derivatives)  | `QE`         | Agent  |
| ⑦        | human approve (derivatives) | `PO`         | 人     |

- `BA` は ② で主担当、④/⑦ では `PO` の相談先（Consulted）として参加する。
- `PO` は ①/③/⑤/⑥ のレビュー結果を確認し、次フェーズ進行可否を最終決定する。

## Phase 1: Rules ライフサイクル

### ① agent draft — ルールの初版作成

1. 対象 `<name>` を特定する（WBS の deliverables パス、または開いているファイルから）
2. `upsert-rules` Skill を使って `rules/<name>-rules.md` を新規作成またはアップサートする
3. Frontmatter の `status` を `draft` に設定する
4. `npm run -s lint:md` で検証する

**完了条件**: lint エラーなし、標準章構成（§1〜§9）を満たしている

### ② human modify — 人間によるドラフト修正

1. エージェントがドラフトの要約と改善ポイントを提示する
2. 人間がドラフトを確認し、必要な修正を行う
3. 修正が完了したら、人間がエージェントにレビューを依頼する

**完了条件**: 人間が「レビュー依頼」を明示

### ③ agent review — エージェントによるレビュー

以下の観点でレビューを実施する:

- `meta-rulebook-structure-rules.md` との章構成整合
- `docs-contents-guide.md` との目的・内容整合
- 禁止事項（曖昧語、実装詳細、章番号飛び）の検出
- サンプルリンク（§8）と instruction リンク（§9）の有効性
- lint チェック結果

**出力**: レビュー指摘事項リスト（問題なし / 修正提案あり）

### ④ human approve — 人間による最終承認

1. レビュー指摘がある場合、人間が対応方針を判断する
2. Frontmatter の `status` を `ready` に更新する
3. Phase 2 に進むかを人間が判断する

**完了条件**: `status: ready` かつ人間が Phase 2 進行を承認

## Phase 2: Derivatives ライフサイクル

### ⑤ agent draft — 派生成果物の一括作成

Phase 1 で完成した `rules/<name>-rules.md` を入力として、以下を作成する:

1. `instructions/<name>-instruction.md` — `rules-to-instruction` Skill を使用
2. `templates/<name>-input-template.md` — `rules-to-input` Skill を使用

それぞれ Frontmatter の `status` を `draft` に設定する。

**注意**: sample (`samples/<name>-sample.md`) は本ワークフローのスコープ外とする。
必要に応じて `rules-to-sample` Skill で別途作成する。

### ⑥ agent review — エージェントによる整合性レビュー

以下の観点で instruction と input-template をレビューする:

- rules の必須章がすべて反映されているか
- 章番号・見出し名称が rules と整合しているか
- 曖昧語が含まれていないか
- instruction が「AI 実行指示」、input-template が「人間入力シート」の責務を逸脱していないか
- lint チェック結果

**出力**: 各ファイルのレビュー結果（問題なし / 修正提案あり）

### ⑦ human approve — 人間による最終承認

1. レビュー指摘がある場合、人間が対応方針を判断する
2. 全ファイルの Frontmatter `status` を `ready` に更新する

**完了条件**: instruction と input-template の `status` がともに `ready`

## 進捗トラッキング

ワークフローの各ステップで、進捗を TODO リストで管理する。
以下のテンプレートを使用する:

```text
[ ] Phase 1: ① agent draft       — <name>-rules.md
[ ] Phase 1: ② human modify      — <name>-rules.md
[ ] Phase 1: ③ agent review      — <name>-rules.md
[ ] Phase 1: ④ human approve     — <name>-rules.md → status: ready
[ ] Phase 2: ⑤ agent draft       — <name>-instruction.md, <name>-input-template.md
[ ] Phase 2: ⑥ agent review      — <name>-instruction.md, <name>-input-template.md
[ ] Phase 2: ⑦ human approve     — all derivatives → status: ready
```

## 中断と再開

- 人間が途中で作業を中断する場合、現在のステップ番号と対象ファイルを記録する
- 再開時はそのステップから続行する
- Phase 1 完了後に Phase 2 を保留にすることも可能（`status: ready` は Phase 1 の完了を示す）

## 対象外

- `meta-*-rules.md` — メタルールは個別管理
- `*-sample.md` — 必要に応じて別途 `rules-to-sample` Skill で作成
- WBS/スケジュールファイルの更新 — 本 Skill のスコープ外
