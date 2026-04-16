import { STARTER_BODIES, BodyDefinition, WeaponType, BodyType, DamageType } from '../types/bodies';
import { StatName } from '../types/stats';
import { WEAPONS, STRENGTH_WEAPONS, AGILITY_WEAPONS } from './weapons';

export { STARTER_BODIES };

export function getStarterBody(id: string) {
  return STARTER_BODIES.find(b => b.id === id);
}

const STARTER_CAPS: Partial<Record<StatName, number>> = {
  [StatName.Strength]: 10,
  [StatName.Agility]: 10,
  [StatName.Accuracy]: 10,
  [StatName.Evasion]: 10,
  [StatName.Health]: 10,
  [StatName.Armor]: 10,
  [StatName.Intellect]: 10,
  [StatName.Will]: 10,
  [StatName.Mana]: 10,
  [StatName.Luck]: 10,
};

export function getStarterBodyForWeapon(wt: WeaponType): BodyDefinition {
  const w = WEAPONS[wt];
  let damageType: DamageType;
  let color: number;

  if (STRENGTH_WEAPONS.includes(wt)) {
    damageType = 'melee';
    color = 0xcc3333;
  } else if (AGILITY_WEAPONS.includes(wt)) {
    damageType = w.isMelee ? 'melee' : 'ranged';
    color = 0x33cc33;
  } else {
    damageType = 'magic';
    color = 0x3366ff;
  }

  return {
    id: `starter_${wt}`,
    name: w.nameRu,
    nameRu: w.nameRu,
    type: BodyType.Combat,
    damageType,
    caps: { ...STARTER_CAPS },
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
