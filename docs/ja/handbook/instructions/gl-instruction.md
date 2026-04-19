# 用語集 (GL) 作成の指示テンプレート

以下のルールに従って、**YAML形式の用語集（Glossary）** を作成してください。

---

## 1. ファイル形式

- 出力は **YAML形式** とし、余計な文章は書かず、YAML のみを出力してください。
- トップレベルに `terms:`（配列）を必ず含め、用語は配列で記述してください。
- `id` / `title` / `locale` などのメタデータは、トップレベルに併記してよいです。

## 2. ID 規約

- 用語集IDは `gl-` で始まる一意ID（例: `gl-inventory`）
- 用語IDは `tm-` で始まる一意ID（例: `tm-reorder-point`）

## 3. 記載ルール（遵守）

- **term（用語）と definition（定義）は必須**。
- `definition` は同義語説明ではなく、境界が分かる説明にしてください。
- 実装詳細（テーブル名、SQL、内部クラス名等）は含めないでください。
- 同義語は `aliases` で表現し、重複登録しないでください。
- `relatedTerms` を使う場合は **用語ID（`tm-...`）** を列挙してください。

## 4. 出力構造（推奨）

以下のキーを持つ YAML を出力してください。

```yaml
id: gl-XXXX
title: '用語集: XXXX'
locale: ja
status: draft

terms:
  - id: tm-xxxx
    term: 用語
    aliases: []
    definition: 定義
    notes: 補足
    category: tm-xxxx
    relatedTerms: []
    source: https://example.com
    status: official
    example: '例文'
```

## 5. 最終出力

- 出力は YAML のみ。

**以上のルールに従って、用語集を生成してください。**
