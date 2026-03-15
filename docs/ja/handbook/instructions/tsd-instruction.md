# 技術スタック一覧 (TSL) 作成の指示テンプレート

- 以下のルールに従って、**技術スタック一覧（TSL）** を **Frontmatter + Markdownの表**として作成してください。
- 出力は **Frontmatter と 表（Markdown）だけ** とし、前後の説明文は出力しないでください。
- Frontmatter は `docs/handbook/shared/schemas/spec-frontmatter.schema.yaml` に従い、`id`/`type`/`title`/`status` を必ず含め、`type` は `architecture` 固定にしてください。
- 列は `区分` / `採用技術` / `担当責務` を必ず含めてください（必要なら `補足` を追加可）。
- 禁止: 物理テーブル名・物理カラム名・SQL全文、実装クラス/関数名、内部モジュール構成、UI操作の逐語列挙、機密値
