---
id: prj-0001-deliverables-catalog
type: project
status: draft
---

# 成果物カタログ

Project Deliverables Catalog

本ドキュメントは、SpecDojo Handbook プロジェクトで作成する成果物の一覧とその説明をまとめたカタログです。各成果物の目的・内容・配置先・派生関係を定義します。

## 1. 成果物の体系

### 1.1. 成果物種別

本プロジェクトの成果物は以下の 6 種別で構成されます。

<!-- prettier-ignore -->
| 成果物種別 | 生成元 | 配置先 | 説明 |
| --- | --- | --- | --- |
| rules | 手動作成 | `docs/ja/handbook/rules/` | 各ドキュメントの作成ルール本体（SSOT） |
| instruction | rules から派生 | `docs/ja/handbook/instructions/` | rules を生成 AI 向けの実行指示として再構成したテンプレート |
| sample | rules から派生 | `docs/ja/handbook/samples/` | rules に準拠した最小の記述例 |
| `.instructions.md` | 手動作成 | `.github/instructions/` | VS Code / Copilot エージェントが自動参照するルール指示ファイル |
| `SKILL.md` | 手動作成 | `.github/skills/<name>/` | 複数ステップのエージェントワークフローを定義するスキルファイル |
| `.prompt.md` | 手動作成 | `.github/prompts/` | エージェントワークフローを起動するプロンプトファイル |

### 1.2. 派生関係と命名規則

1 つの rules から 2 つの派生成果物が生成されます。`meta-*-rules.md` は派生対象外です。

<!-- prettier-ignore -->
| rules 側ファイル | 派生成果物 |
| --- | --- |
| `<name>-rules.md` | `<name>-instruction.md` |
| `<name>-rules.md` | `<name>-sample.md` |

## 2. エージェントカスタマイズ（.github/）

成果物の自動生成を支援するために VS Code / GitHub Copilot エージェントへ適用するカスタマイズファイルです。

### 2.1. Instructions（.github/instructions/）

VS Code Copilot エージェントが自動参照するルール指示ファイルです。`applyTo` パターンに一致するファイルを編集する際にエージェントへ自動適用されます。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `markdown.instructions.md` | Markdown 記述ルール指示 | `docs/**/*.md` に適用する Markdown 記述共通ルール |
| `rules.instructions.md` | rules 作成運用ルール指示 | `*-rules.md` 作成・更新時の共通運用ルール |
| `rules-to-instruction.instructions.md` | rules→instruction 変換指示 | rules から instruction を生成する際の変換ルール |
| `rules-to-sample.instructions.md` | rules→sample 変換指示 | rules から sample を生成する際の変換ルール |

### 2.2. SKILL（.github/skills/）

複数ステップのエージェントワークフローを定義するスキルファイルです。ユーザーのリクエストに応じてエージェントが呼び出します。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `upsert-rules` | upsert-rules スキル | `*-rules.md` の新規作成・更新ワークフロー |
| `rules-to-instruction` | rules-to-instruction スキル | rules から instruction を生成するワークフロー |
| `rules-to-sample` | rules-to-sample スキル | rules から sample を生成するワークフロー |
| `rules-lifecycle` | rules-lifecycle スキル | rules 作成から派生成果物生成までの一連のワークフロー |
| `rules-lifecycle-all` | rules-lifecycle-all スキル | 全 `*-rules.md` を対象にライフサイクルを順次実行するワークフロー |

### 2.3. Prompts（.github/prompts/）

