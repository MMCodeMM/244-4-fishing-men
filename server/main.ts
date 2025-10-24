import express from 'express'
import { print } from 'listening-on'
import { users as dataUsers, fishs } from './data'
import { User } from './user'
import fs from 'fs'
import path from 'path'
import { router as userRouter } from './user'
import { mkdirSync} from 'fs'

mkdirSync('PData', { recursive: true });

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
  const { username, x, y, fish, place, time } = req.body;
  
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

app.get('/', (req, res) => {
  res.write('Welcome')
  res.end()
})

let port = 3000

app.listen(port, () => {
  console.log('Server starting...');
  print(port)
})

