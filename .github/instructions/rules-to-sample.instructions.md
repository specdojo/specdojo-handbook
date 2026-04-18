# Rules→Sample 変換運用ルール

このファイルは、`docs/ja/handbook/rulebooks` 配下の `*-rulebook.md` に従い、
対応する `docs/ja/handbook/samples/*-sample.md` もしくは `docs/ja/handbook/samples/*-sample.yaml` を作成/更新するための共通運用ルールです。

## 1. 目的

- ルール更新時に、サンプル（sample）への反映漏れを防ぐ
- ルールに基づく最小サンプルを、毎回ゼロから作らずに再利用可能にする
- ルール本文とサンプル本文の責務境界を維持する

## 2. 入出力の対応

- 入力: `docs/ja/handbook/rulebooks/<name>-rulebook.md`
- 出力: `docs/ja/handbook/samples/<name>-sample.md` もしくは `docs/ja/handbook/samples/<name>-sample.yaml`

対応原則:

- `<name>` は同一（例: `utc-index-rulebook.md` → `utc-index-sample.md`）
- `meta-*-rulebook.md` は sample 変換対象外（新規作成/更新ともに行わない）
- 対応先が存在しない場合は新規作成
- 対応先が存在する場合はアップサート（差分反映）
- sample の形式は、対象が文書テンプレート・記述例なら `*.md`、schema を持つ SSOT データ例なら `*.yaml` を優先する
- `*-rulebook.md` 側の「サンプル（最小でも可）」セクションのリンク先も、対応する sample の実拡張子（`.md` または `.yaml`）に一致させる

## 3. 前提プロジェクト（固定）

- sample は、**駄菓子屋の販売管理システムを構築するプロジェクト** を前提に記述する。
- 登場する業務文脈、用語、サンプルデータは上記前提に整合させる。
- 他業種（医療、製造、金融など）や無関係ドメインの題材を混在させない。

## 4. 変換方針（必須）

1. `rules` をそのまま複製せず、**ルールに準拠した記述例（sample）** として再構成する
2. ルールの必須要件（見出し順、必須表、禁止事項の回避）を sample 側で満たす
3. 参照元ルールの語彙と整合する（`index`/`overview` などの命名ゆれを持ち込まない）
4. 曖昧語（十分/適切/問題ない）を避け、読み手が意図を判定できる記述にする
5. 不要な実装依存情報（SQL 全文、具体クラス名等）は追加しない
6. `*-rulebook.md` 側の「サンプル（最小でも可）」セクションは、対応する `*-sample.md` または `*-sample.yaml` へのリンクを記載し、最小サンプル本文は保持しない
7. sample が YAML の場合は、対応する schema があればそれも参照し、構造・必須項目・制約を sample 側へ反映する
8. sample が YAML の場合は、rules だけでなく schema を一次制約として扱い、`required` / `type` / `enum` / `pattern` / `additionalProperties` を確認する
9. sample が YAML の場合の schema 検証は、インストール済みの `ajv` を使って実行する

## 5. 生成する sample の推奨構成

Markdown sample の場合:

1. Frontmatter（`id` / `type` / `status`）
2. タイトル（H1）
3. 本文構成（rules の標準テンプレに準拠）
4. 最小限の表・記述例（必須要素を満たす）
5. 補足メモ（任意。必要な場合のみ）

YAML sample の場合:

1. 対応 schema に準拠したルート構造
2. 必須項目を満たす最小限のサンプルデータ
3. rules で要求される命名規則・粒度・禁止事項を反映した値
4. 必要に応じた最小限のコメントまたは補足メモ

補足:

- schema が存在する場合は、その schema に定義されたキー名・型・制約を sample に反映する
- schema が存在しない場合は、rules に記載された構造・必須項目・命名規則を基準に sample を作成する

## 6. 変更時の整合チェック

- `rules` 側で追加された「必須章」「必須表」「必須観点」を sample 側へ反映
- 章番号と見出し名称の整合を確認
- sample の業務文脈が「駄菓子屋の販売管理システム構築プロジェクト」に整合していることを確認
- sample が rules の禁止事項に抵触していないことを確認
- `rules` 側の「サンプル（最小でも可）」セクションは、リンクのみで運用され最小サンプル本文が削除されており、リンク先拡張子が sample 実体と一致していることを確認
- sample が YAML の場合は、対応 schema の必須項目・型・enum・pattern・additionalProperties に沿っていることを最後に確認する
- sample が Markdown の場合は Markdown lint を実行する
- sample が YAML の場合は YAML 構文と schema 準拠を `ajv validate` で検証する

推奨コマンド:

- `npm run -s lint:md`
- schema がある YAML sample は、`npm run validate:schema:file -- --schema <schema-path> --data <sample-path>` で確認する
