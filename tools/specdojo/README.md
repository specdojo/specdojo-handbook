# specdojo

CLI for SpecDojo specification-driven execution workflows.

## Install

```bash
npm install -g specdojo
```

Or run via `npx`:

```bash
npx specdojo --help
```

## Quick start

Initialize config:

```bash
specdojo config init
```

List projects:

```bash
specdojo project list
```

Validate and build execution artifacts:

```bash
specdojo exec validate --project shj-0001
specdojo exec build --project shj-0001
```

Claim the next task:

```bash
specdojo exec scheduler --project shj-0001 --by copilot --owner ARC
```

## Config file

Create `specdojo.config.json` in the repository root.

```json
{
  "version": 1,
  "projects": {
    "shj-0001": {
      "schedule_path": "docs/ja/projects/prj-0001/060-schedule",
      "execution_path": "docs/ja/projects/prj-0001/070-execution",
      "members_path": "docs/ja/projects/prj-0001/040-project-management/010-management-plan/members.yaml"
    }
  }
}
```
