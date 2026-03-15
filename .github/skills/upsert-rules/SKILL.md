# SKILL: upsert-rules

`docs/ja/handbook/rules` 配下の `*-rules.md` を新規作成または更新するための Skill です。

## 使いどころ

- 新しい `*-rules.md` を新規作成したいとき
- 既存の `*-rules.md` を `meta-rulebook-structure-rules.md` に準拠させたいとき
- 章構成や記述品質の整合性を確認・修正したいとき
- docs-contents-guide や deliverables catalog に定義されているドキュメントの rules を起こしたいとき
- 成果物ファイル（`sample-gcs-product/` 配下等）を開いた状態から、対応する rules を逆生成したいとき

## 前提

- 共通運用ルール: `@file:.github/instructions/rules.instructions.md`
- 章構成基準: `docs/ja/handbook/rules/meta-rulebook-structure-rules.md`
- メタ情報ルール: `docs/ja/handbook/rules/meta-document-metadata-rules.md`
- 命名ルール: `docs/ja/handbook/rules/meta-id-and-file-naming-rules.md`
- Frontmatter スキーマ: `docs/shared/schemas/spec-frontmatter.schema.yaml`
- ドキュメント内容ガイド: `docs/ja/handbook/guidelines/docs-contents-guide.md`
- 対象除外: `meta-*-rules.md` は本 Skill の対象外

## 入力情報の収集

rules を書くには、対象ドキュメントの **目的・構成・記述粒度** を理解する必要がある。
以下の順で情報を収集する。

1. **docs-contents-guide.md** — 対象ドキュメントの目的・主な内容・略称を確認
2. **既存の類似 rules** — 同カテゴリの rules を読み、粒度・章構成のパターンを把握
   - index 系: `bes-index-rules.md`, `nfr-index-rules.md`, `utc-index-rules.md` 等
   - 個別系: `bes-rules.md`, `bps-rules.md`, `br-rules.md` 等
   - Mermaid 系: `cdfd-mermaid-rules.md`, `ccd-mermaid-rules.md` 等
3. **対応する sample** — `../samples/<name>-sample.md` があれば参照（記述例の粒度把握）
4. **対応する instruction** — `../instructions/<name>-instruction.md` があれば参照

## 実行フロー（通常）

1. 対象 `*-rules.md` を特定し、既存ファイル有無を確認する
2. 既存の場合: `meta-rulebook-structure-rules.md` との差分を洗い出す
3. 新規の場合: docs-contents-guide から目的・内容を抽出し、類似 rules を参考に構成を決める
4. 標準章構成に従い、新規作成またはアップサートを行う
5. サンプルリンク（`## 8.`）と instruction リンク（`## 9.`）を更新する
6. `npm run -s lint:md` で検証する

## 実行フロー（成果物からの逆生成）

開いているファイルが rules の適用対象となる **成果物**（`sample-gcs-product/` 配下のドキュメントや、プロジェクト固有の成果物）の場合、その構造を分析して対応する `*-rules.md` を逆生成する。

### 対象ファイルから rules を特定する方法

以下のシグナルを **優先順の高い順** に使い、対応するプレフィックスと rules ファイルを特定する。

1. **ファイル名プレフィックス**（最優先）
   - `cdfd-010-xxx.md` → プレフィックス `cdfd-` → `cdfd-rules.md`
   - `meta-id-and-file-naming-rules.md` §14 のプレフィックス表で照合する
2. **Frontmatter の `id` フィールド**
   - `id: bes-order-flow` → プレフィックス `bes-` → `bes-rules.md`
   - `sample-gcs-product/` のファイルは frontmatter を持たない場合があるため、次の手段へ
3. **親ディレクトリ名**（補助）
   - `040-単体テスト/サンプル.md` → 「単体テスト」 → §14 の種別列で逆引き → `utc-`
   - ファイル名が `サンプル.md` や `README.md` 等の汎用名の場合に使う
4. **ファイル内容のパターン分析**（最終手段）
   - Mermaid ブロックが主体 → `*-mermaid-rules.md` を候補とする
   - 表形式の一覧が主体 → `*-index-rules.md` を候補とする

### 逆生成の手順

1. **対象特定**: 上記シグナルで対応する `<prefix>-rules.md` を特定する
2. **既存 rules の確認**: `docs/ja/handbook/rules/<prefix>-rules.md` が存在するか確認
   - 存在する場合 → 成果物の実態と rules の乖離を分析し、差分アップサートへ
   - 存在しない場合 → 新規作成へ
3. **成果物の構造分析**: 開いているファイルから以下を抽出する
   - 見出し構造（H1/H2/H3 のパターン → §5 本文構成の候補）
   - 表のカラム構成（→ §6 記述ガイドの推奨表カラム）
   - Mermaid ブロックの有無と種類（→ §2 の図示や §6 のガイドに反映）
   - Frontmatter 項目（→ §4 推奨 Frontmatter の根拠）
4. **同カテゴリの成果物を追加確認**: 同じディレクトリ内の他ファイルも 2〜3 件読み、パターンの共通性を確認する
5. **docs-contents-guide との照合**: 抽出した構造が docs-contents-guide の記述と整合するか確認
6. **rules の生成/更新**: 通常フローの手順 4〜6 に合流し、標準章構成に従って作成する

## 標準章構成（必須）

