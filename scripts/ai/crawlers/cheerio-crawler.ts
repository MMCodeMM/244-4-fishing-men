// Cheerio 爬蟲 - 靜態網頁（備用）

import axios from 'axios';
import * as cheerio from 'cheerio';

export class CheerioCrawler {
  // 爬取 Wikimedia Commons
  async crawlWikimedia(fishNameEn: string, targetCount: number): Promise<string[]> {
    console.log(`🔍 使用 Cheerio 爬取 Wikimedia: ${fishNameEn}`);

    try {
      const searchUrl = `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(
        fishNameEn + ' fish'
      )}&title=Special:MediaSearch&type=image`;

      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FishingBot/1.0; Educational)'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const imageUrls: string[] = [];

      $('img').each((i, elem) => {
        const src = $(elem).attr('src');
        if (src && src.includes('upload.wikimedia.org') && !src.includes('icon')) {
          // 獲取原始大小的圖片
          let fullUrl = src;
          if (fullUrl.includes('/thumb/')) {
            fullUrl = fullUrl.replace(/\/thumb\//, '/').replace(/\/\d+px-.*$/, '');
          }
          imageUrls.push(fullUrl.startsWith('//') ? 'https:' + fullUrl : fullUrl);
        }
      });

      const unique = Array.from(new Set(imageUrls));
      console.log(`   ✅ 找到 ${unique.length} 張圖片`);
      return unique.slice(0, targetCount);

    } catch (error) {
      console.warn(`   ⚠️  Wikimedia 爬取失敗:`, (error as Error).message);
      return [];
    }
  }

  // 爬取香港政府網站
  async crawlHKGov(fishName: string): Promise<string[]> {
    console.log(`🔍 使用 Cheerio 爬取香港政府網站: ${fishName}`);

    try {
      const url = 'https://www.afcd.gov.hk/tc_chi/conservation/con_flo/con_flo_chi.html';

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FishingBot/1.0)'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const imageUrls: string[] = [];

      $('img').each((i, elem) => {
        const src = $(elem).attr('src');
        const alt = $(elem).attr('alt') || '';
        
        if (src && (alt.includes(fishName) || src.includes(fishName))) {
          const fullUrl = src.startsWith('http') 
            ? src 
            : new URL(src, url).href;
          imageUrls.push(fullUrl);
        }
      });

      console.log(`   ✅ 找到 ${imageUrls.length} 張圖片`);
      return imageUrls;

    } catch (error) {
      console.warn(`   ⚠️  香港政府網站爬取失敗:`, (error as Error).message);
      return [];
    }
  }

  // 爬取 iNaturalist (免費 API)
  async crawlINaturalist(fishNameEn: string, targetCount: number): Promise<string[]> {
    console.log(`🔍 使用 iNaturalist API: ${fishNameEn}`);

    try {
      const apiUrl = `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(
        fishNameEn
      )}&photos=true&per_page=${Math.min(targetCount, 50)}&quality_grade=research`;

      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FishingBot/1.0)'
        },
        timeout: 15000
      });

      const imageUrls: string[] = [];

      if (response.data && response.data.results) {
        response.data.results.forEach((obs: any) => {
          if (obs.photos && obs.photos.length > 0) {
            obs.photos.forEach((photo: any) => {
              if (photo.url) {
                // 獲取大尺寸圖片
                const largeUrl = photo.url.replace('/square.', '/large.');
                imageUrls.push(largeUrl);
              }
            });
          }
        });
      }

      console.log(`   ✅ 找到 ${imageUrls.length} 張圖片`);
      return imageUrls.slice(0, targetCount);

    } catch (error) {
      console.warn(`   ⚠️  iNaturalist 爬取失敗:`, (error as Error).message);
      return [];
    }
  }
}
