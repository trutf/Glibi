import steamripData from "../data/steamrip_catalog.json";

export interface CatalogGame {
  id: string;
  appId: number;
  title: string;
  ripUrl?: string;
}

// Bilinen F2P kara listesi
export const FREE_TO_PLAY_APP_IDS = new Set([
  730, 570, 578080, 1172470, 440, 230410, 304930, 1085660, 238960, 2694490, 2073850, 1938090, 2767030,
  1599340, 291550, 1407200, 236390, 1677740, 1782210, 2709570, 223750, 225840, 224260, 218230, 211500,
]);

// Popüler bilinen oyunların AppID haritası
const KNOWN_APP_IDS: Record<string, number> = {
  "black myth: wukong": 2358720,
  "helldivers 2": 553850,
  "baldurs gate 3": 1086940,
  "baldur's gate 3": 1086940,
  "cyberpunk 2077": 1091500,
  "elden ring": 1245620,
  "the witcher 3: wild hunt": 292030,
  "red dead redemption 2": 1174180,
  "red dead redemption ii": 1174180,
  "god of war ragnarok": 1593500,
  "god of war ragnarök": 1593500,
  "god of war": 1593500,
  "hades ii": 1145350,
  "hades 2": 1145350,
  "palworld": 1623730,
  "rust": 252490,
  "grand theft auto v": 271590,
  "gta v": 271590,
  "forza horizon 5": 1551360,
  "euro truck simulator 2": 227300,
  "lethal company": 1966720,
  "terraria": 105600,
  "stardew valley": 413150,
  "the elder scrolls v: skyrim special edition": 489830,
  "skyrim": 489830,
  "monster hunter: world": 582010,
  "sea of thieves": 1172620,
  "hollow knight": 367520,
  "factorio": 427520,
  "subnautica": 264710,
  "valheim": 892970,
  "phasmophobia": 739630,
  "project zomboid": 108600,
  "arma 3": 107410,
  "borderlands 2": 49520,
  "bioshock infinite": 8870,
  "tomb raider": 203160,
  "portal 2": 620,
  "garry's mod": 4000,
  "fallout 4": 377160,
  "payday 2": 218620,
  "left 4 dead 2": 550,
  "half-life 2": 220,
  "geometry dash": 322170,
  "dead cells": 588650,
  "cuphead": 268910,
  "celeste": 504230,
  "undertale": 391540,
  "sekiro: shadows die twice": 814380,
  "dark souls iii": 374320,
  "sifu": 2138710,
  "lies of p": 1627720,
};

// SteamRIP'teki TÜM 4,973 oyunu Store kataloğuna dönüştür
export const ALL_STEAMRIP_GAMES: CatalogGame[] = (steamripData as any[]).map((item, index) => {
  const lower = item.title.toLowerCase().trim();
  let appId = KNOWN_APP_IDS[lower] || 0;

  if (!appId) {
    for (const [key, id] of Object.entries(KNOWN_APP_IDS)) {
      if (lower.includes(key) || key.includes(lower)) {
        appId = id;
        break;
      }
    }
  }

  // Hash ile deterministik fallback appId
  if (!appId) {
    let hash = 0;
    for (let i = 0; i < lower.length; i++) {
      hash = (hash << 5) - hash + lower.charCodeAt(i);
      hash |= 0;
    }
    appId = Math.abs(hash) % 900000 + 100000;
  }

  const safeId = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return {
    id: `rip_${index}_${safeId}`,
    appId,
    title: item.title,
    ripUrl: item.ripUrl,
  };
});

export const DEFAULT_POPULAR_GAMES: CatalogGame[] = ALL_STEAMRIP_GAMES.slice(0, 500);

export async function fetchTopSteamGames(): Promise<CatalogGame[]> {
  return ALL_STEAMRIP_GAMES;
}

export async function searchSteamStore(query: string): Promise<CatalogGame[]> {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_STEAMRIP_GAMES.slice(0, 72);

  return ALL_STEAMRIP_GAMES.filter((g) => g.title.toLowerCase().includes(q));
}
