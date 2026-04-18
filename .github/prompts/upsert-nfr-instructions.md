# Rules から Instructions をアップサート

@file:.github/skills/rules-to-instruction/SKILL.md

以下の対応表に従って、`rules` の内容を要約し、
生成AI向け指示ファイル `instruction` を作成または更新してください。

要件:

- 対応する `instruction` が存在しない場合は新規作成
- 存在する場合はアップサート（不足項目の追記・不整合の修正）
- 見出し順・必須項目・禁止事項・最終チェックを `rules` と整合
- 反映後に Markdown lint を実行

対象対応表（必要に応じて行を追加）:

| rules                                                | instruction                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| /docs/ja/handbook/rulebooks/nfr-index-rulebook.md           | /docs/ja/handbook/instructions/nfr-index-instruction.md           |
| /docs/ja/handbook/rulebooks/nfr-reliability-rulebook.md     | /docs/ja/handbook/instructions/nfr-reliability-instruction.md     |
| /docs/ja/handbook/rulebooks/nfr-availability-rulebook.md    | /docs/ja/handbook/instructions/nfr-availability-instruction.md    |
| /docs/ja/handbook/rulebooks/nfr-maintainability-rulebook.md | /docs/ja/handbook/instructions/nfr-maintainability-instruction.md |
| /docs/ja/handbook/rulebooks/nfr-integrity-rulebook.md       | /docs/ja/handbook/instructions/nfr-integrity-instruction.md       |
| /docs/ja/handbook/rulebooks/nfr-security-safety-rulebook.md | /docs/ja/handbook/instructions/nfr-security-safety-instruction.md |
| /docs/ja/handbook/rulebooks/nfr-performance-rulebook.md     | /docs/ja/handbook/instructions/nfr-performance-instruction.md     |
| /docs/ja/handbook/rulebooks/nfr-operations-rulebook.md      | /docs/ja/handbook/instructions/nfr-operations-instruction.md      |
| /docs/ja/handbook/rulebooks/nfr-usability-rulebook.md       | /docs/ja/handbook/instructions/nfr-usability-instruction.md       |

出力:

- 変更したファイル一覧
- 各ファイルの要点（何を反映したか）
- lint結果
