// ======================== ZOMBIE DIFFICULTY CONFIG ========================
// Standalone difficulty configuration for the zombie system.
// Loaded after config.js but before zombies.js.
//
// Each level (0–10) defines ABSOLUTE values and multipliers:
//   maxZombies   – hard cap on simultaneous zombies
//   spawnRate    – multiplier on spawn interval (higher = faster spawn)
//   crawlSpeed   – multiplier on base movement speed
//   shootChance  – probability (0–1) a zombie fires when ready
//   bulletSpeed  – multiplier on base bullet speed
//   angleSpread  – max random angle offset (radians) added to aim direction
//   shotCooldown – multiplier on cooldown between shots (lower = faster fire)
//   aimDuration  – multiplier on aim time before firing (lower = quicker aim)

const DIFFICULTY = {
  defaultLevel: 3,
  levels: [
    // 0 — OFF (no zombies)
    { maxZombies: 0,  spawnRate: 0,   crawlSpeed: 0,   shootChance: 0,    bulletSpeed: 0,   angleSpread: 0,    shotCooldown: 1,   aimDuration: 1   },
    // 1 — Peaceful (zombies wander, never shoot)
    { maxZombies: 2,  spawnRate: 0.3, crawlSpeed: 0.4, shootChance: 0,    bulletSpeed: 0.5, angleSpread: 0,    shotCooldown: 2.5, aimDuration: 2.5 },
    // 2 — Very Easy (rarely shoot, wide scatter)
    { maxZombies: 2,  spawnRate: 0.5, crawlSpeed: 0.6, shootChance: 0.15, bulletSpeed: 0.4, angleSpread: 1.2,  shotCooldown: 2.0, aimDuration: 2.0 },
    // 3 — Easy (sometimes shoot, loose aim)
    { maxZombies: 3,  spawnRate: 0.7, crawlSpeed: 0.8, shootChance: 0.3,  bulletSpeed: 0.6, angleSpread: 0.9,  shotCooldown: 1.8, aimDuration: 1.6 },
    // 4 — Normal- (shoot half the time)
    { maxZombies: 4,  spawnRate: 0.85,crawlSpeed: 0.9, shootChance: 0.5,  bulletSpeed: 0.8, angleSpread: 0.6,  shotCooldown: 1.4, aimDuration: 1.3 },
    // 5 — Normal
    { maxZombies: 4,  spawnRate: 1.0, crawlSpeed: 1.0, shootChance: 0.7,  bulletSpeed: 1.0, angleSpread: 0.4,  shotCooldown: 1.0, aimDuration: 1.0 },
    // 6 — Hard-
    { maxZombies: 5,  spawnRate: 1.3, crawlSpeed: 1.1, shootChance: 0.8,  bulletSpeed: 1.2, angleSpread: 0.3,  shotCooldown: 0.8, aimDuration: 0.85},
    // 7 — Hard
    { maxZombies: 6,  spawnRate: 1.6, crawlSpeed: 1.25,shootChance: 0.9,  bulletSpeed: 1.4, angleSpread: 0.2,  shotCooldown: 0.6, aimDuration: 0.7 },
    // 8 — Very Hard
    { maxZombies: 8,  spawnRate: 2.0, crawlSpeed: 1.4, shootChance: 1.0,  bulletSpeed: 1.7, angleSpread: 0.12, shotCooldown: 0.45,aimDuration: 0.5 },
    // 9 — Extreme
    { maxZombies: 10, spawnRate: 2.5, crawlSpeed: 1.6, shootChance: 1.0,  bulletSpeed: 2.0, angleSpread: 0.08, shotCooldown: 0.3, aimDuration: 0.35},
    // 10 — Nightmare
    { maxZombies: 14, spawnRate: 3.5, crawlSpeed: 2.0, shootChance: 1.0,  bulletSpeed: 2.5, angleSpread: 0.04, shotCooldown: 0.2, aimDuration: 0.2 },
  ],
};
