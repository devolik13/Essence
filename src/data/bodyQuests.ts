import { BodyQuestDef, ConflictQuestDef } from '../types/bodyQuests';

// ═══════════════════════════════════════════════════════════════
// T1 — Simple quests (animals, basic humanoids) → T1 spells
// ═══════════════════════════════════════════════════════════════


const QUEST_WOLF: BodyQuestDef = {
  id: 'bq_wolf', bodyId: 'wolf', tier: 1,
  nameRu: 'Pack Hunter',
  description: 'Hunt with the pack to prove yourself.',
  introMessages: [
    { speaker: '', text: 'Scents speak louder than words. The pack is hungry — two days without a kill.' },
    { speaker: '', text: 'The alpha watches. The young one must prove itself.' },
    { speaker: '', text: 'A deer was here an hour ago. The trail leads east.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The pack accepts you. The blade of instinct — yours now.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'deer', targetNameRu: 'Deer', description: 'Hunt 3 deer' },
  ],
  rewardSpellId: 'sword_strike',
  xpReward: 50,
};

const QUEST_BEAR: BodyQuestDef = {
  id: 'bq_bear', bodyId: 'bear', tier: 1,
  nameRu: 'Forest Fire',
  description: 'Kill the fire elementals before they burn the grove.',
  introMessages: [
    { speaker: '', text: 'Smoke. Wrong. The grove should not smell like this.' },
    { speaker: '', text: 'Two small fires crept in from the south. They\'re spreading.' },
    { speaker: '', text: 'Ten trees left before the den burns. Move.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The fires are out. The grove holds. The body taught you to crush.' },
  ],
  objectives: [
    { type: 'kill', count: 2, targetId: 'spark', targetNameRu: 'Forest Fire', description: 'Kill 2 fire elementals' },
  ],
  rewardSpellId: 'mace_strike',
  xpReward: 50,
};

// ═══════════════════════════════════════════════════════════════
// T1 — Humanoids (basic) → T1 weapon spells
// ═══════════════════════════════════════════════════════════════

const QUEST_GOBLIN: BodyQuestDef = {
  id: 'bq_goblin', bodyId: 'goblin', tier: 1,
  nameRu: 'Quick Fingers',
  description: 'Raid the hunting camp.',
  introMessages: [
    { speaker: '', text: 'Small body. Fast. Hungry.' },
    { speaker: '', text: 'The tribe waits at the edge. Need to bring something back.' },
    { speaker: '', text: 'Hunting camp nearby. Crates left unguarded.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The tribe eats tonight. Quick blade — yours to keep.' },
  ],
  objectives: [
    { type: 'steal', count: 3, targetId: 'camp_supplies', targetNameRu: 'Supplies', description: 'Steal 3 supply crates' },
  ],
  spawnObjects: [{
    objectId: 'camp_supplies', nameRu: 'Supplies', icon: '📦', color: 0xddaa33,
    type: 'collectible', count: 4, radius: 350,
  }],
  rewardSpellId: 'sting',
  xpReward: 50,
};

const QUEST_ORC: BodyQuestDef = {
  id: 'bq_orc', bodyId: 'orc', tier: 1,
  nameRu: 'Rite of Strength',
  description: 'Challenge the chieftain to a duel.',
  introMessages: [
    { speaker: '', text: 'Large body. Heavy. Strong.' },
    { speaker: '', text: 'The chieftain stands at the center. The tribe watches.' },
    { speaker: '', text: 'Only one way to prove yourself — challenge him.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The chieftain falls. The tribe kneels. The blade is yours.' },
  ],
  objectives: [
    { type: 'kill', count: 1, targetId: 'orc_veteran', targetNameRu: 'Chieftain', description: 'Defeat the chieftain' },
  ],
  friendlyCreatureIds: ['orc'],
  rewardSpellId: 'slash',
  xpReward: 50,
};

const QUEST_SCOUT: BodyQuestDef = {
  id: 'bq_scout', bodyId: 'scout', tier: 1,
  nameRu: 'Eyes on the Road',
  description: 'Scout the trade road for threats.',
  introMessages: [
    { speaker: '', text: 'Light body. Quiet. Used to the forest.' },
    { speaker: '', text: 'The trade caravan leaves at dawn tomorrow.' },
    { speaker: '', text: 'The road must be checked. Three points to scout.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The road is clear — for now. A keen eye is its own weapon.' },
  ],
  objectives: [
    { type: 'reach', count: 3, targetId: 'checkpoint', targetNameRu: 'Checkpoint', description: 'Check 3 waypoints' },
  ],
  spawnObjects: [{
    objectId: 'checkpoint', nameRu: 'Checkpoint', icon: '🔍', color: 0x55aaff,
    type: 'waypoint', count: 3, radius: 500,
  }],
  rewardSpellId: 'bow_shot',
  xpReward: 50,
};

const QUEST_SHAMAN: BodyQuestDef = {
  id: 'bq_shaman', bodyId: 'shaman', tier: 1,
  nameRu: 'Spirit Caller',
  description: 'Commune with the forest spirits.',
  introMessages: [
    { speaker: '', text: 'The world is full of voices. Trees speak. The wind carries names.' },
    { speaker: '', text: 'Night. Must go to the clearing and call.' },
    { speaker: '', text: 'Spirits only come to those who listen.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The spirits answered. Their gift — a companion from the woods.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'spirit_clearing', description: 'Reach the spirit clearing' },
    { type: 'survive', count: 30, description: 'Meditate for 30 seconds' },
  ],
  // TODO: replace with fixed map coordinates once clearing location is decided
  spawnObjects: [{
    objectId: 'spirit_clearing', nameRu: 'Spirit Clearing', icon: '🌀', color: 0x8866ff,
    type: 'waypoint', count: 1, radius: 450,
  }],
  rewardSpellId: 'mob_nature_t1',
  xpReward: 50,
};

// ═══════════════════════════════════════════════════════════════
// T1 — Elementals → T1 magic spells
// ═══════════════════════════════════════════════════════════════

const QUEST_SPARK: BodyQuestDef = {
  id: 'bq_spark', bodyId: 'spark', tier: 1,
  nameRu: 'First Flame',
  description: 'Burn 10 trees to prove the fire lives.',
  introMessages: [
    { speaker: '', text: 'Hot. Alive. This is what we are.' },
    { speaker: '', text: 'The trees stand cold and still. They don\'t know fire yet.' },
    { speaker: '', text: 'Show them.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Ten trees. The grove knows your name now. The spark is yours.' },
  ],
  objectives: [
    // TODO: spawn dry_tree destructibles in fire zone when implemented
    { type: 'destroy', count: 10, targetId: 'dry_tree', targetNameRu: 'Tree', description: 'Burn 10 trees' },
  ],
  rewardSpellId: 'mob_fire_t1',
  xpReward: 50,
};

const QUEST_SPLASHER: BodyQuestDef = {
  id: 'bq_splasher', bodyId: 'splasher', tier: 1,
  nameRu: 'Quench',
  description: 'Put out 5 burning trees.',
  introMessages: [
    { speaker: '', text: 'Fire. Wrong. It doesn\'t belong here.' },
    { speaker: '', text: 'Five trees burning at the edge of the lake.' },
    { speaker: '', text: 'Water fixes what fire breaks.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Cold. Quiet. The shore breathes again. Ice answers your call.' },
  ],
  objectives: [
    // TODO: spawn burning_tree destructibles near water zone edge
    { type: 'destroy', count: 5, targetId: 'burning_tree', targetNameRu: 'Burning Tree', description: 'Put out 5 burning trees' },
  ],
  rewardSpellId: 'mob_water_t1',
  xpReward: 50,
};

const QUEST_PEBBLE: BodyQuestDef = {
  id: 'bq_pebble', bodyId: 'pebble', tier: 1,
  nameRu: 'Become the Wall',
  description: 'Seal the breach in the cave.',
  introMessages: [
    { speaker: '', text: 'Heavy. Stable. Right.' },
    { speaker: '', text: 'There — a breach in the western cave wall.' },
    { speaker: '', text: 'Without it the vault will sag. Must take your place.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The wall holds. Stone remembers. Its weight — yours to throw.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'cave_breach', description: 'Reach the breach' },
  ],
  rewardSpellId: 'mob_earth_t1',
  xpReward: 50,
};

const QUEST_GUSTY: BodyQuestDef = {
  id: 'bq_gusty', bodyId: 'gusty', tier: 1,
  nameRu: 'Apex Predator',
  description: 'Hunt down another elemental.',
  introMessages: [
    { speaker: '', text: 'The wind doesn\'t wait. The wind doesn\'t ask.' },
    { speaker: '', text: 'Another elemental stirs nearby. Doesn\'t matter which.' },
    { speaker: '', text: 'Wind is fastest. Prove it.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Gone. The peaks are yours. The gust — yours to throw.' },
  ],
  objectives: [
    // targetId undefined = matches any kill (any elemental in the zone will do)
    { type: 'kill', count: 1, description: 'Hunt down any elemental' },
  ],
  rewardSpellId: 'mob_wind_t1',
  xpReward: 50,
};

// ═══════════════════════════════════════════════════════════════
// T2 — Bandits/advanced humanoids → T2 weapon spells
// ═══════════════════════════════════════════════════════════════

const QUEST_BANDIT_ARCHER: BodyQuestDef = {
  id: 'bq_bandit_archer', bodyId: 'bandit_archer', tier: 2,
  nameRu: 'Caravan Raid',
  description: 'Destroy the caravan and seize the cargo.',
  introMessages: [
    { speaker: '', text: 'Dust on the road. A caravan. Lightly guarded.' },
    { speaker: '', text: 'The boss nods: "Burn the cart. Take what\'s inside."' },
    { speaker: '', text: 'Arrows ready. Time to earn your share.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The cart burns. The cargo is yours. You learned to shoot and retreat.' },
  ],
  objectives: [
    { type: 'destroy', count: 1, targetId: 'caravan_cart', targetNameRu: 'Cart', description: 'Destroy the cart' },
    { type: 'collect', count: 1, targetId: 'caravan_cargo', targetNameRu: 'Cargo', description: 'Seize the cargo' },
  ],
  spawnObjects: [
    { objectId: 'caravan_cart', nameRu: 'Cart', icon: '🛒', color: 0x886633, type: 'destructible', count: 1, radius: 400 },
    { objectId: 'caravan_cargo', nameRu: 'Cargo', icon: '📦', color: 0xddaa33, type: 'collectible', count: 1, radius: 50 },
  ],
  rewardSpellId: 'longbow_shot',
  xpReward: 100,
};

const QUEST_BANDIT_CROSSBOW: BodyQuestDef = {
  id: 'bq_bandit_crossbow', bodyId: 'bandit_crossbow', tier: 2,
  nameRu: 'Lockbreaker',
  description: 'Break into the old fort.',
  introMessages: [
    { speaker: '', text: 'The boss points at the old fort gate.' },
    { speaker: '', text: 'A lock. Thick. Key\'s lost.' },
    { speaker: '', text: '"You\'re the best shot. Find a way."' },
  ],
  completeMessages: [
    { speaker: '', text: 'The lock is history. Precision has its rewards.' },
  ],
  objectives: [
    { type: 'destroy', count: 1, targetId: 'fort_lock', targetNameRu: 'Lock', description: 'Destroy the fort lock' },
    { type: 'kill', count: 2, targetId: 'fort_guard', targetNameRu: 'Fort guard', description: 'Deal with 2 fort guards' },
  ],
  rewardSpellId: 'crossbow_bolt',
  xpReward: 100,
};

const QUEST_BANDIT_SPEAR: BodyQuestDef = {
  id: 'bq_bandit_spear', bodyId: 'bandit_spear', tier: 2,
  nameRu: 'Caravan Raid',
  description: 'Destroy the caravan and seize the cargo.',
  introMessages: [
    { speaker: '', text: 'A caravan crawls along the road. Easy prey.' },
    { speaker: '', text: 'The boss points at the cart: "Smash it. Take everything."' },
    { speaker: '', text: 'Pike in hand. Simple work.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Splinters and loot. The pike strikes where it hurts.' },
  ],
  objectives: [
    { type: 'destroy', count: 1, targetId: 'caravan_cart', targetNameRu: 'Cart', description: 'Destroy the cart' },
    { type: 'collect', count: 1, targetId: 'caravan_cargo', targetNameRu: 'Cargo', description: 'Seize the cargo' },
  ],
  spawnObjects: [
    { objectId: 'caravan_cart', nameRu: 'Cart', icon: '🛒', color: 0x886633, type: 'destructible', count: 1, radius: 400 },
    { objectId: 'caravan_cargo', nameRu: 'Cargo', icon: '📦', color: 0xddaa33, type: 'collectible', count: 1, radius: 50 },
  ],
  rewardSpellId: 'spear_thrust',
  xpReward: 100,
};

const QUEST_BANDIT_BRUTE: BodyQuestDef = {
  id: 'bq_bandit_brute', bodyId: 'bandit_brute', tier: 2,
  nameRu: 'Demolition',
  description: 'Destroy the watchtower.',
  introMessages: [
    { speaker: '', text: 'The boss points at an old watchtower by the road.' },
    { speaker: '', text: '"The guards will use it. Knock it down."' },
    { speaker: '', text: 'Big body. Heavy hammer. Simple job.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Rubble. The earth shook. The hammer remembers.' },
  ],
  objectives: [
    { type: 'destroy', count: 1, targetId: 'watchtower', targetNameRu: 'Watchtower', description: 'Destroy the watchtower' },
  ],
  rewardSpellId: 'hammer_strike',
  xpReward: 100,
};

// ═══════════════════════════════════════════════════════════════
// T2 — Advanced elementals → T2 magic spells
// ═══════════════════════════════════════════════════════════════

const QUEST_ASHER: BodyQuestDef = {
  id: 'bq_asher', bodyId: 'asher', tier: 2,
  nameRu: 'Border Marks',
  description: 'Burn marks along the territorial border.',
  introMessages: [
    { speaker: '', text: 'Slow. Heavy. Ancient.' },
    { speaker: '', text: 'The western slope — not our territory. But something entered.' },
    { speaker: '', text: 'Smell of water. Must leave marks so they don\'t return.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The marks burn bright. None shall pass. Arrows of flame — yours.' },
  ],
  objectives: [
    { type: 'reach', count: 3, targetId: 'border_mark', targetNameRu: 'Border mark', description: 'Burn 3 border marks' },
    { type: 'kill', count: 2, targetId: 'splasher', targetNameRu: 'Water elemental', description: 'Repel 2 water intruders' },
  ],
  spawnObjects: [{
    objectId: 'border_mark', nameRu: 'Border Mark', icon: '🔥', color: 0xff6633,
    type: 'waypoint', count: 3, radius: 500,
  }],
  rewardSpellId: 'mob_fire_t2',
  xpReward: 100,
};

const QUEST_FOGGER: BodyQuestDef = {
  id: 'bq_fogger', bodyId: 'fogger', tier: 2,
  nameRu: 'Restore the Veil',
  description: 'Thicken the fog before the shore is exposed.',
  introMessages: [
    { speaker: '', text: 'The fog is thinning. This is wrong.' },
    { speaker: '', text: 'The sun breaks through. It shouldn\'t.' },
    { speaker: '', text: 'The northern shore is nearly visible. Must restore the veil.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The veil holds again. The lake keeps its secrets. Ice obeys.' },
  ],
  objectives: [
    { type: 'reach', count: 4, targetId: 'fog_node', targetNameRu: 'Fog Node', description: 'Restore 4 fog nodes' },
  ],
  spawnObjects: [{
    objectId: 'fog_node', nameRu: 'Fog Node', icon: '🌫️', color: 0x6699cc,
    type: 'waypoint', count: 4, radius: 550,
  }],
  rewardSpellId: 'mob_water_t2',
  xpReward: 100,
};

const QUEST_MUDDER: BodyQuestDef = {
  id: 'bq_mudder', bodyId: 'mudder', tier: 2,
  nameRu: 'Water Seeker',
  description: 'Reach the underground water source.',
  introMessages: [
    { speaker: '', text: 'Dry. Long dry.' },
    { speaker: '', text: 'Somewhere deeper there\'s water. You can feel it.' },
    { speaker: '', text: 'Must grow towards it. Through stone. Slowly.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Water found. The earth drinks. Stone spikes — yours to summon.' },
  ],
  objectives: [
    { type: 'destroy', count: 3, targetId: 'rock_wall', targetNameRu: 'Rock Layer', description: 'Break through 3 rock layers' },
    { type: 'reach', count: 1, targetId: 'water_source', targetNameRu: 'Water Source', description: 'Reach the water source' },
  ],
  spawnObjects: [
    { objectId: 'rock_wall', nameRu: 'Rock Layer', icon: '🪨', color: 0x886644, type: 'destructible', count: 3, radius: 400 },
    { objectId: 'water_source', nameRu: 'Water Source', icon: '💧', color: 0x4499dd, type: 'waypoint', count: 1, radius: 600 },
  ],
  rewardSpellId: 'mob_earth_t2',
  xpReward: 100,
};

const QUEST_WHISTLER: BodyQuestDef = {
  id: 'bq_whistler', bodyId: 'whistler', tier: 2,
  nameRu: 'Broken Song',
  description: 'Find and remove what cuts the wind\'s song.',
  introMessages: [
    { speaker: '', text: 'The wind should sing.' },
    { speaker: '', text: 'But today — it\'s off. Something cuts the song in half.' },
    { speaker: '', text: 'Somewhere on the southern slope. Must find it.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The song flows again. The wind cuts — both ways. Blades of air — yours.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'wind_blocker', description: 'Find the disturbance' },
    { type: 'destroy', count: 1, targetId: 'wind_blocker', targetNameRu: 'Obstruction', description: 'Remove it' },
  ],
  spawnObjects: [
    { objectId: 'wind_blocker', nameRu: 'Wind Disturbance', icon: '💨', color: 0x88aacc, type: 'waypoint', count: 1, radius: 500 },
    { objectId: 'wind_blocker', nameRu: 'Obstruction', icon: '🔩', color: 0x888888, type: 'destructible', count: 1, radius: 500 },
  ],
  rewardSpellId: 'mob_wind_t2',
  xpReward: 100,
};

const QUEST_SPIRIT_WOLF: BodyQuestDef = {
  id: 'bq_spirit_wolf', bodyId: 'spirit_wolf', tier: 2,
  nameRu: 'Forest Mercy',
  description: 'Find the wounded human in the forest.',
  introMessages: [
    { speaker: '', text: 'The forest speaks of pain. Somewhere nearby, someone lies still.' },
    { speaker: '', text: 'Not a beast. A human. Breathing hard.' },
    { speaker: '', text: 'The forest spirits do not let anyone die without reason.' },
  ],
  completeMessages: [
    { speaker: '', text: 'He lives. The spirits nod. Bark shields those who serve.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'wounded_human', description: 'Find the wounded human' },
    { type: 'protect', count: 1, targetId: 'wounded_human', targetNameRu: 'Wounded human', description: 'Protect him from predators' },
  ],
  rewardSpellId: 'mob_nature_t2',
  xpReward: 100,
};

// ═══════════════════════════════════════════════════════════════
// T2 — Veterans & new bodies → T2 weapon spells
// Paired events marked with ── ПАРА ──
// ═══════════════════════════════════════════════════════════════

// ── ПАРА: Рейд на лагерь (goblin_veteran атакует ↔ orc_veteran защищает) ──

const QUEST_GOBLIN_VETERAN: BodyQuestDef = {
  id: 'bq_goblin_veteran', bodyId: 'goblin_veteran', tier: 2,
  nameRu: 'Shadow Run',
  description: 'Raid the orc camp under cover of darkness.',
  introMessages: [
    { speaker: '', text: 'The orc camp sleeps. Almost.' },
    { speaker: '', text: 'Three valuables. The chieftain\'s tent.' },
    { speaker: '', text: 'Get in. Get out. Don\'t let them see your face.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Gone before they knew. The throwing blade — yours.' },
  ],
  objectives: [
    { type: 'steal', count: 3, targetId: 'orc_loot', targetNameRu: 'Loot', description: 'Steal 3 valuables from the orc camp' },
  ],
  spawnObjects: [{
    objectId: 'orc_loot', nameRu: 'Loot', icon: '💰', color: 0xddaa33,
    type: 'collectible', count: 4, radius: 300,
  }],
  rewardSpellId: 'knife_throw',
  xpReward: 100,
};

const QUEST_ORC_VETERAN: BodyQuestDef = {
  id: 'bq_orc_veteran', bodyId: 'orc_veteran', tier: 2,
  nameRu: 'Camp Warden',
  description: 'Drive out the goblin thieves before they empty the camp.',
  introMessages: [
    { speaker: '', text: 'Something slips through the shadows.' },
    { speaker: '', text: 'Goblins. Again.' },
    { speaker: '', text: 'The sweep clears them all at once.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Camp is clean. The wide arc — yours to keep.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'goblin', targetNameRu: 'Goblin', description: 'Kill 3 goblin thieves' },
  ],
  rewardSpellId: 'slash_sweep',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_orc',
};

// ── ПАРА: Лесной конфликт (wolf_veteran охотится ↔ bear_veteran защищает) ──

const QUEST_WOLF_VETERAN: BodyQuestDef = {
  id: 'bq_wolf_veteran', bodyId: 'wolf_veteran', tier: 2,
  nameRu: 'Two Strikes',
  description: 'Lead the pack hunt and prove your dominance.',
  introMessages: [
    { speaker: '', text: 'The pack is lean. Three days without a real kill.' },
    { speaker: '', text: 'A young one challenges you. Answer it.' },
    { speaker: '', text: 'The alpha strikes twice. Once for rank. Once for food.' },
  ],
  completeMessages: [
    { speaker: '', text: 'None questioned the second strike. The pack feeds.' },
  ],
  objectives: [
    { type: 'kill', count: 1, targetId: 'wolf', targetNameRu: 'Wolf', description: 'Defeat the challenger' },
    { type: 'kill', count: 2, targetId: 'deer', targetNameRu: 'Deer', description: 'Lead the hunt' },
  ],
  rewardSpellId: 'double_strike',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_wolf',
};

const QUEST_BEAR_VETERAN: BodyQuestDef = {
  id: 'bq_bear_veteran', bodyId: 'bear_veteran', tier: 2,
  nameRu: 'Old Wounds',
  description: 'Drive the wolf pack from the elder\'s territory.',
  introMessages: [
    { speaker: '', text: 'Old bones. Old scars.' },
    { speaker: '', text: 'Four wolves circling. They smell age.' },
    { speaker: '', text: 'They think age means slow. Show them otherwise.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The pack scattered. Old is not the same as weak.' },
  ],
  objectives: [
    { type: 'kill', count: 4, targetId: 'wolf', targetNameRu: 'Wolf', description: 'Drive off 4 wolves' },
  ],
  rewardSpellId: 'mace_bash',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_bear',
};

// ── ПАРА: Защита каравана (bandit_spear атакует ↔ caravan_guard защищает) ──
// ── (bandit_archer атакует ↔ scout_veteran подавляет лучников) ──

const QUEST_CARAVAN_GUARD: BodyQuestDef = {
  id: 'bq_caravan_guard', bodyId: 'caravan_guard', tier: 2,
  nameRu: 'Hold the Line',
  description: 'Push back the bandit spearmen before they reach the cart.',
  introMessages: [
    { speaker: '', text: 'The caravan rolls. You walk beside it.' },
    { speaker: '', text: 'Spearmen at the tree line. Three of them.' },
    { speaker: '', text: 'Push them back before they reach the cart.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The cart rolls on. The butt of the spear — as useful as the tip.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'bandit_spear', targetNameRu: 'Bandit Spearman', description: 'Drive off 3 spearmen' },
  ],
  rewardSpellId: 'spear_butt',
  xpReward: 100,
};

const QUEST_SCOUT_VETERAN: BodyQuestDef = {
  id: 'bq_scout_veteran', bodyId: 'scout_veteran', tier: 2,
  nameRu: 'Countermeasure',
  description: 'Take out the bandit archers before they burn the cart.',
  introMessages: [
    { speaker: '', text: 'Archers. Tree line, north side. Two of them.' },
    { speaker: '', text: 'They have the angle on the cart.' },
    { speaker: '', text: 'Shoot first. The jump keeps you from being a target.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Archers down. Jump back — let them shoot at air.' },
  ],
  objectives: [
    { type: 'kill', count: 2, targetId: 'bandit_archer', targetNameRu: 'Bandit Archer', description: 'Take down 2 bandit archers' },
  ],
  rewardSpellId: 'bow_backshot',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_scout',
};

// ── ОДИНОЧНЫЕ ──────────────────────────────────────────────────

const QUEST_MONKEY: BodyQuestDef = {
  id: 'bq_monkey', bodyId: 'monkey', tier: 2,
  nameRu: 'Troublemaker',
  description: 'Claim the high ground and scatter the intruders.',
  introMessages: [
    { speaker: '', text: 'High. Loud. This tree — your throne.' },
    { speaker: '', text: 'Strangers below. Too close to the troop.' },
    { speaker: '', text: 'Jump in. Hit first. Confuse them before they know what hit.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Scattered and confused. The disorienting blow — yours.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'high_branch', description: 'Claim the high branch' },
    { type: 'kill', count: 3, description: 'Scatter 3 intruders' },
  ],
  spawnObjects: [{
    objectId: 'high_branch', nameRu: 'High Branch', icon: '🌳', color: 0x44aa44,
    type: 'waypoint', count: 1, radius: 300,
  }],
  rewardSpellId: 'fist_strike',
  xpReward: 100,
  // TODO: add monkey to creatureDB (Fists weapon, Passive/Combat)
};

const QUEST_BANDIT_ARCHER_VET: BodyQuestDef = {
  id: 'bq_bandit_archer_veteran', bodyId: 'bandit_archer_veteran', tier: 2,
  nameRu: 'Rain of Arrows',
  description: 'Cover the retreat under suppressing fire.',
  introMessages: [
    { speaker: '', text: 'The camp is pulling back. Guards are closing in.' },
    { speaker: '', text: 'Hold the road. Wide coverage.' },
    { speaker: '', text: 'When one arrow isn\'t enough — send twenty.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The road held. The rain of arrows — yours.' },
  ],
  objectives: [
    { type: 'kill', count: 4, targetId: 'caravan_guard', targetNameRu: 'Guard', description: 'Hold back 4 guards' },
  ],
  rewardSpellId: 'arrow_rain',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_bandit_archer',
};

const QUEST_BANDIT_CROSSBOW_VET: BodyQuestDef = {
  id: 'bq_bandit_crossbow_veteran', bodyId: 'bandit_crossbow_veteran', tier: 2,
  nameRu: 'Pinned Down',
  description: 'Root the guards before they can regroup.',
  introMessages: [
    { speaker: '', text: 'Three guards. Fast. Too spread out for a volley.' },
    { speaker: '', text: 'Pin one. The others stop to help.' },
    { speaker: '', text: 'Then pin them too.' },
  ],
  completeMessages: [
    { speaker: '', text: 'None of them moved where they wanted. Control — yours.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'caravan_guard', targetNameRu: 'Guard', description: 'Pin down 3 guards' },
  ],
  rewardSpellId: 'crossbow_snare',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_bandit_crossbow',
};

const QUEST_BANDIT_SPEAR_VET: BodyQuestDef = {
  id: 'bq_bandit_spear_veteran', bodyId: 'bandit_spear_veteran', tier: 2,
  nameRu: 'Crowd Control',
  description: 'Keep multiple guards at bay with the butt of the spear.',
  introMessages: [
    { speaker: '', text: 'Four guards closing in from both sides.' },
    { speaker: '', text: 'The tip kills one. The butt controls four.' },
    { speaker: '', text: 'Knock them back before they can surround you.' },
  ],
  completeMessages: [
    { speaker: '', text: 'None got close enough. The back end of a spear is half the weapon.' },
  ],
  objectives: [
    { type: 'kill', count: 4, targetId: 'caravan_guard', targetNameRu: 'Guard', description: 'Push back 4 guards' },
  ],
  rewardSpellId: 'spear_butt',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_bandit_spear',
};

const QUEST_BANDIT_BRUTE_VET: BodyQuestDef = {
  id: 'bq_bandit_brute_veteran', bodyId: 'bandit_brute_veteran', tier: 2,
  nameRu: 'Berserker',
  description: 'Smash through the reinforcements\' heavy armor.',
  introMessages: [
    { speaker: '', text: 'Reinforcements. Three of them. Heavy armor.' },
    { speaker: '', text: 'The hammer doesn\'t care about armor.' },
    { speaker: '', text: 'Smash the plate. Then finish what\'s inside.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Three suits of armor. Now scrap. The heavy smash — yours.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'caravan_guard', targetNameRu: 'Guard', description: 'Crush 3 armored guards' },
  ],
  rewardSpellId: 'hammer_smash',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_bandit_brute',
};

// ═══════════════════════════════════════════════════════════════
// CONFLICT QUESTS — opposing sides, same event
// ═══════════════════════════════════════════════════════════════

export const CONFLICT_CARAVAN: ConflictQuestDef = {
  id: 'conflict_caravan',
  nameRu: 'The Caravan',
  description: 'A trade caravan crosses bandit territory. Both sides have a stake.',
  location: 'trade_road',
  sides: [
    {
      side: 'attacker',
      bodyIds: ['orc', 'goblin', 'bandit_brute'],
      objectiveDescription: 'Rob the caravan. Take the cargo.',
      npcCount: 6,
    },
    {
      side: 'defender',
      bodyIds: ['scout', 'bandit_spear'],
      objectiveDescription: 'Escort the caravan to safety.',
      npcCount: 4,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// T3 — Conflict quests → T3 weapon spells (hardest)
// ═══════════════════════════════════════════════════════════════

const QUEST_ORC_CARAVAN: BodyQuestDef = {
  id: 'bq_orc_caravan', bodyId: 'orc', tier: 3,
  nameRu: 'Caravan Raid',
  description: 'Lead the ambush on the trade caravan.',
  introMessages: [
    { speaker: 'Chieftain', text: 'The caravan crosses our land. They pay no tribute.' },
    { speaker: 'Chieftain', text: 'Take warriors. Bring back the cargo. Kill if you must.' },
    { speaker: '', text: 'Six warriors wait at the treeline. The dust of wheels rises on the road.' },
  ],
  completeMessages: [
    { speaker: 'Chieftain', text: 'Good. The clan feasts tonight. You\'ve earned the blood sweep.' },
  ],
  objectives: [
    { type: 'kill', count: 4, targetId: 'caravan_guard', targetNameRu: 'Caravan guard', description: 'Defeat 4 guards' },
    { type: 'steal', count: 1, targetId: 'caravan_cargo', targetNameRu: 'Cargo', description: 'Seize the cargo' },
  ],
  rewardSpellId: 'bloody_sweep',
  xpReward: 200,
  prerequisiteBodyQuestId: 'bq_orc',
  conflictQuestId: 'conflict_caravan',
};

const QUEST_SCOUT_ESCORT: BodyQuestDef = {
  id: 'bq_scout_escort', bodyId: 'scout', tier: 3,
  nameRu: 'Caravan Escort',
  description: 'Escort the trade caravan through bandit territory.',
  introMessages: [
    { speaker: 'Merchant', text: 'We need to cross the forest. Bandits have been seen.' },
    { speaker: 'Merchant', text: 'You know these paths. Lead us safely.' },
    { speaker: '', text: 'Four guards take positions. The caravan rolls forward.' },
  ],
  completeMessages: [
    { speaker: 'Merchant', text: 'We made it. You have the eyes of a hawk. This is yours.' },
  ],
  objectives: [
    { type: 'escort', count: 1, targetId: 'caravan', targetNameRu: 'Caravan', description: 'Escort the caravan' },
    { type: 'kill', count: 3, targetId: 'ambusher', targetNameRu: 'Ambusher', description: 'Repel 3 ambushers' },
  ],
  rewardSpellId: 'trap',
  xpReward: 200,
  prerequisiteBodyQuestId: 'bq_scout',
  conflictQuestId: 'conflict_caravan',
};

// ═══════════════════════════════════════════════════════════════
// T1 — New animals (hare, deer, fox, boar, grouse)
// ═══════════════════════════════════════════════════════════════

const QUEST_HARE: BodyQuestDef = {
  id: 'bq_hare', bodyId: 'hare', tier: 1,
  nameRu: 'Quick Paws',
  description: 'Gather carrots scattered nearby.',
  introMessages: [
    { speaker: '', text: 'Small. Fast. The world is full of giants.' },
    { speaker: '', text: 'But right now — hunger. The nose twitches. Carrots. Nearby.' },
    { speaker: '', text: 'Gather them before something bigger shows up.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Belly full. The body taught you to be quick — truly quick.' },
  ],
  objectives: [
    { type: 'collect', count: 5, targetId: 'carrot', targetNameRu: 'Carrot', description: 'Collect 5 carrots' },
  ],
  spawnObjects: [{
    objectId: 'carrot', nameRu: 'Carrot', icon: '🥕', color: 0xff8833,
    type: 'collectible', count: 6, radius: 300,
  }],
  rewardSpellId: 'acceleration',
  xpReward: 40,
};

const QUEST_DEER: BodyQuestDef = {
  id: 'bq_deer', bodyId: 'deer', tier: 1,
  nameRu: 'Fleet Foot',
  description: 'Reach the safe clearing before they catch you.',
  introMessages: [
    { speaker: '', text: 'Graceful legs. Wind in the fur. The meadow stretches wide.' },
    { speaker: '', text: 'Something is watching from the treeline. A clearing far ahead — safety.' },
    { speaker: '', text: 'Run. Don\'t look back.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Nothing could catch you. The wind itself taught you to dash.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'safe_clearing', targetNameRu: 'Safe Clearing', description: 'Reach the safe clearing' },
  ],
  spawnObjects: [{
    objectId: 'safe_clearing', nameRu: 'Safe Clearing', icon: '🌿', color: 0x44dd44,
    type: 'waypoint', count: 1, radius: 700,
  }],
  rewardSpellId: 'dash',
  xpReward: 40,
};

const QUEST_FOX: BodyQuestDef = {
  id: 'bq_fox', bodyId: 'fox', tier: 1,
  nameRu: 'Cunning Hunter',
  description: 'Hunt hares in the meadow.',
  introMessages: [
    { speaker: '', text: 'Sharp nose. Sharp mind. The meadow smells of hare.' },
    { speaker: '', text: 'They\'re fast — but not fast enough.' },
    { speaker: '', text: 'Three will do. The body knows what to do.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Quick and precise. The fox body taught you to disorient.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'hare', targetNameRu: 'Hare', description: 'Hunt 3 hares' },
  ],
  rewardSpellId: 'hook',
  xpReward: 50,
};

const QUEST_BOAR: BodyQuestDef = {
  id: 'bq_boar', bodyId: 'boar', tier: 1,
  nameRu: 'Unstoppable',
  description: 'Charge through anything in your path.',
  introMessages: [
    { speaker: '', text: 'Thick hide. Powerful legs. The forest parts before you.' },
    { speaker: '', text: 'Wolves circle nearby. They will learn to fear the charge.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Nothing stands before the charge. The body taught you the ram.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'wolf', targetNameRu: 'Wolf', description: 'Drive away 3 wolves' },
  ],
  rewardSpellId: 'ram',
  xpReward: 60,
};

const QUEST_GROUSE: BodyQuestDef = {
  id: 'bq_grouse', bodyId: 'grouse', tier: 1,
  nameRu: 'Healer\'s Instinct',
  description: 'Survive by knowing which herbs restore strength.',
  introMessages: [
    { speaker: '', text: 'Tiny wings. Sharp eyes. The undergrowth hides many secrets.' },
    { speaker: '', text: 'Some berries heal. The body remembers which.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The smallest creature taught you the greatest gift — healing.' },
  ],
  objectives: [
    { type: 'survive', count: 30, description: 'Survive 30 seconds' },
  ],
  rewardSpellId: 'neutral_heal',
  xpReward: 40,
};

// ═══════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════

export const BODY_QUESTS: BodyQuestDef[] = [
  // T1 Animals
  QUEST_WOLF, QUEST_BEAR,
  QUEST_HARE, QUEST_DEER, QUEST_FOX, QUEST_BOAR, QUEST_GROUSE,
  // T1 Humanoids
  QUEST_GOBLIN, QUEST_ORC, QUEST_SCOUT, QUEST_SHAMAN,
  // T1 Elementals
  QUEST_SPARK, QUEST_SPLASHER, QUEST_PEBBLE, QUEST_GUSTY,
  // T2 Bandits
  QUEST_BANDIT_ARCHER, QUEST_BANDIT_CROSSBOW, QUEST_BANDIT_SPEAR, QUEST_BANDIT_BRUTE,
  // T2 Elementals
  QUEST_ASHER, QUEST_FOGGER, QUEST_MUDDER, QUEST_WHISTLER, QUEST_SPIRIT_WOLF,
  // T2 Veterans — paired events
  QUEST_GOBLIN_VETERAN, QUEST_ORC_VETERAN,       // Рейд на лагерь
  QUEST_WOLF_VETERAN, QUEST_BEAR_VETERAN,         // Лесной конфликт
  QUEST_CARAVAN_GUARD, QUEST_SCOUT_VETERAN,       // Защита каравана
  // T2 Veterans — solo
  QUEST_MONKEY,
  QUEST_BANDIT_ARCHER_VET, QUEST_BANDIT_CROSSBOW_VET,
  QUEST_BANDIT_SPEAR_VET, QUEST_BANDIT_BRUTE_VET,
  // T3 Conflict
  QUEST_ORC_CARAVAN, QUEST_SCOUT_ESCORT,
];

export const CONFLICT_QUESTS: ConflictQuestDef[] = [
  CONFLICT_CARAVAN,
];

const BODY_QUEST_MAP = new Map<string, BodyQuestDef[]>();
for (const bq of BODY_QUESTS) {
  const list = BODY_QUEST_MAP.get(bq.bodyId) ?? [];
  list.push(bq);
  BODY_QUEST_MAP.set(bq.bodyId, list);
}

export function getBodyQuests(bodyId: string): BodyQuestDef[] {
  return BODY_QUEST_MAP.get(bodyId) ?? [];
}

export function getBodyQuest(bodyId: string): BodyQuestDef | undefined {
  return BODY_QUEST_MAP.get(bodyId)?.[0];
}
