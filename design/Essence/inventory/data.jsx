// data.jsx — mocked data model + i18n + helpers
// ---------------------------------------------------------------

const RARITY_ORDER = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };

// Compact item DB — subset + few epic/legendary for demo
const ITEMS = {
  // Starter / crafted weapons
  sword_t2: {
    id: 'sword_t2', icon: '⚔',
    name: { ru: 'Закалённый меч', en: 'Hardened Sword' },
    rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon',
    baseDmg: 14, cooldown: 1.2,
    stats: { strength: 2, armor: 1 },
    desc: { ru: 'Сбалансированный меч. 20% шанс замедления при ударе.',
            en: 'Well-balanced blade. 20% chance to slow on hit.' },
  },
  sword_t3: {
    id: 'sword_t3', icon: '⚔',
    name: { ru: 'Мастерский меч', en: 'Master Sword' },
    rarity: 'rare', type: 'equipment', equipSlot: 'weapon',
    baseDmg: 15, cooldown: 1.2,
    stats: { strength: 3, armor: 2 },
    desc: { ru: 'Мастер-работа кузнеца Aldric\'а. Лёгкая гравировка вдоль лезвия.',
            en: 'A masterwork by blacksmith Aldric. Faint engraving runs along the blade.' },
  },
  dagger_t3: {
    id: 'dagger_t3', icon: '🗡',
    name: { ru: 'Мастерский кинжал', en: 'Master Dagger' },
    rarity: 'rare', type: 'equipment', equipSlot: 'weapon',
    baseDmg: 11, cooldown: 0.8,
    stats: { agility: 3, evasion: 2 },
    desc: { ru: '20% шанс наложить яд. Скользит в ладонь как ртуть.',
            en: '20% chance to apply poison. Sits in the palm like quicksilver.' },
  },
  aeros_breath: {
    id: 'aeros_breath', icon: '🌪',
    name: { ru: 'Дыхание Аэроса', en: 'Breath of Aeros' },
    rarity: 'legendary', type: 'equipment', equipSlot: 'weapon',
    baseDmg: 18, cooldown: 1.5,
    stats: { intellect: 6, mana: 3, will: 2 },
    desc: {
      ru: 'Штормовой посох Хранителя Вершин. Внутри дерева всё ещё живёт ветер.',
      en: 'Storm staff of the Peak Guardian. Wind still breathes inside the wood.',
    },
    legendary: true,
  },

  shield_t2: {
    id: 'shield_t2', icon: '🛡',
    name: { ru: 'Закалённый щит', en: 'Hardened Shield' },
    rarity: 'uncommon', type: 'equipment', equipSlot: 'shield',
    stats: { armor: 4, health: 2 },
    desc: { ru: 'Окован латунными полосами.', en: 'Bound with brass bands.' },
  },

  helmet_t2: {
    id: 'helmet_t2', icon: '⛑',
    name: { ru: 'Закалённый шлем', en: 'Hardened Helmet' },
    rarity: 'uncommon', type: 'equipment', equipSlot: 'helmet',
    armorBonus: 4, stats: { health: 2 },
    desc: { ru: '+4 Armor. Плотная подкладка.', en: '+4 Armor. Padded liner.' },
  },
  helmet_t3: {
    id: 'helmet_t3', icon: '⛑',
    name: { ru: 'Мастерский шлем', en: 'Master Helmet' },
    rarity: 'rare', type: 'equipment', equipSlot: 'helmet',
    armorBonus: 6, stats: { health: 3, will: 1 },
    desc: { ru: '+6 Armor. Гравированные руны по краю.',
            en: '+6 Armor. Rune-etched along the rim.' },
  },

  chest_t3: {
    id: 'chest_t3', icon: '🛡',
    name: { ru: 'Мастерский нагрудник', en: 'Master Chestplate' },
    rarity: 'rare', type: 'equipment', equipSlot: 'chest',
    armorBonus: 12, stats: { health: 4, armor: 2 },
    desc: { ru: '+12 Armor. Сочленения укреплены медными заклёпками.',
            en: '+12 Armor. Joints reinforced with copper rivets.' },
  },

  gloves_t2: {
    id: 'gloves_t2', icon: '🧤',
    name: { ru: 'Закалённые перчатки', en: 'Hardened Gloves' },
    rarity: 'uncommon', type: 'equipment', equipSlot: 'gloves',
    armorBonus: 2, stats: { accuracy: 2 },
    desc: { ru: '+2 Armor. Укрепляют хват.', en: '+2 Armor. Firms the grip.' },
  },

  boots_t2: {
    id: 'boots_t2', icon: '👢',
    name: { ru: 'Закалённые сапоги', en: 'Hardened Boots' },
    rarity: 'uncommon', type: 'equipment', equipSlot: 'boots',
    armorBonus: 3, stats: { evasion: 2 },
    desc: { ru: '+3 Armor. Тихий шаг.', en: '+3 Armor. A quiet step.' },
  },
  boots_t3: {
    id: 'boots_t3', icon: '👢',
    name: { ru: 'Мастерские сапоги', en: 'Master Boots' },
    rarity: 'rare', type: 'equipment', equipSlot: 'boots',
    armorBonus: 5, stats: { evasion: 3, agility: 1 },
    desc: { ru: '+5 Armor. Подошва гасит удар.', en: '+5 Armor. Cushioned strike.' },
  },

  ring_t2: {
    id: 'ring_t2', icon: '💍',
    name: { ru: 'Закалённое кольцо', en: 'Hardened Ring' },
    rarity: 'uncommon', type: 'equipment', equipSlot: 'ring',
    stats: { luck: 3, mana: 1 },
    desc: { ru: 'Тёплое на ощупь.', en: 'Warm to the touch.' },
  },
  amulet_t3: {
    id: 'amulet_t3', icon: '📿',
    name: { ru: 'Мастерский амулет', en: 'Master Amulet' },
    rarity: 'rare', type: 'equipment', equipSlot: 'amulet',
    stats: { intellect: 3, will: 2 },
    desc: { ru: 'Медальон с лотосом — знак Миры.',
            en: 'Lotus medallion — Mira\'s mark.' },
  },

  weapon_rune_t2: {
    id: 'weapon_rune_t2', icon: '🔮',
    name: { ru: 'Закалённая руна оружия', en: 'Hardened Weapon Rune' },
    rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon_rune',
    stats: { strength: 2, agility: 2 },
    desc: { ru: 'Вплетается в навершие. Постоянный эффект.',
            en: 'Set into the pommel. Permanent effect.' },
  },
  armor_rune_t3: {
    id: 'armor_rune_t3', icon: '✦',
    name: { ru: 'Мастерская руна брони', en: 'Master Armor Rune' },
    rarity: 'rare', type: 'equipment', equipSlot: 'armor_rune',
    stats: { armor: 3, will: 3 },
    desc: { ru: 'Начертана чернилами из эссенции духа.',
            en: 'Inked with spirit essence.' },
  },

  // Epic one-off
  vacant_vessel: {
    id: 'vacant_vessel', icon: '◉',
    name: { ru: 'Опустошённый сосуд', en: 'Vacant Vessel' },
    rarity: 'epic', type: 'equipment', equipSlot: 'amulet',
    stats: { mana: 4, will: 3, luck: 1 },
    desc: {
      ru: 'Стеклянный флакон с каплей Пустоты. Щекочет Сферу, но усиливает её.',
      en: 'A glass vial with a drop of the Void. Prickles the Sphere but amplifies it.',
    },
  },

  // Materials
  copper_ore:    { id: 'copper_ore',    icon: '⛏', name: { ru: 'Медная руда', en: 'Copper Ore' }, rarity: 'common',   type: 'material', desc: { ru: 'Основа T1 крафта.', en: 'Base for T1 crafting.' } },
  willow_branch: { id: 'willow_branch', icon: '🌿', name: { ru: 'Ветка ивы',   en: 'Willow Branch' }, rarity: 'common', type: 'material', desc: { ru: 'Гибкое дерево. Стрелы, древка.', en: 'Flexible wood. Arrows, shafts.' } },
  wolf_hide:     { id: 'wolf_hide',     icon: '🦴', name: { ru: 'Волчья шкура', en: 'Wolf Hide' }, rarity: 'common', type: 'material', desc: { ru: 'Для лёгкой брони.', en: 'For light armor.' } },
  goblin_tooth:  { id: 'goblin_tooth',  icon: '◇', name: { ru: 'Зуб гоблина', en: 'Goblin Tooth' }, rarity: 'common', type: 'material', desc: { ru: 'Трофей.', en: 'Trophy.' } },
  spirit_essence:{ id: 'spirit_essence',icon: '◉', name: { ru: 'Эссенция духа', en: 'Spirit Essence' }, rarity: 'rare', type: 'material', desc: { ru: 'Частица лесного духа. Резонирует со Сферой.', en: 'A mote of forest spirit. Resonates with the Sphere.' } },
  shaman_totem:  { id: 'shaman_totem',  icon: '✺', name: { ru: 'Тотем шамана', en: 'Shaman Totem' }, rarity: 'rare', type: 'material', desc: { ru: 'Заряжен магией.', en: 'Magically charged.' } },
  bear_claw:     { id: 'bear_claw',     icon: '⌖', name: { ru: 'Коготь медведя', en: 'Bear Claw' }, rarity: 'uncommon', type: 'material', desc: { ru: 'Острее ножа.', en: 'Sharper than a knife.' } },
  orc_bone:      { id: 'orc_bone',      icon: '✦', name: { ru: 'Кость орка',  en: 'Orc Bone'   }, rarity: 'uncommon', type: 'material', desc: { ru: 'Из неё делают амулеты.', en: 'Used for amulets.' } },

  // Consumables
  health_potion: { id: 'health_potion', icon: '♥', name: { ru: 'Зелье здоровья', en: 'Health Potion' }, rarity: 'common',   type: 'consumable', hpRestore: 30, desc: { ru: 'Восстанавливает 30 HP.', en: 'Restores 30 HP.' } },
  mana_potion:   { id: 'mana_potion',   icon: '♦', name: { ru: 'Зелье маны',     en: 'Mana Potion'   }, rarity: 'common',   type: 'consumable', manaRestore: 25, desc: { ru: 'Восстанавливает 25 маны.', en: 'Restores 25 mana.' } },
  greater_hp:    { id: 'greater_hp',    icon: '♥', name: { ru: 'Большое зелье здоровья', en: 'Greater Health Potion' }, rarity: 'uncommon', type: 'consumable', hpRestore: 80, desc: { ru: 'Восстанавливает 80 HP.', en: 'Restores 80 HP.' } },

  // Quest — legendary
  crystal_fire: {
    id: 'crystal_fire', icon: '💎',
    name: { ru: 'Кристалл Огня', en: 'Fire Crystal' },
    rarity: 'legendary', type: 'quest',
    desc: {
      ru: 'Кристаллизованная эссенция Игниса. 1-я частота Печати Стихий.',
      en: 'Crystallized essence of Ignis. First frequency of the Seal of Elements.',
    },
  },
  crystal_water: {
    id: 'crystal_water', icon: '💎',
    name: { ru: 'Кристалл Воды', en: 'Water Crystal' },
    rarity: 'legendary', type: 'quest',
    desc: {
      ru: 'Эссенция Аквариса. 2-я частота Печати.',
      en: 'Essence of Aquaris. Second frequency of the Seal.',
    },
  },
};

