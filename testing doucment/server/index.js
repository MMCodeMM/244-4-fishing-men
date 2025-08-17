const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// 配置multer用於文件上傳
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  },
  fileFilter: function (req, file, cb) {
    // 只允許圖片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳圖片文件！'), false);
    }
  }
});

// 模擬魚類數據庫
const fishDatabase = [
  {
    id: 1,
    name: '石斑魚',
    scientificName: 'Epinephelus sp.',
    description: '石斑魚是香港常見的海洋魚類，屬於鮨科。',
    habitat: '珊瑚礁',
    conservation: '易危',
    location: '香港東部水域'
  },
  {
    id: 2,
    name: '鯛魚',
    scientificName: 'Sparus aurata',
    description: '鯛魚是一種優質的食用魚，在香港水域中較為常見。',
    habitat: '淺海',
    conservation: '無危',
    location: '香港西部水域'
  }
];

// 模擬用戶數據庫
const users = [
  {
    id: 1,
    email: 'test@example.com',
    name: '測試用戶',
    password: 'password123'
  }
];

// 模擬魚類記錄數據庫
const fishRecords = [];

// API路由

// 獲取所有魚類
app.get('/api/fish', (req, res) => {
  res.json(fishDatabase);
});

// 搜尋魚類
app.get('/api/fish/search', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.json(fishDatabase);
  }

  const results = fishDatabase.filter(fish => 
    fish.name.toLowerCase().includes(query.toLowerCase()) ||
    fish.scientificName.toLowerCase().includes(query.toLowerCase()) ||
    fish.description.toLowerCase().includes(query.toLowerCase())
  );

  res.json(results);
});

// 魚類識別API (模擬)
app.post('/api/fish/identify', upload.single('image'), (req, res) => {
  try {
    // 模擬AI識別過程
    setTimeout(() => {
      const mockResult = {
        species: '石斑魚 (Epinephelus sp.)',
        confidence: 85,
        description: '石斑魚是香港常見的海洋魚類，屬於鮨科。',
        characteristics: [
          '體型較大，通常30-100厘米',
          '身體呈橢圓形，側扁',
          '顏色多變，常見有棕色、綠色等'
        ],
        habitat: '香港東部水域',
        conservation: '易危'
      };

      res.json({
        success: true,
        result: mockResult
      });
    }, 2000); // 模擬2秒處理時間

  } catch (error) {
    res.status(500).json({
      success: false,
      error: '識別失敗'
    });
  }
});

// 保存魚類記錄
app.post('/api/records', (req, res) => {
  try {
    const record = {
      id: Date.now(),
      ...req.body,
      timestamp: new Date().toISOString()
    };

    fishRecords.push(record);

    res.json({
      success: true,
      record: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '保存失敗'
    });
  }
});

// 獲取用戶的魚類記錄
app.get('/api/records/:userId', (req, res) => {
  const { userId } = req.params;
  const userRecords = fishRecords.filter(record => record.userId === userId);
  
  res.json(userRecords);
});

// 用戶註冊
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 檢查用戶是否已存在
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '用戶已存在'
      });
    }

    const newUser = {
      id: Date.now(),
      email,
      password, // 實際應用中應該加密
      name,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    res.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '註冊失敗'
    });
  }
});

// 用戶登入
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '電子郵件或密碼錯誤'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '登入失敗'
    });
  }
});

// 獲取地圖數據
app.get('/api/map/discoveries', (req, res) => {
  const mockDiscoveries = [
    {
      id: 1,
      species: '石斑魚',
      location: [22.2050, 114.1290],
      locationName: '南丫島海灘',
      date: '2024-01-15',
      confidence: 85
    },
    {
      id: 2,
      species: '鯛魚',
      location: [22.2783, 114.1747],
      locationName: '中環碼頭',
      date: '2024-01-10',
      confidence: 92
    }
  ];

  res.json(mockDiscoveries);
});

// 錯誤處理中間件
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({
    success: false,
    error: '服務器內部錯誤'
  });
});

// 處理React路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`服務器運行在端口 ${PORT}`);
  console.log(`API地址: http://localhost:${PORT}/api`);
  console.log(`前端地址: http://localhost:${PORT}`);
});

module.exports = app;
