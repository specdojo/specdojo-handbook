# C4コンポーネント図 (CPD) 作成の指示テンプレート

- 以下のルールに従って、**C4コンポーネント図（CPD）のドキュメント**を 1 ファイル作成してください。出力は **Markdown** とします。
- 対象コンテナ（Container Boundary）は **1つ**だけにしてください（複数対象がある場合は分割する前提で、今回は1つに絞る）。
- 先頭に YAML Frontmatter を付けてください（項目は以下を必須とする）：
  - `id`: 小文字ハイフン（例: `cpd-sales-api-components`）
  - `type`: `architecture`
  - `title`: 図の対象が分かる日本語タイトル
  - `status`: `draft`
  - `part_of`: `[]`
  - `based_on`: `[]`
  - `implements`: `[]`
  - `tests`: `[]`
- 本文構成は、次の見出し（日本語）をこの順序で必ず出力してください：
  1. 概要
  2. C4コンポーネント図（Mermaid）
  3. 要素の説明
  4. 補足
- 「C4コンポーネント図（Mermaid）」は以下のルールに従って作成してください：
  - Mermaid の `flowchart` 構文で、C4コンポーネント図（Component Diagram）を作成してください。
  - 対象コンテナは `subgraph 境界["対象コンテナ"] ... end` で囲ってください。
  - 境界内には、主要コンポーネント（責務のまとまり）と、必要なら主要DBを置いてください（5〜15個程度）。
  - Person（人/ロール）や外部システム（External Software System）がある場合は含めてください（該当がない場合は理由を明記）。
  - 関係は `-->` で表現し、**すべての矢印にラベル**（短い日本語）を付けてください。
  - 色分け（必須）:
    - Personノードに `person`、境界内（Component/DB）に `system`、外部システムに `external` を付けてください。
    - 境界（subgraph）は破線枠にしてください。
    - 以下の定義をそのまま図に含めてください（値は変更しない）：
      - `classDef person fill:#fff3bf,stroke:#f08c00,color:#000;`
      - `classDef system fill:#d0ebff,stroke:#1c7ed6,color:#000;`
      - `classDef external fill:#e9ecef,stroke:#495057,color:#000;`
      - `style 境界 fill:#ffffff,fill-opacity:0,stroke:#868e96,stroke-width:1px,stroke-dasharray: 5 5;`
  - 出力は Mermaid のコードブロック形式（\```mermaid で開始し、 \``` で終了）で提示してください。
- 「要素の説明」は、図に登場する要素（境界/人/コンポーネント/DB/外部/関係）を `###` 小見出しで列挙し、各要素を **1〜3文**で説明してください。
- 禁止: 物理テーブル名・カラム名・SQL全文、APIエンドポイントやHTTP詳細、実装クラス/関数名やファイル一覧、画面手順の逐語列挙
