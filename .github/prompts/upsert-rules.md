# 開いている対象の rules を作成/更新

@file:.github/skills/upsert-rules/SKILL.md

現在開いている **1 件のファイル** を手がかりに、
対応する `*-rules.md` を作成または更新してください。

## 対象の決定

- 開いているファイルが `*-rules.md` の場合 → そのファイルを直接更新する
- 開いているファイルが `*-instruction.md` / `*-sample.md` / `*-input-template.md` の場合 → 対応する `*-rules.md` を特定して更新する
- 開いているファイルが `meta-*-rules.md` の場合 → 対象外として処理を中止する

## 対応ルール

- 出力先: `docs/ja/handbook/rules/<name>-rules.md`
- `meta-*-rules.md` は対象外
- 対応する rules が存在しない場合は新規作成
- 存在する場合はアップサート（章構成の差分修正・不足章の追記）

## 進め方

1. 対象ファイルの存在確認と対象妥当性を確認
2. `meta-rulebook-structure-rules.md` を読み、標準章構成を把握
3. docs-contents-guide から対象ドキュメントの目的・内容を確認
4. 同カテゴリの既存 rules を参考に粒度を把握
5. 新規作成またはアップサートを実行
6. サンプルリンク（§8）と instruction リンク（§9）を確認・更新
7. `npm run -s lint:md` で検証
