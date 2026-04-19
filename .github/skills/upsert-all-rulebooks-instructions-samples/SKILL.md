---
name: upsert-all-rulebooks-instructions-samples
description: '`docs/ja/handbook/guidelines/docs-contents-guide.md` を正として、対象となる rulebook / instruction / sample を一括で作成・更新する Skill です。'
---

# SKILL: upsert-all-rulebooks-instructions-samples

`docs/ja/handbook/guidelines/docs-contents-guide.md` の「推奨ファイル名」を正として、
対象となる rulebook / instruction / sample を一括で作成・更新する Skill です。

## 使いどころ

- docs-contents-guide の更新に合わせて、成果物ルール群を全体同期したいとき
- 追加されたドキュメント種別の rulebook / instruction / sample をまとめて生成したいとき
- 命名・構成の抜け漏れを一括で検出して是正したいとき

## 呼び出す既存資産（必須）

- 対象定義（SSOT）: `docs/ja/handbook/guidelines/docs-contents-guide.md`
- 一括1件処理: `@file:.github/skills/upsert-rulebook-instruction-sample/SKILL.md`
- 個別ステップの詳細（rules / instruction / sample）は `upsert-rulebook-instruction-sample` が参照する各 Skill 定義を正とする。

## 引数仕様

- 引数なしの場合は docs-contents-guide の全対象を処理する。
- 引数ありの場合は、対象の絞り込みとして扱う（短縮名 / `-rulebook.md` 付き / 相対 / 絶対を許容）。
- 複数指定可（スペース区切り / 改行区切り / カンマ区切り）。
- 同一対象の重複指定は 1 件に正規化する。

## 対象抽出ルール（docs-contents-guide 準拠）

`推奨ファイル名` 列から対象を抽出し、次の規則で rulebook ターゲット名へ正規化する。

1. 単一名（例: `imp-business`）
   - ターゲット: `imp-business`
2. カンマ列挙（例: `mip-index`, `mip-<term>`）
   - 各要素を個別対象として扱う
3. `*-index` と `*-<term>` の両方がある系列
   - ターゲット: `<prefix>-index` と `<prefix>` の 2 件
   - 例: `utc-index`, `utc-<term>` → `utc-index`, `utc`
4. `*-<term>` のみがある系列
   - ターゲット: `<prefix>`
   - 例: `br-<term>` → `br`
5. `<...>` を含むプレースホルダは具体 ID ではないため、上記 3/4 の系列規則で変換する

補足:

- `meta-*-rulebook.md` は対象外とする。
- `推奨ファイル名` が `/` で終わるディレクトリ（例: `020-product-change/010-as-is/`）の場合は、rulebook / instruction / sample を生成しない。
- docs-contents-guide に記載されていても、運用対象外と明示されたものがある場合は対象単位でスキップする。

## 実行手順（固定順）

1. docs-contents-guide から対象セットを抽出し、正規化する
2. 対象を名前順で固定する（再現性確保）
3. 各対象について `upsert-rulebook-instruction-sample` を実行する
4. 途中失敗があっても、残り対象の処理を継続する
5. 最後に `npm run -s lint:md` を実行する

## 実行ルール

- 各対象の処理順は `upsert-rulebook` → `rulebook-to-instruction` → `rulebook-to-sample` に固定する。
- 既存ファイルがある場合は差分アップサートを優先し、全置換を避ける。
- ある対象で失敗しても全体処理は停止しない（fail-soft）。
- 失敗対象は最終サマリに必ず残し、再実行しやすい粒度で報告する。

## 出力形式

- 対象件数（総数 / 更新 / 新規 / スキップ / 失敗）
- 対象一覧（実行順）
- 対象ごとの結果
  - `rulebook`: updated / created / skipped / failed
  - `instruction`: updated / created / skipped / failed
  - `sample`: updated / created / skipped / failed
- 変更ファイル一覧
- lint 結果

## 注意事項

- docs-contents-guide 以外を一次情報として対象追加しない。
- 章構成・必須項目・禁止事項は各個別 Skill の定義を正とする。
- 途中中断時は、未処理対象と失敗対象を分けて記録する。
