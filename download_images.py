import urllib.request
import os

os.makedirs("/home/qlat/Dev/Glibi/src/assets/covers", exist_ok=True)

# Direct Steam CDN URLs for actual official game vertical capsule library assets
steam_covers = {
    "cyberpunk2077": "https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_600x900.jpg",
    "eldenring": "https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_600x900.jpg",
    "witcher3": "https://cdn.akamai.steamstatic.com/steam/apps/292030/library_600x900.jpg",
    "rdr2": "https://cdn.akamai.steamstatic.com/steam/apps/1174180/library_600x900.jpg",
    "hades2": "https://cdn.akamai.steamstatic.com/steam/apps/1145350/library_600x900.jpg",
    "godofwar": "https://cdn.akamai.steamstatic.com/steam/apps/1593500/library_600x900.jpg",
    "baldursgate3": "https://cdn.akamai.steamstatic.com/steam/apps/1086940/library_600x900.jpg",
    "forza5": "https://cdn.akamai.steamstatic.com/steam/apps/1551360/library_600x900.jpg",
    "gtav": "https://cdn.akamai.steamstatic.com/steam/apps/271590/library_600x900.jpg",
    "minecraft": "https://cdn.cloudflare.steamstatic.com/steam/apps/1672970/library_600x900.jpg" # Minecraft Dungeons/Legends or placeholder
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

for name, url in steam_covers.items():
    dest = f"/home/qlat/Dev/Glibi/src/assets/covers/{name}.jpg"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            with open(dest, "wb") as f:
                f.write(data)
            print(f"[OK] Downloaded {name} ({len(data)} bytes)")
    except Exception as e:
        print(f"[FAIL] {name}: {e}")
