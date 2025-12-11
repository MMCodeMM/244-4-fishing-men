// 進度管理系統 - 支持斷點續傳

import * as fs from 'fs-extra';
import * as path from 'path';
import { PATHS, PRIORITY_FISH } from '../config';

export interface FishProgress {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'partial';
  downloadedCount: number;
  targetCount: number;
  lastUpdated?: string;
  completedAt?: string;
}

export interface StageProgress {
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  completedAt?: string;
  [key: string]: any;
}

export interface ProjectProgress {
  lastUpdated: string;
  currentStage: string;
  stages: {
    stage0_check: StageProgress;
    stage1_crawling: StageProgress & {
      fishProgress: FishProgress[];
      totalImages: number;
      targetImages: number;
    };
    stage2_review: StageProgress;
    stage3_training: StageProgress;
    stage4_integration: StageProgress;
  };
  canResume: boolean;
  nextAction: string;
}

export class ProgressManager {
  private progressPath: string;
  private progress: ProjectProgress;

  constructor() {
    this.progressPath = path.join(process.cwd(), PATHS.progress);
    this.progress = this.loadProgress();
  }

  private loadProgress(): ProjectProgress {
    try {
      if (fs.existsSync(this.progressPath)) {
        return JSON.parse(fs.readFileSync(this.progressPath, 'utf-8'));
      }
    } catch (error) {
      console.warn('⚠️  無法讀取進度文件，創建新進度');
    }

    // 默認進度
    return {
      lastUpdated: new Date().toISOString(),
      currentStage: 'stage0_check',
      stages: {
        stage0_check: {
          status: 'pending',
          progress: 0
        },
        stage1_crawling: {
          status: 'pending',
          progress: 0,
          fishProgress: PRIORITY_FISH.map(fish => ({
            name: fish.name,
            status: 'pending',
            downloadedCount: 0,
            targetCount: 100
          })),
          totalImages: 0,
          targetImages: 600
        },
        stage2_review: {
          status: 'pending',
          progress: 0
        },
        stage3_training: {
          status: 'pending',
          progress: 0
        },
        stage4_integration: {
          status: 'pending',
          progress: 0
        }
      },
      canResume: false,
      nextAction: 'npm run ai:check'
    };
  }

  private saveProgress() {
    try {
      fs.ensureDirSync(path.dirname(this.progressPath));
      this.progress.lastUpdated = new Date().toISOString();
      fs.writeFileSync(
        this.progressPath,
        JSON.stringify(this.progress, null, 2)
      );
    } catch (error) {
      console.error('❌ 保存進度失敗:', error);
    }
  }

  // 獲取特定魚種的進度
  getFishProgress(fishName: string): FishProgress {
    const fishProgress = this.progress.stages.stage1_crawling.fishProgress.find(
      f => f.name === fishName
    );

    if (!fishProgress) {
      return {
        name: fishName,
        status: 'pending',
        downloadedCount: 0,
        targetCount: 100
      };
    }

    return fishProgress;
  }

