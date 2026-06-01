# FutureLight

小孩語言學習網站規劃文件。

目前技術方向：

- Frontend：React
- Backend：Rust
- Database：PostgreSQL

主要規劃文件位於 [`docs`](docs)。

第一批內容與資源：

- `assets/asset_manifest.json`
- `assets/images/course-covers/animal-english-words-cover.png`
- `content/courses/animal-english-words.json`

AI 製作管線：

- `docs/AI協作製作流程.md`

## 開發啟動

啟動前必須先讀：

- `Todo/README.md`
- `Todo/*.md`
- `C:\Users\USER\Desktop\work\config\port-registry.json`
- `docs/環境與Port規劃.md`

FutureLight 在總 port registry 中已分配：

- Frontend：`37173`
- Backend API：`37200`
- PostgreSQL：`37432`

目前 repo 內仍有歷史舊設定 `5173 / 4000 / 5433`，不得直接用舊 port 啟動。必須先完成 port migration，再啟動服務。

遷移完成後，啟動 PostgreSQL：

```bash
docker compose up -d postgres
```

啟動 Rust API：

```bash
cd backend
cargo run
```

啟動 React 前端：

```bash
cd frontend
npm install
npm run dev
```

預設網址：

- Frontend: http://localhost:37173
- Backend: http://localhost:37200
- PostgreSQL: localhost:37432
- Health: http://localhost:37200/health
