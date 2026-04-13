---
id: wbs-rules
type: rulebook
status: draft
---

# WBS 定義 作成ルール

Work Breakdown Structure Documentation Rules

本ドキュメントは、`wbs-<scope>.yaml` を一貫した粒度と命名で作成・更新するためのルールを定義します。
WBS は成果物スコープと完了定義（WHAT）に特化し、実行順序・依存・日程（WHEN/ORDER）は Schedule 側で管理します。
本ルールで示す YAML 構造は、`docs/shared/schemas/wbs.schema.yaml` を正とします。

## 1. 全体方針

- `1 WBS Item = 1 完了判定を共有する成果物ファミリー` を基本単位とする。
- WBS には成果物スコープ、`deliverables`、`done_criteria` を記述し、実行計画（依存・順序・所要期間）は記述しない。
- 成果物カタログで「WBSへの落とし込み対象外」とされた成果物は WBS 管理対象に含めない。
- WBS の分解方針は、対象プロジェクトの `pm-wbs-decomposition-strategy.md` を優先する。

### 1.1. スキーマ版管理（`$id`）

- スキーマ版は `docs/shared/schemas/wbs.schema.yaml` の `$id` で管理する。
- 現行版は `https://specdojo.org/schemas/wbs/v1` とする。
- 互換性を壊す変更（required 追加、型変更、制約強化など）を行う場合は、`v2` 以降の新しい `$id` を採番する。
- 既存の `$id` は不変とし、後方互換が必要な場合は版付きスキーマを並行管理する。

## 2. 位置づけと用語定義（必要に応じて）

本ルールでは、用語を次の意味で使います。

| 用語          | 意味                                              |
| ------------- | ------------------------------------------------- |
| WBS Item      | 完了判定を共有する成果物ファミリー単位            |
| deliverables  | 作成・更新対象となる実ファイルパス一覧            |
| done_criteria | レビューで完了可否を判定できる条件                |
| scope         | WBS ファイル分割単位（例: project, product-docs） |

## 3. ファイル命名・ID規則

### 3.1. WBS ファイル名

- ファイル名は `wbs-<scope>.yaml` とする。
- `<scope>` は成果物カタログのドメインまたは分解戦略で定義した分割単位に一致させる。
- 例: `wbs-project.yaml`, `wbs-agent-customization.yaml`, `wbs-project-docs.yaml`, `wbs-product-docs.yaml`

### 3.2. WBS Item の `id`

- スキーマ上の形式は `^WBS-[A-Z0-9-]+-[0-9]{2,4}$` とする。
- 推奨形式は `WBS-<DOMAIN>-<ARTIFACT>-<NNNN>` とする。
- `<DOMAIN>` はプロジェクトで定義した略号（例: `PRJ`, `AGT`, `PJD`, `PDT`）を使用する。
- `<ARTIFACT>` は成果物カタログの `name` に対応する意味のある略号を使用する。
- `<NNNN>` はプロジェクト規約として 4 桁固定、`0010` 刻みで採番する（スキーマは 2〜4 桁を許容）。
- 既存 `id` は並び替えのみを理由に変更しない。

例:

```text
WBS-PDT-BPS-0010
WBS-PDT-CXD-0020
WBS-PDT-REFDATA-0070
WBS-PJD-PRJ-0010
```

## 4. 推奨 Frontmatter 項目

`wbs-<scope>.yaml` では、Frontmatter を分離して持たず、Frontmatter 相当の文書メタデータを YAML のルートキーとして埋め込む。
項目の意味と値の考え方は `meta-document-metadata-rules.md` に準拠し、WBS 定義では次を使用する。

| 項目       | 説明                                 | 必須 |
| ---------- | ------------------------------------ | ---- |
| id         | ドキュメントID（英小文字・ハイフン） | ○    |
| type       | `wbs`                                | ○    |
| status     | `draft` / `ready` / `deprecated`     | ○    |
| part_of    | 親ドキュメントID                     | 任意 |
| based_on   | 根拠ドキュメントID                   | 任意 |
| supersedes | 置換対象ドキュメントID               | 任意 |

補足:

- これらの項目は Markdown Frontmatter ではなく、YAML 本体の先頭レベルに記述する。
- `type` はスキーマ上 `wbs` 固定とする。

## 5. 本文構成（標準テンプレ）

`wbs-<scope>.yaml` は、スキーマで定義されたルート構造に従って構成する。

