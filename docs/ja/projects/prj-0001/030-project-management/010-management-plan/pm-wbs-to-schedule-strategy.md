---
id: prj-0001:pm-wbs-to-schedule-strategy
type: project
status: draft
rulebook: pm-wbs-to-schedule-strategy-rulebook
---

# WBS から Schedule への展開戦略

WBS to Schedule Strategy

本ドキュメントは、`030-wbs/` 配下の WBS 定義を `040-schedule/` 配下の Schedule 定義へ落とし込む際のタスク分解方針、依存関係、タスク長、`id` 命名規則を定義します。

## 1. 目的と適用範囲

- 対象は `docs/ja/projects/prj-0001/030-project-management/030-wbs/` 配下の `wbs-*.yaml` と、`docs/ja/projects/prj-0001/030-project-management/040-schedule/` 配下の Schedule 定義ファイルです。
- Schedule 定義ファイルは `docs/shared/schemas/sch.schema.yaml` に従います。
- WBS が定義する **WHAT（何を作るか）** を、Schedule では **WHEN（いつ）** と **ORDER（どの順序で行うか）** に展開します。
- WBS の分解・命名方針は `pm-wbs-decomposition-strategy.md` を参照します。
- WBS の対象外である `control` および `generated` の成果物は、原則として Schedule 展開対象外とします。

## 2. 基本方針

| 観点       | 方針                                                                 |
| ---------- | -------------------------------------------------------------------- |
| 展開単位   | `1 WBS Item = 1〜3 Task` を基本とする                                |
| 対象範囲   | WBS 定義ファイルに存在する WBS Item のみを対象とする                 |
| 実行性     | 各 Task は 1 回の作業または 1 回のレビューで完了確認できる単位にする |
| 依存最小化 | 真に着手不能となる前提のみ `depends_on` に記述する                   |
| 並列性     | 同時に進められる Task は直列化せず、並列実行可能にする               |
| 判定可能性 | Task 完了は成果物レビューまたは検証結果で確認できる状態にする        |
| 責務分離   | WBS は成果物単位、Schedule は実行順序・期間・依存関係を扱う          |

## 3. Schedule 定義ファイルの種類

Schedule 定義ファイルは、`schedule_level` により粒度を区別します。

| schedule_level | 役割                                           | 主な内容                                       |
| -------------- | ---------------------------------------------- | ---------------------------------------------- |
| `milestones`   | プロジェクト全体のゲート定義                   | 開始、レビュー、承認、完了などのマイルストーン |
| `domain`       | ドメイン単位の概要スケジュール                 | ドメイン内の主要 Task                          |
| `container`    | コンテナ・コンポーネント単位の詳細スケジュール | サービス、機能、モジュール単位の詳細 Task      |

原則として、初期段階では `milestones` と `domain` を作成し、必要に応じて `container` に詳細化します。

## 4. Schedule ファイル分割ルール

### 4.1. Milestones

プロジェクト全体のマイルストーンは、次のファイルに定義します。

```text
sch-milestones.yaml
```

`schedule_level` は `milestones` とし、`domain` と `container` は記述しません。

### 4.2. Domain Schedule

ドメイン単位の Schedule は、次の形式で作成します。

```text
sch-<domain>.yaml
```

例:

```text
sch-project-definition.yaml
sch-project-management.yaml
sch-business-specifications.yaml
```

`schedule_level` は `domain` とし、`domain` を必ず記述します。`container` は記述しません。

### 4.3. Container Schedule

ドメイン内をさらに分割する必要がある場合は、次の形式で作成します。

```text
sch-<domain>-<container>.yaml
```

例:

```text
sch-business-specifications-order.yaml
sch-system-design-auth-api.yaml
```

`schedule_level` は `container` とし、`domain` と `container` を必ず記述します。

## 5. WBS から Task への分解ルール

### 5.1. 原則

Schedule 化の対象は、WBS 定義ファイルに存在する WBS Item のみとします。

```text
1 WBS Item = 1〜3 Task
```

1 つの WBS Item をそのまま 1 Task にしてよいのは、1 回の作業またはレビューで完了確認できる場合です。

### 5.2. 分割する条件

次のいずれかに該当する場合は、Task を分割します。

1. 1 回の作業で完了確認まで到達しない
2. 中間成果物にレビューゲートが必要
3. 担当ロールや専門性が途中で切り替わる
4. 依存関係を切り出した方が並列化または再計画しやすい
5. 作成とレビューを分けた方が完了状態を判断しやすい

