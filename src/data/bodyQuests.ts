import { BodyQuestDef, ConflictQuestDef } from '../types/bodyQuests';

// ═══════════════════════════════════════════════════════════════
// T1 — Simple quests (animals, basic humanoids) → T1 spells
// ═══════════════════════════════════════════════════════════════


const QUEST_WOLF: BodyQuestDef = {
  id: 'bq_wolf', bodyId: 'wolf', tier: 1,
  nameRu: 'Голодная стая',
  description: 'Иди с волками на охоту и докажи что достоин стаи.',
  introMessages: [
    { speaker: '', text: 'Запахи говорят больше слов. Стая голодна — двое суток без добычи.' },
    { speaker: '', text: 'Вожак смотрит. Ждёт. Молодому надо доказать.' },
    { speaker: '', text: 'Олень был здесь час назад. След ведёт на восток.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Добыча взята. Стая сыта. Вожак кивает. Клинок инстинкта — теперь твой.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'deer', targetNameRu: 'Олень', description: 'Выследи 3 оленей' },
  ],
  rewardSpellId: 'sword_strike',
  xpReward: 50,
};

const QUEST_BEAR: BodyQuestDef = {
  id: 'bq_bear', bodyId: 'bear', tier: 1,
  nameRu: 'Лесной пожар',
  description: 'Убей огненных элементалей пока они не сожгли рощу.',
  introMessages: [
    { speaker: '', text: 'Дым. Не то. Роща не должна так пахнуть.' },
    { speaker: '', text: 'Два маленьких огня пробрались с юга. Они расползаются.' },
    { speaker: '', text: 'Десять деревьев до берлоги. Двигайся.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Огни погашены. Роща держится. Тело учит бить тяжело.' },
  ],
  objectives: [
    { type: 'kill', count: 2, targetId: 'spark', targetNameRu: 'Огонёк', description: 'Убей 2 огненных элементаля' },
  ],
  rewardSpellId: 'mace_strike',
  xpReward: 50,
};

// ═══════════════════════════════════════════════════════════════
// T1 — Humanoids (basic) → T1 weapon spells
// ═══════════════════════════════════════════════════════════════

const QUEST_GOBLIN: BodyQuestDef = {
  id: 'bq_goblin', bodyId: 'goblin', tier: 1,
  nameRu: 'Быстрые пальцы',
  description: 'Обчисти охотничий лагерь и принеси добычу племени.',
  introMessages: [
    { speaker: '', text: 'Маленькое тело. Быстрое. Голодное.' },
    { speaker: '', text: 'Племя ждёт на краю. Нужно принести что-нибудь.' },
    { speaker: '', text: 'Охотничий лагерь рядом. Ящики без охраны.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Племя сегодня поест. Быстрый клинок — твой.' },
  ],
  objectives: [
    { type: 'steal', count: 3, targetId: 'camp_supplies', targetNameRu: 'Снаряжение', description: 'Укради 3 ящика снаряжения' },
  ],
  spawnObjects: [{
    objectId: 'camp_supplies', nameRu: 'Снаряжение', icon: '📦', color: 0xddaa33,
    type: 'collectible', count: 4, radius: 350,
  }],
  rewardSpellId: 'sting',
  xpReward: 50,
};

const QUEST_ORC: BodyQuestDef = {
  id: 'bq_orc', bodyId: 'orc', tier: 1,
  nameRu: 'Обряд силы',
  description: 'Вызови вождя на поединок и докажи право быть в племени.',
  introMessages: [
    { speaker: '', text: 'Большое тело. Тяжёлое. Сильное.' },
    { speaker: '', text: 'Вождь стоит в центре. Племя смотрит.' },
    { speaker: '', text: 'Один путь доказать себя — вызвать на поединок.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Вождь пал. Племя склонилось. Клинок — твой.' },
  ],
  objectives: [
    { type: 'kill', count: 1, targetId: 'orc_veteran', targetNameRu: 'Вождь', description: 'Победи вождя в поединке' },
  ],
  friendlyCreatureIds: ['orc'],
  rewardSpellId: 'slash',
  xpReward: 50,
};

const QUEST_SCOUT: BodyQuestDef = {
  id: 'bq_scout', bodyId: 'scout', tier: 1,
  nameRu: 'Глаза на дороге',
  description: 'Проверь торговую дорогу перед выходом обоза.',
  introMessages: [
    { speaker: '', text: 'Лёгкое тело. Тихое. Привыкшее к лесу.' },
    { speaker: '', text: 'Торговый обоз выходит на рассвете.' },
    { speaker: '', text: 'Дорогу нужно проверить. Три точки.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Дорога чиста — пока. Острый глаз — своё оружие.' },
  ],
  objectives: [
    { type: 'reach', count: 3, targetId: 'checkpoint', targetNameRu: 'Контрольная точка', description: 'Проверь 3 контрольные точки' },
  ],
  spawnObjects: [{
    objectId: 'checkpoint', nameRu: 'Контрольная точка', icon: '🔍', color: 0x55aaff,
    type: 'waypoint', count: 3, radius: 500,
  }],
  rewardSpellId: 'bow_shot',
  xpReward: 50,
};

const QUEST_SHAMAN: BodyQuestDef = {
  id: 'bq_shaman', bodyId: 'shaman', tier: 1,
  nameRu: 'Зов духов',
  description: 'Дойди до духовной поляны и слушай голоса леса.',
  introMessages: [
    { speaker: '', text: 'Мир полон голосов. Деревья говорят. Ветер несёт имена.' },
    { speaker: '', text: 'Ночь. Нужно идти на поляну и позвать.' },
    { speaker: '', text: 'Духи приходят только к тем кто умеет слушать.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Духи откликнулись. Их дар — спутник из леса.' },
  ],
  objectives: [
    { type: 'meditate', count: 30, targetId: 'spirit_clearing', meditateRadius: 100, description: 'Медитируй 30 сек на поляне (не покидай круг)' },
  ],
  spawnObjects: [{
    objectId: 'spirit_clearing', nameRu: 'Духовная поляна', icon: '🌀', color: 0x8866ff,
    type: 'waypoint', count: 1, radius: 450,
  }],
  rewardSpellId: 'mob_nature_t1',
  xpReward: 50,
};

// ═══════════════════════════════════════════════════════════════
// T1 — Elementals → T1 magic spells
// ═══════════════════════════════════════════════════════════════

const QUEST_SPARK: BodyQuestDef = {
  id: 'bq_spark', bodyId: 'spark', tier: 1,
  nameRu: 'Первый огонь',
  description: 'Подожги 10 деревьев — пусть роща узнает твоё имя.',
  introMessages: [
    { speaker: '', text: 'Горячо. Живое. Это и есть мы.' },
    { speaker: '', text: 'Деревья стоят холодные и тихие. Они ещё не знают огня.' },
    { speaker: '', text: 'Покажи им.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Десять деревьев. Роща знает твоё имя. Искра — твоя.' },
  ],
  objectives: [
    { type: 'destroy', count: 10, targetId: 'dry_tree', targetNameRu: 'Сухое дерево', description: 'Подожги 10 деревьев' },
  ],
  spawnObjects: [{
    objectId: 'dry_tree', nameRu: 'Сухое дерево', icon: '🪵', color: 0x886633,
    type: 'destructible', count: 12, radius: 400,
  }],
  rewardSpellId: 'mob_fire_t1',
  xpReward: 50,
};

const QUEST_SPLASHER: BodyQuestDef = {
  id: 'bq_splasher', bodyId: 'splasher', tier: 1,
  nameRu: 'Залить',
  description: 'Вода исправляет то что огонь сломал. Потуши 5 горящих деревьев.',
  introMessages: [
    { speaker: '', text: 'Огонь. Неправильно. Ему здесь не место.' },
    { speaker: '', text: 'Пять деревьев горят у края озера.' },
    { speaker: '', text: 'Вода исправляет то что огонь сломал.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Холодно. Тихо. Берег дышит снова. Лёд слушается тебя.' },
  ],
  objectives: [
    { type: 'destroy', count: 5, targetId: 'burning_tree', targetNameRu: 'Горящее дерево', description: 'Потуши 5 горящих деревьев' },
  ],
  spawnObjects: [{
    objectId: 'burning_tree', nameRu: 'Горящее дерево', icon: '🔥', color: 0xff7733,
    type: 'destructible', count: 7, radius: 400,
  }],
  rewardSpellId: 'mob_water_t1',
  xpReward: 50,
};

const QUEST_PEBBLE: BodyQuestDef = {
  id: 'bq_pebble', bodyId: 'pebble', tier: 1,
  nameRu: 'Место в стене',
  description: 'Доберись до пробоины и стань её частью.',
  introMessages: [
    { speaker: '', text: 'Тяжело. Устойчиво. Правильно.' },
    { speaker: '', text: 'Там — пробоина в западной стене пещеры.' },
    { speaker: '', text: 'Без неё свод начнёт оседать. Нужно занять место. Стать частью.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Пробоина закрыта. Свод держится. Тяжесть камня — теперь в твоих руках.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'cave_breach', targetNameRu: 'Пробоина в стене', description: 'Доберись до пробоины' },
  ],
  spawnObjects: [{
    objectId: 'cave_breach', nameRu: 'Пробоина в стене', icon: '🪨', color: 0x886633,
    type: 'waypoint', count: 1, radius: 600,
  }],
  rewardSpellId: 'mob_earth_t1',
  xpReward: 50,
};

const QUEST_GUSTY: BodyQuestDef = {
  id: 'bq_gusty', bodyId: 'gusty', tier: 1,
  nameRu: 'Хищник вершин',
  description: 'Ветер бьёт первым. Уничтожь любого элементаля.',
  introMessages: [
    { speaker: '', text: 'Ветер не ждёт. Ветер не спрашивает.' },
    { speaker: '', text: 'Рядом шевелится другой элементаль. Неважно кто.' },
    { speaker: '', text: 'Ветер — быстрее всех. Докажи.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Исчез. Вершины твои. Порыв — теперь твой.' },
  ],
  objectives: [
    // targetId undefined = matches any kill (any elemental in the zone will do)
    { type: 'kill', count: 1, description: 'Уничтожь любого элементаля' },
  ],
  rewardSpellId: 'mob_wind_t1',
  xpReward: 50,
};

const QUEST_CARAVAN_MERCHANT: BodyQuestDef = {
  id: 'bq_caravan_merchant', bodyId: 'caravan_merchant', tier: 1,
  nameRu: 'Живой груз',
  description: 'Обоз атакован. Охрана дерётся. Ты — лечи.',
  introMessages: [
    { speaker: '', text: 'Стрелы. Сзади. Трое лучников у опушки.' },
    { speaker: '', text: 'Охрана держится — но ненадолго.' },
    { speaker: '', text: 'У тебя нет оружия. Но ты можешь держать их на ногах.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Охрана выжила. Обоз прошёл. Руки торговца — не только для золота.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'bandit_archer', targetNameRu: 'Разбойник-лучник', description: 'Защити охрану — убей 3 разбойников-лучников' },
  ],
  rewardSpellId: 'ally_heal',
  xpReward: 50,
};

// ═══════════════════════════════════════════════════════════════
// T2 — Bandits/advanced humanoids → T2 weapon spells
// ═══════════════════════════════════════════════════════════════

const QUEST_BANDIT_ARCHER: BodyQuestDef = {
  id: 'bq_bandit_archer', bodyId: 'bandit_archer', tier: 2,
  nameRu: 'Налёт на обоз',
  description: 'Сожги телегу и забери груз.',
  introMessages: [
    { speaker: '', text: 'Пыль на дороге. Обоз. Охраны почти нет.' },
    { speaker: '', text: 'Главарь кивает: «Сожги телегу. Забери что внутри.»' },
    { speaker: '', text: 'Стрелы наготове. Пора зарабатывать долю.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Телега горит. Груз твой. Научился стрелять и уходить.' },
  ],
  objectives: [
    { type: 'destroy', count: 1, targetId: 'caravan_cart', targetNameRu: 'Телега', description: 'Разнеси телегу' },
    { type: 'collect', count: 1, targetId: 'caravan_cargo', targetNameRu: 'Груз', description: 'Забери груз' },
  ],
  spawnObjects: [
    { objectId: 'caravan_cart', nameRu: 'Телега', icon: '🛒', color: 0x886633, type: 'destructible', count: 1, radius: 400 },
    { objectId: 'caravan_cargo', nameRu: 'Груз', icon: '📦', color: 0xddaa33, type: 'collectible', count: 1, radius: 50 },
  ],
  rewardSpellId: 'longbow_shot',
  xpReward: 100,
};

const QUEST_BANDIT_CROSSBOW: BodyQuestDef = {
  id: 'bq_bandit_crossbow', bodyId: 'bandit_crossbow', tier: 2,
  nameRu: 'Взломщик',
  description: 'Сбей замок старого форта и разберись с охраной.',
  introMessages: [
    { speaker: '', text: 'Главарь показывает на ворота старого форта.' },
    { speaker: '', text: 'Замок. Толстый. Ключ потерян.' },
    { speaker: '', text: '«Ты лучший стрелок. Найди способ.»' },
  ],
  completeMessages: [
    { speaker: '', text: 'Замок в прошлом. Точность всегда вознаграждается.' },
  ],
  objectives: [
    { type: 'destroy', count: 1, targetId: 'fort_lock', targetNameRu: 'Замок форта', description: 'Сбей замок форта' },
    { type: 'kill', count: 2, targetId: 'fort_guard', targetNameRu: 'Охранник форта', description: 'Разберись с 2 охранниками' },
  ],
  rewardSpellId: 'crossbow_bolt',
  xpReward: 100,
};

const QUEST_BANDIT_SPEAR: BodyQuestDef = {
  id: 'bq_bandit_spear', bodyId: 'bandit_spear', tier: 2,
  nameRu: 'Налёт на обоз',
  description: 'Разнеси телегу и забери груз.',
  introMessages: [
    { speaker: '', text: 'Обоз ползёт по дороге. Лёгкая добыча.' },
    { speaker: '', text: 'Главарь указывает на телегу: «Разнеси её. Забери всё.»' },
    { speaker: '', text: 'Копьё в руке. Простая работа.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Щепки и добыча. Копьё бьёт туда куда надо.' },
  ],
  objectives: [
    { type: 'destroy', count: 1, targetId: 'caravan_cart', targetNameRu: 'Телега', description: 'Разнеси телегу' },
    { type: 'collect', count: 1, targetId: 'caravan_cargo', targetNameRu: 'Груз', description: 'Забери груз' },
  ],
  spawnObjects: [
    { objectId: 'caravan_cart', nameRu: 'Телега', icon: '🛒', color: 0x886633, type: 'destructible', count: 1, radius: 400 },
    { objectId: 'caravan_cargo', nameRu: 'Груз', icon: '📦', color: 0xddaa33, type: 'collectible', count: 1, radius: 50 },
  ],
  rewardSpellId: 'spear_thrust',
  xpReward: 100,
};

const QUEST_BANDIT_BRUTE: BodyQuestDef = {
  id: 'bq_bandit_brute', bodyId: 'bandit_brute', tier: 2,
  nameRu: 'Снос',
  description: 'Снеси сторожевую башню у дороги.',
  introMessages: [
    { speaker: '', text: 'Главарь показывает на старую сторожевую башню у дороги.' },
    { speaker: '', text: '«Охрана будет её использовать. Снеси.»' },
    { speaker: '', text: 'Большое тело. Тяжёлый молот. Простая работа.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Щебень. Земля тряслась. Молот помнит.' },
  ],
  objectives: [
    { type: 'destroy', count: 1, targetId: 'watchtower', targetNameRu: 'Сторожевая башня', description: 'Разрушь сторожевую башню' },
  ],
  rewardSpellId: 'hammer_strike',
  xpReward: 100,
};

// ═══════════════════════════════════════════════════════════════
// T2 — Advanced elementals → T2 magic spells
// ═══════════════════════════════════════════════════════════════

const QUEST_ASHER: BodyQuestDef = {
  id: 'bq_asher', bodyId: 'asher', tier: 2,
  nameRu: 'Метки',
  description: 'Оставь огненные метки на границе и прогони чужаков.',
  introMessages: [
    { speaker: '', text: 'Медленно. Тяжело. Давно.' },
    { speaker: '', text: 'Западный склон — не наша территория. Но что-то туда зашло.' },
    { speaker: '', text: 'Запах воды. Запах чужого. Нужно оставить метки чтобы они не вернулись.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Метки горят ярко. Никто не пройдёт. Огненные стрелы — твои.' },
  ],
  objectives: [
    { type: 'reach', count: 3, targetId: 'border_mark', targetNameRu: 'Пограничная метка', description: 'Отметь 3 пограничные точки' },
    { type: 'kill', count: 2, targetId: 'splasher', targetNameRu: 'Водный элементаль', description: 'Прогони 2 водных чужака' },
  ],
  spawnObjects: [{
    objectId: 'border_mark', nameRu: 'Пограничная метка', icon: '🔥', color: 0xff6633,
    type: 'waypoint', count: 3, radius: 500,
  }],
  rewardSpellId: 'mob_fire_t2',
  xpReward: 100,
};

const QUEST_FOGGER: BodyQuestDef = {
  id: 'bq_fogger', bodyId: 'fogger', tier: 2,
  nameRu: 'Туман уходит',
  description: 'Восстанови покров тумана пока берег не виден насквозь.',
  introMessages: [
    { speaker: '', text: 'Туман редеет. Это неправильно.' },
    { speaker: '', text: 'Солнце пробивается. Так не должно быть.' },
    { speaker: '', text: 'Северный берег почти виден насквозь. Нужно восстановить покров.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Покров снова плотный. Озеро хранит тайны. Лёд слушается.' },
  ],
  objectives: [
    { type: 'reach', count: 4, targetId: 'fog_node', targetNameRu: 'Узел тумана', description: 'Восстанови 4 узла тумана' },
  ],
  spawnObjects: [{
    objectId: 'fog_node', nameRu: 'Узел тумана', icon: '🌫️', color: 0x6699cc,
    type: 'waypoint', count: 4, radius: 550,
  }],
  rewardSpellId: 'mob_water_t2',
  xpReward: 100,
};

const QUEST_MUDDER: BodyQuestDef = {
  id: 'bq_mudder', bodyId: 'mudder', tier: 2,
  nameRu: 'Корни ищут воду',
  description: 'Прорасти сквозь породу к подземному источнику.',
  introMessages: [
    { speaker: '', text: 'Сухо. Давно сухо.' },
    { speaker: '', text: 'Где-то глубже есть вода. Чувствуется.' },
    { speaker: '', text: 'Нужно прорасти туда. Через камень. Медленно.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Вода найдена. Земля пьёт. Каменные шипы — твои.' },
  ],
  objectives: [
    { type: 'destroy', count: 3, targetId: 'rock_wall', targetNameRu: 'Слой породы', description: 'Пробей 3 слоя породы' },
    { type: 'reach', count: 1, targetId: 'water_source', targetNameRu: 'Подземный источник', description: 'Доберись до источника' },
  ],
  spawnObjects: [
    { objectId: 'rock_wall', nameRu: 'Слой породы', icon: '🪨', color: 0x886644, type: 'destructible', count: 3, radius: 400 },
    { objectId: 'water_source', nameRu: 'Подземный источник', icon: '💧', color: 0x4499dd, type: 'waypoint', count: 1, radius: 600 },
  ],
  rewardSpellId: 'mob_earth_t2',
  xpReward: 100,
};

const QUEST_WHISTLER: BodyQuestDef = {
  id: 'bq_whistler', bodyId: 'whistler', tier: 2,
  nameRu: 'Фальшивая нота',
  description: 'Найди и убери то что режет песню ветра.',
  introMessages: [
    { speaker: '', text: 'Ветер должен петь.' },
    { speaker: '', text: 'Но сегодня — не так. Что-то режет песню посередине.' },
    { speaker: '', text: 'Где-то на южном склоне. Надо найти.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Песня течёт снова. Ветер режет — с обеих сторон. Лезвия воздуха — твои.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'wind_blocker', targetNameRu: 'Источник помехи', description: 'Найди источник помехи' },
    { type: 'destroy', count: 1, targetId: 'wind_blocker', targetNameRu: 'Помеха', description: 'Убери помеху' },
  ],
  spawnObjects: [
    { objectId: 'wind_blocker', nameRu: 'Источник помехи', icon: '💨', color: 0x88aacc, type: 'waypoint', count: 1, radius: 500 },
    { objectId: 'wind_blocker', nameRu: 'Помеха', icon: '🔩', color: 0x888888, type: 'destructible', count: 1, radius: 500 },
  ],
  rewardSpellId: 'mob_wind_t2',
  xpReward: 100,
};

const QUEST_SPIRIT_WOLF: BodyQuestDef = {
  id: 'bq_spirit_wolf', bodyId: 'spirit_wolf', tier: 2,
  nameRu: 'Лесное милосердие',
  description: 'Найди раненого человека и защити его от хищников 30 секунд.',
  introMessages: [
    { speaker: '', text: 'Лес говорит о боли. Где-то рядом кто-то лежит без движения.' },
    { speaker: '', text: 'Не зверь. Человек. Тяжело дышит.' },
    { speaker: '', text: 'Духи леса не дают умереть без причины.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Он жив. Духи кивают. Кора защищает тех кто служит.' },
  ],
  objectives: [
    { type: 'reach',   count: 1,  targetId: 'wounded_human', targetNameRu: 'Раненый человек', description: 'Найди раненого человека' },
    { type: 'protect', count: 30, targetId: 'wounded_human', targetNameRu: 'Раненый человек', description: 'Защити его 30 сек', zoneRadius: 240 },
  ],
  friendlyCreatureIds: ['wounded_human'],
  rewardSpellId: 'mob_nature_t2',
  xpReward: 100,
};

// ═══════════════════════════════════════════════════════════════
// T2 — Veterans & new bodies → T2 weapon spells
// Paired events marked with ── ПАРА ──
// ═══════════════════════════════════════════════════════════════

// ── ПАРА: Рейд на лагерь (goblin_veteran атакует ↔ orc_veteran защищает) ──

const QUEST_GOBLIN_VETERAN: BodyQuestDef = {
  id: 'bq_goblin_veteran', bodyId: 'goblin_veteran', tier: 2,
  nameRu: 'Ночной рейд',
  description: 'Проберись в лагерь орков под покровом ночи и вынеси добычу.',
  introMessages: [
    { speaker: '', text: 'Лагерь орков спит. Почти.' },
    { speaker: '', text: 'Три ценности. Шатёр вождя.' },
    { speaker: '', text: 'Войди. Выйди. Не дай им увидеть твоё лицо.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Ушёл раньше чем поняли. Метательный клинок — твой.' },
  ],
  objectives: [
    { type: 'steal', count: 3, targetId: 'orc_loot', targetNameRu: 'Орочья добыча', description: 'Укради 3 ценности из орочьего лагеря' },
  ],
  spawnObjects: [{
    objectId: 'orc_loot', nameRu: 'Орочья добыча', icon: '💰', color: 0xddaa33,
    type: 'collectible', count: 4, radius: 300,
  }],
  rewardSpellId: 'knife_throw',
  xpReward: 100,
};

const QUEST_ORC_VETERAN: BodyQuestDef = {
  id: 'bq_orc_veteran', bodyId: 'orc_veteran', tier: 2,
  nameRu: 'Страж лагеря',
  description: 'Прогони гоблинов-воров одним широким ударом.',
  introMessages: [
    { speaker: '', text: 'Что-то скользит в тенях.' },
    { speaker: '', text: 'Гоблины. Опять.' },
    { speaker: '', text: 'Один широкий удар — и всех сразу.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Лагерь чист. Широкая дуга — твоя.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'goblin', targetNameRu: 'Гоблин-вор', description: 'Убей 3 гоблинов-воров' },
  ],
  rewardSpellId: 'slash_sweep',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_orc',
};

// ── ПАРА: Лесной конфликт (wolf_veteran охотится ↔ bear_veteran защищает) ──

const QUEST_WOLF_VETERAN: BodyQuestDef = {
  id: 'bq_wolf_veteran', bodyId: 'wolf_veteran', tier: 2,
  nameRu: 'Два удара',
  description: 'Возглавь охоту и докажи право вожака.',
  introMessages: [
    { speaker: '', text: 'Стая тощая. Трое суток без настоящей добычи.' },
    { speaker: '', text: 'Молодой бросает вызов. Ответь.' },
    { speaker: '', text: 'Вожак бьёт дважды. Раз за ранг. Раз за еду.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Никто не оспорил второй удар. Стая сыта.' },
  ],
  objectives: [
    { type: 'kill', count: 1, targetId: 'wolf', targetNameRu: 'Претендент', description: 'Победи претендента' },
    { type: 'kill', count: 2, targetId: 'deer', targetNameRu: 'Олень', description: 'Возглавь охоту: добудь 2 оленей' },
  ],
  rewardSpellId: 'double_strike',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_wolf',
};

const QUEST_BEAR_VETERAN: BodyQuestDef = {
  id: 'bq_bear_veteran', bodyId: 'bear_veteran', tier: 2,
  nameRu: 'Старые раны',
  description: 'Отгони стаю волков от своей территории.',
  introMessages: [
    { speaker: '', text: 'Старые кости. Старые шрамы.' },
    { speaker: '', text: 'Четыре волка кружат. Чуют возраст.' },
    { speaker: '', text: 'Думают — возраст значит медленный. Покажи иначе.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Стая рассеялась. Старый не значит слабый.' },
  ],
  objectives: [
    { type: 'kill', count: 4, targetId: 'wolf', targetNameRu: 'Волк', description: 'Отгони 4 волков' },
  ],
  rewardSpellId: 'mace_bash',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_bear',
};

// ── ПАРА: Защита каравана (bandit_spear атакует ↔ caravan_guard защищает) ──
// ── (bandit_archer атакует ↔ scout_veteran подавляет лучников) ──

const QUEST_CARAVAN_GUARD: BodyQuestDef = {
  id: 'bq_caravan_guard', bodyId: 'caravan_guard', tier: 2,
  nameRu: 'Держать строй',
  description: 'Оттесни копейщиков-разбойников от телеги.',
  introMessages: [
    { speaker: '', text: 'Обоз едет. Ты идёшь рядом.' },
    { speaker: '', text: 'Копейщики у опушки. Трое.' },
    { speaker: '', text: 'Оттесни их прежде чем доберутся до телеги.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Телега едет дальше. Тупой конец копья не хуже острого.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'bandit_spear', targetNameRu: 'Разбойник-копейщик', description: 'Отбей 3 копейщиков-разбойников' },
  ],
  rewardSpellId: 'spear_butt',
  xpReward: 100,
};

const QUEST_SCOUT_VETERAN: BodyQuestDef = {
  id: 'bq_scout_veteran', bodyId: 'scout_veteran', tier: 2,
  nameRu: 'Контрмера',
  description: 'Сними лучников-разбойников пока они не подожгли телегу.',
  introMessages: [
    { speaker: '', text: 'Лучники. Опушка с севера. Двое.' },
    { speaker: '', text: 'Они держат угол на телегу.' },
    { speaker: '', text: 'Стреляй первым. Прыжок назад — и ты не мишень.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Лучники пали. Прыгнул назад — пусть стреляют в воздух.' },
  ],
  objectives: [
    { type: 'kill', count: 2, targetId: 'bandit_archer', targetNameRu: 'Разбойник-лучник', description: 'Устрани 2 лучников-разбойников' },
  ],
  rewardSpellId: 'bow_backshot',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_scout',
};

// ── ОДИНОЧНЫЕ ──────────────────────────────────────────────────

const QUEST_MONKEY: BodyQuestDef = {
  id: 'bq_monkey', bodyId: 'monkey', tier: 2,
  nameRu: 'Нарушитель спокойствия',
  description: 'Займи высоту и разгони чужаков.',
  introMessages: [
    { speaker: '', text: 'Высоко. Громко. Это дерево — твой трон.' },
    { speaker: '', text: 'Чужаки внизу. Слишком близко к стае.' },
    { speaker: '', text: 'Прыгни. Бей первым. Запутай их раньше чем поймут что произошло.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Разбежались и растерялись. Дезориентирующий удар — твой.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'high_branch', targetNameRu: 'Высотная ветка', description: 'Займи высотную ветку' },
    { type: 'kill', count: 3, description: 'Разгони 3 нарушителей' },
  ],
  spawnObjects: [{
    objectId: 'high_branch', nameRu: 'Высотная ветка', icon: '🌳', color: 0x44aa44,
    type: 'waypoint', count: 1, radius: 300,
  }],
  rewardSpellId: 'fist_strike',
  xpReward: 100,
  // TODO: add monkey to creatureDB (Fists weapon, Passive/Combat)
};

const QUEST_BANDIT_ARCHER_VET: BodyQuestDef = {
  id: 'bq_bandit_archer_veteran', bodyId: 'bandit_archer_veteran', tier: 2,
  nameRu: 'Ливень стрел',
  description: 'Прикрой отход подавляющим огнём.',
  introMessages: [
    { speaker: '', text: 'Лагерь отступает. Охрана наседает.' },
    { speaker: '', text: 'Держи дорогу. Широкое прикрытие.' },
    { speaker: '', text: 'Когда одной стрелы мало — пусти двадцать.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Дорога устояла. Ливень стрел — твой.' },
  ],
  objectives: [
    { type: 'kill', count: 4, targetId: 'caravan_guard', targetNameRu: 'Охранник', description: 'Сдержи 4 охранников' },
  ],
  rewardSpellId: 'arrow_rain',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_bandit_archer',
};

const QUEST_BANDIT_CROSSBOW_VET: BodyQuestDef = {
  id: 'bq_bandit_crossbow_veteran', bodyId: 'bandit_crossbow_veteran', tier: 2,
  nameRu: 'Прижать к земле',
  description: 'Пригвозди охранников прежде чем они смогут перестроиться.',
  introMessages: [
    { speaker: '', text: 'Трое охранников. Быстрые. Слишком рассредоточены для залпа.' },
    { speaker: '', text: 'Прижми одного. Остальные остановятся помочь.' },
    { speaker: '', text: 'Потом прижми и их.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Никто не пошёл туда куда хотел. Контроль — твой.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'caravan_guard', targetNameRu: 'Охранник', description: 'Нейтрализуй 3 охранников' },
  ],
  rewardSpellId: 'crossbow_snare',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_bandit_crossbow',
};

const QUEST_BANDIT_SPEAR_VET: BodyQuestDef = {
  id: 'bq_bandit_spear_veteran', bodyId: 'bandit_spear_veteran', tier: 2,
  nameRu: 'Сдержать натиск',
  description: 'Удержи нескольких охранников тупым концом копья.',
  introMessages: [
    { speaker: '', text: 'Четверо охранников наступают с двух сторон.' },
    { speaker: '', text: 'Острие убивает одного. Тупой конец держит четверых.' },
    { speaker: '', text: 'Оттолкни прежде чем окружат.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Никто не подошёл достаточно близко. Задний конец копья — половина оружия.' },
  ],
  objectives: [
    { type: 'kill', count: 4, targetId: 'caravan_guard', targetNameRu: 'Охранник', description: 'Оттолкни 4 охранников' },
  ],
  rewardSpellId: 'spear_butt',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_bandit_spear',
};

const QUEST_BANDIT_BRUTE_VET: BodyQuestDef = {
  id: 'bq_bandit_brute_veteran', bodyId: 'bandit_brute_veteran', tier: 2,
  nameRu: 'Берсерк',
  description: 'Проломи тяжёлые латы подкрепления.',
  introMessages: [
    { speaker: '', text: 'Подкрепление. Трое. Тяжёлые доспехи.' },
    { speaker: '', text: 'Молоту всё равно что на тебе надето.' },
    { speaker: '', text: 'Разбей латы. Потом разберись с тем что внутри.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Три комплекта доспехов. Теперь лом. Тяжёлый удар — твой.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'caravan_guard', targetNameRu: 'Бронированный охранник', description: 'Расправься с 3 бронированными охранниками' },
  ],
  rewardSpellId: 'hammer_smash',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_bandit_brute',
};

// ═══════════════════════════════════════════════════════════════
// CONFLICT QUESTS — opposing sides, same event
// ═══════════════════════════════════════════════════════════════

export const CONFLICT_CARAVAN: ConflictQuestDef = {
  id: 'conflict_caravan',
  nameRu: 'Обоз',
  description: 'Торговый обоз пересекает земли разбойников. У обеих сторон свой интерес.',
  location: 'trade_road',
  sides: [
    {
      side: 'attacker',
      bodyIds: ['orc', 'goblin', 'bandit_brute'],
      objectiveDescription: 'Ограбь обоз. Забери груз.',
      npcCount: 6,
    },
    {
      side: 'defender',
      bodyIds: ['scout', 'bandit_spear'],
      objectiveDescription: 'Сопроводи обоз до безопасного места.',
      npcCount: 4,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// T3 Conflict quests (orc_caravan, scout_escort) — removed for now.
// Kept CONFLICT_CARAVAN as a placeholder for Chapter 2 PvP events.
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// T1 — New animals (hare, deer, fox, boar, grouse)
// ═══════════════════════════════════════════════════════════════

const QUEST_HARE: BodyQuestDef = {
  id: 'bq_hare', bodyId: 'hare', tier: 1,
  nameRu: 'Быстрые лапки',
  description: 'Собери морковки прежде чем появится кто-то крупный.',
  introMessages: [
    { speaker: '', text: 'Маленькое. Быстрое. Мир полон великанов.' },
    { speaker: '', text: 'Но сейчас — голод. Нос подрагивает. Морковка. Рядом.' },
    { speaker: '', text: 'Собрать пока что-то крупное не появилось.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Сыт. Тело быстрее чем казалось. Ускорение — твоё.' },
  ],
  objectives: [
    { type: 'collect', count: 5, targetId: 'carrot', targetNameRu: 'Морковка', description: 'Собери 5 морковок' },
  ],
  spawnObjects: [{
    objectId: 'carrot', nameRu: 'Морковка', icon: '🥕', color: 0xff8833,
    type: 'collectible', count: 6, radius: 300,
  }],
  rewardSpellId: 'acceleration',
  xpReward: 40,
};

const QUEST_DEER: BodyQuestDef = {
  id: 'bq_deer', bodyId: 'deer', tier: 1,
  nameRu: 'Лёгкий бег',
  description: 'Доберись до безопасной поляны и не оглядывайся.',
  introMessages: [
    { speaker: '', text: 'Стройные ноги. Ветер в шерсти. Луг широкий.' },
    { speaker: '', text: 'Что-то смотрит из опушки. Далеко — поляна. Безопасно.' },
    { speaker: '', text: 'Бежать. Не оглядываться.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Никто не догнал. Сам ветер научил делать рывок.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'safe_clearing', targetNameRu: 'Безопасная поляна', description: 'Доберись до безопасной поляны' },
  ],
  spawnObjects: [{
    objectId: 'safe_clearing', nameRu: 'Безопасная поляна', icon: '🌿', color: 0x44dd44,
    type: 'waypoint', count: 1, radius: 700,
  }],
  rewardSpellId: 'dash',
  xpReward: 40,
};

const QUEST_FOX: BodyQuestDef = {
  id: 'bq_fox', bodyId: 'fox', tier: 1,
  nameRu: 'Хитрый охотник',
  description: 'Поймай зайцев на лугу — тело само знает как.',
  introMessages: [
    { speaker: '', text: 'Острый нос. Острый ум. На лугу пахнет зайцем.' },
    { speaker: '', text: 'Они быстрые — но не быстрее.' },
    { speaker: '', text: 'Трёх хватит. Тело само знает что делать.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Быстро и точно. Тело лисы учит бить первой. Хук — твой.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'hare', targetNameRu: 'Заяц', description: 'Поймай 3 зайца' },
  ],
  rewardSpellId: 'hook',
  xpReward: 50,
};

const QUEST_BOAR: BodyQuestDef = {
  id: 'bq_boar', bodyId: 'boar', tier: 1,
  nameRu: 'Неудержимый',
  description: 'Прогони волков — лес расступается перед тобой.',
  introMessages: [
    { speaker: '', text: 'Толстая шкура. Мощные ноги. Лес расступается перед тобой.' },
    { speaker: '', text: 'Волки кружат рядом. Они научатся бояться удара.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Ничто не встало поперёк. Тело кабана учит идти напролом. Таран — твой.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'wolf', targetNameRu: 'Волк', description: 'Прогони 3 волков' },
  ],
  rewardSpellId: 'ram',
  xpReward: 60,
};

const QUEST_GROUSE: BodyQuestDef = {
  id: 'bq_grouse', bodyId: 'grouse', tier: 1,
  nameRu: 'Инстинкт целителя',
  description: 'Выживи 30 секунд — тело само подбирает целебные ягоды.',
  introMessages: [
    { speaker: '', text: 'Маленькие крылья. Острые глаза. В подлеске много тайн.' },
    { speaker: '', text: 'Некоторые ягоды лечат. Тело помнит какие.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Самое маленькое существо научило самому важному — лечить.' },
  ],
  objectives: [
    { type: 'survive', count: 30, description: 'Выживи 30 секунд' },
  ],
  rewardSpellId: 'neutral_heal',
  xpReward: 40,
};

// ═══════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════

export const BODY_QUESTS: BodyQuestDef[] = [
  // T1 Animals
  QUEST_WOLF, QUEST_BEAR,
  QUEST_HARE, QUEST_DEER, QUEST_FOX, QUEST_BOAR, QUEST_GROUSE,
  // T1 Humanoids
  QUEST_GOBLIN, QUEST_ORC, QUEST_SCOUT, QUEST_SHAMAN, QUEST_CARAVAN_MERCHANT,
  // T1 Elementals
  QUEST_SPARK, QUEST_SPLASHER, QUEST_PEBBLE, QUEST_GUSTY,
  // T2 Bandits
  QUEST_BANDIT_ARCHER, QUEST_BANDIT_CROSSBOW, QUEST_BANDIT_SPEAR, QUEST_BANDIT_BRUTE,
  // T2 Elementals
  QUEST_ASHER, QUEST_FOGGER, QUEST_MUDDER, QUEST_WHISTLER, QUEST_SPIRIT_WOLF,
  // T2 Veterans — paired events
  QUEST_GOBLIN_VETERAN, QUEST_ORC_VETERAN,       // Рейд на лагерь
  QUEST_WOLF_VETERAN, QUEST_BEAR_VETERAN,         // Лесной конфликт
  QUEST_CARAVAN_GUARD, QUEST_SCOUT_VETERAN,       // Защита каравана
  // T2 Veterans — solo
  QUEST_MONKEY,
  QUEST_BANDIT_ARCHER_VET, QUEST_BANDIT_CROSSBOW_VET,
  QUEST_BANDIT_SPEAR_VET, QUEST_BANDIT_BRUTE_VET,
];

export const CONFLICT_QUESTS: ConflictQuestDef[] = [
  CONFLICT_CARAVAN,
];

const BODY_QUEST_MAP = new Map<string, BodyQuestDef[]>();
for (const bq of BODY_QUESTS) {
  const list = BODY_QUEST_MAP.get(bq.bodyId) ?? [];
  list.push(bq);
  BODY_QUEST_MAP.set(bq.bodyId, list);
}

export function getBodyQuests(bodyId: string): BodyQuestDef[] {
  return BODY_QUEST_MAP.get(bodyId) ?? [];
}

export function getBodyQuest(bodyId: string): BodyQuestDef | undefined {
  return BODY_QUEST_MAP.get(bodyId)?.[0];
}
