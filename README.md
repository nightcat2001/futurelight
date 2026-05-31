# FutureLight

小孩語言學習網站規劃文件。

目前技術方向：

- Frontend：React
- Backend：Rust
- Database：PostgreSQL

主要規劃文件位於 [`docs`](docs)。

## 開發啟動

啟動 PostgreSQL：

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

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- PostgreSQL: localhost:5433
- Health: http://localhost:4000/health
