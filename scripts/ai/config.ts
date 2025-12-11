// AI 項目配置文件

export const PRIORITY_FISH = [
  { 
    id: 1, 
    name: '紅衫', 
    nameEn: 'Red Snapper', 
    englishName: 'Red Snapper',
    scientificName: 'Nemipterus virgatus',
    priority: 1 
  },
  { 
    id: 2, 
    name: '鯉魚', 
    nameEn: 'Common Carp', 
    englishName: 'Common Carp',
    scientificName: 'Cyprinus carpio',
    priority: 2 
  },
  { 
    id: 3, 
    name: '鯧魚', 
    nameEn: 'Pomfret', 
    englishName: 'Pomfret',
    scientificName: 'Pampus argenteus',
    priority: 3 
  },
  { 
    id: 4, 
    name: '九肚魚', 
    nameEn: 'Bombay Duck', 
    englishName: 'Bombay Duck',
    scientificName: 'Harpadon nehereus',
    priority: 4 
  },
  { 
    id: 5, 
    name: '木棉魚', 
    nameEn: 'Bigeye', 
    englishName: 'Bigeye',
    scientificName: 'Priacanthus tayenus',
    priority: 5 
  },
  { 
    id: 6, 
    name: '馬頭', 
    nameEn: 'Horsehead', 
    englishName: 'Horsehead',
    scientificName: 'Branchiostegus japonicus',
    priority: 6 
  }
];

export const FUTURE_FISH = [
  '烏頭', '白飯魚', '白鱲', '芝麻班', '黃鱲鯧', '鯇魚'
];

export const CRAWL_CONFIG = {
  targetImagesPerFish: 500,  // 增加目標圖片數量
  minImageSize: 224,
  maxImageSize: 2048,
  allowedFormats: ['jpg', 'jpeg', 'png'],
  maxFileSizeMB: 10,
  downloadTimeout: 30000,
  requestDelay: [500, 1500], // 隨機延遲 (ms)
};

export const TRAINING_CONFIG = {
  inputShape: [224, 224, 3],
  batchSize: 16,              // 小批次，更頻繁更新
  epochs: 100,                // 增加最大訓練輪數
  learningRate: 0.0001,       // 降低學習率，更穩定學習
  validationSplit: 0.15,
  testSplit: 0.15,
  earlyStopping: true,
  patience: 15,               // 增加耐心值，給模型更多改善機會
  earlyStoppingPatience: 15
};

export const PATHS = {
  raw: 'training-data/raw',
  reviewed: 'training-data/reviewed',
  approved: 'training-data/reviewed/approved',
  rejected: 'training-data/reviewed/rejected',
  models: 'models',
  fishClassifier: 'models/fish-classifier',
  progress: 'PData/ai_progress.json',
  predictions: 'PData/ai_predictions_cache.json',
  database: 'PData/ai.db'
};

/**
 * 獲取魚類搜尋關鍵詞，只使用英文和學名以提高精確度
 */
export function getSearchKeywords(fishName: string): string[] {
  const fish = PRIORITY_FISH.find(f => 
    f.name === fishName || 
    f.englishName === fishName || 
    f.scientificName === fishName
  );
  if (!fish) return [fishName];
  
  return [
    fish.scientificName,  // 學名效果最好
    `${fish.scientificName} fish`,
    fish.englishName,
    `${fish.englishName} fish`,
    `${fish.scientificName} marine fish`,
    `${fish.scientificName} specimen`,
    `${fish.scientificName} identification`,
    fish.scientificName.split(' ')[0],  // 屬名
    `${fish.englishName} marine`,
    `${fish.scientificName} taxonomy`,
    `${fish.englishName} species`,
    `${fish.scientificName} biology`
  ];
}
