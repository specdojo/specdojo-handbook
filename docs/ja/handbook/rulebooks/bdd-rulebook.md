---
id: bdd-rulebook
type: rulebook
status: draft
target_format: yaml
---

# 業務データ辞書 作成ルール

Business Data Dictionary (BDD) Documentation Rules

本ドキュメントは、業務分析・要求定義・システム設計のために **業務データ辞書を記述する標準ルール**です。
業務上の管理単位（エンティティ）とその属性（項目）の論理名・物理名・説明・制約などを定義します。
データの意味や構造に関する共通理解を関係者間で図り、システム設計や実装の基礎情報として活用します。

## 1. メタデータ

| 項目       | 説明                          | 必須 |
| ---------- | ----------------------------- | ---- |
| id         | データ辞書ID (bdd-xxx-xxxx)   | ○    |
| type       | `domain` 固定                 | ○    |
| title      | データ辞書名                  | ○    |
| status     | `draft`/`ready`/`deprecated`  | ○    |
| supersedes | 置き換え関係（古仕様→新仕様） | 任意 |

### 1.1 ID規約

- ステータス一覧IDは正規表現 `^sts-[a-z0-9-]+$` に合致する一意IDを用いる。
- `type: domain` は業務ドメイン仕様であることを示す。画面やAPI仕様（`screen`/`api`）とは別ドキュメントで管理する。

## 2. 記載ルール・命名規則

- YAML形式で記述する。
- **業務視点の論理名・説明を重視**し、実装要素は必要最小限とする。
- **実装都合の属性や技術的カラム（created_at等）は原則含めないが、物理名(physical_name)については業務データ辞書で一元管理する。**
- データ項目の意味・制約・例値・関連情報や定義・説明を簡潔かつ明確に記載する。
- 論理名・属性名は**日本語の単数形**で記載する。
- 物理名（`physical_name`）はentity, fieldとも必ず **lowerCamelCase** を用いる（例：`productCode`, `creditBalance`, `paymentStatus`）。
- エンティティや項目の論理名・説明は、概念クラス図（CCD）や用語集 (glossary) と整合性を保つ。
- 関連用語や分類は必要に応じて記載する。
- glossary_term_idは、用語集（glossary）で定義したIDと一致させる。
- フィールドが `type: enum` の場合、許容値を必ず明示する。
- 記述方法は以下のいずれかを採用する。
  - 簡易列挙: `allowed_values: [PENDING, PAID, CANCELED]`
  - 詳細列挙: `allowed_values_detailed:` で `value` と `label` を持つ配列。
- 多言語化対応はファイル名で管理し、エンティティ・フィールド内での言語別記載は行わない。例: `010-業務データ辞書-ja.yaml`, `010-bdd-main-en.yaml`

## 3. 禁止事項

- 技術的属性（created_at, updated_at, deleted_at等）を含めない
- 実装都合のカラムやAPI用の構造体をそのまま記載しない
- 用語集やCCDと不整合な用語・IDを使わない
- 英語と日本語のランダム混在（物理名・論理名の混在）
- 意味が曖昧な説明や略語のみの記載

## 4. 業務データ辞書の記載項目

### 4.1 主要項目

| 項目     | 説明                         | 必須 |
| -------- | ---------------------------- | ---- |
| entities | 業務データエンティティの一覧 | ○    |

### 4.2 entities フィールド構成

| サブ項目         | 説明                                      | 必須 |
| ---------------- | ----------------------------------------- | ---- |
| logical_name     | 業務上の論理名（日本語単数形）            | ○    |
| physical_name    | システム上の物理名 (lowerCamelCase)       | ○    |
| description      | 業務データの説明                          | 任意 |
| glossary_term_id | 用語集の用語ID                            | 任意 |
| related_terms    | 関連用語IDリスト                          | 任意 |
| key_fields       | キー項目 (複合キーも想定し物理名のリスト) | ○    |
| fields           | 業務データフィールドの一覧                | ○    |

### 4.3 fields フィールド構成

| サブ項目         | 説明                                                                   | 必須 |
| ---------------- | ---------------------------------------------------------------------- | ---- |
| logical_name     | 業務上の論理名（日本語単数形）                                         | ○    |
| physical_name    | システム上の物理名 (lowerCamelCase)                                    | ○    |
| glossary_term_id | 用語集の用語ID                                                         | 任意 |
| type             | データ型 (integer / string / boolean / date / datetime / enum / money) | ○    |
| description      | フィールドの説明                                                       | 任意 |
| unit             | 単位（該当する場合）                                                   | 任意 |
| constraints      | フィールドの制約条件                                                   | 任意 |
| example          | フィールドの例値                                                       | 任意 |

### 4.4 constraints サブフィールド構成

| サブ項目 | 説明                            | 必須 |
| -------- | ------------------------------- | ---- |
| required | 必須入力かどうか (true / false) | 任意 |
| unique   | 一意性制約 (true / false)       | 任意 |
| min      | 最小値                          | 任意 |
| max      | 最大値                          | 任意 |
| pattern  | 正規表現パターン                | 任意 |

## 5. サンプル

- 参照: [bdd-sample.yaml](../samples/bdd-sample.yaml)

## 7. 生成 AI への指示テンプレート

- 参照: [bdd-instruction.md](../instructions/bdd-instruction.md)
