import { Router } from "express";
import {existsSync , readFileSync , writeFileSync} from "fs";

let router = Router();

export type userData ={
    user_name: string;
    pass : number;
}
export let userData : userData[] = [];
let file = 'userData.json'
if(existsSync(file)){
    let text = readFileSync(file , 'utf-8');
    userData = JSON.parse(text);
}

{
  // 新增的 route：POST /api/register
  router.post('/api/register', (req, res) => {
    const { user_name, pass } = req.body;
    if (!user_name || !pass) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    if (userData.find(u => u.user_name === user_name)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const newRecord: userData = {
      user_name: String(user_name),
      pass: String(pass) as unknown as number // 保留原 type 若要改為 string 可改此行與 type
    };

    userData.push(newRecord);
    writeFileSync(file, JSON.stringify(userData, null, 2), 'utf-8');

    return res.json({ ok: true });
  });

  export default router;
}
