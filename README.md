# 🎣 Fishing Men - AI 魚類識別系統

基於 AI 深度學習的香港魚類識別與圖鑑系統，結合圖片搜尋、地圖標記和個人收藏功能。

---

## 📋 專案概述

本專案整合機器學習、網頁爬蟲與全端開發技術，提供完整的魚類識別解決方案。從數據收集、模型訓練到實際應用，實現端到端的 AI 開發流程。

## ✨ 核心功能

### 1. **AI 圖片識別** (主打功能)
- 上傳魚類照片，AI 自動識別魚種
- 顯示 Top 3 預測結果 + 信心分數
- 支援 6 種常見香港魚類：
  - 紅衫 (Red Snapper - *Nemipterus virgatus*)
  - 鯉魚 (Common Carp - *Cyprinus carpio*)
  - 鯧魚 (Pomfret - *Pampus argenteus*)
  - 九肚魚 (Bombay Duck - *Harpadon nehereus*)
  - 木棉魚 (Bigeye - *Priacanthus tayenus*)
  - 馬頭 (Horsehead - *Branchiostegus japonicus*)
- 驗證準確率：**45.83%**

### 2. **魚類圖鑑** (album.html)
- 完整魚類資料庫展示
- 包含中英文名稱、學名、描述、圖片
- 支援 ID 跳轉與自動高亮定位

### 3. **地圖標記** (map.html)
- 標記魚類捕獲地點
- 香港地圖視覺化
- 分層顯示：魚類資訊點 + 用戶標記
- 會員專屬釣點管理功能

### 4. **用戶系統** (register.html, login.html)
- 註冊/登入功能
- 個人魚類收藏冊 (My Album)
- Session 管理與跨頁面同步

### 5. **輪播展示** (index.html)
- 首頁使用 Swiper.js 展示精選魚類
- 響應式設計，支援桌面與手機瀏覽

---

## 🤖 AI 技術棧

### 深度學習框架
- **TensorFlow.js 4.22.0** - 瀏覽器端 AI
- **TensorFlow.js Node 4.22.0** - 伺服器端 AI (CPU 優化，支援 AVX2)

### 模型架構
- **MobileNetV3** (簡化版)
- 參數量：**83,078**
- 輸入尺寸：**224×224×3**
- 輸出：**6 類別分類**
- 模型大小：**2.6 MB**

### 訓練配置
```typescript
訓練數據：1,200 張圖片 (每種魚 200 張)
批次大小：16
訓練輪數：100 epochs
學習率：0.0001
驗證分割：15%
測試分割：15%
早停機制：耐心值 15
```

### 數據處理
- **Sharp 0.33.0** - 圖片預處理、調整大小、增強
- **Formidable 3.5.4** - 檔案上傳處理
- 數據增強：旋轉、翻轉、亮度調整

---

## 🌐 後端技術

### Web 框架
- **Express 5.1.0** - 主伺服器框架
- **ts-node-dev 2.0.0** - TypeScript 開發伺服器 (熱重載)

### 數據庫
- **Better-SQLite3 9.2.2** - 輕量級 SQL 資料庫
- **MySQL2 3.15.0** - 進階資料庫支援

### Session 管理
- **express-session 1.18.2** - 用戶登入狀態管理

### 檔案系統
- **fs-extra 11.2.0** - 增強檔案操作
- **glob 10.3.10** - 檔案模式匹配

---

## 💻 前端技術

### 核心
- **TypeScript 5.9.3** - 類型安全開發
- **esbuild 0.25.9** - 極速編譯打包工具
- Vanilla JavaScript - 無框架輕量化設計

### UI 組件
- **Swiper.js 11** - 輪播圖組件
- 響應式設計 - 適配各種螢幕尺寸

---

## 🕷️ 數據收集工具

### 網頁爬蟲
- **Puppeteer 21.6.0** - 無頭瀏覽器爬蟲
- **Cheerio 1.0.0** - 快速 HTML 解析器
- **Axios 1.6.2** - HTTP 請求庫

### 爬蟲來源
- Wikimedia Commons
- iNaturalist
- 香港政府魚類資料庫
- Google Images (調試用)

