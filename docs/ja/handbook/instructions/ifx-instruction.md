# 外部システムIF一覧 (ESIL) 作成の指示テンプレート

- 以下のスキーマに従って、**外部システムIF一覧（ESIL）** を **YAML 1ファイル**として作成してください。
- 出力は **YAMLのみ** とし、Markdown文章は出力しないでください。
- 参照スキーマ: `docs/handbook/shared/schemas/esil.schema.yaml`
- 禁止: 物理テーブル名・物理カラム名・SQL全文、実装クラス/関数名、APIの内部実装詳細、UI操作の逐語列挙
- `id` は `ifx-...`、`type` は `api`、`status` は `draft/ready/deprecated` のいずれかにしてください。
- `interfaces` は 1件以上作成し、各要素は以下の制約に従ってください：
  - `direction`: `source_to_target` / `target_to_source` / `bidirectional`
  - `kind`: `API` / `ファイル` / `メッセージ`
  - `format`: `CSV` / `JSON` / `XML` / `その他` / `TBD`
  - `spec_ref` は可能なら `ifx-api-...` / `ifx-file-...` / `ifx-msg-...` を設定し、不明なら `TBD` としてください。
