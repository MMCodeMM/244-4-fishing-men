@echo off
echo ========================================
echo nvm-windows Node.js 管理腳本
echo ========================================
echo.

echo 1. 檢查 nvm 版本
nvm version
echo.

echo 2. 查看已安裝的 Node.js 版本
nvm list
echo.

echo 3. 安裝 Node.js v20.18.1 LTS
nvm install 20.18.1
echo.

echo 4. 使用 Node.js v20.18.1
nvm use 20.18.1
echo.

echo 5. 驗證 Node.js 版本
node --version
npm --version
echo.

echo ========================================
echo 完成！按任意鍵繼續...
pause > nul
