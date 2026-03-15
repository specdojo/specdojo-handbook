# 外部メッセージ仕様 (EMS) 作成の指示テンプレート

- 以下のルールに従って、**外部メッセージ仕様（EMS）**を **AsyncAPI + CloudEvents（YAML 1ファイル）**として作成してください。
- 出力は **YAMLのみ** とし、Markdown文章は出力しないでください。
- AsyncAPIは **2.6.0**、CloudEventsは **1.0** を前提にしてください。
- `x-spec-meta` を必ず含め、`id`（`ifx-msg-...`）、`type`（`message`）、`status`（`draft`/`ready`/`deprecated`）を設定してください。
- `channels` を1つ以上定義し、publish/subscribe のいずれか（または両方）を明示してください。
- CloudEvents属性（`specversion/type/source/id/time/datacontenttype`）を必須として、payloadを設計してください。
- `data` のスキーマは `components/schemas` に定義し、`$ref` で参照してください。
- `data` のプロパティ名は snake_case（例: `product_id`, `current_quantity`）で統一してください。
- 禁止: 連携先/連携元の内部実装詳細、DB物理テーブル/物理カラム名、SQL全文、実装クラス/関数名、UI操作の逐語列挙
