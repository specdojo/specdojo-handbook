---
id: prj-0001:pm-organization
type: project
status: draft
rulebook: pm-organization-rulebook
based_on:
  - people-and-organization-definition-standard
---

# 組織定義

本書は、SpecDojo Handbook プロジェクトで使用するロールを定義する。

本プロジェクトは個人・小規模運用を前提とし、最終判断はすべて `PO` が担う。ロールは責務を分けるための概念であり、兼務している場合でも責務境界は維持する。

## 1. 基本方針

- ロールは、個人名・agent 名ではなく、プロジェクト上の責務・判断権限・専門性を表す論理的な役割として定義する。
- WBS / Schedule の `owner` には、本書で採用した Role code のみを使用する。member nickname・個人名・agent 名は書かない。
- 1 人の人間または agent が複数ロールを兼務してよい。ただし兼務を理由に責務境界を曖昧にしない。
- 最終判断はすべて `PO` が担う。各ロールは作業の性質に応じて判断材料を整理・提示する。
- 判断不能・責務競合が生じた場合も `PO` に集約する。

## 2. 標準ロールと本プロジェクトでの扱い

SpecDojo の標準ロールに対する本プロジェクトの採用方針を示す。

| Role code | 正式名称                     | 本プロジェクトでの採用 | 兼務・省略の方針                         |
| --------- | ---------------------------- | ---------------------- | ---------------------------------------- |
| `PO`      | Project Owner                | 採用                   | `PM`・`OPS` 責務を兼務する               |
| `PM`      | Project Manager              | 未採用                 | `PO` が兼務する                          |
| `BA`      | Business Analyst             | 採用                   | 必要に応じて agent が支援する            |
| `ARC`     | Architect                    | 採用                   | 必要に応じて agent が支援する            |
| `DEV`     | Developer                    | 未採用                 | 実装タスクが増えた場合に追加する         |
| `QE`      | Quality Engineer             | 採用                   | 必要に応じて agent が支援する            |
| `UX`      | UX / Documentation Designer  | 未採用                 | 必要に応じて `BA` または `PO` が兼務する |
| `OPS`     | Operations / Release Manager | 未採用                 | 必要に応じて `PO` が兼務する             |

## 3. 採用ロール

### 3.1. `PO` Project Owner

`PO` はプロジェクトの目的・スコープ・優先順位・公開方針と最終判断を担う。小規模運用では `PM` 責務も兼務する。

主な責務:

- プロジェクト目的とスコープを決める。
- 成果物の優先順位と公開方針を決める。
- 計画・進捗・課題・リスクを管理する。
- 主要成果物の最終承認を行う。
- agent に委任できる作業と人間が判断すべき事項を区別する。

### 3.2. `BA` Business Analyst

`BA` は要件・利用者視点・受入条件・文書の実用性を整理する。

主な責務:

- Handbook の利用者像と利用手順を整理する。
- 要件・受入条件・用語・前提条件を整理する。
- テンプレートやサンプルが実務で使いやすいかを確認する。

### 3.3. `ARC` Architect

`ARC` は文書体系・構成方針・技術方針・リポジトリ構成を整理する。

主な責務:

- Handbook 全体の文書構造と参照関係を設計する。
- ファイル命名・ID・ディレクトリ構成の方針を決める。
- 技術制約・実行方式・CLI 連携の観点を整理する。

### 3.4. `QE` Quality Engineer

`QE` は品質基準・レビュー方針・検証観点・整合性確認を担う。

主な責務:

- 文書の品質基準とレビュー観点を定義する。
- ID・用語・参照関係・ファイル構成の不整合を確認する。
- 公開前確認の観点を整理する。

## 4. 兼務方針

1 人の人間または agent が複数ロールの作業を支援してよい。`owner` には作業の性質に最も近い Role code を使う。

