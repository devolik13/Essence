import { DialogMessage } from './dialogs';

export interface BodyQuest {
  bodyId: string;
  messages: DialogMessage[];
  xpReward: number;
}

export const BODY_QUESTS: BodyQuest[] = [
  // ═══ Animals ══════════════════════════════════════════════

  {
    bodyId: 'rabbit',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'The world changed. Grass — enormous. Every sound — a threat.' },
      { speaker: '', text: 'Somewhere above, a shadow circles. The burrow is far.' },
      { speaker: '', text: 'The body knows what to do. Run.' },
    ],
  },
  {
    bodyId: 'wolf',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'Scents speak louder than words. The pack is hungry — two days without a kill.' },
      { speaker: '', text: 'The alpha watches. Waits. The young one must prove itself.' },
      { speaker: '', text: 'A deer was here an hour ago. The trail leads east.' },
    ],
  },
  {
    bodyId: 'bear',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'This forest — mine. Always has been.' },
      { speaker: '', text: 'But today there\'s a foreign smell. Fire. Metal. People.' },
      { speaker: '', text: 'Too close to the den.' },
    ],
  },

  // ═══ Humanoids ════════════���═══════════════════════════════

  {
    bodyId: 'goblin',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'Small body. Fast. Hungry.' },
      { speaker: '', text: 'The tribe waits at the edge. Need to bring something back.' },
      { speaker: '', text: 'Hunting camp nearby. There\'s food. Supplies. One sleepy guard.' },
    ],
  },
  {
    bodyId: 'orc',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'Large body. Heavy. Strong.' },
      { speaker: '', text: 'The chieftain watches. Two others stand near.' },
      { speaker: '', text: 'A greatsword stuck blade-down in the earth. Only those who prove themselves may take it.' },
    ],
  },
  {
    bodyId: 'scout',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'Light body. Quiet. Used to the forest.' },
      { speaker: '', text: 'The trade caravan leaves at dawn tomorrow.' },
      { speaker: '', text: 'The road must be checked. They say someone\'s been lurking there.' },
    ],
  },
  {
    bodyId: 'shaman',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'The world is full of voices. Trees speak. The wind carries names.' },
      { speaker: '', text: 'Night. Must go to the clearing and call.' },
      { speaker: '', text: 'Spirits only come to those who listen.' },
    ],
  },
  {
    bodyId: 'spirit_wolf',
    xpReward: 100,
    messages: [
      { speaker: '', text: 'The forest speaks of pain. Somewhere nearby, someone lies still.' },
      { speaker: '', text: 'Not a beast. A human. Breathing hard.' },
      { speaker: '', text: 'The forest spirits do not let anyone die without reason.' },
    ],
  },

  // ═══ Bandits ════════��══════════════════════════��══════════

  {
    bodyId: 'bandit_archer',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'Something went wrong. The camp is packing up.' },
      { speaker: '', text: 'Three guards from the village are on the trail.' },
      { speaker: '', text: 'The boss shouts: "Hold them off!"' },
    ],
  },
  {
    bodyId: 'bandit_crossbow',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'The boss points at the old fort gate.' },
      { speaker: '', text: 'A lock. Thick. Key\'s lost.' },
      { speaker: '', text: '"You\'re the best shot. Find a way."' },
    ],
  },
  {
    bodyId: 'bandit_spear',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'Dark. Quiet. Your shift.' },
      { speaker: '', text: 'Camp perimeter. Three hours until dawn.' },
      { speaker: '', text: 'Something moves in the bushes.' },
    ],
  },
  {
    bodyId: 'bandit_brute',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'The boss points at an old watchtower by the road.' },
      { speaker: '', text: '"The guards will use it. Knock it down."' },
      { speaker: '', text: 'Big body. Heavy hammer. Simple job.' },
    ],
  },

  // ═══ Fire Elementals ══════════════════════════════════════

  {
    bodyId: 'spark',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'Hot. Bright. Fast.' },
      { speaker: '', text: 'Where are the others? There should be more here.' },
      { speaker: '', text: 'The wind scattered everyone. Cold alone.' },
    ],
  },
  {
    bodyId: 'asher',
    xpReward: 100,
    messages: [
      { speaker: '', text: 'Slow. Heavy. Ancient.' },
      { speaker: '', text: 'The western slope — not our territory. But something entered.' },
      { speaker: '', text: 'Smell of water. Smell of the foreign. Must leave marks so they don\'t return.' },
    ],
  },

  // ═══ Water Elementals ═════════════════════════════════════

  {
    bodyId: 'splasher',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'Water. Cold. Good.' },
      { speaker: '', text: 'Down in the deep — a big fish. It\'s been escaping for three days.' },
      { speaker: '', text: 'Fast. Clever. But not cleverer than the water.' },
    ],
  },
  {
    bodyId: 'fogger',
    xpReward: 100,
    messages: [
      { speaker: '', text: 'The fog is thinning. This is wrong.' },
      { speaker: '', text: 'The sun breaks through. It shouldn\'t.' },
      { speaker: '', text: 'The northern shore is nearly visible. Must restore the veil.' },
    ],
  },

  // ═══ Earth Elementals ═════════════════════════════════════

  {
    bodyId: 'pebble',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'Heavy. Stable. Right.' },
      { speaker: '', text: 'There — a breach in the western cave wall.' },
      { speaker: '', text: 'Without it the vault will start to sag. Must take your place. Become part of it.' },
    ],
  },
  {
    bodyId: 'mudder',
    xpReward: 100,
    messages: [
      { speaker: '', text: 'Dry. Long dry.' },
      { speaker: '', text: 'Somewhere deeper there\'s water. You can feel it.' },
      { speaker: '', text: 'Must grow towards it. Through stone. Slowly.' },
    ],
  },

  // ═══ Wind Elementals ════════���═════════════════════════════

  {
    bodyId: 'gusty',
    xpReward: 50,
    messages: [
      { speaker: '', text: 'Fast. Faster still.' },
      { speaker: '', text: 'Three others wait at the lower crevice.' },
      { speaker: '', text: 'First to the summit — that\'s who matters.' },
    ],
  },
  {
    bodyId: 'whistler',
    xpReward: 100,
    messages: [
      { speaker: '', text: 'The wind should sing.' },
      { speaker: '', text: 'But today — it\'s off. Something cuts the song in half.' },
      { speaker: '', text: 'Somewhere on the southern slope. Must find it.' },
    ],
  },
];

const BODY_QUEST_MAP = new Map<string, BodyQuest>();
for (const bq of BODY_QUESTS) {
  BODY_QUEST_MAP.set(bq.bodyId, bq);
}

export function getBodyQuest(bodyId: string): BodyQuest | undefined {
  return BODY_QUEST_MAP.get(bodyId);
}
