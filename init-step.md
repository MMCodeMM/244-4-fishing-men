## 安裝 typescript 版 Express 步驟

1. npm init --yes
2. npm i -d ts-node
3. npm i express
4. npm i -d @types/express
5. npm i -d typescript
6. create tsconfig.json
7. npx ts-node xxx.ts //to run the ts files.
8. package.json / [ "start": "ts-node server.ts"
   ] // let you made a shortcut on your terminal like (npm start) to run your code.
9. npm i -d ts-node-dev
   // for let your code auto refresh when you update your own code.
10. package.json / [ "start": "ts-node-dev server.ts"
    ]//rename the shortcut.
11. npx tsc // to compile your ts file to js file.
12. npm i listening-on // to check your server is running or not.
