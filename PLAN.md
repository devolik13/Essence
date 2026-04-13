# ESSENCE — Development Plan

## Phase 1: Playable Solo (~70% done)

### 1.1 Crafting & Equipment (critical)
- [x] 1. Crafting UI — workbench windows with recipes
- [x] 2. Vendor UI — shop window with tools
- [x] 3. Gathering cast bar — 3 sec cast, interrupted by combat
- [ ] 4. Equipment affects stats — armor/stat bonuses in damage calculation
- [ ] 5. More recipes — T2/T3 equipment for each workbench
- [ ] 6. Resource variety — T2-T3 nodes in elemental zones

### 1.2 Progression & Balance
- [ ] 7. Spell learning thresholds — verify all creatures teach correctly
- [ ] 8. Mob HP/damage balance per zone — village easy, elemental harder
- [ ] 9. Death penalty tuning — test and adjust
- [ ] ~~10. Potion consumption~~ — NOT PLANNED, no potions in design

### 1.3 Chapter 1 Content
- [ ] 11. Enable bosses — uncomment 4 bosses, test fights
- [ ] 12. Quest system UI — acceptance, descriptions, rewards
- [ ] 13. NPC dialogs — simple system: text + response options
- [x] 14. Mob loot drops — visible bags on ground, [E] to pickup, 60s despawn

### 1.4 World & Navigation
- [ ] 15. Minimap — show mobs, nodes, NPCs, exits
- [ ] 16. Quest markers — on minimap and screen (! and ?)
- [ ] 17. Resource nodes in elemental zones — T2 ore, wood, trophies
- [x] 18. Exit indicators — pulsing arrows appear within 400px of zone edge

### 1.5 Visuals
- [x] 19. Starter body sprites — warrior, mage done. Archer needed
- [ ] 20. Key mob sprites — goblin, wolf, bear, orc (at least idle)
- [ ] 21. Zone tiles — unique per element (lava, ice, stone, wind grass)
- [ ] 22. Death animation — mobs fall instead of just fading
- [ ] 23. Mob HP bars — larger, readable, with mob name

### 1.6 UI Polish
- [ ] 24. Tooltips on hover — spell icons, items, status effects
- [ ] 25. Spell bar drag-and-drop — rearrange abilities
- [ ] 26. Status panel — buff/debuff timers above player head
- [ ] 27. Character sheet — full stats + equipment view
- [ ] 28. Combat log — scrollable battle event log

### 1.7 Sound
- [ ] 29. Background music — different per zone (procedural or file)
- [ ] 30. Ambient sounds — wind, water, fire per zone
- [ ] 31. UI sounds — click, window open, equip
- [ ] 32. Mob voices — sound on aggro and death

---

## Phase 2: Full Solo Game (~30 hours gameplay)

### 2.1 Chapter 2 Content
- [ ] 33. New zones — 4-6 new locations, harder difficulty
- [ ] 34. T3 spells for player — rewards from Chapter 2 bosses
- [ ] 35. New mobs — 10-15 new creatures with unique abilities
- [ ] 36. Chapter 2 bosses — unique phases and mechanics
- [ ] 37. New weapons/bodies — rare creatures with unique stat caps

### 2.2 Additional Magic Schools
- [ ] 38. Poison — DoT + zones + anti-heal (5 spells)
- [ ] 39. Light — heal + anti-undead + purge (5 spells)
- [ ] 40. Darkness — debuffs + drain + % damage (5 spells)
- [ ] 41. Necromancy — undead summons + shields (5 spells)
- [ ] 42. Blood — lifesteal + sacrifice + reflect (5 spells)

### 2.3 Advanced Crafting
- [ ] 43. T2-T7 resources — 7 tiers per gathering profession
- [ ] 44. Runes — permanent enchantments on weapon/armor
- [ ] 45. Jewelry — rings/amulets with unique effects
- [ ] 46. Equipment upgrades — +1, +2, +3 on existing gear

### 2.4 Storage System
- [ ] 47. Player house — safe zone with storage
- [ ] 48. Body collection — one of each species in storage
- [ ] 49. Quick swap — switch between saved bodies at home

### 2.5 Exploration
- [ ] 50. Secret zones — hidden passages, dungeons
- [ ] 51. Rare mobs — spawn every X minutes, unique loot
- [ ] 52. Lore items — diaries, notes revealing story
- [ ] 53. Exploration achievements — visit all zones, find all secrets

---

## Phase 3: Multiplayer Basics

### 3.1 Architecture
- [ ] 54. Technology choice — WebSocket (Socket.io) or WebRTC
- [ ] 55. Server — Node.js with authoritative logic
- [ ] 56. Sync — positions, HP, mana, statuses
- [ ] 57. Anti-cheat — server-side damage/movement validation
- [ ] 58. Lag compensation — interpolation and prediction

### 3.2 Basic Multiplayer
- [ ] 59. Accounts — registration/login
- [ ] 60. Other player visibility — rendering other players' bodies
- [ ] 61. Chat — global + zone + private
- [ ] 62. Parties — invite, shared loot, group buffs
- [ ] 63. Co-op PvE — fighting mobs together

### 3.3 PvP
- [ ] 64. PvP flag — toggle in contested zones
- [ ] 65. Duels — challenge to fight
- [ ] 66. Free PvP zones — full chaos, rare bodies
- [ ] 67. Kill & capture body — core PvP mechanic
- [ ] 68. PvP rating/ranks — ladder

### 3.4 Economy
- [ ] 69. Player trading — trade window
- [ ] 70. Auction house — global marketplace
- [ ] 71. NPC vendors — buy/sell for gold
- [ ] 72. Currency system — copper/silver/gold/platinum

---

## Phase 4: Full MMO

### 4.1 Social Systems
- [ ] 73. Guilds/clans — creation, management, guild bank
- [ ] 74. World events — server-wide bosses, everyone participates
- [ ] 75. Seasons — content rotation, new rewards
- [ ] 76. Leaderboards — top by rank, PvP, achievements

### 4.2 Endgame
- [ ] 77. Dungeons — instanced group content
- [ ] 78. Raids — 10-20 player bosses
- [ ] 79. Return home — Chapter 4, steam world, final bosses
- [ ] 80. Astral armor — endgame crafting for Sphere

### 4.3 Monetization (if F2P)
- [ ] 81. Sphere customization — color, aura, effects
- [ ] 82. Cosmetics — body skins (not P2W)
- [ ] 83. Season pass — rewards for activity
- [ ] 84. Storage expansion — extra slots

---

## Quick Priority for Demo

| # | Task | Impact |
|---|------|--------|
| 19 | Archer sprite (3 starter bodies complete) | High |
| 4 | Equipment affects stats | High |
| 11 | Enable bosses | High |
| 22 | Mob death animation | Medium |
| 29 | Background music | Medium |
| 3 | Gathering cast bar | Medium |
| 24 | Tooltips on hover | Medium |
