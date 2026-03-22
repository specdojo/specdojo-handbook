# Agent Brief: T-SDH-GOV-040

このブリーフは ready 時点の実行ビューであり、進捗の正本ではない。
進捗・監査・状態判定は exec/events のイベントログを参照する。

## 1. タスク概要

- task_id: `T-SDH-GOV-040`
- project_id: `prj-0001`
- dojo_cli_project: `shj-0001`
- name: 共有メタルールブックガバナンスセットの整合
- owner: ARC
- kind: task
- artifact_kind: rules の起草・レビュー
- schedule_file: `sch-governance.yaml`
- wbs: `WBS-GOV-META-040`
- duration_days: `0.75`

## 2. 実施内容

- primary_goal: 共有メタルールブックガバナンスセットの整合
- schedule_notes: Agent-Ultra: Phase 1 はエージェント起草・修正・レビューを連続実行し、中間の人間承認は省略可能。最終承認は後段で一括実施。
- tags: `governance`, `rules-lifecycle`, `meta`, `agent-ultra`

## 3. 対象成果物候補

primary_paths:

- docs/ja/handbook/rules/meta-document-metadata-rules.md
- docs/ja/handbook/rules/meta-id-and-file-naming-rules.md
- docs/ja/handbook/rules/meta-rulebook-structure-rules.md
- docs/ja/handbook/rules/meta-test-document-scope-rules.md

secondary_paths:

- なし

## 4. 依存と優先度

- depends_on: `M-SDH-100`
- critical_first_rank: `10`
- fifo_rank: `7`
- urgency: 遅延余裕あり（slack=4）。
- CPM: `ES=0, EF=0.75, LS=4, LF=4.75, slack=4`

## 5. 実行ガイド

1. 対象 task を claim する。
2. 対応する rules / instruction / input-template / sample の対象を特定する。
3. task 名と notes に沿って成果物を更新する。
4. 必要な検証と lint を実行する。
5. 完了時のみ complete、問題があれば block を記録する。

```bash
dojo exec claim --project shj-0001 --task T-SDH-GOV-040 --by <agent> --msg "start"
# edit / validate / lint
dojo exec complete --project shj-0001 --task T-SDH-GOV-040 --by <agent> --msg "done"
```

## 6. block 時の記録テンプレート

- block_conditions: 依存未解決、レビュー不能、対象ファイル不明、lint/test 未解消
- block_msg_template:

```text
blocked: <reason>; need=<next action>; ref=<path or issue>
```

```bash
dojo exec block --project shj-0001 --task T-SDH-GOV-040 --by <agent> --msg "blocked: <reason>; need=<next action>; ref=<path or issue>"
```

## 7. 注意事項

- このファイルに進捗を追記しない。状態は events のみを正本とする。
- 依存未解決やレビュー不能時は complete ではなく block を記録する。
- Agent-Ultra 前提でも最終承認の扱いは schedule と運用ルールに従う。

## 8. 参照先

- ready source: `generated/ready.json`
- task catalog: `generated/task-catalog.md`
- CPM summary: `generated/cpm.md`
- critical path: `generated/critical-path.md`
- execution events: `exec/events/*.json`
