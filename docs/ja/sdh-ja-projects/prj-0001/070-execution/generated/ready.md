# Ready Tasks

- schedule_path: `docs/ja/sdh-ja-projects/prj-0001/060-schedule`
- execution_path: `docs/ja/sdh-ja-projects/prj-0001/070-execution`
- ready_count: `10`
- default_strategy: `critical-first`

## Claim Targets

| strategy | next_task_id |
|---|---|
| critical-first | `T-SDH-DES-020` |
| fifo | `T-SDH-BIZ-030` |

## Ready Order (critical-first)

| rank | id | owner | slack | ES | schedule_file |
|---:|---|---|---:|---:|---|
| 1 | `T-SDH-DES-020` | ARC | 0 | 0 | sch-design.yaml |
| 2 | `T-SDH-DES-010` | ARC | 0.75 | 0 | sch-design.yaml |
| 3 | `T-SDH-DES-060` | ARC | 1.75 | 0 | sch-design.yaml |
| 4 | `T-SDH-QLT-020` | QE | 1.75 | 0 | sch-quality.yaml |
| 5 | `T-SDH-NFR-010` | QE | 2.25 | 0 | sch-nfr.yaml |
| 6 | `T-SDH-BIZ-030` | BA | 2.5 | 0 | sch-business.yaml |
| 7 | `T-SDH-BIZ-070` | BA | 2.75 | 0 | sch-business.yaml |
| 8 | `T-SDH-BIZ-060` | BA | 3.25 | 0 | sch-business.yaml |
| 9 | `T-SDH-QLT-010` | QE | 3.25 | 0 | sch-quality.yaml |
| 10 | `T-SDH-GOV-040` | ARC | 3.5 | 0 | sch-governance.yaml |

## FIFO Order

- `T-SDH-BIZ-030`
- `T-SDH-BIZ-060`
- `T-SDH-BIZ-070`
- `T-SDH-DES-010`
- `T-SDH-DES-020`
- `T-SDH-DES-060`
- `T-SDH-GOV-040`
- `T-SDH-NFR-010`
- `T-SDH-QLT-010`
- `T-SDH-QLT-020`
