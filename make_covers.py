import os

out_dir = "/home/qlat/Dev/Glibi/src/assets/covers"
os.makedirs(out_dir, exist_ok=True)

# Gerçek oyunların ikonik atmosferlerine, logo stillerine ve sanatsal kimliklerine sadık özel Steam/GOG Capsule posterleri
covers = [
    {
        "id": "cyberpunk2077",
        "title": "CYBERPUNK",
        "title_sub": "2077",
        "genre": "OPEN WORLD RPG",
        "tag": "READY",
        "accent": "#00f0ff",
        "accent2": "#fee801",
        "bg1": "#0b0c10",
        "bg2": "#1f0927",
        "symbol": "SAMURAI",
        "quote": "WAKE UP, SAMURAI",
        "year": "2077"
    },
    {
        "id": "eldenring",
        "title": "ELDEN RING",
        "title_sub": "SHADOW OF THE ERDTREE",
        "genre": "ACTION RPG",
        "tag": "INSTALLED",
        "accent": "#d4af37",
        "accent2": "#f3e5ab",
        "bg1": "#0c0a06",
        "bg2": "#1a1207",
        "symbol": "GREAT RUNE",
        "quote": "RISE, TARNISHED",
        "year": "GOTY 2022"
    },
    {
        "id": "witcher3",
        "title": "THE WITCHER 3",
        "title_sub": "WILD HUNT",
        "genre": "OPEN WORLD STORY",
        "tag": "READY",
        "accent": "#c92a2a",
        "accent2": "#ffa94d",
        "bg1": "#0f0808",
        "bg2": "#181010",
        "symbol": "WOLF SCHOOL",
        "quote": "THE PATH BECKONS",
        "year": "COMPLETE ED."
    },
    {
        "id": "rdr2",
        "title": "RED DEAD",
        "title_sub": "REDEMPTION II",
        "genre": "OPEN WORLD ACTION",
        "tag": "READY",
        "accent": "#e03131",
        "accent2": "#f8f9fa",
        "bg1": "#120505",
        "bg2": "#2b0a0a",
        "symbol": "VAN DER LINDE",
        "quote": "OUTLAWS FOR LIFE",
        "year": "ROCKSTAR"
    },
    {
        "id": "hades2",
        "title": "HADES II",
        "title_sub": "THE UNSEEN REALM",
        "genre": "ROGUE-LIKE",
        "tag": "INSTALLED",
        "accent": "#20c997",
        "accent2": "#ffd43b",
        "bg1": "#041410",
        "bg2": "#09231b",
        "symbol": "MELINOË",
        "quote": "DEATH TO CHRONOS",
        "year": "SUPERGIANT"
    },
    {
        "id": "godofwar",
        "title": "GOD OF WAR",
        "title_sub": "RAGNARÖK",
        "genre": "MYTHIC ACTION",
        "tag": "READY",
        "accent": "#4dabf7",
        "accent2": "#e7f5ff",
        "bg1": "#06101e",
        "bg2": "#0c1b2f",
        "symbol": "LEVIATHAN",
        "quote": "FOR THE NINE REALMS",
        "year": "SANTA MONICA"
    },
    {
        "id": "minecraft",
        "title": "MINECRAFT",
        "title_sub": "JAVA & BEDROCK",
        "genre": "SANDBOX SURVIVAL",
        "tag": "READY",
        "accent": "#51cf66",
        "accent2": "#94d82d",
        "bg1": "#07160c",
        "bg2": "#0d2616",
        "symbol": "OVERWORLD",
        "quote": "CREATE & EXPLORE",
        "year": "MOJANG"
    },
    {
        "id": "baldursgate3",
        "title": "BALDUR'S GATE",
        "title_sub": "III",
        "genre": "TACTICAL RPG",
        "tag": "INSTALLED",
        "accent": "#cc5de8",
        "accent2": "#f783ac",
        "bg1": "#12081c",
        "bg2": "#210f34",
        "symbol": "MIND FLAYER",
        "quote": "GATHER YOUR PARTY",
        "year": "GOTY 2023"
    }
]

