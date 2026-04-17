import { DialogMessage } from '../data/dialogs';

export type BodyQuestTier = 1 | 2 | 3;

export type BodyObjectiveType = 'kill' | 'survive' | 'escort' | 'collect' | 'reach' | 'protect' | 'steal' | 'destroy';

export interface BodyQuestObjective {
  type: BodyObjectiveType;
  targetId?: string;
  targetNameRu?: string;
  count: number;
  description: string;
}

export interface BodyQuestDef {
  id: string;
  bodyId: string;
  tier: BodyQuestTier;
  nameRu: string;
  description: string;
  introMessages: DialogMessage[];
  completeMessages: DialogMessage[];
  objectives: BodyQuestObjective[];
  rewardSpellId: string;
  xpReward: number;
  prerequisiteBodyQuestId?: string;
  conflictQuestId?: string;
}

export type ConflictSide = 'attacker' | 'defender';

export interface ConflictSideDef {
  side: ConflictSide;
  bodyIds: string[];
  objectiveDescription: string;
  npcCount: number;
}

export interface ConflictQuestDef {
  id: string;
  nameRu: string;
  description: string;
  location: string;
  sides: [ConflictSideDef, ConflictSideDef];
}
