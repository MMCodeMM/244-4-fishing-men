// 人工審核服務器 - 獨立運行在 port 4000

import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { PRIORITY_FISH, PATHS } from '../../scripts/ai/config';

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 獲取待審核圖片列表
app.get('/api/review/images', (req, res) => {
  const session = parseInt(req.query.session as string) || 1;
  
  // 根據 session 決定審核哪些魚種 (每種魚獨立一個session)
  let fishToReview: string[] = [];
  if (session === 1) {
    fishToReview = ['紅衫'];
  } else if (session === 2) {
    fishToReview = ['鯉魚'];
  } else if (session === 3) {
    fishToReview = ['鯧魚'];
  } else if (session === 4) {
    fishToReview = ['九肚魚'];
  } else if (session === 5) {
    fishToReview = ['木棉魚'];
  } else if (session === 6) {
    fishToReview = ['馬頭'];
  }

  const images: any[] = [];
  
  for (const fishName of fishToReview) {
    const rawDir = path.join(PATHS.raw, fishName);
    const approvedDir = path.join(PATHS.approved, fishName);
    
    if (!fs.existsSync(rawDir)) continue;
    
    const files = fs.readdirSync(rawDir).filter(f => 
      ['.jpg', '.jpeg', '.png'].includes(path.extname(f).toLowerCase())
    );
    
    for (const file of files) {
      const rawPath = path.join(rawDir, file);
      const approvedPath = path.join(approvedDir, file);
      
      // 檢查是否已審核
      const isApproved = fs.existsSync(approvedPath);
      const isRejected = fs.existsSync(path.join(PATHS.rejected, file));
      
      images.push({
        id: `${fishName}_${file}`,
        fishName,
        filename: file,
        path: `/training-data/raw/${fishName}/${file}`,
        status: isApproved ? 'approved' : isRejected ? 'rejected' : 'pending'
      });
    }
  }
  
  res.json({
    success: true,
    session,
    fishNames: fishToReview,
    images,
    total: images.length
  });
});

// 批准圖片
app.post('/api/review/approve', (req, res) => {
  const { fishName, filename } = req.body;
  
  try {
    const sourcePath = path.join(PATHS.raw, fishName, filename);
    const destPath = path.join(PATHS.approved, fishName, filename);
    
    // 確保目標目錄存在
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    
    // 複製文件
    fs.copyFileSync(sourcePath, destPath);
    
    res.json({ success: true, message: '已批准' });
  } catch (error) {
    res.status(500).json({ success: false, message: '批准失敗', error });
  }
});

// 拒絕圖片
app.post('/api/review/reject', (req, res) => {
  const { fishName, filename } = req.body;
  
  try {
    const sourcePath = path.join(PATHS.raw, fishName, filename);
    const destPath = path.join(PATHS.rejected, filename);
    
    // 確保目標目錄存在
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    
    // 移動文件
    fs.renameSync(sourcePath, destPath);
    
    res.json({ success: true, message: '已拒絕' });
  } catch (error) {
    res.status(500).json({ success: false, message: '拒絕失敗', error });
  }
});

// 獲取統計信息
app.get('/api/review/stats', (req, res) => {
  const stats: any = {
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    byFish: {}
  };
  
  for (const fish of PRIORITY_FISH) {
    const rawDir = path.join(PATHS.raw, fish.name);
    const approvedDir = path.join(PATHS.approved, fish.name);
    
    let rawCount = 0;
    let approvedCount = 0;
    
    if (fs.existsSync(rawDir)) {
      rawCount = fs.readdirSync(rawDir).filter(f => 
        ['.jpg', '.jpeg', '.png'].includes(path.extname(f).toLowerCase())
      ).length;
    }
    
    if (fs.existsSync(approvedDir)) {
      approvedCount = fs.readdirSync(approvedDir).filter(f => 
        ['.jpg', '.jpeg', '.png'].includes(path.extname(f).toLowerCase())
      ).length;
    }
    
    stats.byFish[fish.name] = {
      raw: rawCount,
      approved: approvedCount,
      pending: rawCount - approvedCount
    };
    
    stats.total += rawCount;
    stats.approved += approvedCount;
    stats.pending += (rawCount - approvedCount);
  }
  
  const rejectedDir = PATHS.rejected;
  if (fs.existsSync(rejectedDir)) {
    stats.rejected = fs.readdirSync(rejectedDir).filter(f => 
      ['.jpg', '.jpeg', '.png'].includes(path.extname(f).toLowerCase())
    ).length;
  }
  
  res.json(stats);
});

