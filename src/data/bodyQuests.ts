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
  nameRu: 'Territory',
  description: 'Drive intruders from your den.',
  introMessages: [
    { speaker: '', text: 'This forest — mine. Always has been.' },
    { speaker: '', text: 'But today there\'s a foreign smell. Fire. Metal. People.' },
    { speaker: '', text: 'Too close to the den.' },
  ],
  completeMessages: [
    { speaker: '', text: 'They fled. The den is safe. The body taught you to crush.' },
  ],
  objectives: [
    { type: 'kill', count: 2, targetId: 'intruder', targetNameRu: 'Intruder', description: 'Drive away 2 intruders' },
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
    { speaker: '', text: 'Hunting camp nearby. One sleepy guard.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The tribe eats tonight. Quick blade — yours to keep.' },
  ],
  objectives: [
    { type: 'steal', count: 3, targetId: 'camp_supplies', targetNameRu: 'Supplies', description: 'Steal 3 supply crates' },
  ],
  rewardSpellId: 'sting',
  xpReward: 50,
};

const QUEST_ORC: BodyQuestDef = {
  id: 'bq_orc', bodyId: 'orc', tier: 1,
  nameRu: 'Rite of Strength',
  description: 'Prove your worth to the chieftain.',
  introMessages: [
    { speaker: '', text: 'Large body. Heavy. Strong.' },
    { speaker: '', text: 'The chieftain watches. Two others stand near.' },
    { speaker: '', text: 'A greatsword stuck blade-down in the earth. Only those who prove themselves may take it.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The chieftain nods. The blade is yours. Heavy, but true.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'challenger', targetNameRu: 'Challenger', description: 'Defeat 3 challengers' },
  ],
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
    { speaker: '', text: 'The road must be checked. They say someone\'s been lurking there.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The road is clear — for now. A keen eye is its own weapon.' },
  ],
  objectives: [
    { type: 'reach', count: 3, targetId: 'checkpoint', targetNameRu: 'Checkpoint', description: 'Check 3 waypoints' },
  ],
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
    { type: 'survive', count: 1, description: 'Meditate for 30 seconds' },
  ],
  rewardSpellId: 'mob_nature_t1',
  xpReward: 50,
};

// ═══════════════════════════════════════════════════════════════
// T1 — Elementals → T1 magic spells
// ═══════════════════════════════════════════════════════════════

const QUEST_SPARK: BodyQuestDef = {
  id: 'bq_spark', bodyId: 'spark', tier: 1,
  nameRu: 'Gathering Flame',
  description: 'Find and reunite with scattered sparks.',
  introMessages: [
    { speaker: '', text: 'Hot. Bright. Fast.' },
    { speaker: '', text: 'Where are the others? There should be more here.' },
    { speaker: '', text: 'The wind scattered everyone. Cold alone.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Together again. The flame is whole. Its spark is yours.' },
  ],
  objectives: [
    { type: 'collect', count: 3, targetId: 'lost_spark', targetNameRu: 'Lost Spark', description: 'Find 3 scattered sparks' },
  ],
  rewardSpellId: 'mob_fire_t1',
  xpReward: 50,
};

const QUEST_SPLASHER: BodyQuestDef = {
  id: 'bq_splasher', bodyId: 'splasher', tier: 1,
  nameRu: 'Deep Chase',
  description: 'Catch the elusive fish.',
  introMessages: [
    { speaker: '', text: 'Water. Cold. Good.' },
    { speaker: '', text: 'Down in the deep — a big fish. It\'s been escaping for three days.' },
    { speaker: '', text: 'Fast. Clever. But not cleverer than the water.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Caught. The water obeys. Its chill — yours to command.' },
  ],
  objectives: [
    { type: 'kill', count: 1, targetId: 'big_fish', targetNameRu: 'Big Fish', description: 'Catch the elusive fish' },
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
  nameRu: 'Race to the Peak',
  description: 'Be the first to reach the summit.',
  introMessages: [
    { speaker: '', text: 'Fast. Faster still.' },
    { speaker: '', text: 'Three others wait at the lower crevice.' },
    { speaker: '', text: 'First to the summit — that\'s who matters.' },
  ],
  completeMessages: [
    { speaker: '', text: 'First. The wind itself bows. Its gust — yours to wield.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'summit', description: 'Reach the summit first' },
  ],
  rewardSpellId: 'mob_wind_t1',
  xpReward: 50,
};

// ═══════════════════════════════════════════════════════════════
// T2 — Bandits/advanced humanoids → T2 weapon spells
// ═══════════════════════════════════════════════════════════════

const QUEST_BANDIT_ARCHER: BodyQuestDef = {
  id: 'bq_bandit_archer', bodyId: 'bandit_archer', tier: 2,
  nameRu: 'Rearguard',
  description: 'Cover the camp\'s retreat.',
  introMessages: [
    { speaker: '', text: 'Something went wrong. The camp is packing up.' },
    { speaker: '', text: 'Three guards from the village are on the trail.' },
    { speaker: '', text: 'The boss shouts: "Hold them off!"' },
  ],
  completeMessages: [
    { speaker: '', text: 'Camp escaped. You learned to shoot while retreating.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'village_guard', targetNameRu: 'Guard', description: 'Hold off 3 guards' },
    { type: 'survive', count: 1, description: 'Survive the encounter' },
  ],
  rewardSpellId: 'bow_backshot',
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
  rewardSpellId: 'crossbow_snare',
  xpReward: 100,
};

const QUEST_BANDIT_SPEAR: BodyQuestDef = {
  id: 'bq_bandit_spear', bodyId: 'bandit_spear', tier: 2,
  nameRu: 'Night Watch',
  description: 'Defend the camp through the night.',
  introMessages: [
    { speaker: '', text: 'Dark. Quiet. Your shift.' },
    { speaker: '', text: 'Camp perimeter. Three hours until dawn.' },
    { speaker: '', text: 'Something moves in the bushes.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Dawn came. You held the line. The spear strikes true.' },
  ],
  objectives: [
    { type: 'kill', count: 5, targetId: 'night_stalker', targetNameRu: 'Stalker', description: 'Repel 5 attackers' },
    { type: 'survive', count: 1, description: 'Survive until dawn' },
  ],
  rewardSpellId: 'spear_butt',
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
  rewardSpellId: 'hammer_smash',
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
    { type: 'reach', count: 3, targetId: 'border_mark', targetNameRu: 'Border', description: 'Burn 3 border marks' },
    { type: 'kill', count: 2, targetId: 'water_intruder', targetNameRu: 'Water elemental', description: 'Repel 2 intruders' },
  ],
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
    { type: 'reach', count: 4, targetId: 'fog_node', targetNameRu: 'Fog node', description: 'Restore 4 fog nodes' },
  ],
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
    { type: 'destroy', count: 3, targetId: 'rock_wall', targetNameRu: 'Rock wall', description: 'Break through 3 rock layers' },
    { type: 'reach', count: 1, targetId: 'water_source', description: 'Reach the water source' },
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
  description: 'Outrun every predator.',
  introMessages: [
    { speaker: '', text: 'Graceful legs. Wind in the fur. The meadow stretches wide.' },
    { speaker: '', text: 'Something is watching from the treeline. Time to run.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Nothing could catch you. The wind itself taught you to dash.' },
  ],
  objectives: [
    { type: 'survive', count: 1, description: 'Survive 60 seconds' },
  ],
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
  rewardSpellId: 'fist_strike',
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
    { type: 'survive', count: 1, description: 'Survive 30 seconds' },
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
