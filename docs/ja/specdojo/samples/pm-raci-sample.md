---
id: prj-0001:pm-raci
type: project
status: draft
rulebook: pm-raci-rulebook
based_on:
  - people-and-organization-definition-standard
  - prj-0001:pm-organization
---

# RACI: 駄菓子屋きぬや 販売管理システム

## 1. 目的

本書は、駄菓子屋きぬや 販売管理システム構築プロジェクトにおける主要成果物・主要プロセスの責任分担を定義する。

採用ロールの定義は `pm-organization` を正とし、RACI の列には採用済み Role code（`PO`・`BA`・`ARC`・`QE`）のみを使用する。

## 2. 適用方針

- RACI 列に使う Role code: `PO`・`BA`・`ARC`・`QE`（`pm-organization` 採用ロールのみ）
- `A` は原則として `PO` に集約する。技術判断は `ARC`、品質基準は `QE` が `A` を持つ場合がある。
- Agent は `R`・`C` を担ってよいが、`A` は担わない。
- member nickname・人名・agent 名を RACI 列に使わない。

## 3. RACI の定義

RACI 記号の定義は `people-and-organization-definition-standard` を参照する。

| 記号 | 説明                     |
| ---- | ------------------------ |
| R    | 実作業を担当する         |
| A    | 最終責任を持ち、承認する |
| C    | 相談・レビューに参加する |
| I    | 結果の共有を受ける       |

## 4. 成果物別 RACI

| 成果物                                         | PO  | BA  | ARC | QE  |
| ---------------------------------------------- | --- | --- | --- | --- |
| `prj-overview`                                 | A/R | C   | I   | I   |
| `prj-stakeholder-register`                     | A   | R   | C   | I   |
| `prj-charter`                                  | A/R | C   | C   | I   |
| `pm-organization`                              | A   | R   | C   | I   |
| `pm-roles.yaml`                                | I   | R   | A/C | C   |
| `pm-members.yaml`                              | I   | R   | A/C | C   |
| `pm-raci`                                      | A   | C   | R   | C   |
| `pm-plan`                                      | A   | C   | R   | C   |
| `prj-scope`                                    | A   | R   | C   | C   |
| `prj-deliverables-catalog`                     | A   | R   | C   | C   |
| `prj-success-criteria-and-acceptance-criteria` | A   | R   | C   | C   |

## 5. プロセス別 RACI

本プロジェクトは小規模運用のため、プロセス別 RACI は主要プロセスのみを対象とする。

| プロセス             | PO  | BA  | ARC | QE  |
| -------------------- | --- | --- | --- | --- |
| 要件ヒアリング・確認 | C   | A/R | C   | I   |
| スコープ変更判断     | A   | C   | R   | C   |
| 成果物レビュー       | A   | C   | C   | R   |
| GO / Not GO 判断     | A   | C   | C   | C   |
| リリース承認         | A   | I   | C   | C   |

## 6. 見直し条件

| 更新トリガー                                                 | 見直し内容                                           |
| ------------------------------------------------------------ | ---------------------------------------------------- |
| `pm-organization` の採用ロールが変更された                   | RACI の列構成を更新し、全行の `A` を再確認する       |
| 成果物カタログ（`prj-deliverables-catalog`）が大幅変更された | 成果物別 RACI に行を追加・削除する                   |
| プロジェクト体制が変わり、兼務ロールが独立化した             | 対象ロールの行・列を更新し、`A` の集約先を再確認する |

## 7. 禁止事項

- `pm-organization` で未採用の Role code（`PM`・`DEV`・`UX`・`OPS`）を RACI 列に使わない。
- member nickname（`po`・`ba-agent` 等）・人名・agent 名を RACI 列に使わない。
- Agent に `A` を割り当てない。
- 各行の `A` を省略しない。
