import { QuestDef } from '../types/quests';

export const QUESTS: QuestDef[] = [
  // ═══ ACT 1 — VILLAGE ════════════════════════════════════════════════════════

  {
    id: 'q1_awakening',
    nameRu: 'Awakening',
    description: 'You are a Sphere — a consciousness from another world. Possess a body to begin.',
    objectives: [{ type: 'capture', targetNameRu: 'any body', count: 1 }],
    xpReward: 20,
    dialogStart: "Welcome, Sphere. You've crossed between worlds. You have no form here — you need a body. Approach one of the vessels near the Respawn Stone and press [E].",
    dialogEnd: "Good. You can feel it now — the weight, the strength. This body is your tool. Learn from it.",
  },

  {
    id: 'q2_first_steps',
    nameRu: 'First Steps',
    description: 'Prove yourself in combat. Defeat the goblins near the village.',
    objectives: [{ type: 'kill', targetId: 'goblin', targetNameRu: 'Goblins', count: 3 }],
    xpReward: 40,
    prerequisiteIds: ['q1_awakening'],
    dialogStart: "Goblins have been causing trouble east of the village. Deal with them — it will be good practice.",
    dialogEnd: "Well done. You're adapting quickly. But there's more to learn.",
  },

  {
    id: 'q3_essence_within',
    nameRu: 'The Essence Within',
    description: 'Capture a goblin body and learn its ability.',
    objectives: [
      { type: 'capture', targetId: 'goblin', targetNameRu: 'Goblin body', count: 1 },
      { type: 'learn_spell', targetId: 'sting', targetNameRu: 'Sting', count: 1 },
    ],
    xpReward: 60,
    prerequisiteIds: ['q2_first_steps'],
    dialogStart: "Every creature here carries knowledge in its body. Capture a goblin — fight it, then possess its corpse. Stay in it long enough and you'll learn its technique.",
    dialogEnd: "You've absorbed the goblin's skill. It's yours forever now, even in other bodies. This is why you're here — to learn.",
  },

  {
    id: 'q4_rangers_request',
    nameRu: "Ranger's Request",
    description: 'The Ranger speaks of four elemental zones and their Guardians.',
    objectives: [{ type: 'talk', targetId: 'ranger', targetNameRu: 'Ranger', count: 1 }],
    xpReward: 30,
    prerequisiteIds: ['q3_essence_within'],
    dialogStart: "Come closer, Sphere. I need to tell you about this land. Four zones surround our village, each ruled by an elemental Guardian. They aren't evil — they're protectors. But something has made them restless. North: Misty Lake. South: Ashen Grove. West: Stone Hills. East: Wind Peaks. Explore them. Learn their magic. You'll need it.",
    dialogEnd: "Good. The path ahead won't be easy. But you're ready.",
  },

  // ═══ ACT 2 — ELEMENTAL ZONES (parallel) ════════════════════════════════════

  {
    id: 'q5_frozen_trail',
    nameRu: 'Frozen Trail',
    description: 'Explore Misty Lake and defeat water elementals.',
    objectives: [
      { type: 'kill', targetId: 'splasher', targetNameRu: 'Splashers', count: 5 },
      { type: 'kill', targetId: 'fogger', targetNameRu: 'Foggers', count: 3 },
    ],
    xpReward: 80,
    prerequisiteIds: ['q4_rangers_request'],
    dialogStart: "The Misty Lake to the north is home to water spirits. They control ice and fog. Be careful — the cold slows your movements.",
  },

  {
    id: 'q6_ashen_path',
    nameRu: 'Ashen Path',
    description: 'Explore Ashen Grove and defeat fire elementals.',
    objectives: [
      { type: 'kill', targetId: 'spark', targetNameRu: 'Sparks', count: 5 },
      { type: 'kill', targetId: 'asher', targetNameRu: 'Ashers', count: 3 },
    ],
    xpReward: 80,
    prerequisiteIds: ['q4_rangers_request'],
    dialogStart: "The Ashen Grove to the south burns with elemental fire. Sparks swarm in packs. Ashers are slower but deadlier.",
  },

  {
    id: 'q7_stone_heart',
    nameRu: 'Stone Heart',
    description: 'Explore Stone Hills and defeat earth elementals.',
    objectives: [
      { type: 'kill', targetId: 'pebble', targetNameRu: 'Pebbles', count: 5 },
      { type: 'kill', targetId: 'mudder', targetNameRu: 'Mudders', count: 3 },
    ],
    xpReward: 80,
    prerequisiteIds: ['q4_rangers_request'],
    dialogStart: "The Stone Hills to the west are ancient. Earth elementals dwell in the rocks. They're tough — high armor, slow but relentless.",
  },

  {
    id: 'q8_wind_song',
    nameRu: 'Wind Song',
    description: 'Explore Wind Peaks and defeat wind elementals.',
    objectives: [
      { type: 'kill', targetId: 'gusty', targetNameRu: 'Gusties', count: 5 },
      { type: 'kill', targetId: 'whistler', targetNameRu: 'Whistlers', count: 3 },
    ],
    xpReward: 80,
    prerequisiteIds: ['q4_rangers_request'],
    dialogStart: "The Wind Peaks to the east are high and treacherous. Wind elementals are fast and evasive. Hard to hit, but fragile if you catch them.",
  },

  // ═══ ACT 3 — PREPARATION & FINALE ══════════════════════════════════════════

  {
    id: 'q9_gathering_storm',
    nameRu: 'The Gathering Storm',
    description: 'Return to the Ranger. The Guardians grow restless.',
    objectives: [{ type: 'talk', targetId: 'ranger', targetNameRu: 'Ranger', count: 1 }],
    xpReward: 50,
    prerequisiteIds: ['q5_frozen_trail', 'q6_ashen_path', 'q7_stone_heart', 'q8_wind_song'],
    dialogStart: "You've done well. You've seen all four zones. But the Guardians... they sense your power. One of them will challenge you. Before that — prepare yourself. Craft the strongest equipment you can. You'll need every advantage.",
    dialogEnd: "When you're ready, seek out a Guardian. Only one needs to fall. Its crystal will be your proof — and your passage home.",
  },

  {
    id: 'q10_forge_strength',
    nameRu: 'Forge Your Strength',
    description: 'Craft a T3 item — weapon, armor, or accessory.',
    objectives: [{ type: 'craft_t3', targetNameRu: 'any T3 item', count: 1 }],
    xpReward: 100,
    prerequisiteIds: ['q9_gathering_storm'],
    dialogStart: "Visit the workbenches in the village. Gather resources from all three professions. Craft something worthy of a Guardian fight.",
  },

  {
    id: 'q11_body_collector',
    nameRu: 'Body Collector',
    description: 'Capture 5 different creature types to expand your knowledge.',
    objectives: [{ type: 'capture', targetNameRu: 'different bodies', count: 5 }],
    xpReward: 100,
    prerequisiteIds: ['q9_gathering_storm'],
    dialogStart: "Every body teaches you something. The more you've learned, the stronger your Sphere becomes. Seek variety — capture creatures you haven't tried yet.",
  },

  {
    id: 'q12_guardians_trial',
    nameRu: "Guardian's Trial",
    description: 'Defeat an Elemental Guardian and claim its Crystal.',
    objectives: [{ type: 'kill_boss', targetNameRu: 'any Guardian', count: 1 }],
    xpReward: 300,
    prerequisiteIds: ['q10_forge_strength', 'q11_body_collector'],
    dialogStart: "This is it. Choose your Guardian — Ignis of Fire, Aquaris of Water, Terra of Earth, or Aeros of Wind. Each is powerful. Each guards a Crystal. Defeat one, and its essence is yours. This crystal... it's why you came here. With it, the magic of this world works in yours. Against the Void.",
    dialogEnd: "The Guardian falls. Its essence crystallizes before you — pure elemental power, condensed into a single stone. You feel it resonate with your Sphere. This changes everything.\n\n...But as the light fades, you notice something. Dark tendrils at the edge of the zone. The Void. It's already here.\n\nChapter 1 — Complete.",
    rewardItemId: 'crystal_fire', // will be dynamic based on which boss
  },
];
