---
id: prj-0001:pm-wbs-decomposition-strategy
type: project
status: draft
rulebook: pm-wbs-decomposition-strategy-rulebook
---

# WBS分解戦略

WBS Decomposition Strategy

本ドキュメントは、成果物カタログに定義した成果物を WBS 定義へ落とし込む際の分解粒度、ファイル分割方針、`id` 命名規則、記述ルールを定義します。

## 1. 前提

- 入力は `docs/ja/projects/prj-0001/010-deliverables-catalog/` 以下の成果物カタログです。
- 出力は `docs/ja/projects/prj-0001/030-project-management/030-wbs/` 以下の `wbs-<domain>.yaml` です。
- WBS 定義ファイルは `docs/shared/schemas/wbs.schema.yaml` に従います。
- WBS は **WHAT（何を作るか）** と **完了条件** を定義します。
- 実行順序、依存関係、日程、フェーズ、実行回は、スケジュールまたは実行管理で扱います。

## 2. 基本方針

| 観点             | 方針                                                       |
| ---------------- | ---------------------------------------------------------- |
| 分解基準         | `1 WBS Item = 1 成果物` を基本とする                       |
| 対象範囲         | 成果物カタログで `種別` が `work` のもの                   |
| トレーサビリティ | WBS Item は成果物カタログの 1 成果物に対応づける           |
| 安定性           | `id` は意味なく変更しない                                  |
| 判定可能性       | `done_criteria` はレビューで完了可否を判定できる文章にする |
| 役割分担         | WBS は成果物スコープと完了定義に限定する                   |

## 3. WBS ファイル分割ルール

WBS 定義ファイルは、成果物カタログの `ドメイン` 単位で分割します。

```text
1 成果物ドメイン = 1 WBS 定義ファイル
```

ファイル名は次の形式とします。

```text
wbs-<domain>.yaml
```

`domain` は成果物ドメインに対応する安定した識別子です。
ドメインと WBS ファイルの対応は、`Appendix A. ドメインと WBS ファイルの対応定義` に定義します。

例外的に、ドメインが大きすぎる場合、完了判定単位とドメインが一致しない場合、または複数ドメイン横断の共通成果物群を独立管理したい場合は、別ファイル化を認めます。例外は `Appendix A` に明示します。

## 4. WBS 粒度ルール

### 4.1. 原則

WBS Item の基本単位は、成果物カタログに定義された **1 成果物** とします。

```text
原則: 1 成果物 = 1 WBS Item
```

成果物カタログ上で別 `name` として定義されているものは、原則として別 WBS Item にします。

### 4.2. 分割する条件

次のいずれかに該当する場合は、WBS Item を分割します。

1. 成果物カタログ上で別 `name` として定義されている
2. 完了条件、担当ロール、専門性、利用者、承認者のいずれかが異なる
3. ライフサイクルまたは更新頻度が異なる
4. 1 つの `done_criteria` で完了判定を書くと不自然になる

### 4.3. まとめてよい例外

複数成果物を 1 つの WBS Item にまとめるのは例外です。

まとめてよいのは、次の条件をすべて満たす場合に限ります。

1. 常に同時に作成・更新される
2. 同一レビューで一体として承認される
3. 個別に完了判定する意味がない
4. 利用者が一体の成果物セットとして認識する

まとめる場合は、`deliverables` に対象ファイルをすべて列挙し、`description` または `done_criteria` に一体として扱う理由を記述します。

## 5. フェーズ横断成果物の扱い

同じ成果物が複数フェーズで扱われる場合でも、WBS Item は重複させません。

WBS では成果物の完了単位だけを定義し、フェーズ、実行回、日程、順序、タスクはスケジュールまたは実行管理で扱います。

## 6. WBS 定義ファイルの構造

WBS 定義ファイルは、次のトップレベル項目を持ちます。

| 項目            | 必須 | 記述ルール                                           |
| --------------- | ---- | ---------------------------------------------------- |
| `id`            | 必須 | WBS 定義ファイルの文書 ID                            |
| `type`          | 必須 | `wbs` 固定                                           |
| `status`        | 必須 | `draft`, `ready`, `deprecated` のいずれか            |
| `project_id`    | 必須 | プロジェクト ID。例: `prj-0001`                      |
| `domain`        | 必須 | WBS の対象領域。ファイル名の `<domain>` と一致させる |
| `wbs`           | 必須 | WBS Item の配列                                      |
| `part_of`       | 任意 | 上位文書 ID                                          |
| `based_on`      | 任意 | 根拠文書 ID                                          |
| `supersedes`    | 任意 | 置き換え元文書 ID                                    |
| `assigned_team` | 任意 | 現在の担当チーム名。安定キーとしては使わない         |

