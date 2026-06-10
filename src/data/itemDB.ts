import { ItemDef, LootEntry, RecipeDef } from '../types/items';
import { StatName } from '../types/stats';
import { getItemWeaponType } from './weapons';
import { WeaponType } from '../types/bodies';

// data/itemDB.ts ↔ имя поля статбонуса предмета → StatName
const EQUIP_STAT_MAP: Record<string, StatName> = {
  strength: StatName.Strength, agility: StatName.Agility,
  health: StatName.Health, armor: StatName.Armor,
  evasion: StatName.Evasion,
  intellect: StatName.Intellect, will: StatName.Will,
  mana: StatName.Mana, luck: StatName.Luck,
};

/**
 * Суммарные бонусы статов от надетой экипировки (statBonuses + armorBonus +
 * manaBonus). Единый источник — раньше эта логика дублировалась в GameScene
 * и UIScene.
 */
/** Щит работает только с одноручным оружием щитовой группы: меч или булава. */
export function isShieldCompatibleWeapon(itemId: string | undefined): boolean {
  if (!itemId) return false;
  const wt = getItemWeaponType(itemId);
  return wt === WeaponType.Sword || wt === WeaponType.Mace;
}

export function equipmentStatBonuses(
  equipment: Record<string, string | undefined>,
  /** Активный оружейный слот (0 = weapon, 1 = weapon2). Неактивное оружие
   *  не даёт статов — учитывается только то, что сейчас в руках. */
  activeWeaponSlot: number = 0,
): Partial<Record<StatName, number>> {
  const bonuses: Partial<Record<StatName, number>> = {};
  const add = (s: StatName, v: number) => { bonuses[s] = (bonuses[s] ?? 0) + v; };
  // Слот неактивного оружия пропускаем (бонусы только от активного).
  const inactiveWeaponSlot = activeWeaponSlot === 0 ? 'weapon2' : 'weapon';
  // Щит активен только с мечом/булавой В РУКАХ (правило дизайна): с двуручником/
  // луком/посохом его бонусы отключаются (сам предмет остаётся надетым).
  const activeWeaponId = equipment[activeWeaponSlot === 0 ? 'weapon' : 'weapon2'];
  const shieldActive = isShieldCompatibleWeapon(activeWeaponId);
  for (const slotKey of Object.keys(equipment)) {
    if (slotKey === inactiveWeaponSlot) continue;
    if (slotKey === 'shield' && !shieldActive) continue;
    const itemId = equipment[slotKey];
    if (!itemId) continue;
    const def = ITEMS[itemId];
    if (!def) continue;
    if (def.statBonuses) {
      for (const [stat, val] of Object.entries(def.statBonuses)) {
        const sn = EQUIP_STAT_MAP[stat];
        if (sn && val) add(sn, val);
      }
    }
    if (def.armorBonus) add(StatName.Armor, def.armorBonus);
    if (def.manaBonus) add(StatName.Mana, def.manaBonus);
  }
  return bonuses;
}

// ─── Item definitions ─────────────────────────────────────────────────────────

