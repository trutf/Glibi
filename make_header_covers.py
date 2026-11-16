import subprocess

headers = {
    "cs2": ("#13171c", "#38bdf8", "CS2", 730),
    "blackmyth": ("#1c1308", "#f59e0b", "WUKONG", 2358720),
    "helldivers2": ("#081726", "#0284c7", "HELLDIVERS", 553850),
    "eldenring": ("#171408", "#eab308", "ELDEN RING", 1245620),
    "ets2": ("#11161d", "#3b82f6", "ETS 2", 227300),
}

for name, (bg, glow, title, app_id) in headers.items():
    cmd = f"""
    magick -size 920x430 xc:'{bg}' \\
      \\( -size 920x430 radial-gradient:'{glow}'-'transparent' -geometry +0-50 \\) -composite \\
      \\( -size 920x250 xc:transparent -fill '#0a0b0d' -draw 'polygon 0,250 0,100 200,160 460,80 720,150 920,90 920,250' -geometry +0+180 \\) -composite \\
      /home/qlat/Dev/Glibi/src/assets/covers/{name}_header.jpg
    """
    subprocess.run(cmd, shell=True, check=True)

print("Headers generated successfully!")