| 要素                      | 必須 | 内容                                              |
| ------------------------- | ---- | ------------------------------------------------- |
| id                        | ○    | WBS 文書ID                                        |
| type                      | ○    | `wbs` 固定                                        |
| status                    | ○    | 文書状態                                          |
| part_of                   | 任意 | 親ドキュメントID                                  |
| based_on                  | 任意 | 根拠ドキュメントID                                |
| supersedes                | 任意 | 置換対象ドキュメントID                            |
| project_id                | ○    | プロジェクト識別子                                |
| domain                    | ○    | ファイル名 `wbs-<domain>.yaml` と対応する安定境界 |
| assigned_team             | 任意 | 現在の担当チーム名（可変情報）                    |
| wbs                       | ○    | WBS Item 配列                                     |
| wbs[].id                  | ○    | WBS ID（スキーマ pattern 準拠）                   |
| wbs[].name                | ○    | 一覧で識別できる短いラベル                        |
| wbs[].description         | 任意 | スコープ説明                                      |
| wbs[].owner               | ○    | 主責任ロール（`PO` / `BA` / `ARC` / `QE`）        |
| wbs[].component           | 任意 | サブ領域（例: api, ui, db）                       |
| wbs[].deliverables        | ○    | 成果物配列                                        |
| wbs[].deliverables[].path | ○    | 成果物パス                                        |
| wbs[].deliverables[].kind | ○    | `create` / `modify` / `reference`                 |
| wbs[].deliverables[].note | 任意 | 成果物補足                                        |
| wbs[].done_criteria       | ○    | 完了判定可能な条件                                |
| wbs[].acceptance_refs     | 任意 | 受入基準や決定記録への参照ID配列                  |
| wbs[].tags                | 任意 | 分類タグ配列                                      |
| wbs[].notes               | 任意 | 補足メモ                                          |

補足:

- YAML のルートキーは `wbs` を使用する。
- 章構成は YAML には存在しないため、本節は「スキーマ準拠テンプレート」を示す。

## 6. 記述ガイド

### 6.1. 粒度

- 単一ファイル単位ではなく、同じ完了条件でレビューできる成果物ファミリー単位で切る。
- `rules` / `instruction` / `sample` が一体運用なら 1 WBS Item にまとめる。
- 文書本体と Mermaid 図のような整合セットも原則 1 WBS Item にまとめる。

### 6.2. `deliverables`

- 各要素をオブジェクトで記述し、`path` と `kind` を必須とする。
- `kind` は `create` / `modify` / `reference` のいずれかを使う。
- 実在パスを列挙し、曖昧な表記（例: 「関連資料一式」）は使わない。
- 将来増減が見込まれる場合でも、現時点で管理対象とするファイルを明示する。
- 成果物カタログで WBS 対象外とされた成果物（管理台帳、レポート、実行管理、決定記録）は列挙しない。

例:

```yaml
deliverables:
  - path: docs/ja/handbook/rules/wbs-rules.md
    kind: modify
    note: WBS ルール本文の更新
  - path: docs/ja/handbook/samples/wbs-sample.md
    kind: create
```

### 6.3. `done_criteria`

- 「何を満たせば完了か」をレビュー可能な文で記述する。
- 「作成する」「更新する」だけの記述は避ける。

良い例:

```text
BPS ルール・指示・サンプルが、必須章構成と禁止事項を満たし、相互リンクが有効であること。
```

悪い例:

```text
BPS を更新すること。
```

### 6.4. 対象外の扱い

- WBS 対象外成果物を誤って WBS 化しない。
- 対象外成果物の実行管理が必要な場合は、WBS ではなく個別の運用計画または別管理台帳で扱う。

## 7. 禁止事項

- 実行順序・依存・日程を WBS に直接書くこと。
- `id` に意味のない略号や重複番号を使うこと。
- `deliverables` を文字列配列で記述すること（`path` / `kind` 必須）。
- `deliverables` に存在しない/曖昧なパスを記載すること。
- `done_criteria` を判定不能な抽象語だけで記述すること。
- 成果物カタログで WBS 対象外とされた成果物を WBS 管理対象へ混在させること。

## 8. サンプル（最小でも可）

- サンプルは次を参照する。
  - `../samples/wbs-sample.yaml`

## 9. 生成 AI への指示テンプレート

- 生成 AI への具体的な指示は次を参照する。
  - `../instructions/wbs-instruction.md`