// 靜態文件服務 - 訓練數據
app.use('/training-data', express.static(path.join(process.cwd(), 'training-data')));

// 審核界面 HTML
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🐟 魚類圖片審核系統</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    .session-select {
      padding: 20px;
      background: #f8f9fa;
      border-bottom: 2px solid #e9ecef;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .session-select button {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      background: #667eea;
      color: white;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
    }
    .session-select button:hover { background: #5568d3; }
    .session-select button.active { background: #764ba2; }
    .stats {
      padding: 20px;
      background: #fff3cd;
      border-bottom: 2px solid #ffc107;
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 10px;
    }
    .stat-item {
      text-align: center;
      padding: 10px 20px;
    }
    .stat-item .number {
      font-size: 28px;
      font-weight: bold;
      color: #667eea;
    }
    .stat-item .label {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
    .gallery {
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      max-height: 70vh;
      overflow-y: auto;
    }
    .image-card {
      border: 3px solid #e9ecef;
      border-radius: 12px;
      overflow: hidden;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: all 0.3s;
      position: relative;
    }
    .image-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }
    .image-card.approved { border-color: #28a745; background: #d4edda; }
    .image-card.rejected { border-color: #dc3545; background: #f8d7da; }
    .image-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      display: block;
    }
    .image-info {
      padding: 15px;
    }
    .fish-name {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 8px;
      color: #333;
    }
    .actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    .actions button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.3s;
    }
    .btn-approve {
      background: #28a745;
      color: white;
    }
    .btn-approve:hover { background: #218838; }
    .btn-reject {
      background: #dc3545;
      color: white;
    }
    .btn-reject:hover { background: #c82333; }
    .status-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: bold;
      color: white;
    }
    .status-approved { background: #28a745; }
    .status-rejected { background: #dc3545; }
    .loading {
      text-align: center;
      padding: 50px;
      font-size: 18px;
      color: #667eea;
    }
    .shortcuts {
      padding: 15px 20px;
      background: #e7f3ff;
      border-top: 2px solid #0066cc;
      font-size: 12px;
      color: #333;
    }
    .shortcuts strong { color: #0066cc; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐟 魚類圖片審核系統</h1>
      <p>使用快捷鍵快速審核：→ 批准 | ← 拒絕</p>
    </div>
    
    <div class="session-select">
      <span style="font-weight: bold;">選擇審核 Session:</span>
      <button onclick="loadSession(1)" id="btn-session-1">Session 1 (紅衫)</button>
      <button onclick="loadSession(2)" id="btn-session-2">Session 2 (鯉魚)</button>
      <button onclick="loadSession(3)" id="btn-session-3">Session 3 (鯧魚)</button>
      <button onclick="loadSession(4)" id="btn-session-4">Session 4 (九肚魚)</button>
      <button onclick="loadSession(5)" id="btn-session-5">Session 5 (木棉魚)</button>
      <button onclick="loadSession(6)" id="btn-session-6">Session 6 (馬頭)</button>
    </div>
    
    <div class="stats" id="stats">
      <div class="stat-item">
        <div class="number" id="stat-total">0</div>
        <div class="label">總圖片</div>
      </div>
      <div class="stat-item">
        <div class="number" id="stat-approved">0</div>
        <div class="label">已批准</div>
      </div>
      <div class="stat-item">
        <div class="number" id="stat-rejected">0</div>
        <div class="label">已拒絕</div>
      </div>
      <div class="stat-item">
        <div class="number" id="stat-pending">0</div>
        <div class="label">待審核</div>
      </div>
    </div>
    
    <div class="gallery" id="gallery">
      <div class="loading">載入中...</div>
    </div>
    
    <div class="shortcuts">
      <strong>快捷鍵:</strong> 
      → 或 Space (批准下一張) | 
      ← 或 Backspace (拒絕) | 
      數字 1-6 (切換 Session)
    </div>
  </div>

  <script>
    let currentSession = 1;
    let images = [];
    let currentIndex = 0;

    async function loadSession(session) {
      currentSession = session;
      currentIndex = 0;
      
      // 更新按鈕狀態
      document.querySelectorAll('.session-select button').forEach(btn => {
        btn.classList.remove('active');
      });
      document.getElementById(\`btn-session-\${session}\`).classList.add('active');
      
      // 載入圖片
      const res = await fetch(\`/api/review/images?session=\${session}\`);
      const data = await res.json();
      images = data.images;
      
      renderGallery();
      loadStats();
    }

    function renderGallery() {
      const gallery = document.getElementById('gallery');
      
      if (images.length === 0) {
        gallery.innerHTML = '<div class="loading">此 Session 沒有待審核圖片</div>';
        return;
      }
      
      gallery.innerHTML = images.map((img, index) => \`
        <div class="image-card \${img.status}" id="card-\${index}">
          \${img.status !== 'pending' ? \`<div class="status-badge status-\${img.status}">\${img.status === 'approved' ? '✓ 已批准' : '✗ 已拒絕'}</div>\` : ''}
          <img src="\${img.path}" alt="\${img.fishName}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22250%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22250%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3E載入失敗%3C/text%3E%3C/svg%3E'">
          <div class="image-info">
            <div class="fish-name">🐟 \${img.fishName}</div>
            <div style="font-size: 11px; color: #999;">\${img.filename}</div>
            <div class="actions">
              <button class="btn-approve" onclick="approve(\${index})" \${img.status !== 'pending' ? 'disabled' : ''}>✓ 批准</button>
              <button class="btn-reject" onclick="reject(\${index})" \${img.status !== 'pending' ? 'disabled' : ''}>✗ 拒絕</button>
            </div>
          </div>
        </div>
      \`).join('');
    }

    async function approve(index) {
      const img = images[index];
      const res = await fetch('/api/review/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fishName: img.fishName, filename: img.filename })
      });
      
      if (res.ok) {
        images[index].status = 'approved';
        renderGallery();
        loadStats();
        
        // 自動移到下一張待審核的圖片
        moveToNext();
      }
    }

    async function reject(index) {
      const img = images[index];
      const res = await fetch('/api/review/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fishName: img.fishName, filename: img.filename })
      });
      
      if (res.ok) {
        images[index].status = 'rejected';
        renderGallery();
        loadStats();
        
        // 自動移到下一張待審核的圖片
        moveToNext();
      }
    }

    function moveToNext() {
      // 找到下一張待審核的圖片
      for (let i = currentIndex + 1; i < images.length; i++) {
        if (images[i].status === 'pending') {
          currentIndex = i;
          scrollToCard(i);
          return;
        }
      }
      
      // 如果後面沒有了，從頭開始找
      for (let i = 0; i < currentIndex; i++) {
        if (images[i].status === 'pending') {
          currentIndex = i;
          scrollToCard(i);
          return;
        }
      }
    }

    function scrollToCard(index) {
      const card = document.getElementById(\`card-\${index}\`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    async function loadStats() {
      const res = await fetch('/api/review/stats');
      const stats = await res.json();
      
      document.getElementById('stat-total').textContent = stats.total;
      document.getElementById('stat-approved').textContent = stats.approved;
      document.getElementById('stat-rejected').textContent = stats.rejected;
      document.getElementById('stat-pending').textContent = stats.pending;
    }

    // 鍵盤快捷鍵
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        const pendingIndex = images.findIndex((img, i) => i >= currentIndex && img.status === 'pending');
        if (pendingIndex >= 0) approve(pendingIndex);
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        const pendingIndex = images.findIndex((img, i) => i >= currentIndex && img.status === 'pending');
        if (pendingIndex >= 0) reject(pendingIndex);
      } else if (e.key === '1') {
        loadSession(1);
      } else if (e.key === '2') {
        loadSession(2);
      } else if (e.key === '3') {
        loadSession(3);
      } else if (e.key === '4') {
        loadSession(4);
      } else if (e.key === '5') {
        loadSession(5);
      } else if (e.key === '6') {
        loadSession(6);
      }
    });

    // 初始加載
    loadSession(1);
  </script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log('\n🎨 審核服務器已啟動');
  console.log('━'.repeat(60));
  console.log(`📍 訪問: http://localhost:${PORT}`);
  console.log('━'.repeat(60));
  console.log('\n快捷鍵:');
  console.log('  → 或 Space: 批准');
  console.log('  ← 或 Backspace: 拒絕');
  console.log('  數字 1-6: 切換 Session');
  console.log('\n按 Ctrl+C 退出\n');
});
