// 批次爬蟲腳本 - 依序爬取所有魚種

import { PRIORITY_FISH } from './config';
import { ProgressManager } from './utils/progress-manager';
import { spawn } from 'child_process';

async function runCrawlForFish(fishName: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn('npm', ['run', 'ai:crawl:fish', '--', '--fish=' + fishName], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function main() {
  const progressManager = new ProgressManager();
  const args = process.argv.slice(2);
  const isResume = args.includes('--resume');

  console.log('\n🚀 批次爬蟲模式');
  console.log('━'.repeat(60));
  console.log(`計劃: ${PRIORITY_FISH.length} 種魚 × 100 張 = 600 張`);
  console.log(`模式: ${isResume ? '續傳' : '新開始'}`);
  console.log('━'.repeat(60));

  let completedCount = 0;
  let totalImages = 0;

  for (const fish of PRIORITY_FISH) {
    const progress = progressManager.getFishProgress(fish.name);

    if (progress.status === 'completed') {
      console.log(`\n✅ ${fish.name}: 已完成 (${progress.downloadedCount}/100)`);
      completedCount++;
      totalImages += progress.downloadedCount;
      continue;
    }

    console.log(`\n⏳ 開始爬取: ${fish.name} (${fish.nameEn})`);
    console.log(`   已有: ${progress.downloadedCount || 0} 張\n`);

    const success = await runCrawlForFish(fish.name);

    if (success) {
      const updatedProgress = progressManager.getFishProgress(fish.name);
      if (updatedProgress.status === 'completed') {
        completedCount++;
      }
      totalImages += updatedProgress.downloadedCount;
    } else {
      console.log(`\n⚠️  ${fish.name} 爬取中斷`);
      console.log(`💡 可使用以下命令繼續:`);
      console.log(`   npm run ai:crawl:resume\n`);
      break;
    }

    // 魚種之間的延遲
    if (completedCount < PRIORITY_FISH.length) {
      console.log('\n⏸️  等待 5 秒後繼續下一種魚...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // 最終統計
  console.log('\n' + '='.repeat(60));
  console.log('📊 批次爬蟲完成統計');
  console.log('='.repeat(60));
  console.log(`完成魚種: ${completedCount}/${PRIORITY_FISH.length}`);
  console.log(`總圖片數: ${totalImages}/600`);
  console.log(`完成度: ${Math.round((totalImages / 600) * 100)}%`);

  if (completedCount === PRIORITY_FISH.length) {
    console.log('\n🎉 所有魚種爬取完成！');
    console.log('\n下一步: npm run ai:review -- --session=1');
  } else {
    console.log('\n⚠️  部分魚種未完成');
    console.log('\n繼續爬取: npm run ai:crawl:resume');
  }
  console.log('='.repeat(60) + '\n');

  // 顯示詳細進度
  progressManager.displayProgress();
}

main();
