// AI 模型訓練腳本 - MobileNetV3 遷移學習

import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { PRIORITY_FISH, TRAINING_CONFIG, PATHS } from './config';
import { ProgressManager } from './utils/progress-manager';

const progressMgr = new ProgressManager();

// 標準模型保存（使用 tfjs-node 的 file:// handler）
async function saveModelManually(model: tf.LayersModel, savePath: string): Promise<void> {
  // 確保目錄存在
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }
  
  // 使用標準 save 方法（tfjs-node 支援 file:// protocol）
  const fileUrl = `file://${savePath.replace(/\\/g, '/')}`;
  await model.save(fileUrl);
  
  console.log(`✅ 模型已保存: ${savePath}`);
}

interface TrainingData {
  images: tf.Tensor4D;
  labels: tf.Tensor2D;
}

interface Dataset {
  train: TrainingData;
  validation: TrainingData;
}

// 加載圖片數據
async function loadImages(fishName: string, fishIndex: number, split: 'train' | 'val'): Promise<{ images: tf.Tensor3D[], labels: number[] }> {
  // 優先使用增強數據，如果不存在則使用原始數據
  const augmentedDir = path.join(PATHS.approved, `${fishName}_augmented`);
  const approvedDir = path.join(PATHS.approved, fishName);
  const dataDir = fs.existsSync(augmentedDir) ? augmentedDir : approvedDir;
  
  if (!fs.existsSync(dataDir)) {
    console.warn(`⚠️  ${fishName} 沒有已審核圖片`);
    return { images: [], labels: [] };
  }
  
  const files = fs.readdirSync(dataDir).filter(f => 
    ['.jpg', '.jpeg', '.png'].includes(path.extname(f).toLowerCase())
  );
  
  // 80/20 split for train/val
  const splitIndex = Math.floor(files.length * 0.8);
  const selectedFiles = split === 'train' ? files.slice(0, splitIndex) : files.slice(splitIndex);
  
  console.log(`📊 ${fishName} (${split}): ${selectedFiles.length} 張圖片`);
  
  const images: tf.Tensor3D[] = [];
  const labels: number[] = [];
  
  for (const file of selectedFiles) {
    const filePath = path.join(dataDir, file);
    
    try {
      const buffer = fs.readFileSync(filePath);
      
      // 使用 Sharp 預處理圖片並轉換為RGB陣列
      const { data, info } = await sharp(buffer)
        .resize(TRAINING_CONFIG.inputShape[0], TRAINING_CONFIG.inputShape[1])
        .ensureAlpha(1.0)  // 確保有alpha通道
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      // 將 Buffer 轉換為 Uint8Array 並創建張量（RGBA -> RGB）
      const pixels = new Uint8Array(data);
      // Sharp with ensureAlpha returns RGBA, so we extract RGB channels
      const rgbPixels = new Uint8Array(pixels.length * 3 / 4);
      for (let i = 0; i < pixels.length; i += 4) {
        const baseIdx = (i / 4) * 3;
        rgbPixels[baseIdx] = pixels[i];     // R
        rgbPixels[baseIdx + 1] = pixels[i + 1]; // G
        rgbPixels[baseIdx + 2] = pixels[i + 2]; // B
        // Skip alpha channel
      }
      
      const imageTensor = tf.tensor3d(rgbPixels, [
        TRAINING_CONFIG.inputShape[0],
        TRAINING_CONFIG.inputShape[1],
        3
      ], 'int32');
      
      // 歸一化到 [0, 1]
      const normalized = imageTensor.div(255.0) as tf.Tensor3D;
      
      images.push(normalized);
      labels.push(fishIndex);
      
      // 清理中間張量
      imageTensor.dispose();
    } catch (error) {
      console.warn(`⚠️  載入失敗: ${file} - ${error}`);
    }
  }
  
  return { images, labels };
}

