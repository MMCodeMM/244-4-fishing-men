// Google Images 調試腳本

import puppeteer from 'puppeteer';

async function debugGoogleImages() {
  console.log('🔍 調試 Google Images 爬蟲...');
  
  const browser = await puppeteer.launch({
    headless: false, // 顯示瀏覽器以便調試
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    const searchQuery = encodeURIComponent('紅衫 Red Snapper 香港 fish -cartoon -drawing');
    const searchUrl = `https://www.google.com/search?q=${searchQuery}&tbm=isch&safe=active`;
    
    console.log(`訪問: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 等待頁面完全加載
    await page.waitForTimeout(3000);
    
    // 檢查頁面標題
    const title = await page.title();
    console.log(`頁面標題: ${title}`);
    
    // 檢查所有可能的圖片選擇器
    const selectors = [
      'img[data-src]',
      'img[src]',
      '[data-testid="image"] img',
      '.rg_i',
      '.Q4LuWd img',
      '.islrc img',
      'div[data-ved] img'
    ];
    
    for (const selector of selectors) {
      const count = await page.$$eval(selector, imgs => imgs.length);
      console.log(`選擇器 "${selector}": ${count} 個元素`);
      
      if (count > 0) {
        const urls = await page.$$eval(selector, imgs => 
          imgs.slice(0, 5).map(img => ({
            src: img.getAttribute('src'),
            dataSrc: img.getAttribute('data-src'),
            alt: img.getAttribute('alt')
          }))
        );
        console.log('前 5 個圖片:', urls);
      }
    }
    
    // 檢查頁面 HTML 結構
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log(`頁面內容預覽: ${bodyText}`);
    
    // 等待用戶檢查
    console.log('請檢查瀏覽器頁面，按任意鍵繼續...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    await new Promise(resolve => process.stdin.once('data', resolve));
    
  } catch (error) {
    console.error('調試失敗:', error);
  } finally {
    await browser.close();
  }
}

debugGoogleImages();