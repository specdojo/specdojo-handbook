---
id: trc-requirements-to-tests-instruction
type: instruction
status: draft
rulebook: trc-requirements-to-tests-rulebook
based_on: []
supersedes: []
---

# トレーサビリティ（要求→テスト）作成の指示テンプレート

Requirements Traceability (Requirements to Tests) Instruction Template

このテンプレートは、要求とテストの対応関係を整理する `trc-requirements-to-tests` ドキュメントを生成するための指示です。出力は Markdown とし、要求漏れ・テスト漏れの判定ができる形式で記述してください。

## 1. 目的と前提

- 目的は、要求IDと対応テストIDの対応を可視化し、漏れを防ぐこと。
- 対象は「トレース関係の定義と状態管理」であり、テスト手順本文の詳細記述は対象外とする。
- 1 行は 1 つの対応命題（要求IDと対応テストID）を原則とする。

## 2. 入力情報

以下の情報が与えられている前提で作成する。未確定項目はギャップとして明示する。

- 要求一覧（要求ID、要求要約、優先度）
- テスト一覧（テストID、テスト要約、テストレベル）
- 要求とテストの既知の対応関係
- 充足状況判断の基準
- ギャップ解消に関する方針案、担当、期限

## 3. 出力フォーマット

### 3.1. Frontmatter

先頭に YAML Frontmatter を置き、以下を満たす。

- 必須: `id`, `type`, `status`, `rulebook`
- 任意: `based_on`, `supersedes`
- `id` は `trc-requirements-to-tests`
- `type` は `project`
- `rulebook` は `trc-requirements-to-tests-rulebook`

```yaml
---
id: trc-requirements-to-tests
type: project
status: draft
rulebook: trc-requirements-to-tests-rulebook
based_on: []
supersedes: []
---
```

### 3.2. 本文見出し

本文は次の見出しをこの順序で含める。

1. 目的と適用範囲
2. トレース対象の前提
3. トレースマトリクス
4. 充足状況サマリ
5. ギャップと対応方針
6. 変更履歴と更新ルール

## 4. 記述ルール

- トレースマトリクスは表形式で記載し、以下のカラムを必須とする。
  - 要求ID
  - 要求要約
  - 対応テストID
  - 充足状況（`未着手` / `一部充足` / `充足`）
  - ギャップ
  - 備考
- 充足状況サマリでは、状態別件数と優先対応対象を示す。
- ギャップと対応方針には、解消方針・担当・期限・判定条件を記載する。
- 方針未確定は `_UNDECIDED_:` で明示する。

## 5. 禁止事項

- 要求本文・テスト本文の全文転記を行わない。
- 要求IDまたは対応テストIDが空の行を作成しない。
- 充足状況に曖昧語（例: ほぼ対応、だいたい完了）を使わない。
- ギャップを「なし」としながら対応テストID未記載を許容しない。

## 6. 最終チェック

- Frontmatter が `id` / `type` / `status` / `rulebook` を満たしている。
- 本文見出しが指定順序で揃っている。
- トレースマトリクスの必須カラムが揃っている。
- 充足状況が `未着手` / `一部充足` / `充足` のいずれかで記載されている。
- 主要ギャップに解消方針・担当・期限がある。
- 禁止事項に抵触しない。
