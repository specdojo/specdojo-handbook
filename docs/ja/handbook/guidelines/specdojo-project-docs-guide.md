---
id: specdojo-project-docs-guide
type: guide
status: draft
---

# SpecDojo プロジェクトドキュメントガイド

## ディレクトリ・ファイル構成

```text
docs/
└── ja/
    └── projects/
        └── prj-0001/
            ├── 010-project-overview/
            │   ├── 010-prj-overview.md
            │   ├── 020-prj-charter.md
            │   └── 030-prj-stakeholder-register.md
            │
            ├── 020-project-scope/
            │   ├── 010-prj-scope.md
            │   ├── 020-prj-success-and-acceptance-criteria.md
            │   └── 030-prj-deliverables-catalog.md
            │
            ├── 030-project-issues-and-approach/
            │   ├── 010-prj-issues-and-approach.md
            │   ├── 020-prj-assumptions-constraints-dependencies.md
            │   └── 030-prj-comparison-of-alternatives.md
            │
            ├── 040-project-management/
            │   ├── 010-management-plan/
            │   │   ├── 010-pm-plan.md
            │   │   ├── 020-pm-communication-plan.md
            │   │   ├── 030-pm-quality-management-plan.md
            │   │   └── 040-pm-organization-and-raci.md
            │   │
            │   ├── 020-controls/
            │   │   ├── pm-risk-register.md
            │   │   ├── pm-issue-log.md
            │   │   └── pm-change-request-log.md
            │   │
            │   └── 030-reporting/
            │       ├── progress-reports/
            │       │   ├── pr-2026-03-01-01.md
            │       │   └── pr-2026-03-08-01.md
            │       │
            │       └── meeting-minutes/
            │           ├── mm-2026-03-01-01.md
            │           └── mm-2026-03-08-01.md
            │
            ├── 050-wbs/
            │   ├── wbs-auth.yaml
            │   ├── wbs-payment.yaml
            │   └── wbs-infra.yaml
            │
            ├── 060-schedule/
            │   ├── sch-milestones.yaml
            │   ├── sch-auth.yaml
            │   ├── sch-auth-api.yaml
            │   └── sch-payment.yaml
            │
            ├── 070-execution/
            │   ├── exec/
            │   │   ├── events/
            │   │   └── .locks/
            │   │
            │   └── generated/
            │
            └── 090-decision-log/
                ├── dec-0001-auth.md
                └── dec-0002-payment.md
```
