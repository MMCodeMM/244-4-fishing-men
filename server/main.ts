import express from 'express'
import { print } from 'listening-on'
import { users, User, fishs } from './data'
import fs from 'fs'
import path from 'path'
import * as login from './login' 
import * as register from './register'


let app = express()

// 伺服器啟動時載入 fish.json
try {
  const fishData = fs.readFileSync(path.join(__dirname, 'fish.json'), 'utf-8');
  fishs.push(...JSON.parse(fishData));
} catch (e) {
  console.error('載入 fish.json 失敗:', e);
}

app.use('/dist/client', express.static('dist/client'))
app.use(express.static('public'))
app.use(express.json())

app.get('/api/fish', (req, res) => {
  res.json(fishs);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/', (req, res) => {
  res.write('Welcome')
  res.end()
})

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.json({ success: false, message: '缺少必要欄位' });
    return;
  }
  if (users.some(u => u.username === username)) {
    res.json({ success: false, message: '用戶名已存在' });
    return;
  }
  const newUser: User = {
    id: users.length + 1,
    username,
    collection_fish_ids: [],
    liked_fish_ids: [],
    friends_user_ids: []
  };
  users.push(newUser);
  res.json({ success: true });
});

let port = 3000

app.listen(port, () => {
  console.log('Server starting...');
  print(port)
})

