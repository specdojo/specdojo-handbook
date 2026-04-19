---
name: upsert-rulebook
description: 'docs/ja/handbook/rulebooks` 配下の `*-rulebook.md` を新規作成または更新するための Skill です。'
---

# SKILL: upsert-rulebook

`docs/ja/handbook/rulebooks` 配下の `*-rulebook.md` を新規作成または更新するための Skill です。

## 使いどころ

- 新しい `*-rulebook.md` を新規作成したいとき
- 既存の `*-rulebook.md` を `meta-rulebook-structure-rulebook.md` に準拠させたいとき
- 章構成や記述品質の整合性を確認・修正したいとき
- docs-contents-guide や deliverables catalog に定義されているドキュメントの rulebook を起こしたいとき
- 成果物ファイル（`sample-gcs-product/` 配下等）を開いた状態から、対応する rulebook を逆生成したいとき

## 前提

- 共通運用ルール: `@file:.github/instructions/rulebook.instructions.md`
- 章構成基準: `docs/ja/handbook/rulebooks/meta-rulebook-structure-rulebook.md`
- メタ情報ルール（種別別）:
  - `docs/ja/handbook/rulebooks/meta-rulebook-metadata-rulebook.md`
  - `docs/ja/handbook/rulebooks/meta-deliverable-metadata-rulebook.md`
  - `docs/ja/handbook/rulebooks/meta-instruction-metadata-rulebook.md`
- 命名ルール: `docs/ja/handbook/rulebooks/meta-id-and-file-naming-rulebook.md`
- Frontmatter スキーマ: `docs/shared/schemas/rulebook-frontmatter.schema.yaml`
- ドキュメント内容ガイド: `docs/ja/handbook/guidelines/docs-contents-guide.md`
- 対象除外: `meta-*-rulebook.md` は本 Skill の対象外

## 引数仕様（複数対象対応）

- `/upsert-rulebook <file1> <file2> ...` のような複数指定を受け付ける。
- 区切りはスペース / 改行 / カンマを受け付ける。
- 相対パスと絶対パスの両方を受け付ける。
- `-rulebook.md` を含む完全指定と、`-rulebook.md` を省略した短縮指定の両方を受け付ける。
  - 例: `imp-business-rulebook.md`（`docs/ja/handbook/rulebooks/imp-business-rulebook.md` として解釈）
  - 例: `imp-business`（`docs/ja/handbook/rulebooks/imp-business-rulebook.md` として解釈）
- 同一対象の重複指定は 1 件に正規化する。
- 引数なしの場合は、現在開いているファイルを単一対象として扱う。

## 複数対象の実行ルール

- 正規化後の対象を 1 ファイルずつ独立に判定し、順次実行する。
- `meta-*-rulebook.md` に該当する対象は、その対象のみスキップする。
- ある対象で失敗しても他対象の処理は継続する。
- 最後に対象ごとの結果（更新 / 新規 / スキップ / 失敗）を一覧で出力する。

## 入力情報の収集

rulebook を書くには、対象ドキュメントの **目的・構成・記述粒度** を理解する必要がある。
以下の順で情報を収集する。

1. **docs-contents-guide.md** — 対象ドキュメントの目的・主な内容・略称を確認
2. **既存の類似 rulebook** — 同カテゴリの rulebook を読み、粒度・章構成のパターンを把握
   - index 系: `bes-index-rulebook.md`, `nfr-index-rulebook.md`, `utc-index-rulebook.md` 等
   - 個別系: `bes-rulebook.md`, `bps-rulebook.md`, `br-rulebook.md` 等
   - Mermaid 系: `cdfd-mermaid-rulebook.md`, `ccd-mermaid-rulebook.md` 等
3. **対応する sample** — `../samples/<name>-sample.md` があれば参照（記述例の粒度把握）
4. **対応する instruction** — `../instructions/<name>-instruction.md` があれば参照

## 実行フロー（通常）

