import { QuestDef } from '../types/quests';

export const QUESTS: QuestDef[] = [
  // ═══ ACT 1 — TUTORIAL (auto-given) ════════════════════════════════════════

  {
    id: 'q1_awakening',
    nameRu: 'Пробуждение',
    nameEn: 'Awakening',
    description: 'Ты — Сфера, сознание из другого мира. Вселись в тело, чтобы начать.',
    descriptionEn: 'You are a Sphere — a consciousness from another world. Possess a body to begin.',
    objectives: [{ type: 'capture', targetNameRu: 'любое тело', targetNameEn: 'any body', count: 1 }],
    xpReward: 20,
    dialogStart: "You have no form here. Approach one of the vessels near the Respawn Stone and press [E] to possess it.",
    dialogEnd: "Good. You can feel it now — the weight, the strength. This body is your tool.",
  },

  // q2_first_steps and q3_essence_within (goblin kill / capture quests)
  // are temporarily removed because goblins aren't on the map yet.
  // q4_rangers_request still depends on q3 in the chain — once Bert and
  // goblins return, restore both quests.

  // ═══ ACT 2 — NPC QUESTS (talk to specific NPCs) ══════════════════════════

  {
    id: 'q4_rangers_request',
    nameRu: 'Брифинг охотника',
    nameEn: "Hunter's Briefing",
    description: 'Берт рассказывает о четырёх стихийных зонах и их Стражах.',
    descriptionEn: 'Bert tells you about the four elemental zones and their Guardians.',
    objectives: [{ type: 'talk', targetId: 'bert', targetNameRu: 'Берт', targetNameEn: 'Bert', count: 1 }],
    xpReward: 30,
    prerequisiteIds: ['q3_essence_within'],
    giverNpcId: 'bert',
    dialogStart: "Heard the legend of the Guardians? Fire, water, earth, wind. Four places around us. They say whoever defeats all four gains their power.",
    dialogEnd: "The path ahead won't be easy. But you're ready.",
  },

  {
    id: 'q5_frozen_trail',
    nameRu: 'Цена тумана',
    nameEn: 'The Price of Fog',
    description: 'Отец Миры болен. Найди лекарство на Туманном озере.',
    descriptionEn: "Mira's father is sick. Find a cure at the Misty Lake.",
    objectives: [
      { type: 'kill', targetId: 'splasher', targetNameRu: 'Брызгуны', targetNameEn: 'Splashers', count: 5 },
      { type: 'kill', targetId: 'fogger', targetNameRu: 'Туманники', targetNameEn: 'Foggers', count: 3 },
    ],
    xpReward: 80,
    prerequisiteIds: ['q4_rangers_request'],
    giverNpcId: 'mira',
    dialogStart: "Father hasn't been able to get up for three days. Helga says a Misty Lotus might help — it only grows on the island in the lake.",
  },

  {
    id: 'q6_ashen_path',
    nameRu: 'Испытание огнём',
    nameEn: 'Trial by Fire',
    description: 'Алдрик просил принести вулканический камень из Пепельной рощи.',
    descriptionEn: 'Aldric asked for a volcanic stone from the Ashen Grove.',
    objectives: [
      { type: 'kill', targetId: 'spark', targetNameRu: 'Искры', targetNameEn: 'Sparks', count: 5 },
      { type: 'kill', targetId: 'asher', targetNameRu: 'Пепельники', targetNameEn: 'Ashers', count: 3 },
    ],
    xpReward: 80,
    prerequisiteIds: ['q4_rangers_request'],
    giverNpcId: 'aldric',
    dialogStart: "You said you'd bring back a volcanic stone from the grove. With red veins. From the vent. Changed your mind?",
  },

  {
    id: 'q7_stone_heart',
    nameRu: 'Что скрывают холмы',
    nameEn: 'What the Hills Hide',
    description: 'Берт говорит, что горняк Свен ушёл в Каменные холмы и не вернулся.',
    descriptionEn: 'Bert says miner Sven went into the Stone Hills and never returned.',
    objectives: [
      { type: 'kill', targetId: 'pebble', targetNameRu: 'Камешки', targetNameEn: 'Pebbles', count: 5 },
      { type: 'kill', targetId: 'mudder', targetNameRu: 'Грязевики', targetNameEn: 'Mudders', count: 3 },
    ],
    xpReward: 80,
    prerequisiteIds: ['q4_rangers_request'],
    giverNpcId: 'bert',
    dialogStart: "Miner Sven went into the hills two days ago. Hasn't come back. You know the way — through the Grey Gorge.",
  },

  {
    id: 'q8_wind_song',
    nameRu: 'Голос ветра',
    nameEn: 'Voice of the Wind',
    description: 'Странник без имени говорит о четвёртом Страже.',
    descriptionEn: 'The Nameless Stranger speaks of the fourth Guardian.',
    objectives: [
      { type: 'kill', targetId: 'gusty', targetNameRu: 'Вихревики', targetNameEn: 'Gusties', count: 5 },
      { type: 'kill', targetId: 'whistler', targetNameRu: 'Свистуны', targetNameEn: 'Whistlers', count: 3 },
    ],
    xpReward: 80,
    prerequisiteIds: ['q4_rangers_request'],
    giverNpcId: 'stranger',
    dialogStart: "The fourth Guardian is different. He already knows about you. Go to him yourself. Let him start first.",
  },

  // ═══ ACT 3 — PREPARATION & FINALE ═════════════════════════════════════════

  {
    id: 'q9_gathering_storm',
    nameRu: 'Надвигающаяся буря',
    nameEn: 'The Gathering Storm',
    description: 'Вернись к Берту. Стражи становятся беспокойнее.',
    descriptionEn: 'Return to Bert. The Guardians grow restless.',
    objectives: [{ type: 'talk', targetId: 'bert', targetNameRu: 'Берт', targetNameEn: 'Bert', count: 1 }],
    xpReward: 50,
    prerequisiteIds: ['q5_frozen_trail', 'q6_ashen_path', 'q7_stone_heart', 'q8_wind_song'],
    giverNpcId: 'bert',
    dialogStart: "You've seen all four zones. The Guardians sense your power. Prepare yourself — craft the strongest equipment you can.",
    dialogEnd: "When you're ready, seek out a Guardian. Only one needs to fall.",
  },

  {
    id: 'q10_forge_strength',
    nameRu: 'Закали силу',
    nameEn: 'Forge Your Strength',
    description: 'Скрафти предмет T3 — оружие, броню или аксессуар.',
    descriptionEn: 'Craft a T3 item — weapon, armor, or accessory.',
    objectives: [{ type: 'craft_t3', targetNameRu: 'любой предмет T3', targetNameEn: 'any T3 item', count: 1 }],
    xpReward: 100,
    prerequisiteIds: ['q9_gathering_storm'],
    dialogStart: "Visit the workbenches. Gather resources. Craft something worthy of a Guardian fight.",
  },

  {
    id: 'q11_body_collector',
    nameRu: 'Коллекционер тел',
    nameEn: 'Body Collector',
    description: 'Захвати 5 разных видов существ, чтобы расширить свои знания.',
    descriptionEn: 'Capture 5 different creature types to expand your knowledge.',
    objectives: [{ type: 'capture', targetNameRu: 'разные тела', targetNameEn: 'different bodies', count: 5 }],
    xpReward: 100,
    prerequisiteIds: ['q9_gathering_storm'],
    dialogStart: "Every body teaches you something. Seek variety — capture creatures you haven't tried yet.",
  },

  {
    id: 'q12_guardians_trial',
    nameRu: 'Испытание Стражем',
    nameEn: "Guardian's Trial",
    description: 'Победи Стража стихии и забери его Кристалл.',
    descriptionEn: 'Defeat an Elemental Guardian and claim its Crystal.',
    objectives: [{ type: 'kill_boss', targetNameRu: 'любой Страж', targetNameEn: 'any Guardian', count: 1 }],
    xpReward: 300,
    prerequisiteIds: ['q10_forge_strength', 'q11_body_collector'],
    dialogStart: "This is it. Choose your Guardian — Ignis, Aquaris, Terra, or Aeros. Defeat one, and its crystal is yours.",
    dialogEnd: "The Guardian falls. Its essence crystallizes before you — pure elemental power.\n\n...But as the light fades, dark tendrils appear at the edge of the zone. The Void. It's already here.\n\nChapter 1 — Complete.",
    rewardItemId: 'crystal_fire',
  },
];
