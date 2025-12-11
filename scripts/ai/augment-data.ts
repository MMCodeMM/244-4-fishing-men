// 數據增強腳本 - 擴充訓練數據

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { PATHS, PRIORITY_FISH } from './config';

// 數據增強配置
const AUGMENTATION_CONFIG = {
  targetPerFish: 200,  // 每種魚目標 200 張
  augmentations: [
    { name: 'original', transform: (img: sharp.Sharp) => img },
    { name: 'flip_h', transform: (img: sharp.Sharp) => img.flop() },
    { name: 'rotate_10', transform: (img: sharp.Sharp) => img.rotate(10, { background: { r: 0, g: 0, b: 0, alpha: 0 } }) },
    { name: 'rotate_-10', transform: (img: sharp.Sharp) => img.rotate(-10, { background: { r: 0, g: 0, b: 0, alpha: 0 } }) },
    { name: 'bright_1.2', transform: (img: sharp.Sharp) => img.modulate({ brightness: 1.2 }) },
    { name: 'bright_0.8', transform: (img: sharp.Sharp) => img.modulate({ brightness: 0.8 }) },
    { name: 'contrast_1.2', transform: (img: sharp.Sharp) => img.linear(1.2, -(128 * 1.2) + 128) },
  ]
};

interface AugmentStats {
  fishName: string;
  original: number;
  augmented: number;
  total: number;
}

async function augmentImage(
  inputPath: string,
  outputDir: string,
  baseName: string,
  augmentationIndex: number,
  transform: (img: sharp.Sharp) => sharp.Sharp
): Promise<void> {
  const img = sharp(inputPath);
  const augmented = transform(img.clone());
  
  const outputName = `${baseName}_aug${augmentationIndex}.jpg`;
  const outputPath = path.join(outputDir, outputName);
  
  await augmented
    .resize(224, 224, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toFile(outputPath);
}

async function augmentFishData(fishName: string): Promise<AugmentStats> {
  console.log(`\n🔄 處理: ${fishName}`);
  
  const approvedDir = path.join(PATHS.approved, fishName);
  const augmentedDir = path.join(PATHS.approved, `${fishName}_augmented`);
  
  if (!fs.existsSync(approvedDir)) {
    console.log(`  ⚠️  找不到目錄: ${approvedDir}`);
    return { fishName, original: 0, augmented: 0, total: 0 };
  }
  
  // 創建增強數據目錄
  if (fs.existsSync(augmentedDir)) {
    fs.rmSync(augmentedDir, { recursive: true });
  }
  fs.mkdirSync(augmentedDir, { recursive: true });
  
  // 獲取所有原始圖片
  const originalImages = fs.readdirSync(approvedDir)
    .filter(f => f.match(/\.(jpg|jpeg|png)$/i));
  
  console.log(`  📊 原始圖片: ${originalImages.length} 張`);
  
  if (originalImages.length === 0) {
    return { fishName, original: 0, augmented: 0, total: 0 };
  }
  
  // 計算需要生成的增強圖片數量
  const targetTotal = AUGMENTATION_CONFIG.targetPerFish;
  const needAugmented = Math.max(0, targetTotal - originalImages.length);
  const augmentationsNeeded = Math.ceil(needAugmented / originalImages.length);
  
  console.log(`  🎯 目標: ${targetTotal} 張`);
  console.log(`  📈 需要增強: ${needAugmented} 張`);
  console.log(`  🔢 每張圖增強: ${augmentationsNeeded} 次`);
  
  let augmentedCount = 0;
  
  // 對每張原始圖片進行增強
  for (let i = 0; i < originalImages.length; i++) {
    const imgFile = originalImages[i];
    const imgPath = path.join(approvedDir, imgFile);
    const baseName = path.parse(imgFile).name;
    
    // 複製原始圖片
    const originalOutput = path.join(augmentedDir, `${baseName}_original.jpg`);
    await sharp(imgPath)
      .resize(224, 224, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toFile(originalOutput);
    
    // 應用增強
    const augmentationsToApply = Math.min(
      augmentationsNeeded,
      AUGMENTATION_CONFIG.augmentations.length - 1
    );
    
    for (let j = 1; j <= augmentationsToApply && augmentedCount < needAugmented; j++) {
      const augmentation = AUGMENTATION_CONFIG.augmentations[j];
      await augmentImage(
        imgPath,
        augmentedDir,
        baseName,
        j,
        augmentation.transform
      );
      augmentedCount++;
    }
    
    if ((i + 1) % 10 === 0) {
      console.log(`  ⏳ 進度: ${i + 1}/${originalImages.length} 張原始圖片已處理`);
    }
  }
  
  const totalImages = fs.readdirSync(augmentedDir).length;
  console.log(`  ✅ 完成: ${totalImages} 張 (原始 ${originalImages.length} + 增強 ${augmentedCount})`);
  
  return {
    fishName,
    original: originalImages.length,
    augmented: augmentedCount,
    total: totalImages
  };
}

async function main() {
  console.log('🎨 數據增強工具');
  console.log('━'.repeat(60));
  console.log(`目標: 每種魚 ${AUGMENTATION_CONFIG.targetPerFish} 張圖片`);
  console.log('━'.repeat(60));
  
  const stats: AugmentStats[] = [];
  
  for (const fish of PRIORITY_FISH) {
    const stat = await augmentFishData(fish.name);
    stats.push(stat);
  }
  
  console.log('\n\n📊 數據增強統計');
  console.log('━'.repeat(60));
  
  let totalOriginal = 0;
  let totalAugmented = 0;
  let totalFinal = 0;
  
  for (const stat of stats) {
    console.log(`${stat.fishName}:`);
    console.log(`  原始: ${stat.original} 張`);
    console.log(`  增強: ${stat.augmented} 張`);
    console.log(`  總計: ${stat.total} 張`);
    
    totalOriginal += stat.original;
    totalAugmented += stat.augmented;
    totalFinal += stat.total;
  }
  
  console.log('━'.repeat(60));
  console.log(`總計:`);
  console.log(`  原始: ${totalOriginal} 張`);
  console.log(`  增強: ${totalAugmented} 張`);
  console.log(`  總計: ${totalFinal} 張`);
  console.log('━'.repeat(60));
  
  console.log('\n✅ 數據增強完成！');
  console.log(`\n📁 增強後的數據存放在: ${PATHS.approved}/*_augmented/`);
  console.log('\n下一步:');
  console.log('  1. 修改訓練腳本使用增強數據');
  console.log('  2. 運行: npm run ai:train');
}

main().catch(console.error);
