---
id: meta-id-and-file-naming-rules
type: meta
status: draft
---

# ドキュメントIDおよびファイル命名ルール

Document ID and File Naming Rules

## 1. 目的

本ルールは、ドキュメント間の参照性・可読性・機械処理性・長期運用性を確保するために、

- **ドキュメントID**
- **ファイル名**

の命名規則と両者の関係を明確に定義することを目的とする。

本ルールにより、以下を同時に満たすことを目指す。

- 人間が見て意味を推測できること
- 機械（lint / CI / 生成AI）が安定して扱えること
- 構造変更や文書分割に耐えられること

## 2. 基本方針

### 2.1. IDとファイル名の役割分離

- **ドキュメントID**
  → 文書の**意味的・論理的な識別子**（参照・永続性の軸）

- **ファイル名**
  → 人間が扱いやすい**表示・管理上の名前**（配置・日本語表現を許容）

ID とファイル名は **一致させてもよいが、必須ではない**。

### 2.2. IDの不変性・ファイル名の可変性

- ドキュメントIDは **一意かつ原則変更不可**
- ファイル名は **表示改善・構成変更のために変更可**

## 3. クイックサマリー（要点）

### 3.1. ドキュメントID

- 形式：`<prefix>-<body>`
  - 種類がある場合は、`<prefix>-<kind>-<body>`

- `<body>`も含め`kebab-case`: 英小文字 + 数字 + `-`
- **名詞句**で表現（動詞開始は禁止）
- 系列の入口（SSOT/導線）：`<prefix>-index`
- 共通定義：`<prefix>-common`
- `main` は使用しない
- IDは原則変更不可。変更時は `supersedes` で置換関係を表現

### 3.2. ファイル名

- **日本語可**
- ファイル名は人間向け。IDで機械的に一意性と参照性を保証する
- 系列入口（`-index`）のファイル名は **suffix無し**を推奨（例：`移行計画.md`）
- 個別（`-<term>`）は **`<系列名>-<対象名>.md`** を推奨（例：`移行テスト計画-カットオーバーリハーサル.md`）

---

<details>
<summary>詳細ルール</summary>

## 4. ドキュメントIDの命名ルール

### 4.1. 使用可能文字

- 英小文字（a–z）
- 数字（0–9）
- ハイフン（`-`）

```plaintext
^[a-z0-9][a-z0-9-]*$
```

### 4.2. 表記形式

- **kebab-case**
- 大文字、アンダースコア、記号は使用しない

### 4.3. 基本構造

```plaintext
<prefix>-<body>
<prefix>-<kind>-<body>
```

- `prefix`：ドキュメント種別（固定）
- `kind` : prefixを拡張するカテゴリ（固定）
- `body`：内容を表す名詞句

例：

- `uts-index`
- `sf-product-register`
- `br-discount`
- `ifx-msg-stock-changed`

### 4.4. kind の命名原則

- `<kind>` は語彙を固定し、同義語の混在を禁止する
  - 例：`api`, `msg`, `file`
  - `message`, `messages`, `files` 等は使用しない

- `<prefix>-<kind>-<body>` 以上の多段 prefix は使用しない

OK

- `ifx-api-inventory`

NG

- `ifx-external-api-inventory`

### 4.5. body の命名原則

- 名詞句で表現する
- 動詞単体で始めない
- 「何についての文書か」が分かることを優先する

OK

- `product-register`
- `order-summary`
- `inventory-adjustment`

NG

- `register-product`
- `edit-order`
- `create-invoice`

### 4.6. index / common の扱い（ID）

#### 4.6.1. `-index`（系列の入口・Hub）

`<prefix>-index` は、系列の入口として以下を満たす。

- 系列の **要点（SSOT）** を含む（合意・判断に必要な最小情報）
- 系列内の個別ドキュメント（`<prefix>-<term>` 等）への **導線** を含む
- 個別が存在しない場合でも `-index` を使用し、入口IDを固定する（将来分割に耐える）

> `-index` は「リンク集」ではなく「要点（SSOT）＋関連リンク」を持つ Hub とする。

