# 用語集（Glossary）作成ルール

本ドキュメントは、業務分析・要求定義・設計・テストで参照する **用語集（Glossary）を YAML 形式で記述する標準ルール**です。
用語集は、プロジェクト内で同じ言葉を同じ意味で使うための「辞書」であり、業務データ辞書（BDD）などの `glossaryTermId` が参照する **用語ID（`tm-...`）の正（正式な参照先）**になります。

## 1. メタデータ（ファイル単位）

用語集 YAML は、以下のメタデータを持つことを推奨します（運用しやすさのため）。

| 項目   | 説明                               | 必須 |
| ------ | ---------------------------------- | ---- |
| id     | 用語集ID（`gl-...`）               | 推奨 |
| title  | 用語集名（例: 用語集: 在庫・調達） | 推奨 |
| locale | 言語（例: `ja` / `en`）            | 推奨 |
| status | `draft`/`ready`/`deprecated`       | 任意 |
| terms  | 用語の配列                         | ○    |

### 1.1 ファイル命名（推奨）

- ファイル名: `gl-<対象領域>-<locale>.yaml`
  - 例: `gl-sales-ja.yaml`, `gl-inventory-ja.yaml`
- 多言語化する場合はファイルを分けます（ファイル内で言語を混在させない）。

## 2. 記載ルール・命名規則

- 形式は YAML とし、**トップレベルに `terms:`（配列）を必ず持つ**ようにします（`id` / `title` / `locale` などのメタデータを併記してよい）。
- 用語は **業務用語（日本語）**で記述し、UI文言や内部コード名の辞書化は必要最小限にします。
- 用語の定義は「一文で意味が通り、境界が分かる」ように書きます（同義語の説明にならないように）。
- BDD や BR、BPS、BAC で参照する用語は、先に用語集に登録して **ID を固定**します。

### 2.1 ID 規約

- 用語集ID: 正規表現 `^gl-[a-z0-9-]+$`
- 用語ID: 正規表現 `^tm-[a-z0-9-]+$`

推奨:

- `tm-` の命名は「名詞」を基本（例: `tm-reorder-point`）。
- 略語を使う場合は、業務用語集で一般的に通じるものに限定し、必要なら `definition` に補足。

## 3. 禁止事項

- 用語IDの重複、または ID を意味の違う用語に使い回すこと
- `definition` が曖昧（例: 「正しく処理される」「いい感じの在庫」など）
- 用語の説明に実装詳細（物理テーブル名、内部クラス名、SQL 等）を混ぜること
- 同じ概念を別名で重複登録し、`aliases` で統合しないこと
- ファイル内で言語を混在させること（多言語はファイル分割）

## 4. 用語（terms）の記載項目

### 4.1 terms の基本構造

| 項目         | 説明                                                      | 必須 |
| ------------ | --------------------------------------------------------- | ---- |
| id           | 用語ID（`tm-...`）                                        | ○    |
| term         | 用語（正式名称）                                          | ○    |
| aliases      | 別名（配列）                                              | 任意 |
| definition   | 定義（境界が分かる説明）                                  | ○    |
| notes        | 補足・運用メモ（前提、例外、使って良い文脈/ダメな文脈等） | 任意 |
| category     | 分類（推奨: 分類用の用語ID、例: `tm-inventory`）          | 任意 |
| relatedTerms | 関連用語ID（配列）                                        | 任意 |
| source       | 出典/参考（URL等）                                        | 任意 |
| status       | `official` / `deprecated` / `candidate` など              | 任意 |
| example      | 用例（短い例文）                                          | 任意 |

### 4.2 relatedTerms の運用

- `relatedTerms` は **用語ID（`tm-...`）** を列挙します。
- 関連が強い（同じ業務文脈でセットで出る）ものを中心にし、増やしすぎないことを推奨します。

## 5. サンプル

用語集 YAML（例: `gl-inventory-ja.yaml`）

```yaml
id: gl-inventory
title: 用語集: 在庫・調達
locale: ja
status: draft

terms:
  - id: tm-reorder-point
    term: 発注点
    aliases: [発注基準点]
    definition: 在庫数量がこの値を下回ったときに、発注候補とみなす基準数量。
    notes: 商品ごとに設定。定番商品でのみ利用する。
    category: tm-inventory
    relatedTerms: [tm-safety-stock]
    source: https://example.com
    status: official
    example: '発注点を下回ったため、追加発注を行う。'

  - id: tm-standard-product
    term: 定番商品
    aliases: [レギュラー商品, 人気商品, 定番]
    definition: 常に棚に置いておきたい、よく売れる商品。
    notes: 発注点・最低在庫数などを設定する対象。
    category: tm-inventory

  - id: tm-accounts-receivable
    term: つけ
    aliases: [ツケ]
    definition: 顧客が代金を後払いにする販売形態。
    notes: 顧客単位で残高と限度額を管理する。
    category: tm-sales

  - id: tm-grandma
    term: おばあちゃん
    definition: 駄菓子屋の店主。システムの主な利用者。
    notes: IT に詳しくない前提で画面を設計する。
    category: tm-actor
```

## 6. 生成 AI への指示テンプレート

生成 AI に用語集 YAML を作らせるときは、以下のような指示を与える。

> 以下のルールに従って、**YAML形式の用語集（Glossary）** を作成してください。
>
> ---
>
> ## 1. ファイル形式
>
> - 出力は **YAML形式** とし、余計な文章は書かず、YAML のみを出力してください。
> - トップレベルに `terms:`（配列）を必ず含め、用語は配列で記述してください。
> - `id` / `title` / `locale` などのメタデータは、トップレベルに併記してよいです。
>
> ## 2. ID 規約
>
> - 用語集IDは `gl-` で始まる一意ID（例: `gl-inventory`）
> - 用語IDは `tm-` で始まる一意ID（例: `tm-reorder-point`）
>
> ## 3. 記載ルール（遵守）
>
> - **term（用語）と definition（定義）は必須**。
> - `definition` は同義語説明ではなく、境界が分かる説明にしてください。
> - 実装詳細（テーブル名、SQL、内部クラス名等）は含めないでください。
> - 同義語は `aliases` で表現し、重複登録しないでください。
> - `relatedTerms` を使う場合は **用語ID（`tm-...`）** を列挙してください。
>
> ## 4. 出力構造（推奨）
>
> 以下のキーを持つ YAML を出力してください。
>
> ```yaml
> id: gl-XXXX
> title: 用語集: XXXX
> locale: ja
> status: draft
>
> terms:
>   - id: tm-xxxx
>     term: 用語
>     aliases: []
>     definition: 定義
>     notes: 補足
>     category: tm-xxxx
>     relatedTerms: []
>     source: https://example.com
>     status: official
>     example: '例文'
> ```
>
> ## 5. 最終出力
>
> - 出力は YAML のみ。
>
> **以上のルールに従って、用語集を生成してください。**