エージェントの特定ワークフローを起動するプロンプトファイルです。チャットから `/` コマンドとして呼び出します。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `upsert-rules.md` | rules 新規・更新プロンプト | `*-rules.md` の新規作成・更新を起動 |
| `upsert-instruction.md` | instruction 更新プロンプト | 指定した `*-instruction.md` の更新を起動 |
| `upsert-all-instructions.md` | 全 instruction 更新プロンプト | すべての `*-instruction.md` の一括更新を起動 |
| `upsert-changed-instructions.md` | 変更 instruction 更新プロンプト | rules 変更に追従した instruction の更新を起動 |
| `upsert-last-commit-instructions.md` | 直近コミット instruction 更新プロンプト | 直近コミットの rules 変更に追従した instruction 更新を起動 |
| `upsert-test-instructions.md` | テスト instruction 更新プロンプト | テスト関連 instruction の一括更新を起動 |
| `upsert-nfr-instructions.md` | 非機能要件 instruction 更新プロンプト | 非機能要件関連 instruction の一括更新を起動 |
| `upsert-migration-instructions.md` | 移行 instruction 更新プロンプト | 移行関連 instruction の一括更新を起動 |
| `rules-lifecycle.md` | rules ライフサイクルプロンプト | rules 作成から派生成果物生成までのライフサイクルを起動 |
| `rules-lifecycle-all.md` | rules ライフサイクル一括実行プロンプト | 全 `*-rules.md` を対象にライフサイクルを順次実行 |
| `reverse-rules.md` | 逆引き rules 生成プロンプト | 既存の成果物ファイルから rules を逆生成する処理を起動 |

## 3. プロジェクト関連

プロジェクトの運営・管理に関する成果物です。

### 3.1. プロジェクト概要（010-project-overview）

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `prj-overview` | プロジェクト概要 | プロジェクトの目的・背景・ゴールを定義 |
| `prj-charter` | プロジェクト憲章 | プロジェクトの正式な認可と権限委譲を文書化 |
| `prj-stakeholder-register` | ステークホルダー登録簿 | 関係者の役割・関心・影響度を一覧化 |

### 3.2. プロジェクトスコープ（020-project-scope）

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `prj-scope` | プロジェクトスコープ | プロジェクトの対象範囲と除外範囲を定義 |
| `prj-success-and-acceptance-criteria` | 成功基準と受入条件 | プロジェクト成功の判定基準と受入条件を明確化 |
| `prj-deliverables-catalog` | 成果物カタログ | プロジェクト成果物の一覧と説明（本ドキュメント） |

### 3.3. プロジェクト課題と解決アプローチ（030-project-issues-and-approach）

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `prj-issues-and-approach` | プロジェクト課題と解決アプローチ | 主要課題の特定と解決アプローチを定義 |
| `prj-assumptions-constraints-dependencies` | 前提・制約・依存関係 | 前提条件・制約事項・外部依存を整理 |
| `prj-comparison-of-alternatives` | 代替案比較 | 技術的・方針的な代替案を比較評価 |

### 3.4. プロジェクト管理（040-project-management）

#### 3.4.1. 管理計画（010-management-plan）

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `pm-plan` | プロジェクト管理計画 | プロジェクト全体の管理方針・プロセスを定義 |
| `pm-communication-plan` | コミュニケーション計画 | 報告・連絡・会議体の計画を定義 |
| `pm-quality-management-plan` | 品質管理計画 | 品質目標・レビュー方針・品質基準を定義 |
| `pm-organization-and-raci` | 組織体制と RACI | 体制図と責任分担マトリクスを定義 |

#### 3.4.2. 管理台帳（020-controls）

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `pm-risk-register` | リスク登録簿 | 識別済みリスクと対応策を管理 |
| `pm-issue-log` | 課題ログ | 発生した課題と対応状況を管理 |
| `pm-change-request-log` | 変更要求ログ | 変更要求の申請・審査・決定を管理 |

#### 3.4.3. レポート（030-reporting/progress-reports, 030-reporting/meeting-minutes）

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `pr` | 進捗報告 | 定期的な進捗状況の報告 |
| `mm` | 議事録 | 会議の決定事項・アクションを記録 |

### 3.5. WBS（050-wbs）

WBS 定義ファイル（YAML 形式）です。スコープ分割単位ごとにファイルを作成します。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `wbs-<scope>` | WBS 定義 | スコープ単位の作業分解構造を YAML で定義 |

### 3.6. スケジュール（060-schedule）

スケジュール定義ファイル（YAML 形式）です。マイルストーンおよびスコープ単位で作成します。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `sch-milestones` | マイルストーン定義 | プロジェクト全体のマイルストーンを定義 |
| `sch-<scope>` | スケジュール定義 | スコープ単位の詳細スケジュールを定義 |

### 3.7. 実行管理（070-execution）

dojo コマンドによるタスク実行・イベント管理のディレクトリです。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `exec/` | タスク実行ワークスペース | dojo コマンドによるタスク実行とイベント記録 |
| `generated/` | 自動生成成果物の出力先 | タスク実行結果から自動生成された成果物 |

