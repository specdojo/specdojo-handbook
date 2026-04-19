---
id: meta-document-metadata-rulebook
type: meta
status: draft
---

# ドキュメントのメタ情報の記述ルール

Document Metadata Rules

## 1. 目的

本書は、Frontmatter ルールの共通原則のみを定義するハブです。各ドキュメント種別の詳細ルールは、以下の 3 ファイルを正とします。

- 成果物（deliverable）: [meta-deliverable-metadata-rulebook.md](meta-deliverable-metadata-rulebook.md)
- rulebook: [meta-rulebook-metadata-rulebook.md](meta-rulebook-metadata-rulebook.md)
- instruction: [meta-instruction-metadata-rulebook.md](meta-instruction-metadata-rulebook.md)

## 2. 共通原則

- Markdown はファイル先頭に YAML Frontmatter を置く。
- `id` / `type` / `status` は全種別で必須とする。
- `id` は `^[a-z0-9][a-z0-9-]*$` に一致させる。
- `status` は `draft` / `ready` / `deprecated` のいずれかとする。
- ドキュメント名は Frontmatter ではなく本文先頭の H1 に記述する。
