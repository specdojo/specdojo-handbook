# 業務データ辞書 作成ルール

Business Data Dictionary (BDD) Documentation Rules

本ドキュメントは、業務分析・要求定義・システム設計のために **業務データ辞書を記述する標準ルール**です。
業務上の管理単位（エンティティ）とその属性（項目）の論理名・物理名・説明・制約などを定義します。
データの意味や構造に関する共通理解を関係者間で図り、システム設計や実装の基礎情報として活用します。

## 1. メタデータ

| 項目       | 説明                          | 必須 |
| ---------- | ----------------------------- | ---- |
| id         | データ辞書ID (bdd-xxx-xxxx)   | ○    |
| type       | `domain` 固定                 | ○    |
| title      | データ辞書名                  | ○    |
| status     | `draft`/`ready`/`deprecated`  | ○    |
| supersedes | 置き換え関係（古仕様→新仕様） | 任意 |

### 1.1 ID規約

- ステータス一覧IDは正規表現 `^sts-[a-z0-9-]+$` に合致する一意IDを用いる。
- `type: domain` は業務ドメイン仕様であることを示す。画面やAPI仕様（`screen`/`api`）とは別ドキュメントで管理する。

## 2. 記載ルール・命名規則

- YAML形式で記述する。
- **業務視点の論理名・説明を重視**し、実装要素は必要最小限とする。
- **実装都合の属性や技術的カラム（created_at等）は原則含めないが、物理名(physical_name)については業務データ辞書で一元管理する。**
- データ項目の意味・制約・例値・関連情報や定義・説明を簡潔かつ明確に記載する。
- 論理名・属性名は**日本語の単数形**で記載する。
- 物理名（`physical_name`）はentity, fieldとも必ず **lowerCamelCase** を用いる（例：`productCode`, `creditBalance`, `paymentStatus`）。
- エンティティや項目の論理名・説明は、概念クラス図（CCD）や用語集 (glossary) と整合性を保つ。
- 関連用語や分類は必要に応じて記載する。
- glossary_term_idは、用語集（glossary）で定義したIDと一致させる。
- フィールドが `type: enum` の場合、許容値を必ず明示する。
- 記述方法は以下のいずれかを採用する。
  - 簡易列挙: `allowed_values: [PENDING, PAID, CANCELED]`
  - 詳細列挙: `allowed_values_detailed:` で `value` と `label` を持つ配列。
- 多言語化対応はファイル名で管理し、エンティティ・フィールド内での言語別記載は行わない。例: `010-業務データ辞書-ja.yaml`, `010-bdd-main-en.yaml`

## 3. 禁止事項

- 技術的属性（created_at, updated_at, deleted_at等）を含めない
- 実装都合のカラムやAPI用の構造体をそのまま記載しない
- 用語集やCCDと不整合な用語・IDを使わない
- 英語と日本語のランダム混在（物理名・論理名の混在）
- 意味が曖昧な説明や略語のみの記載

## 4. 業務データ辞書の記載項目

### 4.1 主要項目

| 項目     | 説明                         | 必須 |
| -------- | ---------------------------- | ---- |
| entities | 業務データエンティティの一覧 | ○    |

### 4.2 entities フィールド構成

| サブ項目         | 説明                                      | 必須 |
| ---------------- | ----------------------------------------- | ---- |
| logical_name     | 業務上の論理名（日本語単数形）            | ○    |
| physical_name    | システム上の物理名 (lowerCamelCase)       | ○    |
| description      | 業務データの説明                          | 任意 |
| glossary_term_id | 用語集の用語ID                            | 任意 |
| related_terms    | 関連用語IDリスト                          | 任意 |
| key_fields       | キー項目 (複合キーも想定し物理名のリスト) | ○    |
| fields           | 業務データフィールドの一覧                | ○    |

### 4.3 fields フィールド構成

| サブ項目         | 説明                                                                   | 必須 |
| ---------------- | ---------------------------------------------------------------------- | ---- |
| logical_name     | 業務上の論理名（日本語単数形）                                         | ○    |
| physical_name    | システム上の物理名 (lowerCamelCase)                                    | ○    |
| glossary_term_id | 用語集の用語ID                                                         | 任意 |
| type             | データ型 (integer / string / boolean / date / datetime / enum / money) | ○    |
| description      | フィールドの説明                                                       | 任意 |
| unit             | 単位（該当する場合）                                                   | 任意 |
| constraints      | フィールドの制約条件                                                   | 任意 |
| example          | フィールドの例値                                                       | 任意 |

### 4.4 constraints サブフィールド構成

| サブ項目 | 説明                            | 必須 |
| -------- | ------------------------------- | ---- |
| required | 必須入力かどうか (true / false) | 任意 |
| unique   | 一意性制約 (true / false)       | 任意 |
| min      | 最小値                          | 任意 |
| max      | 最大値                          | 任意 |
| pattern  | 正規表現パターン                | 任意 |

