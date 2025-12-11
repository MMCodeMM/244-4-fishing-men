// Puppeteer 爬蟲 - Google Images

import puppeteer, { Browser, Page } from 'puppeteer';

export class PuppeteerCrawler {
  private browser: Browser | null = null;

  async initialize() {
    console.log('🚀 啟動 Puppeteer 瀏覽器...');
    
    this.browser = await puppeteer.launch({
      headless: 'new' as any,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
  }

  async crawlBingImages(
    keywords: string[],
    targetCount: number
  ): Promise<string[]> {
    if (!this.browser) {
      throw new Error('瀏覽器未初始化');
    }

    // 使用第一個關鍵字（通常是學名）作為主搜索
    const mainKeyword = keywords[0];
    console.log(`🔍 使用 Puppeteer 爬取 Bing Images: ${mainKeyword}`);

    const page = await this.browser.newPage();

    try {
      // 設置 viewport
      await page.setViewport({ width: 1280, height: 800 });

      // 設置 User-Agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Bing Images 搜索 URL - 使用學名和專業術語
      const searchQuery = encodeURIComponent(
        `${mainKeyword} fish marine -cartoon -drawing -art`
      );
      const searchUrl = `https://www.bing.com/images/search?q=${searchQuery}&form=HDRSC2&first=1`;

      console.log(`   訪問: ${searchUrl}`);
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // 等待圖片加載
      try {
        await page.waitForSelector('.iusc, .mimg, img[class*="img"]', { timeout: 10000 });
      } catch {
        console.log(`   ⚠️  圖片加載超時，嘗試繼續...`);
      }

      // 滾動加載更多圖片
      let previousHeight = 0;
      let scrollAttempts = 0;
      const maxScrolls = 10;

      while (scrollAttempts < maxScrolls) {
        // 滾動到底部
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });

        // 等待新內容加載
        await this.randomDelay(1500, 2500);

        // 檢查是否有新內容
        const newHeight = await page.evaluate(() => document.body.scrollHeight);
        
        if (newHeight === previousHeight) {
          // 嘗試點擊"顯示更多結果"按鈕
          try {
            await page.waitForSelector('input[value="顯示更多結果"], input[value="Show more results"]', {
              timeout: 2000
            });
            await page.click('input[value="顯示更多結果"], input[value="Show more results"]');
            await this.randomDelay(2000, 3000);
          } catch {
            // 沒有更多結果按鈕，退出
            break;
          }
        }

        previousHeight = newHeight;
        scrollAttempts++;
      }

      // 提取 Bing Images URL
      const imageUrls = await page.evaluate(() => {
        const urls: string[] = [];
        
        // 方法 1: Bing Images 主要選擇器
        const bingImages = Array.from(document.querySelectorAll('.iusc'));
        bingImages.forEach(container => {
          try {
            // Bing 將圖片 URL 存在 data-src 或 m 屬性中
            const mData = container.getAttribute('m');
            if (mData) {
              const parsed = JSON.parse(mData);
              if (parsed.murl || parsed.turl) {
                urls.push(parsed.murl || parsed.turl);
              }
            }
          } catch (e) {
            // 忽略解析錯誤
          }
        });
        
        // 方法 2: 標準 img 標籤（備用）
        const standardImages = Array.from(document.querySelectorAll('img.mimg, img[src*="bing"]'));
        standardImages.forEach(img => {
          const src = (img as HTMLImageElement).src;
          if (src && src.startsWith('http') && 
              !src.includes('bing.com/th?id=') && // 排除縮略圖
              !src.includes('data:image') &&
              !urls.includes(src)) {
            urls.push(src);
          }
        });
        
        // 方法 3: 檢查所有 img 元素的高質量 src
        const allImages = Array.from(document.querySelectorAll('img[src]'));
        allImages.forEach(img => {
          const src = (img as HTMLImageElement).src;
          if (src && 
              src.startsWith('http') && 
              !src.includes('bing.com/rp/') &&
              !src.includes('data:image') &&
              src.length > 50 && // 過濾掉太短的 URL
              !urls.includes(src)) {
            urls.push(src);
          }
        });
        
        return [...new Set(urls)];
      });

      console.log(`   ✅ 找到 ${imageUrls.length} 張圖片 URL`);

      await page.close();
      return imageUrls.slice(0, targetCount);

    } catch (error) {
      console.error(`   ❌ Bing Images 爬取失敗:`, (error as Error).message);
      await page.close();
      return [];
    }
  }

  private async randomDelay(min: number, max: number) {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('✅ Puppeteer 瀏覽器已關閉');
    }
  }
}
