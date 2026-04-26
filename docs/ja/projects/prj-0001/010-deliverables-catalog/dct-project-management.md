---
id: prj-0001:dct-project-management
type: project
status: draft
part_of: [prj-0001-dct-index]
rulebook: prj-deliverables-catalog-rulebook
---

# 成果物カタログ: SpecDojo Handbook プロジェクトマネジメント

Project Deliverables Catalog: Project Management for SpecDojo Handbook

本ドキュメントは、プロジェクトマネジメントに関する成果物の一覧とその説明をまとめたカタログです。各成果物の目的・内容・配置先・派生関係を定義します。

- ドメイン: `project-management`

## 1. 管理計画

- 配置先: `docs/ja/projects/prj-0001/030-project-management/010-management-plan`

| name                            | 成果物名                       | 種別 | 根拠      | 概要                                                                 |
| ------------------------------- | ------------------------------ | ---- | --------- | -------------------------------------------------------------------- |
| `pm-plan`                       | プロジェクト管理計画           | work | -         | プロジェクト全体の管理方針・プロセスを定義                           |
| `pm-communication-plan`         | コミュニケーション計画         | work | `pm-plan` | 報告・連絡・会議体の計画を定義                                       |
| `pm-quality-management-plan`    | 品質管理計画                   | work | `pm-plan` | 品質目標・レビュー方針・品質基準を定義                               |
| `pm-organization-and-raci`      | 組織体制と RACI                | work | `pm-plan` | 体制図と責任分担マトリクスを定義                                     |
| `pm-wbs-decomposition-strategy` | WBS 分解戦略                   | work | `pm-plan` | 成果物カタログから WBS への分解粒度・命名・分割方針を定義            |
| `pm-wbs-to-schedule-strategy`   | WBS から Schedule への展開戦略 | work | `pm-plan` | WBS を実行可能タスクへ展開する際の依存関係・タスク長・命名規則を定義 |

## 2. 管理台帳

- 配置先: `docs/ja/projects/prj-0001/030-project-management/020-controls/010-project-register`

| name                | 成果物名             | 種別    | 根拠 | 概要                                       |
| ------------------- | -------------------- | ------- | ---- | ------------------------------------------ |
| `pjr-index`         | プロジェクト登録簿   | control | -    | 識別済み検討項目と対応策を管理（台帳）     |
| `pjr-<NNNN>-<term>` | プロジェクト登録項目 | control | -    | 識別済み検討項目と対応策を管理（個別課題） |

## 3. 管理台帳補助ビュー

- 配置先: `docs/ja/projects/prj-0001/030-project-management/020-controls/010-project-register/generated`

| name              | 成果物名       | 種別      | 根拠                      | 概要                                     |
| ----------------- | -------------- | --------- | ------------------------- | ---------------------------------------- |
| `pjr-open-items`  | 未完了項目一覧 | generated | `pjr-index`, `pjr-<term>` | プロジェクト登録簿の未完了項目を一覧化   |
| `pjr-by-owner`    | 担当者別一覧   | generated | `pjr-index`, `pjr-<term>` | プロジェクト登録簿の担当者別項目を一覧化 |
| `pjr-by-priority` | 優先度別一覧   | generated | `pjr-index`, `pjr-<term>` | プロジェクト登録簿の優先度別項目を一覧化 |
| `pjr-by-status`   | 状態別一覧     | generated | `pjr-index`, `pjr-<term>` | プロジェクト登録簿の状態別項目を一覧化   |

## 4. 管理ビュー

- 配置先: `docs/ja/projects/prj-0001/030-project-management/020-controls/generated`

| name                    | 成果物名     | 種別      | 根拠         | 概要                                     |
| ----------------------- | ------------ | --------- | ------------ | ---------------------------------------- |
| `pm-risk-register`      | リスク登録簿 | generated | `pjr-<term>` | 識別済みリスクと対応策を管理             |
| `pm-issue-log`          | 課題ログ     | generated | `pjr-<term>` | 発生した課題と対応状況を管理             |
| `pm-change-request-log` | 変更要求ログ | generated | `pjr-<term>` | 変更要求の申請・審査・決定を管理         |
| `pm-decision-log`       | 決定記録     | generated | `pjr-<term>` | プロジェクト上の意思決定とその根拠を記録 |

## 6. WBS

WBS 定義ファイル（YAML 形式）です。スコープ分割単位ごとにファイルを作成します。

- 配置先: `docs/ja/projects/prj-0001/030-project-management/030-wbs`

| name                     | 成果物名 | 種別 | 根拠                                                      | 概要                                                           |
| ------------------------ | -------- | ---- | --------------------------------------------------------- | -------------------------------------------------------------- |
| `wbs-project-management` | WBS 定義 | work | `dct-project-management`, `pm-wbs-decomposition-strategy` | プロジェクトマネジメント成果物作成の作業分解構造を YAML で定義 |
| `wbs-project-definition` | WBS 定義 | work | `dct-project-definition`, `pm-wbs-decomposition-strategy` | プロジェクト定義成果物作成の作業分解構造を YAML で定義         |

## 7. スケジュール

- 配置先: `docs/ja/projects/prj-0001/030-project-management/040-schedule`

スケジュール定義ファイル（YAML 形式）です。マイルストーンおよびスコープ単位で作成します。

| name                     | 成果物名           | 種別 | 根拠                                                    | 概要                                                       |
| ------------------------ | ------------------ | ---- | ------------------------------------------------------- | ---------------------------------------------------------- |
| `sch-milestones`         | マイルストーン定義 | work | -                                                       | プロジェクト全体のマイルストーンを定義                     |
| `sch-project-management` | スケジュール定義   | work | `wbs-project-management`, `pm-wbs-to-schedule-strategy` | プロジェクトマネジメント成果物作成の詳細スケジュールを定義 |
| `sch-project-definition` | スケジュール定義   | work | `wbs-project-definition`, `pm-wbs-to-schedule-strategy` | プロジェクト定義成果物作成の詳細スケジュールを定義         |

## 5. レポート

yyyy-mm-dd は報告日を表す形式で、週次・月次などプロジェクトの報告頻度に応じて命名します。

### 進捗報告

- 配置先: `docs/ja/projects/prj-0001/030-project-management/050-reporting/progress-reports`

| name            | 成果物名 | 種別    | 根拠 | 概要                   |
| --------------- | -------- | ------- | ---- | ---------------------- |
| `pr-yyyy-mm-dd` | 進捗報告 | control | -    | 定期的な進捗状況の報告 |

### 議事録

- 配置先: `docs/ja/projects/prj-0001/030-project-management/050-reporting/meeting-minutes`

| name            | 成果物名 | 種別    | 根拠 | 概要                             |
| --------------- | -------- | ------- | ---- | -------------------------------- |
| `mm-yyyy-mm-dd` | 議事録   | control | -    | 会議の決定事項・アクションを記録 |

## 8. 実行管理

- 配置先: `docs/ja/projects/prj-0001/030-project-management/060-execution`

specdojo コマンドによるタスク実行・イベント管理のディレクトリです。

| name         | 成果物名                 | 種別      | 根拠 | 概要                                            |
| ------------ | ------------------------ | --------- | ---- | ----------------------------------------------- |
| `exec/`      | タスク実行ワークスペース | generated | -    | specdojo コマンドによるタスク実行とイベント記録 |
| `generated/` | 自動生成成果物の出力先   | generated | -    | タスク実行結果から自動生成された成果物          |
