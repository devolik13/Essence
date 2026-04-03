import { QuestDef } from '../types/quests';

export const QUESTS: QuestDef[] = [
  {
    id: 'first_steps',
    nameRu: 'Первые шаги',
    objectives: [{ type: 'kill', targetId: 'rabbit', count: 3 }],
    xpReward: 30,
  },
  {
    id: 'marksman',
    nameRu: 'Меткий стрелок',
    objectives: [{ type: 'kill', targetId: 'scout', count: 3 }],
    xpReward: 50,
  },
  {
    id: 'hunter',
    nameRu: 'Охотник',
    objectives: [{ type: 'kill', targetId: 'wolf', count: 2 }],
    xpReward: 80,
  },
  {
    id: 'magic_path',
    nameRu: 'Магический путь',
    objectives: [{ type: 'learn_spell', targetId: 'spell_spark', count: 1 }],
    xpReward: 60,
  },
  {
    id: 'body_master',
    nameRu: 'Мастер захвата',
    objectives: [{ type: 'capture', count: 3 }],
    xpReward: 100,
  },
];