### 數據審核系統
- 人工審核伺服器 (Port 4000)
- 數據分類：approved / rejected
- 品質控制流程

---

## 🛠️ 技術架構

### 開發工具
- **TypeScript 5.9.3** - 主要開發語言
- **ts-node 10.9.2** - 執行 TypeScript 腳本
- **esbuild 0.25.9** - 前端快速編譯
- **tsc** - 後端 TypeScript 編譯
- **npm-run-all** - 並行執行多個腳本
- **dotenv 16.3.1** - 環境變數管理

---

## 🚀 快速開始

### 環境需求
- **Node.js**: v20.18.1 或以上
- **npm**: 10.x 或以上
- **作業系統**: Windows 10/11, macOS, Linux
- **CPU**: 支援 AVX2 指令集 (推薦)

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/MMCodeMM/244-4-fishing-men.git
cd 244-4-fishing-men
```

2. **安裝依賴**
```bash
npm install
```

3. **環境檢查** (可選)
```bash
npm run ai:check
```

4. **啟動開發環境**
```bash
npm start
```

伺服器將在 `http://localhost:3000` 啟動

---

## 📜 可用指令

### 開發指令
```bash
npm start              # 啟動完整開發環境 (伺服器 + 前端監聽)
npm run serve          # 僅啟動後端伺服器
npm run watch          # 僅監聽前端編譯
npm run build:client   # 編譯前端一次
npm run build:server   # 編譯後端
```

### AI 相關指令
```bash
npm run ai:check           # 檢查環境 (TensorFlow, Node 版本)
npm run ai:crawl:fish      # 單魚種爬蟲
npm run ai:crawl:batch     # 批量爬蟲 (所有魚種)
npm run ai:crawl:resume    # 恢復中斷的爬蟲
npm run ai:review          # 啟動數據審核系統 (Port 4000)
npm run ai:augment         # 數據增強 (旋轉/翻轉/調色)
npm run ai:progress        # 顯示訓練進度
npm run ai:train           # 訓練模型
npm run ai:train:resume    # 恢復訓練
npm run ai:status          # 查看專案狀態
npm run ai:reset           # 重置訓練進度 (危險!)
```

---

## 🔧 訓練自己的模型

### 1. 收集數據
```bash
# 方法 1: 批量爬蟲
npm run ai:crawl:batch

# 方法 2: 單魚種爬蟲
npm run ai:crawl:fish
```

### 2. 審核數據
```bash
npm run ai:review
# 訪問 http://localhost:4000 進行人工審核
```

### 3. 數據增強
```bash
npm run ai:augment
# 將每個魚種擴充至 200 張圖片
```

### 4. 訓練模型
```bash
npm run ai:train
# 實時顯示訓練進度和準確率
```

### 5. 測試模型
上傳圖片至 `http://localhost:3000/search.html` 測試識別效果

---

## 📁 專案結構