// Initial equipment + bag
const INITIAL_STATE = {
  sphere: {
    name: { ru: 'Безымянная Сущность', en: 'Unnamed Essence' },
    rank: 14.6,
    body: { ru: 'Human Warrior', en: 'Human Warrior' },
    hp: { cur: 182, max: 240 },
    mana: { cur: 68, max: 110 },
  },
  equipment: {
    weapon:      'sword_t3',
    weapon2:     'dagger_t3',
    shield:      'shield_t2',
    helmet:      'helmet_t2',
    chest:       'chest_t3',
    gloves:      'gloves_t2',
    boots:       'boots_t2',
    ring:        'ring_t2',
    amulet:      'amulet_t3',
    weapon_rune: 'weapon_rune_t2',
    armor_rune:  null,
  },
  activeWeapon: 1, // 1 = weapon, 2 = weapon2
  currency: { gold: 4, silver: 62, copper: 188 },
  bag: {
    capacity: 64,   // 4 pages × 16 slots (4×4)
    unlocked: 32,   // 2 pages unlocked by default
    items: [
      // Page 1 — potions, equipment
      { slot: 0,  itemId: 'greater_hp',     qty: 3 },
      { slot: 1,  itemId: 'health_potion',  qty: 12 },
      { slot: 2,  itemId: 'mana_potion',    qty: 7 },
      { slot: 3,  itemId: 'helmet_t3',      qty: 1 },
      { slot: 4,  itemId: 'aeros_breath',   qty: 1 },
      { slot: 5,  itemId: 'vacant_vessel',  qty: 1 },
      { slot: 6,  itemId: 'boots_t3',       qty: 1 },
      { slot: 7,  itemId: 'armor_rune_t3',  qty: 1 },
      { slot: 9,  itemId: 'sword_t2',       qty: 1 },
      // Page 2 — materials
      { slot: 16, itemId: 'copper_ore',     qty: 42 },
      { slot: 17, itemId: 'willow_branch',  qty: 28 },
      { slot: 18, itemId: 'wolf_hide',      qty: 15 },
      { slot: 19, itemId: 'spirit_essence', qty: 3 },
      { slot: 20, itemId: 'shaman_totem',   qty: 2 },
      { slot: 21, itemId: 'bear_claw',      qty: 6 },
      { slot: 22, itemId: 'goblin_tooth',   qty: 9 },
      { slot: 23, itemId: 'orc_bone',       qty: 4 },
      { slot: 24, itemId: 'crystal_fire',   qty: 1 },
      { slot: 25, itemId: 'crystal_water',  qty: 1 },
    ],
  },
};

