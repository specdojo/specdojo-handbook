---
id: prj-0001-pm-organization-and-raci
type: project
status: draft
---

# 組織とRACIマトリクス

## 1. 役割ラベル定義

このプロジェクトは SpecDojo Handbook の rules と instructions を作成・維持するドキュメント管理プロジェクトです。
スケジュール・WBS 上のすべてのタスクは以下の **4 つの役割ラベル** で所有関係を表します。

| ラベル | 正式名称         | 位置づけ                                                                                                                                                                                              |
| ------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PO`   | Project Owner    | プロジェクト全体のガバナンスと計画文書を所有する役割。プロジェクト概要・用語集・ハンドブック運用・マイグレーション計画の rules/instructions を担当し、主要マイルストーンの最終承認責任を持つ。        |
| `BA`   | Business Analyst | 業務要件・受入基準・ユーザー観点の品質定義を所有する役割。業務仕様ドメイン全体・受入/外部/ユーザーテスト基準・ユーザビリティ NFR の rules/instructions を担当する。                                   |
| `ARC`  | Architect        | システム設計・アーキテクチャ・メタルールブックの整合性を所有する役割。設計ドメイン全体（コンテキスト/ポリシー/フロー/構造/モデル）および共有メタルール constraints の rules/instructions を担当する。 |
| `QE`   | Quality Engineer | 技術品質・非機能要件・テスト検証ガバナンスを所有する役割。NFR 仕様（可用性〜セキュリティ）・結合/システムテスト基準・品質ガバナンス文書の rules/instructions を担当する。                             |

### 役割の適用方針

- `owner` フィールドはタスク・WBS 項目単位で設定し、**遂行責任 (R)** を表す。
- 人名や agent 名は claimイベントの `by` フィールドに記録し、実行時の担当を追跡する。
- `DOJO_OWNER` 環境変数または `--owner` オプションで実行時に役割を宣言する（例: `--owner ARC`）。
- 役割の異なるタスクを引き受ける場合は `--allow-owner-mismatch` を使用し、理由を `--msg` に記録する。

---

## 2. ドメイン別 担当役割マトリクス

### RACI 凡例

| 記号  | 意味                                       |
| ----- | ------------------------------------------ |
| **R** | Responsible — 実作業を担う                 |
| **A** | Accountable — 成果物の品質に最終責任を持つ |
| **C** | Consulted — 意見・確認を求められる         |
| **I** | Informed — 完了報告を受ける                |

---

### 2-1. Governance ドメイン

| WBS ID                | 作業内容                                       | PO  | BA  | ARC | QE  |
| --------------------- | ---------------------------------------------- | --- | --- | --- | --- |
| WBS-GOV-PROJECT-010   | プロジェクト文書 rule/instruction ペア維持     | R/A | I   | C   | I   |
| WBS-GOV-GLOSSARY-020  | 用語集 rule/instruction ペア維持               | R/A | C   | C   | I   |
| WBS-GOV-OPS-030       | ハンドブック運用・計画 rule セット維持         | R/A | I   | C   | I   |
| WBS-GOV-MIGRATION-040 | マイグレーション索引 rule/instruction ペア維持 | R/A | I   | I   | I   |
| WBS-GOV-META-050      | メタルールブック共有制約維持                   | C   | I   | R/A | C   |

---

### 2-2. Business ドメイン

| WBS ID          | 作業内容                                     | PO  | BA  | ARC | QE  |
| --------------- | -------------------------------------------- | --- | --- | --- | --- |
| WBS-BIZ-BAC-010 | 業務受入基準 rule/instruction ペア維持       | I   | R/A | I   | C   |
| WBS-BIZ-BDD-020 | 業務データ定義 rule/instruction ペア維持     | I   | R/A | C   | I   |
| WBS-BIZ-BDS-030 | 業務データスキーマ rule/instruction ペア維持 | I   | R/A | C   | I   |
| WBS-BIZ-BPS-040 | 業務プロセス仕様 rule/instruction ペア維持   | I   | R/A | C   | I   |
| WBS-BIZ-BR-050  | 業務ルール rule/instruction ペア維持         | I   | R/A | C   | I   |
| WBS-BIZ-BES-060 | 業務イベント仕様 family 維持                 | I   | R/A | C   | I   |

---

### 2-3. Design ドメイン

| WBS ID                            | 作業内容                                      | PO  | BA  | ARC | QE  |
| --------------------------------- | --------------------------------------------- | --- | --- | --- | --- |
| WBS-DES-CLD-010                   | コンテキスト landscape 文書ペア維持           | I   | I   | R/A | I   |
| WBS-DES-CND-020                   | コンテキストナレーション・mermaid family 維持 | I   | I   | R/A | I   |
| WBS-DES-COP-030 〜 CPD-040        | 設計ポリシー rule/instruction family 維持     | I   | C   | R/A | C   |
| WBS-DES-CDFD-050 〜 CXD-070       | 設計フロー・状態遷移・クロス系 family 維持    | I   | I   | R/A | C   |
| WBS-DES-DIAGRAM-080               | カタログ・インターフェース図ルール維持        | I   | I   | R/A | C   |
| WBS-DES-CDSD-090 〜 DMD-100       | 設計サマリー・ドメインモデル ペア維持         | I   | C   | R/A | I   |
| WBS-DES-ENGINEERING-110           | エンジニアリング支援文書セット維持            | I   | C   | R/A | C   |
| WBS-DES-STRUCTURE-120 〜 SYSD-130 | 論理構造・UI仕様・システム設計 family 維持    | I   | C   | R/A | C   |

---

### 2-4. NFR ドメイン

| WBS ID                      | 作業内容                                         | PO  | BA  | ARC | QE  |
| --------------------------- | ------------------------------------------------ | --- | --- | --- | --- |
| WBS-NFR-INDEX-010           | NFR 索引 rule/instruction ペア維持               | I   | I   | C   | R/A |
| WBS-NFR-AVAILABILITY-020    | 可用性要件 rule/instruction ペア維持             | I   | I   | C   | R/A |
| WBS-NFR-INTEGRITY-030       | 完全性要件 rule/instruction ペア維持             | I   | I   | C   | R/A |
| WBS-NFR-MAINTAINABILITY-040 | 保守性要件 rule/instruction ペア維持             | I   | I   | C   | R/A |
| WBS-NFR-OPERATIONS-050      | 運用要件 rule/instruction ペア維持               | I   | I   | C   | R/A |
| WBS-NFR-PERFORMANCE-060     | 性能要件 rule/instruction ペア維持               | I   | I   | C   | R/A |
| WBS-NFR-RELIABILITY-070     | 信頼性要件 rule/instruction ペア維持             | I   | I   | C   | R/A |
| WBS-NFR-SECURITY-080        | セキュリティ・安全要件 rule/instruction ペア維持 | I   | I   | C   | R/A |
| WBS-NFR-USABILITY-090       | ユーザビリティ要件 rule/instruction ペア維持     | I   | R/A | C   | C   |

---

### 2-5. Quality ドメイン

| WBS ID                | 作業内容                                   | PO  | BA  | ARC | QE  |
| --------------------- | ------------------------------------------ | --- | --- | --- | --- |
| WBS-QLTY-ATC-010      | 受入テスト基準 family 維持                 | I   | R/A | I   | C   |
| WBS-QLTY-ETC-020      | 外部テスト基準 family 維持                 | I   | R/A | I   | C   |
| WBS-QLTY-ITC-030      | 結合テスト文書 family 維持                 | I   | C   | C   | R/A |
| WBS-QLTY-STC-040      | システムテスト文書 family 維持             | I   | C   | C   | R/A |
| WBS-QLTY-UTC-050      | ユーザーテスト基準 family 維持             | I   | R/A | I   | C   |
| WBS-QLTY-SAC-060      | システム受入条件 rule/instruction ペア維持 | C   | R/A | I   | C   |
| WBS-QLTY-SFL-070      | ソフトウェア機能一覧 rule/instruction 維持 | I   | C   | C   | R/A |
| WBS-QLTY-TESTPLAN-080 | テスト計画・トレーサビリティ family 維持   | C   | C   | I   | R/A |

---

## 3. マイルストーン承認責任

| マイルストーン ID | 名称                                    | owner | A (最終承認) | R (確認作業)       |
| ----------------- | --------------------------------------- | ----- | ------------ | ------------------ |
| M-SDH-100         | schedule kickoff                        | PO    | PO           | PO                 |
| M-SDH-200         | governance baseline ready               | PO    | PO           | PO + ARC           |
| M-SDH-300         | business and nfr baseline ready         | QE    | QE           | BA + QE            |
| M-SDH-350         | design baseline ready                   | ARC   | ARC          | ARC                |
| M-SDH-400         | quality and traceability baseline ready | PO    | PO           | BA + QE            |
| M-SDH-999         | prj-0001 schedule scope completed       | PO    | PO           | PO + BA + ARC + QE |

---

## 4. 実行時の owner 運用ルール

| ケース                                           | 操作                                                                       |
| ------------------------------------------------ | -------------------------------------------------------------------------- |
| 自分の役割ラベルに割り当てられたタスクを着手する | `dojo exec scheduler --by <name> --owner <PO\|BA\|ARC\|QE>`                |
| 相手の役割ラベルのタスクを代理で着手する         | `--allow-owner-mismatch` を付加し、`--msg` に代理理由を記録する            |
| 担当変更を永続化したい場合                       | schedule/WBS の `owner` フィールドを更新し、`dojo exec build` を再実行する |

## 5. Agent主導モード運用補足

rules-lifecycle Skill の `Standard` / `Agent-Max` / `Agent-Ultra` を使用する場合、
本節のルールを適用する。

### 5.1. BA委譲条件（Agent-Max / Agent-Ultra）

| 項目     | ルール                                                                   |
| -------- | ------------------------------------------------------------------------ |
| 委譲対象 | `BA` が主担当の「修正・追記」作業は Agent へ委譲可能                     |
| 委譲方法 | 実行時に `--allow-owner-mismatch` を付加し、`--msg` に委譲理由を記録     |
| 相談条件 | 仕様変更量が大きい場合、`PO` は `BA` を Consulted としてレビュー依頼する |
| 不可領域 | `PO` の最終承認責任（A）は委譲不可                                       |

### 5.2. 承認集約ルール（Agent-Ultra）

| ステップ           | 取り扱い                                                |
| ------------------ | ------------------------------------------------------- |
| Phase 1 の中間承認 | スキップ可（`status: draft` のまま Phase 2 へ進行）     |
| 最終承認           | Phase 2 終了時に `PO` が rules + derivatives を一括承認 |
| status 更新        | 一括承認時に対象ファイルを `status: ready` へ更新       |
| 差し戻し時         | `②` または `⑤` に戻し、Agent が再修正後に再承認         |

### 5.3. 監査ログ記録ルール

| 記録対象       | 必須記録内容                                                        |
| -------------- | ------------------------------------------------------------------- |
| claim イベント | `by`（実行主体）と `owner`（役割ラベル）を必ず記録                  |
| 代理実行       | `--msg` に「代理理由」と「元の担当ラベル」を記録                    |
| 一括承認       | PR コメントまたはコミットメッセージに「Agent-Ultra 一括承認」を明記 |

- 監査観点では、`R`（実行）と `A`（最終責任）を常に分離して追跡する。
- `PO` は一括承認時に、差し戻し有無と承認対象ファイル群を明示する。
