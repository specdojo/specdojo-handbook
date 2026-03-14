# CPM

- project_duration_days: `15.5`

| id | owner | kind | dur | ES | EF | LS | LF | slack | depends_on |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| `M-SDH-100` | BO | milestone | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `T-SDH-GOV-010` | BO | task | 1 | 0 | 1 | 0 | 1 | 0 | M-SDH-100 |
| `T-SDH-GOV-050` | EN | task | 0.75 | 0 | 0.75 | 1.75 | 2.5 | 1.75 | M-SDH-100 |
| `T-SDH-GOV-020` | BO | task | 0.5 | 1 | 1.5 | 2 | 2.5 | 1 | T-SDH-GOV-010 |
| `T-SDH-GOV-030` | BO | task | 1 | 1 | 2 | 1 | 2 | 0 | T-SDH-GOV-010 |
| `T-SDH-GOV-040` | BO | task | 0.5 | 2 | 2.5 | 2 | 2.5 | 0 | T-SDH-GOV-030 |
| `M-SDH-200` | BO | milestone | 0 | 2.5 | 2.5 | 2.5 | 2.5 | 0 | T-SDH-GOV-020, T-SDH-GOV-030, T-SDH-GOV-040, T-SDH-GOV-050 |
| `T-SDH-BIZ-010` | BO | task | 0.5 | 2.5 | 3 | 13 | 13.5 | 10.5 | M-SDH-200 |
| `T-SDH-BIZ-020` | BO | task | 0.5 | 2.5 | 3 | 14.5 | 15 | 12 | M-SDH-200 |
| `T-SDH-BIZ-040` | BO | task | 0.75 | 2.5 | 3.25 | 2.5 | 3.25 | 0 | M-SDH-200 |
| `T-SDH-NFR-010` | EN | task | 0.5 | 2.5 | 3 | 2.75 | 3.25 | 0.25 | M-SDH-200 |
| `T-SDH-BIZ-030` | BO | task | 0.5 | 3 | 3.5 | 15 | 15.5 | 12 | T-SDH-BIZ-020 |
| `T-SDH-NFR-020` | EN | task | 0.5 | 3 | 3.5 | 4 | 4.5 | 1 | T-SDH-NFR-010 |
| `T-SDH-NFR-030` | EN | task | 0.5 | 3 | 3.5 | 3.25 | 3.75 | 0.25 | T-SDH-NFR-010 |
| `T-SDH-NFR-040` | EN | task | 0.5 | 3 | 3.5 | 4 | 4.5 | 1 | T-SDH-NFR-010 |
| `T-SDH-NFR-050` | EN | task | 0.5 | 3 | 3.5 | 4 | 4.5 | 1 | T-SDH-NFR-010 |
| `T-SDH-NFR-060` | EN | task | 0.5 | 3 | 3.5 | 3.5 | 4 | 0.5 | T-SDH-NFR-010 |
| `T-SDH-NFR-090` | BO | task | 0.5 | 3 | 3.5 | 4 | 4.5 | 1 | T-SDH-NFR-010 |
| `T-SDH-BIZ-050` | BO | task | 0.5 | 3.25 | 3.75 | 3.25 | 3.75 | 0 | T-SDH-BIZ-040 |
| `T-SDH-NFR-070` | EN | task | 0.5 | 3.5 | 4 | 4 | 4.5 | 0.5 | T-SDH-NFR-060 |
| `T-SDH-NFR-080` | EN | task | 0.75 | 3.5 | 4.25 | 3.75 | 4.5 | 0.25 | T-SDH-NFR-030 |
| `T-SDH-BIZ-060` | BO | task | 0.75 | 3.75 | 4.5 | 3.75 | 4.5 | 0 | T-SDH-BIZ-040, T-SDH-BIZ-050 |
| `M-SDH-300` | EN | milestone | 0 | 4.5 | 4.5 | 4.5 | 4.5 | 0 | T-SDH-BIZ-060, T-SDH-NFR-020, T-SDH-NFR-030, T-SDH-NFR-040, T-SDH-NFR-050, T-SDH-NFR-070, T-SDH-NFR-080, T-SDH-NFR-090 |
| `T-SDH-DES-100` | EN | task | 2 | 4.5 | 6.5 | 4.5 | 6.5 | 0 | M-SDH-300 |
| `T-SDH-DES-CTX-010` | EN | task | 0.5 | 4.5 | 5 | 10.75 | 11.25 | 6.25 | M-SDH-300 |
| `T-SDH-DES-POL-010` | EN | task | 0.5 | 4.5 | 5 | 10.75 | 11.25 | 6.25 | M-SDH-300 |
| `T-SDH-DES-STR-030` | EN | task | 0.5 | 4.5 | 5 | 13 | 13.5 | 8.5 | M-SDH-300 |
| `T-SDH-QLT-100` | BO | task | 2.5 | 4.5 | 7 | 9.5 | 12 | 5 | M-SDH-300 |
| `T-SDH-QLT-CRT-010` | BO | task | 1 | 4.5 | 5.5 | 13.25 | 14.25 | 8.75 | M-SDH-300 |
| `T-SDH-QLT-CRT-020` | BO | task | 1 | 4.5 | 5.5 | 13.25 | 14.25 | 8.75 | M-SDH-300 |
| `T-SDH-QLT-CRT-030` | BO | task | 0.75 | 4.5 | 5.25 | 13.5 | 14.25 | 9 | M-SDH-300, T-SDH-BIZ-010 |
| `T-SDH-DES-CTX-020` | EN | task | 0.75 | 5 | 5.75 | 11.25 | 12 | 6.25 | T-SDH-DES-CTX-010 |
| `T-SDH-DES-POL-020` | EN | task | 0.75 | 5 | 5.75 | 11.25 | 12 | 6.25 | T-SDH-DES-POL-010 |
| `M-SDH-QLT-CRT-900` | BO | milestone | 0 | 5.5 | 5.5 | 14.25 | 14.25 | 8.75 | T-SDH-QLT-CRT-010, T-SDH-QLT-CRT-020, T-SDH-QLT-CRT-030 |
| `M-SDH-DES-CTX-900` | EN | milestone | 0 | 5.75 | 5.75 | 12 | 12 | 6.25 | T-SDH-DES-CTX-020 |
| `M-SDH-DES-POL-900` | EN | milestone | 0 | 5.75 | 5.75 | 12 | 12 | 6.25 | T-SDH-DES-POL-020 |
| `T-SDH-DES-FLOW-010` | EN | task | 0.75 | 5.75 | 6.5 | 12 | 12.75 | 6.25 | M-SDH-DES-CTX-900, M-SDH-DES-POL-900 |
| `T-SDH-DES-FLOW-020` | EN | task | 0.75 | 5.75 | 6.5 | 12.75 | 13.5 | 7 | M-SDH-DES-CTX-900 |
| `T-SDH-DES-STR-010` | EN | task | 0.5 | 5.75 | 6.25 | 13.25 | 13.75 | 7.5 | M-SDH-DES-CTX-900, M-SDH-DES-POL-900 |
| `T-SDH-DES-STR-020` | EN | task | 0.5 | 5.75 | 6.25 | 14 | 14.5 | 8.25 | M-SDH-DES-POL-900 |
| `T-SDH-DES-STR-050` | EN | task | 0.75 | 6.25 | 7 | 13.75 | 14.5 | 7.5 | T-SDH-DES-STR-010, T-SDH-DES-STR-030 |
| `T-SDH-DES-200` | EN | task | 2.5 | 6.5 | 9 | 6.5 | 9 | 0 | T-SDH-DES-100 |
| `T-SDH-DES-FLOW-030` | EN | task | 0.75 | 6.5 | 7.25 | 12.75 | 13.5 | 6.25 | T-SDH-DES-FLOW-010 |
| `M-SDH-DES-FLOW-900` | EN | milestone | 0 | 7.25 | 7.25 | 13.5 | 13.5 | 6.25 | T-SDH-DES-FLOW-020, T-SDH-DES-FLOW-030 |
| `T-SDH-DES-STR-040` | EN | task | 1 | 7.25 | 8.25 | 13.5 | 14.5 | 6.25 | M-SDH-DES-FLOW-900, T-SDH-DES-STR-030 |
| `T-SDH-DES-STR-060` | EN | task | 1 | 8.25 | 9.25 | 14.5 | 15.5 | 6.25 | T-SDH-DES-STR-020, T-SDH-DES-STR-040, T-SDH-DES-STR-050 |
| `T-SDH-DES-300` | EN | task | 3 | 9 | 12 | 9 | 12 | 0 | T-SDH-DES-200 |
| `M-SDH-DES-STR-900` | EN | milestone | 0 | 9.25 | 9.25 | 15.5 | 15.5 | 6.25 | T-SDH-DES-STR-060 |
| `M-SDH-350` | EN | milestone | 0 | 12 | 12 | 12 | 12 | 0 | M-SDH-DES-900 |
| `M-SDH-DES-900` | EN | milestone | 0 | 12 | 12 | 12 | 12 | 0 | T-SDH-DES-300 |
| `T-SDH-QLT-200` | EN | task | 2 | 12 | 14 | 12 | 14 | 0 | M-SDH-350, T-SDH-QLT-100 |
| `T-SDH-QLT-GOV-010` | EN | task | 0.5 | 12 | 12.5 | 14.25 | 14.75 | 2.25 | M-SDH-350, T-SDH-NFR-010 |
| `T-SDH-QLT-VRF-010` | EN | task | 0.75 | 12 | 12.75 | 12.75 | 13.5 | 0.75 | M-SDH-350 |
| `T-SDH-QLT-VRF-020` | EN | task | 0.75 | 12.75 | 13.5 | 13.5 | 14.25 | 0.75 | T-SDH-QLT-VRF-010 |
| `T-SDH-QLT-VRF-030` | BO | task | 0.5 | 13.5 | 14 | 14.25 | 14.75 | 0.75 | T-SDH-QLT-VRF-020, M-SDH-QLT-CRT-900 |
| `M-SDH-QLT-VRF-900` | EN | milestone | 0 | 14 | 14 | 14.75 | 14.75 | 0.75 | T-SDH-QLT-VRF-030 |
| `T-SDH-QLT-300` | EN | task | 1.5 | 14 | 15.5 | 14 | 15.5 | 0 | T-SDH-QLT-200 |
| `T-SDH-QLT-GOV-020` | EN | task | 0.75 | 14 | 14.75 | 14.75 | 15.5 | 0.75 | M-SDH-QLT-CRT-900, M-SDH-QLT-VRF-900, T-SDH-QLT-GOV-010 |
| `M-SDH-QLT-GOV-900` | EN | milestone | 0 | 14.75 | 14.75 | 15.5 | 15.5 | 0.75 | T-SDH-QLT-GOV-020 |
| `M-SDH-400` | BO | milestone | 0 | 15.5 | 15.5 | 15.5 | 15.5 | 0 | M-SDH-QLT-900 |
| `M-SDH-999` | BO | milestone | 0 | 15.5 | 15.5 | 15.5 | 15.5 | 0 | M-SDH-400 |
| `M-SDH-QLT-900` | EN | milestone | 0 | 15.5 | 15.5 | 15.5 | 15.5 | 0 | T-SDH-QLT-300 |
