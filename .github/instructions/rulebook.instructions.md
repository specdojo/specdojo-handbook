# Rules 作成運用ルール

このファイルは、`docs/ja/handbook/rulebooks` 配下の `*-rulebook.md` を作成/更新するための共通運用ルールです。
章立ては `meta-rulebook-structure-rulebook.md` に従い、構成・見出し順・必須要素を統一します。

## 1. 目的と適用範囲

- 目的は、`*-rulebook.md` の章構成と記述品質を統一し、参照・保守を容易にすること。
- 本ルールは `docs/ja/handbook/rulebooks/` 配下の `*-rulebook.md` の作成/更新に適用する。
- `meta-*-rulebook.md` は本ルールの対象外とし、個別の meta ルールで管理する。

## 2. 入力情報

- 対象ファイル: `docs/ja/handbook/rulebooks/<name>-rulebook.md`
- 構成基準: `docs/ja/handbook/rulebooks/meta-rulebook-structure-rulebook.md`
- Frontmatter スキーマ: `docs/shared/schemas/rulebook-frontmatter.schema.yaml`
- メタ情報ルール（種別別）:
  - `docs/ja/handbook/rulebooks/meta-rulebook-metadata-rulebook.md`
  - `docs/ja/handbook/rulebooks/meta-deliverable-metadata-rulebook.md`
  - `docs/ja/handbook/rulebooks/meta-instruction-metadata-rulebook.md`
- 参照先（必要に応じて）: `../samples/*-sample.md`、`../instructions/*-instruction.md`

## 3. 出力仕様（Frontmatter と命名）

- ファイル名は `<name>-rulebook.md` とする。
- ファイル先頭に YAML Frontmatter を置き、最低限 `id` / `type` / `status` を含める。
- `rulebook` は推奨項目として扱い、原則 `none` を記載する。
- `id` は英小文字・数字・ハイフンのみを使用し、一意にする。
- H1 はファイル内で 1 つだけとし、タイトルとして使用する。
- タイトル直下に英語名（1行）と目的・概要（1〜3文）を置く。

## 4. 標準章構成（必須）

- `meta-rulebook-structure-rulebook.md` の標準章構成に従う。
- 章番号は `## 1.` からの連番とし、スキップしない。
- 不要章を省略する場合は、省略理由を本文に明記する。

| 章番号 | 章タイトル                         | 必須 |
| ------ | ---------------------------------- | ---- |
| 1      | 全体方針                           | ○    |
| 2      | 位置づけと用語定義（必要に応じて） | 任意 |
| 3      | ファイル命名・ID規則               | ○    |
| 4      | 推奨 Frontmatter 項目              | 任意 |
| 5      | 本文構成（標準テンプレ）           | ○    |
| 6      | 記述ガイド                         | ○    |
| 7      | 禁止事項                           | ○    |
| 8      | サンプル（最小でも可）             | ○    |
| 9      | 生成 AI への指示テンプレート       | ○    |

## 5. 記述ルール

- 各章は「何を定義する章か」が判定できる粒度で記述する。
- `## 5. 本文構成（標準テンプレ）` には、対象ドキュメントの章構成を表で示し、必須/任意を明示する。
- `## 6. 記述ガイド` には、章ごとの書き方、推奨表、記載例を置く。
- 共通事項は上位ドキュメントを SSOT とし、重複記載を避ける。
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

## 6. 禁止事項

- 章番号なし見出し（例: `## 全体方針`）を使用しない。
- 章番号末尾の `.` を省略しない。
- rules 本文に実装詳細（SQL 全文、具体クラス名、詳細 API 設計）を書かない。
- 曖昧語（十分、適切、問題ない）を根拠なく使用しない。
- `meta-*-rulebook.md` を本ルールで機械的に上書きしない。
- `_TODO_:` / `_UNDECIDED_:` / `_ASSUMPTION_:` 以外の独自ラベルを、共通ルール未定義のまま追加しない。
- 確定済みの内容をラベル付きのまま放置しない。
- ラベルを本文の代替として多用し、対象ドキュメントの確定記述を不足させない。

## 7. 作成・更新手順

1. 対象 `*-rulebook.md` を特定し、既存ファイル有無を確認する。
1. 構成基準（meta-rulebook-structure）との差分を洗い出す。
1. 新規作成またはアップサートで章構成と記述を反映する。
1. サンプルリンクと instruction リンクを更新する。
1. 変更点を要約し、最終チェック結果を記録する。

## 8. 最終チェック

- Frontmatter がスキーマ要件（`id` / `type` / `status`）を満たしている。
- 章構成が `## 1.` からの連番で、必須章が欠落していない。
- `## 8. サンプル（最小でも可）` と `## 9. 生成 AI への指示テンプレート` が存在し、リンクが有効。
- 禁止事項に該当する記述がない。
- `npm run -s lint:md` を実行し、エラーがない。
