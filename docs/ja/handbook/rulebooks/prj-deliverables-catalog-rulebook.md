---
id: prj-deliverables-catalog-rules
type: rulebook
status: draft
---

# 成果物カタログ 作成ルール

Deliverables Catalog Documentation Rules

本ドキュメントは、`成果物カタログ` を一貫した粒度で作成するためのルールを定義する。

## 1. 全体方針

- 目的: プロジェクト成果物の一覧と配置・派生関係を整理する
- 主な内容: 成果物一覧、目的、配置先、生成元、派生関係
- 曖昧表現を避け、判定可能な記述にする。

## 2. 位置づけと用語定義（必要に応じて）

- 上位方針・関連成果物との責務境界を明確化する。
- 必要に応じて用語を定義し、命名ゆれを防ぐ。

## 3. ファイル命名・ID規則

- 推奨ファイル名: `prj-deliverables-catalog`
- ドキュメントID: `prj-deliverables-catalog-<term>` または用途に応じた識別子

## 4. 推奨 Frontmatter 項目

| 項目 | 値 | 必須 |
| --- | --- | --- |
| id | 一意なID | ○ |
| type | project / spec / test / architecture / operations | ○ |
| status | draft / ready / deprecated | ○ |
| rulebook | `prj-deliverables-catalog-rulebook` | 任意 |

## 5. 本文構成（標準テンプレ）

| 章 | 必須 | 内容 |
| --- | --- | --- |
| 1. 目的と適用範囲 | ○ | 対象、目的、適用境界 |
| 2. 入力情報 | ○ | 前提、参照元、制約 |
| 3. 記述内容 | ○ | 主要項目、構成、記述順 |
| 4. 検証観点 | ○ | 完了条件、確認観点 |
| 5. 未解決事項 | 任意 | 課題、決定期限、担当 |

## 6. 記述ガイド

- 事実と判断を分離し、根拠を併記する。
- 表は列見出しを固定し、欠損値の扱いを明示する。
- 章参照は章番号ではなく章タイトルで記述する。

## 7. 禁止事項

- 実装依存の詳細を記載しない。
- 判定不能な曖昧語を使わない。
- 参照元不明の値を断定しない。

## 8. サンプル（最小でも可）

- 参照: `../samples/prj-deliverables-catalog-sample.md`

## 9. 生成 AI への指示テンプレート

- 参照: `../instructions/prj-deliverables-catalog-instruction.md`
