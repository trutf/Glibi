/**
 * Steam Catalog Service
 * Steam ve SteamSpy üzerinden en popüler, en çok oynanan ve aranan tüm oyunları dinamik olarak çeker.
 */

export interface CatalogGame {
  id: string;
  appId: number;
  title: string;
}

// Varsayılan zengin çekirdek liste (çevrimdışı ve ilk açılış için)
export const DEFAULT_POPULAR_GAMES: CatalogGame[] = [
  { id: "cs2", appId: 730, title: "Counter-Strike 2" },
  { id: "dota2", appId: 570, title: "Dota 2" },
  { id: "pubg", appId: 578080, title: "PUBG: BATTLEGROUNDS" },
  { id: "apex", appId: 1172470, title: "Apex Legends" },
  { id: "helldivers2", appId: 553850, title: "HELLDIVERS™ 2" },
  { id: "blackmyth", appId: 2358720, title: "Black Myth: Wukong" },
  { id: "baldursgate3", appId: 1086940, title: "Baldur's Gate 3" },
  { id: "rust", appId: 252490, title: "Rust" },
  { id: "palworld", appId: 1623730, title: "Palworld" },
  { id: "tf2", appId: 440, title: "Team Fortress 2" },
  { id: "gtav", appId: 271590, title: "Grand Theft Auto V" },
  { id: "eldenring", appId: 1245620, title: "Elden Ring" },
  { id: "ets2", appId: 227300, title: "Euro Truck Simulator 2" },
  { id: "cyberpunk2077", appId: 1091500, title: "Cyberpunk 2077" },
  { id: "witcher3", appId: 292030, title: "The Witcher 3: Wild Hunt" },
  { id: "rdr2", appId: 1174180, title: "Red Dead Redemption II" },
  { id: "hades2", appId: 1145350, title: "Hades II" },
  { id: "godofwar", appId: 1593500, title: "God of War Ragnarök" },
  { id: "forza5", appId: 1551360, title: "Forza Horizon 5" },
  { id: "lethalcompany", appId: 1966720, title: "Lethal Company" },
  { id: "terraria", appId: 105600, title: "Terraria" },
  { id: "stardewvalley", appId: 413150, title: "Stardew Valley" },
  { id: "rainbowsix", appId: 359550, title: "Tom Clancy's Rainbow Six Siege" },
  { id: "warframe", appId: 230410, title: "Warframe" },
  { id: "deadbydaylight", appId: 381210, title: "Dead by Daylight" },
  { id: "monsterhunter", appId: 582010, title: "Monster Hunter: World" },
  { id: "seaofthieves", appId: 1172620, title: "Sea of Thieves" },
  { id: "hollowknight", appId: 367520, title: "Hollow Knight" },
  { id: "factorio", appId: 427520, title: "Factorio" },
  { id: "subnautica", appId: 264710, title: "Subnautica" },
  { id: "destiny2", appId: 1085660, title: "Destiny 2" },
  { id: "ark", appId: 346110, title: "ARK: Survival Evolved" },
  { id: "dayz", appId: 221100, title: "DayZ" },
  { id: "valheim", appId: 892970, title: "Valheim" },
  { id: "phasmophobia", appId: 739630, title: "Phasmophobia" },
  { id: "unturned", appId: 304930, title: "Unturned" },
  { id: "garrysmod", appId: 4000, title: "Garry's Mod" },
  { id: "payday2", appId: 218620, title: "PAYDAY 2" },
  { id: "fallout4", appId: 377160, title: "Fallout 4" },
  { id: "skyrim", appId: 489830, title: "The Elder Scrolls V: Skyrim Special Edition" },
];

let catalogCache: CatalogGame[] | null = null;

/**
 * SteamSpy Top 100 API'si üzerinden Steam'deki en çok oynanan 100+ oyunu çeker.
 */
export async function fetchTopSteamGames(): Promise<CatalogGame[]> {
  if (catalogCache && catalogCache.length > 0) {
    return catalogCache;
  }

  try {
    const res = await fetch("https://steamspy.com/api.php?request=top100in2weeks");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const games: CatalogGame[] = Object.values(data).map((item: any) => ({
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
 * Steam Store Search API üzerinden herhangi bir oyunu arar.
 * Kullanıcı alt arama yerine ne yazarsa Steam'deki tüm kataloğu canlı tarar.
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
      return json.items.map((item: any) => ({
        id: `steam_${item.id}`,
        appId: Number(item.id),
        title: item.name,
      }));
    }
  } catch (err) {
    console.warn("Steam search API error, falling back to local filter", err);
  }

  // Fallback: Yerel listede filtrele
  const full = catalogCache || DEFAULT_POPULAR_GAMES;
  return full.filter((g) => g.title.toLowerCase().includes(query.toLowerCase()));
}