#### 4.6.2. `-common`（横断的・共有定義）

`<prefix>-common` は、系列外も含めて参照される共通定義に用いる。

- 系列の親子関係を持たない（構造の親ではない）
- 参照元が複数系列にまたがる定義を置く

## 5. ファイル命名ルール

### 5.1. 基本方針

- ファイル名は **人間向け**
- 日本語を使用してよい
- 1ファイルは1ドキュメントIDと対応させる（IDはfrontmatterに保持）

### 5.2. ファイル名の基本構成（推奨）

```plaintext
<日本語文書名>.md
```

例：

| ドキュメントID          | ファイル名例                                 |
| ----------------------- | -------------------------------------------- |
| `uts-index`             | `単体テスト仕様.md`                          |
| `uts-inventory`         | `単体テスト仕様-在庫管理.md`                 |
| `bdd-common`            | `業務データ辞書-共通.md`                     |
| `tsp-index`             | `テスト戦略・方針.md`                        |
| `mtp-index`             | `移行テスト計画.md`                          |
| `mtp-cutover-rehearsal` | `移行テスト計画-カットオーバーリハーサル.md` |

### 5.3. suffix 表記ルール（ファイル名）

- `-index` は **ファイル名に suffix を付けない**（自然な日本語タイトルを優先）
- `-common` は `-共通` を付与してよい（識別性のため推奨）

推奨:

| ID種別    | ファイル名での表現 |
| --------- | ------------------ |
| `-index`  | **suffix無し**     |
| `-common` | `-共通`            |

> 入口は `-index` とIDで固定し、ファイル名は人間が読みやすい名称に寄せる。

### 5.4. 個別ドキュメント（`<term>`）の命名ルール（ファイル名）

- 個別は **`<系列名>-<対象名>.md`** を基本とする
- 対象名は短く具体的にし、重複する語（「全体」「概要」等）は避ける

例：

- `データ移行設計-受注データ.md`
- `移行テスト計画-ウェーブ1.md`
- `移行テスト計画-カットオーバーリハーサル.md`

### 5.5. 連番プレフィックス（任意）

- 並び順が重要であれば `010-` 等の連番を付けてよい
- 付ける場合は系列内で統一し、IDとは独立に運用する

例：

- `010-移行計画.md`
- `020-移行テスト計画.md`
- `030-データ移行設計-受注データ.md`

## 6. IDとファイル名の対応ルール

- すべてのドキュメントは **IDをメタ情報として保持**する
- ファイル名変更時も ID は不変
- 参照・リンク・トレースは **必ずIDで行う**

## 7. 参照構造ルール（更新）

| 種別   | 構造的参照                  |
| ------ | --------------------------- |
| index  | index ⇄ 下位（term）        |
| common | 他 → common（構造親子なし） |

運用ルール:

- 系列の入口は `-index`（Hub）に集約する
- `-index` は **関連ドキュメント（導線）** を必ず持つ
- 個別（term）は、必要に応じて `-index` を参照して共通方針・全体基準の重複を避ける

## 8. IDの変更・置換ルール

- IDは原則変更不可
- 変更が必要な場合は、新IDを作成し、旧IDに `supersedes` を記載する

```yaml
supersedes:
  - api-order-get-v1
```

## 9. NGパターン

| パターン            | 理由                      |
| ------------------- | ------------------------- |
| `Order_API_v1`      | 大文字・記号              |
| `create-order-api`  | 動詞主導                  |
| `uts-list`          | 一覧は `index`（入口Hub） |
| `bdd-main`          | 役割が曖昧（非推奨）      |
| `ifx-inventory-api` | kind は prefix 直後に置く |

## 10. 運用指針

- 迷ったら **「これは何についての文書か？」を名詞で考える**
- 入口（SSOT/導線）は `-index`、横断定義は `-common`
- `-index` は「要点（SSOT）＋関連リンク」を必ず持つ
- IDは設計資産、ファイル名は表示資産として扱う
- lint / CI / 生成AI が ID を正として扱うことを前提にする

