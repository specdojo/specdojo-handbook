# 外部ファイル連携仕様 (EFES) 作成の指示テンプレート

- 以下のルールに従って EFES を **YAML 1ファイル**で作成してください（**出力はYAMLのみ**）。
- `x-spec-meta.id` は `ifx-file-...`、`x-spec-meta.type` は `file`、`status` は `draft|ready|deprecated`。
- `file` / `source` / `target` / `direction` / `format` / `timing` / `transport` / `schema` を必ず含める。
- `schema.fields` を1件以上。各要素に `name` / `type` / `required` を必ず設定。`type: enum` の場合は `enum` 必須。
- `format` が `CSV|TSV` なら `schema.csv`、`JSON` なら `schema.json`、`XML` なら `schema.xml` を必ず含める。
- 可能な範囲で `mapping`（CSV列名 / JSON Pointer / XPath）を各フィールドに付与する。
- 禁止: 機密値、内部実装詳細、DB物理名、SQL全文、実装クラス/関数名、UI操作の逐語列挙。
