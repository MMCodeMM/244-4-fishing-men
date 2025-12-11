# 🔧 Node.js 降級指南

## 當前問題
- Node.js v22.17.0 與 TensorFlow.js 原生模塊不兼容
- 錯誤：`ERR_DLOPEN_FAILED` 無法加載 `tfjs_binding.node`

## 解決方案：降級到 Node.js v20.18.1 LTS

### 📥 下載

**直接下載連結：**
```
https://nodejs.org/dist/v20.18.1/node-v20.18.1-x64.msi
```

或訪問官網選擇 LTS 版本：https://nodejs.org/

### 📦 安裝步驟

1. **運行安裝程序**
   - 雙擊 `node-v20.18.1-x64.msi`
   - 選擇 "Next" → "Next" → "Install"
   - 會自動覆蓋現有的 Node.js v22

2. **重啟終端**
   - 關閉所有 VS Code 終端
   - 關閉 VS Code
   - 重新打開 VS Code

3. **驗證版本**
   ```bash
   node --version
   # 應顯示：v20.18.1
   
   npm --version
   # 應顯示：10.x.x
   ```

4. **重新安裝依賴（可選但建議）**
   ```bash
   cd "c:\Users\85292\DAE it 2025 personal\dae-it-2025\244-4-fishing-men"
   
   # 刪除舊的 node_modules
   rm -rf node_modules package-lock.json
   
   # 重新安裝
   npm install
   ```

5. **測試 TensorFlow.js**
   ```bash
   npm run ai:check
   ```

### ✅ 預期結果

安裝成功後，運行 `npm run ai:check` 應該顯示：

```
✅ TensorFlow.js GPU 版本已安裝
ℹ️  將在訓練時檢測 GPU
```

### 🚀 後續步驟

降級完成後，可以繼續：

1. **環境檢查**
   ```bash
   npm run ai:check
   ```

2. **開始爬取數據**
   ```bash
   npm run ai:crawl:fish -- --fish="紅衫"
   ```

3. **啟動審核服務器**
   ```bash
   npm run ai:review
   # 瀏覽器訪問：http://localhost:4000
   ```

### ⚠️ 注意事項

- Node.js v20 是 LTS（長期支持）版本，支持到 2026-04-30
- 不會影響任何現有項目功能
- 所有 TypeScript、Express、MySQL 等依賴完全兼容
- 安裝後無需修改任何代碼

### 🆘 如遇問題

如果安裝後仍有問題：

1. **完全卸載 Node.js**
   - 控制面板 → 程序和功能 → 卸載 Node.js
   - 刪除 `C:\Program Files\nodejs`
   - 刪除 `C:\Users\85292\AppData\Roaming\npm`

2. **重新安裝 v20.18.1**

3. **清理並重裝依賴**
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```
