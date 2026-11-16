import subprocess
import os

os.makedirs("/home/qlat/Dev/Glibi/src/assets/covers", exist_ok=True)

# Generate pure vertical key-art visuals without redundant titles on the image

# 1. Cyberpunk 2077: Iconic dark Night City skyline with neon billboards & atmospheric fog
subprocess.run("""
convert -size 600x900 xc:'#050508' \
  \\( -size 600x500 gradient:'#ff0055'-'#00f0ff' -blur 0x100 -level 10,80% -geometry +0+50 \\) -composite \
  \\( -size 600x350 xc:transparent -fill '#fee801' -draw 'rectangle 120,60 140,280 rectangle 180,120 230,310 rectangle 360,40 420,330 rectangle 460,100 500,260' -blur 0x15 \\) -composite \
  \\( -size 600x400 xc:transparent -fill '#06070a' -draw 'polygon 0,400 0,180 80,180 80,240 160,240 160,110 240,110 240,190 320,190 320,90 410,90 410,170 510,170 510,130 600,130 600,400' -geometry +0+400 \\) -composite \
  \\( -size 600x900 gradient:'transparent'-'#050508' -geometry +0+300 \\) -composite \
  /home/qlat/Dev/Glibi/src/assets/covers/cyberpunk2077.jpg
""", shell=True, check=True)

# 2. Elden Ring: The Great Golden Erdtree shining in the mystical night sky
subprocess.run("""
convert -size 600x900 xc:'#060706' \
  \\( -size 600x700 radial-gradient:'#ffd768'-'transparent' -geometry +0-120 \\) -composite \
  \\( -size 600x800 xc:transparent -stroke '#ffd768' -strokewidth 12 -fill none -draw 'line 300,0 300,550' -blur 0x20 \\) -composite \
  \\( -size 600x800 xc:transparent -stroke '#fffae0' -strokewidth 4 -fill none -draw 'line 300,0 300,550' -blur 0x4 \\) -composite \
  \\( -size 600x800 xc:transparent -stroke '#e6b800' -strokewidth 3 -fill none -draw 'circle 300,260 300,340 circle 300,320 300,400' -blur 0x3 \\) -composite \
  \\( -size 600x400 xc:transparent -fill '#040504' -draw 'polygon 0,400 0,100 180,140 300,80 420,150 600,90 600,400' -geometry +0+550 \\) -composite \
  /home/qlat/Dev/Glibi/src/assets/covers/eldenring.jpg
""", shell=True, check=True)

# 3. The Witcher 3: Gloomy dark forest, crimson moon, mystical fog
subprocess.run("""
convert -size 600x900 xc:'#080405' \
  \\( -size 600x600 radial-gradient:'#a11212'-'transparent' -geometry +0-100 \\) -composite \
  \\( -size 600x600 xc:transparent -fill '#b51a1a' -draw 'circle 300,220 300,290' -blur 0x10 \\) -composite \
  \\( -size 600x600 xc:transparent -fill '#f5dddd' -draw 'circle 300,220 300,290' \\) -composite \
  \\( -size 600x500 xc:transparent -fill '#060303' -draw 'polygon 0,500 0,180 60,120 120,240 200,100 280,260 360,110 440,210 520,90 600,170 600,500' -geometry +0+450 \\) -composite \
  /home/qlat/Dev/Glibi/src/assets/covers/witcher3.jpg
""", shell=True, check=True)

# 4. Red Dead Redemption II: Dramatic western sunset, canyon silhouettes, birds
subprocess.run("""
convert -size 600x900 xc:'#7c0f0f' \
  \\( -size 600x600 gradient:'#f39c12'-'#7c0f0f' -geometry +0+0 \\) -composite \
  \\( -size 600x600 xc:transparent -fill '#fff2a8' -draw 'circle 300,260 300,340' -blur 0x6 \\) -composite \
  \\( -size 600x600 xc:transparent -fill '#0c0404' -draw 'polygon 0,600 0,380 140,280 260,350 400,240 520,320 600,260 600,600' -geometry +0+350 \\) -composite \
  /home/qlat/Dev/Glibi/src/assets/covers/rdr2.jpg
""", shell=True, check=True)

# 5. Hades II: Underworld river Styx, ethereal green flame
subprocess.run("""
convert -size 600x900 xc:'#020d08' \
  \\( -size 600x650 radial-gradient:'#0ee693'-'transparent' -geometry +0-50 \\) -composite \
  \\( -size 600x700 xc:transparent -fill none -stroke '#52b788' -strokewidth 5 -draw 'ellipse 300,280 120,180 0,360' -blur 0x8 \\) -composite \
  \\( -size 600x700 xc:transparent -fill '#d4af37' -draw 'polygon 300,140 330,300 300,280 270,300' \\) -composite \
  \\( -size 600x400 xc:transparent -fill '#010805' -draw 'polygon 0,400 0,140 200,200 400,120 600,180 600,400' -geometry +0+550 \\) -composite \
  /home/qlat/Dev/Glibi/src/assets/covers/hades2.jpg
""", shell=True, check=True)