for g in covers:
    # Özel her oyuna özgü geometrik ve sanatsal çizimler
    if g['id'] == 'cyberpunk2077':
        art_element = f'''
        <!-- Cyberpunk Grid & Neon lines -->
        <pattern id="grid_cp" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="{g['accent']}" stroke-opacity="0.07" stroke-width="1"/>
        </pattern>
        <rect width="600" height="900" fill="url(#grid_cp)" />
        <line x1="80" y1="200" x2="520" y2="200" stroke="{g['accent2']}" stroke-width="2" stroke-opacity="0.6" stroke-dasharray="8 4" />
        <circle cx="300" cy="380" r="160" fill="none" stroke="{g['accent']}" stroke-width="2" stroke-opacity="0.3" />
        <circle cx="300" cy="380" r="190" fill="none" stroke="{g['accent2']}" stroke-width="1" stroke-opacity="0.2" stroke-dasharray="12 8" />
        <!-- Cyber Katana / Samurai emblem -->
        <polygon points="300,240 370,360 300,340 230,360" fill="{g['accent']}" fill-opacity="0.8" />
        <polygon points="300,520 370,400 300,420 230,400" fill="{g['accent2']}" fill-opacity="0.9" />
        <rect x="290" y="310" width="20" height="140" fill="#ffffff" rx="4" />
        '''
    elif g['id'] == 'eldenring':
        art_element = f'''
        <!-- Elden Ring Great Rune Circles -->
        <circle cx="300" cy="350" r="150" fill="none" stroke="{g['accent']}" stroke-width="3" stroke-opacity="0.7" />
        <circle cx="300" cy="270" r="110" fill="none" stroke="{g['accent']}" stroke-width="2.5" stroke-opacity="0.5" />
        <circle cx="210" cy="420" r="110" fill="none" stroke="{g['accent']}" stroke-width="2.5" stroke-opacity="0.5" />
        <circle cx="390" cy="420" r="110" fill="none" stroke="{g['accent']}" stroke-width="2.5" stroke-opacity="0.5" />
        <line x1="300" y1="120" x2="300" y2="580" stroke="{g['accent']}" stroke-width="4" stroke-opacity="0.9" />
        <path d="M 160 320 Q 300 240 440 320" fill="none" stroke="{g['accent2']}" stroke-width="3" stroke-opacity="0.8" />
        <path d="M 120 450 Q 300 560 480 450" fill="none" stroke="{g['accent2']}" stroke-width="3" stroke-opacity="0.8" />
        '''
    elif g['id'] == 'witcher3':
        art_element = f'''
        <!-- Witcher Wolf Medallion Geometry -->
        <circle cx="300" cy="380" r="170" fill="none" stroke="{g['accent']}" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4 6" />
        <polygon points="300,240 390,320 370,450 300,530 230,450 210,320" fill="none" stroke="{g['accent']}" stroke-width="3.5" stroke-opacity="0.8" />
        <polygon points="300,280 350,340 330,440 300,480 270,440 250,340" fill="{g['accent']}" fill-opacity="0.15" stroke="{g['accent2']}" stroke-width="2" />
        <polygon points="260,360 285,385 255,400" fill="{g['accent2']}" />
        <polygon points="340,360 315,385 345,400" fill="{g['accent2']}" />
        '''
    elif g['id'] == 'rdr2':
        art_element = f'''
        <!-- Sun, Birds & Western Silhouette -->
        <circle cx="300" cy="360" r="140" fill="{g['accent']}" fill-opacity="0.75" />
        <path d="M 100 520 L 220 460 L 320 490 L 410 440 L 500 520 Z" fill="#0c0303" />
        <path d="M 80 550 L 250 490 L 400 540 L 520 480 L 540 550 Z" fill="#000000" />
        <!-- Flying birds in horizon -->
        <path d="M 220 280 Q 235 270 250 280 Q 265 270 280 280 Q 265 285 250 282 Z" fill="#ffffff" fill-opacity="0.8" />
        <path d="M 320 250 Q 330 242 340 250 Q 350 242 360 250 Q 350 254 340 252 Z" fill="#ffffff" fill-opacity="0.7" />
        <path d="M 370 290 Q 380 283 390 290 Q 400 283 410 290 Q 400 293 390 291 Z" fill="#ffffff" fill-opacity="0.6" />
        '''
    elif g['id'] == 'hades2':
        art_element = f'''
        <!-- Hades Underworld Magical sigils -->
        <circle cx="300" cy="380" r="160" fill="none" stroke="{g['accent']}" stroke-width="2" stroke-opacity="0.4" />
        <circle cx="300" cy="380" r="130" fill="none" stroke="{g['accent2']}" stroke-width="1.5" stroke-opacity="0.5" stroke-dasharray="10 6" />
        <!-- Crescent Moons & Dagger -->
        <path d="M 230 380 A 70 70 0 1 0 370 380 A 60 60 0 1 1 230 380 Z" fill="{g['accent']}" fill-opacity="0.6" />
        <line x1="300" y1="210" x2="300" y2="550" stroke="{g['accent2']}" stroke-width="4" stroke-linecap="round" />
        <polygon points="300,190 320,240 280,240" fill="{g['accent2']}" />
        <circle cx="300" cy="380" r="28" fill="{g['accent2']}" fill-opacity="0.9" />
        '''
    elif g['id'] == 'godofwar':
        art_element = f'''
        <!-- Norse Rune & Omega Circle -->
        <circle cx="300" cy="370" r="165" fill="none" stroke="{g['accent']}" stroke-width="4" stroke-opacity="0.4" />
        <path d="M 210 480 A 130 130 0 1 1 390 480 L 430 480 L 410 430 A 100 100 0 1 0 190 430 L 170 480 Z" fill="{g['accent']}" fill-opacity="0.85" />
        <!-- Frost Ice Glow -->
        <polygon points="300,260 315,350 300,430 285,350" fill="{g['accent2']}" fill-opacity="0.9" />
        <line x1="230" y1="350" x2="370" y2="350" stroke="{g['accent2']}" stroke-width="3" stroke-opacity="0.8" />
        '''
    elif g['id'] == 'minecraft':
        art_element = f'''
        <!-- Isometric 3D Cube / Dirt Grass Block -->
        <g transform="translate(300, 370)">
          <!-- Top face -->
          <polygon points="0,-120 120,-50 0,20 -120,-50" fill="{g['accent2']}" />
          <!-- Left face -->
          <polygon points="-120,-50 0,20 0,160 -120,90" fill="#402d1a" />
          <!-- Right face -->
          <polygon points="0,20 120,-50 120,90 0,160" fill="#2d1f12" />
          <!-- Grass overhang details -->
          <polygon points="-120,-50 0,20 0,45 -30,30 -40,55 -70,35 -90,50 -120,25" fill="{g['accent']}" />
          <polygon points="0,20 120,-50 120,-25 90,0 75,-15 50,15 25,-5 0,45" fill="{g['accent']}" fill-opacity="0.9" />
        </g>
        '''
    elif g['id'] == 'baldursgate3':
        art_element = f'''
        <!-- D&D D20 Dice & Mind Flayer Glow -->
        <g transform="translate(300, 370)">
          <polygon points="0,-150 130,-75 130,75 0,150 -130,75 -130,-75" fill="none" stroke="{g['accent']}" stroke-width="3" stroke-opacity="0.6" />
          <!-- Internal D20 triangles -->
          <polygon points="0,-150 0,40 -115,-20" fill="{g['accent']}" fill-opacity="0.25" stroke="{g['accent2']}" stroke-width="1.5" />
          <polygon points="0,-150 0,40 115,-20" fill="{g['accent']}" fill-opacity="0.35" stroke="{g['accent2']}" stroke-width="1.5" />
          <polygon points="0,40 -115,-20 -70,110" fill="{g['accent']}" fill-opacity="0.45" stroke="{g['accent2']}" stroke-width="1.5" />
          <polygon points="0,40 115,-20 70,110" fill="{g['accent']}" fill-opacity="0.55" stroke="{g['accent2']}" stroke-width="1.5" />
          <polygon points="0,40 -70,110 70,110" fill="{g['accent2']}" fill-opacity="0.8" stroke="{g['accent2']}" stroke-width="1.5" />
          <circle cx="0" cy="40" r="14" fill="#ffffff" />
        </g>
        '''

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
  <defs>
    <!-- Rich dynamic gradients -->
    <linearGradient id="bg_{g['id']}" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="{g['bg2']}" />
      <stop offset="45%" stop-color="{g['bg1']}" />
      <stop offset="100%" stop-color="#050505" />
    </linearGradient>

    <radialGradient id="vignette_{g['id']}" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="{g['accent']}" stop-opacity="0.28" />
      <stop offset="55%" stop-color="#000000" stop-opacity="0.65" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.98" />
    </radialGradient>

    <linearGradient id="overlay_{g['id']}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08" />
      <stop offset="30%" stop-color="#ffffff" stop-opacity="0" />
      <stop offset="65%" stop-color="#000000" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.96" />
    </linearGradient>

    <!-- Subtle Grain / Stripe pattern for AAA poster texture -->
    <pattern id="lines_{g['id']}" width="100" height="6" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="100" y2="0" stroke="#ffffff" stroke-opacity="0.018" stroke-width="2" />
    </pattern>
  </defs>

  <!-- Layers -->
  <rect width="600" height="900" fill="url(#bg_{g['id']})" />
  <rect width="600" height="900" fill="url(#vignette_{g['id']})" />
  <rect width="600" height="900" fill="url(#lines_{g['id']})" />

  <!-- Outer cinematic borders -->
  <rect x="18" y="18" width="564" height="864" fill="none" stroke="{g['accent']}" stroke-opacity="0.22" stroke-width="1.5" />
  <rect x="24" y="24" width="552" height="852" fill="none" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1" />

  <!-- Top Header bar -->
  <g transform="translate(42, 58)">
    <circle cx="6" cy="6" r="4" fill="{g['accent']}" />
    <text x="20" y="10" fill="{g['accent']}" font-family="DejaVu Sans, -apple-system, sans-serif" font-size="11" font-weight="bold" letter-spacing="3">{g['genre']}</text>
    <text x="516" y="10" text-anchor="end" fill="#777777" font-family="DejaVu Sans, -apple-system, sans-serif" font-size="11" font-weight="bold" letter-spacing="1.5">{g['year']}</text>
  </g>

  <!-- Central Artwork Motif -->
  {art_element}

  <!-- Lighting & Shadow Overlays -->
  <rect width="600" height="900" fill="url(#overlay_{g['id']})" />

  <!-- Atmospheric quote/lore tag -->
  <text x="300" y="640" text-anchor="middle" fill="#aaaaaa" font-family="DejaVu Sans, -apple-system, sans-serif" font-size="12" font-weight="600" letter-spacing="4">{g['quote']}</text>

  <!-- Bottom Hero Typography (Steam/GOG Master Art Style) -->
  <g transform="translate(42, 730)">
    <!-- Decorative glow bar -->
    <rect x="0" y="-35" width="46" height="3" fill="{g['accent']}" rx="1.5" />
    
    <!-- Main Title -->
    <text x="0" y="10" fill="#ffffff" font-family="DejaVu Sans, -apple-system, sans-serif" font-size="38" font-weight="900" letter-spacing="1">{g['title']}</text>
    
    <!-- Subtitle -->
    <text x="2" y="44" fill="{g['accent2']}" font-family="DejaVu Sans, -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="3">{g['title_sub']}</text>
    
    <!-- Status / Ready Pill -->
    <g transform="translate(0, 75)">
      <rect x="0" y="0" width="86" height="22" rx="3" fill="{g['accent']}" fill-opacity="0.2" stroke="{g['accent']}" stroke-opacity="0.6" stroke-width="1" />
      <text x="43" y="15" text-anchor="middle" fill="{g['accent2']}" font-family="DejaVu Sans, -apple-system, sans-serif" font-size="9" font-weight="bold" letter-spacing="1.5">{g['tag']}</text>
    </g>
  </g>
</svg>
'''
    with open(f"{out_dir}/{g['id']}.svg", "w", encoding="utf-8") as f:
        f.write(svg.strip())

print("AAA Game posters updated successfully!")
