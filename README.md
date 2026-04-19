# IronLog Pro 專案說明文件

## 1. 專案簡介
**IronLog Pro** 是一款專業的重量訓練追蹤應用程式，旨在提供訓練計畫管理、即時 PR（個人紀錄）百分比計算以及 AI 輔助的熱身建議。除了核心的訓練紀錄功能，專案還整合了「能量系統」，透過睡眠與補水紀錄來模擬使用者的體能狀態。

## 2. 專案架構 (Project Architecture)

本專案採用 **React + TypeScript + Vite** 開發，並使用 **Tailwind CSS** 進行樣式設計。資料持久化主要依賴瀏覽器的 **LocalStorage**。

### 目錄結構
- `/` (根目錄): 核心邏輯、全域型別與設定。
- `/components`: 可複用的 UI 元件。
- `/hooks`: 自定義 Hook，負責各個模組的狀態管理與資料持久化。
- `/services`: 外部服務整合（如 AI 邏輯、模擬 API）。
- `/views`: 各個功能頁面的視圖元件。
- `/lib`: 工具函式。

## 3. 文件功能說明

### 核心文件
- `App.tsx`: 應用程式進入點，負責全域狀態彙整、導航邏輯（View Switching）以及跨模組的互動（如睡眠後恢復能量）。
- `types.ts`: 定義全域 TypeScript 介面與列舉（Enum），確保資料結構一致性。
- `constants.ts`: 存放全域常數，包含預設設定、計算公式（如 1RM 公式）與動畫時長。
- `index.tsx`: React 渲染進入點。
- `index.html`: HTML 模板，包含 Tailwind CSS 與字體載入。

### Hooks (狀態管理)
- `useWorkout.ts`: 管理訓練課表、範本與 PR 紀錄。
- `useSleep.ts`: 處理睡眠封印儀式與睡眠歷史。
- `useWater.ts`: 追蹤每日飲水量與設定。
- `useEnergy.ts`: 管理使用者的能量點數（Energy Points）。
- `useTimer.ts`: 訓練間隔休息計時器邏輯。
- `useArchive.ts`: 管理「記憶碎片」（睡眠紀錄的視覺化存檔）。

### Views (頁面視圖)
- `DashboardView.tsx`: 主儀表板，顯示能量條、今日任務與快速入口。
- `PlannerView.tsx`: 訓練計畫編輯器，設定目標重量與次數。
- `LoggerView.tsx`: 實際訓練記錄器，包含計時器與 PR 即時計算。
- `TemplatesView.tsx` / `TemplateEditorView.tsx`: 訓練範本管理。
- `HistoryView.tsx` / `HistoryDetailView.tsx`: 過去訓練紀錄查詢。
- `EnergyDetailView.tsx`: 能量狀態詳細分析。
- `BackupView.tsx`: 提供 JSON 格式的資料匯出與匯入功能。

### Components (元件)
- `EnergyBar.tsx`: 頂部能量顯示條。
- `WaterModule.tsx`: 飲水追蹤互動介面。
- `SleepSealer.tsx`: 睡前「封印儀式」表單。
- `ExerciseCard.tsx`: 訓練動作顯示卡片。

### Services (服務)
- `geminiService.ts`: 模擬 AI 邏輯，根據目標重量自動計算科學化的熱身組。

## 4. 專案需求實現方式

### A. 訓練追蹤與 PR 計算
- **實現方式**: 使用 `useWorkout` Hook 維護一個 `sessions` 陣列。
- **PR 計算**: 在 `LoggerView` 中，當使用者完成一組動作時，程式會利用 **Epley 公式** (`weight * (1 + reps / 30)`) 即時計算預估 1RM (One Rep Max)，並與歷史 PR 比較。

### B. 訓練範本管理
- **實現方式**: 使用者可以定義 `WorkoutTemplate`，包含預設的動作、組數與次數。建立新訓練時，系統會從範本複製資料，減少重複輸入。

### C. AI 輔助教練
- **實現方式**: 在 `LoggerView` 中提供「生成熱身組」按鈕，呼叫 `geminiService`。該服務會根據目標重量，按比例（50%, 70%, 90%）產生三組熱身建議，幫助使用者安全進入正式組。

### D. 能量與生活儀式
- **實現方式**: 
  - **補水**: 飲水會即時增加當前能量。
  - **睡眠**: 透過「封印儀式」紀錄心情與目標，起床後根據睡眠時長與前日補水狀況計算能量恢復率。
  - **訓練消耗**: 完成訓練組數會獲得「訓練獎勵」能量。

### E. 資料備份與安全性
- **實現方式**: 
  - **LocalStorage**: 所有變更都會透過 Hook 中的 `useEffect` 自動同步到 LocalStorage。
  - **JSON 備份**: 在 `BackupView` 中，利用 `Blob` 物件將全域狀態轉為 JSON 檔案下載，並支援讀取檔案還原狀態。

### F. 視覺化與動畫
- **實現方式**: 
  - 使用 **motion (Framer Motion)** 處理頁面切換動畫。
  - 睡眠存檔被設計為「記憶碎片（Crystal）」，具有動態的色調與透明度（受補水影響）。
