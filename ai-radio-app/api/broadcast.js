// Vercel Serverless Function - AI主播话术生成
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { track, nextTrack, weather, city, playCount } = req.body || {};
  const script = generateBroadcast({ track, nextTrack, weather, city, playCount });
  res.json({ success: true, script });
};

function generateBroadcast({ track, nextTrack, weather, city, playCount }) {
  const greetings = {
    morning: ['早安', '美好的早晨', '新的一天开始了'],
    afternoon: ['下午好', '午后时光', '悠闲的下午'],
    evening: ['晚上好', '夜幕降临', '美好的夜晚'],
    night: ['深夜好', '夜深了', '静谧的夜晚']
  };
  const transitions = ['接下来这首歌送给你——', '下一曲，请欣赏——', '让音乐带你继续——', '这首歌，专属于你——'];
  const weatherMap = {
    '晴朗': '阳光正好，',
    '多云': '云朵懒懒飘着，',
    '微风': '微风轻抚，',
    '轻雨': '细雨绵绵，',
    '阴天': '天色有些阴沉，'
  };
  const h = new Date().getHours();
  const tod = h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'afternoon' : h >= 18 && h < 22 ? 'evening' : 'night';
  const greeting = pick(greetings[tod]);
  const transition = pick(transitions);
  const weatherComment = weatherMap[weather] || '';
  const cityStr = city && city !== '未知城市' ? `${city}的` : '';
  const title = track?.title || '未知';
  const artist = track?.artist || '未知艺术家';
  const nextTitle = nextTrack?.title || '';

  const templates = [
    `${greeting}，${cityStr}朋友们。${weatherComment}${playCount > 1 ? `这已经是今天第 ${playCount} 首了，` : ''}${transition}《${title}》，by ${artist}。`,
    `你好，我是你的 AI 电台主播。${weatherComment}${greeting}的${cityStr}时光，${transition}${artist} 的《${title}》。`,
    `${greeting}。${playCount > 3 ? '听了好几首了，感觉还好吗？' : ''}${transition}《${title}》。${nextTitle ? `之后还有《${nextTitle}》等着你。` : ''}`,
    `欢迎回来。${weatherComment}适合听音乐的时刻，${transition}${artist} 带来的《${title}》。`
  ];
  return pick(templates);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