## 11. 付録：ドキュメント種別と prefix 対応（抜粋）

</details>

---

## 12. 用語の対応表

日本語の用語と英語の予約語・用語は以下のように対応させてください。

### 12.1. 予約語と日本語名称との対応（更新）

| 予約語          | 日本語名称           | 意味・役割                         |
| --------------- | -------------------- | ---------------------------------- |
| **index**       | **入口（全体）**     | 系列の入口（要点SSOT＋関連リンク） |
| **common**      | **共通**             | 横断的・共有定義                   |
| **rules**       | **ルール**           | 強制ルール・規約（逸脱不可）       |
| **instruction** | **指示テンプレート** | 作成手順・生成AI向け指示           |
| **guide**       | **ガイド**           | 案内・読み物・使い方               |

## 13. 主要な英語用語と日本語用語との対応

| 英語用語                | 日本語用語   | 意味                                               |
| ----------------------- | ------------ | -------------------------------------------------- |
| **need**                | **要求**     | ユーザー・業務の目的・欲求・困りごと               |
| **requirement**         | **要件**     | システムとして満たすべき条件                       |
| **specification**       | **仕様**     | システムに守らせるルール（テストで合否判定できる） |
| **design**              | **設計**     | 構造・方式・構成としてどう実現するか               |
| **implementation**      | **実装**     | コード・設定としての実現                           |
| **definition**          | **定義**     | 世界の言葉・概念（正誤や合否を判定しない）         |
| **constraint**          | **制約**     | 設計・実装に課される制限条件                       |
| **acceptance criteria** | **受入条件** | 利用者視点での合格基準                             |

## 14. ドキュメント種別とプレフィックスの対応表（更新）

### 14.1. プロジェクト関係ドキュメント

<!-- prettier-ignore -->
| 種別 | English | prefix | 例 |
| --- | --- | --- | --- |
| プロジェクト概要 | Project Overview | prj- | prj-overview |
| プロジェクト憲章 | Project Charter | prj- | prj-charter |
| ステークホルダー登録簿 | Stakeholder Register | prj- | prj-stakeholder-register |
| プロジェクトスコープ | Project Scope | prj- | prj-scope |
| 成功条件・受入条件 | Success Criteria and Acceptance Criteria | prj- | prj-success-and-acceptance-criteria |
| 成果物カタログ | Deliverables Catalog | prj- | prj-deliverables-catalog |
| WBS | Work Breakdown Structure | wbs- | wbs-auth |
| プロジェクト課題と解決アプローチ | Project Issues and Approach | prj- | prj-issues-and-approach |
| 前提・制約・依存 | Assumptions, Constraints, and Dependencies | prj- | prj-assumptions-constraints-dependencies |
| 代替案の比較 | Comparison of Alternatives | prj- | prj-comparison-of-alternatives |
| プロジェクトマネジメント計画 | Project Management Plan | pm- | pm-plan |
| スケジュール | Schedule | sch- | sch-auth |
| コミュニケーション計画 | Communication Plan | pm- | pm-communication-plan |
| 品質管理計画 | Quality Management Plan | pm- | pm-quality-management-plan |
| リスク登録簿 | Risk Register | pm- | pm-risk-register |
| 課題ログ | Issue Log | pm- | pm-issue-log |
| 変更要求ログ | Change Request Log | pm- | pm-change-request-log |
| 進捗レポート | Progress Report | pr- | pr-2026-03-01-01 |
| 議事録 | Meeting Minutes | mm- | mm-2026-03-01-01 |
| 体制・RACI | Organization and RACI | pm- | pm-organization-and-raci |
| 決定記録 | Decision Log | dec- | dec-0001-auth |

### 14.2. プロダクト関係ドキュメント