### 3.8. 決定記録（090-decision-log）

プロジェクト内の意思決定を記録するドキュメントです。連番で管理します。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `dec-<NNNN>-<topic>` | 決定記録 | プロジェクト上の意思決定とその根拠を記録 |

## 4. 業務仕様

業務プロセス・ルール・データ・帳票など業務レベルの仕様に関する成果物です。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `bps` | 業務プロセス仕様書 | 業務フロー・手順・関係者の役割を定義 |
| `br` | ビジネスルール | 業務上の判定条件・計算式・制約を定義 |
| `bdd` | 業務データ辞書 | 業務で扱うデータ項目の名称・型・制約を定義 |
| `bds` | 帳票仕様 | 帳票・レポートのレイアウトと出力条件を定義 |
| `uis` | 画面仕様 | 画面レイアウト・遷移・操作仕様を定義 |
| `gl` | 用語集 | プロジェクト共通の用語と定義を一覧化 |
| `cld` | 分類一覧 | 業務で使用する分類体系を一覧化 |
| `stsd` | ステータス一覧 | 業務エンティティの状態と遷移条件を一覧化 |
| `sld` | 保管場所一覧 | データやファイルの保管場所を一覧化 |

### 4.1. 業務イベント仕様

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `bes-index` | 業務イベント仕様 全体構成 | 業務イベント仕様の全体構成と一覧 |
| `bes` | 業務イベント仕様 個別 | 個別の業務イベントのトリガー・処理・結果を定義 |

### 4.2. 概念モデル図

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `cdfd` | 概念データフロー図 ドキュメント | 概念レベルのデータフローを図と説明で定義 |
| `cdfd-mermaid` | 概念データフロー図 Mermaid | 概念データフロー図の Mermaid ソース |
| `cdsd` | 概念データストア定義 | 概念データストアの構造と属性を定義 |
| `cstd` | 概念状態遷移図 ドキュメント | 概念レベルの状態遷移を図と説明で定義 |
| `cstd-mermaid` | 概念状態遷移図 Mermaid | 概念状態遷移図の Mermaid ソース |
| `ccd-mermaid` | 概念クラス図 Mermaid | 概念クラス図の Mermaid ソース |

### 4.3. システム化機能一覧

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `sf-index` | システム化機能一覧 全体構成 | システム化対象の機能の全体構成と一覧 |
| `sf` | システム化機能一覧 個別 | 個別のシステム化機能の概要・関連仕様を定義 |

## 5. 外部 IF 仕様

外部システムとの接続仕様に関する成果物です。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `ifx` | 外部システム IF 一覧 | 外部システムとの接続一覧と IF 概要 |
| `ifx-api` | 外部 API 仕様 | 外部 API のエンドポイント・パラメータ・応答を定義 |
| `ifx-file` | 外部ファイル連携仕様 | 外部ファイル連携のレイアウト・形式・頻度を定義 |
| `ifx-msg` | 外部メッセージ仕様 | 外部メッセージの形式・プロトコル・処理を定義 |

## 6. 業務受入条件

業務観点での受入基準に関する成果物です。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `bac` | 業務受入条件 | 業務観点での受入基準とテスト条件を定義 |

## 7. アーキテクチャ

C4 モデル・インフラ構成などアーキテクチャレベルの成果物です。

### 7.1. C4 モデル

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `cxd` | C4 コンテキスト図 ドキュメント | システムと外部アクターの関係を図と説明で定義 |
| `cxd-mermaid` | C4 コンテキスト図 Mermaid | C4 コンテキスト図の Mermaid ソース |
| `cnd` | C4 コンテナ図 ドキュメント | システム内部のコンテナ構成を図と説明で定義 |
| `cnd-mermaid` | C4 コンテナ図 Mermaid | C4 コンテナ図の Mermaid ソース |
| `cpd` | C4 コンポーネント図 ドキュメント | コンテナ内部のコンポーネント構成を図と説明で定義 |
| `cpd-mermaid` | C4 コンポーネント図 Mermaid | C4 コンポーネント図の Mermaid ソース |