| 標準ロール | 本プロジェクトでの扱い | 備考                                          |
| ---------- | ---------------------- | --------------------------------------------- |
| `PO`       | 採用                   | `PM`・`OPS` 責務を兼務する                    |
| `PM`       | 省略                   | `PO` が担う                                   |
| `BA`       | 採用                   | 必要に応じて `PO` または BA agent が支援する  |
| `ARC`      | 採用                   | 必要に応じて `PO` または ARC agent が支援する |
| `DEV`      | 省略                   | 実装作業が増えた場合に追加する                |
| `QE`       | 採用                   | 必要に応じて `PO` または QE agent が支援する  |
| `UX`       | 省略                   | 利用者導線や文書体験は `BA` が兼ねる          |
| `OPS`      | 省略                   | 公開・配布・リリース判断は `PO` が兼ねる      |

## 5. `owner` の意味

`owner` は WBS / Schedule 上のタスクの主責任ロールを表す。本書で採用した Role code のみを使用する。

使用できる `owner`: `PO`, `BA`, `ARC`, `QE`

現時点では次の Role code は `owner` として使用しない: `PM`, `DEV`, `UX`, `OPS`

```yaml
tasks:
  - id: T-SCOPE-010
    name: スコープを整理する
    owner: BA

  - id: T-STRUCTURE-010
    name: 文書構成を整理する
    owner: ARC

  - id: T-REVIEW-010
    name: 整合性を確認する
    owner: QE

  - id: T-APPROVE-010
    name: 公開判断を行う
    owner: PO
```

## 6. member との関係

member は実際に作業する人間または agent であり、`pm-members.yaml` で定義する。対応できるロールは `role` に Role code を記載する。汎用 agent は `role: null` としてよい。

```yaml
members:
  - nickname: po
    display_name: Project Owner
    role: PO
    type: human

  - nickname: ba-agent
    display_name: Business Analyst Agent
    role: BA
    type: agent

  - nickname: copilot
    display_name: General Copilot Agent
    role: null
    type: agent
```

## 7. `owner` / `role` / `--by` の違い

| 項目    | 意味                          | 値の例                  | 管理先            |
| ------- | ----------------------------- | ----------------------- | ----------------- |
| `owner` | タスクの主責任ロール          | `PO`, `BA`, `ARC`, `QE` | WBS / Schedule    |
| `role`  | member が対応できるロール     | `BA`                    | `pm-members.yaml` |
| `--by`  | 実際にタスクを実行する member | `ba-agent`              | 実行コマンド      |

原則:

- `owner` はタスク側だけで使用する。
- `role` は member 側で使用する。
- `--by` で指定する nickname は `pm-members.yaml` に存在しなければならない。

## 8. 意思決定責任

本プロジェクトでは `PO` がすべての最終判断を担う。`BA`・`ARC`・`QE` は作業の性質に応じて判断材料を整理・提示する。

## 9. Agent 委任方針

agent は実行支援者であり、人間の判断や説明責任を代替しない。

| 作業種別                     | agent 委任 | 最終判断                              |
| ---------------------------- | ---------- | ------------------------------------- |
| 草案作成                     | 可         | 対応ロールの人間または `PO`           |
| 表記揺れ確認                 | 可         | 対応ロールの人間または `PO`           |
| 抜け漏れ検出                 | 可         | 対応ロールの人間または `PO`           |
| 既存ルールに基づく機械的更新 | 可         | 対応ロールの人間または `PO`           |
| スコープ変更                 | 不可       | `PO`                                  |
| 公開可否判断                 | 不可       | `PO`                                  |
| 技術方針・品質基準の最終判断 | 原則不可   | `PO`（`ARC` / `QE` が判断材料を提示） |

## 10. 見直し条件

| 更新トリガー                                           | 見直し内容                   |
| ------------------------------------------------------ | ---------------------------- |
| プロジェクトスコープを変更した                         | 採用ロール・責務境界         |
| WBS / Schedule の `owner` に未定義ロールが必要になった | ロール追加の要否             |
| 複数人での継続運用を開始した                           | `PM` の独立採用・RACI の追加 |

## 11. 禁止事項

- Schedule / WBS の `owner` に個人名・member nickname・agent 名・stakeholder ID を書くこと。
- `pm-members.yaml` の member 側で `owner` フィールドを使うこと。
- 未採用ロールを Schedule / WBS の `owner` に使うこと。
- agent に最終承認責任を持たせること。
- 兼務を理由に責務境界を曖昧にすること。
- 公開文書に不要な個人情報や非公開組織情報を書くこと。
