---
id: meta-document-metadata-rules
type: meta
status: draft
---

# ドキュメントのメタ情報の記述ルール

Document Metadata Rules

## 1. メタ情報概要

機械可読性を向上する目的で、各ドキュメントのヘッダー部に属性情報を記述します。

- 参照スキーマ: [`docs/shared/schemas/spec-frontmatter.schema.yaml`](../../../shared/schemas/spec-frontmatter.schema.yaml)
- Markdownの場合は、記述は YAML Front Matter を想定（各仕様ドキュメントの先頭）。
- ドキュメント名は Frontmatter ではなく、本文先頭の `#` 見出し（H1）に記述する。
- YAML/JSON や他フォーマットの場合は、同等のメタ情報を持つこと。

## 2. メタ情報項目一覧

| 項目       | 説明                                                | 必須 |
| ---------- | --------------------------------------------------- | ---- |
| id         | ドキュメントID (xxx-xxx-xxxx)                       | ○    |
| type       | ドキュメントの種類                                  | ○    |
| status     | ドキュメントの状態                                  | ○    |
| part_of    | 集約ドキュメント（一覧/親）への所属リンク           | 任意 |
| based_on   | 技術的・定義的な土台（前提）/根拠となるドキュメント | 任意 |
| supersedes | 置き換え関係（古仕様→新仕様）                       | 任意 |

## 3. 各項目の詳細ルール

### 3.1. id(ドキュメントID)

- 必須項目
- 一意なID（正規表現に準拠）
- 文字列。`^[a-z0-9][a-z0-9-]*$` に完全一致。英小文字・数字・ハイフンのみ、先頭は英小文字または数字

### 3.2. type(ドキュメントの種類)

- 必須項目
- ドキュメントの種別

下表の定義済み列挙に限定

| 種類         | 説明                                               |
| ------------ | -------------------------------------------------- |
| project      | プロジェクト関連（プロジェクト概要/スコープ等）    |
| screen       | 画面仕様                                           |
| api          | API仕様                                            |
| domain       | ドメイン仕様                                       |
| data         | データ仕様                                         |
| test         | テスト仕様                                         |
| flow         | 業務フロー仕様                                     |
| rule         | 業務ルール仕様                                     |
| architecture | 構造・構成（C4、配置、統合、ネットワーク境界など） |
| decision     | 設計判断（ADR的な意思決定記録）                    |
| meta         | 共通/横断ルール                                    |
| rulebook     | ドキュメント記述ルール                             |
| instruction  | 生成AIへの指示テンプレート                         |
| guide        | ガイドライン                                       |
| migration    | 移行計画・設計・手順                               |
| operations   | 運用要件・設計・手順                               |
| template     | ドキュメントテンプレート                           |

### 3.3. ドキュメント名（H1見出し）

- Frontmatter ではなく、本文先頭の `#` 見出しとして記述する
- 1文字以上、内容が一目で分かる名称にする
- 見出しレベルは H1（`#`）を必須とする

### 3.4. status(ドキュメントの状態)

- 必須項目
- ドキュメントの公開状態

下表の定義済み列挙に限定

| 種類       | 説明     |
| ---------- | -------- |
| draft      | 下書き中 |
| ready      | 公開済み |
| deprecated | 廃止済み |

### 3.5. part_of

- 任意項目
- 自分が「どの集約ドキュメント（一覧/親）」の一部かを示す
- `id` の配列（重複不可、未指定時は空配列）

例:

- `uts-inventory` は `uts-main` の一部 → `part_of: [uts-main]`
- `utd-inventory` は `utd-main` の一部 → `part_of: [utd-main]`

### 3.6. based_on

- 任意項目
- 技術的・定義的な土台（前提）や根拠となるドキュメント
- `id` の配列（重複不可、未指定時は空配列）

### 3.7. supersedes

- 任意項目
- 置き換え関係（古仕様→新仕様）を示すドキュメント
- `id` の配列（重複不可、未指定時は空配列）

## 4. バリデーション指針

- スキーマに準拠しない場合は PR をブロック（lint/CI で検知）
- 未定義プロパティは不可（`additionalProperties: false`）。
- `id` 配列項目は重複禁止（`uniqueItems: true`）。
- 省略可能項目（owners/tags/part_of/based_on 等）は、未指定時に空配列 `[]` を許容。

## 5. 記述例

```yaml
---
id: api-get-order-v1
type: api
status: ready
part_of: []
based_on: []
supersedes: [api-get-order-v0]
---
```

```markdown
# 注文API仕様
```

- NG例: `id: Order_API_v1`（大文字・アンダースコアNG）, `status: public`（列挙外）, `extra: foo`（未定義プロパティNG）, Frontmatterに`title`を記述
- OK例: `id: order-api-v1`, `status: ready`, 本文先頭に `# <ドキュメント名>`