### 7.2. インフラ・技術スタック

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `ifd-mermaid` | インフラ構成図 Mermaid | インフラ構成図の Mermaid ソース |
| `tsd` | 技術スタック定義 | 採用技術・バージョン・選定理由を定義 |

## 8. システム設計

システム全体設計・横断ルールに関する成果物です。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `sysd-index` | システム設計 全体構成 | システム設計ドキュメントの全体構成と一覧 |
| `sysd-critical-flows` | システム設計 重要フロー | 業務上重要なフローのシステム処理を設計 |
| `sysd-cross-cutting-policy` | システム設計 横断ルール | 認証・ログ・エラー処理など横断ルールを定義 |

## 9. 非機能要件

非機能要件に関する成果物です。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `nfr-index` | 非機能要件 インデックス | 非機能要件の全体構成とカテゴリ一覧 |
| `nfr-availability` | 非機能要件 / 可用性 | 稼働率・冗長構成・災害対策の要件 |
| `nfr-integrity` | 非機能要件 / 完全性 | データ整合性・バックアップ・復旧の要件 |
| `nfr-maintainability` | 非機能要件 / 保守性 | 保守容易性・拡張性・技術的負債の方針 |
| `nfr-operations` | 非機能要件 / 運用 | 監視・バッチ・運用自動化の要件 |
| `nfr-performance` | 非機能要件 / 性能 | 応答時間・スループット・リソースの要件 |
| `nfr-reliability` | 非機能要件 / 信頼性 | 障害耐性・リトライ・縮退運転の要件 |
| `nfr-security-safety` | 非機能要件 / 機密性・安全性 | 認証・認可・暗号化・安全性の要件 |
| `nfr-usability` | 非機能要件 / 操作性 | 操作性・アクセシビリティ・多言語対応の要件 |

## 10. システム受入条件

システム観点での受入基準に関する成果物です。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `sac` | システム受入条件 | システム観点での受入基準とテスト条件を定義 |

## 11. テスト

テスト戦略・テストカタログ・テスト設計に関する成果物です。

### 11.1. テスト戦略・方針

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `tsp-index` | テスト戦略・方針 | テスト戦略・方針・レベル定義の全体構成 |

### 11.2. 単体テスト

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `utc-index` | 単体テストカタログ 概要 | 単体テストカタログの全体構成と方針 |
| `utc` | 単体テストカタログ 対象別 | 対象コンポーネントごとの単体テスト項目 |

### 11.3. 内部結合テスト

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `itc-index` | 内部結合テストカタログ 概要 | 内部結合テストカタログの全体構成と方針 |
| `itc` | 内部結合テストカタログ 対象別 | 対象 IF ごとの内部結合テスト項目 |

### 11.4. 外部結合テスト

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `etc-index` | 外部結合テストカタログ 概要 | 外部結合テストカタログの全体構成と方針 |
| `etc` | 外部結合テストカタログ 対象別 | 対象外部 IF ごとの外部結合テスト項目 |

### 11.5. 総合テスト

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `stc-index` | 総合テストカタログ 概要 | 総合テストカタログの全体構成と方針 |
| `stc` | 総合テストカタログ 対象別 | シナリオごとの総合テスト項目 |

### 11.6. 受入テスト

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `atc-index` | 受入テストカタログ 概要 | 受入テストカタログの全体構成と方針 |
| `atc` | 受入テストカタログ 対象別 | 受入基準ごとの受入テスト項目 |

## 12. 移行

移行計画・テストに関する成果物です。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `mip-index` | 移行計画 | 移行スコープ・方式・スケジュールの計画 |
| `mtp` | 移行テスト計画 | 移行テストの方針・手順・判定基準 |
| `cop` | カットオーバー計画 | カットオーバー判定基準・手順・ロールバック計画 |
| `dmd` | データ移行設計 | 既存データの移行方針・マッピング・手順を設計 |
| `otp` | 運用切替計画 | 旧システムから新システムへの運用切替計画 |

## 13. 運用設計

運用方針・手順に関する成果物です。

<!-- prettier-ignore -->
| name | 成果物名 | 概要 |
| --- | --- | --- |
| `opd` | 運用方針・設計 | 運用方針・体制・SLA・エスカレーションを設計 |
| `opr` | 運用手順 | 定常運用・障害対応の手順を定義 |