// Equipment slot layout (position around figure) and labels
const EQUIP_SLOTS = [
  { id: 'helmet',      className: 'eq-helmet',  label: { ru: 'Шлем',       en: 'Helmet'   } },
  { id: 'amulet',      className: 'eq-amulet',  label: { ru: 'Амулет',     en: 'Amulet'   } },
  { id: 'chest',       className: 'eq-chest',   label: { ru: 'Нагрудник',  en: 'Chest'    } },
  { id: 'gloves',      className: 'eq-gloves',  label: { ru: 'Перчатки',   en: 'Gloves'   } },
  { id: 'ring',        className: 'eq-ring',    label: { ru: 'Кольцо',     en: 'Ring'     } },
  { id: 'boots',       className: 'eq-boots',   label: { ru: 'Сапоги',     en: 'Boots'    } },
  { id: 'weapon',      className: 'eq-weapon1', label: { ru: 'Оружие I',   en: 'Weapon I' } },
  { id: 'weapon2',     className: 'eq-weapon2', label: { ru: 'Оружие II',  en: 'Weapon II'} },
  { id: 'shield',      className: 'eq-shield',  label: { ru: 'Щит',        en: 'Shield'   } },
  { id: 'weapon_rune', className: 'eq-wrune',   label: { ru: 'Руна ор.',   en: 'Wpn Rune' } },
  { id: 'armor_rune',  className: 'eq-arune',   label: { ru: 'Руна бр.',   en: 'Arm Rune' } },
];

