---
id: dct-index
type: project
status: draft
rulebook: dct-index-rulebook
---

# 成果物カタログ索引 サンプル

## 1. 共通ルール

- `local-id` は成果物の論理名とし、ファイル名・Frontmatter `id` の基礎として使用する（例: `prj-overview`）。
- 成果物本体のファイル名は `<local-id>.md` 形式とする。
- 成果物本体の Frontmatter `id` は `<project-id>:<local-id>` 形式とする。
- `根拠` には主要な依存関係を `local-id` で記載する。
- `based_on` には直接根拠のみを記載し、`根拠` と差分があってもよい。
- 種別は `work` / `control` / `generated` の3値のみを使用し、WBS 展開対象は `work` のみとする。

## 2. 成果物カタログ一覧

| ドメイン           | 名称               | 成果物カタログ           | 概要                                                 |
| ------------------ | ------------------ | ------------------------ | ---------------------------------------------------- |
| project-definition | プロジェクト定義   | `dct-project-definition` | 目的、スコープ、前提条件などの定義成果物を管理する。 |
| project-management | プロジェクト管理   | `dct-project-management` | 計画、課題、進捗、会議体などの管理成果物を管理する。 |
| product-change     | プロダクト変更管理 | `dct-product-change`     | 変更要求から反映判断までの変更管理成果物を管理する。 |