export const ITEMS: Record<string, ItemDef> = {
  // ── Starter Weapons (from weapon vendor, 0 cost) ─────────────────────────
  starter_sword:       { id: 'starter_sword',       nameRu: 'Ржавый меч', nameEn: 'Rusty Sword',       rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Strength', descEn: 'baseDmg 1. +3 Strength', icon: '⚔', statBonuses: {"strength":3} },
  starter_mace:        { id: 'starter_mace',        nameRu: 'Ржавая булава', nameEn: 'Rusty Mace',        rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Strength', descEn: 'baseDmg 1. +3 Strength', icon: '🔨', statBonuses: {"strength":3} },
  starter_greatsword:  { id: 'starter_greatsword',  nameRu: 'Ржавый двуручник', nameEn: 'Rusty Greatsword',  rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Strength', descEn: 'baseDmg 1. +3 Strength', icon: '⚔', statBonuses: {"strength":3} },
  starter_spear:       { id: 'starter_spear',       nameRu: 'Ржавое копьё', nameEn: 'Rusty Spear',       rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Strength', descEn: 'baseDmg 1. +3 Strength', icon: '🔱', statBonuses: {"strength":3} },
  starter_hammer:      { id: 'starter_hammer',       nameRu: 'Ржавый молот', nameEn: 'Rusty Hammer',      rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Strength', descEn: 'baseDmg 1. +3 Strength', icon: '🔨', statBonuses: {"strength":3} },
  starter_dagger:      { id: 'starter_dagger',       nameRu: 'Ржавый кинжал', nameEn: 'Rusty Dagger',      rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Agility', descEn: 'baseDmg 1. +3 Agility', icon: '🗡', statBonuses: {"agility":3} },
  starter_fists:       { id: 'starter_fists',        nameRu: 'Потёртые кастеты', nameEn: 'Worn Knuckles',        rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Agility', descEn: 'baseDmg 1. +3 Agility', icon: '👊', statBonuses: {"agility":3} },
  starter_shortbow:    { id: 'starter_shortbow',     nameRu: 'Ржавый короткий лук', nameEn: 'Rusty Short Bow',   rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Agility', descEn: 'baseDmg 1. +3 Agility', icon: '🏹', statBonuses: {"agility":3} },
  starter_longbow:     { id: 'starter_longbow',      nameRu: 'Ржавый длинный лук', nameEn: 'Rusty Long Bow',    rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Agility', descEn: 'baseDmg 1. +3 Agility', icon: '🏹', statBonuses: {"agility":3} },
  starter_crossbow:    { id: 'starter_crossbow',     nameRu: 'Ржавый арбалет', nameEn: 'Rusty Crossbow',    rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Agility', descEn: 'baseDmg 1. +3 Agility', icon: '🏹', statBonuses: {"agility":3} },
  starter_staff_fire:  { id: 'starter_staff_fire',   nameRu: 'Потёртый огненный посох', nameEn: 'Worn Fire Staff',   rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Intellect', descEn: 'baseDmg 1. +3 Intellect', icon: '🔥', statBonuses: {"intellect":3} },
  starter_staff_water: { id: 'starter_staff_water',  nameRu: 'Потёртый ледяной посох', nameEn: 'Worn Ice Staff',    rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Intellect', descEn: 'baseDmg 1. +3 Intellect', icon: '❄', statBonuses: {"intellect":3} },
  starter_staff_earth: { id: 'starter_staff_earth',  nameRu: 'Потёртый каменный посох', nameEn: 'Worn Stone Staff',  rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Intellect', descEn: 'baseDmg 1. +3 Intellect', icon: '🪨', statBonuses: {"intellect":3} },
  starter_staff_wind:  { id: 'starter_staff_wind',   nameRu: 'Потёртый штормовой посох', nameEn: 'Worn Storm Staff',  rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Intellect', descEn: 'baseDmg 1. +3 Intellect', icon: '🌪', statBonuses: {"intellect":3} },
  starter_staff_nature:{ id: 'starter_staff_nature', nameRu: 'Потёртый посох природы', nameEn: 'Worn Nature Staff', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +3 Intellect', descEn: 'baseDmg 1. +3 Intellect', icon: '🌿', statBonuses: {"intellect":3} },

  // Materials
  rabbit_fur: {
    id: 'rabbit_fur', nameRu: 'Заячья шкурка', nameEn: 'Rabbit Fur', rarity: 'common', type: 'material',
    descRu: 'Мягкая шкурка кролика. Пригодится для крафта.', descEn: 'Soft rabbit fur. Useful for crafting.',
    icon: '~',
  },
  goblin_tooth: {
    id: 'goblin_tooth', nameRu: 'Зуб гоблина', nameEn: 'Goblin Tooth', rarity: 'common', type: 'material',
    descRu: 'Острый зуб гоблина. Коллекционируется авантюристами.', descEn: 'A sharp goblin tooth. Collected by adventurers.',
    icon: '◇',
  },
  wolf_pelt: {
    id: 'wolf_pelt', nameRu: 'Волчья шкура', nameEn: 'Wolf Pelt', rarity: 'uncommon', type: 'material',
    descRu: 'Густая волчья шкура. Тёплая и прочная.', descEn: 'Thick wolf pelt. Warm and sturdy.',
    icon: '◈',
  },
  scout_badge: {
    id: 'scout_badge', nameRu: 'Знак разведчика', nameEn: 'Scout Badge', rarity: 'uncommon', type: 'material',
    descRu: 'Металлический знак вражеского разведчика.', descEn: 'Metal badge of an enemy scout.',
    icon: '▲',
  },
  bear_claw: {
    id: 'bear_claw', nameRu: 'Коготь медведя', nameEn: 'Bear Claw', rarity: 'uncommon', type: 'material',
    descRu: 'Массивный коготь. Острее любого ножа.', descEn: 'A massive claw. Sharper than any knife.',
    icon: '⌖',
  },
  orc_bone: {
    id: 'orc_bone', nameRu: 'Кость орка', nameEn: 'Orc Bone', rarity: 'uncommon', type: 'material',
    descRu: 'Прочная кость орка. Из неё делают амулеты.', descEn: 'Sturdy orc bone. Used to craft amulets.',
    icon: '✦',
  },
  shaman_totem: {
    id: 'shaman_totem', nameRu: 'Тотем шамана', nameEn: 'Shaman Totem', rarity: 'rare', type: 'material',
    descRu: 'Заряженный магической энергией тотем.', descEn: 'A totem charged with magical energy.',
    icon: '✺',
  },
  spirit_essence: {
    id: 'spirit_essence', nameRu: 'Эссенция духа', nameEn: 'Spirit Essence', rarity: 'rare', type: 'material',
    descRu: 'Частица магической сущности лесного духа.', descEn: 'A fragment of forest spirit essence.',
    icon: '◉',
  },
  bandit_coin: {
    id: 'bandit_coin', nameRu: 'Монета разбойника', nameEn: 'Bandit Coin', rarity: 'common', type: 'material',
    descRu: 'Монета со скрещёнными кинжалами — знак разбойничьей гильдии.', descEn: 'A coin with crossed daggers — the mark of the bandit guild.',
    icon: '¤',
  },
  bandit_quiver: {
    id: 'bandit_quiver', nameRu: 'Колчан разбойника', nameEn: 'Bandit Quiver', rarity: 'uncommon', type: 'material',
    descRu: 'Хорошо сделанный колчан. Стрелы подобраны с умом.', descEn: 'A well-made quiver. The arrows were chosen with care.',
    icon: '↑',
  },
  bandit_bolt: {
    id: 'bandit_bolt', nameRu: 'Арбалетный болт', nameEn: 'Crossbow Bolt', rarity: 'uncommon', type: 'material',
    descRu: 'Тяжёлый болт с бронебойным наконечником.', descEn: 'A heavy bolt with an armor-piercing tip.',
    icon: '→',
  },
  // ── Gathering Tools (from vendor, free) ──────────────────────────────────
  pickaxe: {
    id: 'pickaxe', nameRu: 'Кирка', nameEn: 'Pickaxe', rarity: 'common', type: 'material',
    descRu: 'Required for mining ore.', descEn: 'Required for mining ore.', icon: '⛏',
  },
  axe: {
    id: 'axe', nameRu: 'Топор', nameEn: 'Axe', rarity: 'common', type: 'material',
    descRu: 'Required for chopping wood.', descEn: 'Required for chopping wood.', icon: '🪓',
  },
  skinning_knife: {
    id: 'skinning_knife', nameRu: 'Нож для разделки', nameEn: 'Skinning Knife', rarity: 'common', type: 'material',
    descRu: 'Required for gathering trophies.', descEn: 'Required for gathering trophies.', icon: '🔪',
  },

  // ── Gathering Resources T1 ───────────────────────────────────────────────
  // Mining
  copper_ore: {
    id: 'copper_ore', nameRu: 'Медная руда', nameEn: 'Copper Ore', rarity: 'common', type: 'material',
    descRu: 'Soft metal, base for T1 crafting.', descEn: 'Soft metal, base for T1 crafting.', icon: '⛏',
  },
  // Woodcutting
  willow_branch: {
    id: 'willow_branch', nameRu: 'Ивовая ветка', nameEn: 'Willow Branch', rarity: 'common', type: 'material',
    descRu: 'Flexible wood for arrows and T1 gear.', descEn: 'Flexible wood for arrows and T1 gear.', icon: '🌿',
  },
  // Trophy
  wolf_hide: {
    id: 'wolf_hide', nameRu: 'Волчья шкура', nameEn: 'Wolf Hide', rarity: 'common', type: 'material',
    descRu: 'Common hide for light armor.', descEn: 'Common hide for light armor.', icon: '🦴',
  },

  // ── Crafting Materials T1 (новая схема брони) ────────────────────────────
  // Дроп со зверей (любых) — основа Heavy/вторичка Leather.
  beast_hide: {
    id: 'beast_hide', nameRu: 'Шкура зверя', nameEn: 'Beast Hide', rarity: 'common', type: 'material',
    descRu: 'Шкура с убитого зверя. Для брони Heavy/Leather.', descEn: 'Hide from a slain beast. Used for Heavy and Leather armor.', icon: '🟤',
  },
  // Сбор с кустов (нож) — вторичка Leather/Robe.
  plant_fiber: {
    id: 'plant_fiber', nameRu: 'Растительное волокно', nameEn: 'Plant Fiber', rarity: 'common', type: 'material',
    descRu: 'Волокно из кустов. Для прошивки кожи и ткани.', descEn: 'Fiber from bushes. For stitching leather and cloth.', icon: '🌾',
  },
  // Дроп с элементалей (слаймов) — основа Robe.
  elemental_sphere: {
    id: 'elemental_sphere', nameRu: 'Сфера стихии', nameEn: 'Elemental Sphere', rarity: 'uncommon', type: 'material',
    descRu: 'Ядро стихийного существа. Основа магической робы.', descEn: 'Core of an elemental creature. Base of mage robes.', icon: '🔮',
  },
  // Дроп с гуманоидов — на будущее (руны/аксессуары).
  humanoid_relic: {
    id: 'humanoid_relic', nameRu: 'Самоцвет гуманоида', nameEn: 'Humanoid Gem', rarity: 'uncommon', type: 'material',
    descRu: 'Трофей с гуманоида. Пригодится для рун и украшений.', descEn: 'A trophy from a humanoid. Useful for runes and jewelry.', icon: '💎',
  },
  // Покупается у торговца — прошивка кожи/ткани.
  thread: {
    id: 'thread', nameRu: 'Нитки', nameEn: 'Thread', rarity: 'common', type: 'material',
    descRu: 'Прочные нитки. Только у торговца.', descEn: 'Sturdy thread. Vendor only.', icon: '🧵',
  },
  // Покупается у торговца — скрепить пластины Heavy.
  rivets: {
    id: 'rivets', nameRu: 'Заклёпки', nameEn: 'Rivets', rarity: 'common', type: 'material',
    descRu: 'Металлические заклёпки. Только у торговца.', descEn: 'Metal rivets. Vendor only.', icon: '🔩',
  },
  // Брёвна с деревьев — древесина для оружия и древков.
  wood_log: {
    id: 'wood_log', nameRu: 'Древесина', nameEn: 'Wood Log', rarity: 'common', type: 'material',
    descRu: 'Брёвна с деревьев. Для оружия и древков.', descEn: 'Logs from trees. For weapons and shafts.', icon: '🪵',
  },

// ── Craftable Weapons T1-T3 ──────────────────────────────────────────────
  sword_t1: { id: 'sword_t1', nameRu: 'Стальной меч', nameEn: 'Steel Sword', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 13. +1 Strength', descEn: 'baseDmg 13. +1 Strength', icon: '⚔', statBonuses: {"strength":1} },
  sword_t2: { id: 'sword_t2', nameRu: 'Закалённый меч', nameEn: 'Tempered Sword', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 14. +2 Strength', descEn: 'baseDmg 14. +2 Strength', icon: '⚔', statBonuses: {"strength":2} },
  sword_t3: { id: 'sword_t3', nameRu: 'Мастерский меч', nameEn: 'Masterwork Sword', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 15. +3 Strength', descEn: 'baseDmg 15. +3 Strength', icon: '⚔', statBonuses: {"strength":3} },
  mace_t1: { id: 'mace_t1', nameRu: 'Стальная булава', nameEn: 'Steel Mace', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 15. +1 Strength', descEn: 'baseDmg 15. +1 Strength', icon: '🔨', statBonuses: {"strength":1} },
  mace_t2: { id: 'mace_t2', nameRu: 'Закалённая булава', nameEn: 'Tempered Mace', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 16. +2 Strength', descEn: 'baseDmg 16. +2 Strength', icon: '🔨', statBonuses: {"strength":2} },
  mace_t3: { id: 'mace_t3', nameRu: 'Мастерская булава', nameEn: 'Masterwork Mace', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 17. +3 Strength', descEn: 'baseDmg 17. +3 Strength', icon: '🔨', statBonuses: {"strength":3} },
  greatsword_t1: { id: 'greatsword_t1', nameRu: 'Стальной двуручник', nameEn: 'Steel Greatsword', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 21. +2 Strength', descEn: 'baseDmg 21. +2 Strength', icon: '⚔', statBonuses: {"strength":2} },
  greatsword_t2: { id: 'greatsword_t2', nameRu: 'Закалённый двуручник', nameEn: 'Tempered Greatsword', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 22. +3 Strength', descEn: 'baseDmg 22. +3 Strength', icon: '⚔', statBonuses: {"strength":3} },
  greatsword_t3: { id: 'greatsword_t3', nameRu: 'Мастерский двуручник', nameEn: 'Masterwork Greatsword', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 23. +4 Strength', descEn: 'baseDmg 23. +4 Strength', icon: '⚔', statBonuses: {"strength":4} },
  spear_t1: { id: 'spear_t1', nameRu: 'Стальное копьё', nameEn: 'Steel Spear', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 17. +2 Strength', descEn: 'baseDmg 17. +2 Strength', icon: '🔱', statBonuses: {"strength":2} },
  spear_t2: { id: 'spear_t2', nameRu: 'Закалённое копьё', nameEn: 'Tempered Spear', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 18. +3 Strength', descEn: 'baseDmg 18. +3 Strength', icon: '🔱', statBonuses: {"strength":3} },
  spear_t3: { id: 'spear_t3', nameRu: 'Мастерское копьё', nameEn: 'Masterwork Spear', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 19. +4 Strength', descEn: 'baseDmg 19. +4 Strength', icon: '🔱', statBonuses: {"strength":4} },
  hammer_t1: { id: 'hammer_t1', nameRu: 'Стальной молот', nameEn: 'Steel Hammer', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 23. +2 Strength', descEn: 'baseDmg 23. +2 Strength', icon: '🔨', statBonuses: {"strength":2} },
  hammer_t2: { id: 'hammer_t2', nameRu: 'Закалённый молот', nameEn: 'Tempered Hammer', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 24. +3 Strength', descEn: 'baseDmg 24. +3 Strength', icon: '🔨', statBonuses: {"strength":3} },
  hammer_t3: { id: 'hammer_t3', nameRu: 'Мастерский молот', nameEn: 'Masterwork Hammer', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 25. +4 Strength', descEn: 'baseDmg 25. +4 Strength', icon: '🔨', statBonuses: {"strength":4} },
  dagger_t1: { id: 'dagger_t1', nameRu: 'Стальной кинжал', nameEn: 'Steel Dagger', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 9. +1 Agility', descEn: 'baseDmg 9. +1 Agility', icon: '🗡', statBonuses: {"agility":1} },
  dagger_t2: { id: 'dagger_t2', nameRu: 'Закалённый кинжал', nameEn: 'Tempered Dagger', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 10. +2 Agility', descEn: 'baseDmg 10. +2 Agility', icon: '🗡', statBonuses: {"agility":2} },
  dagger_t3: { id: 'dagger_t3', nameRu: 'Мастерский кинжал', nameEn: 'Masterwork Dagger', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +3 Agility', descEn: 'baseDmg 11. +3 Agility', icon: '🗡', statBonuses: {"agility":3} },
  fists_t1: { id: 'fists_t1', nameRu: 'Стальные кастеты', nameEn: 'Steel Knuckles', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +1 Agility', descEn: 'baseDmg 11. +1 Agility', icon: '👊', statBonuses: {"agility":1} },
  fists_t2: { id: 'fists_t2', nameRu: 'Закалённые кастеты', nameEn: 'Tempered Knuckles', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 12. +2 Agility', descEn: 'baseDmg 12. +2 Agility', icon: '👊', statBonuses: {"agility":2} },
  fists_t3: { id: 'fists_t3', nameRu: 'Мастерские кастеты', nameEn: 'Masterwork Knuckles', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 13. +3 Agility', descEn: 'baseDmg 13. +3 Agility', icon: '👊', statBonuses: {"agility":3} },
  shortbow_t1: { id: 'shortbow_t1', nameRu: 'Стальной короткий лук', nameEn: 'Steel Short Bow', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +1 Agility', descEn: 'baseDmg 11. +1 Agility', icon: '🏹', statBonuses: {"agility":1} },
  shortbow_t2: { id: 'shortbow_t2', nameRu: 'Закалённый короткий лук', nameEn: 'Tempered Short Bow', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 12. +2 Agility', descEn: 'baseDmg 12. +2 Agility', icon: '🏹', statBonuses: {"agility":2} },
  shortbow_t3: { id: 'shortbow_t3', nameRu: 'Мастерский короткий лук', nameEn: 'Masterwork Short Bow', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 13. +3 Agility', descEn: 'baseDmg 13. +3 Agility', icon: '🏹', statBonuses: {"agility":3} },
  longbow_t1: { id: 'longbow_t1', nameRu: 'Стальной длинный лук', nameEn: 'Steel Long Bow', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 16. +1 Agility', descEn: 'baseDmg 16. +1 Agility', icon: '🏹', statBonuses: {"agility":1} },
  longbow_t2: { id: 'longbow_t2', nameRu: 'Закалённый длинный лук', nameEn: 'Tempered Long Bow', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 17. +2 Agility', descEn: 'baseDmg 17. +2 Agility', icon: '🏹', statBonuses: {"agility":2} },
  longbow_t3: { id: 'longbow_t3', nameRu: 'Мастерский длинный лук', nameEn: 'Masterwork Long Bow', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 18. +3 Agility', descEn: 'baseDmg 18. +3 Agility', icon: '🏹', statBonuses: {"agility":3} },
  crossbow_t1: { id: 'crossbow_t1', nameRu: 'Стальной арбалет', nameEn: 'Steel Crossbow', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 19. +1 Agility', descEn: 'baseDmg 19. +1 Agility', icon: '🏹', statBonuses: {"agility":1} },
  crossbow_t2: { id: 'crossbow_t2', nameRu: 'Закалённый арбалет', nameEn: 'Tempered Crossbow', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 20. +2 Agility', descEn: 'baseDmg 20. +2 Agility', icon: '🏹', statBonuses: {"agility":2} },
  crossbow_t3: { id: 'crossbow_t3', nameRu: 'Мастерский арбалет', nameEn: 'Masterwork Crossbow', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 21. +3 Agility', descEn: 'baseDmg 21. +3 Agility', icon: '🏹', statBonuses: {"agility":3} },
  staff_fire_t1: { id: 'staff_fire_t1', nameRu: 'Стальной огненный посох', nameEn: 'Steel Fire Staff', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 10. +1 Intellect', descEn: 'baseDmg 10. +1 Intellect', icon: '🔥', statBonuses: {"intellect":1} },
  staff_fire_t2: { id: 'staff_fire_t2', nameRu: 'Закалённый огненный посох', nameEn: 'Tempered Fire Staff', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +2 Intellect', descEn: 'baseDmg 11. +2 Intellect', icon: '🔥', statBonuses: {"intellect":2} },
  staff_fire_t3: { id: 'staff_fire_t3', nameRu: 'Мастерский огненный посох', nameEn: 'Masterwork Fire Staff', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 12. +3 Intellect', descEn: 'baseDmg 12. +3 Intellect', icon: '🔥', statBonuses: {"intellect":3} },
  staff_water_t1: { id: 'staff_water_t1', nameRu: 'Стальной ледяной посох', nameEn: 'Steel Ice Staff', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 10. +1 Intellect', descEn: 'baseDmg 10. +1 Intellect', icon: '❄', statBonuses: {"intellect":1} },
  staff_water_t2: { id: 'staff_water_t2', nameRu: 'Закалённый ледяной посох', nameEn: 'Tempered Ice Staff', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +2 Intellect', descEn: 'baseDmg 11. +2 Intellect', icon: '❄', statBonuses: {"intellect":2} },
  staff_water_t3: { id: 'staff_water_t3', nameRu: 'Мастерский ледяной посох', nameEn: 'Masterwork Ice Staff', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 12. +3 Intellect', descEn: 'baseDmg 12. +3 Intellect', icon: '❄', statBonuses: {"intellect":3} },
  staff_earth_t1: { id: 'staff_earth_t1', nameRu: 'Стальной каменный посох', nameEn: 'Steel Stone Staff', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 10. +1 Intellect', descEn: 'baseDmg 10. +1 Intellect', icon: '🪨', statBonuses: {"intellect":1} },
  staff_earth_t2: { id: 'staff_earth_t2', nameRu: 'Закалённый каменный посох', nameEn: 'Tempered Stone Staff', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +2 Intellect', descEn: 'baseDmg 11. +2 Intellect', icon: '🪨', statBonuses: {"intellect":2} },
  staff_earth_t3: { id: 'staff_earth_t3', nameRu: 'Мастерский каменный посох', nameEn: 'Masterwork Stone Staff', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 12. +3 Intellect', descEn: 'baseDmg 12. +3 Intellect', icon: '🪨', statBonuses: {"intellect":3} },
  staff_wind_t1: { id: 'staff_wind_t1', nameRu: 'Стальной штормовой посох', nameEn: 'Steel Storm Staff', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 10. +1 Intellect', descEn: 'baseDmg 10. +1 Intellect', icon: '🌪', statBonuses: {"intellect":1} },
  staff_wind_t2: { id: 'staff_wind_t2', nameRu: 'Закалённый штормовой посох', nameEn: 'Tempered Storm Staff', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +2 Intellect', descEn: 'baseDmg 11. +2 Intellect', icon: '🌪', statBonuses: {"intellect":2} },
  staff_wind_t3: { id: 'staff_wind_t3', nameRu: 'Мастерский штормовой посох', nameEn: 'Masterwork Storm Staff', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 12. +3 Intellect', descEn: 'baseDmg 12. +3 Intellect', icon: '🌪', statBonuses: {"intellect":3} },
  staff_nature_t1: { id: 'staff_nature_t1', nameRu: 'Стальной посох природы', nameEn: 'Steel Nature Staff', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 10. +1 Intellect', descEn: 'baseDmg 10. +1 Intellect', icon: '🌿', statBonuses: {"intellect":1} },
  staff_nature_t2: { id: 'staff_nature_t2', nameRu: 'Закалённый посох природы', nameEn: 'Tempered Nature Staff', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +2 Intellect', descEn: 'baseDmg 11. +2 Intellect', icon: '🌿', statBonuses: {"intellect":2} },
  staff_nature_t3: { id: 'staff_nature_t3', nameRu: 'Мастерский посох природы', nameEn: 'Masterwork Nature Staff', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 12. +3 Intellect', descEn: 'baseDmg 12. +3 Intellect', icon: '🌿', statBonuses: {"intellect":3} },
  shield_t1: { id: 'shield_t1', nameRu: 'Стальной щит', nameEn: 'Steel Shield', rarity: 'common', type: 'equipment', equipSlot: 'shield', descRu: '+2 Armor, +1 Health · только меч/булава', descEn: '+2 Armor, +1 Health · Sword/Mace only', icon: '🛡', statBonuses: {"armor":2,"health":1} },
  shield_t2: { id: 'shield_t2', nameRu: 'Закалённый щит', nameEn: 'Tempered Shield', rarity: 'uncommon', type: 'equipment', equipSlot: 'shield', descRu: '+4 Armor, +2 Health · только меч/булава', descEn: '+4 Armor, +2 Health · Sword/Mace only', icon: '🛡', statBonuses: {"armor":4,"health":2} },

  // ── Starter Armor — Heavy (STR) ──────────────────────────────────────────
  starter_heavy_helmet: { id: 'starter_heavy_helmet', nameRu: 'Старый железный шлем', nameEn: 'Old Iron Helmet',   rarity: 'common', type: 'equipment', equipSlot: 'helmet', descRu: '+1 Armor. +1 Health', descEn: '+1 Armor. +1 Health', icon: '⛑', armorBonus: 1, statBonuses: {"health":1} },
  starter_heavy_chest:  { id: 'starter_heavy_chest',  nameRu: 'Старый нагрудник', nameEn: 'Old Chestplate',  rarity: 'common', type: 'equipment', equipSlot: 'chest',  descRu: '+2 Armor. +1 Health', descEn: '+2 Armor. +1 Health', icon: '🛡', armorBonus: 2, statBonuses: {"health":1} },
  starter_heavy_gloves: { id: 'starter_heavy_gloves', nameRu: 'Старые рукавицы', nameEn: 'Old Gauntlets',   rarity: 'common', type: 'equipment', equipSlot: 'gloves', descRu: '+1 Strength', descEn: '+1 Strength',        icon: '🧤', armorBonus: 0, statBonuses: {"strength":1} },
  starter_heavy_boots:  { id: 'starter_heavy_boots',  nameRu: 'Старые поножи', nameEn: 'Old Greaves',     rarity: 'common', type: 'equipment', equipSlot: 'boots',  descRu: '+1 Health', descEn: '+1 Health',           icon: '👢', armorBonus: 0, statBonuses: {"health":1} },

  // ── Starter Armor — Leather (AGI) ────────────────────────────────────────
  starter_leather_helmet: { id: 'starter_leather_helmet', nameRu: 'Потёртый капюшон', nameEn: 'Worn Hood',          rarity: 'common', type: 'equipment', equipSlot: 'helmet', descRu: '+1 Evasion', descEn: '+1 Evasion',            icon: '⛑', armorBonus: 0, statBonuses: {} },
  starter_leather_chest:  { id: 'starter_leather_chest',  nameRu: 'Потёртый кожаный жилет', nameEn: 'Worn Leather Vest',  rarity: 'common', type: 'equipment', equipSlot: 'chest',  descRu: '+1 Armor. +1 Agility', descEn: '+1 Armor. +1 Agility', icon: '🛡', armorBonus: 1, statBonuses: {"agility":1} },
  starter_leather_gloves: { id: 'starter_leather_gloves', nameRu: 'Потёртые наручи', nameEn: 'Worn Bracers',       rarity: 'common', type: 'equipment', equipSlot: 'gloves', descRu: '+1 Accuracy', descEn: '+1 Accuracy',           icon: '🧤', armorBonus: 0, statBonuses: {} },
  starter_leather_boots:  { id: 'starter_leather_boots',  nameRu: 'Потёртые кожаные сапоги', nameEn: 'Worn Leather Boots', rarity: 'common', type: 'equipment', equipSlot: 'boots',  descRu: '+1 Evasion', descEn: '+1 Evasion',            icon: '👢', armorBonus: 0, statBonuses: {} },

  // ── Starter Armor — Robe (INT) ───────────────────────────────────────────
  starter_robe_helmet: { id: 'starter_robe_helmet', nameRu: 'Рваная шляпа', nameEn: 'Tattered Hat',     rarity: 'common', type: 'equipment', equipSlot: 'helmet', descRu: '+1 Will', descEn: '+1 Will',      icon: '⛑', armorBonus: 0, statBonuses: {"will":1} },
  starter_robe_chest:  { id: 'starter_robe_chest',  nameRu: 'Рваная роба', nameEn: 'Tattered Robe',    rarity: 'common', type: 'equipment', equipSlot: 'chest',  descRu: '+1 Int. +1 Will', descEn: '+1 Int. +1 Will', icon: '🛡', armorBonus: 0, statBonuses: {"intellect":1,"will":1} },
  starter_robe_gloves: { id: 'starter_robe_gloves', nameRu: 'Рваные обмотки', nameEn: 'Tattered Wraps',   rarity: 'common', type: 'equipment', equipSlot: 'gloves', descRu: '+1 Intellect', descEn: '+1 Intellect', icon: '🧤', armorBonus: 0, statBonuses: {"intellect":1} },
  starter_robe_boots:  { id: 'starter_robe_boots',  nameRu: 'Рваные сандалии', nameEn: 'Tattered Sandals', rarity: 'common', type: 'equipment', equipSlot: 'boots',  descRu: '+1 Mana', descEn: '+1 Mana',      icon: '👢', armorBonus: 0, statBonuses: {"mana":1} },

  // ── Heavy Armor T1-T3 (STR) ──────────────────────────────────────────────
  helmet_t1: { id: 'helmet_t1', nameRu: 'Стальной шлем', nameEn: 'Steel Helmet', rarity: 'common', type: 'equipment', equipSlot: 'helmet', descRu: '+2 Armor. +1 Health', descEn: '+2 Armor. +1 Health', icon: '⛑', armorBonus: 2, statBonuses: {"health":1} },
  helmet_t2: { id: 'helmet_t2', nameRu: 'Закалённый шлем', nameEn: 'Tempered Helmet', rarity: 'uncommon', type: 'equipment', equipSlot: 'helmet', descRu: '+4 Armor. +2 Health', descEn: '+4 Armor. +2 Health', icon: '⛑', armorBonus: 4, statBonuses: {"health":2} },
  helmet_t3: { id: 'helmet_t3', nameRu: 'Мастерский шлем', nameEn: 'Masterwork Helmet', rarity: 'rare', type: 'equipment', equipSlot: 'helmet', descRu: '+6 Armor. +3 Health, +1 Will', descEn: '+6 Armor. +3 Health, +1 Will', icon: '⛑', armorBonus: 6, statBonuses: {"health":3,"will":1} },
  chest_t1: { id: 'chest_t1', nameRu: 'Стальной нагрудник', nameEn: 'Steel Chestplate', rarity: 'common', type: 'equipment', equipSlot: 'chest', descRu: '+5 Armor. +2 Health', descEn: '+5 Armor. +2 Health', icon: '🛡', armorBonus: 5, statBonuses: {"health":2} },
  chest_t2: { id: 'chest_t2', nameRu: 'Закалённый нагрудник', nameEn: 'Tempered Chestplate', rarity: 'uncommon', type: 'equipment', equipSlot: 'chest', descRu: '+8 Armor. +3 Health, +1 Armor', descEn: '+8 Armor. +3 Health, +1 Armor', icon: '🛡', armorBonus: 8, statBonuses: {"health":3,"armor":1} },
  chest_t3: { id: 'chest_t3', nameRu: 'Мастерский нагрудник', nameEn: 'Masterwork Chestplate', rarity: 'rare', type: 'equipment', equipSlot: 'chest', descRu: '+12 Armor. +4 Health, +2 Armor', descEn: '+12 Armor. +4 Health, +2 Armor', icon: '🛡', armorBonus: 12, statBonuses: {"health":4,"armor":2} },
  gloves_t1: { id: 'gloves_t1', nameRu: 'Стальные перчатки', nameEn: 'Steel Gloves', rarity: 'common', type: 'equipment', equipSlot: 'gloves', descRu: '+1 Armor. +1 Accuracy', descEn: '+1 Armor. +1 Accuracy', icon: '🧤', armorBonus: 1, statBonuses: {} },
  gloves_t2: { id: 'gloves_t2', nameRu: 'Закалённые перчатки', nameEn: 'Tempered Gloves', rarity: 'uncommon', type: 'equipment', equipSlot: 'gloves', descRu: '+2 Armor. +2 Accuracy', descEn: '+2 Armor. +2 Accuracy', icon: '🧤', armorBonus: 2, statBonuses: {} },
  gloves_t3: { id: 'gloves_t3', nameRu: 'Мастерские перчатки', nameEn: 'Masterwork Gloves', rarity: 'rare', type: 'equipment', equipSlot: 'gloves', descRu: '+4 Armor. +3 Accuracy, +1 Agility', descEn: '+4 Armor. +3 Accuracy, +1 Agility', icon: '🧤', armorBonus: 4, statBonuses: {"agility":1} },
  boots_t1: { id: 'boots_t1', nameRu: 'Стальные сапоги', nameEn: 'Steel Boots', rarity: 'common', type: 'equipment', equipSlot: 'boots', descRu: '+1 Armor. +1 Evasion', descEn: '+1 Armor. +1 Evasion', icon: '👢', armorBonus: 1, statBonuses: {} },
  boots_t2: { id: 'boots_t2', nameRu: 'Закалённые сапоги', nameEn: 'Tempered Boots', rarity: 'uncommon', type: 'equipment', equipSlot: 'boots', descRu: '+3 Armor. +2 Evasion', descEn: '+3 Armor. +2 Evasion', icon: '👢', armorBonus: 3, statBonuses: {} },
  boots_t3: { id: 'boots_t3', nameRu: 'Мастерские сапоги', nameEn: 'Masterwork Boots', rarity: 'rare', type: 'equipment', equipSlot: 'boots', descRu: '+5 Armor. +3 Evasion, +1 Agility', descEn: '+5 Armor. +3 Evasion, +1 Agility', icon: '👢', armorBonus: 5, statBonuses: {"agility":1} },

  // ── Leather Armor T1-T3 (AGI) ────────────────────────────────────────────
  leather_helmet_t1: { id: 'leather_helmet_t1', nameRu: 'Кожаный капюшон', nameEn: 'Leather Hood',          rarity: 'common',   type: 'equipment', equipSlot: 'helmet', descRu: '+1 Armor. +1 Agi, +1 Eva', descEn: '+1 Armor. +1 Agi, +1 Eva', icon: '⛑', armorBonus: 1, statBonuses: {"agility":1} },
  leather_helmet_t2: { id: 'leather_helmet_t2', nameRu: 'Закалённый кожаный капюшон', nameEn: 'Tempered Leather Hood', rarity: 'uncommon', type: 'equipment', equipSlot: 'helmet', descRu: '+2 Armor. +2 Agi, +1 Eva', descEn: '+2 Armor. +2 Agi, +1 Eva', icon: '⛑', armorBonus: 2, statBonuses: {"agility":2} },
  leather_helmet_t3: { id: 'leather_helmet_t3', nameRu: 'Мастерский кожаный капюшон', nameEn: 'Masterwork Leather Hood',  rarity: 'rare',     type: 'equipment', equipSlot: 'helmet', descRu: '+3 Armor. +3 Agi, +2 Eva', descEn: '+3 Armor. +3 Agi, +2 Eva', icon: '⛑', armorBonus: 3, statBonuses: {"agility":3} },
  leather_chest_t1:  { id: 'leather_chest_t1',  nameRu: 'Кожаный жилет', nameEn: 'Leather Vest',          rarity: 'common',   type: 'equipment', equipSlot: 'chest',  descRu: '+2 Armor. +2 Agi, +1 Eva', descEn: '+2 Armor. +2 Agi, +1 Eva', icon: '🛡', armorBonus: 2, statBonuses: {"agility":2} },
  leather_chest_t2:  { id: 'leather_chest_t2',  nameRu: 'Закалённый кожаный жилет', nameEn: 'Tempered Leather Vest', rarity: 'uncommon', type: 'equipment', equipSlot: 'chest',  descRu: '+4 Armor. +3 Agi, +2 Eva', descEn: '+4 Armor. +3 Agi, +2 Eva', icon: '🛡', armorBonus: 4, statBonuses: {"agility":3} },
  leather_chest_t3:  { id: 'leather_chest_t3',  nameRu: 'Мастерский кожаный жилет', nameEn: 'Masterwork Leather Vest',  rarity: 'rare',     type: 'equipment', equipSlot: 'chest',  descRu: '+5 Armor. +4 Agi, +3 Eva', descEn: '+5 Armor. +4 Agi, +3 Eva', icon: '🛡', armorBonus: 5, statBonuses: {"agility":4} },
  leather_gloves_t1: { id: 'leather_gloves_t1', nameRu: 'Кожаные наручи', nameEn: 'Leather Bracers',          rarity: 'common',   type: 'equipment', equipSlot: 'gloves', descRu: '+1 Agi, +1 Acc', descEn: '+1 Agi, +1 Acc',           icon: '🧤', armorBonus: 0, statBonuses: {"agility":1} },
  leather_gloves_t2: { id: 'leather_gloves_t2', nameRu: 'Закалённые кожаные наручи', nameEn: 'Tempered Leather Bracers', rarity: 'uncommon', type: 'equipment', equipSlot: 'gloves', descRu: '+1 Armor. +2 Acc, +1 Agi', descEn: '+1 Armor. +2 Acc, +1 Agi', icon: '🧤', armorBonus: 1, statBonuses: {"agility":1} },
  leather_gloves_t3: { id: 'leather_gloves_t3', nameRu: 'Мастерские кожаные наручи', nameEn: 'Masterwork Leather Bracers',  rarity: 'rare',     type: 'equipment', equipSlot: 'gloves', descRu: '+2 Armor. +3 Acc, +2 Agi', descEn: '+2 Armor. +3 Acc, +2 Agi', icon: '🧤', armorBonus: 2, statBonuses: {"agility":2} },
  leather_boots_t1:  { id: 'leather_boots_t1',  nameRu: 'Кожаные сапоги', nameEn: 'Leather Boots',          rarity: 'common',   type: 'equipment', equipSlot: 'boots',  descRu: '+2 Evasion', descEn: '+2 Evasion',                icon: '👢', armorBonus: 0, statBonuses: {} },
  leather_boots_t2:  { id: 'leather_boots_t2',  nameRu: 'Закалённые кожаные сапоги', nameEn: 'Tempered Leather Boots', rarity: 'uncommon', type: 'equipment', equipSlot: 'boots',  descRu: '+1 Armor. +3 Eva', descEn: '+1 Armor. +3 Eva',          icon: '👢', armorBonus: 1, statBonuses: {} },
  leather_boots_t3:  { id: 'leather_boots_t3',  nameRu: 'Мастерские кожаные сапоги', nameEn: 'Masterwork Leather Boots',  rarity: 'rare',     type: 'equipment', equipSlot: 'boots',  descRu: '+2 Armor. +4 Eva, +1 Agi', descEn: '+2 Armor. +4 Eva, +1 Agi',  icon: '👢', armorBonus: 2, statBonuses: {"agility":1} },

  // ── Robe Armor T1-T3 (INT) ───────────────────────────────────────────────
  robe_helmet_t1: { id: 'robe_helmet_t1', nameRu: 'Тканевая шляпа', nameEn: 'Cloth Hat',      rarity: 'common',   type: 'equipment', equipSlot: 'helmet', descRu: '+1 Armor. +1 Int, +1 Will', descEn: '+1 Armor. +1 Int, +1 Will',      icon: '⛑', armorBonus: 1, statBonuses: {"intellect":1,"will":1} },
  robe_helmet_t2: { id: 'robe_helmet_t2', nameRu: 'Зачарованная шляпа', nameEn: 'Enchanted Hat',  rarity: 'uncommon', type: 'equipment', equipSlot: 'helmet', descRu: '+1 Armor. +2 Int, +1 Will, +1 Mna', descEn: '+1 Armor. +2 Int, +1 Will, +1 Mna', icon: '⛑', armorBonus: 1, statBonuses: {"intellect":2,"will":1,"mana":1} },
  robe_helmet_t3: { id: 'robe_helmet_t3', nameRu: 'Чародейская шляпа', nameEn: 'Arcane Hat',     rarity: 'rare',     type: 'equipment', equipSlot: 'helmet', descRu: '+2 Armor. +3 Int, +2 Will, +1 Mna', descEn: '+2 Armor. +3 Int, +2 Will, +1 Mna', icon: '⛑', armorBonus: 2, statBonuses: {"intellect":3,"will":2,"mana":1} },
  robe_chest_t1:  { id: 'robe_chest_t1',  nameRu: 'Тканевая роба', nameEn: 'Cloth Robe',     rarity: 'common',   type: 'equipment', equipSlot: 'chest',  descRu: '+2 Armor. +2 Int, +1 Will', descEn: '+2 Armor. +2 Int, +1 Will',      icon: '🛡', armorBonus: 2, statBonuses: {"intellect":2,"will":1} },
  robe_chest_t2:  { id: 'robe_chest_t2',  nameRu: 'Зачарованная роба', nameEn: 'Enchanted Robe', rarity: 'uncommon', type: 'equipment', equipSlot: 'chest',  descRu: '+3 Armor. +3 Int, +2 Will', descEn: '+3 Armor. +3 Int, +2 Will',      icon: '🛡', armorBonus: 3, statBonuses: {"intellect":3,"will":2} },
  robe_chest_t3:  { id: 'robe_chest_t3',  nameRu: 'Чародейская роба', nameEn: 'Arcane Robe',    rarity: 'rare',     type: 'equipment', equipSlot: 'chest',  descRu: '+4 Armor. +4 Int, +3 Will, +1 Mna, +10 Mana', descEn: '+4 Armor. +4 Int, +3 Will, +1 Mna, +10 Mana', icon: '🛡', armorBonus: 4, manaBonus: 10, statBonuses: {"intellect":4,"will":3,"mana":1} },
  robe_gloves_t1: { id: 'robe_gloves_t1', nameRu: 'Тканевые обмотки', nameEn: 'Cloth Wraps',      rarity: 'common',   type: 'equipment', equipSlot: 'gloves', descRu: '+1 Int, +1 Acc', descEn: '+1 Int, +1 Acc',           icon: '🧤', armorBonus: 0, statBonuses: {"intellect":1} },
  robe_gloves_t2: { id: 'robe_gloves_t2', nameRu: 'Зачарованные обмотки', nameEn: 'Enchanted Wraps',  rarity: 'uncommon', type: 'equipment', equipSlot: 'gloves', descRu: '+2 Int, +2 Acc', descEn: '+2 Int, +2 Acc',           icon: '🧤', armorBonus: 0, statBonuses: {"intellect":2} },
  robe_gloves_t3: { id: 'robe_gloves_t3', nameRu: 'Чародейские обмотки', nameEn: 'Arcane Wraps',     rarity: 'rare',     type: 'equipment', equipSlot: 'gloves', descRu: '+1 Armor. +3 Acc, +2 Int', descEn: '+1 Armor. +3 Acc, +2 Int', icon: '🧤', armorBonus: 1, statBonuses: {"intellect":2} },
  robe_boots_t1:  { id: 'robe_boots_t1',  nameRu: 'Тканевые сандалии', nameEn: 'Cloth Sandals',     rarity: 'common',   type: 'equipment', equipSlot: 'boots',  descRu: '+1 Eva, +1 Will', descEn: '+1 Eva, +1 Will',           icon: '👢', armorBonus: 0, statBonuses: {"will":1} },
  robe_boots_t2:  { id: 'robe_boots_t2',  nameRu: 'Зачарованные сандалии', nameEn: 'Enchanted Sandals', rarity: 'uncommon', type: 'equipment', equipSlot: 'boots',  descRu: '+1 Armor. +2 Eva, +1 Will', descEn: '+1 Armor. +2 Eva, +1 Will', icon: '👢', armorBonus: 1, statBonuses: {"will":1} },
  robe_boots_t3:  { id: 'robe_boots_t3',  nameRu: 'Чародейские сандалии', nameEn: 'Arcane Sandals',    rarity: 'rare',     type: 'equipment', equipSlot: 'boots',  descRu: '+2 Armor. +3 Eva, +2 Will', descEn: '+2 Armor. +3 Eva, +2 Will', icon: '👢', armorBonus: 2, statBonuses: {"will":2} },
  ring_t1: { id: 'ring_t1', nameRu: 'Стальное кольцо', nameEn: 'Steel Ring', rarity: 'common', type: 'equipment', equipSlot: 'ring', descRu: '+2 Luck, +1 Mana', descEn: '+2 Luck, +1 Mana', icon: '💍', armorBonus: 0, statBonuses: {"luck":2,"mana":1} },
  ring_t2: { id: 'ring_t2', nameRu: 'Закалённое кольцо', nameEn: 'Tempered Ring', rarity: 'uncommon', type: 'equipment', equipSlot: 'ring', descRu: '+3 Luck, +1 Mana', descEn: '+3 Luck, +1 Mana', icon: '💍', armorBonus: 0, statBonuses: {"luck":3,"mana":1} },
  ring_t3: { id: 'ring_t3', nameRu: 'Мастерское кольцо', nameEn: 'Masterwork Ring', rarity: 'rare', type: 'equipment', equipSlot: 'ring', descRu: '+4 Luck, +2 Mana', descEn: '+4 Luck, +2 Mana', icon: '💍', armorBonus: 0, statBonuses: {"luck":4,"mana":2} },
  amulet_t1: { id: 'amulet_t1', nameRu: 'Стальной амулет', nameEn: 'Steel Amulet',    rarity: 'common',   type: 'equipment', equipSlot: 'amulet', descRu: '+1 Intellect, +1 Will, +5 Mana', descEn: '+1 Intellect, +1 Will, +5 Mana',  icon: '📿', armorBonus: 0, manaBonus: 5,  statBonuses: {"intellect":1,"will":1} },
  amulet_t2: { id: 'amulet_t2', nameRu: 'Закалённый амулет', nameEn: 'Tempered Amulet', rarity: 'uncommon', type: 'equipment', equipSlot: 'amulet', descRu: '+2 Intellect, +1 Will, +10 Mana', descEn: '+2 Intellect, +1 Will, +10 Mana', icon: '📿', armorBonus: 0, manaBonus: 10, statBonuses: {"intellect":2,"will":1} },
  amulet_t3: { id: 'amulet_t3', nameRu: 'Мастерский амулет', nameEn: 'Masterwork Amulet',   rarity: 'rare',     type: 'equipment', equipSlot: 'amulet', descRu: '+3 Intellect, +2 Will, +15 Mana', descEn: '+3 Intellect, +2 Will, +15 Mana', icon: '📿', armorBonus: 0, manaBonus: 15, statBonuses: {"intellect":3,"will":2} },
  weapon_rune_t1: { id: 'weapon_rune_t1', nameRu: 'Стальная руна оружия', nameEn: 'Steel Weapon Rune', rarity: 'common', type: 'equipment', equipSlot: 'weapon_rune', descRu: '+1 Strength, +1 Agility', descEn: '+1 Strength, +1 Agility', icon: '🔮', armorBonus: 0, statBonuses: {"strength":1,"agility":1} },
  weapon_rune_t2: { id: 'weapon_rune_t2', nameRu: 'Закалённая руна оружия', nameEn: 'Tempered Weapon Rune', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon_rune', descRu: '+2 Strength, +2 Agility', descEn: '+2 Strength, +2 Agility', icon: '🔮', armorBonus: 0, statBonuses: {"strength":2,"agility":2} },
  weapon_rune_t3: { id: 'weapon_rune_t3', nameRu: 'Мастерская руна оружия', nameEn: 'Masterwork Weapon Rune', rarity: 'rare', type: 'equipment', equipSlot: 'weapon_rune', descRu: '+3 Strength, +3 Agility', descEn: '+3 Strength, +3 Agility', icon: '🔮', armorBonus: 0, statBonuses: {"strength":3,"agility":3} },
  armor_rune_t1: { id: 'armor_rune_t1', nameRu: 'Стальная руна брони', nameEn: 'Steel Armor Rune', rarity: 'common', type: 'equipment', equipSlot: 'armor_rune', descRu: '+1 Armor, +1 Will', descEn: '+1 Armor, +1 Will', icon: '✦', armorBonus: 0, statBonuses: {"armor":1,"will":1} },
  armor_rune_t2: { id: 'armor_rune_t2', nameRu: 'Закалённая руна брони', nameEn: 'Tempered Armor Rune', rarity: 'uncommon', type: 'equipment', equipSlot: 'armor_rune', descRu: '+2 Armor, +2 Will', descEn: '+2 Armor, +2 Will', icon: '✦', armorBonus: 0, statBonuses: {"armor":2,"will":2} },
  armor_rune_t3: { id: 'armor_rune_t3', nameRu: 'Мастерская руна брони', nameEn: 'Masterwork Armor Rune', rarity: 'rare', type: 'equipment', equipSlot: 'armor_rune', descRu: '+3 Armor, +3 Will', descEn: '+3 Armor, +3 Will', icon: '✦', armorBonus: 0, statBonuses: {"armor":3,"will":3} },
  shield_t3: { id: 'shield_t3', nameRu: 'Мастерский щит', nameEn: 'Masterwork Shield', rarity: 'rare', type: 'equipment', equipSlot: 'shield', descRu: '+6 Armor, +3 Health · только меч/булава', descEn: '+6 Armor, +3 Health · Sword/Mace only', icon: '🛡', statBonuses: {"armor":6,"health":3} },


  // ── Equipment T1 ───────────────────────────────────────────────────────────
  copper_helmet: {
    id: 'copper_helmet', nameRu: 'Медный шлем', nameEn: 'Copper Helmet', rarity: 'common', type: 'equipment',
    descRu: '+2 Armor', descEn: '+2 Armor', icon: '⛑', equipSlot: 'helmet', armorBonus: 2,
  },
  copper_chest: {
    id: 'copper_chest', nameRu: 'Медный нагрудник', nameEn: 'Copper Chestplate', rarity: 'common', type: 'equipment',
    descRu: '+5 Armor', descEn: '+5 Armor', icon: '🛡', equipSlot: 'chest', armorBonus: 5,
  },
  copper_ring: {
    id: 'copper_ring', nameRu: 'Медное кольцо', nameEn: 'Copper Ring', rarity: 'common', type: 'equipment',
    descRu: '+3 Luck', descEn: '+3 Luck', icon: '💍', equipSlot: 'ring', statBonuses: { luck: 3 },
  },
  basic_rune: {
    id: 'basic_rune', nameRu: 'Простая руна', nameEn: 'Simple Rune', rarity: 'common', type: 'equipment',
    descRu: '+1 Armor, +1 Will', descEn: '+1 Armor, +1 Will', icon: '✦', equipSlot: 'armor_rune', armorBonus: 1, statBonuses: { will: 1 },
  },

  // ── Quest Items ─────────────────────────────────────────────────────────────
  crystal_fire: {
    id: 'crystal_fire', nameRu: 'Огненный кристалл', nameEn: 'Fire Crystal', rarity: 'legendary', type: 'material',
    descRu: 'Crystallized essence of Ignis. Enables fire magic in the Steam World.', descEn: 'Crystallized essence of Ignis. Enables fire magic in the Steam World.', icon: '💎',
  },
  crystal_water: {
    id: 'crystal_water', nameRu: 'Водяной кристалл', nameEn: 'Water Crystal', rarity: 'legendary', type: 'material',
    descRu: 'Crystallized essence of Aquaris. Enables water magic in the Steam World.', descEn: 'Crystallized essence of Aquaris. Enables water magic in the Steam World.', icon: '💎',
  },
  crystal_earth: {
    id: 'crystal_earth', nameRu: 'Земляной кристалл', nameEn: 'Earth Crystal', rarity: 'legendary', type: 'material',
    descRu: 'Crystallized essence of Terra. Enables earth magic in the Steam World.', descEn: 'Crystallized essence of Terra. Enables earth magic in the Steam World.', icon: '💎',
  },
  crystal_wind: {
    id: 'crystal_wind', nameRu: 'Ветряной кристалл', nameEn: 'Wind Crystal', rarity: 'legendary', type: 'material',
    descRu: 'Crystallized essence of Aeros. Enables wind magic in the Steam World.', descEn: 'Crystallized essence of Aeros. Enables wind magic in the Steam World.', icon: '💎',
  },

  // Consumables
  health_potion: {
    id: 'health_potion', nameRu: 'Зелье здоровья', nameEn: 'Health Potion', rarity: 'common', type: 'consumable',
    descRu: 'Восстанавливает 30 HP.', descEn: 'Restores 30 HP.',
    icon: '♥',
    hpRestore: 30,
  },
  mana_potion: {
    id: 'mana_potion', nameRu: 'Зелье маны', nameEn: 'Mana Potion', rarity: 'common', type: 'consumable',
    descRu: 'Восстанавливает 25 маны.', descEn: 'Restores 25 mana.',
    icon: '♦',
    manaRestore: 25,
  },
};

// ─── Loot tables per creature ─────────────────────────────────────────────────

export const LOOT_TABLES: Record<string, LootEntry[]> = {
  hare: [
    { itemId: 'rabbit_fur',    chance: 0.6, minQty: 1, maxQty: 2 },
    { itemId: 'health_potion', chance: 0.1, minQty: 1, maxQty: 1 },
  ],
  goblin: [
    { itemId: 'goblin_tooth',  chance: 0.7, minQty: 1, maxQty: 3 },
    { itemId: 'health_potion', chance: 0.15, minQty: 1, maxQty: 1 },
  ],
  wolf: [
    { itemId: 'wolf_pelt',     chance: 0.6, minQty: 1, maxQty: 1 },
    { itemId: 'health_potion', chance: 0.2, minQty: 1, maxQty: 1 },
  ],
  scout: [
    { itemId: 'scout_badge',   chance: 0.5, minQty: 1, maxQty: 1 },
    { itemId: 'mana_potion',   chance: 0.2, minQty: 1, maxQty: 1 },
  ],
  bear: [
    { itemId: 'bear_claw',     chance: 0.65, minQty: 1, maxQty: 2 },
    { itemId: 'health_potion', chance: 0.35, minQty: 1, maxQty: 2 },
  ],
  orc: [
    { itemId: 'orc_bone',      chance: 0.6, minQty: 1, maxQty: 2 },
    { itemId: 'health_potion', chance: 0.25, minQty: 1, maxQty: 1 },
  ],
  shaman: [
    { itemId: 'shaman_totem',  chance: 0.55, minQty: 1, maxQty: 1 },
    { itemId: 'mana_potion',   chance: 0.4,  minQty: 1, maxQty: 2 },
  ],
  spirit_wolf: [
    { itemId: 'spirit_essence', chance: 0.5, minQty: 1, maxQty: 1 },
    { itemId: 'mana_potion',    chance: 0.3, minQty: 1, maxQty: 1 },
  ],
  bandit_archer: [
    { itemId: 'bandit_coin',   chance: 0.8, minQty: 1, maxQty: 3 },
    { itemId: 'bandit_quiver', chance: 0.4, minQty: 1, maxQty: 1 },
    { itemId: 'health_potion', chance: 0.15, minQty: 1, maxQty: 1 },
  ],
  bandit_crossbow: [
    { itemId: 'bandit_coin', chance: 0.8, minQty: 1, maxQty: 3 },
    { itemId: 'bandit_bolt', chance: 0.5, minQty: 1, maxQty: 2 },
    { itemId: 'mana_potion', chance: 0.15, minQty: 1, maxQty: 1 },
  ],
  bandit_spear: [
    { itemId: 'bandit_coin',   chance: 0.8, minQty: 1, maxQty: 3 },
    { itemId: 'health_potion', chance: 0.2,  minQty: 1, maxQty: 1 },
  ],
  bandit_brute: [
    { itemId: 'bandit_coin',   chance: 0.9, minQty: 2, maxQty: 5 },
    { itemId: 'health_potion', chance: 0.4,  minQty: 1, maxQty: 2 },
  ],
};

/**
 * Категорийные корзины лута — общий фолбэк, когда у моба нет личной LOOT_TABLES.
 * Сейчас пустые (слоты на будущее): кидай сюда LootEntry — и вся категория
 * начнёт ронять эти предметы. Личная LOOT_TABLES[id] всегда перекрывает корзину
 * (так делаются уникальные фарм-цели). Монеты начисляются отдельно (currency.ts).
 */
export const LOOT_BASKETS: Record<string, LootEntry[]> = {
  // Крафт-материалы по природе существа — роняют ВСЕ мобы категории, поверх
  // личной LOOT_TABLES (rollLoot аддитивна: личный флавор + корзина-материал).
  animal:    [{ itemId: 'beast_hide',       chance: 0.7, minQty: 1, maxQty: 2 }],
  humanoid:  [{ itemId: 'humanoid_relic',   chance: 0.5, minQty: 1, maxQty: 1 }],
  elemental: [{ itemId: 'elemental_sphere', chance: 0.6, minQty: 1, maxQty: 1 }],
  default:   [],
};

const ELEMENTAL_IDS = new Set(['spark', 'asher', 'splasher', 'fogger', 'pebble', 'mudder', 'gusty', 'whistler']);
const ANIMAL_IDS = new Set(['hare', 'deer', 'fox', 'boar', 'grouse', 'wolf', 'bear', 'spirit_wolf']);
const BOSS_IDS = new Set(['ignis', 'aquaris', 'terra', 'aeros']);

/** Категория крафт-корзины по природе существа (видовые ветераны и боссы
 *  наследуют природу базового вида: bear_veteran → animal, ignis → elemental). */
export function lootBasketFor(creatureId: string): string {
  const base = creatureId.replace(/_veteran$/, '');
  if (BOSS_IDS.has(base) || ELEMENTAL_IDS.has(base)) return 'elemental';
  if (ANIMAL_IDS.has(base)) return 'animal';
  return 'humanoid'; // goblin, orc, scout, shaman, monk, elder, bandits, guards, merchant
}

/** Сырьё, продаваемое торговцем (только здесь — нитки/заклёпки для крафта). */
export const VENDOR_MATERIALS: { itemId: string; price: number; qty: number }[] = [
  { itemId: 'thread', price: 5, qty: 5 },
  { itemId: 'rivets', price: 5, qty: 5 },
];

// ─── Recipes ─────────────────────────────────────────────────────────────────

export const RECIPES: RecipeDef[] = [
  { id: 'recipe_helmet_t1', nameRu: 'Стальной шлем', nameEn: 'Steel Helmet', workbench: 'armorer', materials: {"copper_ore":4,"beast_hide":2,"rivets":1}, resultId: 'helmet_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_helmet_t2', nameRu: 'Закалённый шлем', nameEn: 'Tempered Helmet', workbench: 'armorer', materials: {"copper_ore":7,"wolf_hide":4}, resultId: 'helmet_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_helmet_t3', nameRu: 'Мастерский шлем', nameEn: 'Masterwork Helmet', workbench: 'armorer', materials: {"copper_ore":10,"wolf_hide":6,"willow_branch":3}, resultId: 'helmet_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_chest_t1', nameRu: 'Стальной нагрудник', nameEn: 'Steel Chestplate', workbench: 'armorer', materials: {"copper_ore":6,"beast_hide":3,"rivets":2}, resultId: 'chest_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_chest_t2', nameRu: 'Закалённый нагрудник', nameEn: 'Tempered Chestplate', workbench: 'armorer', materials: {"copper_ore":10,"wolf_hide":6}, resultId: 'chest_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_chest_t3', nameRu: 'Мастерский нагрудник', nameEn: 'Masterwork Chestplate', workbench: 'armorer', materials: {"copper_ore":14,"wolf_hide":8,"willow_branch":4}, resultId: 'chest_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_gloves_t1', nameRu: 'Стальные перчатки', nameEn: 'Steel Gloves', workbench: 'armorer', materials: {"copper_ore":2,"beast_hide":2,"rivets":1}, resultId: 'gloves_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_gloves_t2', nameRu: 'Закалённые перчатки', nameEn: 'Tempered Gloves', workbench: 'armorer', materials: {"copper_ore":5,"wolf_hide":3}, resultId: 'gloves_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_gloves_t3', nameRu: 'Мастерские перчатки', nameEn: 'Masterwork Gloves', workbench: 'armorer', materials: {"copper_ore":8,"wolf_hide":5,"willow_branch":2}, resultId: 'gloves_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_boots_t1', nameRu: 'Стальные сапоги', nameEn: 'Steel Boots', workbench: 'armorer', materials: {"copper_ore":3,"beast_hide":2,"rivets":1}, resultId: 'boots_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_boots_t2', nameRu: 'Закалённые сапоги', nameEn: 'Tempered Boots', workbench: 'armorer', materials: {"copper_ore":5,"wolf_hide":4}, resultId: 'boots_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_boots_t3', nameRu: 'Мастерские сапоги', nameEn: 'Masterwork Boots', workbench: 'armorer', materials: {"copper_ore":8,"wolf_hide":6,"willow_branch":2}, resultId: 'boots_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_ring_t1', nameRu: 'Стальное кольцо', nameEn: 'Steel Ring', workbench: 'jeweler', materials: {"copper_ore":4,"wolf_hide":1}, resultId: 'ring_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_ring_t2', nameRu: 'Закалённое кольцо', nameEn: 'Tempered Ring', workbench: 'jeweler', materials: {"copper_ore":7,"wolf_hide":2}, resultId: 'ring_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_ring_t3', nameRu: 'Мастерское кольцо', nameEn: 'Masterwork Ring', workbench: 'jeweler', materials: {"copper_ore":10,"wolf_hide":3,"willow_branch":3}, resultId: 'ring_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_amulet_t1', nameRu: 'Стальной амулет', nameEn: 'Steel Amulet', workbench: 'jeweler', materials: {"copper_ore":4,"willow_branch":2}, resultId: 'amulet_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_amulet_t2', nameRu: 'Закалённый амулет', nameEn: 'Tempered Amulet', workbench: 'jeweler', materials: {"copper_ore":7,"willow_branch":4}, resultId: 'amulet_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_amulet_t3', nameRu: 'Мастерский амулет', nameEn: 'Masterwork Amulet', workbench: 'jeweler', materials: {"copper_ore":10,"willow_branch":6,"wolf_hide":2}, resultId: 'amulet_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_weapon_rune_t1', nameRu: 'Стальная руна оружия', nameEn: 'Steel Weapon Rune', workbench: 'runemaster', materials: {"willow_branch":4,"wolf_hide":2}, resultId: 'weapon_rune_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_weapon_rune_t2', nameRu: 'Закалённая руна оружия', nameEn: 'Tempered Weapon Rune', workbench: 'runemaster', materials: {"willow_branch":7,"wolf_hide":4}, resultId: 'weapon_rune_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_weapon_rune_t3', nameRu: 'Мастерская руна оружия', nameEn: 'Masterwork Weapon Rune', workbench: 'runemaster', materials: {"willow_branch":10,"wolf_hide":6,"copper_ore":3}, resultId: 'weapon_rune_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_armor_rune_t1', nameRu: 'Стальная руна брони', nameEn: 'Steel Armor Rune', workbench: 'runemaster', materials: {"willow_branch":4,"wolf_hide":2}, resultId: 'armor_rune_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_armor_rune_t2', nameRu: 'Закалённая руна брони', nameEn: 'Tempered Armor Rune', workbench: 'runemaster', materials: {"willow_branch":7,"wolf_hide":4}, resultId: 'armor_rune_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_armor_rune_t3', nameRu: 'Мастерская руна брони', nameEn: 'Masterwork Armor Rune', workbench: 'runemaster', materials: {"willow_branch":10,"wolf_hide":6,"copper_ore":3}, resultId: 'armor_rune_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_sword_t1', nameRu: 'Стальной меч', nameEn: 'Steel Sword', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'sword_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_sword_t2', nameRu: 'Закалённый меч', nameEn: 'Tempered Sword', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'sword_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_sword_t3', nameRu: 'Мастерский меч', nameEn: 'Masterwork Sword', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'sword_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_mace_t1', nameRu: 'Стальная булава', nameEn: 'Steel Mace', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'mace_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_mace_t2', nameRu: 'Закалённая булава', nameEn: 'Tempered Mace', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'mace_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_mace_t3', nameRu: 'Мастерская булава', nameEn: 'Masterwork Mace', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'mace_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_greatsword_t1', nameRu: 'Стальной двуручник', nameEn: 'Steel Greatsword', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'greatsword_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_greatsword_t2', nameRu: 'Закалённый двуручник', nameEn: 'Tempered Greatsword', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'greatsword_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_greatsword_t3', nameRu: 'Мастерский двуручник', nameEn: 'Masterwork Greatsword', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'greatsword_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_spear_t1', nameRu: 'Стальное копьё', nameEn: 'Steel Spear', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'spear_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_spear_t2', nameRu: 'Закалённое копьё', nameEn: 'Tempered Spear', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'spear_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_spear_t3', nameRu: 'Мастерское копьё', nameEn: 'Masterwork Spear', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'spear_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_hammer_t1', nameRu: 'Стальной молот', nameEn: 'Steel Hammer', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'hammer_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_hammer_t2', nameRu: 'Закалённый молот', nameEn: 'Tempered Hammer', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'hammer_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_hammer_t3', nameRu: 'Мастерский молот', nameEn: 'Masterwork Hammer', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'hammer_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_dagger_t1', nameRu: 'Стальной кинжал', nameEn: 'Steel Dagger', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'dagger_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_dagger_t2', nameRu: 'Закалённый кинжал', nameEn: 'Tempered Dagger', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'dagger_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_dagger_t3', nameRu: 'Мастерский кинжал', nameEn: 'Masterwork Dagger', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'dagger_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_fists_t1', nameRu: 'Стальные кастеты', nameEn: 'Steel Knuckles', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'fists_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_fists_t2', nameRu: 'Закалённые кастеты', nameEn: 'Tempered Knuckles', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'fists_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_fists_t3', nameRu: 'Мастерские кастеты', nameEn: 'Masterwork Knuckles', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'fists_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_shortbow_t1', nameRu: 'Стальной короткий лук', nameEn: 'Steel Short Bow', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'shortbow_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_shortbow_t2', nameRu: 'Закалённый короткий лук', nameEn: 'Tempered Short Bow', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'shortbow_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_shortbow_t3', nameRu: 'Мастерский короткий лук', nameEn: 'Masterwork Short Bow', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'shortbow_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_longbow_t1', nameRu: 'Стальной длинный лук', nameEn: 'Steel Long Bow', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'longbow_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_longbow_t2', nameRu: 'Закалённый длинный лук', nameEn: 'Tempered Long Bow', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'longbow_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_longbow_t3', nameRu: 'Мастерский длинный лук', nameEn: 'Masterwork Long Bow', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'longbow_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_crossbow_t1', nameRu: 'Стальной арбалет', nameEn: 'Steel Crossbow', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'crossbow_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_crossbow_t2', nameRu: 'Закалённый арбалет', nameEn: 'Tempered Crossbow', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'crossbow_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_crossbow_t3', nameRu: 'Мастерский арбалет', nameEn: 'Masterwork Crossbow', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'crossbow_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_fire_t1', nameRu: 'Стальной огненный посох', nameEn: 'Steel Fire Staff', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'staff_fire_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_fire_t2', nameRu: 'Закалённый огненный посох', nameEn: 'Tempered Fire Staff', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'staff_fire_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_fire_t3', nameRu: 'Мастерский огненный посох', nameEn: 'Masterwork Fire Staff', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'staff_fire_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_water_t1', nameRu: 'Стальной ледяной посох', nameEn: 'Steel Ice Staff', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'staff_water_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_water_t2', nameRu: 'Закалённый ледяной посох', nameEn: 'Tempered Ice Staff', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'staff_water_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_water_t3', nameRu: 'Мастерский ледяной посох', nameEn: 'Masterwork Ice Staff', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'staff_water_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_earth_t1', nameRu: 'Стальной каменный посох', nameEn: 'Steel Stone Staff', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'staff_earth_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_earth_t2', nameRu: 'Закалённый каменный посох', nameEn: 'Tempered Stone Staff', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'staff_earth_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_earth_t3', nameRu: 'Мастерский каменный посох', nameEn: 'Masterwork Stone Staff', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'staff_earth_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_wind_t1', nameRu: 'Стальной штормовой посох', nameEn: 'Steel Storm Staff', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'staff_wind_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_wind_t2', nameRu: 'Закалённый штормовой посох', nameEn: 'Tempered Storm Staff', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'staff_wind_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_wind_t3', nameRu: 'Мастерский штормовой посох', nameEn: 'Masterwork Storm Staff', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'staff_wind_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_nature_t1', nameRu: 'Стальной посох природы', nameEn: 'Steel Nature Staff', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'staff_nature_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_nature_t2', nameRu: 'Закалённый посох природы', nameEn: 'Tempered Nature Staff', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'staff_nature_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_nature_t3', nameRu: 'Мастерский посох природы', nameEn: 'Masterwork Nature Staff', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'staff_nature_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_shield_t1', nameRu: 'Стальной щит', nameEn: 'Steel Shield', workbench: 'armorer', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'shield_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_shield_t2', nameRu: 'Закалённый щит', nameEn: 'Tempered Shield', workbench: 'armorer', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'shield_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_shield_t3', nameRu: 'Мастерский щит', nameEn: 'Masterwork Shield', workbench: 'armorer', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'shield_t3', resultQty: 1, craftTime: 10 },

  // Leather Armor (armorer — wolf_hide heavy)
  { id: 'recipe_leather_helmet_t1', nameRu: 'Кожаный капюшон', nameEn: 'Leather Hood', workbench: 'armorer', materials: {"beast_hide":4,"plant_fiber":2,"thread":1}, resultId: 'leather_helmet_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_leather_helmet_t2', nameRu: 'Закалённый кожаный капюшон', nameEn: 'Tempered Leather Hood', workbench: 'armorer', materials: {"wolf_hide":7,"copper_ore":4}, resultId: 'leather_helmet_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_leather_helmet_t3', nameRu: 'Мастерский кожаный капюшон', nameEn: 'Masterwork Leather Hood', workbench: 'armorer', materials: {"wolf_hide":10,"copper_ore":6,"willow_branch":3}, resultId: 'leather_helmet_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_leather_chest_t1', nameRu: 'Кожаный жилет', nameEn: 'Leather Vest', workbench: 'armorer', materials: {"beast_hide":6,"plant_fiber":3,"thread":2}, resultId: 'leather_chest_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_leather_chest_t2', nameRu: 'Закалённый кожаный жилет', nameEn: 'Tempered Leather Vest', workbench: 'armorer', materials: {"wolf_hide":10,"copper_ore":6}, resultId: 'leather_chest_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_leather_chest_t3', nameRu: 'Мастерский кожаный жилет', nameEn: 'Masterwork Leather Vest', workbench: 'armorer', materials: {"wolf_hide":14,"copper_ore":8,"willow_branch":4}, resultId: 'leather_chest_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_leather_gloves_t1', nameRu: 'Кожаные наручи', nameEn: 'Leather Bracers', workbench: 'armorer', materials: {"beast_hide":2,"plant_fiber":2,"thread":1}, resultId: 'leather_gloves_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_leather_gloves_t2', nameRu: 'Закалённые кожаные наручи', nameEn: 'Tempered Leather Bracers', workbench: 'armorer', materials: {"wolf_hide":5,"copper_ore":3}, resultId: 'leather_gloves_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_leather_gloves_t3', nameRu: 'Мастерские кожаные наручи', nameEn: 'Masterwork Leather Bracers', workbench: 'armorer', materials: {"wolf_hide":8,"copper_ore":5,"willow_branch":2}, resultId: 'leather_gloves_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_leather_boots_t1', nameRu: 'Кожаные сапоги', nameEn: 'Leather Boots', workbench: 'armorer', materials: {"beast_hide":3,"plant_fiber":2,"thread":1}, resultId: 'leather_boots_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_leather_boots_t2', nameRu: 'Закалённые кожаные сапоги', nameEn: 'Tempered Leather Boots', workbench: 'armorer', materials: {"wolf_hide":5,"copper_ore":4}, resultId: 'leather_boots_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_leather_boots_t3', nameRu: 'Мастерские кожаные сапоги', nameEn: 'Masterwork Leather Boots', workbench: 'armorer', materials: {"wolf_hide":8,"copper_ore":6,"willow_branch":2}, resultId: 'leather_boots_t3', resultQty: 1, craftTime: 10 },

  // Robe Armor (armorer — willow_branch heavy)
  { id: 'recipe_robe_helmet_t1', nameRu: 'Тканевая шляпа', nameEn: 'Cloth Hat', workbench: 'armorer', materials: {"elemental_sphere":4,"plant_fiber":2,"thread":1}, resultId: 'robe_helmet_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_robe_helmet_t2', nameRu: 'Зачарованная шляпа', nameEn: 'Enchanted Hat', workbench: 'armorer', materials: {"willow_branch":7,"wolf_hide":4}, resultId: 'robe_helmet_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_robe_helmet_t3', nameRu: 'Чародейская шляпа', nameEn: 'Arcane Hat', workbench: 'armorer', materials: {"willow_branch":10,"wolf_hide":6,"copper_ore":3}, resultId: 'robe_helmet_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_robe_chest_t1', nameRu: 'Тканевая роба', nameEn: 'Cloth Robe', workbench: 'armorer', materials: {"elemental_sphere":6,"plant_fiber":3,"thread":2}, resultId: 'robe_chest_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_robe_chest_t2', nameRu: 'Зачарованная роба', nameEn: 'Enchanted Robe', workbench: 'armorer', materials: {"willow_branch":10,"wolf_hide":6}, resultId: 'robe_chest_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_robe_chest_t3', nameRu: 'Чародейская роба', nameEn: 'Arcane Robe', workbench: 'armorer', materials: {"willow_branch":14,"wolf_hide":8,"copper_ore":4}, resultId: 'robe_chest_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_robe_gloves_t1', nameRu: 'Тканевые обмотки', nameEn: 'Cloth Wraps', workbench: 'armorer', materials: {"elemental_sphere":2,"plant_fiber":2,"thread":1}, resultId: 'robe_gloves_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_robe_gloves_t2', nameRu: 'Зачарованные обмотки', nameEn: 'Enchanted Wraps', workbench: 'armorer', materials: {"willow_branch":5,"wolf_hide":3}, resultId: 'robe_gloves_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_robe_gloves_t3', nameRu: 'Чародейские обмотки', nameEn: 'Arcane Wraps', workbench: 'armorer', materials: {"willow_branch":8,"wolf_hide":5,"copper_ore":2}, resultId: 'robe_gloves_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_robe_boots_t1', nameRu: 'Тканевые сандалии', nameEn: 'Cloth Sandals', workbench: 'armorer', materials: {"elemental_sphere":3,"plant_fiber":2,"thread":1}, resultId: 'robe_boots_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_robe_boots_t2', nameRu: 'Зачарованные сандалии', nameEn: 'Enchanted Sandals', workbench: 'armorer', materials: {"willow_branch":5,"wolf_hide":4}, resultId: 'robe_boots_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_robe_boots_t3', nameRu: 'Чародейские сандалии', nameEn: 'Arcane Sandals', workbench: 'armorer', materials: {"willow_branch":8,"wolf_hide":6,"copper_ore":2}, resultId: 'robe_boots_t3', resultQty: 1, craftTime: 10 },

  // Armorer
  {
    id: 'recipe_copper_helmet', nameRu: 'Медный шлем', nameEn: 'Copper Helmet',
    workbench: 'armorer',
    materials: { copper_ore: 3, wolf_hide: 2 },
    resultId: 'copper_helmet', resultQty: 1, craftTime: 10,
  },
  {
    id: 'recipe_copper_chest', nameRu: 'Медный нагрудник', nameEn: 'Copper Chestplate',
    workbench: 'armorer',
    materials: { copper_ore: 5, wolf_hide: 3 },
    resultId: 'copper_chest', resultQty: 1, craftTime: 10,
  },
  // Jeweler
  {
    id: 'recipe_copper_ring', nameRu: 'Медное кольцо', nameEn: 'Copper Ring',
    workbench: 'jeweler',
    materials: { copper_ore: 4, wolf_hide: 1 },
    resultId: 'copper_ring', resultQty: 1, craftTime: 10,
  },
  // Rune Master
  {
    id: 'recipe_basic_rune', nameRu: 'Простая руна', nameEn: 'Simple Rune',
    workbench: 'runemaster',
    materials: { willow_branch: 3, wolf_hide: 2 },
    resultId: 'basic_rune', resultQty: 1, craftTime: 10,
  },
];

// ─── Resource Node Types ─────────────────────────────────────────────────────

export interface ResourceNodeDef {
  id: string;
  nameRu: string;
  nameEn?: string;
  profession: 'mining' | 'woodcutting' | 'trophy';
  itemId: string;
  gatherTime: number; // seconds
  minQty: number;
  maxQty: number;
  respawnTime: number; // seconds
  color: number;
  icon: string;
  sprite?: string; // texture key для рендера вместо процедурного кружка
}

export const RESOURCE_NODES: Record<string, ResourceNodeDef> = {
  copper_vein: {
    id: 'copper_vein', nameRu: 'Медная жила', nameEn: 'Copper Vein', profession: 'mining',
    itemId: 'copper_ore', gatherTime: 2, minQty: 1, maxQty: 3,
    respawnTime: 30, color: 0xcc8844, icon: '⛏', sprite: 'node_copper_vein',
  },
  // Варианты камней-жил (тот же copper_ore, разный вид) — для разнообразия.
  copper_vein_2: {
    id: 'copper_vein_2', nameRu: 'Рудный камень', nameEn: 'Ore Rock', profession: 'mining',
    itemId: 'copper_ore', gatherTime: 2, minQty: 1, maxQty: 3,
    respawnTime: 30, color: 0xbb8866, icon: '⛏', sprite: 'node_copper_vein_2',
  },
  copper_vein_3: {
    id: 'copper_vein_3', nameRu: 'Валун с рудой', nameEn: 'Ore Boulder', profession: 'mining',
    itemId: 'copper_ore', gatherTime: 2, minQty: 1, maxQty: 3,
    respawnTime: 30, color: 0x998877, icon: '⛏', sprite: 'node_copper_vein_3',
  },
  willow_tree: {
    id: 'willow_tree', nameRu: 'Ива', nameEn: 'Willow Tree', profession: 'woodcutting',
    itemId: 'willow_branch', gatherTime: 2, minQty: 1, maxQty: 3,
    respawnTime: 30, color: 0x558833, icon: '🪓', sprite: 'node_willow_tree',
  },
  hide_pile: {
    id: 'hide_pile', nameRu: 'Груда шкур', nameEn: 'Hide Pile', profession: 'trophy',
    itemId: 'wolf_hide', gatherTime: 2, minQty: 1, maxQty: 2,
    respawnTime: 30, color: 0x886644, icon: '🦴', sprite: 'node_hide_pile',
  },
  // Куст с волокном — основной источник plant_fiber (Leather/Robe T1). Топор.
  fiber_bush: {
    id: 'fiber_bush', nameRu: 'Куст (волокно)', nameEn: 'Fiber Bush', profession: 'woodcutting',
    itemId: 'plant_fiber', gatherTime: 2, minQty: 1, maxQty: 3,
    respawnTime: 30, color: 0x66aa44, icon: '🌾', sprite: 'node_fiber_bush',
  },
  // Папоротник — источник plant_fiber.
  fern_patch: {
    id: 'fern_patch', nameRu: 'Папоротник', nameEn: 'Fern Patch', profession: 'woodcutting',
    itemId: 'plant_fiber', gatherTime: 2, minQty: 1, maxQty: 2,
    respawnTime: 30, color: 0x5a9944, icon: '🌿', sprite: 'node_fern_patch',
  },
  // Кактус — источник plant_fiber.
  cactus_plant: {
    id: 'cactus_plant', nameRu: 'Кактус', nameEn: 'Cactus', profession: 'woodcutting',
    itemId: 'plant_fiber', gatherTime: 2, minQty: 1, maxQty: 2,
    respawnTime: 30, color: 0x77aa55, icon: '🌵', sprite: 'node_cactus_plant',
  },
  // Дерево — источник древесины (wood_log).
  oak_tree: {
    id: 'oak_tree', nameRu: 'Дерево', nameEn: 'Tree', profession: 'woodcutting',
    itemId: 'wood_log', gatherTime: 2, minQty: 1, maxQty: 3,
    respawnTime: 30, color: 0x7a5a33, icon: '🌳', sprite: 'node_oak_tree',
  },
  // Сломанное дерево — источник древесины.
  broken_tree: {
    id: 'broken_tree', nameRu: 'Сломанное дерево', nameEn: 'Broken Tree', profession: 'woodcutting',
    itemId: 'wood_log', gatherTime: 2, minQty: 1, maxQty: 2,
    respawnTime: 30, color: 0x6a4a28, icon: '🪵', sprite: 'node_broken_tree',
  },
  // Обгоревшее дерево — источник древесины.
  burned_tree: {
    id: 'burned_tree', nameRu: 'Обгоревшее дерево', nameEn: 'Burned Tree', profession: 'woodcutting',
    itemId: 'wood_log', gatherTime: 2, minQty: 1, maxQty: 2,
    respawnTime: 30, color: 0x444038, icon: '🪵', sprite: 'node_burned_tree',
  },
};

/** Roll loot for a creature and return what dropped (may be empty). */
export function rollLoot(creatureId: string): { itemId: string; qty: number }[] {
  // Аддитивно: личная таблица (флавор-дроп) + корзина категории (крафт-материал).
  // Так КАЖДЫЙ моб роняет крафт-материал своей природы (шкура/сфера/самоцвет),
  // сохраняя при этом свой уникальный дроп.
  const tables: LootEntry[][] = [];
  const personal = LOOT_TABLES[creatureId];
  if (personal && personal.length) tables.push(personal);
  const basket = LOOT_BASKETS[lootBasketFor(creatureId)] ?? LOOT_BASKETS.default;
  if (basket && basket.length) tables.push(basket);

  const result: { itemId: string; qty: number }[] = [];
  for (const table of tables) {
    for (const entry of table) {
      if (Math.random() < entry.chance) {
        const qty = entry.minQty + Math.floor(Math.random() * (entry.maxQty - entry.minQty + 1));
        result.push({ itemId: entry.itemId, qty });
      }
    }
  }
  return result;
}
