---
id: meta-document-metadata-rulebook
type: meta
status: draft
---

# ドキュメントのメタ情報の記述ルール

Document Metadata Rules

## 1. 目的

本書は、Frontmatter ルールの共通原則と参照先を整理するハブです。各ドキュメント種別の詳細ルールは、以下の 3 ファイルを正とします。

- 成果物（deliverable）: [meta-deliverable-metadata-rulebook.md](meta-deliverable-metadata-rulebook.md)
- rulebook: [meta-rulebook-metadata-rulebook.md](meta-rulebook-metadata-rulebook.md)
- instruction: [meta-instruction-metadata-rulebook.md](meta-instruction-metadata-rulebook.md)

## 2. 共通原則

- Markdown はファイル先頭に YAML Frontmatter を置く。
- `id` / `type` / `status` は全種別で必須とする。
- `id` は `^[a-z0-9][a-z0-9-]*$` に一致させる。
- `status` は `draft` / `ready` / `deprecated` のいずれかとする。
- ドキュメント名は Frontmatter ではなく本文先頭の H1 に記述する。

## 3. スキーマ対応

- 共通項目: [docs/shared/schemas/common-frontmatter.schema.yaml](../../../../shared/schemas/common-frontmatter.schema.yaml)
- 成果物: [docs/shared/schemas/deliverable-frontmatter.schema.yaml](../../../../shared/schemas/deliverable-frontmatter.schema.yaml)
- rulebook: [docs/shared/schemas/rulebook-frontmatter.schema.yaml](../../../../shared/schemas/rulebook-frontmatter.schema.yaml)
- instruction: [docs/shared/schemas/instruction-frontmatter.schema.yaml](../../../../shared/schemas/instruction-frontmatter.schema.yaml)

## 4. 運用ルール

- 種別固有の要件を更新する場合は、対応する種別別メタルールを更新する。
- 共通項目の変更時は `common-frontmatter.schema.yaml` と本書の共通原則を更新する。
- 既存 rulebook から本書を参照している箇所は、必要に応じて種別別メタルール参照へ段階移行する。
