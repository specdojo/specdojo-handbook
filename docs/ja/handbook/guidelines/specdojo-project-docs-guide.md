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
            │   ├── prj-overview.md
            │   ├── prj-charter.md
            │   └── prj-stakeholder-register.md
            │
            ├── 020-project-scope/
            │   ├── prj-scope.md
            │   ├── prj-success-and-acceptance-criteria.md
            │   └── prj-deliverables-catalog.md
            │
            ├── 030-project-issues-and-approach/
            │   ├── prj-issues-and-approach.md
            │   ├── prj-assumptions-constraints-dependencies.md
            │   └── prj-comparison-of-alternatives.md
            │
            ├── 040-project-management/
            │   ├── 010-management-plan/
            │   │   ├── pm-plan.md
            │   │   ├── pm-communication-plan.md
            │   │   ├── pm-quality-management-plan.md
            │   │   ├── pm-organization-and-raci.md
            │   │   ├── pm-wbs-decomposition-strategy.md
            │   │   └── pm-wbs-to-schedule-strategy.md
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
