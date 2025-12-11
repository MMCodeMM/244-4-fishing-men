// 模型載入工具

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import * as fs from 'fs';
import * as path from 'path';
import { PATHS, PRIORITY_FISH } from '../config';

/**
 * 載入已保存的魚類識別模型
 */
export async function loadFishModel(modelType: 'best' | 'final' = 'final'): Promise<tf.LayersModel | null> {
  try {
    const modelPath = path.join(PATHS.fishClassifier, modelType);
    const modelConfigPath = path.join(modelPath, 'model.json');
    const weightsPath = path.join(modelPath, 'weights.json');
    
    if (!fs.existsSync(modelConfigPath) || !fs.existsSync(weightsPath)) {
      console.warn(`⚠️  模型文件不存在: ${modelPath}`);
      return null;
    }
    
    // 載入模型架構
    const modelConfig = JSON.parse(fs.readFileSync(modelConfigPath, 'utf8'));
    const model = await tf.models.modelFromJSON(modelConfig);
    
    // 載入權重
    const weightsData = JSON.parse(fs.readFileSync(weightsPath, 'utf8'));
    const weights = weightsData.weights.map((w: number[]) => tf.tensor(w));
    
    model.setWeights(weights);
    
    console.log(`✅ 成功載入模型: ${modelPath}`);
    return model;
    
  } catch (error) {
    console.error(`❌ 載入模型失敗:`, error);
    return null;
  }
}

/**
 * 預測魚類種類
 */
export async function predictFish(model: tf.LayersModel, imageBuffer: Buffer): Promise<{ fishName: string; confidence: number } | null> {
  try {
    const sharp = require('sharp');
    
    // 處理圖片
    const { data } = await sharp(imageBuffer)
      .resize(224, 224)
      .ensureAlpha(1.0)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // 轉換為RGB
    const pixels = new Uint8Array(data);
    const rgbPixels = new Uint8Array(pixels.length * 3 / 4);
    for (let i = 0; i < pixels.length; i += 4) {
      const baseIdx = (i / 4) * 3;
      rgbPixels[baseIdx] = pixels[i];
      rgbPixels[baseIdx + 1] = pixels[i + 1];
      rgbPixels[baseIdx + 2] = pixels[i + 2];
    }
    
    // 創建張量
    const imageTensor = tf.tensor3d(rgbPixels, [224, 224, 3], 'int32');
    const normalized = imageTensor.div(255.0).expandDims(0);
    
    // 預測
    const prediction = model.predict(normalized) as tf.Tensor;
    const probabilities = await prediction.data();
    
    // 找出最高機率的類別
    let maxProb = 0;
    let maxIndex = 0;
    for (let i = 0; i < probabilities.length; i++) {
      if (probabilities[i] > maxProb) {
        maxProb = probabilities[i];
        maxIndex = i;
      }
    }
    
    // 清理張量
    imageTensor.dispose();
    normalized.dispose();
    prediction.dispose();
    
    return {
      fishName: PRIORITY_FISH[maxIndex].name,
      confidence: maxProb
    };
    
  } catch (error) {
    console.error('預測失敗:', error);
    return null;
  }
}

/**
 * 取得類別映射
 */
export function getClassMapping() {
  return PRIORITY_FISH.map((fish: any, index: number) => ({
    index,
    name: fish.name,
    englishName: fish.englishName,
    scientificName: fish.scientificName
  }));
}