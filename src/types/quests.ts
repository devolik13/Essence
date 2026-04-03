export type ObjectiveType = 'kill' | 'capture' | 'learn_spell';

export interface QuestObjective {
  type: ObjectiveType;
  targetId?: string;
  targetNameRu?: string;  // русское имя цели для отображения
  count: number;
}

export interface QuestDef {
  id: string;
  nameRu: string;
  objectives: QuestObjective[];
  /** XP awarded on completion — distributed same as kill XP */
  xpReward: number;
}

export interface QuestProgress {
  def: QuestDef;
  /** live counters, parallel array to def.objectives */
  counts: number[];
  completed: boolean;
}
