import express from 'express'
import { print } from 'listening-on'
import { users, User, fishs } from './data'
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
  res.json(users);
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

