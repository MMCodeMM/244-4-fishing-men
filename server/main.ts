import express from 'express'
import { print } from 'listening-on'
import { users as dataUsers, fishs } from './data'
import { User } from './user'
import fs from 'fs'
import path from 'path'
import { router as userRouter } from './user'
import { mkdirSync} from 'fs'
import formidable, { IncomingForm } from 'formidable'
import { fishClassifier } from './ai/ai-service'

mkdirSync('PData', { recursive: true });
mkdirSync('uploads', { recursive: true });
mkdirSync('uploads/user-photos', { recursive: true });
mkdirSync('uploads/search-images', { recursive: true });

let app = express()

// 伺服器啟動時載入 fish.json
try {
  const fishJsonPath = path.join(__dirname, 'fish.json');
  console.log('Loading fish.json from:', fishJsonPath);
  const fishData = fs.readFileSync(fishJsonPath, 'utf-8');
  const parsedFish = JSON.parse(fishData);
  console.log('Loaded', parsedFish.length, 'fish entries');
  console.log('First fish description preview:', parsedFish[0]?.description?.substring(0, 100));
  fishs.push(...parsedFish);
} catch (e) {
  console.error('載入 fish.json 失敗:', e);
}

app.use('/dist/client', express.static('dist/client'))
app.use(express.static('public'))
// 設置靜態文件服務
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 圖片搜尋 API - 使用 Formidable
app.post('/api/search-image', (req, res) => {
  const form = formidable({
    uploadDir: path.join('uploads', 'search-images'),
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB 限制
    filter: ({ mimetype }) => {
      return mimetype ? mimetype.startsWith('image/') : false;
    }
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('搜尋圖片解析失敗:', err);
      return res.status(400).json({
        success: false,
        message: '圖片上傳失敗'
      });
    }

    // 處理單個文件上傳
    const file = Array.isArray(files.image) ? files.image[0] : files.image;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: '沒有接收到圖片文件'
      });
    }

    // 檢查文件類型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      // 刪除無效文件
      fs.unlink(file.filepath, (unlinkErr) => {
        if (unlinkErr) console.error('刪除無效文件失敗:', unlinkErr);
      });
      
      return res.status(400).json({
        success: false,
        message: '只支援 JPG、PNG、GIF 格式的圖片'
      });
    }

    async function processImage() {
      try {
        if (!file) {
          throw new Error('文件不存在');
        }
        
        // 生成唯一文件名
        const timestamp = Date.now();
        const originalName = file.originalFilename || 'search_image';
        const extension = path.extname(originalName);
        const newFilename = `search_${timestamp}${extension}`;
        const newFilepath = path.join(path.dirname(file.filepath), newFilename);

        // 重命名文件
        fs.renameSync(file.filepath, newFilepath);

        // 使用 AI 識別魚種
        try {
          console.log('🔍 開始 AI 識別...');
          const predictions = await fishClassifier.predict(newFilepath);
          
          // 取前 3 個最可能的結果
          const topPredictions = predictions.slice(0, 3);
          
          console.log('✅ AI 識別完成:', topPredictions.map(p => 
            `${p.fishName} (${(p.confidence * 100).toFixed(1)}%)`
          ).join(', '));

          // 根據識別結果篩選魚種
          const matchedFish = fishs.filter(fish => 
            topPredictions.some(p => 
              fish.name.includes(p.fishName) || 
              fish.name.includes(p.englishName)
            )
          );

          res.json({
            success: true,
            filename: newFilename,
            message: `AI 識別完成！最可能是：${topPredictions[0].fishName}`,
            aiPredictions: topPredictions.map(p => ({
              name: p.fishName,
              nameEn: p.englishName,
              confidence: Math.round(p.confidence * 100)
            })),
            searchResults: matchedFish.length > 0 ? matchedFish : fishs,
            aiEnabled: true
          });

        } catch (aiError) {
          console.warn('⚠️  AI 識別失敗，返回所有魚種:', aiError);
          // AI 失敗時返回所有魚種
          res.json({
            success: true,
            filename: newFilename,
            message: '圖片已接收（AI 暫不可用）',
            searchResults: fishs,
            aiEnabled: false
          });
        }

      } catch (error) {
        console.error('處理搜尋圖片失敗:', error);
        res.status(500).json({
          success: false,
          message: '處理圖片時發生錯誤'
        });
      }
    }
    
    processImage();
  });
});
app.use(express.json())
app.use(userRouter)

