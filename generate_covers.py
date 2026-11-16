import os
import base64

games = [
    {
        "id": "cyberpunk2077",
        "title": "Cyberpunk 2077",
        "category": "RPG / Sci-Fi",
        "bg_color": "#0d0e15",
        "accent": "#fcee0a",
        "accent_text": "#000",
        "sub": "NIGHT CITY",
        "tag": "READY TO PLAY"
    },
    {
        "id": "eldenring",
        "title": "Elden Ring",
        "category": "Action / Souls-like",
        "bg_color": "#12100e",
        "accent": "#c59b27",
        "accent_text": "#000",
        "sub": "THE LANDS BETWEEN",
        "tag": "INSTALLED"
    },
    {
        "id": "witcher3",
        "title": "The Witcher 3: Wild Hunt",
        "category": "Open World / RPG",
        "bg_color": "#140e0e",
        "accent": "#b82626",
        "accent_text": "#fff",
        "sub": "WHITE WOLF",
        "tag": "UPDATE AVAILABLE"
    },
    {
        "id": "rdr2",
        "title": "Red Dead Redemption II",
        "category": "Open World / Western",
        "bg_color": "#1c0d09",
        "accent": "#d62828",
        "accent_text": "#fff",
        "sub": "OUTLAWS FOR LIFE",
        "tag": "READY TO PLAY"
    },
    {
        "id": "hades2",
        "title": "Hades II",
        "category": "Rogue-like / Action",
        "bg_color": "#0a1412",
        "accent": "#2ec4b6",
        "accent_text": "#000",
        "sub": "UNDERWORLD REBORN",
        "tag": "INSTALLED"
    },
    {
        "id": "godofwar",
        "title": "God of War Ragnarök",
        "category": "Action / Adventure",
        "bg_color": "#0d131a",
        "accent": "#00a8e8",
        "accent_text": "#fff",
        "sub": "FIMBULWINTER",
        "tag": "READY TO PLAY"
    },
    {
        "id": "minecraft",
        "title": "Minecraft",
        "category": "Sandbox / Survival",
        "bg_color": "#0d180f",
        "accent": "#52b788",
        "accent_text": "#000",
        "sub": "BEDROCK & JAVA",
        "tag": "READY TO PLAY"
    },
    {
        "id": "baldursgate3",
        "title": "Baldur's Gate 3",
        "category": "Tactical / RPG",
        "bg_color": "#180d1e",
        "accent": "#9d4edd",
        "accent_text": "#fff",
        "sub": "SWORD COAST",
        "tag": "INSTALLED"
    }
]

out_dir = "/home/qlat/Dev/Glibi/src/assets/covers"
os.makedirs(out_dir, exist_ok=True)

for g in games:
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
  <defs>
    <linearGradient id="grad_{g['id']}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{g['bg_color']}" />
      <stop offset="60%" stop-color="#141414" />
      <stop offset="100%" stop-color="#0a0a0a" />
    </linearGradient>
    <linearGradient id="shine_{g['id']}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{g['accent']}" stop-opacity="0.25" />
      <stop offset="50%" stop-color="{g['accent']}" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.8" />
    </linearGradient>
    <radialGradient id="glow_{g['id']}" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="{g['accent']}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="600" height="850" fill="url(#grad_{g['id']})" />
  <rect width="600" height="850" fill="url(#glow_{g['id']})" />
  <rect width="600" height="850" fill="url(#shine_{g['id']})" />

  <!-- Modern Graphic Accents -->
  <circle cx="500" cy="120" r="180" fill="none" stroke="{g['accent']}" stroke-opacity="0.08" stroke-width="2" />
  <circle cx="500" cy="120" r="260" fill="none" stroke="{g['accent']}" stroke-opacity="0.04" stroke-width="1.5" />
  <line x1="50" y1="70" x2="150" y2="70" stroke="{g['accent']}" stroke-width="3" stroke-linecap="round" />

  <!-- Game Category & Tag -->
  <text x="50" y="55" fill="{g['accent']}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="3">{g['category'].upper()}</text>
  
  <!-- Central Emblem / Icon Graphic -->
  <g transform="translate(300, 360)">
    <polygon points="0,-90 78,-45 78,45 0,90 -78,45 -78,-45" fill="none" stroke="{g['accent']}" stroke-width="2" stroke-opacity="0.4" />
    <polygon points="0,-70 60,-35 60,35 0,70 -60,35 -60,-35" fill="{g['accent']}" fill-opacity="0.08" stroke="{g['accent']}" stroke-width="1.5" stroke-opacity="0.8" />
    <circle cx="0" cy="0" r="24" fill="{g['accent']}" fill-opacity="0.2" />
    <circle cx="0" cy="0" r="8" fill="{g['accent']}" />
  </g>

  <!-- Subtitle -->
  <text x="300" y="520" text-anchor="middle" fill="#888888" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" letter-spacing="4">{g['sub']}</text>

  <!-- Title Bottom Section -->
  <rect x="0" y="660" width="600" height="190" fill="#0d0d0d" fill-opacity="0.9" />
  <line x1="0" y1="660" x2="600" y2="660" stroke="#262626" stroke-width="1" />
  
  <text x="40" y="725" fill="#f5f5f5" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800">{g['title']}</text>
  
  <!-- Status Badge -->
  <rect x="40" y="750" width="130" height="26" rx="4" fill="{g['accent']}" />
  <text x="105" y="767" text-anchor="middle" fill="{g['accent_text']}" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="800" letter-spacing="1">{g['tag']}</text>
  <text x="190" y="768" fill="#737373" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500">v1.2.4</text>
</svg>
"""
    with open(f"{out_dir}/{g['id']}.svg", "w", encoding="utf-8") as f:
        f.write(svg.strip())

print("Cover posters generated successfully!")
