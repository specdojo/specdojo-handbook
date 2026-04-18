# 外部メッセージ仕様（External Message Specification: EMS）作成ルール

外部システム（物流、決済、会計など）との非同期連携のために、**メッセージング仕様**を定義します。

EMS は ESIL（外部システムIF一覧）から参照される「詳細仕様」です。
ESIL 側の `spec_ref: ifx-msg-...` は、このEMSのID（およびファイル名）と対応させます。

この章では **表ではなく YAML 1ファイル**で EMS を管理します。
フォーマットは **AsyncAPI + CloudEvents**（YAML）を正とします。

## 1. ファイル規約

- ファイル名: `ifx-msg-<短い英小文字ハイフン>.yaml`
- ESILからの参照: `spec_ref: ifx-msg-...`（例: `ifx-msg-stock-changed`）
- 1ファイル = 1つのメッセージング仕様（1つのイベント群/チャネル群）

## 2. バージョン

- **AsyncAPI 2.6.0**（推奨）を第一候補とする（ツール互換性が高いため）
- CloudEvents は **1.0** を前提とする

## 3. 記載方針（必須）

- **外部との合意に必要な最小十分**を記載する（内部実装の都合は書かない）
- メッセージのエンベロープは **CloudEvents** とし、イベント属性を明示する
- チャネル（topic/queue）や方向（publish/subscribe）を明確にする
- payload（`data`）のスキーマは `components/schemas` に集約し、参照で使い回す
- **メタ情報は `x-spec-meta` に集約**し、トレーサビリティを確保する

禁止（書かない）:

- DB物理テーブル名・物理カラム名・SQL全文
- 実装クラス/関数名・内部モジュール構成
- UI操作の逐語列挙

## 4. 必須構造（AsyncAPI YAML）

最低限、以下を必ず含めます。

- `asyncapi`
- `info`（`title`, `version` を含む）
- `x-spec-meta`（`id`, `type`, `status` を含む）
- `channels`（少なくとも1つ）
- `components/messages`（少なくとも1つ）

## 4.1 メタ情報（x-spec-meta）

仕様のトレーサビリティ管理のため、以下を `x-spec-meta` に含めます。

| キー       | 説明                                                    | 必須 |
| ---------- | ------------------------------------------------------- | ---- |
| id         | メッセージ仕様ID（`ifx-msg-...`）、ESILの `spec_ref` と対応 | ○    |
| type       | `message` 固定                                          | ○    |
| status     | `draft` / `ready` / `deprecated`                        | ○    |
| based_on   | 根拠となる他仕様のIDリスト（例: `["ifx-api-auth"]`）      | 任意 |

## 5. CloudEventsルール（必須）

CloudEventsの「属性」は仕様で名前が固定です（snake_caseに変換しません）。最低限、以下を含めます。

- `specversion`: `"1.0"`
- `type`: イベント種別（例: `com.kinuya.stock.changed.v1`）
- `source`: イベント発生元（URI形式推奨、例: `"/inventory"`）
- `id`: イベントID（重複しない）
- `time`: 発生時刻（RFC3339）
- `datacontenttype`: `application/json`
- `subject`: 任意（推奨。対象を識別できる文字列）
- `data`: 業務ペイロード（この中のプロパティ名は snake_case 推奨）

## 6. サンプル（AsyncAPI + CloudEvents YAML）

```yaml
asyncapi: 2.6.0
info:
  title: 在庫変更イベント仕様
  description: |
    在庫が変更されたときに発行されるイベント仕様。

x-spec-meta:
  id: ifx-msg-stock-changed
  type: message
  status: draft
  based_on: []

defaultContentType: application/json

servers:
  broker:
    url: mqtt://broker.example.com
    protocol: mqtt
    description: メッセージブローカー

channels:
  inventory.stock.changed:
    description: 在庫が変更された通知
    subscribe:
      message:
        $ref: '#/components/messages/StockChangedEvent'

components:
  messages:
    StockChangedEvent:
      name: StockChangedEvent
      title: 在庫変更イベント
      contentType: application/cloudevents+json
      payload:
        $ref: '#/components/schemas/CloudEventStockChanged'

  schemas:
    CloudEventStockChanged:
      type: object
      additionalProperties: false
      required:
        - specversion
        - type
        - source
        - id
        - time
        - datacontenttype
        - data
      properties:
        specversion:
          type: string
          enum: ['1.0']
        type:
          type: string
          example: com.kinuya.stock.changed.v1
        source:
          type: string
          example: /inventory
        id:
          type: string
          description: イベントID
        time:
          type: string
          format: date-time
        datacontenttype:
          type: string
          example: application/json
        subject:
          type: string
          description: 対象識別子（任意）
          example: product/PROD-0001
        data:
          $ref: '#/components/schemas/StockChangedData'

    StockChangedData:
      type: object
      additionalProperties: false
      required: [product_id, delta, current_quantity]
      properties:
        product_id:
          type: string
          description: 商品ID
        delta:
          type: integer
          description: 増減量（減少は負の値）
        current_quantity:
          type: integer
          description: 現在在庫数
```

## 7. 生成AIへの指示テンプレート

> - 以下のルールに従って、**外部メッセージ仕様（EMS）**を **AsyncAPI + CloudEvents（YAML 1ファイル）**として作成してください。
> - 出力は **YAMLのみ** とし、Markdown文章は出力しないでください。
> - AsyncAPIは **2.6.0**、CloudEventsは **1.0** を前提にしてください。
> - `x-spec-meta` を必ず含め、`id`（`ifx-msg-...`）、`type`（`message`）、`status`（`draft`/`ready`/`deprecated`）を設定してください。
> - `channels` を1つ以上定義し、publish/subscribe のいずれか（または両方）を明示してください。
> - CloudEvents属性（`specversion/type/source/id/time/datacontenttype`）を必須として、payloadを設計してください。
> - `data` のスキーマは `components/schemas` に定義し、`$ref` で参照してください。
> - `data` のプロパティ名は snake_case（例: `product_id`, `current_quantity`）で統一してください。
> - 禁止: 連携先/連携元の内部実装詳細、DB物理テーブル/物理カラム名、SQL全文、実装クラス/関数名、UI操作の逐語列挙