app.get('/api/fish', (req, res) => {
  res.json(fishs);
});

app.get('/api/users', (req, res) => {
  res.json(dataUsers);
});

// 登入 API
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: '請輸入用戶名和密碼'
    });
  }
  
  try {
    // 讀取用戶資料檔案
    const usersFilePath = path.join('PData', 'users.json');
    
    if (!fs.existsSync(usersFilePath)) {
      return res.status(401).json({
        success: false,
        error: '尚無註冊用戶'
      });
    }
    
    const usersData = fs.readFileSync(usersFilePath, 'utf-8');
    const registeredUsers = JSON.parse(usersData);
    
    // 查找匹配的用戶
    const user = registeredUsers.find((u: User) => 
      u.username === username && u.password === password
    );
    
    if (user) {
      // 登入成功，回傳用戶資訊（不包含密碼）
      console.log('用戶登入成功:', username);
      res.json({
        success: true,
        user: {
          username: user.username,
          email: user.email
        }
      });
    } else {
      // 登入失敗
      res.status(401).json({
        success: false,
        error: '帳號或密碼錯誤'
      });
    }
    
  } catch (error) {
    console.error('登入時發生錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤，請稍後再試'
    });
  }
});

// 地圖標記 API - 儲存標記
app.post('/api/map-flags', (req, res) => {
  const { username, x, y, fish, place, time, photoId } = req.body;
  
  if (!username || !fish || !place || !time) {
    return res.status(400).json({
      success: false,
      message: '缺少必要欄位'
    });
  }
  
  try {
    const flagsFile = path.join('PData', 'map_flags.json');
    let flagsData: any = {};
    
    // 讀取現有資料
    if (fs.existsSync(flagsFile)) {
      const data = fs.readFileSync(flagsFile, 'utf-8');
      flagsData = JSON.parse(data);
    }
    
    // 初始化使用者資料
    if (!flagsData[username]) {
      flagsData[username] = [];
    }
    
    // 新增標記
    const newFlag = {
      id: Date.now(),
      x: parseFloat(x),
      y: parseFloat(y),
      fish,
      place,
      time,
      photoId: photoId || null, // 添加照片ID關聯
      createdAt: new Date().toISOString()
    };
    
    flagsData[username].push(newFlag);
    
    // 儲存到檔案
    fs.writeFileSync(flagsFile, JSON.stringify(flagsData, null, 2));
    
    res.json({
      success: true,
      message: '標記儲存成功',
      flagId: newFlag.id
    });
    
  } catch (error) {
    console.error('儲存地圖標記失敗:', error);
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    });
  }
});

// 地圖標記 API - 載入使用者的標記
app.get('/api/map-flags/:username', (req, res) => {
  const { username } = req.params;
  
  try {
    const flagsFile = path.join('PData', 'map_flags.json');
    
    if (!fs.existsSync(flagsFile)) {
      return res.json({
        success: true,
        flags: []
      });
    }
    
    const data = fs.readFileSync(flagsFile, 'utf-8');
    const flagsData: any = JSON.parse(data);
    const userFlags = flagsData[username] || [];
    
    res.json({
      success: true,
      flags: userFlags
    });
    
  } catch (error) {
    console.error('載入地圖標記失敗:', error);
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    });
  }
});

// 地圖標記 API - 刪除標記
app.delete('/api/map-flags/:username/:flagId', (req, res) => {
  const { username, flagId } = req.params;
  
  try {
    const flagsFile = path.join('PData', 'map_flags.json');
    
    if (!fs.existsSync(flagsFile)) {
      return res.status(404).json({
        success: false,
        message: '找不到資料'
      });
    }
    
    const data = fs.readFileSync(flagsFile, 'utf-8');
    const flagsData: any = JSON.parse(data);
    
    if (!flagsData[username]) {
      return res.status(404).json({
        success: false,
        message: '找不到使用者資料'
      });
    }
    
    // 刪除指定的標記
    flagsData[username] = flagsData[username].filter((flag: any) => flag.id !== parseInt(flagId));
    
    // 儲存更新後的資料
    fs.writeFileSync(flagsFile, JSON.stringify(flagsData, null, 2));
    
    res.json({
      success: true,
      message: '標記刪除成功'
    });
    
  } catch (error) {
    console.error('刪除地圖標記失敗:', error);
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    });
  }
});

