import { Router } from "express"   
import {existsSync, readFileSync, writeFileSync} from 'fs'

export type User = {
    id: number
    username: string
    email: string
    password: string
}

export let users: User[] = []

let file = 'PData/users.json'
if (existsSync(file)) {
    let text = readFileSync(file).toString()
    users = JSON.parse(text)
}

export let router = Router()

router.post('/users', (req, res) => {
    let username = req.body.username
    let password = req.body.password
    let email = req.body.email
    
    // 檢查必要欄位
    if (!username || !email || !password) {
        return res.status(400).json({
            error: '缺少必要欄位,請再確認。'
        })
    }
    
    // 檢查用戶名是否已存在
    const existingUserByUsername = users.find(user => user.username === username)
    if (existingUserByUsername) {
        return res.status(409).json({
            error: '用戶名已存在，請使用其他用戶名或嘗試登入。'
        })
    }
    
    // 檢查 email 是否已存在
    const existingUserByEmail = users.find(user => user.email === email)
    if (existingUserByEmail) {
        return res.status(409).json({
            error: '電子郵件已被註冊，請使用其他電子郵件或嘗試登入。'
        })
    }
    
    // 創建新用戶
    const newUser = {
        id: users.length + 1,
        username,
        email,
        password,
    }
    
    users.push(newUser)
    let text = JSON.stringify(users, null, 2)
    writeFileSync(file, text)
    
    res.json({
        id: newUser.id,
        message: '註冊成功！ 請前往登入。'
    })
})
