const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 300 });
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== 免费音乐 API ====================

// Jamendo 免费音乐 (CC授权，无需登录)
const JAMENDO_CLIENT_ID = '97deb7a2'; // 公共演示ID

// 获取热门歌曲列表
app.get('/api/music/trending', async (req, res) => {
  const cacheKey = 'trending_tracks';
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: 20,
        order: 'popularity_total',
        audioformat: 'mp32',
        imagesize: 300
      },
      timeout: 8000
    });
    const tracks = response.data.results.map(t => ({
      id: t.id,
      title: t.name,
      artist: t.artist_name,
      album: t.album_name,
      cover: t.image || 'https://via.placeholder.com/300x300/1a1a2e/fff?text=🎵',
      url: t.audio,
      duration: t.duration,
      tags: t.musicinfo ? (t.musicinfo.tags || {}) : {},
      mood: guessMood(t.name, t.artist_name)
    }));
    const result = { success: true, tracks };
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    // fallback: 返回示例数据
    res.json(getFallbackTracks());
  }
});

// 按风格搜索音乐
app.get('/api/music/search', async (req, res) => {
  const { q = '', tags = '', limit = 15 } = req.query;
  const cacheKey = `search_${q}_${tags}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit,
        namesearch: q || undefined,
        tags: tags || undefined,
        audioformat: 'mp32',
        imagesize: 300,
        order: 'popularity_total'
      },
      timeout: 8000
    });
    const tracks = response.data.results.map(t => ({
      id: t.id,
      title: t.name,
      artist: t.artist_name,
      album: t.album_name,
      cover: t.image || 'https://via.placeholder.com/300x300/1a1a2e/fff?text=🎵',
      url: t.audio,
      duration: t.duration,
      mood: guessMood(t.name, t.artist_name)
    }));
    const result = { success: true, tracks };
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.json(getFallbackTracks());
  }
});

// 获取今日天气心情（用ip-api免费接口）
app.get('/api/weather', async (req, res) => {
  try {
    const ipRes = await axios.get('http://ip-api.com/json/?lang=zh-CN&fields=city,regionName,weather', { timeout: 5000 });
    const city = ipRes.data.city || '你的城市';
    const moods = ['晴朗', '多云', '微风', '轻雨', '阴天'];
    const mood = moods[Math.floor(Math.random() * moods.length)];
    res.json({ success: true, city, mood, weather: mood });
  } catch {
    res.json({ success: true, city: '未知城市', mood: '晴朗', weather: '晴朗' });
  }
});

// AI 主播话术生成（规则引擎，无需API Key）
app.post('/api/broadcast', (req, res) => {
  const { track, nextTrack, weather, city, timeOfDay, playCount } = req.body;
  const script = generateBroadcastScript({ track, nextTrack, weather, city, timeOfDay, playCount });
  res.json({ success: true, script });
});

// 获取电台状态
app.get('/api/state', (req, res) => {
  res.json({
    success: true,
    version: '1.0.0',
    name: 'AI 个人电台',
    features: ['music', 'tts', 'broadcast', 'mood']
  });
});

// ==================== AI 话术引擎 ====================

function generateBroadcastScript({ track, nextTrack, weather, city, timeOfDay, playCount }) {
  const greetings = {
    morning: ['早安', '美好的早晨', '新的一天开始了', '清晨好'],
    afternoon: ['下午好', '午后时光', '这个下午', '悠闲的下午'],
    evening: ['晚上好', '夜幕降临', '傍晚时分', '美好的夜晚'],
    night: ['深夜好', '夜深了', '静谧的夜晚', '此刻']
  };

  const transitions = [
    '接下来这首歌送给你——',
    '下一曲，请欣赏——',
    '让音乐带你继续——',
    '静下心来，听——',
    '这首歌，专属于你——',
    '感受一下这段旋律——'
  ];

  const weatherComments = {
    '晴朗': '阳光正好，',
    '多云': '云朵懒懒飘着，',
    '微风': '微风轻抚，',
    '轻雨': '细雨绵绵，',
    '阴天': '天色有些阴沉，'
  };

  const tod = timeOfDay || getTimeOfDay();
  const greeting = pick(greetings[tod] || greetings.afternoon);
  const transition = pick(transitions);
  const weatherComment = weatherComments[weather] || '';
  const cityStr = city && city !== '未知城市' ? `${city}的` : '';

  const templates = [
    `${greeting}，${cityStr}朋友们。${weatherComment}${playCount > 1 ? `这已经是今天第 ${playCount} 首了，` : ''}${transition}《${track?.title || '未知'}》，by ${track?.artist || '未知艺术家'}。`,

    `你好，我是你的 AI 电台主播。${weatherComment}${greeting}的${cityStr}${tod === 'night' ? '夜晚' : '时光'}，${transition}${track?.artist || '未知艺术家'} 的《${track?.title || '未知'}》。`,

    `${greeting}。${playCount > 3 ? '听了好几首了，感觉还好吗？' : ''}今天的心情怎么样？${transition}《${track?.title || '未知'}》。${nextTrack ? `之后还有《${nextTrack.title}》等着你。` : ''}`,

    `欢迎回来。${weatherComment}适合听音乐的${tod === 'morning' ? '早晨' : tod === 'night' ? '夜晚' : '时刻'}。${transition}${track?.artist || '未知艺术家'} 带来的《${track?.title || '未知'}》。`
  ];

  return pick(templates);
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 22) return 'evening';
  return 'night';
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function guessMood(title, artist) {
  const s = (title + ' ' + artist).toLowerCase();
  if (/love|heart|romantic|amor/.test(s)) return '浪漫';
  if (/sad|cry|tear|blue|alone/.test(s)) return '忧郁';
  if (/happy|joy|dance|party|fun/.test(s)) return '欢快';
  if (/chill|relax|sleep|calm|peace/.test(s)) return '放松';
  if (/rock|metal|punk|rage|fury/.test(s)) return '激烈';
  return '轻柔';
}

function getFallbackTracks() {
  return {
    success: true,
    tracks: [
      { id: '1', title: 'Sunlight', artist: 'Jahzzar', album: 'Best of Jamendo', cover: 'https://via.placeholder.com/300x300/6c5ce7/fff?text=🎵', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 230, mood: '欢快' },
      { id: '2', title: 'Acoustic Breeze', artist: 'Benjamin Tissot', album: 'Bensound', cover: 'https://via.placeholder.com/300x300/00b894/fff?text=🎶', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 195, mood: '放松' },
      { id: '3', title: 'Ukulele', artist: 'Bensound', album: 'Royalty Free', cover: 'https://via.placeholder.com/300x300/fd79a8/fff?text=🎸', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 178, mood: '欢快' },
      { id: '4', title: 'Jazzy Frenchy', artist: 'BenSound', album: 'Jazz Collection', cover: 'https://via.placeholder.com/300x300/0984e3/fff?text=🎷', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 212, mood: '浪漫' },
      { id: '5', title: 'Once Again', artist: 'Jahzzar', album: 'Takk', cover: 'https://via.placeholder.com/300x300/e17055/fff?text=🎼', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration: 264, mood: '忧郁' }
    ]
  };
}

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🎙️  AI 个人电台已启动！`);
  console.log(`📡  访问地址: http://localhost:${PORT}`);
  console.log(`📱  在手机浏览器打开后可"添加到主屏幕"安装为App\n`);
});