```
244-4-fishing-men/
├── server/                    # 後端伺服器
│   ├── main.ts               # Express 主伺服器 (Port 3000)
│   ├── ai/                   # AI 服務模組
│   │   └── ai-service.ts     # 魚類識別服務
│   ├── user.ts               # 用戶 API 路由
│   ├── data.ts               # 數據類型定義
│   ├── fish.json             # 魚類資料庫
│   └── data-review/          # 數據審核系統
│       └── review-server.ts  # 審核伺服器 (Port 4000)
├── client/                    # 前端 TypeScript
│   ├── search.ts             # AI 搜尋頁邏輯
│   ├── album.ts              # 圖鑑頁邏輯
│   ├── index.ts              # 首頁輪播
│   ├── map.ts                # 地圖功能
│   ├── my_albums.ts          # 個人收藏
│   ├── register.ts           # 註冊邏輯
│   ├── sharedHeader.ts       # 共用導航列
│   └── utils.ts              # 工具函數
├── public/                    # 靜態檔案
│   ├── *.html                # 前端頁面
│   ├── styles.css            # 全局樣式
│   └── data/                 # 圖片資源
├── scripts/ai/                # AI 訓練腳本
│   ├── config.ts             # AI 配置文件
│   ├── train-model.ts        # 模型訓練主程式
│   ├── augment-data.ts       # 數據增強工具
│   ├── progressive-training.ts # 訓練進度顯示
│   ├── crawlers/             # 爬蟲引擎
│   │   ├── cheerio-crawler.ts
│   │   └── puppeteer-crawler.ts
│   └── utils/                # 工具函數
│       ├── image-validator.ts
│       ├── model-loader.ts
│       └── progress-manager.ts
├── models/                    # AI 模型儲存 (2.6MB)
│   └── fish-classifier/
│       ├── best/             # 最佳模型
│       │   ├── model.json    # 模型架構
│       │   └── weights.bin   # 模型權重
│       └── classes.json      # 類別映射
├── training-data/             # 訓練數據
│   ├── raw/                  # 原始爬取數據
│   └── reviewed/
│       ├── approved/         # 已審核通過 (1,200 張)
│       │   ├── 紅衫_augmented/
│       │   ├── 鯉魚_augmented/
│       │   ├── 鯧魚_augmented/
│       │   ├── 九肚魚_augmented/
│       │   ├── 木棉魚_augmented/
│       │   └── 馬頭_augmented/
│       └── rejected/         # 已拒絕數據
├── dist/                      # 編譯輸出
│   └── client/               # 前端編譯檔案
├── uploads/                   # 用戶上傳檔案
│   ├── user-photos/
│   └── search-images/
├── PData/                     # 應用數據
│   ├── ai_progress.json      # 訓練進度
│   ├── ai_predictions_cache.json
│   └── ai.db                 # SQLite 數據庫
├── package.json              # 依賴配置
├── tsconfig.json             # TypeScript 配置
└── README.md                 # 本文件
```

---

## 📊 技術亮點

### ✅ 完整 AI Pipeline
```
數據爬蟲 → 人工審核 → 數據增強 → 模型訓練 → 伺服器部署 → 前端應用
```

### ✅ 前後端分離架構
- TypeScript 全棧開發
- RESTful API 設計
- 靜態資源與動態服務分離

### ✅ 輕量化部署
- 模型僅 **2.6 MB**
- 無需 GPU，CPU 即可運行
- 支援邊緣設備部署

### ✅ 實時預測
- 上傳即識別
- **3 秒內**返回 Top 3 預測結果
- 信心分數百分比顯示

### ✅ 可擴展架構
- 已規劃 6 種未來魚種：烏頭、白飯魚、白鱲、芝麻班、黃鱲鯧、鯇魚
- 模組化設計，易於添加新魚種
- 配置驅動開發 (`config.ts`)

---

## 📈 性能指標

| 指標 | 數值 |
|------|------|
| 訓練準確率 | 58.13% |
| 驗證準確率 | **45.83%** |
| 模型大小 | 2.6 MB |
| 預測速度 | ~3 秒 |
| 訓練數據量 | 1,200 張 |
| 支援魚種數 | 6 種 |
| 參數量 | 83,078 |

---

## 🛠️ 故障排除

### TensorFlow.js Node 載入失敗
```bash
# Windows: 複製 DLL 到正確位置
cp node_modules/@tensorflow/tfjs-node/deps/lib/tensorflow.dll node_modules/@tensorflow/tfjs-node/lib/napi-v8/
```

### 前端顯示舊版本
```bash
# 清除瀏覽器快取
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### 模型預測不準確
- 檢查訓練數據品質
- 增加訓練輪數 (修改 `TRAINING_CONFIG.epochs`)
- 調整學習率 (`learningRate`)
- 收集更多訓練數據

---

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

---

## 📄 授權

ISC License

---

## 👥 作者

**MMCodeMM**
- GitHub: [@MMCodeMM](https://github.com/MMCodeMM)
- 專案: [244-4-fishing-men](https://github.com/MMCodeMM/244-4-fishing-men)

---

## 🙏 致謝

- TensorFlow.js 團隊
- Wikimedia Commons 社群
- iNaturalist 平台
- 香港漁農自然護理署
- Swiper.js 團隊

---

## 📞 聯絡方式

如有問題或建議，請在 [GitHub Issues](https://github.com/MMCodeMM/244-4-fishing-men/issues) 提出。

---

**最後更新**: 2025年12月11日
- TypeScript 和 Node.js 社群的技術支援

---