| 章番号 | 章タイトル                         | 必須 | 内容の指針                                         |
| ------ | ---------------------------------- | ---- | -------------------------------------------------- |
| 1      | 全体方針                           | ○    | 目的・適用範囲・記載レベルの方針                   |
| 2      | 位置づけと用語定義（必要に応じて） | 任意 | Mermaid で関係を示す、用語定義                     |
| 3      | ファイル命名・ID規則               | ○    | id / ファイル名の命名パターン                      |
| 4      | 推奨 Frontmatter 項目              | 任意 | スキーマと必須/任意の項目                          |
| 5      | 本文構成（標準テンプレ）           | ○    | 対象ドキュメントの標準章構成を表で定義             |
| 6      | 記述ガイド                         | ○    | 章ごとの書き方、推奨表、記載例                     |
| 7      | 禁止事項                           | ○    | してはいけない記述                                 |
| 8      | サンプル（最小でも可）             | ○    | `../samples/<name>-sample.md` へのリンク           |
| 9      | 生成 AI への指示テンプレート       | ○    | `../instructions/<name>-instruction.md` へのリンク |

## 章ごとの記述ガイド

### §1. 全体方針

- 何を記述するドキュメントか（1〜2文）
- どの粒度で書くか（概念レベル / システムレベル / 実装レベル）
- 関連する上位・下位ドキュメントとの責務境界

**判断に迷う場合**: docs-contents-guide の「目的」「主な内容」列を引用し、ここに書くべき範囲を明示する。「この章に何を書くべきか判断できない場合は、docs-contents-guide §X.X の記述を参照」とガイドする。

### §2. 位置づけと用語定義

- 省略可。省略する場合は省略理由を §1 に一言添える。
- 他ドキュメントとの関係が複雑な場合は Mermaid で図示する。

### §3. ファイル命名・ID規則

- `meta-id-and-file-naming-rules.md` §14 のプレフィックス表を参照する。
- id パターン: `<prefix>-<body>` の具体例を示す。
- index 系と個別系がある場合はそれぞれのパターンを示す。

**判断に迷う場合**: `meta-id-and-file-naming-rules.md` §14 に対応するプレフィックスが定義されているか確認。定義がない場合は「命名ルールへのプレフィックス追加が必要。追加候補: `xxx-`」と記載する。

### §4. 推奨 Frontmatter 項目

- 省略可。`meta-document-metadata-rules.md` に準拠する旨を記載する。
- `type` の値を明示する（例: `type: rule`, `type: test` 等）。

### §5. 本文構成（標準テンプレ）

- 対象ドキュメントの章構成を表で定義する。
- 各章が必須か任意かを明示する。
- index 系と個別系で構成が異なる場合はそれぞれ表を用意する。

**判断に迷う場合**: 対象ドキュメントの章構成が不明な場合は、docs-contents-guide の「主な内容」列を章候補として列挙し、「以下は候補。プロジェクト要件に応じて取捨選択する」と注記する。

### §6. 記述ガイド

- 章ごとの書き方を箇条書きまたは表で示す。
- 推奨する表のカラム構成を示す（例: 「以下のカラムを含む表を推奨: ID, 名称, 説明, …」）。
- 記載例がある場合はインラインで示す。

**判断に迷う場合**: 「どの粒度で書くべきか」「表形式 vs 箇条書きのどちらが適切か」を明示する。判断基準が不明の場合は「プロジェクト規模に応じて選択。小規模なら箇条書き、中〜大規模なら表形式を推奨」とガイドする。

### §7. 禁止事項

- 共通禁止事項（実装詳細の混入、曖昧語の使用等）に加え、対象ドキュメント固有の禁止事項を記載する。

### §8. サンプル

- `../samples/<name>-sample.md` が存在する場合はリンクを記載する。
- 存在しない場合は「サンプル未作成。作成後にリンクを追記する」と記載する。

### §9. 生成 AI への指示テンプレート

- `../instructions/<name>-instruction.md` が存在する場合はリンクを記載する。
- 存在しない場合は「instruction 未作成。作成後にリンクを追記する」と記載する。

## 注意事項

- `meta-*-rules.md` は対象外。これらには独自のガバナンスルールが適用される
- 既存 rules は全置換せず、差分アップサートを優先する
- 実装依存の詳細（SQL 全文、具体クラス名、詳細 API 設計）は rules に書かない
- 曖昧語（十分、適切、問題ない）を根拠なく使用しない
- 共通事項は上位ドキュメント（`meta-rulebook-structure-rules.md` 等）を SSOT とし、重複記載を避ける
- 用語はファイル内で統一し、`index` / `overview` などの命名ゆれを持ち込まない

## 最終チェック

- [ ] Frontmatter がスキーマ要件（`id` / `type` / `status`）を満たしている
- [ ] H1 が 1 つだけ存在し、タイトル直下に英語名と目的・概要がある
- [ ] 章構成が `## 1.` からの連番で、必須章（1, 3, 5, 6, 7, 8, 9）が欠落していない
- [ ] `## 5.` に対象ドキュメントの本文構成が表で定義されている
- [ ] `## 8.` にサンプルリンクまたは未作成の旨が記載されている
- [ ] `## 9.` に instruction リンクまたは未作成の旨が記載されている
- [ ] 禁止事項に該当する記述がない
- [ ] `npm run -s lint:md` でエラーがない
