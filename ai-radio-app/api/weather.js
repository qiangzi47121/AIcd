// Vercel Serverless Function - 天气数据
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    return res.status(200).end();
  }
  const moods = ['晴朗', '多云', '微风', '轻雨', '阴天'];
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  res.json({
    success: true,
    city: '你的城市',
    mood: pick(moods),
    weather: pick(moods)
  });
};