<!-- prettier-ignore -->
| 種別 | English | prefix | 例 |
| --- | --- | --- | --- |
| 概念データフロー図 | Conceptual Data Flow Diagram | cdfd- | cdfd-index |
| 概念クラス図 | Conceptual Class Diagram | ccd- | ccd-customer |
| 業務データ辞書 | Business Data Dictionary | bdd- | bdd-common, bdd-sales |
| 概念データストア定義 | Conceptual Data Store Definition | cdsd- | cdsd-common, cdsd-sales |
| 保管場所定義 | Storage Location Definition | sld- | sld-common, sld-sales |
| ステータス定義 | Status Definition | stsd- | stsd-product |
| 分類定義 | Classification Definition | cld- | cld-product |
| 概念状態遷移図 | Conceptual State Transition Diagram | cstd- | cstd-product |
| 業務プロセス仕様 | Business Process Specification | bps- | bps-order-flow |
| ビジネスルール | Business Rule | br- | br-discount |
| 画面仕様 | UI Specification | uis- | uis-order-edit |
| 帳票仕様 | Business Document Specification | bds- | bds-order-summary |
| システム化機能 | System Function | sf- | sf-index, sf-product-register |
| 業務イベント仕様 | Business Event Specification | bes- | bes-index, bes-order-approved |
| 業務受入条件 | Business Acceptance Criteria | bac- | bac-order-approved |
| 用語集 | Glossary | gl- | gl-sales |
| 用語集の用語 | Glossary Term | tm- | tm-reorder-point |
| 外部システムI/F | External System Interface | ifx- | ifx-index |
| 外部API仕様 | External API Specification | ifx-api- | ifx-api-inventory |
| 外部ファイル連携仕様 | External File Exchange Specification | ifx-file- | ifx-file-order |
| 外部メッセージ仕様 | External Message Specification | ifx-msg- | ifx-msg-stock-changed |
| コンテキスト図 | Context Diagram | cxd- | cxd-customer |
| コンテナ図 | Container Diagram | cnd- | cnd-customer |
| コンポーネント図 | Component Diagram | cpd- | cpd-inventory |
| インフラ構成図 | Infrastructure Diagram | ifd- | ifd-index |
| 技術スタック定義 | Technology Stack Definition | tsd- | tsd-index |
| システム設計-全体構成 | System Design Index | sysd- | sysd-index |
| システム設計-重要フロー | System Design Critical Flows | sysd- / scf- | sysd-critical-flows |
| システム設計-横断ルール | System Design Cross-cutting Policy | sysd- / scp- | sysd-cross-cutting-policy |
| 非機能要件 | Non-Functional Requirements | nfr- | nfr-performance |
| システム受入条件 | System Acceptance Criteria | sac- | sac-performance |
| テスト戦略・方針 | Test Strategy and Policy | tsp- | tsp-index |
| 単体テストカタログ | Unit Test Catalog | utc- | utc-index, utc-product-service |
| 内部結合テストカタログ | Internal Integration Test Catalog | itc- | itc-index, itc-product-service |
| 外部結合テストカタログ | External Integration Test Catalog | etc- | etc-index, etc-product-service |
| 総合テストカタログ | System Test Catalog | stc- | stc-index, stc-product-service |
| 受入テストカタログ | Acceptance Test Catalog | atc- | atc-index, atc-product-service |

### 14.3. 移行関係ドキュメント

<!-- prettier-ignore -->
| 種別 | English | prefix | 例 |
| --- | --- | --- | --- |
| 移行計画 | Migration Plan | mip- | mip-index |
| データ移行設計 | Data Migration Design | dmd- | dmd-index, dmd-order-data |
| 移行テスト計画（リハーサル計画） | Migration Test Plan | mtp- | mtp-index, mtp-cutover-rehearsal |
| カットオーバー計画（本番切替手順） | Cutover Plan | cop- | cop-index, cop-cutover-runbook |
| 運用切替計画（ハイパーケア含む） | Operations Transition Plan | otp- | otp-index |

### 14.4. 運用関係ドキュメント

<!-- prettier-ignore -->
| 種別 | English | prefix | 例 |
| --- | --- | --- | --- |
| 運用方針・設計 | Operations Policy and Design | opd- | opd-index, opd-monitoring |
| 運用手順 | Operations Runbook | opr- | opr-index, opr-restore |