// 檢查照片是否已有對應的地圖標記
app.get('/api/photo-flag-status/:username/:photoId', (req, res) => {
  const { username, photoId } = req.params;
  
  console.log(`檢查照片標記狀態: username=${username}, photoId=${photoId}`);
  
  try {
    const flagsFile = path.join('PData', 'map_flags.json');
    
    if (!fs.existsSync(flagsFile)) {
      console.log('map_flags.json 不存在，返回 hasFlag=false');
      return res.json({
        success: true,
        hasFlag: false
      });
    }
    
    const data = fs.readFileSync(flagsFile, 'utf-8');
    const flagsData: any = JSON.parse(data);
    
    const userFlags = flagsData[username] || [];
    const hasFlag = userFlags.some((flag: any) => flag.photoId === parseInt(photoId));
    
    console.log(`用戶 ${username} 的標記數量: ${userFlags.length}`);
    console.log(`照片 ${photoId} 是否有標記: ${hasFlag}`);
    
    res.json({
      success: true,
      hasFlag: hasFlag
    });
    
  } catch (error) {
    console.error('檢查照片標記狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    });
  }
});

// 用戶相冊 API - 儲存圖片 (使用 Formidable)
app.post('/api/user-photos', (req, res) => {
  const form = formidable({
    uploadDir: path.join('uploads', 'user-photos'),
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB 限制
    filter: ({ mimetype }) => {
      // 只允許圖片類型
      return mimetype ? mimetype.startsWith('image/') : false;
    }
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('檔案上傳錯誤:', err);
      return res.status(400).json({
        success: false,
        message: '檔案上傳失敗: ' + err.message
      });
    }

    const username = Array.isArray(fields.username) ? fields.username[0] : fields.username;
    const location = Array.isArray(fields.location) ? fields.location[0] : fields.location;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!username || !imageFile) {
      return res.status(400).json({
        success: false,
        message: '缺少必要欄位'
      });
    }

    try {
      const photosFile = path.join('PData', 'user_photos.json');
      let photosData: any = {};
      
      // 確保目錄存在
      const dir = path.dirname(photosFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // 讀取現有資料
      if (fs.existsSync(photosFile)) {
        const data = fs.readFileSync(photosFile, 'utf-8');
        photosData = JSON.parse(data);
      }
      
      // 初始化用戶資料
      if (!photosData[username]) {
        photosData[username] = [];
      }

      // 生成新的檔案名
      const fileExtension = path.extname(imageFile.originalFilename || '');
      const newFileName = `${username}_${Date.now()}${fileExtension}`;
      const newFilePath = path.join('uploads', 'user-photos', newFileName);
      
      // 移動檔案到新位置
      fs.renameSync(imageFile.filepath, newFilePath);
      
      // 創建新的圖片記錄 (儲存檔案路徑而不是 Base64)
      const newPhoto = {
        id: Date.now(),
        imagePath: `/uploads/user-photos/${newFileName}`, // 改為檔案路徑
        originalName: imageFile.originalFilename,
        location: location || '',
        description: description || '',
        uploadDate: new Date().toISOString()
      };
      
      // 添加到用戶資料中
      photosData[username].push(newPhoto);
      
      // 儲存到文件
      fs.writeFileSync(photosFile, JSON.stringify(photosData, null, 2));
      
      res.json({
        success: true,
        message: '圖片儲存成功',
        photoId: newPhoto.id,
        filename: newFileName
      });
      
    } catch (error) {
      console.error('儲存圖片失敗:', error);
      res.status(500).json({
        success: false,
        message: '伺服器錯誤'
      });
    }
  });
});

