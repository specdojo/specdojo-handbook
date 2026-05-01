# C4コンテキスト図 (CXD) 作成の指示テンプレート

- 以下のルールに従って、**C4コンテキスト図（CXD）のドキュメント**を 1 ファイル作成してください。出力は **Markdown** とします。
- 対象システム（Software System）は **1つ**だけにしてください（複数対象がある場合は分割する前提で、今回は1つに絞る）。
- 先頭に YAML Frontmatter を付けてください（項目は以下を必須とする）：
  - `id`: 小文字ハイフン（例: `cxd-candy-shop-sales-context`）
  - `type`: `architecture`
  - `title`: 図の対象が分かる日本語タイトル
  - `status`: `draft`
  - `part_of`: `[]`
  - `based_on`: `[]`
- 本文構成は、次の見出し（日本語）をこの順序で必ず出力してください：
  1. 概要
  2. C4コンテキスト図（Mermaid）
  3. 要素の説明
  4. 補足
- 「C4コンテキスト図（Mermaid）」は以下のルールに従って作成してください：
  - Mermaid の `flowchart` 構文で、C4コンテキスト図（システムコンテキスト）を作成してください。
  - 対象システムは `subgraph 境界["対象システム"] ... end` で囲い、境界内には原則として対象システムのノード1つだけを置いてください。
  - Person（人/ロール）と External Software System（外部システム）を必ず含めてください（該当がない場合は理由を明記）。
  - 関係は `-->` で表現し、**すべての矢印にラベル**（短い日本語）を付けてください。
  - 色分け（必須）:
    - Personノードに `person`、対象システムに `system`、外部システムに `external` を付けてください。
    - 境界（subgraph）は破線枠にしてください。
    - 以下の定義をそのまま図に含めてください（値は変更しない）：
      - `classDef person fill:#fff3bf,stroke:#f08c00,color:#000;`
      - `classDef system fill:#d0ebff,stroke:#1c7ed6,color:#000;`
      - `classDef external fill:#e9ecef,stroke:#495057,color:#000;`
      - `style 境界 fill:#ffffff,fill-opacity:0,stroke:#868e96,stroke-width:1px,stroke-dasharray: 5 5;`
  - 出力は Mermaid のコードブロック形式（\```mermaid で開始し、 \``` で終了）で提示してください。
- 「要素の説明」は、図に登場する要素（人/対象システム/外部システム/境界/関係）を `###` 小見出しで列挙し、各要素を **1〜3文**で説明してください。
- 禁止: 物理テーブル名・カラム名・SQL全文、APIエンドポイントやHTTP詳細、実装クラス/関数名、対象システム内部の詳細プロセス/データストア、UI操作手順の逐語列挙
