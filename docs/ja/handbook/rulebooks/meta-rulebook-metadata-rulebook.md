---
id: meta-rulebook-metadata-rulebook
type: meta
status: draft
---

# Rulebook メタ情報の記述ルール

Rulebook Metadata Rules

`*-rulebook.md` の Frontmatter 記述ルールを定義します。`meta-*-rulebook.md` を含む rulebook 系ドキュメントに適用します。

## 1. 適用範囲

- 対象: `docs/ja/handbook/rulebooks/` 配下の `*-rulebook.md`
- 参照スキーマ: [docs/shared/schemas/rulebook-frontmatter.schema.yaml](../../../../shared/schemas/rulebook-frontmatter.schema.yaml)

## 2. 必須項目

| 項目   | 説明                     |
| ------ | ------------------------ |
| id     | ドキュメントID           |
| type   | `rulebook` または `meta` |
| status | ドキュメント状態         |

## 3. 推奨項目

| 項目       | 説明                       |
| ---------- | -------------------------- |
| based_on   | 上位規約や根拠ドキュメント |
| supersedes | 置き換え関係               |

補足:

- rulebook 自体は規約を定義する文書のため、`rulebook: none` を推奨する。
- 既存文書との互換運用では、`rulebook` が未記載でもスキーマ上は許容される。

## 4. 値制約

- `id` は `^[a-z0-9][a-z0-9-]*$` に一致する。
- `status` は `draft` / `ready` / `deprecated` に限定する。
- `type` は `rulebook` または `meta` に限定する。

## 5. 記述例

```yaml
---
id: imp-business-rulebook
type: rulebook
status: draft
---
```

## 6. バリデーション

- `npm run -s lint:md` で Markdown を検証する。
- スキーマ検証を行う場合は `rulebook-frontmatter.schema.yaml` を使用する。
