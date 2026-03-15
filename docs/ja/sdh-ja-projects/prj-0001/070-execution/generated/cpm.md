# CPM

- project_duration_days: `11.5`

| id | owner | kind | dur | ES | EF | LS | LF | slack | depends_on |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| `M-SDH-100` | PO | milestone | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `T-SDH-GOV-010` | PO | task | 1 | 0 | 1 | 0 | 1 | 0 | M-SDH-100 |
| `T-SDH-GOV-040` | ARC | task | 0.75 | 0 | 0.75 | 2.5 | 3.25 | 2.5 | M-SDH-100 |
| `T-SDH-GOV-011` | PO | task | 0.75 | 1 | 1.75 | 2.5 | 3.25 | 1.5 | T-SDH-GOV-010 |
| `T-SDH-GOV-020` | PO | task | 1.25 | 1 | 2.25 | 1 | 2.25 | 0 | T-SDH-GOV-010 |
| `T-SDH-GOV-030` | PO | task | 0.75 | 1 | 1.75 | 2 | 2.75 | 1 | T-SDH-GOV-010 |
| `T-SDH-GOV-031` | PO | task | 0.5 | 1.75 | 2.25 | 2.75 | 3.25 | 1 | T-SDH-GOV-030 |
| `T-SDH-GOV-021` | PO | task | 1 | 2.25 | 3.25 | 2.25 | 3.25 | 0 | T-SDH-GOV-020 |
| `M-SDH-200` | PO | milestone | 0 | 3.25 | 3.25 | 3.25 | 3.25 | 0 | M-SDH-GOV-900 |
| `M-SDH-GOV-900` | PO | milestone | 0 | 3.25 | 3.25 | 3.25 | 3.25 | 0 | T-SDH-GOV-011, T-SDH-GOV-021, T-SDH-GOV-031, T-SDH-GOV-040 |
| `T-SDH-BIZ-010` | BA | task | 0.5 | 3.25 | 3.75 | 3.25 | 3.75 | 0 | M-SDH-200 |
| `T-SDH-BIZ-030` | BA | task | 0.5 | 3.25 | 3.75 | 5.25 | 5.75 | 2 | M-SDH-200 |
| `T-SDH-BIZ-060` | BA | task | 0.5 | 3.25 | 3.75 | 6.25 | 6.75 | 3 | M-SDH-200 |
| `T-SDH-BIZ-070` | BA | task | 1 | 3.25 | 4.25 | 5.25 | 6.25 | 2 | M-SDH-200 |
| `T-SDH-NFR-010` | QE | task | 0.5 | 3.25 | 3.75 | 5.25 | 5.75 | 2 | M-SDH-200 |
| `T-SDH-BIZ-011` | BA | task | 0.25 | 3.75 | 4 | 6.75 | 7 | 3 | T-SDH-BIZ-010 |
| `T-SDH-BIZ-020` | BA | task | 0.5 | 3.75 | 4.25 | 3.75 | 4.25 | 0 | T-SDH-BIZ-010 |
| `T-SDH-BIZ-031` | BA | task | 0.25 | 3.75 | 4 | 6.75 | 7 | 3 | T-SDH-BIZ-030 |
| `T-SDH-BIZ-040` | BA | task | 0.5 | 3.75 | 4.25 | 6.25 | 6.75 | 2.5 | T-SDH-BIZ-030 |
| `T-SDH-BIZ-050` | BA | task | 0.5 | 3.75 | 4.25 | 6.25 | 6.75 | 2.5 | T-SDH-BIZ-010 |
| `T-SDH-BIZ-061` | BA | task | 0.25 | 3.75 | 4 | 6.75 | 7 | 3 | T-SDH-BIZ-060 |
| `T-SDH-BIZ-100` | BA | task | 0.5 | 3.75 | 4.25 | 6.25 | 6.75 | 2.5 | T-SDH-BIZ-030 |
| `T-SDH-BIZ-110` | BA | task | 0.75 | 3.75 | 4.5 | 5.75 | 6.5 | 2 | T-SDH-BIZ-030 |
| `T-SDH-BIZ-120` | BA | task | 0.5 | 3.75 | 4.25 | 6.25 | 6.75 | 2.5 | T-SDH-BIZ-030 |
| `T-SDH-NFR-011` | QE | task | 0.25 | 3.75 | 4 | 6.75 | 7 | 3 | T-SDH-NFR-010 |
| `T-SDH-NFR-020` | QE | task | 0.5 | 3.75 | 4.25 | 6.25 | 6.75 | 2.5 | T-SDH-NFR-010 |
| `T-SDH-NFR-030` | QE | task | 0.5 | 3.75 | 4.25 | 5.75 | 6.25 | 2 | T-SDH-NFR-010 |
| `T-SDH-NFR-040` | QE | task | 0.5 | 3.75 | 4.25 | 6.25 | 6.75 | 2.5 | T-SDH-NFR-010 |
| `T-SDH-NFR-050` | QE | task | 0.5 | 3.75 | 4.25 | 6.25 | 6.75 | 2.5 | T-SDH-NFR-010 |
| `T-SDH-NFR-060` | QE | task | 0.5 | 3.75 | 4.25 | 5.75 | 6.25 | 2 | T-SDH-NFR-010 |
| `T-SDH-NFR-090` | BA | task | 0.5 | 3.75 | 4.25 | 6.25 | 6.75 | 2.5 | T-SDH-NFR-010 |
| `T-SDH-BIZ-021` | BA | task | 0.25 | 4.25 | 4.5 | 6.75 | 7 | 2.5 | T-SDH-BIZ-020 |
| `T-SDH-BIZ-041` | BA | task | 0.25 | 4.25 | 4.5 | 6.75 | 7 | 2.5 | T-SDH-BIZ-040 |
| `T-SDH-BIZ-051` | BA | task | 0.25 | 4.25 | 4.5 | 6.75 | 7 | 2.5 | T-SDH-BIZ-050 |
| `T-SDH-BIZ-071` | BA | task | 0.75 | 4.25 | 5 | 6.25 | 7 | 2 | T-SDH-BIZ-070 |
| `T-SDH-BIZ-080` | BA | task | 0.75 | 4.25 | 5 | 4.25 | 5 | 0 | T-SDH-BIZ-020 |
| `T-SDH-BIZ-101` | BA | task | 0.25 | 4.25 | 4.5 | 6.75 | 7 | 2.5 | T-SDH-BIZ-100 |
| `T-SDH-BIZ-121` | BA | task | 0.25 | 4.25 | 4.5 | 6.75 | 7 | 2.5 | T-SDH-BIZ-120 |
| `T-SDH-NFR-021` | QE | task | 0.25 | 4.25 | 4.5 | 6.75 | 7 | 2.5 | T-SDH-NFR-020 |
| `T-SDH-NFR-031` | QE | task | 0.25 | 4.25 | 4.5 | 6.75 | 7 | 2.5 | T-SDH-NFR-030 |
| `T-SDH-NFR-041` | QE | task | 0.25 | 4.25 | 4.5 | 6.75 | 7 | 2.5 | T-SDH-NFR-040 |
| `T-SDH-NFR-051` | QE | task | 0.25 | 4.25 | 4.5 | 6.75 | 7 | 2.5 | T-SDH-NFR-050 |
| `T-SDH-NFR-061` | QE | task | 0.25 | 4.25 | 4.5 | 6.75 | 7 | 2.5 | T-SDH-NFR-060 |
| `T-SDH-NFR-070` | QE | task | 0.5 | 4.25 | 4.75 | 6.25 | 6.75 | 2 | T-SDH-NFR-060 |
| `T-SDH-NFR-080` | QE | task | 0.5 | 4.25 | 4.75 | 6.25 | 6.75 | 2 | T-SDH-NFR-030 |
| `T-SDH-NFR-091` | BA | task | 0.25 | 4.25 | 4.5 | 6.75 | 7 | 2.5 | T-SDH-NFR-090 |
| `T-SDH-BIZ-111` | BA | task | 0.5 | 4.5 | 5 | 6.5 | 7 | 2 | T-SDH-BIZ-110 |
| `T-SDH-NFR-071` | QE | task | 0.25 | 4.75 | 5 | 6.75 | 7 | 2 | T-SDH-NFR-070 |
| `T-SDH-NFR-081` | QE | task | 0.25 | 4.75 | 5 | 6.75 | 7 | 2 | T-SDH-NFR-080 |
| `M-SDH-NFR-900` | QE | milestone | 0 | 5 | 5 | 7 | 7 | 2 | T-SDH-NFR-011, T-SDH-NFR-021, T-SDH-NFR-031, T-SDH-NFR-041, T-SDH-NFR-051, T-SDH-NFR-061, T-SDH-NFR-071, T-SDH-NFR-081, T-SDH-NFR-091 |
| `T-SDH-BIZ-081` | BA | task | 0.5 | 5 | 5.5 | 5.75 | 6.25 | 0.75 | T-SDH-BIZ-080 |
| `T-SDH-BIZ-090` | BA | task | 0.75 | 5 | 5.75 | 5 | 5.75 | 0 | T-SDH-BIZ-080 |
| `T-SDH-BIZ-130` | BA | task | 0.75 | 5 | 5.75 | 5 | 5.75 | 0 | T-SDH-BIZ-080 |
| `T-SDH-BIZ-091` | BA | task | 0.5 | 5.75 | 6.25 | 5.75 | 6.25 | 0 | T-SDH-BIZ-090 |
| `T-SDH-BIZ-131` | BA | task | 0.5 | 5.75 | 6.25 | 5.75 | 6.25 | 0 | T-SDH-BIZ-130 |
| `T-SDH-BIZ-140` | BA | task | 0.5 | 6.25 | 6.75 | 6.25 | 6.75 | 0 | T-SDH-BIZ-081, T-SDH-BIZ-091, T-SDH-BIZ-131 |
| `T-SDH-BIZ-141` | BA | task | 0.25 | 6.75 | 7 | 6.75 | 7 | 0 | T-SDH-BIZ-140 |
| `M-SDH-300` | PO | milestone | 0 | 7 | 7 | 7 | 7 | 0 | M-SDH-BIZ-900, M-SDH-NFR-900 |
| `M-SDH-BIZ-900` | BA | milestone | 0 | 7 | 7 | 7 | 7 | 0 | T-SDH-BIZ-011, T-SDH-BIZ-021, T-SDH-BIZ-031, T-SDH-BIZ-041, T-SDH-BIZ-051, T-SDH-BIZ-061, T-SDH-BIZ-071, T-SDH-BIZ-081, T-SDH-BIZ-091, T-SDH-BIZ-101, T-SDH-BIZ-111, T-SDH-BIZ-121, T-SDH-BIZ-131, T-SDH-BIZ-141 |
| `T-SDH-DES-010` | ARC | task | 1.25 | 7 | 8.25 | 7.5 | 8.75 | 0.5 | M-SDH-300 |
| `T-SDH-DES-020` | ARC | task | 0.75 | 7 | 7.75 | 7 | 7.75 | 0 | M-SDH-300 |
| `T-SDH-DES-060` | ARC | task | 0.5 | 7 | 7.5 | 9 | 9.5 | 2 | M-SDH-300 |
| `T-SDH-QLT-010` | QE | task | 0.5 | 7 | 7.5 | 10.75 | 11.25 | 3.75 | M-SDH-300 |
| `T-SDH-QLT-020` | QE | task | 0.5 | 7 | 7.5 | 9 | 9.5 | 2 | M-SDH-300 |
| `T-SDH-DES-061` | ARC | task | 0.25 | 7.5 | 7.75 | 9.5 | 9.75 | 2 | T-SDH-DES-060 |
| `T-SDH-QLT-011` | QE | task | 0.25 | 7.5 | 7.75 | 11.25 | 11.5 | 3.75 | T-SDH-QLT-010 |
| `T-SDH-QLT-021` | QE | task | 0.25 | 7.5 | 7.75 | 9.5 | 9.75 | 2 | T-SDH-QLT-020 |
| `T-SDH-DES-021` | ARC | task | 0.5 | 7.75 | 8.25 | 11 | 11.5 | 3.25 | T-SDH-DES-020 |
| `T-SDH-DES-030` | ARC | task | 0.75 | 7.75 | 8.5 | 7.75 | 8.5 | 0 | T-SDH-DES-020 |
| `T-SDH-DES-050` | ARC | task | 0.5 | 7.75 | 8.25 | 9 | 9.5 | 1.25 | T-SDH-DES-020 |
| `T-SDH-QLT-030` | QE | task | 0.75 | 7.75 | 8.5 | 10.25 | 11 | 2.5 | T-SDH-QLT-021 |
| `T-SDH-QLT-040` | QE | task | 0.75 | 7.75 | 8.5 | 10.25 | 11 | 2.5 | T-SDH-QLT-021 |
| `T-SDH-QLT-050` | QE | task | 1 | 7.75 | 8.75 | 9.75 | 10.75 | 2 | T-SDH-QLT-021 |
| `T-SDH-QLT-060` | QE | task | 0.75 | 7.75 | 8.5 | 10.25 | 11 | 2.5 | T-SDH-QLT-021 |
| `T-SDH-QLT-070` | BA | task | 1 | 7.75 | 8.75 | 9.75 | 10.75 | 2 | T-SDH-QLT-021 |
| `T-SDH-DES-011` | ARC | task | 1 | 8.25 | 9.25 | 8.75 | 9.75 | 0.5 | T-SDH-DES-010 |
| `T-SDH-DES-051` | ARC | task | 0.25 | 8.25 | 8.5 | 9.5 | 9.75 | 1.25 | T-SDH-DES-050 |
| `T-SDH-DES-031` | ARC | task | 0.5 | 8.5 | 9 | 11 | 11.5 | 2.5 | T-SDH-DES-030 |
| `T-SDH-DES-040` | ARC | task | 0.75 | 8.5 | 9.25 | 8.5 | 9.25 | 0 | T-SDH-DES-030 |
| `T-SDH-QLT-031` | QE | task | 0.5 | 8.5 | 9 | 11 | 11.5 | 2.5 | T-SDH-QLT-030 |
| `T-SDH-QLT-041` | QE | task | 0.5 | 8.5 | 9 | 11 | 11.5 | 2.5 | T-SDH-QLT-040 |
| `T-SDH-QLT-061` | QE | task | 0.5 | 8.5 | 9 | 11 | 11.5 | 2.5 | T-SDH-QLT-060 |
| `T-SDH-QLT-051` | QE | task | 0.75 | 8.75 | 9.5 | 10.75 | 11.5 | 2 | T-SDH-QLT-050 |
| `T-SDH-QLT-071` | BA | task | 0.75 | 8.75 | 9.5 | 10.75 | 11.5 | 2 | T-SDH-QLT-070 |
| `T-SDH-DES-041` | ARC | task | 0.5 | 9.25 | 9.75 | 9.25 | 9.75 | 0 | T-SDH-DES-040 |
| `M-SDH-400` | PO | milestone | 0 | 9.5 | 9.5 | 11.5 | 11.5 | 2 | M-SDH-QLT-900 |
| `M-SDH-999` | PO | milestone | 0 | 9.5 | 9.5 | 11.5 | 11.5 | 2 | M-SDH-400 |
| `M-SDH-QLT-900` | QE | milestone | 0 | 9.5 | 9.5 | 11.5 | 11.5 | 2 | T-SDH-QLT-011, T-SDH-QLT-021, T-SDH-QLT-031, T-SDH-QLT-041, T-SDH-QLT-051, T-SDH-QLT-061, T-SDH-QLT-071 |
| `T-SDH-DES-070` | ARC | task | 1 | 9.75 | 10.75 | 9.75 | 10.75 | 0 | T-SDH-DES-011, T-SDH-DES-041, T-SDH-DES-051, T-SDH-DES-061 |
| `T-SDH-DES-071` | ARC | task | 0.75 | 10.75 | 11.5 | 10.75 | 11.5 | 0 | T-SDH-DES-070 |
| `M-SDH-350` | ARC | milestone | 0 | 11.5 | 11.5 | 11.5 | 11.5 | 0 | M-SDH-DES-900 |
| `M-SDH-DES-900` | ARC | milestone | 0 | 11.5 | 11.5 | 11.5 | 11.5 | 0 | T-SDH-DES-011, T-SDH-DES-021, T-SDH-DES-031, T-SDH-DES-041, T-SDH-DES-051, T-SDH-DES-061, T-SDH-DES-071 |