## 7. `id` 命名規則

### 7.1. WBS 定義ファイルの `id`

WBS 定義ファイルの `id` は、次の形式を基本とします。

```text
<project-id>:wbs-<domain>
```

例:

```text
prj-0001:wbs-project-definition
prj-0001:wbs-project-management
```

### 7.2. WBS Item の `id`

WBS Item の `id` は、次の形式を基本とします。

```text
WBS-<DOMAIN>-<ARTIFACT>-<NNN>
```

例:

```text
WBS-PJD-OVERVIEW-010
WBS-PJD-SCOPE-020
WBS-PJD-ISSUES-030
WBS-PJM-PLAN-010
WBS-PJM-COMM-020
WBS-PJM-QMPLAN-030
```

| 要素       | ルール                                                 |
| ---------- | ------------------------------------------------------ |
| `DOMAIN`   | `Appendix A` で定義したドメイン略号を使用する          |
| `ARTIFACT` | 成果物カタログの `name` に対応する短い識別子を使用する |
| `NNN`      | 3 桁、`010` 刻みで採番する                             |

WBS Item の `id` は、並び順変更だけを理由に変更しません。既存 `id` は、スケジュール、実行管理、進捗報告、トレーサビリティから参照されるため、原則として不変とします。

### 7.3. ARTIFACT の決め方

`ARTIFACT` は、成果物カタログの `name` から意味が推測できる略号にします。

| 成果物 `name`                                  | ARTIFACT 例 |
| ---------------------------------------------- | ----------- |
| `prj-overview`                                 | `OVERVIEW`  |
| `prj-scope`                                    | `SCOPE`     |
| `prj-issues-and-approach`                      | `ISSUES`    |
| `prj-success-criteria-and-acceptance-criteria` | `SUCCESS`   |
| `prj-assumptions-constraints-dependencies`     | `ACD`       |
| `prj-comparison-of-alternatives`               | `ALT`       |
| `pm-plan`                                      | `PLAN`      |
| `pm-communication-plan`                        | `COMM`      |
| `pm-quality-management-plan`                   | `QMPLAN`    |
| `pm-organization-and-raci`                     | `RACI`      |
| `pm-wbs-decomposition-strategy`                | `WBSSTR`    |
| `pm-wbs-to-schedule-strategy`                  | `SCHSTR`    |

`ARTIFACT` は同一 `DOMAIN` 内で重複させません。複数成果物を例外的に 1 WBS Item にまとめる場合は、代表的な成果物セット名またはファミリー名を使用します。

## 8. WBS Item 記述ルール

WBS Item は、スキーマ上の `wbs` 配列に記述します。

| 項目              | 必須 | 記述ルール                                     |
| ----------------- | ---- | ---------------------------------------------- |
| `id`              | 必須 | `WBS-<DOMAIN>-<ARTIFACT>-<NNN>` 形式で記述する |
| `name`            | 必須 | 一覧で識別できる短い日本語ラベルにする         |
| `owner`           | 必須 | `PO`, `BA`, `ARC`, `QE` のいずれか             |
| `deliverables`    | 必須 | 作成・更新・参照する成果物を列挙する           |
| `done_criteria`   | 必須 | レビュー可能な完了条件を書く                   |
| `description`     | 任意 | 対象成果物と整備内容を簡潔に書く               |
| `component`       | 任意 | 領域内の安定したサブ領域を英小文字で書く       |
| `acceptance_refs` | 任意 | 受入条件、仕様、判断記録などの参照 ID          |
| `tags`            | 任意 | フィルタ・分類用タグ                           |
| `notes`           | 任意 | 補足メモ。SSOT の重複記述は避ける              |

### 8.1. `owner`

`owner` は次のいずれかを指定します。

| 値    | 意味             |
| ----- | ---------------- |
| `PO`  | Project Owner    |
| `BA`  | Business Analyst |
| `ARC` | Architect        |
| `QE`  | Quality Engineer |

### 8.2. `deliverables`

`deliverables` は文字列配列ではなく、次のオブジェクト配列として記述します。

| 項目   | 必須 | 記述ルール                                 |
| ------ | ---- | ------------------------------------------ |
| `path` | 必須 | リポジトリ内の成果物パス                   |
| `kind` | 必須 | `create`, `modify`, `reference` のいずれか |
| `note` | 任意 | 成果物に関する補足                         |

`kind` の意味は次の通りです。

| 値          | 意味                           |
| ----------- | ------------------------------ |
| `create`    | 新規作成する成果物             |
| `modify`    | 変更する既存成果物             |
| `reference` | 参照するが直接変更しない成果物 |

## 9. 記述例