1. 引数有無を判定し、対象一覧を正規化する（未指定時は開いている 1 件）
2. 対象を 1 ファイルずつ順に処理する
3. 各対象 `*-rulebook.md` の既存有無を確認する
4. 既存の場合: `meta-rulebook-structure-rulebook.md` との差分を洗い出す
5. 新規の場合: docs-contents-guide から目的・内容を抽出し、類似 rulebook を参考に構成を決める
6. 標準章構成に従い、新規作成またはアップサートを行う
7. `サンプル` のリンクと `生成 AI への指示テンプレート` のリンクを更新する
8. 対象ごとの結果を集約して出力する
9. `npm run -s lint:md` で検証する

## 記述規約の適用方針

- rulebook の章構成、記述品質、禁止事項、最終チェックは `@file:.github/instructions/rulebook.instructions.md` を正とする。
- 本 Skill では、対象解決・情報収集・実行順序・失敗時継続などの実行オーケストレーションのみを定義する。
- 規約の再掲は避け、記述内容の判断が必要な場合は共通運用ルールを参照して決定する。

## 実行フロー（成果物からの逆生成）

開いているファイルが rulebook の適用対象となる **成果物**（`sample-gcs-product/` 配下のドキュメントや、プロジェクト固有の成果物）の場合、その構造を分析して対応する `*-rulebook.md` を逆生成する。

### 対象ファイルから rulebook を特定する方法

以下のシグナルを **優先順の高い順** に使い、対応するプレフィックスと rulebook ファイルを特定する。

1. **ファイル名プレフィックス**（最優先）
   - `cdfd-010-xxx.md` → プレフィックス `cdfd-` → `cdfd-rulebook.md`
   - `meta-id-and-file-naming-rulebook.md` の「プレフィックス表」で照合する
2. **Frontmatter の `id` フィールド**
   - `id: bes-order-flow` → プレフィックス `bes-` → `bes-rulebook.md`
   - `sample-gcs-product/` のファイルは frontmatter を持たない場合があるため、次の手段へ
3. **親ディレクトリ名**（補助）
   - `040-単体テスト/サンプル.md` → 「単体テスト」 → 「種別」列で逆引き → `utc-`
   - ファイル名が `サンプル.md` や `README.md` 等の汎用名の場合に使う
4. **ファイル内容のパターン分析**（最終手段）
   - Mermaid ブロックが主体 → `*-mermaid-rulebook.md` を候補とする
   - 表形式の一覧が主体 → `*-index-rulebook.md` を候補とする

### 逆生成の手順

1. **対象特定**: 上記シグナルで対応する `<prefix>-rulebook.md` を特定する
2. **既存 rulebook の確認**: `docs/ja/handbook/rulebooks/<prefix>-rulebook.md` が存在するか確認
   - 存在する場合 → 成果物の実態と rulebook の乖離を分析し、差分アップサートへ
   - 存在しない場合 → 新規作成へ
3. **成果物の構造分析**: 開いているファイルから以下を抽出する
   - 見出し構造（H1/H2/H3 のパターン → `本文構成（標準テンプレ）` の候補）
   - 表のカラム構成（→ `記述ガイド` の推奨表カラム）
   - Mermaid ブロックの有無と種類（→ `位置づけと用語定義` の図示や `記述ガイド` に反映）
   - Frontmatter 項目（→ `推奨 Frontmatter 項目` の根拠）
4. **同カテゴリの成果物を追加確認**: 同じディレクトリ内の他ファイルも 2〜3 件読み、パターンの共通性を確認する
5. **docs-contents-guide との照合**: 抽出した構造が docs-contents-guide の記述と整合するか確認
6. **rulebook の生成/更新**: 通常フローの手順 4〜6 に合流し、標準章構成に従って作成する

## 生成・更新時の補助ルール

- 通常フロー手順 6 で必要になる章構成、記述ガイド、禁止事項、最終チェックは `@file:.github/instructions/rulebook.instructions.md` を参照する。
- docs-contents-guide の記述が短い場合は、類似 rulebook と一般的開発知見で補完する。
- ただし、実装依存の詳細（SQL 全文、具体クラス名、詳細 API 設計）には踏み込まない。

## 出力

- 対象ごとの結果（更新 / 新規 / スキップ / 失敗）
- 変更ファイル一覧
- 実行時に参照した根拠（docs-contents-guide と類似 rulebook）
- `npm run -s lint:md` の結果
