module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新機能
        'fix', // バグ修正
        'docs', // ドキュメント変更
        'style', // コードスタイル変更（機能に影響なし）
        'refactor', // リファクタリング
        'perf', // パフォーマンス改善
        'test', // テスト追加/修正
        'build', // ビルドシステム変更
        'ci', // CI設定変更
        'chore', // その他の変更
        'revert', // 変更の取り消し
      ],
    ],
    // Allow camelCase, PascalCase (e.g., class names) and uppercase acronyms; still enforce valid casing
    'subject-case': [
      2,
      'always',
      ['lower-case', 'sentence-case', 'start-case', 'pascal-case', 'upper-case', `camel-case`],
    ],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100],
  },
}
