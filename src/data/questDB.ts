import { QuestDef } from '../types/quests';

export const QUESTS: QuestDef[] = [
  {
    id: 'first_steps',
    nameRu: 'Первые шаги',
    objectives: [{ type: 'kill', targetId: 'rabbit', targetNameRu: 'Кроликов', count: 3 }],
    xpReward: 30,
  },
  {
    id: 'marksman',
    nameRu: 'Меткий стрелок',
    objectives: [{ type: 'kill', targetId: 'scout', targetNameRu: 'Разведчиков', count: 3 }],
    xpReward: 50,
  },
  {
    id: 'hunter',
    nameRu: 'Охотник',
    objectives: [{ type: 'kill', targetId: 'wolf', targetNameRu: 'Волков', count: 2 }],
    xpReward: 80,
  },
  {
    id: 'magic_path',
    nameRu: 'Магический путь',
    objectives: [{ type: 'learn_spell', targetId: 'spell_spark', targetNameRu: 'Искру', count: 1 }],
    xpReward: 60,
  },
  {
    id: 'body_master',
    nameRu: 'Мастер захвата',
    objectives: [{ type: 'capture', targetNameRu: 'любых тел', count: 3 }],
    xpReward: 100,
  },
  {
    id: 'goblin_sweep',
    nameRu: 'Зачистка лагеря',
    objectives: [{ type: 'kill', targetId: 'goblin', targetNameRu: 'Гоблинов', count: 5 }],
    xpReward: 75,
  },
  {
    id: 'bear_hunt',
    nameRu: 'Медвежья охота',
    objectives: [{ type: 'kill', targetId: 'bear', targetNameRu: 'Медведей', count: 2 }],
    xpReward: 140,
  },
  {
    id: 'orc_slayer',
    nameRu: 'Истребитель орков',
    objectives: [{ type: 'kill', targetId: 'orc', targetNameRu: 'Орков', count: 3 }],
    xpReward: 120,
  },
  {
    id: 'shaman_hunt',
    nameRu: 'Охота на шамана',
    objectives: [{ type: 'kill', targetId: 'shaman', targetNameRu: 'Шаманов', count: 2 }],
    xpReward: 130,
  },
  {
    id: 'fireball_mastery',
    nameRu: 'Пиромант',
    objectives: [{ type: 'learn_spell', targetId: 'spell_fireball', targetNameRu: 'Огненный шар', count: 1 }],
    xpReward: 80,
  },
  {
    id: 'deep_explorer',
    nameRu: 'Исследователь глубин',
    objectives: [
      { type: 'kill', targetId: 'bear',   targetNameRu: 'Медведей', count: 1 },
      { type: 'kill', targetId: 'orc',    targetNameRu: 'Орков',    count: 1 },
      { type: 'kill', targetId: 'shaman', targetNameRu: 'Шаманов',  count: 1 },
    ],
    xpReward: 200,
  },
];
