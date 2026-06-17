# 部署说明

这个项目有两种使用方式：

1. 直接打开 `index.html`
   - 适合自己本地用。
   - 数据保存在当前浏览器里。
   - 可以用“导出 JSON / 导入 JSON”传递进度。

2. 运行 `server.mjs`
   - 适合发给别人一起用。
   - 数据会保存到服务器上的 `shared-state.json`。
   - 多个打开同一个网址的人会收到实时同步更新。

## 本机运行

```powershell
node server.mjs
```

然后打开：

```text
http://127.0.0.1:5173/
```

## 部署到公网

推荐部署到支持 Node.js Web Service 的平台，例如 Render、Railway、Fly.io、VPS 等。

需要满足：

- 启动命令：`npm start`
- 服务端口：平台会提供 `PORT` 环境变量，`server.mjs` 已经支持
- 持久化保存：如果平台文件系统会重置，最好挂载持久磁盘，保存 `shared-state.json`

## Render 思路

1. 把这个文件夹上传到 GitHub 仓库。
2. 在 Render 新建 Web Service。
3. 选择这个仓库。
4. Build Command 填：`npm install`
5. Start Command 填：`npm start`
6. 如果需要长期保存多人编辑结果，给服务挂载磁盘，并把 `shared-state.json` 放在持久目录。

注意：不挂载持久磁盘时，服务重启后服务器端进度可能丢失；但用户仍可用 JSON 导出备份。