// Stat definitions — 10 stats from stats.ts
const STATS = [
  { id: 'strength',  label: { ru: 'Сила',       en: 'Strength'  }, short: 'STR' },
  { id: 'agility',   label: { ru: 'Ловкость',   en: 'Agility'   }, short: 'AGI' },
  { id: 'accuracy',  label: { ru: 'Точность',   en: 'Accuracy'  }, short: 'ACC' },
  { id: 'evasion',   label: { ru: 'Уклонение',  en: 'Evasion'   }, short: 'EVA' },
  { id: 'health',    label: { ru: 'Здоровье',   en: 'Health'    }, short: 'HP'  },
  { id: 'armor',     label: { ru: 'Стойкость',  en: 'Armor'     }, short: 'ARM' },
  { id: 'intellect', label: { ru: 'Интеллект',  en: 'Intellect' }, short: 'INT' },
  { id: 'will',      label: { ru: 'Воля',       en: 'Will'      }, short: 'WIL' },
  { id: 'mana',      label: { ru: 'Мана',       en: 'Mana'      }, short: 'MNA' },
  { id: 'luck',      label: { ru: 'Удача',      en: 'Luck'      }, short: 'LCK' },
];

const BASE_STATS = {
  strength: 12, agility: 8,  accuracy: 6, evasion: 5, health: 18,
  armor:    4,  intellect: 3, will: 2,    mana: 9,    luck: 5,
};

