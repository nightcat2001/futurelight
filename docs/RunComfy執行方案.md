# RunComfy 執行方案

`@runcomfy/cli` 目前不支援 Windows，因此 FutureLight 以 Linux Docker container 作為 Seedance 與 Image2.0 的標準執行路徑。這讓本機仍可維持 Windows 開發環境，同時把 AI 影片與進階圖像生成交給 Linux runtime。

## 執行前需求

- Docker Desktop 已啟動。
- 已設定 `RUNCOMFY_TOKEN` 環境變數。
- AI 生成輸入檔放在 repo 內，例如 `tools/runcomfy-seedance-example.json`。

## 健康檢查

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/runcomfy-docker.ps1 -Check
```

這會建立 `futurelight-runcomfy` Docker image，並執行 `runcomfy --help`，用來確認 CLI 可在 Linux container 內啟動。

## Seedance 範例

```powershell
$env:RUNCOMFY_TOKEN = "你的 RunComfy token"
powershell -NoProfile -ExecutionPolicy Bypass -File tools/runcomfy-docker.ps1 `
  -Model "bytedance/seedance-v2/pro" `
  -InputJson "tools/runcomfy-seedance-example.json" `
  -OutputDir "assets/video/generated"
```

輸出影片應放入 `assets/video/generated`，完成後再更新 `assets/asset_manifest.json`。

## 審核規則

- 不把 token 寫入 repo。
- 生成結果不可只留在暫存資料夾。
- 影片需檢查兒童適齡、字幕遮擋、音量與授權記錄。
- 若影片會進 Remotion 或 HyperFrames，應同步記錄素材路徑、片長、字幕需求與使用頁面。
