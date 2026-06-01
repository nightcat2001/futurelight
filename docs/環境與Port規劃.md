# 環境與 Port 規劃

Created: 2026-06-01 08:22:43 +08:00

FutureLight 不可以任意啟動 port。所有本機服務啟動前，必須先讀：

1. `Todo/README.md`
2. `Todo/*.md`
3. `C:\Users\USER\Desktop\work\config\port-registry.json`
4. 本文件

## 權威來源

總 port 分配權威是：

`C:\Users\USER\Desktop\work\config\port-registry.json`

該檔案規則：

- `noRandomPorts: true`
- 新專案避開常見 dev ports，例如 `3000`、`4000`、`5173`、`5174`、`8000`、`8080`
- Docker host port 也是正式保留 port
- 新專案不可未經明確核准就加 public route

## FutureLight 分配

FutureLight 在總分配檔中的狀態是 `planned-migration`。

| 類型 | 正式分配 | 舊設定 | 狀態 |
| --- | --- | --- | --- |
| Frontend | `37173` | `5173` | 必須遷移 |
| API | `37200` | `4000` | 必須遷移 |
| PostgreSQL / infra | `37432` | `5433` | 必須遷移 |

舊設定 `5173 / 4000 / 5433` 只能視為歷史殘留，不得再作為 FutureLight 啟動依據。

## 啟動前規則

- 不可直接啟動 `npm run dev`，除非確認 Vite 已遷移到 `37173`。
- 不可直接啟動 `cargo run`，除非確認 `PORT=37200`。
- 不可直接啟動 `docker compose up -d postgres`，除非確認 host port 已遷移到 `37432`。
- 啟動前必須先列出將使用的 port，確認沒有使用舊設定。
- 若 port registry 與 repo 設定不一致，以 port registry 為準，先改 repo 設定再啟動。
- Production 不從本機 dev port 提供服務。

## 待遷移檔案

- `README.md`
- `.env.example`
- `frontend/vite.config.ts`
- `backend/src/main.rs`
- `docker-compose.yml`

## 正確目標設定

`.env.example` 應改為：

```env
DATABASE_URL=postgres://futurelight:futurelight@localhost:37432/futurelight
PORT=37200
```

Vite dev server 應使用：

```ts
server: {
  port: 37173,
  proxy: {
    '/api': 'http://127.0.0.1:37200',
    '/health': 'http://127.0.0.1:37200',
  },
}
```

Docker Compose PostgreSQL host port 應使用：

```yaml
ports:
  - "37432:5432"
```

## 驗證方式

完成 port migration 後，才能啟動並驗證：

```powershell
Get-NetTCPConnection -LocalPort 37173,37200,37432 -ErrorAction SilentlyContinue
```

驗證目標：

- Frontend: `http://localhost:37173`
- Backend: `http://localhost:37200`
- Health: `http://localhost:37200/health`
- PostgreSQL: `localhost:37432`

不得用 `5173 / 4000 / 5433` 當作驗證目標。
