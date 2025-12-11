// 單個魚種爬蟲腳本 - 支持斷點續傳

import * as path from 'path';
import { PRIORITY_FISH, PATHS, CRAWL_CONFIG, getSearchKeywords } from './config';
import { ProgressManager } from './utils/progress-manager';
import { ImageValidator } from './utils/image-validator';
import { PuppeteerCrawler } from './crawlers/puppeteer-crawler';
import { CheerioCrawler } from './crawlers/cheerio-crawler';

async function crawlSingleFish(fishName: string, fishNameEn: string) {
  const progressManager = new ProgressManager();
  const imageValidator = new ImageValidator();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🐟 開始爬取: ${fishName} (${fishNameEn})`);
  console.log(`${'='.repeat(60)}\n`);

  // 檢查進度
  const progress = progressManager.getFishProgress(fishName);
  const targetCount = CRAWL_CONFIG.targetImagesPerFish;
  const fishDir = path.join(PATHS.raw, fishName);

  // 計算已下載數量
  const alreadyDownloaded = imageValidator.countImages(fishDir);

  if (alreadyDownloaded >= targetCount) {
    console.log(`✅ ${fishName} 已完成爬取 (${alreadyDownloaded}/${targetCount})`);
    progressManager.updateFishProgress(fishName, {
      status: 'completed',
      downloadedCount: alreadyDownloaded,
      targetCount: targetCount
    });
    return;
  }

  const remaining = targetCount - alreadyDownloaded;
  console.log(`📊 狀態:`);
  console.log(`   已下載: ${alreadyDownloaded}/${targetCount}`);
  console.log(`   需要: ${remaining} 張\n`);

  // 更新狀態為進行中
  progressManager.updateFishProgress(fishName, {
    status: 'in_progress',
    downloadedCount: alreadyDownloaded,
    targetCount: targetCount
  });

  let collectedUrls: string[] = [];
  
  // 獲取搜索關鍵字（學名優先）
  const keywords = getSearchKeywords(fishName);
  console.log(`🔑 搜索關鍵字: ${keywords.slice(0, 3).join(', ')}...`);

  // 策略 1: Puppeteer 爬 Google Images (主要來源 70%)
  try {
    const puppeteer = new PuppeteerCrawler();
    await puppeteer.initialize();

    const bingUrls = await puppeteer.crawlBingImages(
      keywords,
      Math.ceil(remaining * 1.5) // 多抓一些以防無效
    );
    collectedUrls.push(...bingUrls);

    await puppeteer.close();
  } catch (error) {
    console.warn(`⚠️  Puppeteer 失敗，切換到備用方案`);
  }

  // 策略 2: Cheerio 爬 iNaturalist (備用來源)
  try {
    const cheerio = new CheerioCrawler();
    const inatUrls = await cheerio.crawlINaturalist(
      keywords[0], // 使用學名爬取iNaturalist
      Math.ceil(remaining * 0.5)
    );
    collectedUrls.push(...inatUrls);
  } catch (error) {
    console.warn(`⚠️  iNaturalist 爬取失敗`);
  }

  // 策略 3: Cheerio 爬 Wikimedia
  try {
    const cheerio = new CheerioCrawler();
    const wikimediaUrls = await cheerio.crawlWikimedia(
      keywords[0], // 使用學名爬取Wikimedia
      Math.ceil(remaining * 0.3)
    );
    collectedUrls.push(...wikimediaUrls);
  } catch (error) {
    console.warn(`⚠️  Wikimedia 爬取失敗`);
  }

  // 策略 4: 香港政府網站
  try {
    const cheerio = new CheerioCrawler();
    const hkgovUrls = await cheerio.crawlHKGov(fishName);
    collectedUrls.push(...hkgovUrls);
  } catch (error) {
    console.warn(`⚠️  香港政府網站爬取失敗`);
  }

  // 去重
  collectedUrls = Array.from(new Set(collectedUrls));

  console.log(`\n📥 開始下載和驗證 ${collectedUrls.length} 張圖片...`);
  console.log(`   (目標: ${remaining} 張新圖片)\n`);

  let downloadedCount = alreadyDownloaded;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < collectedUrls.length && downloadedCount < targetCount; i++) {
    const url = collectedUrls[i];
    const filename = `${fishName}_${downloadedCount + 1}.jpg`;
    const savePath = path.join(fishDir, filename);

    // 顯示進度
    process.stdout.write(`\r   處理: ${i + 1}/${collectedUrls.length} | 成功: ${successCount} | 失敗: ${failCount} | 總計: ${downloadedCount}/${targetCount}`);

    try {
      const saved = await imageValidator.downloadAndValidate(url, savePath);

      if (saved) {
        downloadedCount++;
        successCount++;

        // 每 10 張保存一次進度
        if (downloadedCount % 10 === 0) {
          progressManager.updateFishProgress(fishName, {
            downloadedCount,
            status: downloadedCount >= targetCount ? 'completed' : 'in_progress'
          });
        }
      } else {
        failCount++;
      }

      // 禮貌延遲
      await imageValidator.randomDelay();

    } catch (error) {
      failCount++;
    }
  }

  // 清除進度行
  process.stdout.write('\r' + ' '.repeat(100) + '\r');

  // 最終保存
  progressManager.updateFishProgress(fishName, {
    downloadedCount,
    status: downloadedCount >= targetCount ? 'completed' : 'partial',
    targetCount: targetCount
  });

  console.log(`\n${'='.repeat(60)}`);
  if (downloadedCount >= targetCount) {
    console.log(`🎉 ${fishName} 爬取完成！`);
    console.log(`   ✅ 總計: ${downloadedCount} 張圖片`);
    console.log(`   📁 保存在: ${fishDir}`);
  } else {
    console.log(`⚠️  ${fishName} 部分完成`);
    console.log(`   已下載: ${downloadedCount}/${targetCount}`);
    console.log(`   成功: ${successCount} | 失敗: ${failCount}`);
    console.log(`\n💡 重新運行以繼續:`);
    console.log(`   npm run ai:crawl:fish -- --fish="${fishName}" --resume`);
  }
  console.log(`${'='.repeat(60)}\n`);
}

// 主程序
async function main() {
  const args = process.argv.slice(2);
  let fishName = '';
  
  // 處理 --fish=名稱 格式
  const fishArg = args.find(arg => arg.startsWith('--fish='));
  if (fishArg) {
    fishName = fishArg.split('=')[1];
  } else {
    // 處理 --fish 名稱 格式
    const fishIndex = args.indexOf('--fish');
    if (fishIndex >= 0 && args[fishIndex + 1]) {
      fishName = args[fishIndex + 1];
    }
  }
  
  if (!fishName) {
    console.error('❌ 請指定魚種名稱');
    console.log('\n用法:');
    console.log('  npm run ai:crawl:fish -- --fish="紅衫"');
    console.log('\n可用魚種:');
    PRIORITY_FISH.forEach(fish => {
      console.log(`  - ${fish.name} (${fish.nameEn})`);
    });
    process.exit(1);
  }
  const fishConfig = PRIORITY_FISH.find(f => f.name === fishName);

  if (!fishConfig) {
    console.error(`❌ 未知魚種: ${fishName}`);
    console.log('\n可用魚種:');
    PRIORITY_FISH.forEach(fish => {
      console.log(`  - ${fish.name} (${fish.nameEn})`);
    });
    process.exit(1);
  }

  try {
    await crawlSingleFish(fishConfig.name, fishConfig.nameEn);
  } catch (error) {
    console.error('\n❌ 爬蟲執行失敗:', error);
    process.exit(1);
  }
}

main();
