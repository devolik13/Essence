import { DialogMessage } from '../data/dialogs';

export type BodyQuestTier = 1 | 2 | 3;

export type BodyObjectiveType = 'kill' | 'survive' | 'escort' | 'collect' | 'reach' | 'protect' | 'steal' | 'destroy' | 'meditate';

export interface BodyQuestObjective {
  type: BodyObjectiveType;
  targetId?: string;
  targetNameRu?: string;
  targetNameEn?: string;
  /** Для 'kill': категория цели (напр. 'elemental'). Убийство засчитывается только
   *  если у убитого совпадает категория. Без targetId и targetCategory — любое убийство. */
  targetCategory?: string;
  count: number;
  description: string;
  descriptionEn?: string;
  /** For 'protect': max distance (px) the player can stray from the target. Reset on exit. */
  zoneRadius?: number;
  /** For 'meditate': radius (px) within which the timer ticks. Leaving relocates the spot. */
  meditateRadius?: number;
}

export interface BodyQuestSpawnObject {
  objectId: string;
  nameRu: string;
  nameEn?: string;
  icon: string;
  color: number;
  type: 'collectible' | 'waypoint' | 'destructible';
  count: number;
  radius: number;
  /** Фиксированная точка спавна (напр. орочий лагерь). Если нет — вокруг игрока. */
  anchor?: { x: number; y: number };
}

export interface BodyQuestDef {
  id: string;
  bodyId: string;
  tier: BodyQuestTier;
  nameRu: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  introMessages: DialogMessage[];
  completeMessages: DialogMessage[];
  objectives: BodyQuestObjective[];
  rewardSpellId: string;
  xpReward: number;
  prerequisiteBodyQuestId?: string;
  conflictQuestId?: string;
  spawnObjects?: BodyQuestSpawnObject[];
  /** Враги, спавнящиеся при старте квеста и агрящиеся на игрока (напр. гоблины
   *  набегают на орка-вождя). Без anchor — вокруг игрока. */
  spawnEnemies?: { creatureId: string; count: number; radius?: number; anchor?: { x: number; y: number } }[];
  friendlyCreatureIds?: string[];
  /** Повторяемый квест: не помечается завершённым навсегда (можно получить
   *  снова при повторном захвате тела). Для нарративных «врат» вроде Игниса. */
  repeatable?: boolean;
}

export type ConflictSide = 'attacker' | 'defender';

export interface ConflictSideDef {
  side: ConflictSide;
  bodyIds: string[];
  objectiveDescription: string;
  objectiveDescriptionEn?: string;
  npcCount: number;
}

export interface ConflictQuestDef {
  id: string;
  nameRu: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  location: string;
  sides: [ConflictSideDef, ConflictSideDef];
}
