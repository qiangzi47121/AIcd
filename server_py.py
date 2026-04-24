"""
AI 电台 - Python 轻量服务器（用于无 Node 环境下启动）
"""
import http.server
import socketserver
import json
import urllib.parse
import urllib.request
import random
import threading
import os
import sys
from datetime import datetime

PORT = 8080
BASE_DIR = os.path.join(os.path.dirname(__file__), 'public')

FALLBACK_TRACKS = [
    {"id": "1", "title": "SoundHelix Song 1", "artist": "T. Bergmann", "album": "Demo", "cover": "https://via.placeholder.com/300x300/6c5ce7/fff?text=%F0%9F%8E%B5", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", "duration": 230, "mood": "欢快"},
    {"id": "2", "title": "SoundHelix Song 2", "artist": "T. Bergmann", "album": "Demo", "cover": "https://via.placeholder.com/300x300/00b894/fff?text=%F0%9F%8E%B6", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", "duration": 195, "mood": "放松"},
    {"id": "3", "title": "SoundHelix Song 3", "artist": "T. Bergmann", "album": "Demo", "cover": "https://via.placeholder.com/300x300/fd79a8/fff?text=%F0%9F%8E%B8", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", "duration": 178, "mood": "欢快"},
    {"id": "4", "title": "SoundHelix Song 4", "artist": "T. Bergmann", "album": "Demo", "cover": "https://via.placeholder.com/300x300/0984e3/fff?text=%F0%9F%8E%B7", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", "duration": 212, "mood": "浪漫"},
    {"id": "5", "title": "SoundHelix Song 5", "artist": "T. Bergmann", "album": "Demo", "cover": "https://via.placeholder.com/300x300/e17055/fff?text=%F0%9F%8E%BC", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", "duration": 264, "mood": "忧郁"},
    {"id": "6", "title": "SoundHelix Song 6", "artist": "T. Bergmann", "album": "Demo", "cover": "https://via.placeholder.com/300x300/a29bfe/fff?text=%F0%9F%8E%B9", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", "duration": 199, "mood": "轻柔"},
    {"id": "7", "title": "SoundHelix Song 7", "artist": "T. Bergmann", "album": "Demo", "cover": "https://via.placeholder.com/300x300/55efc4/fff?text=%F0%9F%8E%BA", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", "duration": 187, "mood": "激烈"},
    {"id": "8", "title": "SoundHelix Song 8", "artist": "T. Bergmann", "album": "Demo", "cover": "https://via.placeholder.com/300x300/fdcb6e/fff?text=%F0%9F%8E%BB", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", "duration": 243, "mood": "欢快"},
]

def get_time_of_day():
    h = datetime.now().hour
    if 5 <= h < 12: return 'morning'
    if 12 <= h < 18: return 'afternoon'
    if 18 <= h < 22: return 'evening'
    return 'night'

def generate_broadcast(track, next_track, weather, city, play_count):
    greetings = {
        'morning': ['早安', '美好的早晨', '新的一天开始了'],
        'afternoon': ['下午好', '午后时光', '悠闲的下午'],
        'evening': ['晚上好', '夜幕降临', '美好的夜晚'],
        'night': ['深夜好', '夜深了', '静谧的夜晚']
    }
    transitions = ['接下来这首歌送给你——', '下一曲，请欣赏——', '让音乐带你继续——', '这首歌，专属于你——']
    weather_map = {'晴朗': '阳光正好，', '多云': '云朵懒懒飘着，', '微风': '微风轻抚，', '轻雨': '细雨绵绵，', '阴天': '天色有些阴沉，'}
    
    tod = get_time_of_day()
    greeting = random.choice(greetings.get(tod, greetings['afternoon']))
    transition = random.choice(transitions)
    weather_comment = weather_map.get(weather, '')
    city_str = f'{city}的' if city and city != '未知城市' else ''
    title = track.get('title', '未知') if track else '未知'
    artist = track.get('artist', '未知艺术家') if track else '未知'
    next_title = next_track.get('title', '') if next_track else ''
    
    templates = [
        f"{greeting}，{city_str}朋友们。{weather_comment}{'这已经是今天第 ' + str(play_count) + ' 首了，' if play_count > 1 else ''}{transition}《{title}》，by {artist}。",
        f"你好，我是你的 AI 电台主播。{weather_comment}{greeting}的{city_str}时光，{transition}{artist} 的《{title}》。",
        f"{greeting}。{'听了好几首了，感觉还好吗？' if play_count > 3 else ''}今天的心情怎么样？{transition}《{title}》。{'之后还有《' + next_title + '》等着你。' if next_title else ''}",
    ]
    return random.choice(templates)

class RadioHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        if path == '/api/music/trending':
            self.send_json({"success": True, "tracks": FALLBACK_TRACKS})
        elif path == '/api/music/search':
            params = urllib.parse.parse_qs(parsed.query)
            q = params.get('q', [''])[0].lower()
            tracks = [t for t in FALLBACK_TRACKS if q in t['title'].lower() or q in t['artist'].lower()] if q else FALLBACK_TRACKS
            self.send_json({"success": True, "tracks": tracks or FALLBACK_TRACKS[:5]})
        elif path == '/api/weather':
            moods = ['晴朗', '多云', '微风', '轻雨', '阴天']
            self.send_json({"success": True, "city": "你的城市", "mood": random.choice(moods), "weather": random.choice(moods)})
        elif path == '/api/state':
            self.send_json({"success": True, "version": "1.0.0", "name": "AI 个人电台"})
        elif path == '/' or (not path.startswith('/api') and '.' not in path.split('/')[-1]):
            self.path = '/index.html'
            super().do_GET()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/broadcast':
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length)) if length else {}
            script = generate_broadcast(
                body.get('track'), body.get('nextTrack'),
                body.get('weather', '晴朗'), body.get('city', ''),
                body.get('playCount', 1)
            )
            self.send_json({"success": True, "script": script})
        else:
            self.send_response(404)
            self.end_headers()

    def send_json(self, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', len(body))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        pass  # 静默日志

if __name__ == '__main__':
    with socketserver.TCPServer(('', PORT), RadioHandler) as httpd:
        httpd.allow_reuse_address = True
        print(f'\n🎙️  AI 个人电台已启动！')
        print(f'📡  访问地址: http://localhost:{PORT}')
        print(f'📱  在手机浏览器打开后可"添加到主屏幕"安装为App')
        print(f'     (手机需与电脑在同一WiFi，用电脑局域网IP访问)\n')
        httpd.serve_forever()
