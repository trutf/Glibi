import subprocess

store_games = {
    "dota2": ("#1c0808", "#e11d48", "DOTA 2", 570),
    "apex": ("#180907", "#ea580c", "APEX LEGENDS", 1172470),
    "pubg": ("#161208", "#eab308", "PUBG: BATTLEGROUNDS", 578080),
    "rust": ("#190a05", "#c2410c", "RUST", 252490),
    "helldivers2": ("#08131d", "#0284c7", "HELLDIVERS 2", 553850),
    "palworld": ("#0a1811", "#10b981", "PALWORLD", 1623730),
    "blackmyth": ("#1a1205", "#d97706", "BLACK MYTH: WUKONG", 2358720),
    "tf2": ("#180e06", "#f97316", "TEAM FORTRESS 2", 440),
}

for name, (bg, glow, title, app_id) in store_games.items():
    cmd = f"""
    magick -size 600x900 xc:'{bg}' \\
      \\( -size 600x600 radial-gradient:'{glow}'-'transparent' -geometry +0-80 \\) -composite \\
      \\( -size 600x400 xc:transparent -fill '#08080a' -draw 'polygon 0,400 0,180 150,250 300,120 450,220 600,160 600,400' -geometry +0+500 \\) -composite \\
      /home/qlat/Dev/Glibi/src/assets/covers/{name}.jpg
    """
    subprocess.run(cmd, shell=True, check=True)

print("Store covers created!")
