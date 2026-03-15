# Ready Tasks

- schedule_path: `docs/ja/sdh-ja-projects/prj-0001/060-schedule`
- execution_path: `docs/ja/sdh-ja-projects/prj-0001/070-execution`
- ready_count: `1`
- default_strategy: `critical-first`

## Claim Targets

| strategy | next_task_id |
|---|---|
| critical-first | `T-SDH-GOV-040` |
| fifo | `T-SDH-GOV-040` |

## Ready Order (critical-first)

| rank | id | owner | slack | ES | schedule_file |
|---:|---|---|---:|---:|---|
| 1 | `T-SDH-GOV-040` | ARC | 2.5 | 0 | sch-governance.yaml |

## FIFO Order

- `T-SDH-GOV-040`
