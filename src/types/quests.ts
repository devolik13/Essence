export type ObjectiveType = 'kill' | 'capture' | 'learn_spell' | 'craft_t3' | 'talk' | 'kill_boss' | 'escort' | 'survive' | 'collect' | 'reach';

export interface QuestObjective {
  type: ObjectiveType;
  targetId?: string;
  targetNameRu?: string;
  targetNameEn?: string;
  count: number;
}

export interface QuestDef {
  id: string;
  nameRu: string;
  nameEn?: string;
  /** Quest description / story text (RU) */
  description?: string;
  descriptionEn?: string;
  objectives: QuestObjective[];
  /** XP awarded on completion */
  xpReward: number;
  /** Prerequisite quest IDs — must be completed before this quest activates */
  prerequisiteIds?: string[];
  /** NPC id who gives/completes this quest (for dialog integration) */
  giverNpcId?: string;
  /** Dialog text shown when quest is given */
  dialogStart?: string;
  /** Dialog text shown when quest is completed */
  dialogEnd?: string;
  /** Item reward on completion */
  rewardItemId?: string;
}

export interface QuestProgress {
  def: QuestDef;
  /** live counters, parallel array to def.objectives */
  counts: number[];
  completed: boolean;
}
