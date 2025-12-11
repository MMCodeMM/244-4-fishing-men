// 環境檢查腳本

import * as fs from 'fs';
import * as path from 'path';
import { ProgressManager } from './utils/progress-manager';
import { PATHS, PRIORITY_FISH } from './config';

async function checkEnvironment() {
  console.log('\n🔍 AI 項目環境檢查');
  console.log('━'.repeat(60));

  let allPassed = true;

  // 檢查 Node.js 版本
  console.log('\n1. Node.js 版本');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion >= 16) {
    console.log(`   ✅ ${nodeVersion} (要求 >= 16)`);
  } else {
    console.log(`   ❌ ${nodeVersion} (要求 >= 16)`);
    allPassed = false;
  }

  // 檢查磁盤空間
  console.log('\n2. 磁盤空間');
  try {
    const stats = fs.statfsSync ? fs.statfsSync(process.cwd()) : null;
    if (stats) {
      const availableGB = (stats.bavail * stats.bsize) / (1024 ** 3);
      if (availableGB >= 10) {
        console.log(`   ✅ ${availableGB.toFixed(1)} GB 可用 (要求 >= 10 GB)`);
      } else {
        console.log(`   ⚠️  ${availableGB.toFixed(1)} GB 可用 (建議 >= 10 GB)`);
      }
    } else {
      console.log(`   ℹ️  無法檢測磁盤空間 (Windows 系統)`);
    }
  } catch (error) {
    console.log(`   ℹ️  無法檢測磁盤空間`);
  }

  // 檢查 TensorFlow.js
  console.log('\n3. TensorFlow.js 支持');
  
  // 首先檢查 CUDA 環境
  console.log('\n   🔍 CUDA 環境檢查:');
  try {
    const { execSync } = require('child_process');
    const cudaVersion = execSync('nvcc --version', { encoding: 'utf8' });
    const cudaMatch = cudaVersion.match(/release (\d+\.\d+)/);
    if (cudaMatch) {
      console.log(`   ✅ CUDA Toolkit ${cudaMatch[1]} 已安裝`);
    }
  } catch {
    console.log(`   ⚠️  CUDA Toolkit 未檢測到`);
  }

  // 檢查 cuDNN
  try {
    const fs = require('fs');
    const path = require('path');
    const cudnnPaths = [
      'C:/Program Files/NVIDIA/CUDNN/v9.16/bin/12.9',
      'C:/Program Files/NVIDIA/CUDNN/v8.*/bin',
      'C:/tools/cuda/bin'
    ];
    
    let cudnnFound = false;
    for (const cudnnPath of cudnnPaths) {
      if (fs.existsSync(cudnnPath.replace('*', '9')) || fs.existsSync(cudnnPath.replace('*', '8'))) {
        console.log(`   ✅ cuDNN 檢測到: ${cudnnPath}`);
        cudnnFound = true;
        break;
      }
    }
    if (!cudnnFound) {
      console.log(`   ⚠️  cuDNN 路徑未在標準位置檢測到`);
    }
  } catch {
    console.log(`   ⚠️  cuDNN 檢測失敗`);
  }

  // 嘗試 GPU 版本
  console.log('\n   📦 TensorFlow.js 版本測試:');
  let tfLoaded = false;
  
  try {
    // 添加 cuDNN 路徑到環境
    process.env.PATH = process.env.PATH + ';C:\\Program Files\\NVIDIA\\CUDNN\\v9.16\\bin\\12.9';
    
    const tfGpu = require('@tensorflow/tfjs-node-gpu');
    console.log(`   🚀 TensorFlow.js GPU ${tfGpu.version.tfjs} 載入成功`);
    console.log(`   ⚡ GPU 加速可用，訓練速度將大幅提升`);
    tfLoaded = true;
  } catch (gpuError: any) {
    console.log(`   ⚠️  GPU 版本載入失敗: ${gpuError?.message?.split('\\n')?.[0] || 'Unknown error'}`);
    
    try {
      const tfNode = require('@tensorflow/tfjs-node');
      console.log(`   ✅ TensorFlow.js Node CPU ${tfNode.version.tfjs} 已載入`);
      console.log(`   💻 使用 CPU 後端進行訓練`);
      tfLoaded = true;
    } catch (cpuError: any) {
      console.log(`   ⚠️  CPU 版本載入失敗: ${cpuError?.message?.split('\\n')?.[0] || 'Unknown error'}`);
      
      try {
        const tfWeb = require('@tensorflow/tfjs');
        console.log(`   ✅ TensorFlow.js Web ${tfWeb.version.tfjs} 已載入`);
        console.log(`   🌐 使用 Web CPU 後端，適合小型數據集`);
        tfLoaded = true;
      } catch (webError: any) {
        console.log(`   ❌ 所有 TensorFlow.js 版本都載入失敗`);
        console.log(`   請運行: npm install @tensorflow/tfjs`);
        allPassed = false;
      }
    }
  }
  
  if (tfLoaded) {
    console.log(`   ℹ️  適合訓練 600 張圖片 (6 種魚 × 100 張)`);
  }

  // 檢查依賴
  console.log('\n4. 核心依賴');
  const dependencies = [
    'puppeteer',
    'sharp',
    'axios',
    'cheerio',
    'better-sqlite3'
  ];

  for (const dep of dependencies) {
    try {
      require(dep);
      console.log(`   ✅ ${dep}`);
    } catch {
      console.log(`   ❌ ${dep} 未安裝`);
      allPassed = false;
    }
  }

  // 創建目錄結構
  console.log('\n5. 目錄結構');
  const dirs = [
    PATHS.raw,
    PATHS.approved,
    PATHS.rejected,
    PATHS.models,
    'PData'
  ];

  // 為每種魚創建目錄
  PRIORITY_FISH.forEach(fish => {
    dirs.push(path.join(PATHS.raw, fish.name));
    dirs.push(path.join(PATHS.approved, fish.name));
  });

  let createdCount = 0;
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      createdCount++;
    }
  }

  if (createdCount > 0) {
    console.log(`   ✅ 創建 ${createdCount} 個目錄`);
  } else {
    console.log(`   ✅ 所有目錄已存在`);
  }

  // 初始化進度管理
  console.log('\n6. 進度管理');
  try {
    const progressManager = new ProgressManager();
    progressManager.updateStageProgress('stage0_check', {
      status: 'completed',
      progress: 100
    });
    progressManager.updateStageProgress('stage1_crawling', {
      status: 'pending',
      progress: 0
    });
    console.log(`   ✅ 進度管理系統已初始化`);
    console.log(`   📁 ${PATHS.progress}`);
  } catch (error) {
    console.log(`   ❌ 進度管理初始化失敗`);
    allPassed = false;
  }

  // 總結
  console.log('\n' + '━'.repeat(60));
  if (allPassed) {
    console.log('✅ 環境檢查通過！\n');
    console.log('🚀 下一步:');
    console.log('   單個魚種: npm run ai:crawl:fish -- --fish="紅衫"');
    console.log('   批次爬蟲: npm run ai:crawl:batch');
    console.log('   查看進度: npm run ai:status\n');
  } else {
    console.log('❌ 環境檢查未通過\n');
    console.log('請先修復上述問題，然後重新運行:');
    console.log('   npm run ai:check\n');
  }
  console.log('━'.repeat(60) + '\n');

  process.exit(allPassed ? 0 : 1);
}

checkEnvironment();
