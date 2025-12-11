// 漸進式訓練進度追蹤和管理

import * as fs from 'fs';
import * as path from 'path';
import { PRIORITY_FISH, PATHS } from './config';

interface ReviewProgress {
  fishName: string;
  totalImages: number;
  reviewedCount: number;
  approvedCount: number;
  rejectedCount: number;
  targetForRound1: number;
  readyForTraining: boolean;
}

class ProgressiveTrainingManager {
  
  // 檢查第一輪審核進度
  checkRound1Progress(): ReviewProgress[] {
    const progress: ReviewProgress[] = [];
    
    console.log('📊 第一輪審核進度檢查\n');
    console.log('目標：每種魚類審核100張圖片');
    console.log('=' .repeat(60));
    
    for (const fish of PRIORITY_FISH) {
      const rawDir = path.join(PATHS.raw, fish.name);
      const approvedDir = path.join(PATHS.approved, fish.name);
      const rejectedDir = path.join(PATHS.rejected);
      
      // 統計數量
      const totalImages = this.countImages(rawDir);
      const approvedCount = this.countImages(approvedDir);
      const rejectedCount = this.countRejectedForFish(rejectedDir, fish.name);
      const reviewedCount = approvedCount + rejectedCount;
      
      const fishProgress: ReviewProgress = {
        fishName: fish.name,
        totalImages,
        reviewedCount,
        approvedCount,
        rejectedCount,
        targetForRound1: 100,
        readyForTraining: approvedCount >= 50 // 至少50張通過審核才能訓練
      };
      
      progress.push(fishProgress);
      
      // 顯示進度
      const status = fishProgress.readyForTraining ? '✅' : '⏳';
      console.log(`${status} ${fish.name}:`);
      console.log(`   總圖片: ${totalImages}`);
      console.log(`   已審核: ${reviewedCount}/100`);
      console.log(`   ├─ 通過: ${approvedCount}`);
      console.log(`   └─ 拒絕: ${rejectedCount}`);
      
      if (approvedCount >= 50) {
        console.log(`   🎯 可以開始訓練！`);
      } else {
        console.log(`   ⚠️  需要至少 ${50 - approvedCount} 張通過圖片`);
      }
      console.log('');
    }
    
    return progress;
  }
  
  // 檢查是否可以開始第一輪訓練
  canStartRound1Training(): boolean {
    const progress = this.checkRound1Progress();
    const readyCount = progress.filter(p => p.readyForTraining).length;
    
    console.log('=' .repeat(60));
    if (readyCount >= 4) {
      console.log(`🎉 可以開始第一輪訓練！(${readyCount}/6 種魚類準備就緒)`);
      console.log('   運行: npm run ai:train');
      return true;
    } else {
      console.log(`⏳ 還需要審核更多圖片 (${readyCount}/6 種魚類準備就緒)`);
      console.log('   需要至少4種魚類各有50張通過圖片');
      return false;
    }
  }
  
  // 分析第一輪訓練結果，建議第二輪改進
  analyzeRound1Results(accuracyData: {[fishName: string]: number}): void {
    console.log('📈 第一輪訓練結果分析\n');
    console.log('=' .repeat(60));
    
    const sortedResults = Object.entries(accuracyData)
      .sort(([,a], [,b]) => a - b); // 按準確率排序
    
    for (const [fishName, accuracy] of sortedResults) {
      const status = accuracy >= 0.8 ? '✅' : accuracy >= 0.6 ? '⚠️' : '❌';
      console.log(`${status} ${fishName}: ${(accuracy * 100).toFixed(1)}%`);
    }
    
    console.log('\n🎯 第二輪改進建議:');
    
    const needImprovement = sortedResults.filter(([,accuracy]) => accuracy < 0.7);
    if (needImprovement.length > 0) {
      console.log('需要優先改進的魚種:');
      for (const [fishName, accuracy] of needImprovement) {
        console.log(`   • ${fishName}: 再審核50-100張高質量圖片`);
      }
    } else {
      console.log('✅ 所有魚種表現良好，可以增加更多訓練數據提升整體準確率');
    }
  }
  
  // 輔助方法：計算圖片數量
  private countImages(dirPath: string): number {
    try {
      if (!fs.existsSync(dirPath)) return 0;
      
      const files = fs.readdirSync(dirPath);
      return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png'].includes(ext);
      }).length;
    } catch (error) {
      return 0;
    }
  }
  
  // 輔助方法：計算特定魚種的拒絕圖片數量
  private countRejectedForFish(rejectedDir: string, fishName: string): number {
    try {
      if (!fs.existsSync(rejectedDir)) return 0;
      
      const files = fs.readdirSync(rejectedDir);
      return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        const isImage = ['.jpg', '.jpeg', '.png'].includes(ext);
        const isThisFish = file.includes(fishName);
        return isImage && isThisFish;
      }).length;
    } catch (error) {
      return 0;
    }
  }
}

// 主程序
function main() {
  const args = process.argv.slice(2);
  const manager = new ProgressiveTrainingManager();
  
  if (args.includes('--check')) {
    // 檢查進度
    manager.canStartRound1Training();
  } else if (args.includes('--analyze')) {
    // 分析結果 (需要準確率數據)
    const mockAccuracy = {
      '紅衫': 0.85,
      '鯉魚': 0.72,
      '鯧魚': 0.68,
      '九肚魚': 0.55,
      '木棉魚': 0.61,
      '馬頭': 0.74
    };
    manager.analyzeRound1Results(mockAccuracy);
  } else {
    // 默認檢查進度
    manager.canStartRound1Training();
  }
}

if (require.main === module) {
  main();
}

export { ProgressiveTrainingManager };