// 用戶相冊 API - 獲取圖片
app.get('/api/user-photos/:username', (req, res) => {
  const { username } = req.params;
  
  try {
    const photosFile = path.join('PData', 'user_photos.json');
    
    if (!fs.existsSync(photosFile)) {
      return res.json({
        success: true,
        photos: []
      });
    }
    
    const data = fs.readFileSync(photosFile, 'utf-8');
    const photosData = JSON.parse(data);
    
    const userPhotos = photosData[username] || [];
    
    // 兼容舊格式：將 imageData 轉換為 imagePath
    const compatiblePhotos = userPhotos.map((photo: any) => {
      if (photo.imageData && !photo.imagePath) {
        // 舊格式 Base64 資料，保持原樣以維持兼容性
        return {
          ...photo,
          imagePath: photo.imageData // 前端會判斷是 Base64 還是路徑
        };
      }
      return photo;
    });
    
    res.json({
      success: true,
      photos: compatiblePhotos
    });
    
  } catch (error) {
    console.error('讀取圖片失敗:', error);
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    });
  }
});

// 用戶相冊 API - 刪除圖片
app.delete('/api/user-photos/:username/:photoId', (req, res) => {
  const { username, photoId } = req.params;
  
  try {
    const photosFile = path.join('PData', 'user_photos.json');
    
    if (!fs.existsSync(photosFile)) {
      return res.status(404).json({
        success: false,
        message: '找不到相冊資料'
      });
    }
    
    const data = fs.readFileSync(photosFile, 'utf-8');
    const photosData = JSON.parse(data);
    
    if (!photosData[username]) {
      return res.status(404).json({
        success: false,
        message: '找不到使用者資料'
      });
    }
    
    // 找到要刪除的照片
    const photoToDelete = photosData[username].find((photo: any) => photo.id === parseInt(photoId));
    
    if (photoToDelete) {
      // 如果是新格式（Formidable）的照片，刪除物理文件
      if (photoToDelete.imagePath && !photoToDelete.imagePath.startsWith('data:')) {
        // 構建完整的文件路徑
        const fileName = path.basename(photoToDelete.imagePath);
        const filePath = path.join('uploads', 'user-photos', fileName);
        
        // 嘗試刪除物理文件
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`已刪除物理文件: ${filePath}`);
          } catch (fileError) {
            console.error(`刪除物理文件失敗: ${filePath}`, fileError);
          }
        }
      }
    }
    
    // 從數據中刪除圖片記錄
    photosData[username] = photosData[username].filter((photo: any) => photo.id !== parseInt(photoId));
    
    // 儲存更新後的資料
    fs.writeFileSync(photosFile, JSON.stringify(photosData, null, 2));
    
    // 同時刪除相關的地圖標記
    try {
      const mapFlagsFile = path.join('PData', 'map_flags.json');
      if (fs.existsSync(mapFlagsFile)) {
        const flagsData = fs.readFileSync(mapFlagsFile, 'utf-8');
        const flagsJson = JSON.parse(flagsData);
        
        if (flagsJson[username]) {
          // 找到並刪除與該 photoId 相關的標記
          const originalCount = flagsJson[username].length;
          flagsJson[username] = flagsJson[username].filter((flag: any) => flag.photoId !== parseInt(photoId));
          const deletedCount = originalCount - flagsJson[username].length;
          
          // 保存更新後的地圖標記資料
          fs.writeFileSync(mapFlagsFile, JSON.stringify(flagsJson, null, 2));
          
          console.log(`刪除照片 ${photoId} 時，同時刪除了 ${deletedCount} 個相關的地圖標記`);
        }
      }
    } catch (flagError) {
      console.error('刪除相關地圖標記時出錯:', flagError);
      // 不影響照片刪除的成功，只記錄錯誤
    }
    
    res.json({
      success: true,
      message: '圖片及相關標記刪除成功'
    });
    
  } catch (error) {
    console.error('刪除圖片失敗:', error);
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    });
  }
});

app.get('/', (req, res) => {
  res.write('Welcome')
  res.end()
})

let port = 3000

// 初始化 AI 模型並啟動服務器
async function startServer() {
  console.log('🚀 正在啟動服務器...');
  
  // 初始化 AI 模型
  await fishClassifier.initialize();
  
  app.listen(port, () => {
    console.log('✅ 服務器已啟動');
    print(port);
    
    // 顯示 AI 狀態
    const aiStatus = fishClassifier.getStatus();
    if (aiStatus.ready) {
      console.log('🤖 AI 魚類識別: 已啟用');
      console.log(`📊 識別類別: ${aiStatus.classes} 種魚`);
    } else {
      console.log('⚠️  AI 魚類識別: 未啟用');
    }
  });
}

startServer().catch(err => {
  console.error('❌ 服務器啟動失敗:', err);
  process.exit(1);
});

