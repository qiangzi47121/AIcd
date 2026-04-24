// Vercel Serverless Function - 热门音乐
const axios = require('axios');

const FALLBACK_TRACKS = [
  { id: '1', title: 'Sunlight Journey', artist: 'Ambient Artist', album: 'Demo', cover: 'https://via.placeholder.com/300/6c5ce7/fff?text=%F0%9F%8E%B5', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 230, mood: '欢快' },
  { id: '2', title: 'Acoustic Breeze', artist: 'Bensound', album: 'Royalty Free', cover: 'https://via.placeholder.com/300/00b894/fff?text=%F0%9F%8E%B6', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 195, mood: '放松' },
  { id: '3', title: 'Ukulele Delight', artist: 'Bensound', album: 'Royalty Free', cover: 'https://via.placeholder.com/300/fd79a8/fff?text=%F0%9F%8E%B8', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 178, mood: '欢快' },
  { id: '4', title: 'Jazzy Frenchy', artist: 'Bensound', album: 'Jazz', cover: 'https://via.placeholder.com/300/0984e3/fff?text=%F0%9F%8E%B7', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 212, mood: '浪漫' },
  { id: '5', title: 'Once Again', artist: 'Jahzzar', album: 'Takk', cover: 'https://via.placeholder.com/300/e17055/fff?text=%F0%9F%8E%BC', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration: 264, mood: '忧郁' },
  { id: '6', title: 'Monday Walking', artist: 'Bensound', album: 'Upbeat', cover: 'https://via.placeholder.com/300/a29bfe/fff?text=%F0%9F%8E%B9', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', duration: 199, mood: '轻柔' },
  { id: '7', title: 'Creative Minds', artist: 'Bensound', album: 'Inspiration', cover: 'https://via.placeholder.com/300/55efc4/fff?text=%F0%9F%8E%BA', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', duration: 187, mood: '激烈' },
  { id: '8', title: 'Electronic Manifesto', artist: 'Bensound', album: 'Electronic', cover: 'https://via.placeholder.com/300/fdcb6e/fff?text=%F0%9F%8E%BB', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', duration: 243, mood: '欢快' },
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: '97deb7a2',
        format: 'json',
        limit: 15,
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
      cover: t.image || 'https://via.placeholder.com/300/7c3aed/fff?text=🎵',
      url: t.audio,
      duration: t.duration,
      mood: guessMood(t.name, t.artist_name)
    }));
    res.json({ success: true, tracks });
  } catch (err) {
    res.json({ success: true, tracks: FALLBACK_TRACKS });
  }
};

function guessMood(title, artist) {
  const s = (title + ' ' + artist).toLowerCase();
  if (/love|heart|romantic|amor/.test(s)) return '浪漫';
  if (/sad|cry|tear|blue|alone/.test(s)) return '忧郁';
  if (/happy|joy|dance|party|fun/.test(s)) return '欢快';
  if (/chill|relax|sleep|calm|peace/.test(s)) return '放松';
  if (/rock|metal|punk|rage/.test(s)) return '激烈';
  return '轻柔';
}
