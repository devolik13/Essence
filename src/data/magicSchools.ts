/**
 * Школы магии — бонусные эффекты при касте любого заклинания школы.
 *
 * Движок проверяет spell.school → применяет бонус автоматически.
 * Если у заклинания есть собственный statusEffect — он перекрывает школьный.
 */
import { StatusEffectId } from '../types/statuses';

export type MagicSchool =
  | 'fire' | 'water' | 'earth' | 'wind'
  | 'nature' | 'neutral'
  // Будущие школы (Глава 2+)
  | 'poison' | 'light' | 'darkness' | 'necromancy' | 'blood';

export interface SchoolBonus {
  nameRu: string;
  /** Статус на цель (огонь → горение, вода → охлаждение) */
  statusEffect?: StatusEffectId;
  /** Шанс наложить статус (0-1) */
  statusChance?: number;
  /** Шанс двойного урона (ветер) */
  doubleDamageChance?: number;
  /** Шанс самоисцеления при касте (природа) */
  selfHealChance?: number;
  /** % от макс HP для самоисцеления */
  selfHealPercent?: number;
}

export const SCHOOL_BONUSES: Partial<Record<MagicSchool, SchoolBonus>> = {
  fire: {
    nameRu: 'Горение',
    statusEffect: 'burn',
    statusChance: 0.1,
  },
  water: {
    nameRu: 'Охлаждение',
    statusEffect: 'chill',
    statusChance: 0.2,
  },
  earth: {
    nameRu: 'Сокрушение брони',
    statusEffect: 'armor_reduce',
    statusChance: 0.2,
  },
  wind: {
    nameRu: 'Двойной урон',
    doubleDamageChance: 0.2,
  },
  nature: {
    nameRu: 'Самоисцеление',
    selfHealChance: 0.2,
    selfHealPercent: 0.05,
  },
  neutral: {
    nameRu: 'Нейтральная',
    // Нет школьного бонуса
  },
};
