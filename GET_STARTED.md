# 🎯 AI 魚類識別 - 第一步指南

## ✅ 基礎設施已完成！

已完成的工作：
- ✅ package.json 已更新（添加所有 AI 依賴）
- ✅ 目錄結構已創建
- ✅ 爬蟲系統已實現（Puppeteer + Cheerio）
- ✅ 進度管理系統已就緒（支持斷點續傳）
- ✅ 圖片驗證器已實現
- ✅ 所有執行腳本已創建

---

## 📦 當前狀態

**依賴安裝中...** (需要 5-10 分鐘)

正在安裝的關鍵依賴：
- @tensorflow/tfjs-node-gpu (AI 核心，~600MB)
- puppeteer (爬蟲，~300MB，包含 Chromium)
- sharp (圖片處理)
- axios, cheerio (網頁爬取)
- better-sqlite3 (數據庫)

---

## 🚀 安裝完成後的第一步

### 1. 檢查環境（必須）

```bash
npm run ai:check
```

這會驗證：
- ✅ 所有依賴是否正確安裝
- ✅ GPU 是否可用
- ✅ 磁盤空間是否足夠
- ✅ 目錄結構是否正確

### 2. 查看當前進度

```bash
npm run ai:status
```

### 3. 開始第一個魚種爬蟲

```bash
# 推薦：從最常見的紅衫開始
npm run ai:crawl:fish -- --fish="紅衫"
```

**預期時間**: 20-30 分鐘
**目標**: 100 張紅衫圖片

**特點**：
- ⏸️  可隨時按 Ctrl+C 中斷
- 💾 每 10 張自動保存進度
- 🔄 重新運行會從上次位置繼續

### 4. 或批次爬取所有魚種

```bash
npm run ai:crawl:batch
```

**預期時間**: 2-3 小時（6 種魚）
**目標**: 600 張圖片（每種 100 張）

---

## 📊 分段執行計劃

考慮到您需要搭車和電量問題，建議分段執行：

### 🗓️ 建議時間表

**今天 (12/1) - Session 1 (2 小時)**
```bash
npm run ai:check                      # 1 分鐘
npm run ai:crawl:fish -- --fish="紅衫"  # 30 分鐘
npm run ai:crawl:fish -- --fish="鯉魚"  # 30 分鐘
npm run ai:crawl:fish -- --fish="鯧魚"  # 30 分鐘
```
✅ 完成 3 種魚（300 張圖片）

**需要外出？按 Ctrl+C 中斷！**

---

**今天 (12/1) - Session 2 (2 小時，回來後)**
```bash
npm run ai:crawl:fish -- --fish="九肚魚"  # 30 分鐘
npm run ai:crawl:fish -- --fish="烏頭"    # 30 分鐘
npm run ai:crawl:fish -- --fish="馬頭"    # 30 分鐘
npm run ai:review -- --session=1         # 30 分鐘（開始審核）
```
✅ 完成所有 6 種魚爬蟲 + 開始審核

---

**明天 (12/2) - Session 3-5（分段審核）**
```bash
npm run ai:review -- --session=1 --resume  # 1 小時
npm run ai:review -- --session=2           # 1 小時
npm run ai:review -- --session=3           # 1 小時
```
✅ 完成所有審核

---

**明天 (12/2) - 晚上（訓練，可無人值守）**
```bash
npm run ai:train  # 2-3 小時（GPU 自動運行）
```
✅ 完成模型訓練

---

## 💡 重要提示

### ⚡ 電量管理
- 爬蟲和審核：可中斷，隨時保存
- 訓練：確保接電源，設置筆電不休眠

### 🔄 中斷恢復
所有操作都支持斷點續傳：
```bash
npm run ai:crawl:resume   # 繼續爬蟲
npm run ai:review -- --resume  # 繼續審核
npm run ai:train:resume   # 繼續訓練
```

### 📊 隨時查看進度
```bash
npm run ai:status
```

### 🆘 重置（如果需要）
```bash
npm run ai:reset
```

---

## 📁 文件位置

- **爬蟲數據**: `training-data/raw/[魚種名]/`
- **審核後數據**: `training-data/reviewed/approved/[魚種名]/`
- **訓練模型**: `models/fish-classifier/`
- **進度文件**: `PData/ai_progress.json`

---

## ❓ 常見問題

**Q: 依賴安裝很慢？**
A: 正常，TensorFlow 和 Puppeteer 體積較大，需要 5-10 分鐘

**Q: 爬蟲失敗怎麼辦？**
A: 自動切換多個來源（Google → iNaturalist → Wikimedia），通常能成功

**Q: 需要全程在電腦前嗎？**
A: 不需要！爬蟲可在背景運行，訓練更是無需人工監控

**Q: 審核 600 張圖要多久？**
A: 約 3 小時，但可分 3 個 session（每次 1 小時）

---

## 🎯 下一步

**等待依賴安裝完成後，立即運行：**

```bash
npm run ai:check
```

**如果環境檢查通過，開始第一個爬蟲：**

```bash
npm run ai:crawl:fish -- --fish="紅衫"
```

---

**💪 準備好了嗎？讓我們開始 AI 魚類識別之旅！**

有任何問題，隨時查看：
- 詳細文檔: `AI_README.md`
- 進度狀態: `npm run ai:status`
- 終端輸出（會有詳細提示）
