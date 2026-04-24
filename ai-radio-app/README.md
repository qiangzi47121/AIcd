# 🎙️ AI 个人电台

> 把你的歌单蒸馏成 AI 驱动的音乐电台 — PWA 版本

## 🌐 在线访问

**部署后访问地址**：`https://ai-radio-app-你的用户名.vercel.app`

详细部署步骤见 👉 **`部署指南.md`**

---

## 💻 本地开发

---

## 快速启动

### 方法一：双击启动（推荐）
直接双击 **`启动电台.bat`** 即可启动服务。

### 方法二：手动启动
```bash
# 使用 Python
python server_py.py

# 或（安装 Node 后）
npm install
node server.js
```

启动后访问：**http://localhost:8080**

---

## 📱 安装到安卓手机（当 App 用）

1. 手机和电脑连接**同一个 WiFi**
2. 查看电脑局域网 IP（运行 `ipconfig` 看 IPv4 地址，如 `192.168.1.100`）
3. 手机 Chrome 浏览器打开 `http://192.168.1.100:8080`
4. 点击浏览器菜单 → **"添加到主屏幕"** 或 **"安装应用"**
5. 桌面上就出现 AI 电台 App 图标了！

---

## 🎵 功能特性

| 功能 | 说明 |
|------|------|
| 🎵 音乐播放 | 支持播放/暂停/上下曲/进度拖拽 |
| 🔀 随机播放 | 随机洗牌播放列表 |
| 🎙️ AI 主播 | 每首歌前自动生成个性化播报词 |
| 🔊 语音播报 | 浏览器 TTS 朗读播报词（中文） |
| 🔍 搜索发现 | 按风格/关键词搜索音乐 |
| 📱 PWA 安装 | 可安装到手机桌面，离线使用 |
| 🌤️ 天气融入 | 播报词融合当地天气和时段 |

---

## 🏗️ 架构说明（对应大纲）

```
第一层 用户数据
├── USER  → 播放偏好、本地歌单（localStorage）
├── MUSIC → Jamendo 免费音乐 API / SoundHelix Demo
├── BRAIN → 规则引擎话术生成器（server_py.py）
└── VOICE → 浏览器 Web Speech API（TTS）

第二层 运行时
├── ROUTER   → Express/Python HTTP 路由
├── CONTEXT  → 播放状态、天气、时间上下文
├── CLAUDE   → AI话术模板（generateBroadcastScript）
├── SCHEDULER→ audio.ended 事件驱动下一首
├── TTS      → window.speechSynthesis
└── STATE.DB → 内存状态 (state 对象)

第三层 运行时数据
├── 当前曲目、播放列表、进度
└── 天气、城市、播放次数

第四层 对外暴露
├── PWA → http://localhost:8080
└── HTTP API → /api/music/* /api/broadcast /api/weather
```

---

## 🔧 升级 Node.js 后解锁更多功能

安装 Node.js 后，运行 `npm install && node server.js` 可获得：
- ✅ 真实 Jamendo 海量曲库（CC 授权）
- ✅ 自动按心情/风格推荐
- ✅ 更快的 API 响应

---

## 📁 文件结构

```
ai-radio-app/
├── public/
│   ├── index.html      # PWA 前端（全部UI逻辑）
│   ├── manifest.json   # PWA 配置
│   ├── sw.js           # Service Worker（离线缓存）
│   └── icons/          # App 图标
├── server.js           # Node.js 后端（需 Node）
├── server_py.py        # Python 后端（当前使用）
├── 启动电台.bat         # 一键启动脚本
└── README.md
```
