# Mermaid C4コンテキスト図 (CXD) 作成指示テンプレート

- Mermaid の `flowchart` 構文で、C4コンテキスト図（システムコンテキスト）を作成してください。
- 図の中心となる対象システム（Software System）は **1つ**だけにしてください。
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
- 禁止: 物理テーブル名・カラム名・SQL全文、APIエンドポイントやHTTP詳細、実装クラス/関数名、対象システム内部の詳細プロセス/データストア
- 出力は Mermaid のコードブロック形式（\```mermaidで開始し、\``` で終了）で提示してください。
