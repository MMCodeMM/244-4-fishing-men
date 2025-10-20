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

app.get('/', (req, res) => {
  res.write('Welcome')
  res.end()
})

let port = 3000

app.listen(port, () => {
  console.log('Server starting...');
  print(port)
})

