# AI 協作製作流程

本文件定義 FutureLight 在美術、影片、字幕、音樂與審核上的 AI 協作分工。目標是讓每個素材從構想到進專案都有明確負責工具、輸入、輸出與審核規則。

## 製作署名

| 職責 | 工具 / 角色 | 負責內容 |
| --- | --- | --- |
| 總導演 | Codex | 需求拆解、製作規格、素材清單、流程編排 |
| 編排 | Codex | 分鏡、鏡頭節奏、互動導向、字幕時序 |
| 剪輯 | Codex + Remotion | 程式化剪輯、片段排列、動態字幕、輸出驗證 |
| 審核 | Codex | 風格一致性、兒童適齡、可及性、授權與檔案落地 |
| AI 圖像 | Image2.0 / imagegen | 課程封面、單字卡、徽章、角色、故事場景 |
| AI 影片 | Seedance | 角色短動畫、教學角色說話、課程宣傳短片 |
| 程序化剪輯與動態字幕 | Remotion | React 時間軸、字幕、音效同步、學習成果影片 |
| 音樂 | Suno | 主題音樂、短 jingles、獎勵音樂、背景音樂 |

## 工具可用狀態

| 工具 | 本機狀態 | 說明 |
| --- | --- | --- |
| Codex | 可用 | 目前負責規劃、程式、審核、commit/push |
| imagegen | 可用 | 已產生 `animal-english-words-cover.png` |
| GPT Image 2 / Image2.0 on RunComfy | Skill 已存在，改走 Docker | 本機 Windows 無法直接安裝 `@runcomfy/cli`，使用 `tools/runcomfy-docker.ps1` |
| Seedance 2.0 Pro on RunComfy | Skill 已存在，改走 Docker | 需要 RunComfy CLI；目前以 Linux container 執行 |
| Remotion | Skill 已存在 | 可建立 React-based video pipeline |
| HyperFrames | Skill 已存在 | 可建立 HTML/GSAP-based video composition |
| Suno | 未找到本機 skill | 先作為外部音樂產製節點，音檔進 `assets/audio/music` |

## Skill Intake 規則

每次開始 AI 素材、影片、字幕、音效或剪輯任務前，Codex 必須先讀對應 skill，再編輯文件或產生素材。這是工作規則，不是可選建議。

### No Mock 規則

所有 skill 執行都必須產出可落地、可追蹤、可驗證的真實功能或真實資源。Mock、硬編成功、假資料、假按鈕、未連資料流的展示頁，不可被標記為完成。

- Remotion / HyperFrames：必須有真實 composition、真實素材路徑、可 render 或可預覽的輸出。
- Image2.0 / imagegen：必須產出實際檔案，放進 `assets/images` 並登記 manifest。
- Seedance：必須產出實際影片檔或留下 RunComfy request / blocker，放進 `assets/video/generated` 並登記 manifest。
- Rust API：不可只回固定 JSON 當完成；必須連接 service/repository/DB 或明確標為尚未完成。
- React UI：按鈕必須有真實導向或真實 mutation；未完成操作要顯示 disabled / coming soon，不能假裝成功。
- PostgreSQL：需要 migration、seed policy 與測試資料來源，不把硬編資料當 production flow。

| 任務 | 必讀 skill | 先想清楚的問題 | 不可違反 |
| --- | --- | --- | --- |
| Remotion 影片 | `remotion-best-practices` | composition 尺寸、fps、duration、frame-based timing、素材來源 | 不用 CSS animation / transition 當影片動畫；素材用 `public/` + `staticFile()` |
| HyperFrames 影片 | `hyperframes`，必要時加 `hyperframes-cli` / `hyperframes-media` | audience、platform、節奏、hero frame、design.md、track/time 設計 | 不跳過設計系統；不先做動畫再猜 layout；standalone composition 不包 `<template>` |
| Image2.0 / GPT Image 2 | `gpt-image-2` 或 `gpt-image-edit` | 圖像用途、尺寸、是否需要文字、角色一致性、是否有參考圖 | 文字要短且明確；修改圖要寫保留項；輸出不可只留在暫存 |
| Seedance | `seedance-v2` | 4-15 秒鏡頭目的、口型/音訊、參考圖/影片/音訊、比例 | 不要求超過 15 秒單支影片；穩定角色身份要用 image reference |
| Windows RunComfy | `gpt-image-2` / `seedance-v2` + `docs/RunComfy執行方案.md` | token 是否在環境變數、輸入 JSON、輸出目錄 | 不把 token 寫入 repo；Windows 不直接假設 `@runcomfy/cli` 可本機安裝 |
| 專案工作 | `workspace-todo-guardian` | 先讀 `Todo`，確認 P0/P1/P2 與後續 todo | 不跳過 Todo；新增後續工作必須寫回 `Todo` |
| 服務 / port | `workspace-port-guard` | 是否會啟動服務、改 port、開 localhost、改 Docker | 不使用隨機 port；不啟動舊 `5173 / 4000 / 5433` |