## 5. サンプル

```yaml
id: bdd-main
type: domain
title: 業務データ辞書(main)
status: draft
supersedes: []

entities:
  - logical_name: 商品
    physical_name: product
    description: 駄菓子屋で販売する個々の商品
    glossary_term_id: tm-product
    related_terms: [tm-price, tm-stock]
    key_fields: [productCode]
    fields:
      - logical_name: 商品コード
        physical_name: productCode
        glossary_term_id: tm-product-code
        type: string
        description: 各商品を一意に識別するコード
        constraints:
          required: true
          unique: true
        example: 45-14603-32581-2
      - logical_name: 商品名
        physical_name: productName
        type: string
        glossary_term_id: tm-product-name
        description: おばあちゃんやお客さんが読める商品名
        constraints:
          required: true
        example: うまか棒 たこ焼き味
      - logical_name: 価格
        physical_name: price
        type: integer
        glossary_term_id: tm-price
        description: 商品の販売価格（税抜き）
        unit: 円
        constraints:
          required: true
        example: 100

  - logical_name: 支払い
    physical_name: payment
    description: 顧客からの支払い情報
    glossary_term_id: tm-payment
    key_fields: [paymentId]
    fields:
      - logical_name: 支払いID
        physical_name: paymentId
        type: string
        glossary_term_id: tm-payment-id
        description: 支払いを一意に識別するID
        constraints:
          required: true
          unique: true
        example: PAY-0001
      - logical_name: 支払ステータス
        physical_name: paymentStatus
        type: enum
        description: 支払い処理の現在状態
        constraints:
          required: true
        allowed_values_detailed:
          - value: PENDING
            label: 未処理
          - value: PAID
            label: 支払済
          - value: CANCELED
            label: 取消
```

## 7. 生成 AI への指示テンプレート

生成 AI に業務データ辞書を作らせるときは、以下のような指示を与える。

> 以下のルールに従って、**YAML形式の業務データ辞書（BDD）を作成**してください。
>
> ---
>
> ## **1. ファイル形式**
>
> - 出力は **YAML形式** とし、余計な文章は書かず、YAML のみを出力してください。
>
> ## **2. メタデータ**
>
> 次のメタデータを必ず定義してください。
>
> ```yaml
> id: bdd-XXXX # 任意の一意ID（bdd-から始める）
> type: domain
> title: 業務データ辞書(XXXX)
> status: draft
> supersedes: []
> ```
>
> ## **3. 記載ルール（遵守）**
>
> - **論理名（logical_name）は日本語単数形**で記載すること。
> - **物理名（physical_name）は lowerCamelCase** で記載すること。
> - **実装都合の属性（created_at など）は含めない**こと。
> - 用語集と連動する場合は **glossary_term_id を対応IDで記載**すること。
> - **キー項目は key_fields に、物理名の配列**で記載すること。
> - フィールドの型は以下から選択：
>   `integer / string / boolean / date / datetime / enum / money`
> - enum を使う場合、以下のどちらかの方式で許容値を記述する：
>   - `allowed_values: [A, B, C]`
>   - `allowed_values_detailed:` 形式で `value` / `label` を列挙
>
> ## **4. エンティティの記述形式（必ずこの構造）**
>
> ```yaml
> entities:
>   - logical_name: 〇〇
>     physical_name: 〇〇
>     description: 〇〇（業務的な説明）
>     glossary_term_id: tm-xxxx # 任意
>     related_terms: [tm-xxxx] # 任意
>     key_fields: [primaryKeyField] # 必須。複合キーも可
>     fields:
>       - logical_name: 〇〇
>         physical_name: 〇〇
>         type: string
>         glossary_term_id: tm-xxx # 任意
>         description: 〇〇 # 任意
>         unit: 円 # 任意
>         constraints:
>           required: true
>           unique: true
>         example: サンプル値
> ```
>
> ### **5. 出力要件**
>
> - エンティティ間で名前の衝突や ID の不整合がないよう生成してください。
> - 物理名・論理名・説明は、業務シナリオに整合する自然な内容にしてください。
>
> ## **6. 参考**
>
> - 必要に応じて用語集（glossary）を参照し、glossary_term_id を補完してください。
> - BDD 作成ルールはこのファイル **bdd-rulebook.md** を参照してください。
>
> ## **7. 最終出力**
>
> - 出力は YAML コードブロックのみで、前後や途中に文章を入れないこと。
>
> **以上のルールに従って、業務データ辞書を生成してください。**

このテンプレートをコピーして、生成 AI のプロンプトに貼り付けて利用してください。なお、[bdd-instruction.md](../instructions/bdd-instruction.md)として別ファイルに保存しています。
