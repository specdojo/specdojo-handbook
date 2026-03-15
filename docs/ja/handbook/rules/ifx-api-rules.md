# 外部API仕様（External API Specification: EAPIS）作成ルール

外部システム（仕入先、会計、物流、決済など）と連携する **1つのREST APIインターフェース**を、**OpenAPI形式**（YAML 1ファイル）で定義します。

EAPIS は ESIL（外部システムIF一覧）から参照される「詳細仕様」です。
ESIL 側の `spec_ref: ifx-api-...` は、このEAPISのID（およびファイル名）と対応させます。

## 1. ファイル規約

- ファイル名: `ifx-api-<短い英小文字ハイフン>.yaml`
- ESILからの参照: `spec_ref: ifx-api-...`（例: `ifx-api-payment`）
- 1ファイル = 1つのAPI（1つの外部連携インターフェース）

## 2. OpenAPIバージョン

- **OpenAPI 3.0.3**（推奨）または **OpenAPI 3.1.x** を利用する
- 本リポジトリでは互換性のため **3.0.3** を第一候補とする

## 3. 記載方針（必須）

- **外部との合意に必要な最小十分**を記載する（内部実装の都合は書かない）
- `paths` は **実際に提供/利用するエンドポイントのみ**定義する
- `operationId` は英字で一意にする（例: `createPayment`）
- スキーマは `components/schemas` に集約し、`$ref` で参照して使い回す
- 認証は `components/securitySchemes` に定義し、`security` で適用する
- **メタ情報は `x-spec-meta` に集約**し、トレーサビリティを確保する
- **payloadのプロパティ名は snake_case を推奨**（例: `order_id`, `payment_status`）

禁止（書かない）:

- DB物理テーブル名・物理カラム名・SQL全文
- 実装クラス/関数名・内部モジュール構成
- UI操作の逐語列挙

## 4. 必須構造（OpenAPI YAML）

最低限、以下を必ず含めます。

- `openapi`
- `info`（`title`を含む）
- `x-spec-meta`（`id`, `type`, `status` を含む）
- `servers`（少なくとも1つ）
- `paths`（少なくとも1つ）

## 4.1 メタ情報（x-spec-meta）

仕様のトレーサビリティ管理のため、以下を `x-spec-meta` に含めます。

| キー       | 説明                                               | 必須 |
| ---------- | -------------------------------------------------- | ---- |
| id         | API仕様ID（`ifx-api-...`）、ESILの `spec_ref` と対応 | ○    |
| type       | `api` 固定                                         | ○    |
| status     | `draft` / `ready` / `deprecated`                   | ○    |
| based_on   | 根拠となる他仕様のIDリスト（例: `["ifx-api-auth"]`） | 任意 |

## 5. エラー定義（推奨）

外部連携では、少なくとも以下のエラーレスポンスを定義します。

- `400`（入力不正）
- `401`（認証）/ `403`（認可）
- `404`（リソースなし）
- `409`（競合）
- `429`（レート制限）
- `500`（内部エラー）

共通形式（例: `components/schemas/ErrorResponse`）を用意し、各operationから参照する運用を推奨します。

## 6. サンプル（OpenAPI YAML）

以下は「1つの外部REST API」を表す最小サンプルです。

```yaml
openapi: 3.0.3
info:
  title: 決済サービスAPI
  description: |
    決済サービスとの連携API仕様。

x-spec-meta:
  id: ifx-api-payment
  type: api
  status: draft
  based_on: []

servers:
  - url: https://api.payment.example.com
    description: 本番

paths:
  /v1/payments:
    post:
      operationId: createPayment
      summary: 決済を作成する
      security:
        - ApiKeyAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePaymentRequest'
      responses:
        '201':
          description: 作成成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CreatePaymentResponse'
        '400':
          description: 入力不正
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: 認証エラー
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: 内部エラー
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

  schemas:
    CreatePaymentRequest:
      type: object
      additionalProperties: false
      required: [amount, currency, order_id]
      properties:
        amount:
          type: integer
          minimum: 1
        currency:
          type: string
          example: JPY
        order_id:
          type: string
          description: 注文ID（連携元の識別子）

    CreatePaymentResponse:
      type: object
      additionalProperties: false
      required: [payment_id, status]
      properties:
        payment_id:
          type: string
        status:
          type: string
          enum: [PENDING, PAID, FAILED]

    ErrorResponse:
      type: object
      additionalProperties: false
      required: [code, message]
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: object
          description: 任意の追加情報
```

## 7. 生成AIへの指示テンプレート

> - 以下のルールに従って、**外部API仕様（EAPIS）**を **OpenAPI（YAML 1ファイル）**として作成してください。
> - 出力は **YAMLのみ** とし、Markdown文章は出力しないでください。
> - OpenAPIは **3.0.3** を使用してください。
> - `x-spec-meta` を必ず含め、`id`（`ifx-api-...`）、`type`（`api`）、`status`（`draft`/`ready`/`deprecated`）を設定してください。
> - `paths` を1つ以上定義し、各operationに `operationId` を設定してください。
> - `components/schemas` にリクエスト/レスポンススキーマを定義し、`$ref` で参照してください。
> - **payloadのプロパティ名は snake_case**（例: `order_id`, `payment_status`）で統一してください。
> - `400/401/500` のエラーレスポンスを最低限定義し、`ErrorResponse` を共通化してください。
