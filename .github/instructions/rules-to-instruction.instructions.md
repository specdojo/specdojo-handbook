# Rules→Instruction 変換運用ルール

このファイルは、`docs/ja/handbook/rules` 配下の `*-rules.md` を要約し、
対応する `docs/ja/handbook/instructions/*-instruction.md` を作成/更新するための共通運用ルールです。

## 1. 目的

- ルール更新時に、指示テンプレート（instruction）への反映漏れを防ぐ
- 生成AI向けの指示を、毎回ゼロから書かずに再利用可能にする
- ルール本文と指示テンプレートの責務境界を維持する

## 2. 入出力の対応

- 入力: `docs/ja/handbook/rules/<name>-rules.md`
- 出力: `docs/ja/handbook/instructions/<name>-instruction.md`

対応原則:

- `<name>` は同一（例: `utc-index-rules.md` → `utc-index-instruction.md`）
- `meta-*-rules.md` は instruction 変換対象外（新規作成/更新ともに行わない）
- 対応先が存在しない場合は新規作成
- 対応先が存在する場合はアップサート（差分反映）

## 3. 変換方針（必須）

1. `rules` をそのまま複製せず、**生成AIへの実行指示**として再構成する
2. ルールの必須要件（見出し順、必須表、禁止事項、最終チェック）を落とさない
3. 参照元ルールの語彙と整合する（`index`/`overview` などの命名ゆれを持ち込まない）
4. 曖昧語（十分/適切/問題ない）を避け、判定可能な指示にする
5. 不要な実装依存情報（SQL全文、具体クラス名等）は追加しない
6. `*-rules.md` 側の「生成 AI への指示テンプレート」セクションは、対応する `*-instruction.md` へのリンクを記載し、最小テンプレート本文は保持しない

## 4. 生成する instruction の推奨構成

1. 目的と前提
2. 入力情報
3. 出力フォーマット（Frontmatter + 見出し順）
4. 記述ルール（章ごとの必須要素）
5. 禁止事項
6. 最終チェック（自己検査）

## 5. 変更時の整合チェック

- `rules` 側で追加された「必須章」「必須表」「責務分担」を instruction 側へ反映
- 章番号と見出し名称の整合を確認
- `index` 系ドキュメントでは「共通原則」「採用基準」「分配方針」の有無を確認
- `rules` 側の「生成 AI への指示テンプレート」は、リンクのみで運用され最小テンプレート本文が削除されていることを確認
- 反映後は Markdown lint を実行

推奨コマンド:

- `npm run -s lint:md`