本輪已確認：Remotion、HyperFrames、GPT Image 2、Seedance、workspace todo、workspace port guard skill 都已存在於本機環境，不需要重新安裝。若未來某台機器缺少 skill，才使用 `skill-installer` 或對應 plugin 安裝流程。

## RunComfy 限制

目前執行：

```bash
npm install -g @runcomfy/cli
```

結果：`@runcomfy/cli` 不支援 Windows，需求平台是 `darwin` 或 `linux`。

已採用方案：

1. 使用 Docker Linux container 包裝 RunComfy CLI。
2. 透過 `tools/runcomfy-docker.ps1` 執行健康檢查與生成任務。
3. 生成輸出固定落在 `assets/video/generated`，再登記到 `assets/asset_manifest.json`。

備援方案：

1. 安裝 WSL Ubuntu，於 Ubuntu 內安裝 Node 與 `@runcomfy/cli`。
2. 使用遠端 Linux runner 或 CI 執行 RunComfy 任務。

在 RunComfy 可執行前，專案內仍可先完成：

- prompt 規格
- 素材 manifest
- 檔名規則
- 審核流程
- Remotion / HyperFrames 程序化剪輯
- imagegen 產圖

## 標準製作流程

```mermaid
flowchart TD
    A["Codex 讀取課程需求"] --> B["Codex 建立素材清單與分鏡"]
    B --> C{"素材類型"}
    C -->|靜態圖| D["Image2.0 / imagegen 產圖"]
    C -->|角色短動畫| E["Seedance 產生 4-5 秒影片"]
    C -->|音樂| F["Suno 產生音樂"]
    C -->|字幕與剪輯| G["Remotion 程序化剪輯"]
    D --> H["Codex 放入 assets 並更新 manifest"]
    E --> H
    F --> H
    H --> I["Codex 使用 futurelight-assets 檢查"]
    I --> J["Remotion 匯入素材、字幕、音效"]
    J --> K["Codex 審核輸出"]
    K --> L["進入前端或內容管理"]
```

## 檔案落點

| 類型 | 目錄 |
| --- | --- |
| 課程封面 | `assets/images/course-covers` |
| 單字卡 | `assets/images/word-cards` |
| 徽章 | `assets/images/badges` |
| 角色 | `assets/images/characters` |
| UI 音效 | `assets/audio/ui` |
| 教學語音 | `assets/audio/voice` |
| 音樂 | `assets/audio/music` |
| AI 影片原始輸出 | `assets/video/generated` |
| Remotion 專案 | `video/remotion` |
| HyperFrames 專案 | `video/hyperframes` |

## 審核規則

- 每個素材必須登記在 `assets/asset_manifest.json`。
- AI 圖像不可只留在 Codex 或 RunComfy 暫存資料夾。
- 孩子用素材不可恐怖、羞辱、刺眼或過度刺激。
- 影片字幕不可遮擋主要學習內容。
- 音樂與音效必須可關閉，且不可蓋過教學語音。
- Suno 或任何外部音樂需記錄授權、產製日期與用途。

## FutureLight 建議用法

第一階段：

- Codex + imagegen：補齊課程封面、單字卡、徽章。
- Remotion：建立第一支「動物英文單字」課程介紹短片。
- futurelight-assets：每次新增素材後檢查 manifest。

第二階段：

- 使用 `docs/RunComfy執行方案.md` 的 Docker runner 啟用 Image2.0 與 Seedance。
- Seedance 產角色短動畫。
- Suno 產課程主題音樂與獎勵 jingle。
- Remotion 統一剪輯、字幕與輸出。

第三階段：

- 內容管理後台支援上傳 AI 圖像、影片、音樂。
- 發布課程前自動跑 `futurelight-assets` 與 `futurelight-content-checker`。
