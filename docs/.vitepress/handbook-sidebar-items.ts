export const handbookSidebarItems = [
  {
    text: 'ガイドライン',
    collapsed: false,
    items: [
      { text: 'ドキュメントの構成', link: '/ja/handbook/guidelines/docs-structure-guide' },
      { text: 'ドキュメントのフェーズ概要', link: '/ja/handbook/guidelines/docs-phases-overview' },
      { text: 'ドキュメントの内容', link: '/ja/handbook/guidelines/docs-contents-guide' },
      { text: 'ドキュメントの書き方', link: '/ja/handbook/guidelines/docs-editing-guide' },
      {
        text: 'プロジェクトマネジメント',
        collapsed: false,
        items: [
          { text: '実行モデル', link: '/ja/handbook/guidelines/specdojo-execution-model-guide' },
          {
            text: 'プロジェクトドキュメント',
            link: '/ja/handbook/guidelines/specdojo-project-docs-guide',
          },
          { text: 'WBS設計', link: '/ja/handbook/guidelines/specdojo-wbs-design-guide' },
          {
            text: '定義からタスクの生成アルゴリズム',
            link: '/ja/handbook/guidelines/specdojo-definition-to-task-algorithm-guide',
          },
        ],
      },
    ],
  },
  {
    text: 'ルール',
    items: [
      {
        text: '共通',
        collapsed: true,
        items: [
          {
            text: 'ドキュメントID命名ルール',
            link: '/ja/handbook/rules/meta-id-and-file-naming-rules',
          },
          {
            text: 'メタ情報記述ルール',
            link: '/ja/handbook/rules/meta-document-metadata-rules',
          },
        ],
      },
      {
        text: 'プロジェクト',
        collapsed: true,
        items: [
          {
            text: 'プロジェクト概要',
            link: '/ja/handbook/rules/prj-overview-rules',
          },
          {
            text: 'プロジェクトスコープ',
            link: '/ja/handbook/rules/prj-scope-rules',
          },
          {
            text: 'プロジェクト課題と解決アプローチ',
            link: '/ja/handbook/rules/prj-issues-and-approach-rules',
          },
        ],
      },
      {
        text: '業務仕様',
        collapsed: true,
        items: [
          {
            text: '概念データフロー図',
            link: '/ja/handbook/rules/cdfd-rules',
            collapsed: true,
            items: [{ text: '図の記法ルール', link: '/ja/handbook/rules/cdfd-mermaid-rules' }],
          },
          {
            text: 'データモデル',
            collapsed: true,
            items: [
              { text: '業務データ辞書', link: '/ja/handbook/rules/bdd-rules' },
              { text: '概念データストア定義', link: '/ja/handbook/rules/cdsd-rules' },
              { text: '保管場所定義', link: '/ja/handbook/rules/sld-rules' },
              { text: 'ステータス定義', link: '/ja/handbook/rules/stsd-rules' },
              { text: '分類定義', link: '/ja/handbook/rules/cld-rules' },
              { text: '概念クラス図', link: '/ja/handbook/rules/ccd-mermaid-rules' },
              { text: '概念状態遷移図', link: '/ja/handbook/rules/cstd-rules' },
            ],
          },
          {
            text: '業務モデル',
            collapsed: true,
            items: [
              { text: '業務プロセス仕様', link: '/ja/handbook/rules/bps-rules' },
              { text: 'ビジネスルール', link: '/ja/handbook/rules/br-rules' },
              { text: '業務イベント一覧', link: '/ja/handbook/rules/bel-rules' },
              { text: '業務イベント仕様', link: '/ja/handbook/rules/bev-rules' },
            ],
          },
          {
            text: 'インターフェースモデル',
            collapsed: true,
            items: [
              { text: '画面仕様', link: '/ja/handbook/rules/uis-rules' },
              { text: '帳票仕様', link: '/ja/handbook/rules/bds-rules' },
            ],
          },
          {
            text: '共通',
            collapsed: true,
            items: [
              { text: 'システム化機能一覧', link: '/ja/handbook/rules/sfl-rules' },
              { text: '用語集', link: '/ja/handbook/rules/gl-rules' },
            ],
          },
        ],
      },
      {
        text: '外部I/F仕様',
        collapsed: true,
        items: [
          { text: '外部システムI/F一覧', link: '/ja/handbook/rules/esil-rules' },
          { text: '外部API仕様', link: '/ja/handbook/rules/eapis-rules' },
          { text: '外部ファイル仕様', link: '/ja/handbook/rules/efes-rules' },
          { text: '外部メッセージ仕様', link: '/ja/handbook/rules/ems-rules' },
        ],
      },
      {
        text: 'アーキテクチャ',
        collapsed: true,
        items: [
          {
            text: 'C4',
            items: [
              {
                text: 'コンテキスト図',
                link: '/ja/handbook/rules/cxd-rules',
                collapsed: true,
                items: [{ text: '図の記法ルール', link: '/ja/handbook/rules/cxd-mermaid-rules' }],
              },
              {
                text: 'コンテナ図',
                link: '/ja/handbook/rules/cnd-rules',
                collapsed: true,
                items: [{ text: '図の記法ルール', link: '/ja/handbook/rules/cnd-mermaid-rules' }],
              },
              {
                text: 'コンポーネント図',
                link: '/ja/handbook/rules/cpd-rules',
                collapsed: true,
                items: [{ text: '図の記法ルール', link: '/ja/handbook/rules/cpd-mermaid-rules' }],
              },
            ],
          },
          {
            text: 'インフラ・技術選定',
            items: [
              {
                text: 'インフラ構成図',
                link: '/ja/handbook/rules/ifd-mermaid-rules',
                collapsed: true,
                items: [{ text: '図の記法ルール', link: '/ja/handbook/rules/ifd-mermaid-rules' }],
              },
              { text: '技術スタック一覧', link: '/ja/handbook/rules/tsl-rules' },
            ],
          },
        ],
      },
      { text: 'システム設計' },
      { text: '業務受入条件', link: '/ja/handbook/rules/bac-rules' },
      { text: '非機能要件', link: '/ja/handbook/rules/nfr-rules' },
      { text: 'システム受入条件', link: '/ja/handbook/rules/sac-rules' },
      {
        text: 'テスト',
        collapsed: true,
        items: [
          {
            text: '各ドキュメントのスコープ',
            link: '/ja/handbook/rules/meta-test-document-scope-rules',
          },
          { text: 'テスト戦略・方針', link: '/ja/handbook/rules/tsp-rules' },
          {
            text: '単体テスト',
            collapsed: true,
            items: [
              { text: '単体テストカタログ 概要', link: '/ja/handbook/rules/utc-overview-rules' },
              { text: '単体テストカタログ 対象別', link: '/ja/handbook/rules/utc-rules' },
            ],
          },
          {
            text: '内部結合テスト',
            collapsed: true,
            items: [
              {
                text: '内部結合テストカタログ 概要',
                link: '/ja/handbook/rules/itc-overview-rules',
              },
              { text: '内部結合テストカタログ 対象別', link: '/ja/handbook/rules/itc-rules' },
            ],
          },
          {
            text: '外部結合テスト',
            collapsed: true,
            items: [
              {
                text: '外部結合テストカタログ 概要',
                link: '/ja/handbook/rules/etc-overview-rules',
              },
              { text: '外部結合テストカタログ 対象別', link: '/ja/handbook/rules/etc-rules' },
            ],
          },
          {
            text: '総合テスト',
            collapsed: true,
            items: [
              { text: '総合テストカタログ 概要', link: '/ja/handbook/rules/stc-overview-rules' },
              { text: '総合テストカタログ 対象別', link: '/ja/handbook/rules/stc-rules' },
            ],
          },
          {
            text: '受入テスト',
            collapsed: true,
            items: [
              { text: '受入テストカタログ 概要', link: '/ja/handbook/rules/atc-overview-rules' },
              { text: '受入テストカタログ 対象別', link: '/ja/handbook/rules/atc-rules' },
            ],
          },
        ],
      },
      {
        text: '移行',
        collapsed: true,
        items: [
          { text: '移行計画', link: '/ja/handbook/rules/mip-rules' },
          { text: 'データ移行設計', link: '/ja/handbook/rules/dmd-rules' },
          { text: '移行テスト計画', link: '/ja/handbook/rules/mtp-rules' },
          { text: 'カットオーバー計画', link: '/ja/handbook/rules/cop-rules' },
          { text: '運用切替計画', link: '/ja/handbook/rules/otp-rules' },
        ],
      },
      {
        text: '運用',
        collapsed: true,
        items: [
          { text: '運用方針・設計', link: '/ja/handbook/rules/opd-rules' },
          { text: '運用手順', link: '/ja/handbook/rules/opr-rules' },
        ],
      },
    ],
  },
  {
    text: '指示テンプレート',
    collapsed: true,
    items: [
      { text: 'プロジェクト' },
      {
        text: '業務仕様',
        collapsed: true,
        items: [
          { text: '概念データフロー図', link: '/ja/handbook/instructions/cdfd-instruction' },
          {
            text: 'データモデル',
            collapsed: true,
            items: [
              { text: '業務データ辞書', link: '/ja/handbook/instructions/bdd-instruction' },
              {
                text: '概念データストア一覧',
                link: '/ja/handbook/instructions/cdsl-instruction',
              },
              { text: '保管場所一覧', link: '/ja/handbook/instructions/sll-instruction' },
              { text: 'ステータス一覧', link: '/ja/handbook/instructions/stl-instruction' },
              { text: '分類一覧', link: '/ja/handbook/instructions/cll-instruction' },
              {
                text: '概念クラス図',
                link: '/ja/handbook/instructions/ccd-mermaid-instruction',
              },
              { text: '概念状態遷移図', link: '/ja/handbook/instructions/cstd-instruction' },
            ],
          },
          {
            text: '業務モデル',
            collapsed: true,
            items: [
              { text: '業務プロセス仕様', link: '/ja/handbook/instructions/bps-instruction' },
              { text: 'ビジネスルール', link: '/ja/handbook/instructions/br-instruction' },
              { text: '業務イベント一覧', link: '/ja/handbook/instructions/bel-instruction' },
              { text: '業務イベント仕様', link: '/ja/handbook/instructions/bev-instruction' },
            ],
          },
          {
            text: 'インターフェースモデル',
            collapsed: true,
            items: [
              { text: '画面仕様', link: '/ja/handbook/instructions/uis-instruction' },
              { text: '帳票仕様', link: '/ja/handbook/instructions/bds-instruction' },
            ],
          },
          {
            text: '共通',
            collapsed: true,
            items: [
              { text: 'システム化機能一覧', link: '/ja/handbook/instructions/sfl-instruction' },
              { text: '用語集', link: '/ja/handbook/instructions/gl-instruction' },
            ],
          },
        ],
      },
      {
        text: '外部I/F仕様',
        collapsed: true,
        items: [
          { text: '外部システムI/F一覧', link: '/ja/handbook/instructions/esil-instruction' },
          { text: '外部API仕様', link: '/ja/handbook/instructions/eapis-instruction' },
          { text: '外部ファイル仕様', link: '/ja/handbook/instructions/efes-instruction' },
          { text: '外部メッセージ仕様', link: '/ja/handbook/instructions/ems-instruction' },
        ],
      },
      {
        text: 'アーキテクチャ',
        collapsed: true,
        items: [
          {
            text: 'C4',
            items: [
              { text: 'コンテキスト図', link: '/ja/handbook/instructions/cxd-instruction' },
              { text: 'コンテナ図', link: '/ja/handbook/instructions/cnd-instruction' },
              { text: 'コンポーネント図', link: '/ja/handbook/instructions/cpd-instruction' },
            ],
          },
          {
            text: 'インフラ・技術選定',
            items: [
              { text: 'インフラ構成図', link: '/ja/handbook/instructions/ifd-instruction' },
              { text: '技術スタック一覧', link: '/ja/handbook/instructions/tsl-instruction' },
            ],
          },
        ],
      },
      { text: 'システム設計' },
      { text: '業務受入条件', link: '/ja/handbook/instructions/bac-instruction' },
      { text: '非機能要件', link: '/ja/handbook/instructions/nfr-instruction' },
      { text: 'システム受入条件', link: '/ja/handbook/instructions/sac-instruction' },
      {
        text: 'テスト',
        collapsed: true,
        items: [
          { text: 'テスト戦略・方針', link: '/ja/handbook/instructions/tsp-instruction' },
          { text: 'テスト観点・条件', link: '/ja/handbook/instructions/tpc-instruction' },
          {
            text: '単体テスト',
            collapsed: true,
            items: [
              { text: '単体テスト仕様', link: '/ja/handbook/instructions/uts-instruction' },
              {
                text: '単体テスト個別仕様',
                link: '/ja/handbook/instructions/uts-detailed-instruction',
              },
              { text: '単体テスト設計', link: '/ja/handbook/instructions/utd-instruction' },
              {
                text: '単体テスト個別設計',
                link: '/ja/handbook/instructions/utd-detailed-instruction',
              },
            ],
          },
          {
            text: '内部結合テスト',
            collapsed: true,
            items: [
              { text: '内部結合テスト仕様', link: '/ja/handbook/instructions/its-instruction' },
              {
                text: '内部結合テスト個別仕様',
                link: '/ja/handbook/instructions/its-detailed-instruction',
              },
              { text: '内部結合テスト設計', link: '/ja/handbook/instructions/itd-instruction' },
              {
                text: '内部結合テスト個別設計',
                link: '/ja/handbook/instructions/itd-detailed-instruction',
              },
            ],
          },
          {
            text: '外部結合テスト',
            collapsed: true,
            items: [
              { text: '外部結合テスト仕様', link: '/ja/handbook/instructions/ets-instruction' },
              {
                text: '外部結合テスト個別仕様',
                link: '/ja/handbook/instructions/ets-detailed-instruction',
              },
              { text: '外部結合テスト設計', link: '/ja/handbook/instructions/etd-instruction' },
              {
                text: '外部結合テスト個別設計',
                link: '/ja/handbook/instructions/etd-detailed-instruction',
              },
            ],
          },
          {
            text: '総合テスト',
            collapsed: true,
            items: [
              { text: '総合テスト仕様', link: '/ja/handbook/instructions/sts-instruction' },
              {
                text: '総合テスト個別仕様',
                link: '/ja/handbook/instructions/sts-detailed-instruction',
              },
              { text: '総合テスト設計', link: '/ja/handbook/instructions/std-instruction' },
              {
                text: '総合テスト個別設計',
                link: '/ja/handbook/instructions/std-detailed-instruction',
              },
            ],
          },
          {
            text: '受入テスト',
            collapsed: true,
            items: [
              { text: '受入テスト仕様', link: '/ja/handbook/instructions/ats-instruction' },
              {
                text: '受入テスト個別仕様',
                link: '/ja/handbook/instructions/ats-detailed-instruction',
              },
              { text: '受入テスト設計', link: '/ja/handbook/instructions/atd-instruction' },
              {
                text: '受入テスト個別設計',
                link: '/ja/handbook/instructions/atd-detailed-instruction',
              },
            ],
          },
        ],
      },
      { text: '移行' },
      { text: '運用' },
    ],
  },
]
