// 圖片驗證和下載工具

import axios from 'axios';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { CRAWL_CONFIG } from '../config';

export class ImageValidator {
  // 下載並驗證圖片
  async downloadAndValidate(url: string, savePath: string): Promise<boolean> {
    try {
      // 下載圖片
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: CRAWL_CONFIG.downloadTimeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const buffer = Buffer.from(response.data);

      // 驗證圖片
      const isValid = await this.validateImage(buffer);
      if (!isValid) {
        return false;
      }

      // 確保目錄存在
      const dir = path.dirname(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 保存圖片
      await sharp(buffer)
        .resize(224, 224, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toFile(savePath);

      return true;

    } catch (error) {
      // 靜默處理錯誤
      return false;
    }
  }

  // 驗證圖片質量
  private async validateImage(buffer: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(buffer).metadata();

      // 檢查格式
      if (!metadata.format || !['jpeg', 'jpg', 'png'].includes(metadata.format)) {
        return false;
      }

      // 檢查尺寸
      if (!metadata.width || !metadata.height) {
        return false;
      }

      if (
        metadata.width < CRAWL_CONFIG.minImageSize ||
        metadata.height < CRAWL_CONFIG.minImageSize
      ) {
        return false;
      }

      // 檢查文件大小
      if (buffer.length > CRAWL_CONFIG.maxFileSizeMB * 1024 * 1024) {
        return false;
      }

      // 檢查圖片不是損壞的
      if (buffer.length < 5000) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // 檢查圖片是否已存在
  imageExists(filepath: string): boolean {
    return fs.existsSync(filepath);
  }

  // 計算目錄中的圖片數量
  countImages(dirPath: string): number {
    try {
      if (!fs.existsSync(dirPath)) {
        return 0;
      }

      const files = fs.readdirSync(dirPath);
      return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png'].includes(ext);
      }).length;
    } catch (error) {
      return 0;
    }
  }

  // 隨機延遲（模擬人類行為）
  async randomDelay() {
    const [min, max] = CRAWL_CONFIG.requestDelay;
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
