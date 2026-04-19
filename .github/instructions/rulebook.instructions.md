# Rulebook 作成運用ルール

このファイルは、`docs/ja/handbook/rulebooks` 配下の `*-rulebook.md` を作成/更新するための共通運用ルールです。
章立ては `meta-rulebook-structure-rulebook.md` に従い、構成・見出し順・必須要素を統一します。

## 1. 目的と適用範囲

- 目的は、`*-rulebook.md` の章構成と記述品質を統一し、参照・保守を容易にすること。
- 本ルールは `docs/ja/handbook/rulebooks/` 配下の `*-rulebook.md` の作成/更新に適用する。
- `meta-*-rulebook.md` は本ルールの対象外とし、個別の meta ルールで管理する。

## 2. 入力情報

- 対象ファイル: `docs/ja/handbook/rulebooks/<name>-rulebook.md`
- 構成基準: `docs/ja/handbook/rulebooks/meta-rulebook-structure-rulebook.md`
- ファイル名・ディレクトリ構成基準: `docs/ja/handbook/guidelines/docs-structure-guide.md`
- Frontmatter スキーマ: `docs/shared/schemas/rulebook-frontmatter.schema.yaml`
- メタ情報ルール（種別別）:
  - `docs/ja/handbook/rulebooks/meta-rulebook-metadata-rulebook.md`
  - `docs/ja/handbook/rulebooks/meta-deliverable-metadata-rulebook.md`
- 参照先（必要に応じて）: `[*-sample](../samples/*-sample.md)`、`[*-instruction](../instructions/*-instruction.md)`

## 3. 出力仕様（Frontmatter と命名）

- ファイル名は `<name>-rulebook.md` とする。
- ファイル先頭に YAML Frontmatter を置き、最低限 `id` / `type` / `status` を含める。
- rulebook の Frontmatter は `docs/ja/handbook/rulebooks/meta-rulebook-metadata-rulebook.md` に従う。
- `rulebook` は推奨項目として扱い、原則 `none` を記載する。
- `id` は英小文字・数字・ハイフンのみを使用し、一意にする。
- H1 はファイル内で 1 つだけとし、タイトルとして使用する。
- タイトル直下に英語名（1行）と目的・概要（1〜3文）を置く。
- `target_format` が `yaml` / `json` / `markdown` のいずれかを確認し、本文ルールを対象フォーマットに合わせる。
- `target_format` が未記載の場合は、本文・サンプルリンク・記述例から対象フォーマットを推測し、推測結果に合わせて本文ルールを適用する。

補足:

- `target_format: markdown` の場合は、対象ドキュメントの先頭に置く Frontmatter を `推奨 Frontmatter 項目` に記載する。
- `target_format: yaml` または `target_format: json` の場合は、対象データの先頭メタ項目（例: `id` / `type` / `status` など）を `推奨 Frontmatter 項目` と同章で扱ってよい。
- `target_format` 未記載時の推測は次の優先順位で行う。
  1. `サンプル` 章の参照拡張子（`.md` / `.yaml` / `.json`）
  2. 本文の記述例（YAMLブロック、JSONオブジェクト、Markdown章構成）
  3. 章内の用語（Frontmatter 前提か、先頭メタ項目前提か）

## 4. 標準章構成（必須）

- `docs/ja/handbook/rulebooks/meta-rulebook-structure-rulebook.md` の標準章構成に従う。
- 章番号は `## 1.` からの連番とし、スキップしない。
- 不要章を省略する場合は、省略理由を本文に明記する。

| 章番号 | 章タイトル                   | 必須 |
| ------ | ---------------------------- | ---- |
| 1      | 全体方針                     | ○    |
| 2      | 位置づけと用語定義           | 任意 |
| 3      | ファイル命名・ID規則         | ○    |
| 4      | 推奨 Frontmatter 項目        | 任意 |
| 5      | 本文構成（標準テンプレ）     | ○    |
| 6      | 記述ガイド                   | ○    |
| 7      | 禁止事項                     | ○    |
| 8      | サンプル                     | ○    |
| 9      | 生成 AI への指示テンプレート | ○    |

補足:

- `位置づけと用語定義`については、用語定義がない場合は章タイトルは`位置づけ`とする。

## 5. 記述ルール

- 各章は「何を定義する章か」が判定できる粒度で記述する。
- `本文構成（標準テンプレ）` には、対象ドキュメントの章構成を表で示し、必須/任意を明示する。
- `記述ガイド` には、章ごとの書き方、推奨表、記載例を置く。
- 共通事項は上位ドキュメントを SSOT とし、重複記載を避ける。
- 章への参照は章番号ではなく章タイトルで記載する（例: `本文構成（標準テンプレ）` のようにタイトルで参照する）。
- 用語はファイル内で統一し、`index` / `overview` などの命名ゆれを持ち込まない。
- 未確定事項や仮置き情報がある場合は、`*-rulebook.md` 本文の中に `_TODO_:` / `_UNDECIDED_:` / `_ASSUMPTION_:` を直接記述する。
- 対象ドキュメントで未確定事項や仮置き情報を扱う必要がある場合は、共通ラベルとして `_TODO_:` / `_UNDECIDED_:` / `_ASSUMPTION_:` のみを使用してよい。
- 各ラベルの意味は以下のとおりとする。
  - `_TODO_:` 後で人または生成 AI が確認・追記・修正する必要がある事項
  - `_UNDECIDED_:` 情報不足ではなく、意思決定が未了で未確定の事項
  - `_ASSUMPTION_:` 現時点で仮置きしている前提・仮説
