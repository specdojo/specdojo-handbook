# 開いている rules から sample を作成/更新（引数指定対応）

@file:.github/skills/rulebook-to-sample/SKILL.md

`/upsert-sample` 実行時に、ユーザー入力としてファイル名が与えられた場合は
その指定を優先し、対応する `*-sample.md` または `*-sample.yaml` を作成または更新してください。

ファイル名指定がない場合は、現在開いている **1件の `*-rulebook.md`** を対象に
対応する `*-sample.md` または `*-sample.yaml` を作成または更新してください。

引数の解釈ルール:

- `/upsert-sample <file1> <file2> ...` のようなスペース区切りを受け付ける
- 改行区切り・カンマ区切りでも受け付ける
- 相対パスと絶対パスの両方を受け付ける
- `-rulebook.md` を省略した短縮指定を受け付ける（例: `imp-business` → `docs/ja/handbook/rulebooks/imp-business-rulebook.md`）
- 同一ファイルの重複指定は 1 件に正規化する

## 対象

- 引数で 1 件以上のファイルが指定されている場合:
  - 指定された各ファイルを順に評価し、対応する `*-sample.md` または `*-sample.yaml` を作成/更新する
  - `meta-*-rulebook.md` が含まれていたら、そのファイルのみ対象外としてスキップする
- 引数指定がない場合:
  - 現在開いているファイルを単一対象として従来どおり処理する

- 対象 rules は、現在エディタで開いている `*-rulebook.md` とする
- 開いているファイルが `meta-*-rulebook.md` の場合は対象外として処理を中止する

## 対応ルール

- 出力先: `docs/ja/handbook/samples/<name>-sample.md` または `docs/ja/handbook/samples/<name>-sample.yaml`
- 対応先は `rules` と同名の `<name>-sample.md` または `<name>-sample.yaml` とする
  - 例: `utc-index-rulebook.md` → `utc-index-sample.md`
- `meta-*-rulebook.md` は sample 作成/更新の対象外とする
- 対応する sample が存在しない場合は新規作成
- 存在する場合はアップサート（不足項目追記・不整合修正）
- sample の形式は以下で判定する
  - 文書テンプレート・記述例: `*.md`
  - schema を持つ SSOT データ例: `*.yaml`

複数対象を処理する場合の追加ルール:

- 1 ファイルずつ独立に判定・更新する
- ある対象で失敗しても、他対象の処理は継続する
- 最後に対象ごとの結果（更新/新規/スキップ/失敗）を一覧で報告する

## 生成要件

- 見出し順・必須項目・必須表・禁止事項・最終チェックを rules と整合させる
- 業務文脈は「駄菓子屋の販売管理システム構築プロジェクト」に統一する
- 曖昧語を避け、読み手が意図を判定できる記述にする
- ルール本文の丸写しは避け、ルール準拠の最小サンプルとして再構成する
- YAML sample の場合は、対応 schema があれば `required` / `type` / `enum` / `pattern` / `additionalProperties` を確認する

## 進め方

1. 引数有無を判定し、対象ファイル一覧を確定（未指定時は開いている 1 件）
2. 各対象 `rules` の存在確認と対象妥当性を確認（`meta-*-rulebook.md` は除外）
3. 対応する `samples` 側のファイルパスを決定（`.md` または `.yaml`）
4. 新規作成/アップサートを実施
5. 変更一覧（対象ごとの結果）と反映要点を出力
6. `npm run -s lint:md` を実行して結果を報告

## 出力形式

- 変更ファイル一覧
- ファイルごとの反映要点（1〜3行）
- lint結果
