# 成果物から対応する rules を逆生成

@file:.github/skills/upsert-rulebook/SKILL.md

現在開いている **成果物ファイル** を分析し、
対応する `*-rulebook.md` を新規作成または更新してください。

## 対象の決定

- 開いているファイルが `sample-gcs-product/` 配下、またはプロジェクト成果物の場合 → 成果物からの逆生成フローを適用する
- 開いているファイルが `*-rulebook.md` / `*-instruction.md` / `*-sample.md` の場合 → `upsert-rulebook` プロンプトの対象のため、処理を中止し誘導する
- 開いているファイルが `meta-*-rulebook.md` の場合 → 対象外として処理を中止する

## 対象ファイル → rules の特定

1. ファイル名プレフィックス（`cdfd-`, `bes-` 等）を抽出し、`meta-id-and-file-naming-rulebook.md` の「プレフィックス表」で照合
2. プレフィックスが取れない場合は Frontmatter `id` → 親ディレクトリ名 → 内容パターンの順で特定
3. 特定できない場合はユーザに確認する

## 対応ルール

- 出力先: `docs/ja/handbook/rulebooks/<prefix>-rulebook.md`
- `meta-*-rulebook.md` は対象外
- 対応する rules が存在しない場合は新規作成
- 存在する場合はアップサート（成果物の実態との乖離を差分修正）

## 進め方

1. 開いているファイルから対応するプレフィックスと rules ファイルを特定
2. 成果物の構造を分析（見出し構成・表カラム・Mermaid 有無・Frontmatter）
3. 同ディレクトリの他ファイルも 2〜3 件確認し、パターンの共通性を把握
4. `meta-rulebook-structure-rulebook.md` を読み、標準章構成を把握
5. docs-contents-guide から対象ドキュメントの目的・内容を確認
6. 同カテゴリの既存 rules を参考に粒度を把握
7. 分析結果を標準章構成に当てはめ、新規作成またはアップサートを実行
8. `サンプル（最小でも可）` のリンクと `生成 AI への指示テンプレート` のリンクを確認・更新
9. `npm run -s lint:md` で検証