- ラベルは確定事項を書くためには使用せず、未確定・暫定・補助的な情報を明示するためにのみ使用する。
- 確定した内容はラベルを外し、通常の本文として記述する。
- `*_rules.md` 自体にラベル運用を記載する場合は、対象ドキュメントにとって必要な場合のみ記載し、不要な rules には機械的に追加しない。
- ラベルを記載する場合は、本文の補助として箇条書き内に記述し、ラベル自体を章構成や見出しとして扱わない。
- `推奨 Frontmatter 項目` は `docs/ja/handbook/rulebooks/meta-deliverable-metadata-rulebook.md` に従う。
- `target_format` が `yaml` / `json` の場合は、`推奨 Frontmatter 項目` 章に「Frontmatter と同等の先頭メタ項目」として記載してよい。
- `target_format` が `yaml` / `json` の場合は、`推奨 Frontmatter 項目` 章の冒頭に「Frontmatter と同等の先頭メタ項目を対象データ先頭に定義する」旨を明記する。
- `target_format` が `yaml` / `json` の場合は、`本文構成（標準テンプレ）` 章でルートキーと必須キーを明示し、必要に応じてネスト構造（例: `entities` / `fields`）まで表で定義する。
- `target_format` が `yaml` / `json` の場合は、`記述ガイド` 章で命名規則・参照規則・型制約（`enum` / `pattern` / `required` など）を、対象フォーマットでそのまま実装可能な粒度で記載する。
- `ファイル命名・ID規則` でのファイル名及びディレクトリ名は以下のルールに従う
  - ファイル名およびディレクトリ名は、`docs/ja/handbook/guidelines/docs-structure-guide.md` のディレクトリ構成に従う。
  - 命名は英語名称を推奨し、日本語名称も可とする。
  - 日本語名称を採用する場合は、同一ディレクトリ内で一貫した命名規約を維持し、Frontmatter の `id` と対応関係を明確にする。
- `サンプル`には、ファイルが存在する場合は、`target_format` に合わせて次のいずれかでリンクを記載する。
  - Markdown の場合: `- 参照先: [<name>-sample](../samples/<name>-sample.md)`
  - YAML の場合: `- 参照先: [<name>-sample](../samples/<name>-sample.yaml)`
  - JSON の場合: `- 参照先: [<name>-sample](../samples/<name>-sample.json)`
    存在しない場合は「サンプル未作成。作成後にリンクを追記する」と記載する。
- `生成 AI への指示テンプレート` には、ファイルが存在する場合は、`- 参照先: [<name>-instruction](../instructions/<name>-instruction.md)`でリンクを記載する。
  存在しない場合は「instruction 未作成。作成後にリンクを追記する」と記載する。

### 5.1. 内容充実化ルール（薄いドキュメント防止）

- 各必須章には、最低 3 つ以上の具体項目（箇条書きまたは表項目）を置く。
- 「適切に」「十分に」などの抽象語だけで終わらせず、判断可能な条件を書く。
- 少なくとも 1 つは、推奨表のカラム定義（例: ID、目的、条件、判定基準、担当）を提示する。
- 次の観点の欠落有無を確認する。
  - 要求の明確性（目的、対象範囲、責務境界）
  - 品質特性（性能、可用性、保守性、セキュリティ、操作性）
  - テスト/受入（検証観点、合格基準、証跡）
  - 運用/保守（監視、障害時対応、変更時の扱い）
  - トレーサビリティ（上位/下位ドキュメントへの導線）
- docs-contents-guide の記述が短い場合でも、類似 rulebook と一般的開発知見で必要観点を補完する。
- PMBOK 成果物観点（立上げ/計画/監視・統制/終結）で不足がないか確認し、対象外とする観点は理由を明記する。
- ただし、実装依存の詳細（SQL 全文、具体クラス名、詳細 API 設計）には踏み込まない。

## 6. 禁止事項

- 章番号なし見出し（例: `## 全体方針`）を使用しない。
- 章番号末尾の `.` を省略しない。
- 章参照を番号のみ（例: `§5` / `第5章`）で記述しない。
- rules 本文に実装詳細（SQL 全文、具体クラス名、詳細 API 設計）を書かない。
- 曖昧語（十分、適切、問題ない）を根拠なく使用しない。
- `meta-*-rulebook.md` を本ルールで機械的に上書きしない。
- `_TODO_:` / `_UNDECIDED_:` / `_ASSUMPTION_:` 以外の独自ラベルを、共通ルール未定義のまま追加しない。
- 確定済みの内容をラベル付きのまま放置しない。
- ラベルを本文の代替として多用し、対象ドキュメントの確定記述を不足させない。

## 7. 作成・更新手順

1. 対象 `*-rulebook.md` を特定し、既存ファイル有無を確認する。
2. 構成基準（`docs/ja/handbook/rulebooks/meta-rulebook-structure-rulebook.md`）との差分を洗い出す。
3. 新規作成またはアップサートで章構成と記述を反映する。
4. sampleファイルが存在する場合は、サンプルリンクを更新する。
5. instructionファイルが存在する場合は、instruction リンクを更新する。
6. 変更点を要約し、最終チェック結果を記録する。

## 8. 最終チェック

- Frontmatter がスキーマ要件（`id` / `type` / `status`）を満たしている。
- 章構成が `## 1.` からの連番で、必須章が欠落していない。
- `サンプル` と `生成 AI への指示テンプレート` が存在し、リンクが有効。
- 禁止事項に該当する記述がない。
- `npm run -s lint:md` を実行し、エラーがない。
- `target_format` が `yaml` / `json` の場合は、対応する sample が schema と整合することを確認する。
  - schema がある場合は `npm run validate:schema:file -- --schema <schema-path> --data <sample-path>` を実行する。
