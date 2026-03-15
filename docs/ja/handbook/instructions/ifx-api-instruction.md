# 外部API仕様 (EAPIS) 作成の指示テンプレート

- 以下のルールに従って、**外部API仕様（EAPIS）**を **OpenAPI（YAML 1ファイル）**として作成してください。
- 出力は **YAMLのみ** とし、Markdown文章は出力しないでください。
- OpenAPIは **3.0.3** を使用してください。
- `x-spec-meta` を必ず含め、`id`（`ifx-api-...`）、`type`（`api`）、`status`（`draft`/`ready`/`deprecated`）を設定してください。
- `paths` を1つ以上定義し、各operationに `operationId` を設定してください。
- `components/schemas` にリクエスト/レスポンススキーマを定義し、`$ref` で参照してください。
- **payloadのプロパティ名は snake_case**（例: `order_id`, `payment_status`）で統一してください。
- `400/401/500` のエラーレスポンスを最低限定義し、`ErrorResponse` を共通化してください。
