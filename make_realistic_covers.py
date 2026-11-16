import subprocess
import os

os.makedirs("/home/qlat/Dev/Glibi/src/assets/covers", exist_ok=True)

# Helper to generate rich realistic posters with ImageMagick convert
# 600x900 dimension (Steam library portrait standard)

# 1. Cyberpunk 2077: Dark night city skyline, neon glow, samurai text, yellow accent
subprocess.run("""
convert -size 600x900 xc:'#07070a' \
  \\( -size 600x450 gradient:'#00f0ff'-'#ff0055' -blur 0x80 -level 0,80% -geometry +0+0 \\) -composite \
  \\( -size 600x900 gradient:'transparent'-'#07070a' -geometry +0+0 \\) -composite \
  -fill '#fee801' -font 'DejaVu-Sans-Bold' -pointsize 42 -gravity center -annotate +0-80 'CYBERPUNK' \
  -fill '#ffffff' -font 'DejaVu-Sans-Bold' -pointsize 64 -gravity center -annotate +0-20 '2077' \
  -fill '#00f0ff' -font 'DejaVu-Sans' -pointsize 15 -gravity center -annotate +0+40 'NIGHT CITY EDITION' \
  -fill '#33333f' -draw 'rectangle 100,530 500,532' \
  -fill '#fee801' -draw 'rectangle 250,528 350,534' \
  /home/qlat/Dev/Glibi/src/assets/covers/cyberpunk2077.jpg
""", shell=True, check=True)

# 2. Elden Ring: Erdtree golden glow, dark mist
subprocess.run("""
convert -size 600x900 xc:'#0b0c0a' \
  \\( -size 600x500 radial-gradient:'#ffd768'-'transparent' -geometry +0-100 \\) -composite \
  \\( -size 600x900 gradient:'transparent'-'#060706' -geometry +0+0 \\) -composite \
  -fill '#f0d890' -font 'DejaVu-Serif' -pointsize 48 -gravity center -annotate +0-40 'ELDEN RING' \
  -fill '#9a8755' -font 'DejaVu-Serif' -pointsize 14 -gravity center -annotate +0+25 'SHADOW OF THE ERDTREE' \
  -stroke '#b3984c' -strokewidth 2 -fill none -draw 'circle 300,380 300,460' \
  -stroke '#b3984c' -strokewidth 2 -fill none -draw 'circle 300,430 300,510' \
  -stroke none \
  /home/qlat/Dev/Glibi/src/assets/covers/eldenring.jpg
""", shell=True, check=True)

# 3. The Witcher 3: Wild Hunt - deep crimson, dark fantasy
subprocess.run("""
convert -size 600x900 xc:'#0c0707' \
  \\( -size 600x550 radial-gradient:'#a11212'-'transparent' -geometry +0-80 \\) -composite \
  \\( -size 600x900 gradient:'transparent'-'#0a0505' -geometry +0+0 \\) -composite \
  -fill '#e6e6e6' -font 'DejaVu-Serif-Bold' -pointsize 40 -gravity center -annotate +0-50 'THE WITCHER 3' \
  -fill '#b52323' -font 'DejaVu-Sans-Bold' -pointsize 20 -gravity center -annotate +0+10 'WILD HUNT' \
  -fill '#888888' -font 'DejaVu-Sans' -pointsize 13 -gravity center -annotate +0+45 'GAME OF THE YEAR EDITION' \
  /home/qlat/Dev/Glibi/src/assets/covers/witcher3.jpg
""", shell=True, check=True)

# 4. Red Dead Redemption II: Sunset orange/red, silhouette mountain
subprocess.run("""
convert -size 600x900 xc:'#851010' \
  \\( -size 600x600 gradient:'#f39c12'-'#7c0f0f' -geometry +0+0 \\) -composite \
  \\( -size 600x500 gradient:'transparent'-'#0d0404' -geometry +0+400 \\) -composite \
  -fill '#ffffff' -font 'DejaVu-Serif-Bold' -pointsize 34 -gravity center -annotate +0-60 'RED DEAD' \
  -fill '#ffffff' -font 'DejaVu-Serif-Bold' -pointsize 36 -gravity center -annotate +0-15 'REDEMPTION' \
  -fill '#f1c40f' -font 'DejaVu-Serif-Bold' -pointsize 52 -gravity center -annotate +0+40 'II' \
  -fill '#0d0404' -draw 'polygon 0,900 150,750 300,800 450,720 600,820 600,900' \
  /home/qlat/Dev/Glibi/src/assets/covers/rdr2.jpg
""", shell=True, check=True)