  // 更新魚種進度
  updateFishProgress(fishName: string, updates: Partial<FishProgress>) {
    const fishIndex = this.progress.stages.stage1_crawling.fishProgress.findIndex(
      f => f.name === fishName
    );

    if (fishIndex >= 0) {
      this.progress.stages.stage1_crawling.fishProgress[fishIndex] = {
        ...this.progress.stages.stage1_crawling.fishProgress[fishIndex],
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      // 更新總進度
      const totalDownloaded = this.progress.stages.stage1_crawling.fishProgress.reduce(
        (sum, fish) => sum + fish.downloadedCount,
        0
      );
      this.progress.stages.stage1_crawling.totalImages = totalDownloaded;
      this.progress.stages.stage1_crawling.progress = Math.round(
        (totalDownloaded / this.progress.stages.stage1_crawling.targetImages) * 100
      );

      // 檢查是否所有魚都完成
      const allCompleted = this.progress.stages.stage1_crawling.fishProgress.every(
        f => f.status === 'completed'
      );
      if (allCompleted) {
        this.progress.stages.stage1_crawling.status = 'completed';
        this.progress.stages.stage1_crawling.completedAt = new Date().toISOString();
        this.progress.currentStage = 'stage2_review';
        this.progress.nextAction = 'npm run ai:review -- --session=1';
      }

      this.progress.canResume = true;
      this.saveProgress();
    }
  }

  // 更新階段進度
  updateStageProgress(stage: string, updates: Partial<StageProgress>) {
    if (this.progress.stages[stage as keyof typeof this.progress.stages]) {
      const stageData = this.progress.stages[stage as keyof typeof this.progress.stages];
      Object.assign(stageData, updates);

      if (updates.status === 'completed') {
        (stageData as any).completedAt = new Date().toISOString();
      }

      this.saveProgress();
    }
  }

  // 獲取當前進度
  getProgress(): ProjectProgress {
    return this.progress;
  }

  // 顯示進度摘要
  displayProgress() {
    console.log('\n🎯 AI 魚類識別項目進度');
    console.log('━'.repeat(60));
    console.log(`最後更新: ${new Date(this.progress.lastUpdated).toLocaleString('zh-TW')}\n`);

    console.log(`當前階段: ${this.progress.currentStage}\n`);

    console.log('各階段進度:');
    
    // 階段 0
    const stage0 = this.progress.stages.stage0_check;
    this.displayStage('階段 0: 環境檢查', stage0.status, stage0.progress);

    // 階段 1
    const stage1 = this.progress.stages.stage1_crawling;
    this.displayStage('階段 1: 數據爬取', stage1.status, stage1.progress);
    if (stage1.fishProgress && stage1.fishProgress.length > 0) {
      stage1.fishProgress.forEach(fish => {
        const emoji = fish.status === 'completed' ? '✅' : 
                      fish.status === 'in_progress' ? '⏳' : '⏸️';
        console.log(`   ${emoji} ${fish.name}: ${fish.downloadedCount}/${fish.targetCount} ${
          fish.status === 'completed' ? '(完成)' : ''
        }`);
      });
    }

    // 階段 2
    const stage2 = this.progress.stages.stage2_review;
    this.displayStage('階段 2: 人工審核', stage2.status, stage2.progress);

    // 階段 3
    const stage3 = this.progress.stages.stage3_training;
    this.displayStage('階段 3: 模型訓練', stage3.status, stage3.progress);

    // 階段 4
    const stage4 = this.progress.stages.stage4_integration;
    this.displayStage('階段 4: 整合測試', stage4.status, stage4.progress);

    // 總體進度
    const overallProgress = this.calculateOverallProgress();
    console.log(`\n總體進度: ${this.getProgressBar(overallProgress)} ${overallProgress}%`);

    console.log(`\n下一步操作:\n${this.progress.nextAction}\n`);
  }

  private displayStage(name: string, status: string, progress: number) {
    const emoji = status === 'completed' ? '✅' : 
                  status === 'in_progress' ? '⏳' : '⏸️';
    const bar = this.getProgressBar(progress);
    console.log(`${emoji} ${name} ${bar} ${progress}%`);
  }

  private getProgressBar(percent: number, length: number = 20): string {
    const filled = Math.min(Math.max(Math.round((percent / 100) * length), 0), length);
    return '[' + '█'.repeat(filled) + '░'.repeat(length - filled) + ']';
  }

  private calculateOverallProgress(): number {
    const weights = {
      stage0_check: 5,
      stage1_crawling: 35,
      stage2_review: 30,
      stage3_training: 25,
      stage4_integration: 5
    };

    let totalProgress = 0;
    Object.entries(weights).forEach(([stage, weight]) => {
      const stageData = this.progress.stages[stage as keyof typeof this.progress.stages];
      totalProgress += (stageData.progress / 100) * weight;
    });

    return Math.round(totalProgress);
  }

  // 重置進度
  reset() {
    this.progress = this.loadProgress();
    if (fs.existsSync(this.progressPath)) {
      fs.removeSync(this.progressPath);
    }
    console.log('✅ 進度已重置');
  }
}
