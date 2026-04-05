# CONTRIBUTING

`tools/specdojo` を `npmjs.com` に `specdojo` として公開するための手順です。

## 1. 前提

以下を満たしていることを前提とします。

- npm アカウントを持っている
- `npm login` できる
- `tools/specdojo/package.json` の `name` が `specdojo` になっている
- `private` が `false` になっている
- 公開対象に `dist/` と `README.md` が含まれている

## 2. 公開前チェック

リポジトリ root で実行します。

```bash
cd /workspaces/specdojo-handbook
npm --workspace tools/specdojo run build
npm pack --workspace tools/specdojo --dry-run
```

確認ポイント:

- build が成功する
- `npm pack --dry-run` で `dist/` と `README.md` が含まれる
- 不要なファイルが tarball に入っていない

## 3. パッケージ名の確認

`specdojo` 名が空いているかを確認します。

```bash
npm view specdojo name version
```

- 404 の場合: 未使用の可能性が高い
- 既存パッケージがある場合: 名前変更または scoped package を検討する

## 4. バージョン更新

同じバージョンは再公開できないため、公開前に必要に応じてバージョンを上げます。

```bash
npm version patch --workspace tools/specdojo
```

必要に応じて `minor` または `major` を使います。

## 5. npm ログイン

```bash
npm login
npm whoami
```

`npm whoami` で想定アカウント名が表示されることを確認します。

## 6. GitHub Actions + Trusted Publishing で自動公開する場合

このリポジトリには `.github/workflows/publish-specdojo.yml` を配置し、`main` への push 時に npm の **Trusted Publishing (OIDC)** で自動 publish できるようにします。

> Trusted Publishing を使う場合、通常の `NPM_TOKEN` Secret は publish 用には不要です。

### 6.1. npmjs.com で Trusted Publisher を設定する

1. `https://www.npmjs.com/` にログインする
2. `specdojo` の package settings を開く
3. **Trusted Publisher** セクションで **GitHub Actions** を選ぶ
4. 以下を入力する
   - **Organization or user**: `specdojo`
   - **Repository**: `specdojo-handbook`
   - **Workflow filename**: `publish-specdojo.yml`
   - **Environment name**: 空欄（GitHub Environment を使う場合のみ指定）
5. 保存する

### 6.2. GitHub Actions 側の要件

workflow 側では以下が必要です。

- GitHub-hosted runner を使う
- `permissions.id-token: write` を付ける
- npm docs 推奨に合わせて Node.js 24 系を使う

このリポジトリの `publish-specdojo.yml` はこの構成に合わせています。

### 6.3. 自動公開の条件

- `main` ブランチへ push される
- `tools/specdojo/**` など publish 関連ファイルに変更がある
- `tools/specdojo/package.json` の `version` が npm 上の公開済み version と異なる

同じ `version` がすでに npm に存在する場合は、workflow は publish をスキップします。

### 6.4. 運用手順

1. `tools/specdojo/package.json` の `version` を更新する
2. `main` に merge / push する
3. GitHub Actions の `Publish specdojo to npm` が自動実行される

必要なら `workflow_dispatch` から手動実行もできます。

### 6.5. 2FA と token の扱い

- GitHub Actions からの publish では、**bypass 2FA token より Trusted Publishing を優先**します
- Trusted Publishing が動作確認できたら、npm の package settings で **Require two-factor authentication and disallow tokens** を有効化する運用が安全です
- ただし、将来 private package の install が必要になった場合は、`npm ci` 用に **read-only token** が別途必要になることがあります

## 7. 手動で公開する場合

### 7.1. リポジトリ root から公開する場合

```bash
cd /workspaces/specdojo-handbook
npm publish --workspace tools/specdojo --access public
```

### 7.2. パッケージディレクトリで公開する場合

```bash
cd /workspaces/specdojo-handbook/tools/specdojo
npm publish --access public
```

## 8. 公開後の確認

```bash
npm view specdojo
npx specdojo --help
```

確認ポイント:

- npm レジストリに `specdojo` が表示される
- `npx specdojo --help` が動作する

## 9. よくある注意点

### 9.1. 同じバージョンは再公開できない

公開済みの `version` は再利用できません。再公開時は必ずバージョンを更新します。

### 9.2. 名前が取得できない場合

`403` や name conflict が出る場合は、次のいずれかを検討します。

- 別名に変更する
- scoped package にする
  - 例: `@naoji3x/specdojo`

### 9.3. `dist/` が空または古い場合

公開前に必ず build を実行します。

```bash
npm --workspace tools/specdojo run build
```

## 10. このリポジトリの現在設定

`tools/specdojo/package.json` は公開向けに以下の設定になっています。

- `name`: `specdojo`
- `private`: `false`
- `publishConfig.access`: `public`
- `bin.specdojo`: `dist/specdojo.js`
- `files`: `dist`, `README.md`