```yaml
id: prj-0001:wbs-project-definition
type: wbs
status: draft
project_id: prj-0001
domain: project-definition
based_on:
  - prj-0001:dct-project-definition

wbs:
  - id: WBS-PJD-OVERVIEW-010
    name: プロジェクト概要整備
    description: プロジェクトの背景、目的、ゴール、期待効果を示すプロジェクト概要を整備する。
    owner: PO
    component: project-definition
    deliverables:
      - path: docs/ja/projects/prj-0001/020-project-definition/prj-overview.md
        kind: create
    done_criteria: プロジェクト概要が、背景、目的、ゴール、期待効果を矛盾なく定義しており、プロジェクト憲章およびスコープ定義の根拠として利用できること。
    acceptance_refs:
      - BAC-PJD-OVERVIEW-010
    tags:
      - project-definition

  - id: WBS-PJD-SCOPE-020
    name: プロジェクトスコープ整備
    description: プロジェクトの対象範囲、対象外、境界条件を示すプロジェクトスコープを整備する。
    owner: PO
    component: project-definition
    deliverables:
      - path: docs/ja/projects/prj-0001/020-project-definition/prj-scope.md
        kind: create
    done_criteria: プロジェクトスコープが、対象範囲、対象外、境界条件を明確に定義しており、後続の WBS 作成と変更判断の基準として利用できること。
    acceptance_refs:
      - BAC-PJD-SCOPE-020
    tags:
      - project-definition
```

## 10. 成果物カタログから WBS への落とし込み手順

1. `dct-index.md` および `dct-<domain>.md` を確認する
2. `種別` が `work` の成果物を抽出する
3. 成果物の `ドメイン` から対応する WBS ファイルを確認する
4. 既存 WBS Item に同じ成果物が存在しないか確認する
5. 原則として、対象成果物ごとに 1 つの WBS Item を作成する
6. 複数成果物をまとめる場合は、例外条件を満たすか確認する
7. `id`, `name`, `owner`, `deliverables`, `done_criteria` を記述する
8. 必要に応じて、`description`, `component`, `acceptance_refs`, `tags`, `notes` を記述する
9. フェーズ、順序、日程は、スケジュールまたは実行管理側で定義する

## 11. 具体例

| 成果物                       | WBS Item               |
| ---------------------------- | ---------------------- |
| `prj-overview`               | `WBS-PJD-OVERVIEW-010` |
| `prj-scope`                  | `WBS-PJD-SCOPE-020`    |
| `prj-issues-and-approach`    | `WBS-PJD-ISSUES-030`   |
| `pm-plan`                    | `WBS-PJM-PLAN-010`     |
| `pm-communication-plan`      | `WBS-PJM-COMM-020`     |
| `pm-quality-management-plan` | `WBS-PJM-QMPLAN-030`   |

## 12. アンチパターン

- 別 `name` の成果物を、理由なく 1 WBS Item にまとめる
- 個別にレビュー・承認できる成果物をまとめる
- 更新タイミングが異なる成果物をまとめる
- `done_criteria` を「更新する」「整備する」だけで終わらせる
- 並び順変更だけを理由に既存 `id` を変更する
- 日付、順序、担当タスクを WBS の `description` に書く
- フェーズが異なるという理由だけで、同じ成果物を別 WBS Item として重複定義する
- 自動生成ビューや管理ビューを、手作業で完了判定する WBS Item として扱う
- `assigned_team` を安定した分類キーとして使う

## 13. 運用ルール

- 成果物ドメインを追加する場合は、既存 WBS ファイルに含めるか、新しい WBS ファイルを作成するかを判断し、必要に応じて `Appendix A` に追記します。
- WBS Item を追加する場合は、同じ成果物の WBS Item が既に存在しないことを確認します。
- WBS Item を変更する場合は、成果物カタログ、スケジュール、実行管理、進捗報告、トレーサビリティへの影響を確認します。
- `id` の変更は原則として避けます。
- 分解判断に迷う場合は、**1 成果物として個別に完了判定できるか** を基準にします。

## Appendix A. ドメインと WBS ファイルの対応定義

本付録は、成果物カタログのドメインと WBS 定義ファイルの対応を定義します。
成果物ドメインの追加に応じて更新します。

| 成果物カタログ上のドメイン | ドメイン略号 | WBS ファイル                  |
| -------------------------- | ------------ | ----------------------------- |
| `project-definition`       | `PJD`        | `wbs-project-definition.yaml` |
| `project-management`       | `PJM`        | `wbs-project-management.yaml` |

ドメイン略号は次のルールで定義します。

- ドメイン略号は 3 文字程度の英大文字を基本とします。
- 既存の略号と重複しないものを使用します。
- 意味が推測しやすい略号を優先します。
- 一度使用した略号は、原則として変更しません。