# 6. God of War Ragnarök: Midgard icy blizzard, Norse blue aurora
subprocess.run("""
convert -size 600x900 xc:'#04080e' \
  \\( -size 600x650 radial-gradient:'#38bdf8'-'transparent' -geometry +0-80 \\) -composite \
  \\( -size 600x600 xc:transparent -stroke '#7dd3fc' -strokewidth 10 -fill none -draw 'circle 300,260 300,360' -blur 0x12 \\) -composite \
  \\( -size 600x600 xc:transparent -stroke '#e0f2fe' -strokewidth 4 -fill none -draw 'circle 300,260 300,360' \\) -composite \
  \\( -size 600x450 xc:transparent -fill '#03060a' -draw 'polygon 0,450 0,160 160,240 300,120 440,220 600,150 600,450' -geometry +0+480 \\) -composite \
  /home/qlat/Dev/Glibi/src/assets/covers/godofwar.jpg
""", shell=True, check=True)

# 7. Baldur's Gate 3: Mind Flayer mystic purple aura & astral vortex
subprocess.run("""
convert -size 600x900 xc:'#09040e' \
  \\( -size 600x650 radial-gradient:'#a855f7'-'transparent' -geometry +0-60 \\) -composite \
  \\( -size 600x600 xc:transparent -stroke '#c084fc' -strokewidth 6 -fill none -draw 'polygon 300,120 420,240 380,400 220,400 180,240' -blur 0x10 \\) -composite \
  \\( -size 600x600 xc:transparent -stroke '#f3e8ff' -strokewidth 2 -fill none -draw 'polygon 300,120 420,240 380,400 220,400 180,240' \\) -composite \
  \\( -size 600x450 xc:transparent -fill '#050208' -draw 'polygon 0,450 0,180 200,260 300,140 450,230 600,170 600,450' -geometry +0+500 \\) -composite \
  /home/qlat/Dev/Glibi/src/assets/covers/baldursgate3.jpg
""", shell=True, check=True)

# 8. Minecraft: Isometric lush green block & sunset sky
subprocess.run("""
convert -size 600x900 xc:'#0f1a12' \
  \\( -size 600x600 gradient:'#4ade80'-'#15803d' -geometry +0+0 -blur 0x50 \\) -composite \
  \\( -size 600x600 xc:transparent -fill '#84cc16' -draw 'polygon 300,180 440,250 300,320 160,250' \\) -composite \
  \\( -size 600x600 xc:transparent -fill '#5a3d28' -draw 'polygon 160,250 300,320 300,460 160,390' \\) -composite \
  \\( -size 600x600 xc:transparent -fill '#432d1e' -draw 'polygon 300,320 440,250 440,390 300,460' \\) -composite \
  \\( -size 600x400 gradient:'transparent'-'#070c08' -geometry +0+500 \\) -composite \
  /home/qlat/Dev/Glibi/src/assets/covers/minecraft.jpg
""", shell=True, check=True)

# 9. Grand Theft Auto V: Los Santos palm silhouettes & golden hour gradient
subprocess.run("""
convert -size 600x900 xc:'#13091f' \
  \\( -size 600x600 gradient:'#f43f5e'-'#fbbf24' -geometry +0+0 \\) -composite \
  \\( -size 600x600 xc:transparent -fill '#09040f' -draw 'polygon 0,600 0,420 180,340 340,430 480,330 600,390 600,600' -geometry +0+350 \\) -composite \
  \\( -size 600x600 xc:transparent -fill '#09040f' -draw 'rectangle 140,200 155,550 rectangle 440,160 455,550' \\) -composite \
  /home/qlat/Dev/Glibi/src/assets/covers/gtav.jpg
""", shell=True, check=True)

# 10. Forza Horizon 5: Horizon highway speed trails & vibrant dusk sky
subprocess.run("""
convert -size 600x900 xc:'#120716' \
  \\( -size 600x600 gradient:'#ec4899'-'#06b6d4' -geometry +0+0 -blur 0x60 \\) -composite \
  \\( -size 600x700 xc:transparent -fill '#f43f5e' -draw 'line 0,700 300,260' -stroke '#f43f5e' -strokewidth 12 -blur 0x12 \\) -composite \
  \\( -size 600x700 xc:transparent -fill '#38bdf8' -draw 'line 600,700 300,260' -stroke '#38bdf8' -strokewidth 12 -blur 0x12 \\) -composite \
  \\( -size 600x500 gradient:'transparent'-'#08030b' -geometry +0+450 \\) -composite \
  /home/qlat/Dev/Glibi/src/assets/covers/forza5.jpg
""", shell=True, check=True)

print("Pure artworks generated successfully!")
