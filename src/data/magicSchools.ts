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
  nameEn?: string;
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
  /** Шанс пробить % защиты на этот удар (земля) */
  penetrationChance?: number;
  /** % защиты игнорируемой при срабатывании (0.2 = 20%) */
  penetrationPercent?: number;
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
    nameRu: 'Пробивание защиты',
    penetrationChance: 0.2,
    penetrationPercent: 0.2,
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