### 5.3. 推奨パターン

| パターン | 使いどころ                 | Task 例                      |
| -------- | -------------------------- | ---------------------------- |
| 1 Task   | 軽量な単独成果物           | 作成・レビューを1 Taskで扱う |
| 2 Task   | 通常の文書成果物           | 作成 → レビュー              |
| 3 Task   | 段階的な整備が必要な成果物 | 作成 → 検証 → レビュー       |

Task を細かくしすぎると依存関係が増えるため、原則として 1 WBS Item あたり 3 Task 以内に収めます。

## 6. Task `id` 命名規則

### 6.1. 基本形式

Task の `id` は次の形式を基本とします。

```text
T-<DOMAIN>-<ARTIFACT>-<NNN>
```

例:

```text
T-PJD-OVERVIEW-010
T-PJD-SCOPE-020
T-PJM-PLAN-010
T-PJM-COMM-020
```

### 6.2. WBS Item との対応

対応する WBS Item と同じ `<DOMAIN>` と `<ARTIFACT>` を使用します。

```text
WBS-PJD-OVERVIEW-010
  → T-PJD-OVERVIEW-010
```

1 つの WBS Item を複数 Task に分割する場合は、同じ `<DOMAIN>` と `<ARTIFACT>` を維持し、連番または接尾辞で区別します。

```text
WBS-PJD-OVERVIEW-010
  → T-PJD-OVERVIEW-010
  → T-PJD-OVERVIEW-020
```

または、作業種別を明確にしたい場合は接尾辞を使います。

```text
T-PJD-OVERVIEW-DRAFT-010
T-PJD-OVERVIEW-REVIEW-020
```

ただし、ID が長くなりすぎる場合は、接尾辞より連番を優先します。

### 6.3. 各要素

| 要素       | ルール                              |
| ---------- | ----------------------------------- |
| `DOMAIN`   | WBS Item の `DOMAIN` と一致させる   |
| `ARTIFACT` | WBS Item の `ARTIFACT` と一致させる |
| `NNN`      | 3 桁、`010` 刻みで採番する          |

Task の `id` は、並び順変更だけを理由に変更しません。既存 `id` は依存関係や実行ログから参照されるため、原則として不変とします。

## 7. 依存関係の考え方

### 7.1. 原則

- `depends_on` には、真に着手不能となる先行 Task または Milestone のみを記述します。
- 「参考にしたい」「先に見たい」程度の関係は依存にしません。
- 依存は原則として Finish-to-Start として扱います。
- 空の依存関係は `depends_on: []` と明示します。

### 7.2. 依存を置くべきケース

| 依存の種類     | 説明                                 | 例                             |
| -------------- | ------------------------------------ | ------------------------------ |
| 開始ゲート依存 | プロジェクトまたはフェーズ開始が前提 | `M-PRJ-START-010` → 初期 Task  |
| 成果物依存     | 入力成果物の完了が必要               | `prj-overview` → `prj-charter` |
| レビュー依存   | レビュー完了後でないと次に進めない   | 作成 Task → レビュー Task      |
| 承認依存       | 承認ゲート通過が前提                 | レビュー Milestone → 後続 Task |
| 技術依存       | 設計・仕様上、順序が必要             | 業務仕様 → システム設計        |

### 7.3. 依存を最小化する判断基準

- 先行 Task が未完了でも下流 Task を 80% 程度進められるなら、依存を置かない
- 依存を追加しても品質向上や手戻り防止に寄与しない場合は、依存を置かない
- 同一レビューで確認できるものは、細かい直列依存より同一タイミングのレビューを優先する

## 8. タスク長の考え方

`duration_days` は作業日の長さで見積もります。

| duration_days | 目安     | 用途                               |
| ------------- | -------- | ---------------------------------- |
| `0.125`       | 約1時間  | 軽微な修正、確認                   |
| `0.25`        | 半日未満 | 小さな文書更新、単独レビュー       |
| `0.5`         | 半日程度 | 通常の文書作成・レビュー           |
| `1.0`         | 1日程度  | 複雑な成果物整備、複数観点レビュー |

次に該当する場合は分割を検討します。

1. `duration_days` が `1.0` を超える
2. 途中でレビュー待ちや意思決定待ちが発生する
3. 担当ロールが切り替わる
4. 変更対象が多く、1 Task の完了判定が曖昧になる

`duration_days: 0` は使用せず、0 日のゲートは Milestone として定義します。

## 9. Schedule 定義ファイルの構造

### 9.1. 共通項目

