---
id: specdojo-wbs-design
type: guide
status: draft
---

# SpecDojo WBS設計ガイド

本ドキュメントは SpecDojo における **WBS（Work Breakdown Structure）の設計原則**を定義する。

SpecDojoでは、WBSは

```text
WHAT（何を作るか）
```

を定義するものであり、

```text
WHEN（いつやるか）
IN WHAT ORDER（どの順序でやるか）
```

は Schedule が担う。

## 1. WBSの役割

SpecDojoにおけるWBSの責務は次の通りである。

| 項目            | 内容               |
| --------------- | ------------------ |
| Deliverable分解 | 成果物の分解       |
| Scope Baseline  | スコープ基準       |
| Done Criteria   | 完了条件           |
| Deliverable追跡 | 成果物と作業の対応 |

WBSは **スケジュール情報を持たない**。

## 2. Deliverable Driven 原則

SpecDojoでは

```text
WBS Item = Deliverable責務
```

と定義する。

つまり

```text
作業 = 成果物生成
```

である。

例

```yaml
wbs:
  - id: WBS-AUTH-API-010
    name: login endpoint
    owner: EN
    deliverables:
      - path: src/auth/login-controller.ts
        kind: create
    done_criteria: login endpoint が動作する
```

## 3. WBS Itemの条件

良いWBS Itemは次の条件を満たす。

| 条件            | 内容                 |
| --------------- | -------------------- |
| Deliverable明確 | producesが明確       |
| Done Criteria   | 完了条件が明確       |
| Deterministic   | 成功条件が曖昧でない |
| Scope Unit      | スコープ単位         |

## 4. WBS粒度

WBS粒度は **Deliverable単位**とする。

理想

```text
1 WBS item = 1責務の成果物
```

例

良い

```text
login endpoint
password validation
jwt token generation
```

悪い

```text
authentication system
```

## 5. WBS構造

SpecDojoでは WBS は **domain単位ファイル**で管理する。

例

```text
wbs-auth.yaml
wbs-payment.yaml
wbs-infra.yaml
```

各WBSは **leaf deliverable items** を列挙する。

## 6. WBS ID規則

推奨形式

```text
WBS-<DOMAIN>-<NUMBER>
```

例

```text
WBS-AUTH-010
WBS-AUTH-020
WBS-PAYMENT-010
```

componentを含めてもよい

```text
WBS-AUTH-API-010
```

## 7. Deliverable定義

Deliverableには次の属性を持たせる。

| 属性 | 内容                        |
| ---- | --------------------------- |
| path | repo path                   |
| kind | create / modify / reference |
| note | 任意                        |

例

```yaml
deliverables:
  - path: src/auth/login-service.ts
    kind: create
```

## 8. Done Criteria

Done Criteria は **スコープ完了条件**である。

例

良い

```text
login API が email/password を受け取り JWT を返す
```

悪い

```text
login API を実装する
```

## 9. WBS Anti-pattern

避けるべき例

### 巨大スコープ

```text
authentication system
```

### Deliverable無し

```text
improve performance
```

### 曖昧

```text
update login logic
```

## 10. WBSとScheduleの関係

WBS

```text
WHAT
```

Schedule

```text
WHEN
ORDER
```

関係

```text
WBS → Schedule
```

Schedule Task は **必ず WBS を参照する**。

例

```yaml
tasks:
  - id: T-AUTH-API-010
    wbs: WBS-AUTH-API-010
```

## 11. Spec→WBS生成

将来的にAIは

```text
Spec → Deliverables → WBS
```

を生成できる。

Spec例

```text
login API returns JWT
```

WBS

```text
WBS-AUTH-API-010 create login endpoint
WBS-AUTH-API-020 generate JWT
```

## 12. まとめ

SpecDojoのWBSは

```text
Deliverable Driven
Deterministic
Scope Baseline
```

である。

WBSは

```text
WHAT
```

を定義する。
