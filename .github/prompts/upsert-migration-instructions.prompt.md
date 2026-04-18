# Rules から Instructions をアップサート

@file:.github/skills/rulebook-to-instruction/SKILL.md

以下の対応表に従って、`rules` の内容を要約し、
生成AI向け指示ファイル `instruction` を作成または更新してください。

要件:

- 対応する `instruction` が存在しない場合は新規作成
- 存在する場合はアップサート（不足項目の追記・不整合の修正）
- 見出し順・必須項目・禁止事項・最終チェックを `rules` と整合
- 反映後に Markdown lint を実行

対象対応表（必要に応じて行を追加）:

| rules                                      | instruction                                             |
| ------------------------------------------ | ------------------------------------------------------- |
| /docs/ja/handbook/rulebooks/mip-index-rulebook.md | /docs/ja/handbook/instructions/mip-index-instruction.md |
| /docs/ja/handbook/rulebooks/dmd-rulebook.md       | /docs/ja/handbook/instructions/dmd-instruction.md       |
| /docs/ja/handbook/rulebooks/mtp-rulebook.md       | /docs/ja/handbook/instructions/mtp-instruction.md       |
| /docs/ja/handbook/rulebooks/cop-rulebook.md       | /docs/ja/handbook/instructions/cop-instruction.md       |
| /docs/ja/handbook/rulebooks/otp-rulebook.md       | /docs/ja/handbook/instructions/otp-instruction.md       |

出力:

- 変更したファイル一覧
- 各ファイルの要点（何を反映したか）
- lint結果
