/**
 * i18n — simple localization system.
 * All UI strings in one place. Switch language at runtime.
 */

export type Lang = 'en' | 'ru';

let currentLang: Lang = 'en';

export function setLang(lang: Lang) {
  currentLang = lang;
  localStorage.setItem('essence_lang', lang);
}

export function getLang(): Lang {
  return currentLang;
}

export function initLang() {
  const saved = localStorage.getItem('essence_lang') as Lang | null;
  if (saved === 'en' || saved === 'ru') currentLang = saved;
}

/** Translate key → string in current language */
export function t(key: string): string {
  const dict = STRINGS[currentLang] ?? STRINGS.en;
  return dict[key] ?? STRINGS.en[key] ?? key;
}

// ── All translatable strings ─────────────────────────────────────────────────

const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    // HUD
    'hud.attack': '[1] Attack  [Q] Leave  [E] Capture  [2-8] Abilities',
    'hud.astral': '[WASD] Move  [E] Possess body',
    'hud.mana': 'Mana',

    // Panels
    'panel.body': 'Body',
    'panel.target': 'Target',
    'panel.log': 'Log',
    'panel.map': 'Map',

    // Menu buttons
    'menu.stats': 'Stats',
    'menu.inventory': 'Inventory',
    'menu.quests': 'Quests',
    'menu.achieve': 'Achieve',

    // Stats window
    'stats.title': '◉ Sphere Stats',
    'stats.rank': 'Rank',
    'stats.weakness': 'Weakness',
    'stats.cap': '[CAP]',
    'stats.learned': 'LEARNED',

    // Inventory
    'inv.equipment': 'EQUIPMENT',
    'inv.inventory': 'INVENTORY',

    // Combat log
    'log.killed': 'killed',
    'log.lost': 'Lost',
    'log.weakness': 'Weakness: -15% dmg for',
    'log.captured': '✦ Captured:',
    'log.capture_prompt': '— [E] capture',
    'log.capturing': 'Capturing',
    'log.learned': '★ Learned:',
    'log.prereq': '— learn basic ability first',
    'log.quest': '✦ QUEST:',
    'log.all_quests': 'All quests complete!',
    'log.completed': 'Completed:',
    'log.targeting': '◎ Targeting:',
    'log.controls': '[LMB/RMB]',
    'log.too_far': '✗ Too far',
    'log.achievement': '★ Achievement:',
    'log.progress_loaded': '↺ Progress loaded',

    // Death
    'death.message': '⚠ Body destroyed. You are in astral form.',

    // Quests
    'quest.title': 'Quests',
    'quest.active': 'active',
    'quest.completed': 'Completed',
    'quest.kill': 'Kill',
    'quest.capture': 'Capture',
    'quest.learn': 'Learn',
    'quest.talk': 'Talk',
    'quest.craft': 'Craft',
    'quest.defeat': 'Defeat',

    // Crafting
    'craft.no_recipes': 'No recipes',
    'craft.need_materials': 'Need materials',
    'craft.crafting': 'Crafting',
    'craft.crafted': 'Crafted',

    // Vendor
    'vendor.title': '🏪 Merchant',
    'vendor.everything': 'Merchant: You have everything.',

    // Gathering
    'gather.need_tool': 'Need tool! Visit Merchant.',
    'gather.gathering': 'Gathering',
    'gather.interrupted': 'Gathering interrupted!',

    // Body
    'body.safe_zone_only': 'Can only leave body in safe zone',
    'body.weapon': 'Weapon',
    'body.cd': 'CD',
    'body.ability': 'Ability',
    'body.cap': 'cap',
    'body.teaches': 'Teaches',

    // Weapon switch
    'weapon.switched': 'Switched to',
    'weapon.need_two': 'Need 2 weapons equipped to switch',

    // Skill bar
    'skill.weapon_tab': 'Weapon [Tab]',
    'skill.neutral': 'Neutral',
    'skill.slot': 'Slot',
    'skill.choose': '— choose spell',
    'skill.locked': '🔒 Panel locked',
    'skill.no_combat': '⚔ Cannot change in combat',

    // Title / Character creation
    'title.new_game': 'New Game',
    'title.load': 'Load Game',
    'title.play': 'Play',
    'title.delete': 'Delete',
    'title.back': 'Back',
    'title.empty_slot': '— Empty —',
    'title.sword': 'Sword',
    'title.staff': 'Fire Staff',
    'title.bow': 'Short Bow',
    'create.title': 'Create Character',
    'create.name': 'Enter your name:',
    'create.choose_weapon': 'Choose starting weapon:',
    'create.start': 'Start',
    'create.sword_desc': 'Melee warrior\nStrength + Armor',
    'create.staff_desc': 'Fire mage\nIntellect + Mana',

    // Misc
    'misc.respawn_stone': 'Respawn Stone',
    'misc.possess': '[E] possess',
    'misc.talk': '[E] talk',
    'misc.shop': '[E] shop',
    'misc.loot': '[E] Loot',
    'misc.miss': 'Miss',
  },

  ru: {
    // HUD
    'hud.attack': '[1] Атака  [Q] Выйти  [E] Захват  [2-8] Умения',
    'hud.astral': '[WASD] Движение  [E] Захватить тело',
    'hud.mana': 'Мана',

    // Panels
    'panel.body': 'Тело',
    'panel.target': 'Цель',
    'panel.log': 'Лог',
    'panel.map': 'Карта',

    // Menu buttons
    'menu.stats': 'Статы',
    'menu.inventory': 'Инвентарь',
    'menu.quests': 'Квесты',
    'menu.achieve': 'Ачивки',

    // Stats window
    'stats.title': '◉ Статы сферы',
    'stats.rank': 'Ранг',
    'stats.weakness': 'Слабость',
    'stats.cap': '[КАП]',
    'stats.learned': 'ИЗУЧЕНО',

    // Inventory
    'inv.equipment': 'ЭКИПИРОВКА',
    'inv.inventory': 'ИНВЕНТАРЬ',

    // Combat log
    'log.killed': 'убит',
    'log.lost': 'Потеряно',
    'log.weakness': 'Слабость: −15% урон на',
    'log.captured': '✦ Захвачено:',
    'log.capture_prompt': '— [E] захват',
    'log.capturing': 'Захват',
    'log.learned': '★ Изучено:',
    'log.prereq': '— сначала выучи базовое умение',
    'log.quest': '✦ КВЕСТ:',
    'log.all_quests': 'Все задания выполнены!',
    'log.completed': 'Выполнено:',
    'log.targeting': '◎ Прицеливание:',
    'log.controls': '[ЛКМ/ПКМ]',
    'log.too_far': '✗ Слишком далеко',
    'log.achievement': '★ Ачивка:',
    'log.progress_loaded': '↺ Прогресс загружен',

    // Death
    'death.message': '⚠ Тело погибло. Вы в астрале.',

    // Quests
    'quest.title': 'Квесты',
    'quest.active': 'активных',
    'quest.completed': 'Выполнено',
    'quest.kill': 'Убить',
    'quest.capture': 'Захватить',
    'quest.learn': 'Изучить',
    'quest.talk': 'Поговорить',
    'quest.craft': 'Создать',
    'quest.defeat': 'Победить',

    // Crafting
    'craft.no_recipes': 'Нет рецептов',
    'craft.need_materials': 'Нужны материалы',
    'craft.crafting': 'Создание',
    'craft.crafted': 'Создано',

    // Vendor
    'vendor.title': '🏪 Торговец',
    'vendor.everything': 'Торговец: У вас всё есть.',

    // Gathering
    'gather.need_tool': 'Нужен инструмент! Посетите торговца.',
    'gather.gathering': 'Сбор',
    'gather.interrupted': 'Сбор прерван!',

    // Body
    'body.safe_zone_only': 'Выход из тела только в безопасной зоне',
    'body.weapon': 'Оружие',
    'body.cd': 'КД',
    'body.ability': 'Умение',
    'body.cap': 'кап',
    'body.teaches': 'Обучает',

    // Weapon switch
    'weapon.switched': 'Переключено на',
    'weapon.need_two': 'Нужно 2 оружия для переключения',

    // Skill bar
    'skill.weapon_tab': 'Оружие [Tab]',
    'skill.neutral': 'Нейтральные',
    'skill.slot': 'Слот',
    'skill.choose': '— выбери заклинание',
    'skill.locked': '🔒 Панель заблокирована',
    'skill.no_combat': '⚔ Нельзя менять в бою',

    // Title / Character creation
    'title.new_game': 'Новая игра',
    'title.load': 'Загрузить',
    'title.play': 'Играть',
    'title.delete': 'Удалить',
    'title.back': 'Назад',
    'title.empty_slot': '— Пусто —',
    'title.sword': 'Меч',
    'title.staff': 'Огненный посох',
    'title.bow': 'Короткий лук',
    'create.title': 'Создание персонажа',
    'create.name': 'Введите имя:',
    'create.choose_weapon': 'Выберите стартовое оружие:',
    'create.start': 'Начать',
    'create.sword_desc': 'Воин ближнего боя\nСила + Броня',
    'create.staff_desc': 'Маг огня\nИнтеллект + Мана',

    // Misc
    'misc.respawn_stone': 'Камень возрождения',
    'misc.possess': '[E] захватить',
    'misc.talk': '[E] поговорить',
    'misc.shop': '[E] магазин',
    'misc.loot': '[E] Подобрать',
    'misc.miss': 'Промах',
  },
};
