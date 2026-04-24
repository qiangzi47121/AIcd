import struct, zlib, os

def create_png(size, color=(124,58,237)):
    w = h = size
    def chunk(name, data):
        c = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
    rows = b''
    for y in range(h):
        row = b'\x00'
        for x in range(w):
            cx, cy = x - w//2, y - h//2
            r = (cx**2 + cy**2) ** 0.5
            if r < w*0.45:
                if r < w*0.18:
                    row += bytes([255,255,255])
                else:
                    t = min(1.0, (r - w*0.18) / (w*0.27))
                    row += bytes([
                        int(color[0]*(1-t) + 244*t),
                        int(color[1]*(1-t) + 114*t),
                        int(color[2]*(1-t) + 182*t)
                    ])
            else:
                row += bytes([15,15,26])
        rows += row
    compressed = zlib.compress(rows)
    idat = chunk(b'IDAT', compressed)
    iend = chunk(b'IEND', b'')
    return sig + ihdr + idat + iend

os.makedirs('public/icons', exist_ok=True)
with open('public/icons/icon-192.png', 'wb') as f:
    f.write(create_png(192))
with open('public/icons/icon-512.png', 'wb') as f:
    f.write(create_png(512))
print('icons created')
