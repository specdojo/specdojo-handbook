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

## 6. 公開

### 6.1. リポジトリ root から公開する場合

```bash
cd /workspaces/specdojo-handbook
npm publish --workspace tools/specdojo --access public
```

### 6.2. パッケージディレクトリで公開する場合

```bash
cd /workspaces/specdojo-handbook/tools/specdojo
npm publish --access public
```

## 7. 公開後の確認

```bash
npm view specdojo
npx specdojo --help
```

確認ポイント:

- npm レジストリに `specdojo` が表示される
- `npx specdojo --help` が動作する

## 8. よくある注意点

### 8.1. 同じバージョンは再公開できない

公開済みの `version` は再利用できません。再公開時は必ずバージョンを更新します。

### 8.2. 名前が取得できない場合

`403` や name conflict が出る場合は、次のいずれかを検討します。

- 別名に変更する
- scoped package にする
  - 例: `@naoji3x/specdojo`

### 8.3. `dist/` が空または古い場合

公開前に必ず build を実行します。

```bash
npm --workspace tools/specdojo run build
```

## 9. このリポジトリの現在設定

`tools/specdojo/package.json` は公開向けに以下の設定になっています。

- `name`: `specdojo`
- `private`: `false`
- `publishConfig.access`: `public`
- `bin.specdojo`: `dist/specdojo.js`
- `files`: `dist`, `README.md`
