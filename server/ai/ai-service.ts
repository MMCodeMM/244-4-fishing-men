// AI 預測服務 - 提供魚類識別 API

import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { PATHS } from '../../scripts/ai/config';

interface PredictionResult {
  fishName: string;
  confidence: number;
  englishName: string;
}

class FishClassifierService {
  private model: tf.LayersModel | null = null;
  private classes: any[] = [];
  private isReady = false;

  async initialize() {
    try {
      console.log('🤖 載入 AI 模型...');
      
      // 載入模型（使用 tfjs-node 的 file:// handler）
      const modelPath = path.join(process.cwd(), PATHS.fishClassifier, 'best');
      const modelJsonPath = path.join(modelPath, 'model.json');
      
      if (!fs.existsSync(modelJsonPath)) {
        console.warn('⚠️  模型文件不存在，AI 功能將不可用');
        return false;
      }
      
      // 使用 file:// URL 加載模型（tfjs-node 原生支援）
      const fileUrl = `file://${modelJsonPath.replace(/\\/g, '/')}`;
      this.model = await tf.loadLayersModel(fileUrl);
      
      // 載入類別映射
      const classesPath = path.join(process.cwd(), PATHS.fishClassifier, 'classes.json');
      this.classes = JSON.parse(fs.readFileSync(classesPath, 'utf-8'));
      
      this.isReady = true;
      console.log('✅ AI 模型已就緒');
      console.log(`📊 識別類別: ${this.classes.map(c => c.name).join(', ')}`);
      
      return true;
    } catch (error) {
      console.error('❌ 模型載入失敗:', error);
      return false;
    }
  }

  async predict(imagePath: string): Promise<PredictionResult[]> {
    if (!this.isReady || !this.model) {
      throw new Error('AI 模型尚未初始化');
    }

    try {
      // 讀取並預處理圖片 - 轉換為 RGB 數組
      const { data } = await sharp(imagePath)
        .resize(224, 224)
        .ensureAlpha(1.0)
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      // 轉換 RGBA 到 RGB
      const pixels = new Uint8Array(data);
      const rgbPixels = new Uint8Array(224 * 224 * 3);
      for (let i = 0; i < pixels.length; i += 4) {
        const baseIdx = (i / 4) * 3;
        rgbPixels[baseIdx] = pixels[i];
        rgbPixels[baseIdx + 1] = pixels[i + 1];
        rgbPixels[baseIdx + 2] = pixels[i + 2];
      }
      
      // 創建張量並歸一化
      const imageTensor = tf.tensor3d(rgbPixels, [224, 224, 3], 'int32');
      const normalized = imageTensor.div(255.0).expandDims(0) as tf.Tensor4D;
      
      // 預測
      const predictions = this.model.predict(normalized) as tf.Tensor2D;
      const probabilities = await predictions.data();
      
      // 清理
      imageTensor.dispose();
      normalized.dispose();
      predictions.dispose();
      
      // 轉換為結果
      const results: PredictionResult[] = this.classes.map((cls, idx) => ({
        fishName: cls.name,
        englishName: cls.englishName,
        confidence: probabilities[idx]
      }));
      
      // 按信心度排序
      results.sort((a, b) => b.confidence - a.confidence);
      
      return results;
    } catch (error) {
      console.error('❌ 預測失敗:', error);
      throw error;
    }
  }

  async predictFromBuffer(buffer: Buffer): Promise<PredictionResult[]> {
    if (!this.isReady || !this.model) {
      throw new Error('AI 模型尚未初始化');
    }

    try {
      // 預處理圖片 - 轉換為 RGB 數組
      const { data } = await sharp(buffer)
        .resize(224, 224)
        .ensureAlpha(1.0)
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      // 轉換 RGBA 到 RGB
      const pixels = new Uint8Array(data);
      const rgbPixels = new Uint8Array(224 * 224 * 3);
      for (let i = 0; i < pixels.length; i += 4) {
        const baseIdx = (i / 4) * 3;
        rgbPixels[baseIdx] = pixels[i];
        rgbPixels[baseIdx + 1] = pixels[i + 1];
        rgbPixels[baseIdx + 2] = pixels[i + 2];
      }
      
      // 創建張量並歸一化
      const imageTensor = tf.tensor3d(rgbPixels, [224, 224, 3], 'int32');
      const normalized = imageTensor.div(255.0).expandDims(0) as tf.Tensor4D;
      
      // 預測
      const predictions = this.model.predict(normalized) as tf.Tensor2D;
      const probabilities = await predictions.data();
      
      // 清理
      imageTensor.dispose();
      normalized.dispose();
      predictions.dispose();
      
      // 轉換為結果
      const results: PredictionResult[] = this.classes.map((cls, idx) => ({
        fishName: cls.name,
        englishName: cls.englishName,
        confidence: probabilities[idx]
      }));
      
      // 按信心度排序
      results.sort((a, b) => b.confidence - a.confidence);
      
      return results;
    } catch (error) {
      console.error('❌ 預測失敗:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      ready: this.isReady,
      classes: this.classes.length,
      backend: tf.getBackend()
    };
  }
}

// 單例實例
export const fishClassifier = new FishClassifierService();
