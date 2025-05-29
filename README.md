# 虛擬樂隊產生器 (Virtual Band Generator)

React Final Project
一個 React 應用程式，讓使用者可以建立音樂家、組建虛擬樂隊，並根據主唱音域推薦適合的歌曲。

## 主要技術棧

*   **前端框架**: React (使用 Vite + TypeScript)
*   **路由**: React Router DOM (`react-router-dom`)
*   **表單處理**: React Hook Form (`react-hook-form`)
*   **拖曳功能**: React DnD (`react-dnd`, `react-dnd-html5-backend`)
*   **樣式**: Tailwind CSS (`tailwindcss`)
*   **圖示**: Heroicons (`@heroicons/react`)
*   **唯一 ID**: UUID (`uuid`)

## 專案結構 (public_frontend 資料夾內)

```
public_frontend/
├── public/
│   └── song_dataset.json  # 歌曲模擬數據
├── src/
│   ├── assets/              # 靜態資源 (如圖片，目前未使用)
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.tsx   # 頁首元件
│   │   └── musician/
│   │       └── MusicianForm.tsx # 建立/編輯音樂家的表單
│   ├── pages/
│   │   ├── AssembleBandPage.tsx # 組建樂隊與歌曲分析頁面
│   │   ├── CreateMusicianPage.tsx # 建立與管理音樂家頁面
│   │   └── NotFoundPage.tsx     # 404 頁面
│   ├── types/
│   │   └── index.ts         # TypeScript 型別定義
│   ├── utils/
│   │   └── musicUtils.ts    # 音樂相關的工具函式 (音高轉換、移調計算等)
│   ├── App.tsx              # 主應用程式元件，處理路由和全域狀態
│   ├── main.tsx             # 應用程式入口點
│   └── index.css            # 全域 Tailwind CSS 引入與基本樣式
├── .eslintrc.cjs            # ESLint 設定
├── index.html               # 主 HTML 檔案
├── package.json             # 專案依賴與腳本
├── postcss.config.js        # PostCSS 設定
├── tailwind.config.js       # Tailwind CSS 設定
├── tsconfig.json            # TypeScript 編譯器設定 (主要)
└── tsconfig.node.json       # TypeScript 編譯器設定 (Vite 等 Node 環境)
```

## 核心功能流程

1.  **建立音樂家 (`/create-musician`)**:
    *   使用者填寫表單（姓名、描述、樂器/專長、技能等級、風格等）。
    *   對於聲樂家，可以指定描述性音域（如男高音）或精確的最低/最高音。選擇描述性音域會自動填充建議的精確音域。
    *   建立的音樂家會顯示在列表，並儲存在應用程式狀態中 (App.tsx)。

2.  **組建樂隊與分析 (`/assemble-band`)**:
    *   **樂隊組建**:
        *   從「音樂家池」中將音樂家拖曳到預設的「樂隊席位」中。
        *   樂隊席位有角色限制（例如主唱席位只能放聲樂家）。
        *   樂隊組合會自動儲存到瀏覽器的 `localStorage`，下次開啟時會自動載入。
    *   **歌曲推薦 (基於主唱音域)**:
        *   當樂隊中有主唱且設定其音域後，系統會從 `song_dataset.json` 中自動篩選並顯示推薦歌曲列表。
        *   推薦標準基於歌曲是否在主唱的舒適音域內（無需移調或小幅移調後舒適）。
        *   完美匹配的歌曲會有特殊標記。
        *   點擊推薦歌曲可將其載入到下方的詳細分析區。
    *   **歌曲詳細音域分析**:
        *   使用者可以從下拉選單中選擇一首歌曲 (從 `song_dataset.json` 載入)。
        *   點擊「開始評估！」按鈕。
        *   系統會分析選定歌曲與當前樂隊主唱的音域匹配情況。
        *   顯示結果，包括：建議移調量（升/降 Key）、歌手音域、歌曲原音域、移調後歌曲音域等。

## 安裝與啟動

1.  **前置需求**:
    *   Node.js (建議 LTS 版本)
    *   npm (通常隨 Node.js 一起安裝) 或 yarn

2.  **克隆專案 (如果適用)**:
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

3.  **進入前端資料夾**:
    ```bash
    cd public_frontend
    ```

4.  **安裝依賴**:
    ```bash
    npm install
    ```
    或如果你使用 yarn:
    ```bash
    yarn install
    ```

5.  **啟動開發伺服器**:
    ```bash
    npm run dev
    ```
    或如果你使用 yarn:
    ```bash
    yarn dev
    ```

6.  在瀏覽器中開啟 Vite 提供的本地網址 (通常是 `http://localhost:5173`)。

---
