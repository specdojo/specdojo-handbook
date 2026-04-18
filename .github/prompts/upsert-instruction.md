# 開いている rules から instruction を作成/更新

@file:.github/skills/rules-to-instruction/SKILL.md

現在開いている **1件の `*-rulebook.md`** を対象に、
対応する `*-instruction.md` を作成または更新してください。

## 対象

- 対象 rules は、現在エディタで開いている `*-rulebook.md` とする
- 開いているファイルが `meta-*-rulebook.md` の場合は対象外として処理を中止する

## 対応ルール

- 対応先は `rules` と同名の `<name>-instruction.md` とする
  - 例: `utc-index-rulebook.md` → `utc-index-instruction.md`
- `meta-*-rulebook.md` は `*-instruction.md` 作成/更新の対象外とする
- 対応する instruction が存在しない場合は新規作成
- 存在する場合はアップサート（不足項目追記・不整合修正）

## 生成要件

- 見出し順・必須項目・必須表・禁止事項・最終チェックを rules と整合させる
- index/term などの責務境界を維持する
- 曖昧語を避け、判定可能な指示にする
- ルール本文の丸写しは避け、生成AI実行テンプレートとして再構成する

## 進め方

1. 現在開いている `rules` の存在確認と対象妥当性を確認（`meta-*-rulebook.md` は除外）
2. 対応する `instructions` 側のファイルパスを決定
3. 新規作成/アップサートを実施
4. 変更一覧と反映要点を出力
5. `npm run -s lint:md` を実行して結果を報告

## 出力形式

- 変更ファイル一覧
- ファイルごとの反映要点（1〜3行）
- lint結果