// 準備完整數據集
async function prepareDataset(): Promise<Dataset> {
  console.log('\n📦 準備訓練數據集...\n');
  
  const trainImages: tf.Tensor3D[] = [];
  const trainLabels: number[] = [];
  const valImages: tf.Tensor3D[] = [];
  const valLabels: number[] = [];
  
  for (let i = 0; i < PRIORITY_FISH.length; i++) {
    const fish = PRIORITY_FISH[i];
    
    // 載入訓練集
    const trainData = await loadImages(fish.name, i, 'train');
    trainImages.push(...trainData.images);
    trainLabels.push(...trainData.labels);
    
    // 載入驗證集
    const valData = await loadImages(fish.name, i, 'val');
    valImages.push(...valData.images);
    valLabels.push(...valData.labels);
  }
  
  console.log(`\n✅ 訓練集: ${trainImages.length} 張`);
  console.log(`✅ 驗證集: ${valImages.length} 張\n`);
  
  // 轉換為張量
  const trainImagesTensor = tf.stack(trainImages) as tf.Tensor4D;
  const trainLabelsTensor = tf.oneHot(trainLabels, PRIORITY_FISH.length);
  
  const valImagesTensor = tf.stack(valImages) as tf.Tensor4D;
  const valLabelsTensor = tf.oneHot(valLabels, PRIORITY_FISH.length);
  
  // 清理
  trainImages.forEach(t => t.dispose());
  valImages.forEach(t => t.dispose());
  
  return {
    train: {
      images: trainImagesTensor,
      labels: trainLabelsTensor as tf.Tensor2D
    },
    validation: {
      images: valImagesTensor,
      labels: valLabelsTensor as tf.Tensor2D
    }
  };
}