// Filter categories
const FILTERS = [
  { id: 'all',         label: { ru: 'Всё',         en: 'All'         }, test: () => true },
  { id: 'equipment',   label: { ru: 'Экипировка',  en: 'Equipment'   }, test: it => it.type === 'equipment' },
  { id: 'material',    label: { ru: 'Материалы',   en: 'Materials'   }, test: it => it.type === 'material' },
  { id: 'consumable',  label: { ru: 'Расходники',  en: 'Consumables' }, test: it => it.type === 'consumable' },
  { id: 'quest',       label: { ru: 'Квесты',      en: 'Quest'       }, test: it => it.type === 'quest' },
];

const SORTS = [
  { id: 'rarity', label: { ru: 'Редкость', en: 'Rarity' } },
  { id: 'type',   label: { ru: 'Тип',      en: 'Type'   } },
  { id: 'name',   label: { ru: 'Имя',      en: 'Name'   } },
];

// i18n
const T = {
  title_main:     { ru: 'Инвентарь',      en: 'Inventory'    },
  title_sub:      { ru: 'СУЩНОСТЬ · ГЛ.I',en: 'ESSENCE · CH.I' },
  equipment:      { ru: 'Экипировка',      en: 'Equipment'    },
  equipment_sub:  { ru: 'Оболочка Сферы',  en: 'Sphere Vessel'},
  bag:            { ru: 'Сумка',           en: 'Bag'          },
  bag_sub:        { ru: 'Носимое',         en: 'Carried'      },
  stats:          { ru: 'Характеристики',  en: 'Attributes'   },
  rank:           { ru: 'Ранг',            en: 'Rank'         },
  hp:             { ru: 'Здоровье',        en: 'Health'       },
  mana:           { ru: 'Мана',            en: 'Mana'         },
  body:           { ru: 'Тело',            en: 'Body'         },
  active:         { ru: 'Активно',         en: 'Active'       },
  search_ph:      { ru: 'Поиск по сумке…', en: 'Search bag…'  },
  sort_by:        { ru: 'Сорт.',           en: 'Sort'         },
  slots:          { ru: 'Слотов',          en: 'Slots'        },
  expand:         { ru: 'Расширить у торговца',  en: 'Expand at vendor' },
  empty:          { ru: 'Пусто',           en: 'Empty'        },
  locked:         { ru: 'Заперто',         en: 'Locked'       },
  equip:          { ru: 'Надеть',          en: 'Equip'        },
  unequip:        { ru: 'Снять',           en: 'Unequip'      },
  use:            { ru: 'Использовать',    en: 'Use'          },
  salvage:        { ru: 'Разобрать',       en: 'Salvage'      },
  drop:           { ru: 'Выбросить',       en: 'Drop'         },
  inspect:        { ru: 'Осмотреть',       en: 'Inspect'      },
  equipped_tag:   { ru: 'Надето',          en: 'Equipped'     },
  density:        { ru: 'Плотность',       en: 'Density'      },
  compact:        { ru: 'Плотно',          en: 'Compact'      },
  comfortable:    { ru: 'Свободно',        en: 'Comfortable'  },
  accent:         { ru: 'Акцент',          en: 'Accent'       },
  brass:          { ru: 'Латунь',          en: 'Brass'        },
  copper:         { ru: 'Медь',            en: 'Copper'       },
  steel:          { ru: 'Воронёная сталь', en: 'Blued Steel'  },
  rarity_glow:    { ru: 'Свечение редкости', en: 'Rarity glow'},
  ethereal:       { ru: 'Эфирный фон',     en: 'Ethereal aura'},
  tweaks:         { ru: 'Настройки',       en: 'Tweaks'       },
  type:           { ru: 'Тип',             en: 'Type'         },
  rarity_common:    { ru: 'Обычный',      en: 'Common'    },
  rarity_uncommon:  { ru: 'Необычный',    en: 'Uncommon'  },
  rarity_rare:      { ru: 'Редкий',       en: 'Rare'      },
  rarity_epic:      { ru: 'Эпический',    en: 'Epic'      },
  rarity_legendary: { ru: 'Легендарный',  en: 'Legendary' },
  type_equipment:   { ru: 'Экипировка',   en: 'Equipment' },
  type_material:    { ru: 'Материал',     en: 'Material'  },
  type_consumable:  { ru: 'Расходник',    en: 'Consumable'},
  type_quest:       { ru: 'Квест',        en: 'Quest'     },
  slot_name_weapon:      { ru: 'Оружие',     en: 'Weapon'      },
  slot_name_weapon2:     { ru: 'Доп. оружие',en: 'Off-weapon'  },
  slot_name_shield:      { ru: 'Щит',        en: 'Shield'      },
  slot_name_helmet:      { ru: 'Шлем',       en: 'Helmet'      },
  slot_name_chest:       { ru: 'Нагрудник',  en: 'Chest'       },
  slot_name_gloves:      { ru: 'Перчатки',   en: 'Gloves'      },
  slot_name_boots:       { ru: 'Сапоги',     en: 'Boots'       },
  slot_name_ring:        { ru: 'Кольцо',     en: 'Ring'        },
  slot_name_amulet:      { ru: 'Амулет',     en: 'Amulet'      },
  slot_name_weapon_rune: { ru: 'Руна оружия',en: 'Weapon rune' },
  slot_name_armor_rune:  { ru: 'Руна брони', en: 'Armor rune'  },
  rmb_hint:       { ru: 'ПКМ · меню',      en: 'RMB · menu'   },
  drag_hint:      { ru: 'Перетащить', en: 'Drag' },
  compare_hint:   { ru: 'Сравнение',  en: 'Compare' },
};

function t(key, lang) { return (T[key] && T[key][lang]) || key; }

// Sorting helpers
function sortItems(slots, sortBy, lang) {
  const get = (slot) => {
    const it = ITEMS[slot.itemId];
    return it;
  };
  const byRarity = (a, b) => (RARITY_ORDER[get(b).rarity] ?? 0) - (RARITY_ORDER[get(a).rarity] ?? 0);
  const byType   = (a, b) => (get(a).type || '').localeCompare(get(b).type || '');
  const byName   = (a, b) => (get(a).name[lang] || '').localeCompare(get(b).name[lang] || '');
  const arr = [...slots];
  if (sortBy === 'rarity') arr.sort(byRarity);
  if (sortBy === 'type')   arr.sort(byType);
  if (sortBy === 'name')   arr.sort(byName);
  return arr;
}

// Attach to window for cross-script access
Object.assign(window, {
  ITEMS, INITIAL_STATE, EQUIP_SLOTS, STATS, BASE_STATS, FILTERS, SORTS,
  T, t, RARITY_ORDER, sortItems,
});
