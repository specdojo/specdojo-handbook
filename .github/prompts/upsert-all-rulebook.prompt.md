# 全 rules を一括アップサート

@file:.github/skills/upsert-rulebook/SKILL.md
@file:docs/ja/handbook/guidelines/docs-contents-guide.md
@file:docs/ja/handbook/guidelines/docs-structure-guide.md
@file:.github/prompts/upsert-rulebook.prompt.md

`docs/ja/handbook/rulebooks` 配下の **すべての `*-rulebook.md`** を対象に、
作成または更新を一括で実行してください。

## 対象の決定

- 対象は `docs/ja/handbook/rulebooks/*-rulebook.md`
- `meta-*-rulebook.md` は対象外
- 既存ファイルはアップサート（章構成差分の補正・不足章追記）
- 不在ファイルは、`docs-contents-guide.md` の表にあるドキュメント行を根拠に新規作成
- 不在判定は「リンク定義あり/なし」に依存しない（リンクがない行も判定対象）

### 不在ファイル判定ルール

- まず `docs-contents-guide.md` の表行を全件走査する
- 表行に `../rulebooks/*-rulebook.md` のリンクがある場合は、そのリンク先を期待ファイル名として採用する
- 表行にリンクがない場合は、`推奨ファイル名` 列から `<name>-rulebook.md` を導出して期待ファイル名とする
- `推奨ファイル名` がテンプレート記法（例: `<target>`, `<spec>`）を含む場合は、テンプレート本体の rulebook として正規化する（例: `utc-<target>` → `utc-rulebook.md`）
- 期待ファイルが `docs/ja/handbook/rulebooks/` に存在しない場合は「不在ファイル」として新規作成する

## 対応ルール

- 標準章構成は `meta-rulebook-structure-rulebook.md` に準拠する
- 各 rulebook は以下を満たす
  - `## 1.` からの連番見出し
  - 必須章（1, 3, 5, 6, 7, 8, 9）
  - §8 の sample リンク整合
  - §9 の instruction リンク整合
- ファイル名・ID・配置方針は `docs-structure-guide.md` と整合させる
- ルール本文の丸写しではなく、対象ドキュメントの目的・主な内容に即して記述する

## 進め方

1. `docs/ja/handbook/rulebooks` から `*-rulebook.md` を列挙（`meta-*-rulebook.md` 除外）
2. `docs-contents-guide.md` の表行全件（リンクなし行を含む）と照合し、作成漏れ候補を抽出
3. 既存ファイルを順にアップサート
4. 不在ファイルを必要に応じて新規作成
5. 各 file で §8/§9 のリンク先有無を確認し、存在しない場合は「未作成」文言に統一
6. 変更一覧と反映要点を出力
7. `npm run -s lint:md` で検証

## 出力形式

- 対象件数（総数 / 更新 / 新規 / スキップ）
- 変更ファイル一覧
- 各ファイルの反映要点（1〜3行）
- lint 実行結果