Schedule 定義ファイルは、次のトップレベル項目を持ちます。

| 項目             | 必須     | 記述ルール                                     |
| ---------------- | -------- | ---------------------------------------------- |
| `kind`           | 必須     | `schedule` 固定                                |
| `version`        | 必須     | スキーマまたはデータ構造のバージョン           |
| `project_id`     | 必須     | プロジェクト ID。例: `prj-0001`                |
| `settings`       | 必須     | 開始日、完了マイルストーンなどの設定           |
| `schedule_level` | 必須     | `milestones`, `domain`, `container` のいずれか |
| `domain`         | 条件付き | `domain` / `container` レベルでは必須          |
| `container`      | 条件付き | `container` レベルでは必須                     |
| `tasks`          | 条件付き | `domain` / `container` レベルでは必須          |
| `milestones`     | 条件付き | `milestones` レベルでは必須                    |
| `calendar`       | 任意     | カレンダー設定の上書き                         |
| `assigned_team`  | 任意     | 現在の担当チーム名。安定キーとしては使わない   |
| `notes`          | 任意     | ファイル全体の補足                             |

### 9.2. Task 項目

| 項目            | 必須 | 記述ルール                                            |
| --------------- | ---- | ----------------------------------------------------- |
| `id`            | 必須 | `T-<DOMAIN>-<ARTIFACT>-<NNN>` 形式を基本とする        |
| `wbs`           | 必須 | 対応する WBS Item ID を記述する                       |
| `name`          | 必須 | 作業内容が一読で分かる短いラベルにする                |
| `duration_days` | 必須 | 0 より大きい作業日数を記述する                        |
| `depends_on`    | 必須 | 先行 Task / Milestone の ID 配列。依存がなければ `[]` |
| `owner`         | 必須 | `PO`, `BA`, `ARC`, `QE` のいずれか                    |
| `tags`          | 任意 | フィルタ・集計用タグ                                  |
| `notes`         | 任意 | 補足メモ。長文化させない                              |

### 9.3. Milestone 項目

| 項目         | 必須 | 記述ルール                                                                 |
| ------------ | ---- | -------------------------------------------------------------------------- |
| `id`         | 必須 | `M-<DOMAIN>-<ARTIFACT>-<NNN>` または `M-PRJ-<GATE>-<NNN>` 形式を基本とする |
| `name`       | 必須 | ゲートや節目が分かる短いラベルにする                                       |
| `depends_on` | 必須 | 先行 Task / Milestone の ID 配列。依存がなければ `[]`                      |
| `owner`      | 任意 | 主責任ロール                                                               |
| `date_hint`  | 任意 | 目安日。固定日が必要な場合のみ記述する                                     |
| `tags`       | 任意 | フィルタ・集計用タグ                                                       |
| `notes`      | 任意 | 補足メモ                                                                   |

## 10. 記述例

### 10.1. Milestones Schedule

```yaml
kind: schedule
version: 1
project_id: prj-0001
schedule_level: milestones
settings:
  start_date: 2026-03-01

milestones:
  - id: M-PRJ-START-010
    name: プロジェクト開始
    depends_on: []
    owner: PO
    date_hint: 2026-03-01
    tags:
      - project

  - id: M-PRJ-DEFINITION-READY-020
    name: プロジェクト定義レビュー可能
    depends_on:
      - T-PJD-OVERVIEW-010
      - T-PJD-SCOPE-020
    owner: PO
    tags:
      - project-definition
```

### 10.2. Domain Schedule

```yaml
kind: schedule
version: 1
project_id: prj-0001
schedule_level: domain
domain: project-definition
settings:
  start_date: 2026-03-01
  finish_milestone_id: M-PRJ-DEFINITION-READY-020

tasks:
  - id: T-PJD-OVERVIEW-010
    wbs: WBS-PJD-OVERVIEW-010
    name: プロジェクト概要を作成する
    duration_days: 0.5
    depends_on:
      - M-PRJ-START-010
    owner: PO
    tags:
      - project-definition

  - id: T-PJD-SCOPE-020
    wbs: WBS-PJD-SCOPE-020
    name: プロジェクトスコープを作成する
    duration_days: 0.5
    depends_on:
      - T-PJD-OVERVIEW-010
    owner: PO
    tags:
      - project-definition
```

### 10.3. Container Schedule

