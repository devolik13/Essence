import { STARTER_BODIES, BodyDefinition, WeaponType, BodyType, DamageType } from '../types/bodies';
import { StatName } from '../types/stats';
import { WEAPONS, STRENGTH_WEAPONS, AGILITY_WEAPONS } from './weapons';

export { STARTER_BODIES };

export function getStarterBody(id: string) {
  return STARTER_BODIES.find(b => b.id === id);
}

export function getStarterBodyForWeapon(wt: WeaponType): BodyDefinition {
  const w = WEAPONS[wt];
  let damageType: DamageType;
  let caps: Partial<Record<StatName, number>>;
  let color: number;

  if (STRENGTH_WEAPONS.includes(wt)) {
    damageType = 'melee';
    caps = { [StatName.Strength]: 30, [StatName.Armor]: 15, [StatName.Health]: 5 };
    color = 0xcc3333;
  } else if (AGILITY_WEAPONS.includes(wt)) {
    damageType = w.isMelee ? 'melee' : 'ranged';
    caps = { [StatName.Agility]: 30 };
    color = 0x33cc33;
  } else {
    damageType = 'magic';
    caps = { [StatName.Intellect]: 30, [StatName.Mana]: 15, [StatName.Will]: 5 };
    color = 0x3366ff;
  }

  return {
    id: `starter_${wt}`,
    name: w.nameRu,
    nameRu: w.nameRu,
    type: BodyType.Combat,
    damageType,
    caps,
    xpReward: 40,
    weapon: wt,
    color,
    abilityName: 'Attack',
    canUseAllSpells: true,
  };
}

export function lookupStarterBody(id: string): BodyDefinition | undefined {
  const existing = STARTER_BODIES.find(b => b.id === id);
  if (existing) return existing;

  if (id.startsWith('starter_')) {
    const weaponType = id.substring(8) as WeaponType;
    if (Object.values(WeaponType).includes(weaponType)) {
      return getStarterBodyForWeapon(weaponType);
    }
  }
  return undefined;
}
