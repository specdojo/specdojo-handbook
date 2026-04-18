# 外部システムIF一覧（External System Interface List: ESIL）作成ルール

外部システム（仕入先、会計、物流、決済など）との連携を、**一覧（インベントリ）**として定義します。

ESIL は「どの外部システムと」「何を」「どの方向で」「どの形式で」「いつ連携し」「異常時にどう扱うか」を、関係者間で合意するための入口です。

詳細なAPI仕様やファイル/メッセージの項目定義は、別ドキュメント（外部API仕様、外部ファイル連携仕様、外部メッセージ仕様など）に分離し、ESIL から参照できるようにします。

この章では **表ではなく YAML 1ファイル**で ESIL を管理します。

## 1. 参照スキーマ

- 参照スキーマ: [docs/handbook/shared/schemas/esil.schema.yaml](../../docs/handbook/shared/schemas/esil.schema.yaml)
- ESIL は `docs/**/ifx-*.yaml` のような YAML ファイルとして作成し、スキーマに従って記述します。

## 2. ファイル規約

- ファイル名: `ifx-<短い英小文字ハイフン>.yaml`
- `id`: `^ifx-[a-z0-9-]+$` に合致する一意ID
- `type`: `api` 固定

## 3. ルート要素

| キー       | 説明                          | 必須 |
| ---------- | ----------------------------- | ---- |
| id         | ESIL ID（`ifx-...`）         | ○    |
| type       | `api` 固定                    | ○    |
| title      | 外部システムIF一覧名          | ○    |
| status     | `draft`/`ready`/`deprecated`  | ○    |
| interfaces | 外部連携の配列（1件以上）     | ○    |
| supersedes | 置き換え関係（古仕様→新仕様） | 任意 |

※ ルートは `additionalProperties: false` です。上記以外のキーは追加しません。

## 4. interfaces（外部連携）

1要素が「1つの外部連携（IF）」を表します。

| キー           | 説明                                                           | 必須 |
| -------------- | -------------------------------------------------------------- | ---- |
| name           | 連携名（短い日本語）                                           | ○    |
| source         | 連携元（システム/コンテナ/コンポーネントなど）                 | ○    |
| target         | 連携先（外部システムの一般名）                                 | ○    |
| direction      | `source_to_target` / `target_to_source` / `bidirectional`      | ○    |
| kind           | `API` / `ファイル` / `メッセージ`                              | ○    |
| format         | `CSV` / `JSON` / `XML` / `その他` / `TBD`                      | ○    |
| timing         | 連携タイミング（例: 発注確定時、日次集計後）                   | ○    |
| error_handling | エラー処理・備考（簡潔に）                                     | 任意 |
| spec_ref       | 詳細仕様ID（`ifx-api-...` / `ifx-file-...` / `ifx-msg-...`）または `TBD` | 任意 |

## 5. サンプル（YAML）

```yaml
id: ifx-main
type: api
title: 外部システムIF一覧(main)
status: draft
supersedes: []

interfaces:
  - name: 発注データ送信
    source: 受発注管理（コンテナ）
    target: 仕入先システム
    direction: source_to_target
    kind: ファイル
    format: CSV
    timing: 発注確定時
    error_handling: 異常時は再送・管理者通知
    spec_ref: ifx-file-orders

  - name: 決済依頼/結果
    source: 決済（コンテナ）
    target: 決済サービス
    direction: bidirectional
    kind: API
    format: JSON
    timing: 決済時
    error_handling: 失敗時はリトライ/保留
    spec_ref: ifx-api-payment
```

## 6. 生成 AI への指示テンプレート

生成 AI に ESIL を作らせるときは、以下のような指示を与えます。

> - 以下のスキーマに従って、**外部システムIF一覧（ESIL）** を **YAML 1ファイル**として作成してください。
> - 出力は **YAMLのみ** とし、Markdown文章は出力しないでください。
> - 参照スキーマ: `docs/handbook/shared/schemas/esil.schema.yaml`
> - 禁止: 物理テーブル名・物理カラム名・SQL全文、実装クラス/関数名、APIの内部実装詳細、UI操作の逐語列挙
> - `id` は `ifx-...`、`type` は `api`、`status` は `draft/ready/deprecated` のいずれかにしてください。
> - `interfaces` は 1件以上作成し、各要素は以下の制約に従ってください：
>   - `direction`: `source_to_target` / `target_to_source` / `bidirectional`
>   - `kind`: `API` / `ファイル` / `メッセージ`
>   - `format`: `CSV` / `JSON` / `XML` / `その他` / `TBD`
>   - `spec_ref` は可能なら `ifx-api-...` / `ifx-file-...` / `ifx-msg-...` を設定し、不明なら `TBD` としてください。