# 5. Hades II: Underworld emerald & gold
subprocess.run("""
convert -size 600x900 xc:'#03130d' \
  \\( -size 600x600 radial-gradient:'#0ee693'-'transparent' -geometry +0-60 \\) -composite \
  \\( -size 600x900 gradient:'transparent'-'#020b07' -geometry +0+0 \\) -composite \
  -fill '#e3fdef' -font 'DejaVu-Serif-Bold' -pointsize 54 -gravity center -annotate +0-40 'HADES' \
  -fill '#d4af37' -font 'DejaVu-Serif-Bold' -pointsize 44 -gravity center -annotate +0+25 'II' \
  -fill '#52b788' -font 'DejaVu-Sans' -pointsize 13 -gravity center -annotate +0+80 'SUPERGIANT GAMES' \
  /home/qlat/Dev/Glibi/src/assets/covers/hades2.jpg
""", shell=True, check=True)

# 6. God of War Ragnarök: Glacial frost blue, Norse theme
subprocess.run("""
convert -size 600x900 xc:'#070d14' \
  \\( -size 600x600 radial-gradient:'#3a7bd5'-'transparent' -geometry +0-80 \\) -composite \
  \\( -size 600x900 gradient:'transparent'-'#04070a' -geometry +0+0 \\) -composite \
  -fill '#e0f2fe' -font 'DejaVu-Sans-Bold' -pointsize 40 -gravity center -annotate +0-40 'GOD OF WAR' \
  -fill '#38bdf8' -font 'DejaVu-Sans-Bold' -pointsize 22 -gravity center -annotate +0+15 'RAGNARÖK' \
  -stroke '#38bdf8' -strokewidth 2 -fill none -draw 'circle 300,420 300,490' \
  -stroke none \
  /home/qlat/Dev/Glibi/src/assets/covers/godofwar.jpg
""", shell=True, check=True)

# 7. Minecraft: Blocky green/brown gradient, iconic aesthetic
subprocess.run("""
convert -size 600x900 xc:'#191e14' \
  \\( -size 600x550 gradient:'#38761d'-'#191e14' -geometry +0+0 \\) -composite \
  \\( -size 600x500 gradient:'transparent'-'#12140e' -geometry +0+400 \\) -composite \
  -fill '#e2e8f0' -font 'DejaVu-Sans-Bold' -pointsize 46 -gravity center -annotate +0-30 'MINECRAFT' \
  -fill '#84cc16' -font 'DejaVu-Sans-Bold' -pointsize 16 -gravity center -annotate +0+25 'JAVA & BEDROCK' \
  /home/qlat/Dev/Glibi/src/assets/covers/minecraft.jpg
""", shell=True, check=True)

# 8. Baldur's Gate 3: Mind Flayer mystic violet & gold
subprocess.run("""
convert -size 600x900 xc:'#0f0717' \
  \\( -size 600x600 radial-gradient:'#8338ec'-'transparent' -geometry +0-80 \\) -composite \
  \\( -size 600x900 gradient:'transparent'-'#09040e' -geometry +0+0 \\) -composite \
  -fill '#f3e8ff' -font 'DejaVu-Serif-Bold' -pointsize 38 -gravity center -annotate +0-40 \"BALDUR'S GATE\" \
  -fill '#f59e0b' -font 'DejaVu-Serif-Bold' -pointsize 50 -gravity center -annotate +0+25 'III' \
  /home/qlat/Dev/Glibi/src/assets/covers/baldursgate3.jpg
""", shell=True, check=True)

# 9. Grand Theft Auto V
subprocess.run("""
convert -size 600x900 xc:'#0f1411' \
  \\( -size 600x600 gradient:'#2d5a3f'-'#0b100d' -geometry +0+0 \\) -composite \
  -fill '#ffffff' -font 'DejaVu-Sans-Bold' -pointsize 36 -gravity center -annotate +0-60 'GRAND THEFT AUTO' \
  -fill '#22c55e' -font 'DejaVu-Serif-Bold' -pointsize 72 -gravity center -annotate +0+10 'V' \
  /home/qlat/Dev/Glibi/src/assets/covers/gtav.jpg
""", shell=True, check=True)

# 10. Forza Horizon 5: Horizon pink & blue
subprocess.run("""
convert -size 600x900 xc:'#120a17' \
  \\( -size 600x600 gradient:'#ec4899'-'#3b82f6' -geometry +0+0 -blur 0x30 \\) -composite \
  \\( -size 600x900 gradient:'transparent'-'#0a060d' -geometry +0+0 \\) -composite \
  -fill '#ffffff' -font 'DejaVu-Sans-Bold' -pointsize 38 -gravity center -annotate +0-50 'FORZA HORIZON' \
  -fill '#f43f5e' -font 'DejaVu-Sans-Bold' -pointsize 60 -gravity center -annotate +0+15 '5' \
  /home/qlat/Dev/Glibi/src/assets/covers/forza5.jpg
""", shell=True, check=True)

print("Covers generated successfully!")