```yaml
kind: schedule
version: 1
project_id: prj-0001
schedule_level: container
domain: business-specifications
container: order
settings:
  start_date: 2026-03-10

tasks:
  - id: T-BSP-ORDER-010
    wbs: WBS-BSP-ORDER-010
    name: 注文業務仕様を作成する
    duration_days: 0.5
    depends_on:
      - M-PRJ-START-010
    owner: BA
    tags:
      - business-specifications
      - order
```

## 11. 成果物カタログ・WBS から Schedule への落とし込み手順

1. 対象の `wbs-<domain>.yaml` を確認する
2. 対象 WBS Item の `id`, `name`, `owner`, `deliverables`, `done_criteria` を確認する
3. `1 WBS Item = 1〜3 Task` を目安に Task へ展開する
4. Task の `id` を `T-<DOMAIN>-<ARTIFACT>-<NNN>` 形式で採番する
5. Task の `wbs` に対応する WBS Item ID を記述する
6. 真に必要な依存だけを `depends_on` に記述する
7. `duration_days` を 0 より大きい値で見積もる
8. 必要に応じて Milestone を `sch-milestones.yaml` に追加する
9. ドメイン固有の展開判断は `Appendix B` に追記する

## 12. 具体例

| WBS Item               | Task 例              |
| ---------------------- | -------------------- |
| `WBS-PJD-OVERVIEW-010` | `T-PJD-OVERVIEW-010` |
| `WBS-PJD-SCOPE-020`    | `T-PJD-SCOPE-020`    |
| `WBS-PJD-ISSUES-030`   | `T-PJD-ISSUES-030`   |
| `WBS-PJM-PLAN-010`     | `T-PJM-PLAN-010`     |
| `WBS-PJM-COMM-020`     | `T-PJM-COMM-020`     |
| `WBS-PJM-QMPLAN-030`   | `T-PJM-QMPLAN-030`   |

## 13. アンチパターン

- WBS に存在しない成果物を Schedule に直接追加する
- `depends_on` を増やしすぎて全 Task が直列になる
- `duration_days: 0` を Task に使う
- `duration_days` が大きすぎて完了判定が曖昧になる
- WBS と Schedule の `id` 体系が対応しておらず追跡できない
- 仕様上は独立なのに、レビュー都合だけで機械的に直列化する
- `name` が「対応」「更新」だけで、何をする Task か判別できない
- `assigned_team` を安定した分類キーとして使う
- ドメイン固有の例外ルールを本文の共通ルールに混ぜる

## 14. 運用ルール

- WBS Item を追加・変更した場合は、対応する Schedule 定義の追加・変更要否を確認します。
- Schedule の `wbs` は、必ず既存の WBS Item ID を参照します。
- Task ID は、依存関係や実行ログから参照されるため、原則として変更しません。
- 依存関係に迷う場合は、まず依存を置かない案を考え、着手不能な理由が明確な場合のみ追加します。
- タスク長に迷う場合は、1 回の作業で完了確認まで到達できるかを基準にします。
- 本戦略を更新した場合は、`sch-*.yaml` と `wbs-*.yaml` の整合を確認します。

## Appendix A. ドメインと Schedule ファイルの対応定義

本付録は、成果物ドメインと Schedule 定義ファイルの対応を定義します。
成果物ドメインの追加に応じて更新します。

| ドメイン             | ドメイン略号 | Schedule ファイル             |
| -------------------- | ------------ | ----------------------------- |
| `project-definition` | `PJD`        | `sch-project-definition.yaml` |
| `project-management` | `PJM`        | `sch-project-management.yaml` |

## Appendix B. ドメイン別展開プロファイル

本付録は、共通ルールでは表現しきれないドメイン別の Schedule 展開方針を定義します。
共通ルールを上書きするのではなく、ドメインごとの標準パターンや注意点を補足するために使用します。

### B.1. `project-definition`

| 項目     | 方針                                                                 |
| -------- | -------------------------------------------------------------------- |
| 標準分解 | 原則 `1 WBS Item = 1 Task`                                           |
| owner    | 主に `PO`                                                            |
| 依存方針 | `prj-overview` を起点にし、必要最小限の依存だけを置く                |
| 注意点   | スコープ、成功基準、前提・制約は相互に関連するが、過度に直列化しない |

### B.2. `project-management`

| 項目     | 方針                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 標準分解 | 管理計画系は `作成` と `レビュー` の 1〜2 Task                              |
| owner    | 主に `PO`、品質やレビュー方針は `QE` も使用                                 |
| 依存方針 | `pm-plan` を起点に、個別計画へ展開する                                      |
| 注意点   | 管理台帳、進捗報告、議事録などの `control` は原則として Schedule 展開対象外 |
