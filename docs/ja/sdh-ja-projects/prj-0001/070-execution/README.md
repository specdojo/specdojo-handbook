# prj-0001 Execution Layout

このディレクトリは `docs/ja/sdh-ja-projects/prj-0001/060-schedule` で定義した schedule を実行するための実行領域である。

## 1. ディレクトリ責務

```text
070-execution/
├─ exec/
│  ├─ events/
│  └─ .locks/
└─ generated/
```

- `exec/events/`: append-only の実行イベント JSON
- `exec/.locks/`: scheduler の排他ロック
- `generated/`: `dojo exec build` が生成する派生ファイル

## 2. 主な generated ファイル

`dojo exec build --project shj-0001` 実行後、`generated/` に以下が出力される。

- `state.json`: task state snapshot（全 task の現在状態: todo/doing/blocked/done/cancelled）
- `ready.md`: 人間向け ready 一覧（strategy 別に整形済み）
- `ready.json`: strategy ごとの順序付き ready キュー
- `claim-next.json`: strategy ごとの次の claim 対象
- `cpm.json` / `cpm.md`: CPM 計算結果
- `critical-path.md`: クリティカルパスと slack 分析
- `timeline.md` / `timeline.svg`: プロジェクトタイムライン（Gantt-like 表示）
- `schedule-diff.md`: スケジュールスキーマ差分（前回ビルドからの追加/削除/変更）
- `metadata.json`: 生成メタデータ（タイムスタンプ、schedule ファイル数、派生ファイル一覧）

## 3. Ready と Claim の見方

- 既定戦略は `critical-first`
- `ready.md` は人が読むための一覧
- `ready.json` は自動化が読むための順序付きキュー
- `claim-next.json` はその時点の claim 候補を strategy 別に固定して出す

`critical-first` は以下の順に選ぶ。

1. slack が小さい task
2. ES が小さい task
3. ID が昇順の task

## 4. 基本コマンド

```bash
dojo exec validate --project shj-0001
dojo exec build --project shj-0001
dojo exec scheduler --project shj-0001 --by agent-1
```

`dojo exec where --project shj-0001` を使うと、schedule と execution の実パスを確認できる。
