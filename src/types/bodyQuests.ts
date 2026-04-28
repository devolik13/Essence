import { DialogMessage } from '../data/dialogs';

export type BodyQuestTier = 1 | 2 | 3;

export type BodyObjectiveType = 'kill' | 'survive' | 'escort' | 'collect' | 'reach' | 'protect' | 'steal' | 'destroy';

export interface BodyQuestObjective {
  type: BodyObjectiveType;
  targetId?: string;
  targetNameRu?: string;
  count: number;
  description: string;
  /** For 'protect': max distance (px) the player can stray from the target. Reset on exit. */
  zoneRadius?: number;
}

export interface BodyQuestSpawnObject {
  objectId: string;
  nameRu: string;
  icon: string;
  color: number;
  type: 'collectible' | 'waypoint' | 'destructible';
  count: number;
  radius: number;
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
  spawnObjects?: BodyQuestSpawnObject[];
  friendlyCreatureIds?: string[];
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