// 創建 MobileNetV3 模型
async function createModel(): Promise<tf.LayersModel> {
  console.log('\n🏗️  創建 MobileNetV3 模型...\n');
  
  // 加載預訓練的 MobileNetV3-Large (ImageNet)
  // 注意：這裡需要先下載模型文件到本地
  const baseModelPath = path.join(PATHS.models, 'mobilenet_v3_large');
  
  let baseModel: tf.LayersModel;
  
  if (fs.existsSync(baseModelPath)) {
    console.log('📂 載入本地 MobileNetV3 模型...');
    baseModel = await tf.loadLayersModel(`file://${baseModelPath}/model.json`);
  } else {
    console.log('🌐 從 TensorFlow Hub 下載 MobileNetV3...');
    // 這裡應該從 TF Hub 下載，但由於環境限制，我們使用一個簡化版本
    console.log('⚠️  警告：使用簡化版 MobileNet 架構');
    
    // 創建一個簡化的 MobileNet 風格模型
    baseModel = tf.sequential({
      layers: [
        tf.layers.inputLayer({ inputShape: TRAINING_CONFIG.inputShape }),
        
        // 第一個卷積塊
        tf.layers.conv2d({ filters: 32, kernelSize: 3, strides: 2, padding: 'same', activation: 'relu' }),
        tf.layers.batchNormalization(),
        
        // 深度可分離卷積塊 1
        tf.layers.depthwiseConv2d({ kernelSize: 3, padding: 'same', activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.conv2d({ filters: 64, kernelSize: 1, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        
        // 深度可分離卷積塊 2
        tf.layers.depthwiseConv2d({ kernelSize: 3, padding: 'same', activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.conv2d({ filters: 128, kernelSize: 1, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        
        // 深度可分離卷積塊 3
        tf.layers.depthwiseConv2d({ kernelSize: 3, padding: 'same', activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.conv2d({ filters: 256, kernelSize: 1, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        
        // 全局平均池化
        tf.layers.globalAveragePooling2d({})
      ]
    });
  }
  
  // 凍結基礎模型的層，但解凍最後 3 層（微調遷移學習）
  const totalLayers = baseModel.layers.length;
  for (let i = 0; i < totalLayers; i++) {
    baseModel.layers[i].trainable = i >= totalLayers - 3;
  }
  
  // 添加自定義分類頭
  const model = tf.sequential({
    layers: [
      ...baseModel.layers,
      tf.layers.dropout({ rate: 0.3 }),  // 降低 dropout 允許更多學習
      tf.layers.dense({ units: 128, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),  // 適度 dropout
      tf.layers.dense({ units: PRIORITY_FISH.length, activation: 'softmax' })
    ]
  });
  
  console.log('✅ 模型創建完成');
  console.log(`📊 參數總數: ${model.countParams()}`);
  
  return model;
}

// 訓練模型
async function trainModel(model: tf.LayersModel, dataset: Dataset) {
  console.log('\n🚀 開始訓練...\n');
  
  // 編譯模型
  model.compile({
    optimizer: tf.train.adam(TRAINING_CONFIG.learningRate),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
  
  // Early stopping 回調
  let bestValLoss = Infinity;
  let patienceCounter = 0;
  
  const customCallback: tf.CustomCallbackArgs = {
    onEpochEnd: async (epoch, logs) => {
      console.log(
        `Epoch ${epoch + 1}/${TRAINING_CONFIG.epochs} - ` +
        `loss: ${logs?.loss.toFixed(4)} - acc: ${logs?.acc.toFixed(4)} - ` +
        `val_loss: ${logs?.val_loss.toFixed(4)} - val_acc: ${logs?.val_acc.toFixed(4)}`
      );
      
      // Early stopping
      if (logs && logs.val_loss < bestValLoss) {
        bestValLoss = logs.val_loss;
        patienceCounter = 0;
        
        // 保存最佳模型
        try {
          const savePath = path.join(PATHS.fishClassifier, 'best');
          // 確保目錄存在
          if (!fs.existsSync(savePath)) {
            fs.mkdirSync(savePath, { recursive: true });
          }
          
          await saveModelManually(model, savePath);
          console.log('💾 保存最佳模型到:', savePath);
        } catch (error) {
          console.warn('⚠️  模型保存失敗:', error);
        }
      } else {
        patienceCounter++;
        if (patienceCounter >= TRAINING_CONFIG.earlyStoppingPatience) {
          console.log(`\n⏹️  Early stopping at epoch ${epoch + 1}`);
          model.stopTraining = true;
        }
      }
      
      // 更新進度
      const trainingProgress = Math.round(((epoch + 1) / TRAINING_CONFIG.epochs) * 100);
      progressMgr.updateStageProgress('training', { progress: trainingProgress });
    }
  };
  
  // 開始訓練
  await model.fit(dataset.train.images, dataset.train.labels, {
    epochs: TRAINING_CONFIG.epochs,
    batchSize: TRAINING_CONFIG.batchSize,
    validationData: [dataset.validation.images, dataset.validation.labels],
    callbacks: customCallback,
    shuffle: true
  });
  
  console.log('\n✅ 訓練完成！\n');
}

// 評估模型
async function evaluateModel(model: tf.LayersModel, dataset: Dataset) {
  console.log('\n📊 評估模型性能...\n');
  
  const result = model.evaluate(dataset.validation.images, dataset.validation.labels) as tf.Scalar[];
  const loss = await result[0].data();
  const accuracy = await result[1].data();
  
  console.log(`📈 驗證損失: ${loss[0].toFixed(4)}`);
  console.log(`📈 驗證準確率: ${(accuracy[0] * 100).toFixed(2)}%\n`);
  
  // 保存最終模型 - 使用 Node.js 文件系統保存器
  try {
    const finalPath = path.join(PATHS.fishClassifier, 'final');
    // 確保目錄存在
    if (!fs.existsSync(finalPath)) {
      fs.mkdirSync(finalPath, { recursive: true });
    }
    
    // 使用自定義保存邏輯（兼容 Node.js）
    await saveModelManually(model, finalPath);
    
    console.log(`💾 最終模型已保存到: ${finalPath}\n`);
  } catch (error) {
    console.warn('⚠️  最終模型保存失敗:', error);
  }
  
  // 保存類別映射
  const classMapping = PRIORITY_FISH.map((fish, idx) => ({
    index: idx,
    name: fish.name,
    englishName: fish.englishName
  }));
  
  fs.writeFileSync(
    path.join(PATHS.fishClassifier, 'classes.json'),
    JSON.stringify(classMapping, null, 2)
  );
  
  console.log('✅ 類別映射已保存\n');
  
  result.forEach(t => t.dispose());
}

// 主函數
async function main() {
  console.log('\n🐟 魚類識別 AI 模型訓練\n');
  console.log('━'.repeat(60));
  
  try {
    // 強制使用 CPU 後端
    await tf.setBackend('cpu');
    await tf.ready();
    // 檢查 TensorFlow 後端
    console.log('\n🖥️  TensorFlow 後端:', tf.getBackend());
    const isGPU = tf.getBackend() === 'tensorflow';
    console.log(`🎮 加速模式: ${isGPU ? '✅ TensorFlow Native' : '❌ CPU 模式'}\n`);
    
    // 準備數據
    const dataset = await prepareDataset();
    
    if (dataset.train.images.shape[0] === 0) {
      console.error('\n❌ 錯誤：沒有訓練數據！');
      console.log('請先運行審核步驟 (npm run ai:review)\n');
      process.exit(1);
    }
    
    // 創建模型
    const model = await createModel();
    
    // 訓練
    await trainModel(model, dataset);
    
    // 評估
    await evaluateModel(model, dataset);
    
    // 清理
    dataset.train.images.dispose();
    dataset.train.labels.dispose();
    dataset.validation.images.dispose();
    dataset.validation.labels.dispose();
    
    // 更新進度
    progressMgr.updateStageProgress('training', { progress: 100, completed: true });
    console.log('🎉 所有訓練步驟完成！\n');
    
  } catch (error) {
    console.error('\n❌ 訓練失敗:', error);
    process.exit(1);
  }
}

main();
