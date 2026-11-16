/**
 * Steam Catalog Service
 * Steam ve SteamSpy üzerinden en popüler ücretli, kırılmış oyunları dinamik olarak çeker.
 * Ücretsiz (Free-to-Play) oyunlar SteamRIP launcher'ında listelenmez.
 */

export interface CatalogGame {
  id: string;
  appId: number;
  title: string;
}

// Bilinen Ücretsiz (Free-to-Play) oyun ID'leri kara listesi
export const FREE_TO_PLAY_APP_IDS = new Set([
  730,     // CS2
  570,     // Dota 2
  578080,  // PUBG: BATTLEGROUNDS
  1172470, // Apex Legends
  440,     // Team Fortress 2
  230410,  // Warframe
  304930,  // Unturned
  1085660, // Destiny 2
  238960,  // Path of Exile
  2694490, // Path of Exile 2
  2073850, // THE FINALS
  1938090, // Call of Duty HQ / Warzone
  2767030, // Marvel Rivals
  1599340, // Lost Ark
  291550,  // Brawlhalla
  1407200, // World of Tanks
  236390,  // War Thunder
  1677740, // Stumble Guys
  1782210, // Crab Game
  2709570, // Supermarket Together
  223750,  // DCS World
  225840,  // Sven Co-op
  224260,  // No More Room in Hell
  218230,  // PlanetSide 2
  211500,  // RaceRoom
  113400,  // APB Reloaded
  109600,  // Neverwinter
  304050,  // Trove
  1665460, // eFootball
  1721470, // Poppy Playtime
]);

// Varsayılan zengin ÇEKİRDEK ÜCRETLİ OYUN LİSTESİ (Crack / SteamRIP odaklı)
export const DEFAULT_POPULAR_GAMES: CatalogGame[] = [
  { id: "blackmyth", appId: 2358720, title: "Black Myth: Wukong" },
  { id: "helldivers2", appId: 553850, title: "HELLDIVERS™ 2" },
  { id: "baldursgate3", appId: 1086940, title: "Baldur's Gate 3" },
  { id: "cyberpunk2077", appId: 1091500, title: "Cyberpunk 2077" },
  { id: "eldenring", appId: 1245620, title: "Elden Ring" },
  { id: "witcher3", appId: 292030, title: "The Witcher 3: Wild Hunt" },
  { id: "rdr2", appId: 1174180, title: "Red Dead Redemption II" },
  { id: "godofwar", appId: 1593500, title: "God of War Ragnarök" },
  { id: "hades2", appId: 1145350, title: "Hades II" },
  { id: "palworld", appId: 1623730, title: "Palworld" },
  { id: "rust", appId: 252490, title: "Rust" },
  { id: "gtav", appId: 271590, title: "Grand Theft Auto V" },
  { id: "forza5", appId: 1551360, title: "Forza Horizon 5" },
  { id: "ets2", appId: 227300, title: "Euro Truck Simulator 2" },
  { id: "lethalcompany", appId: 1966720, title: "Lethal Company" },
  { id: "terraria", appId: 105600, title: "Terraria" },
  { id: "stardewvalley", appId: 413150, title: "Stardew Valley" },
  { id: "skyrim", appId: 489830, title: "The Elder Scrolls V: Skyrim Special Edition" },
  { id: "monsterhunter", appId: 582010, title: "Monster Hunter: World" },
  { id: "seaofthieves", appId: 1172620, title: "Sea of Thieves" },
  { id: "hollowknight", appId: 367520, title: "Hollow Knight" },
  { id: "factorio", appId: 427520, title: "Factorio" },
  { id: "subnautica", appId: 264710, title: "Subnautica" },
  { id: "valheim", appId: 892970, title: "Valheim" },
  { id: "phasmophobia", appId: 739630, title: "Phasmophobia" },
  { id: "projectzomboid", appId: 108600, title: "Project Zomboid" },
  { id: "arma3", appId: 107410, title: "Arma 3" },
  { id: "borderlands2", appId: 49520, title: "Borderlands 2" },
  { id: "bioshockinfinite", appId: 8870, title: "BioShock Infinite" },
  { id: "tombraider", appId: 203160, title: "Tomb Raider" },
  { id: "portal2", appId: 620, title: "Portal 2" },
  { id: "garrysmod", appId: 4000, title: "Garry's Mod" },
  { id: "fallout4", appId: 377160, title: "Fallout 4" },
  { id: "payday2", appId: 218620, title: "PAYDAY 2" },
  { id: "left4dead2", appId: 550, title: "Left 4 Dead 2" },
  { id: "hl2", appId: 220, title: "Half-Life 2" },
];

let catalogCache: CatalogGame[] | null = null;

/**
 * SteamSpy Top 100 API'si üzerinden sadece ÜCRETLİ (cracked/indirilebilir) oyunları çeker.
 */
export async function fetchTopSteamGames(): Promise<CatalogGame[]> {
  if (catalogCache && catalogCache.length > 0) {
    return catalogCache;
  }

  try {
    const res = await fetch("https://steamspy.com/api.php?request=top100in2weeks");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const games: CatalogGame[] = Object.values(data)
      .filter((item: any) => {
        const appId = Number(item.appid);
        const price = String(item.price || "0");
        // Bedava oyunları ve bilinen F2P oyunları temizle
        if (FREE_TO_PLAY_APP_IDS.has(appId)) return false;
        if (price === "0" && !item.initialprice) return false;
        return true;
      })
      .map((item: any) => ({
        id: `steam_${item.appid}`,
        appId: Number(item.appid),
        title: item.name,
      }));

    if (games.length > 0) {
      catalogCache = games;
      return games;
    }
  } catch (err) {
    console.warn("SteamSpy top games fetch error, using default full catalog", err);
  }

  return DEFAULT_POPULAR_GAMES;
}

/**
 * Steam Store Search API üzerinden oyun arar (F2P oyunları filtreler)
 */
export async function searchSteamStore(query: string): Promise<CatalogGame[]> {
  if (!query.trim()) return [];

  try {
    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(
      query
    )}&l=turkish&cc=TR`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.items && json.items.length > 0) {
      return json.items
        .filter((item: any) => !FREE_TO_PLAY_APP_IDS.has(Number(item.id)))
        .map((item: any) => ({
          id: `steam_${item.id}`,
          appId: Number(item.id),
          title: item.name,
        }));
    }
  } catch (err) {
    console.warn("Steam search API error, falling back to local filter", err);
  }

  const full = catalogCache || DEFAULT_POPULAR_GAMES;
  return full.filter(
    (g) => !FREE_TO_PLAY_APP_IDS.has(g.appId) && g.title.toLowerCase().includes(query.toLowerCase())
  );
}
