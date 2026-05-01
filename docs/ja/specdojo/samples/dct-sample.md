---
id: prj-0001:dct-sample
type: project
status: draft
part_of:
  - prj-0001:dct-index
rulebook: dct-rulebook
---

# 成果物カタログ: プロジェクト定義

Project Deliverables Catalog: Project Definition

駄菓子屋きぬや販売管理システム構築プロジェクトのプロジェクト定義ドメインに属する成果物を一覧化したカタログです。
各成果物の `local-id`・種別・根拠・配置先・概要をメタ情報として管理し、プロジェクト内のトレーサビリティを確保します。
成果物の詳細な本文内容は各成果物ファイルを正とし、このカタログはメタ情報の管理に専念します。

- project-id: prj-0001
- ドメイン: project-definition
- 配置先: docs/ja/projects/prj-0001/020-project-definition/

| `local-id`                | `ARTIFACT` | 成果物名         | 種別      | 根拠                       | 概要                                                     |
| ------------------------- | ---------- | ---------------- | --------- | -------------------------- | -------------------------------------------------------- |
| `prj-overview`            | OVERVIEW   | プロジェクト概要 | work      | -                          | 駄菓子屋の販売管理システムの目的と全体方針を定義する。   |
| `prj-scope`               | SCOPE      | スコープ定義     | work      | `prj-overview`             | 対象業務と対象外業務を明確化し、合意境界を固定する。     |
| `prj-issues-and-approach` | ISSUES     | 課題と方針       | work      | `prj-scope`                | 初期課題と対応方針を整理し、計画立案の前提を明示する。   |
| `prj-glossary`            | GLOSSARY   | 用語集           | control   | `prj-overview`             | 業務用語と略語の定義を統一し、文書間の解釈差を防ぐ。     |
| `prj-definition-summary`  | SUMMARY    | 定義サマリー     | generated | `prj-overview`,`prj-scope` | 定義系成果物の要点を参照用に集約した派生文書を提供する。 |
