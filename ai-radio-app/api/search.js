// Vercel Serverless Function - 搜索音乐
const axios = require('axios');

const FALLBACK = [
  { id: 's1', title: 'Sunlight', artist: 'Jahzzar', album: 'Best of', cover: 'https://via.placeholder.com/300/6c5ce7/fff?text=%F0%9F%8E%B5', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 230, mood: '欢快' },
  { id: 's2', title: 'Acoustic', artist: 'Bensound', album: 'Free', cover: 'https://via.placeholder.com/300/00b894/fff?text=%F0%9F%8E%B6', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 195, mood: '放松' },
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q = '', tags = '', limit = 15 } = req.query;
  try {
    const params = {
      client_id: '97deb7a2',
      format: 'json',
      limit,
      audioformat: 'mp32',
      imagesize: 300,
      order: 'popularity_total'
    };
    if (q) params.namesearch = q;
    if (tags) params.tags = tags;

    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params,
      timeout: 8000
    });
    const tracks = response.data.results.map(t => ({
      id: t.id,
      title: t.name,
      artist: t.artist_name,
      album: t.album_name,
      cover: t.image || 'https://via.placeholder.com/300/7c3aed/fff?text=🎵',
      url: t.audio,
      duration: t.duration,
      mood: guessMood(t.name, t.artist_name)
    }));
    res.json({ success: true, tracks });
  } catch {
    const q2 = (q || '').toLowerCase();
    const filtered = q2 ? FALLBACK.filter(t => t.title.toLowerCase().includes(q2) || t.artist.toLowerCase().includes(q2)) : FALLBACK;
    res.json({ success: true, tracks: filtered });
  }
};

function guessMood(title, artist) {
  const s = (title + ' ' + artist).toLowerCase();
  if (/love|heart|romantic/.test(s)) return '浪漫';
  if (/sad|cry|blue/.test(s)) return '忧郁';
  if (/happy|joy|dance/.test(s)) return '欢快';
  if (/chill|relax|calm/.test(s)) return '放松';
  return '轻柔';
}
