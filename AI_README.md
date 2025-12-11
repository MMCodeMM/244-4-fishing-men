# AI 魚類識別功能 - 快速開始

## 📋 項目概述

這是一個基於 TensorFlow.js 和 MobileNetV3-Large 的魚類圖片識別系統，專門訓練識別 6 種常見香港魚類。

### 🐟 支持的魚種
1. 紅衫 (Red Snapper)
2. 鯉魚 (Carp)
3. 鯧魚 (Pomfret)
4. 九肚魚 (Bombay Duck)
5. 烏頭 (Grey Mullet)
6. 馬頭 (Horse Mackerel)

---

## 🚀 快速開始

### 階段 0: 環境檢查（1 分鐘）

```bash
npm run ai:check
```

這會檢查：
- Node.js 版本
- GPU 支持
- 依賴安裝
- 磁盤空間
- 目錄結構

---

### 階段 1: 數據收集（2-3 小時，可中斷）

#### 方式 A: 單個魚種爬取
```bash
# 爬取紅衫
npm run ai:crawl:fish -- --fish="紅衫"

# 爬取鯉魚
npm run ai:crawl:fish -- --fish="鯉魚"

# 其他魚種...
```

#### 方式 B: 批次爬取
```bash
# 自動依序爬取所有魚種
npm run ai:crawl:batch

# 中斷後繼續
npm run ai:crawl:resume
```

**特點**：
- ✅ 支持斷點續傳
- ✅ 每 10 張自動保存進度
- ✅ 可隨時 Ctrl+C 中斷
- ✅ 自動去重和驗證
- ✅ 多來源爬蟲（Google + Wikimedia + iNaturalist）

---

### 階段 2: 人工審核（3 小時，分 3 個 Session）

```bash
# Session 1: 審核紅衫、鯉魚 (1 小時)
npm run ai:review -- --session=1

# Session 2: 審核鯧魚、九肚魚 (1 小時)
npm run ai:review -- --session=2

# Session 3: 審核烏頭、馬頭 (1 小時)
npm run ai:review -- --session=3
```

**審核界面**：
- 網頁界面: http://localhost:4000
- 快捷鍵: → (批准), ← (拒絕), Q (保存退出)
- 自動保存進度

---

### 階段 3: 模型訓練（2-3 小時，可中斷）

```bash
# 開始訓練
npm run ai:train

# 中斷後繼續（從最近的 checkpoint）
npm run ai:train:resume
```

**訓練配置**：
- 模型: MobileNetV3-Large
- Epochs: 30
- Batch Size: 32
- 早停: 5 epochs patience
- 支持: GPU 加速（RTX 3070Ti）

---

### 階段 4: 整合到主應用（30 分鐘）

```bash
# 自動整合
npm run ai:integrate

# 啟動應用
npm start
```

訪問: http://localhost:3000/search.html

---

## 📊 進度查看

```bash
# 隨時查看進度
npm run ai:status
```

輸出示例：
```
🎯 AI 魚類識別項目進度
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
當前階段: stage1_crawling

各階段進度:
✅ 階段 0: 環境檢查 [████████████] 100%
⏳ 階段 1: 數據爬取 [████░░░░░░░░] 42%
   ✅ 紅衫: 105/100 (完成)
   ✅ 鯉魚: 98/100 (完成)
   ⏳ 鯧魚: 45/100
   ⏸️  九肚魚: 0/100
   ...

總體進度: [████░░░░░░░░] 18%
```

---

## 🔄 中斷與恢復

所有階段都支持斷點續傳：

```bash
# 爬蟲中斷後
npm run ai:crawl:resume

# 訓練中斷後
npm run ai:train:resume

# 審核中斷後
npm run ai:review -- --resume
```

---

## 📁 文件結構

```
244-4-fishing-men/
├── scripts/ai/              # AI 腳本
│   ├── config.ts           # 配置
│   ├── crawlers/           # 爬蟲
│   └── utils/              # 工具
├── training-data/          # 訓練數據
│   ├── raw/               # 爬蟲原始數據
│   └── reviewed/          # 審核後數據
├── models/                # 訓練好的模型
└── PData/
    └── ai_progress.json   # 進度文件
```

---

## ⚠️ 常見問題

### Q: 如何重置所有進度？
```bash
npm run ai:reset
```

### Q: 爬蟲被網站封鎖怎麼辦？
- 使用 Puppeteer 模擬真實瀏覽器
- 自動添加隨機延遲
- 多來源備份策略
- 如果仍失敗，可手動下載補充

### Q: 電量不足需要暫停？
- 隨時按 Ctrl+C 中斷
- 進度已自動保存
- 重新運行對應的 `--resume` 命令

### Q: 訓練時間太長？
- 使用 GPU 加速（RTX 3070Ti 約 1.5-2 小時）
- 減少 epochs（30 → 20）
- 或使用 MobileNetV3-Small（更快但準確度略低）

---

## 📝 時間估算

| 階段 | 時間 | 可中斷 |
|------|------|--------|
| 環境檢查 | 1 分鐘 | ❌ |
| 數據爬取 | 2-3 小時 | ✅ |
| 人工審核 | 3 小時 | ✅ |
| 模型訓練 | 2-3 小時 | ✅ |
| 整合測試 | 30 分鐘 | ❌ |
| **總計** | **8-10 小時** | **分段執行** |

---

## 🎯 下一步

1. 運行 `npm run ai:check` 檢查環境
2. 開始爬蟲 `npm run ai:crawl:batch`
3. 隨時查看進度 `npm run ai:status`

有問題請參考 console 輸出或查看進度文件 `PData/ai_progress.json`
