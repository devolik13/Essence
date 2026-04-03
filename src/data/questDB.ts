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
];
