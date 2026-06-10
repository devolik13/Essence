import { BodyQuestDef, ConflictQuestDef } from '../types/bodyQuests';

// ═══════════════════════════════════════════════════════════════
// T1 — Simple quests (animals, basic humanoids) → T1 spells
// ═══════════════════════════════════════════════════════════════


const QUEST_WOLF: BodyQuestDef = {
  id: 'bq_wolf', bodyId: 'wolf', tier: 1,
  nameRu: 'Голодная стая',
  nameEn: 'The Hungry Pack',
  description: 'Иди с волками на охоту и докажи что достоин стаи.',
  descriptionEn: 'Hunt with the wolves and prove you are worthy of the pack.',
  introMessages: [
    { speaker: '', text: 'Scents speak louder than words. The pack is hungry — two days without a kill.', textRu: 'Запахи говорят больше слов. Стая голодна — двое суток без добычи.' },
    { speaker: '', text: 'The alpha watches. Waits. The young one must prove himself.', textRu: 'Вожак смотрит. Ждёт. Молодому надо доказать.' },
    { speaker: '', text: 'A deer passed here an hour ago. The trail leads east.', textRu: 'Олень был здесь час назад. След ведёт на восток.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The prey is taken. The pack is fed. The alpha nods. The blade of instinct is yours now.', textRu: 'Добыча взята. Стая сыта. Вожак кивает. Клинок инстинкта — теперь твой.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'deer', targetNameRu: 'Олень', targetNameEn: 'Deer', description: 'Выследи 3 оленей', descriptionEn: 'Hunt down 3 deer' },
  ],
  rewardSpellId: 'sword_strike',
  xpReward: 50,
};

const QUEST_BEAR: BodyQuestDef = {
  id: 'bq_bear', bodyId: 'bear', tier: 1,
  nameRu: 'Лесной пожар',
  nameEn: 'Forest Fire',
  description: 'Убей огненных элементалей пока они не сожгли рощу.',
  descriptionEn: 'Kill the fire elementals before they burn down the grove.',
  introMessages: [
    { speaker: '', text: 'Smoke. Wrong. The grove should not smell like this.', textRu: 'Дым. Не то. Роща не должна так пахнуть.' },
    { speaker: '', text: 'Two small fires crept in from the south. They are spreading.', textRu: 'Два маленьких огня пробрались с юга. Они расползаются.' },
    { speaker: '', text: 'Ten trees from the den. Move.', textRu: 'Десять деревьев до берлоги. Двигайся.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The fires are out. The grove holds. This body teaches you to hit heavy.', textRu: 'Огни погашены. Роща держится. Тело учит бить тяжело.' },
  ],
  objectives: [
    { type: 'kill', count: 2, targetId: 'spark', targetNameRu: 'Огонёк', targetNameEn: 'Spark', description: 'Убей 2 огненных элементаля', descriptionEn: 'Kill 2 fire elementals' },
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
  nameEn: 'Quick Fingers',
  description: 'Обчисти охотничий лагерь и принеси добычу племени.',
  descriptionEn: 'Clean out the hunting camp and bring the loot back to the tribe.',
  introMessages: [
    { speaker: '', text: 'Small body. Fast. Hungry.', textRu: 'Маленькое тело. Быстрое. Голодное.' },
    { speaker: '', text: 'The tribe waits at the edge. Something must be brought back.', textRu: 'Племя ждёт на краю. Нужно принести что-нибудь.' },
    { speaker: '', text: 'A hunting camp nearby. Crates with no guards.', textRu: 'Охотничий лагерь рядом. Ящики без охраны.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The tribe eats tonight. The quick blade is yours.', textRu: 'Племя сегодня поест. Быстрый клинок — твой.' },
  ],
  objectives: [
    { type: 'steal', count: 3, targetId: 'camp_supplies', targetNameRu: 'Снаряжение', targetNameEn: 'Supplies', description: 'Укради 3 ящика снаряжения', descriptionEn: 'Steal 3 crates of supplies' },
  ],
  spawnObjects: [{
    objectId: 'camp_supplies', nameRu: 'Снаряжение', nameEn: 'Supplies', icon: '📦', color: 0xddaa33,
    type: 'collectible', count: 4, radius: 350,
  }],
  rewardSpellId: 'sting',
  xpReward: 50,
};

const QUEST_ORC: BodyQuestDef = {
  id: 'bq_orc', bodyId: 'orc', tier: 1,
  nameRu: 'Обряд силы',
  nameEn: 'Rite of Strength',
  description: 'Вызови вождя на поединок и докажи право быть в племени.',
  descriptionEn: 'Challenge the chieftain to a duel and earn your place in the tribe.',
  introMessages: [
    { speaker: '', text: 'Big body. Heavy. Strong.', textRu: 'Большое тело. Тяжёлое. Сильное.' },
    { speaker: '', text: 'The chieftain stands at the center. The tribe watches.', textRu: 'Вождь стоит в центре. Племя смотрит.' },
    { speaker: '', text: 'One way to prove yourself — challenge him to a duel.', textRu: 'Один путь доказать себя — вызвать на поединок.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The chieftain has fallen. The tribe bows. The blade is yours.', textRu: 'Вождь пал. Племя склонилось. Клинок — твой.' },
  ],
  objectives: [
    { type: 'kill', count: 1, targetId: 'orc_veteran', targetNameRu: 'Вождь', targetNameEn: 'Chieftain', description: 'Победи вождя в поединке', descriptionEn: 'Defeat the chieftain in a duel' },
  ],
  friendlyCreatureIds: ['orc'],
  rewardSpellId: 'slash',
  xpReward: 50,
};

const QUEST_SCOUT: BodyQuestDef = {
  id: 'bq_scout', bodyId: 'scout', tier: 1,
  nameRu: 'Глаза на дороге',
  nameEn: 'Eyes on the Road',
  description: 'Проверь торговую дорогу перед выходом обоза.',
  descriptionEn: 'Check the trade road before the caravan sets out.',
  introMessages: [
    { speaker: '', text: 'Light body. Quiet. At home in the forest.', textRu: 'Лёгкое тело. Тихое. Привыкшее к лесу.' },
    { speaker: '', text: 'The trade caravan leaves at dawn.', textRu: 'Торговый обоз выходит на рассвете.' },
    { speaker: '', text: 'The road must be checked. Three points.', textRu: 'Дорогу нужно проверить. Три точки.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The road is clear — for now. A sharp eye is a weapon of its own.', textRu: 'Дорога чиста — пока. Острый глаз — своё оружие.' },
  ],
  objectives: [
    { type: 'reach', count: 3, targetId: 'checkpoint', targetNameRu: 'Контрольная точка', targetNameEn: 'Checkpoint', description: 'Проверь 3 контрольные точки', descriptionEn: 'Check 3 checkpoints' },
  ],
  spawnObjects: [{
    objectId: 'checkpoint', nameRu: 'Контрольная точка', nameEn: 'Checkpoint', icon: '🔍', color: 0x55aaff,
    type: 'waypoint', count: 3, radius: 2000, // ×4: настоящая разведка дороги, а не прогулка
  }],
  rewardSpellId: 'bow_shot',
  xpReward: 50,
};

const QUEST_SHAMAN: BodyQuestDef = {
  id: 'bq_shaman', bodyId: 'shaman', tier: 1,
  nameRu: 'Зов духов',
  nameEn: 'Call of the Spirits',
  description: 'Дойди до духовной поляны и слушай голоса леса.',
  descriptionEn: 'Reach the spirit clearing and listen to the voices of the forest.',
  introMessages: [
    { speaker: '', text: 'The world is full of voices. The trees speak. The wind carries names.', textRu: 'Мир полон голосов. Деревья говорят. Ветер несёт имена.' },
    { speaker: '', text: 'Night. Go to the clearing and call.', textRu: 'Ночь. Нужно идти на поляну и позвать.' },
    { speaker: '', text: 'The spirits come only to those who know how to listen.', textRu: 'Духи приходят только к тем кто умеет слушать.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The spirits have answered. Their gift — a companion from the forest.', textRu: 'Духи откликнулись. Их дар — спутник из леса.' },
  ],
  objectives: [
    { type: 'meditate', count: 30, targetId: 'spirit_clearing', meditateRadius: 100, description: 'Медитируй 30 сек на поляне (не покидай круг)', descriptionEn: 'Meditate for 30 sec at the clearing (stay inside the circle)' },
  ],
  spawnObjects: [{
    objectId: 'spirit_clearing', nameRu: 'Духовная поляна', nameEn: 'Spirit Clearing', icon: '🌀', color: 0x8866ff,
    type: 'waypoint', count: 1, radius: 450,
  }],
  rewardSpellId: 'mob_summon_wolf',
  xpReward: 50,
};

// ═══════════════════════════════════════════════════════════════
// T1 — Elementals → T1 magic spells
// ═══════════════════════════════════════════════════════════════

const QUEST_SPARK: BodyQuestDef = {
  id: 'bq_spark', bodyId: 'spark', tier: 1,
  nameRu: 'Первый огонь',
  nameEn: 'First Fire',
  description: 'Подожги 10 деревьев — пусть роща узнает твоё имя.',
  descriptionEn: 'Set 10 trees ablaze — let the grove learn your name.',
  introMessages: [
    { speaker: '', text: 'Hot. Alive. That is what we are.', textRu: 'Горячо. Живое. Это и есть мы.' },
    { speaker: '', text: 'The trees stand cold and silent. They do not know fire yet.', textRu: 'Деревья стоят холодные и тихие. Они ещё не знают огня.' },
    { speaker: '', text: 'Show them.', textRu: 'Покажи им.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Ten trees. The grove knows your name. The spark is yours.', textRu: 'Десять деревьев. Роща знает твоё имя. Искра — твоя.' },
  ],
  objectives: [
    { type: 'destroy', count: 10, targetId: 'dry_tree', targetNameRu: 'Сухое дерево', targetNameEn: 'Dry Tree', description: 'Подожги 10 деревьев', descriptionEn: 'Set 10 trees on fire' },
  ],
  spawnObjects: [{
    objectId: 'dry_tree', nameRu: 'Сухое дерево', nameEn: 'Dry Tree', icon: '🪵', color: 0x886633,
    type: 'destructible', count: 12, radius: 400,
  }],
  rewardSpellId: 'mob_fire_spark',
  xpReward: 50,
};

const QUEST_SPLASHER: BodyQuestDef = {
  id: 'bq_splasher', bodyId: 'splasher', tier: 1,
  nameRu: 'Залить',
  nameEn: 'Douse',
  description: 'Вода исправляет то что огонь сломал. Потуши 5 горящих деревьев.',
  descriptionEn: 'Water mends what fire has broken. Put out 5 burning trees.',
  introMessages: [
    { speaker: '', text: 'Fire. Wrong. It does not belong here.', textRu: 'Огонь. Неправильно. Ему здесь не место.' },
    { speaker: '', text: 'Five trees burn at the edge of the lake.', textRu: 'Пять деревьев горят у края озера.' },
    { speaker: '', text: 'Water mends what fire has broken.', textRu: 'Вода исправляет то что огонь сломал.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Cold. Quiet. The shore breathes again. The ice obeys you.', textRu: 'Холодно. Тихо. Берег дышит снова. Лёд слушается тебя.' },
  ],
  objectives: [
    { type: 'destroy', count: 5, targetId: 'burning_tree', targetNameRu: 'Горящее дерево', targetNameEn: 'Burning Tree', description: 'Потуши 5 горящих деревьев', descriptionEn: 'Put out 5 burning trees' },
  ],
  spawnObjects: [{
    objectId: 'burning_tree', nameRu: 'Горящее дерево', nameEn: 'Burning Tree', icon: '🔥', color: 0xff7733,
    type: 'destructible', count: 7, radius: 800, // ×2: пожар разбросан по роще
  }],
  rewardSpellId: 'mob_ice_shard',
  xpReward: 50,
};

const QUEST_PEBBLE: BodyQuestDef = {
  id: 'bq_pebble', bodyId: 'pebble', tier: 1,
  nameRu: 'Место в стене',
  nameEn: 'A Place in the Wall',
  description: 'Доберись до пробоины и стань её частью.',
  descriptionEn: 'Reach the breach and become part of it.',
  introMessages: [
    { speaker: '', text: 'Heavy. Steady. Right.', textRu: 'Тяжело. Устойчиво. Правильно.' },
    { speaker: '', text: 'There — a breach in the western wall of the cave.', textRu: 'Там — пробоина в западной стене пещеры.' },
    { speaker: '', text: 'Without it the vault will begin to sag. Take the place. Become part of it.', textRu: 'Без неё свод начнёт оседать. Нужно занять место. Стать частью.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The breach is sealed. The vault holds. The weight of stone is in your hands now.', textRu: 'Пробоина закрыта. Свод держится. Тяжесть камня — теперь в твоих руках.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'cave_breach', targetNameRu: 'Пробоина в стене', targetNameEn: 'Breach in the Wall', description: 'Доберись до пробоины', descriptionEn: 'Reach the breach' },
  ],
  spawnObjects: [{
    objectId: 'cave_breach', nameRu: 'Пробоина в стене', nameEn: 'Breach in the Wall', icon: '🪨', color: 0x886633,
    type: 'waypoint', count: 1, radius: 600,
  }],
  rewardSpellId: 'mob_pebble_shot',
  xpReward: 50,
};

const QUEST_GUSTY: BodyQuestDef = {
  id: 'bq_gusty', bodyId: 'gusty', tier: 1,
  nameRu: 'Хищник вершин',
  nameEn: 'Predator of the Peaks',
  description: 'Ветер бьёт первым. Уничтожь любого элементаля.',
  descriptionEn: 'The wind strikes first. Destroy any elemental.',
  introMessages: [
    { speaker: '', text: 'The wind does not wait. The wind does not ask.', textRu: 'Ветер не ждёт. Ветер не спрашивает.' },
    { speaker: '', text: 'Another elemental stirs nearby. It does not matter which.', textRu: 'Рядом шевелится другой элементаль. Неважно кто.' },
    { speaker: '', text: 'The wind is faster than all. Prove it.', textRu: 'Ветер — быстрее всех. Докажи.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Gone. The peaks are yours. The gust is yours now.', textRu: 'Исчез. Вершины твои. Порыв — теперь твой.' },
  ],
  objectives: [
    // targetCategory 'elemental' = засчитывается убийство любого стихийного существа
    // (а не любого моба вообще).
    { type: 'kill', count: 1, targetCategory: 'elemental', description: 'Уничтожь любого элементаля', descriptionEn: 'Destroy any elemental' },
  ],
  rewardSpellId: 'mob_gust',
  xpReward: 50,
};

const QUEST_CARAVAN_MERCHANT: BodyQuestDef = {
  id: 'bq_caravan_merchant', bodyId: 'caravan_merchant', tier: 1,
  nameRu: 'Живой груз',
  nameEn: 'Living Cargo',
  description: 'Обоз атакован. Охрана дерётся. Ты — лечи.',
  descriptionEn: 'The caravan is under attack. The guards fight. You — heal.',
  introMessages: [
    { speaker: '', text: 'Arrows. From behind. Three archers at the treeline.', textRu: 'Стрелы. Сзади. Трое лучников у опушки.' },
    { speaker: '', text: 'The guards are holding — but not for long.', textRu: 'Охрана держится — но ненадолго.' },
    { speaker: '', text: 'You have no weapon. But you can keep them on their feet.', textRu: 'У тебя нет оружия. Но ты можешь держать их на ногах.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The guards survived. The caravan got through. A merchant\'s hands are not only for gold.', textRu: 'Охрана выжила. Обоз прошёл. Руки торговца — не только для золота.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'bandit_archer', targetNameRu: 'Разбойник-лучник', targetNameEn: 'Bandit Archer', description: 'Защити охрану — убей 3 разбойников-лучников', descriptionEn: 'Protect the guards — kill 3 bandit archers' },
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
  nameEn: 'Caravan Raid',
  description: 'Сожги телегу и забери груз.',
  descriptionEn: 'Burn the cart and take the cargo.',
  introMessages: [
    { speaker: '', text: 'Dust on the road. A caravan. Almost no guards.', textRu: 'Пыль на дороге. Обоз. Охраны почти нет.' },
    { speaker: '', text: 'The boss nods: "Burn the cart. Take what\'s inside."', textRu: 'Главарь кивает: «Сожги телегу. Забери что внутри.»' },
    { speaker: '', text: 'Arrows at the ready. Time to earn your cut.', textRu: 'Стрелы наготове. Пора зарабатывать долю.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The cart burns. The cargo is yours. You learned to shoot and slip away.', textRu: 'Телега горит. Груз твой. Научился стрелять и уходить.' },
  ],
  objectives: [
    { type: 'destroy', count: 1, targetId: 'caravan_cart', targetNameRu: 'Телега', targetNameEn: 'Cart', description: 'Разнеси телегу', descriptionEn: 'Wreck the cart' },
    { type: 'collect', count: 1, targetId: 'caravan_cargo', targetNameRu: 'Груз', targetNameEn: 'Cargo', description: 'Забери груз', descriptionEn: 'Take the cargo' },
  ],
  spawnObjects: [
    { objectId: 'caravan_cart', nameRu: 'Телега', nameEn: 'Cart', icon: '🛒', color: 0x886633, type: 'destructible', count: 1, radius: 400 },
    { objectId: 'caravan_cargo', nameRu: 'Груз', nameEn: 'Cargo', icon: '📦', color: 0xddaa33, type: 'collectible', count: 1, radius: 50 },
  ],
  rewardSpellId: 'longbow_shot',
  xpReward: 100,
};

const QUEST_BANDIT_CROSSBOW: BodyQuestDef = {
  id: 'bq_bandit_crossbow', bodyId: 'bandit_crossbow', tier: 2,
  nameRu: 'Взломщик',
  nameEn: 'The Lockbreaker',
  description: 'Сбей замок старого форта и разберись с охраной.',
  descriptionEn: 'Shoot off the old fort\'s lock and deal with the guards.',
  introMessages: [
    { speaker: '', text: 'The boss points at the gates of the old fort.', textRu: 'Главарь показывает на ворота старого форта.' },
    { speaker: '', text: 'A lock. Thick. The key is lost.', textRu: 'Замок. Толстый. Ключ потерян.' },
    { speaker: '', text: '"You\'re the best shot. Find a way."', textRu: '«Ты лучший стрелок. Найди способ.»' },
  ],
  completeMessages: [
    { speaker: '', text: 'The lock is history. Precision is always rewarded.', textRu: 'Замок в прошлом. Точность всегда вознаграждается.' },
  ],
  objectives: [
    { type: 'destroy', count: 1, targetId: 'fort_lock', targetNameRu: 'Замок форта', targetNameEn: 'Fort Lock', description: 'Сбей замок форта', descriptionEn: 'Shoot off the fort\'s lock' },
    { type: 'kill', count: 2, targetId: 'fort_guard', targetNameRu: 'Охранник форта', targetNameEn: 'Fort Guard', description: 'Разберись с 2 охранниками', descriptionEn: 'Deal with 2 guards' },
  ],
  rewardSpellId: 'crossbow_bolt',
  xpReward: 100,
};

const QUEST_BANDIT_SPEAR: BodyQuestDef = {
  id: 'bq_bandit_spear', bodyId: 'bandit_spear', tier: 2,
  nameRu: 'Налёт на обоз',
  nameEn: 'Caravan Raid',
  description: 'Разнеси телегу и забери груз.',
  descriptionEn: 'Wreck the cart and take the cargo.',
  introMessages: [
    { speaker: '', text: 'A caravan crawls along the road. Easy prey.', textRu: 'Обоз ползёт по дороге. Лёгкая добыча.' },
    { speaker: '', text: 'The boss points at the cart: "Wreck it. Take everything."', textRu: 'Главарь указывает на телегу: «Разнеси её. Забери всё.»' },
    { speaker: '', text: 'A spear in hand. Simple work.', textRu: 'Копьё в руке. Простая работа.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Splinters and spoils. The spear strikes where it should.', textRu: 'Щепки и добыча. Копьё бьёт туда куда надо.' },
  ],
  objectives: [
    { type: 'destroy', count: 1, targetId: 'caravan_cart', targetNameRu: 'Телега', targetNameEn: 'Cart', description: 'Разнеси телегу', descriptionEn: 'Wreck the cart' },
    { type: 'collect', count: 1, targetId: 'caravan_cargo', targetNameRu: 'Груз', targetNameEn: 'Cargo', description: 'Забери груз', descriptionEn: 'Take the cargo' },
  ],
  spawnObjects: [
    { objectId: 'caravan_cart', nameRu: 'Телега', nameEn: 'Cart', icon: '🛒', color: 0x886633, type: 'destructible', count: 1, radius: 400 },
    { objectId: 'caravan_cargo', nameRu: 'Груз', nameEn: 'Cargo', icon: '📦', color: 0xddaa33, type: 'collectible', count: 1, radius: 50 },
  ],
  rewardSpellId: 'spear_thrust',
  xpReward: 100,
};

const QUEST_BANDIT_BRUTE: BodyQuestDef = {
  id: 'bq_bandit_brute', bodyId: 'bandit_brute', tier: 1,
  nameRu: 'Налёт на храм',
  nameEn: 'Temple Raid',
  description: 'Разрушь алтарь храма — монахи мешают племени.',
  descriptionEn: 'Destroy the temple altar — the monks are in the gang\'s way.',
  introMessages: [
    { speaker: '', text: 'The boss points at the temple by the road.', textRu: 'Главарь показывает на храм у дороги.' },
    { speaker: '', text: '"The monks are in the way. The altar is their strength. Smash it."', textRu: '«Монахи мешают. Алтарь — их сила. Разнеси.»' },
    { speaker: '', text: 'Big body. Heavy hammer. Simple work.', textRu: 'Большое тело. Тяжёлый молот. Простая работа.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The altar stones cracked. The hammer remembers — it crushes first.', textRu: 'Камни алтаря треснули. Молот помнит — сокрушает первым.' },
  ],
  objectives: [
    { type: 'destroy', count: 1, targetId: 'temple_altar', targetNameRu: 'Алтарь храма', targetNameEn: 'Temple Altar', description: 'Разрушь алтарь храма', descriptionEn: 'Destroy the temple altar' },
  ],
  spawnObjects: [{
    objectId: 'temple_altar', nameRu: 'Алтарь храма', nameEn: 'Temple Altar', icon: '⛩', color: 0xddccaa,
    type: 'destructible', count: 1, radius: 350,
  }],
  rewardSpellId: 'hammer_strike',
  xpReward: 80,
};

// ═══════════════════════════════════════════════════════════════
// T2 — Advanced elementals → T2 magic spells
// ═══════════════════════════════════════════════════════════════

const QUEST_ASHER: BodyQuestDef = {
  id: 'bq_asher', bodyId: 'asher', tier: 2,
  nameRu: 'Метки',
  nameEn: 'The Marks',
  description: 'Оставь огненные метки на границе и прогони чужаков.',
  descriptionEn: 'Leave fire marks along the border and drive off the intruders.',
  introMessages: [
    { speaker: '', text: 'Slow. Heavy. Old.', textRu: 'Медленно. Тяжело. Давно.' },
    { speaker: '', text: 'The western slope is not our territory. But something has crossed into it.', textRu: 'Западный склон — не наша территория. Но что-то туда зашло.' },
    { speaker: '', text: 'The smell of water. The smell of strangers. Marks must be left so they do not return.', textRu: 'Запах воды. Запах чужого. Нужно оставить метки чтобы они не вернулись.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The marks burn bright. No one will pass. The fire arrows are yours.', textRu: 'Метки горят ярко. Никто не пройдёт. Огненные стрелы — твои.' },
  ],
  objectives: [
    { type: 'reach', count: 3, targetId: 'border_mark', targetNameRu: 'Пограничная метка', targetNameEn: 'Border Mark', description: 'Отметь 3 пограничные точки', descriptionEn: 'Mark 3 border points' },
    { type: 'kill', count: 2, targetId: 'splasher', targetNameRu: 'Водный элементаль', targetNameEn: 'Water Elemental', description: 'Прогони 2 водных чужака', descriptionEn: 'Drive off 2 water intruders' },
  ],
  spawnObjects: [{
    objectId: 'border_mark', nameRu: 'Пограничная метка', nameEn: 'Border Mark', icon: '🔥', color: 0xff6633,
    type: 'waypoint', count: 3, radius: 500,
  }],
  rewardSpellId: 'mob_fire_arrow',
  xpReward: 100,
};

const QUEST_FOGGER: BodyQuestDef = {
  id: 'bq_fogger', bodyId: 'fogger', tier: 2,
  nameRu: 'Туман уходит',
  nameEn: 'The Fog Recedes',
  description: 'Восстанови покров тумана пока берег не виден насквозь.',
  descriptionEn: 'Restore the veil of fog before the shore is laid bare.',
  introMessages: [
    { speaker: '', text: 'The fog is thinning. This is wrong.', textRu: 'Туман редеет. Это неправильно.' },
    { speaker: '', text: 'The sun is breaking through. It should not be so.', textRu: 'Солнце пробивается. Так не должно быть.' },
    { speaker: '', text: 'The northern shore is almost laid bare. The veil must be restored.', textRu: 'Северный берег почти виден насквозь. Нужно восстановить покров.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The veil is thick again. The lake keeps its secrets. The ice obeys.', textRu: 'Покров снова плотный. Озеро хранит тайны. Лёд слушается.' },
  ],
  objectives: [
    { type: 'reach', count: 4, targetId: 'fog_node', targetNameRu: 'Узел тумана', targetNameEn: 'Fog Node', description: 'Восстанови 4 узла тумана', descriptionEn: 'Restore 4 fog nodes' },
  ],
  spawnObjects: [{
    objectId: 'fog_node', nameRu: 'Узел тумана', nameEn: 'Fog Node', icon: '🌫️', color: 0x6699cc,
    type: 'waypoint', count: 4, radius: 550,
  }],
  rewardSpellId: 'mob_ice_arrow',
  xpReward: 100,
};

const QUEST_MUDDER: BodyQuestDef = {
  id: 'bq_mudder', bodyId: 'mudder', tier: 2,
  nameRu: 'Корни ищут воду',
  nameEn: 'Roots Seek Water',
  description: 'Прорасти сквозь породу к подземному источнику.',
  descriptionEn: 'Grow through the rock to the underground spring.',
  introMessages: [
    { speaker: '', text: 'Dry. Dry for a long time.', textRu: 'Сухо. Давно сухо.' },
    { speaker: '', text: 'Somewhere deeper there is water. It can be felt.', textRu: 'Где-то глубже есть вода. Чувствуется.' },
    { speaker: '', text: 'Grow toward it. Through stone. Slowly.', textRu: 'Нужно прорасти туда. Через камень. Медленно.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Water found. The earth drinks. The stone spikes are yours.', textRu: 'Вода найдена. Земля пьёт. Каменные шипы — твои.' },
  ],
  objectives: [
    { type: 'destroy', count: 3, targetId: 'rock_wall', targetNameRu: 'Слой породы', targetNameEn: 'Rock Layer', description: 'Пробей 3 слоя породы', descriptionEn: 'Break through 3 layers of rock' },
    { type: 'reach', count: 1, targetId: 'water_source', targetNameRu: 'Подземный источник', targetNameEn: 'Underground Spring', description: 'Доберись до источника', descriptionEn: 'Reach the spring' },
  ],
  spawnObjects: [
    { objectId: 'rock_wall', nameRu: 'Слой породы', nameEn: 'Rock Layer', icon: '🪨', color: 0x886644, type: 'destructible', count: 3, radius: 400 },
    { objectId: 'water_source', nameRu: 'Подземный источник', nameEn: 'Underground Spring', icon: '💧', color: 0x4499dd, type: 'waypoint', count: 1, radius: 600 },
  ],
  rewardSpellId: 'mob_stone_spike',
  xpReward: 100,
};

const QUEST_WHISTLER: BodyQuestDef = {
  id: 'bq_whistler', bodyId: 'whistler', tier: 2,
  nameRu: 'Фальшивая нота',
  nameEn: 'The False Note',
  description: 'Найди и убери то что режет песню ветра.',
  descriptionEn: 'Find and remove whatever cuts through the wind\'s song.',
  introMessages: [
    { speaker: '', text: 'The wind should sing.', textRu: 'Ветер должен петь.' },
    { speaker: '', text: 'But today it does not. Something cuts the song in half.', textRu: 'Но сегодня — не так. Что-то режет песню посередине.' },
    { speaker: '', text: 'Somewhere on the southern slope. It must be found.', textRu: 'Где-то на южном склоне. Надо найти.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The song flows again. The wind cuts — from both sides. The blades of air are yours.', textRu: 'Песня течёт снова. Ветер режет — с обеих сторон. Лезвия воздуха — твои.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'wind_blocker', targetNameRu: 'Источник помехи', targetNameEn: 'Source of the Noise', description: 'Найди источник помехи', descriptionEn: 'Find the source of the noise' },
    { type: 'destroy', count: 1, targetId: 'wind_blocker', targetNameRu: 'Помеха', targetNameEn: 'Obstruction', description: 'Убери помеху', descriptionEn: 'Remove the obstruction' },
  ],
  spawnObjects: [
    { objectId: 'wind_blocker', nameRu: 'Источник помехи', nameEn: 'Source of the Noise', icon: '💨', color: 0x88aacc, type: 'waypoint', count: 1, radius: 500 },
    { objectId: 'wind_blocker', nameRu: 'Помеха', nameEn: 'Obstruction', icon: '🔩', color: 0x888888, type: 'destructible', count: 1, radius: 500 },
  ],
  rewardSpellId: 'mob_wind_blade',
  xpReward: 100,
};

const QUEST_SPIRIT_WOLF: BodyQuestDef = {
  id: 'bq_spirit_wolf', bodyId: 'spirit_wolf', tier: 2,
  nameRu: 'Лесное милосердие',
  nameEn: 'Mercy of the Forest',
  description: 'Найди раненого человека и защити его от хищников 30 секунд.',
  descriptionEn: 'Find the wounded human and protect him from predators for 30 seconds.',
  introMessages: [
    { speaker: '', text: 'The forest speaks of pain. Somewhere near, someone lies unmoving.', textRu: 'Лес говорит о боли. Где-то рядом кто-то лежит без движения.' },
    { speaker: '', text: 'Not a beast. A human. Breathing hard.', textRu: 'Не зверь. Человек. Тяжело дышит.' },
    { speaker: '', text: 'The spirits of the forest do not let anyone die without cause.', textRu: 'Духи леса не дают умереть без причины.' },
  ],
  completeMessages: [
    { speaker: '', text: 'He lives. The spirits nod. The bark shields those who serve.', textRu: 'Он жив. Духи кивают. Кора защищает тех кто служит.' },
  ],
  objectives: [
    { type: 'reach',   count: 1,  targetId: 'wounded_human', targetNameRu: 'Раненый человек', targetNameEn: 'Wounded Human', description: 'Найди раненого человека', descriptionEn: 'Find the wounded human' },
    { type: 'protect', count: 30, targetId: 'wounded_human', targetNameRu: 'Раненый человек', targetNameEn: 'Wounded Human', description: 'Защити его 30 сек', descriptionEn: 'Protect him for 30 sec', zoneRadius: 240 },
  ],
  friendlyCreatureIds: ['wounded_human'],
  rewardSpellId: 'mob_bark_armor',
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
  nameEn: 'Night Raid',
  description: 'Проберись в лагерь орков под покровом ночи и вынеси добычу.',
  descriptionEn: 'Slip into the orc camp under cover of night and carry off the loot.',
  introMessages: [
    { speaker: '', text: 'The orc camp sleeps. Almost.', textRu: 'Лагерь орков спит. Почти.' },
    { speaker: '', text: 'Three treasures. The chieftain\'s tent.', textRu: 'Три ценности. Шатёр вождя.' },
    { speaker: '', text: 'Get in. Get out. Don\'t let them see your face.', textRu: 'Войди. Выйди. Не дай им увидеть твоё лицо.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Gone before they knew. The throwing blade is yours.', textRu: 'Ушёл раньше чем поняли. Метательный клинок — твой.' },
  ],
  objectives: [
    { type: 'steal', count: 3, targetId: 'orc_loot', targetNameRu: 'Орочья добыча', targetNameEn: 'Orc Loot', description: 'Укради 3 ценности из орочьего лагеря', descriptionEn: 'Steal 3 treasures from the orc camp' },
  ],
  spawnObjects: [{
    objectId: 'orc_loot', nameRu: 'Орочья добыча', nameEn: 'Orc Loot', icon: '💰', color: 0xddaa33,
    type: 'collectible', count: 7, radius: 250,
    anchor: { x: 1518, y: 253 }, // орочий лагерь (вождь в центре) — добыча с разбросом
  }],
  rewardSpellId: 'knife_throw',
  xpReward: 100,
};

const QUEST_ORC_VETERAN: BodyQuestDef = {
  id: 'bq_orc_veteran', bodyId: 'orc_veteran', tier: 2,
  nameRu: 'Страж лагеря',
  nameEn: 'Warden of the Camp',
  description: 'Прогони гоблинов-воров одним широким ударом.',
  descriptionEn: 'Drive off the goblin thieves with one wide sweep.',
  introMessages: [
    { speaker: '', text: 'Something slips through the shadows.', textRu: 'Что-то скользит в тенях.' },
    { speaker: '', text: 'Goblins. Again.', textRu: 'Гоблины. Опять.' },
    { speaker: '', text: 'One wide swing — and all of them at once.', textRu: 'Один широкий удар — и всех сразу.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The camp is clear. The wide arc is yours.', textRu: 'Лагерь чист. Широкая дуга — твоя.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'goblin_veteran', targetNameRu: 'Гоблин-вор', targetNameEn: 'Goblin Thief', description: 'Убей 3 гоблинов-воров', descriptionEn: 'Kill 3 goblin thieves' },
  ],
  spawnEnemies: [{ creatureId: 'goblin_veteran', count: 3, radius: 180 }],
  rewardSpellId: 'slash_sweep',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_orc',
};

// ── ПАРА: Лесной конфликт (wolf_veteran охотится ↔ bear_veteran защищает) ──

const QUEST_WOLF_VETERAN: BodyQuestDef = {
  id: 'bq_wolf_veteran', bodyId: 'wolf_veteran', tier: 2,
  nameRu: 'Два удара',
  nameEn: 'Two Strikes',
  description: 'Возглавь охоту и докажи право вожака.',
  descriptionEn: 'Lead the hunt and prove your right to be alpha.',
  introMessages: [
    { speaker: '', text: 'The pack is lean. Three days without a real kill.', textRu: 'Стая тощая. Трое суток без настоящей добычи.' },
    { speaker: '', text: 'A young one issues a challenge. Answer it.', textRu: 'Молодой бросает вызов. Ответь.' },
    { speaker: '', text: 'The alpha strikes twice. Once for rank. Once for food.', textRu: 'Вожак бьёт дважды. Раз за ранг. Раз за еду.' },
  ],
  completeMessages: [
    { speaker: '', text: 'No one challenged the second strike. The pack is fed.', textRu: 'Никто не оспорил второй удар. Стая сыта.' },
  ],
  objectives: [
    { type: 'kill', count: 1, targetId: 'wolf_veteran', targetNameRu: 'Претендент', targetNameEn: 'Challenger', description: 'Победи претендента (волка-ветерана)', descriptionEn: 'Defeat the challenger (a veteran wolf)' },
    { type: 'kill', count: 2, targetId: 'deer', targetNameRu: 'Олень', targetNameEn: 'Deer', description: 'Возглавь охоту: добудь 2 оленей', descriptionEn: 'Lead the hunt: take down 2 deer' },
  ],
  rewardSpellId: 'double_strike',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_wolf',
};

const QUEST_BEAR_VETERAN: BodyQuestDef = {
  id: 'bq_bear_veteran', bodyId: 'bear_veteran', tier: 2,
  nameRu: 'Старые раны',
  nameEn: 'Old Wounds',
  description: 'Отгони стаю волков от своей территории.',
  descriptionEn: 'Drive the wolf pack from your territory.',
  introMessages: [
    { speaker: '', text: 'Old bones. Old scars.', textRu: 'Старые кости. Старые шрамы.' },
    { speaker: '', text: 'The pack circles. They smell age.', textRu: 'Стая кружит. Чуют возраст.' },
    { speaker: '', text: 'They think old means slow. Show them otherwise.', textRu: 'Думают — возраст значит медленный. Покажи иначе.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The pack scattered. Old does not mean weak.', textRu: 'Стая рассеялась. Старый не значит слабый.' },
  ],
  objectives: [
    { type: 'kill', count: 10, targetId: 'wolf', targetNameRu: 'Волк', targetNameEn: 'Wolf', description: 'Отгони 10 волков', descriptionEn: 'Drive off 10 wolves' },
  ],
  rewardSpellId: 'mace_bash',
  xpReward: 100,
  // prerequisiteBodyQuestId убран: пререквизиты только при нарративной причине
  // (правило CLAUDE.md, пример — волк → альфа). Старый медведь самостоятелен.
};

// ── ПАРА: Защита каравана (bandit_spear атакует ↔ caravan_guard защищает) ──
// ── (bandit_archer атакует ↔ scout_veteran подавляет лучников) ──

const QUEST_CARAVAN_GUARD: BodyQuestDef = {
  id: 'bq_caravan_guard', bodyId: 'caravan_guard', tier: 2,
  nameRu: 'Держать строй',
  nameEn: 'Hold the Line',
  description: 'Оттесни копейщиков-разбойников от телеги.',
  descriptionEn: 'Push the bandit spearmen back from the cart.',
  introMessages: [
    { speaker: '', text: 'The caravan rolls on. You walk beside it.', textRu: 'Обоз едет. Ты идёшь рядом.' },
    { speaker: '', text: 'Spearmen at the treeline. Three of them.', textRu: 'Копейщики у опушки. Трое.' },
    { speaker: '', text: 'Push them back before they reach the cart.', textRu: 'Оттесни их прежде чем доберутся до телеги.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The cart rolls on. The blunt end of a spear is no worse than the sharp one.', textRu: 'Телега едет дальше. Тупой конец копья не хуже острого.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'bandit_spear', targetNameRu: 'Разбойник-копейщик', targetNameEn: 'Bandit Spearman', description: 'Отбей 3 копейщиков-разбойников', descriptionEn: 'Fight off 3 bandit spearmen' },
  ],
  rewardSpellId: 'spear_butt',
  xpReward: 100,
};

const QUEST_SCOUT_VETERAN: BodyQuestDef = {
  id: 'bq_scout_veteran', bodyId: 'scout_veteran', tier: 2,
  nameRu: 'Контрмера',
  nameEn: 'Countermeasure',
  description: 'Сними лучников-разбойников пока они не подожгли телегу.',
  descriptionEn: 'Take out the bandit archers before they set the cart ablaze.',
  introMessages: [
    { speaker: '', text: 'Archers. Treeline to the north. Two of them.', textRu: 'Лучники. Опушка с севера. Двое.' },
    { speaker: '', text: 'They have an angle on the cart.', textRu: 'Они держат угол на телегу.' },
    { speaker: '', text: 'Shoot first. Leap back — and you\'re no target.', textRu: 'Стреляй первым. Прыжок назад — и ты не мишень.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The archers are down. Leapt back — let them shoot at air.', textRu: 'Лучники пали. Прыгнул назад — пусть стреляют в воздух.' },
  ],
  objectives: [
    { type: 'kill', count: 2, targetId: 'bandit_archer', targetNameRu: 'Разбойник-лучник', targetNameEn: 'Bandit Archer', description: 'Устрани 2 лучников-разбойников', descriptionEn: 'Eliminate 2 bandit archers' },
  ],
  rewardSpellId: 'bow_backshot',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_scout',
};

// ── ОДИНОЧНЫЕ ──────────────────────────────────────────────────

const QUEST_MONK: BodyQuestDef = {
  id: 'bq_monk', bodyId: 'monk', tier: 1,
  nameRu: 'Дисциплина кулака',
  nameEn: 'Discipline of the Fist',
  description: 'Защити храм — прогони разбойников.',
  descriptionEn: 'Defend the temple — drive off the bandits.',
  introMessages: [
    { speaker: '', text: 'The temple is quiet. Breath steady. Fist ready.', textRu: 'Храм тих. Дыхание ровное. Кулак готов.' },
    { speaker: '', text: 'Bandits at the gates. Again.', textRu: 'У ворот — разбойники. Опять.' },
    { speaker: '', text: 'Every strike is precise. The temple will not fall while there are hands to hold it.', textRu: 'Каждый удар точен. Храм не падёт пока есть руки.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The bandits fled. Your strike is short and disorienting.', textRu: 'Разбойники бежали. Удар у тебя — короткий, дезориентирующий.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'bandit_brute', targetNameRu: 'Разбойник', targetNameEn: 'Bandit', description: 'Прогони 3 разбойников', descriptionEn: 'Drive off 3 bandits' },
  ],
  rewardSpellId: 'fist_strike',
  xpReward: 80,
};

const QUEST_ELDER: BodyQuestDef = {
  id: 'bq_elder', bodyId: 'elder', tier: 1,
  nameRu: 'Стойкость духа',
  nameEn: 'Resilience of Spirit',
  description: 'Терпение через испытание. Дай боли стать силой.',
  descriptionEn: 'Patience through trial. Let pain become strength.',
  introMessages: [
    { speaker: '', text: 'An old body. Heavy steps. Every wound remembers.', textRu: 'Старое тело. Тяжёлые шаги. Каждая рана помнит.' },
    { speaker: '', text: 'Young monks strike first. The elder stands firmer.', textRu: 'Молодые монахи бьют первыми. Старец стоит крепче.' },
    { speaker: '', text: 'Take the blows. Pain is a teacher.', textRu: 'Прими удары. Боль — учитель.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The pain sank inward and turned to strength. Resilience of spirit is yours.', textRu: 'Боль ушла внутрь и обратилась в силу. Стойкость духа — твоя.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'bandit_brute', targetNameRu: 'Разбойник', targetNameEn: 'Bandit', description: 'Останови 3 разбойников', descriptionEn: 'Stop 3 bandits' },
  ],
  rewardSpellId: 'spirit_resilience',
  xpReward: 80,
};

const QUEST_BANDIT_ARCHER_VET: BodyQuestDef = {
  id: 'bq_bandit_archer_veteran', bodyId: 'bandit_archer_veteran', tier: 2,
  nameRu: 'Ливень стрел',
  nameEn: 'Rain of Arrows',
  description: 'Прикрой отход подавляющим огнём.',
  descriptionEn: 'Cover the retreat with suppressing fire.',
  introMessages: [
    { speaker: '', text: 'The camp is falling back. The guards press in.', textRu: 'Лагерь отступает. Охрана наседает.' },
    { speaker: '', text: 'Hold the road. Wide cover.', textRu: 'Держи дорогу. Широкое прикрытие.' },
    { speaker: '', text: 'When one arrow is not enough — loose twenty.', textRu: 'Когда одной стрелы мало — пусти двадцать.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The road held. The rain of arrows is yours.', textRu: 'Дорога устояла. Ливень стрел — твой.' },
  ],
  objectives: [
    { type: 'kill', count: 4, targetId: 'caravan_guard', targetNameRu: 'Охранник', targetNameEn: 'Guard', description: 'Сдержи 4 охранников', descriptionEn: 'Hold back 4 guards' },
  ],
  rewardSpellId: 'arrow_rain',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_bandit_archer',
};

const QUEST_BANDIT_CROSSBOW_VET: BodyQuestDef = {
  id: 'bq_bandit_crossbow_veteran', bodyId: 'bandit_crossbow_veteran', tier: 2,
  nameRu: 'Прижать к земле',
  nameEn: 'Pin Them Down',
  description: 'Пригвозди охранников прежде чем они смогут перестроиться.',
  descriptionEn: 'Pin the guards down before they can regroup.',
  introMessages: [
    { speaker: '', text: 'Three guards. Fast. Too spread out for a volley.', textRu: 'Трое охранников. Быстрые. Слишком рассредоточены для залпа.' },
    { speaker: '', text: 'Pin one down. The others will stop to help.', textRu: 'Прижми одного. Остальные остановятся помочь.' },
    { speaker: '', text: 'Then pin them too.', textRu: 'Потом прижми и их.' },
  ],
  completeMessages: [
    { speaker: '', text: 'No one went where they wanted to. Control is yours.', textRu: 'Никто не пошёл туда куда хотел. Контроль — твой.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'caravan_guard', targetNameRu: 'Охранник', targetNameEn: 'Guard', description: 'Нейтрализуй 3 охранников', descriptionEn: 'Neutralize 3 guards' },
  ],
  rewardSpellId: 'crossbow_snare',
  xpReward: 100,
  prerequisiteBodyQuestId: 'bq_bandit_crossbow',
};

const QUEST_BANDIT_BRUTE_VET: BodyQuestDef = {
  id: 'bq_bandit_brute_veteran', bodyId: 'bandit_brute_veteran', tier: 2,
  nameRu: 'Берсерк',
  nameEn: 'Berserker',
  description: 'Проломи тяжёлые латы подкрепления.',
  descriptionEn: 'Smash through the heavy plate of the reinforcements.',
  introMessages: [
    { speaker: '', text: 'Reinforcements. Three of them. Heavy armor.', textRu: 'Подкрепление. Трое. Тяжёлые доспехи.' },
    { speaker: '', text: 'The hammer doesn\'t care what you\'re wearing.', textRu: 'Молоту всё равно что на тебе надето.' },
    { speaker: '', text: 'Break the plate. Then deal with what\'s inside.', textRu: 'Разбей латы. Потом разберись с тем что внутри.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Three suits of armor. Scrap now. The heavy smash is yours.', textRu: 'Три комплекта доспехов. Теперь лом. Тяжёлый удар — твой.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'caravan_guard', targetNameRu: 'Бронированный охранник', targetNameEn: 'Armored Guard', description: 'Расправься с 3 бронированными охранниками', descriptionEn: 'Take down 3 armored guards' },
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
  nameEn: 'The Caravan',
  description: 'Торговый обоз пересекает земли разбойников. У обеих сторон свой интерес.',
  descriptionEn: 'A trade caravan crosses bandit lands. Both sides have a stake in it.',
  location: 'trade_road',
  sides: [
    {
      side: 'attacker',
      bodyIds: ['orc', 'goblin', 'bandit_brute'],
      objectiveDescription: 'Ограбь обоз. Забери груз.',
      objectiveDescriptionEn: 'Rob the caravan. Take the cargo.',
      npcCount: 6,
    },
    {
      side: 'defender',
      bodyIds: ['scout', 'bandit_spear'],
      objectiveDescription: 'Сопроводи обоз до безопасного места.',
      objectiveDescriptionEn: 'Escort the caravan to safety.',
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
  nameEn: 'Quick Paws',
  description: 'Собери морковки прежде чем появится кто-то крупный.',
  descriptionEn: 'Gather the carrots before something big shows up.',
  introMessages: [
    { speaker: '', text: 'Small. Fast. The world is full of giants.', textRu: 'Маленькое. Быстрое. Мир полон великанов.' },
    { speaker: '', text: 'But now — hunger. The nose twitches. Carrot. Close.', textRu: 'Но сейчас — голод. Нос подрагивает. Морковка. Рядом.' },
    { speaker: '', text: 'Gather them before something big shows up.', textRu: 'Собрать пока что-то крупное не появилось.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Full. The body is faster than it seemed. Acceleration is yours.', textRu: 'Сыт. Тело быстрее чем казалось. Ускорение — твоё.' },
  ],
  objectives: [
    { type: 'collect', count: 5, targetId: 'carrot', targetNameRu: 'Морковка', targetNameEn: 'Carrot', description: 'Собери 5 морковок', descriptionEn: 'Gather 5 carrots' },
  ],
  spawnObjects: [{
    objectId: 'carrot', nameRu: 'Морковка', nameEn: 'Carrot', icon: '🥕', color: 0xff8833,
    type: 'collectible', count: 7, radius: 300,
  }],
  rewardSpellId: 'acceleration',
  xpReward: 40,
};

const QUEST_DEER: BodyQuestDef = {
  id: 'bq_deer', bodyId: 'deer', tier: 1,
  nameRu: 'Лёгкий бег',
  nameEn: 'Effortless Run',
  description: 'Доберись до безопасной поляны и не оглядывайся.',
  descriptionEn: 'Reach the safe clearing and do not look back.',
  introMessages: [
    { speaker: '', text: 'Slender legs. Wind in the fur. The meadow is wide.', textRu: 'Стройные ноги. Ветер в шерсти. Луг широкий.' },
    { speaker: '', text: 'Something watches from the treeline. Far off — a clearing. Safe.', textRu: 'Что-то смотрит из опушки. Далеко — поляна. Безопасно.' },
    { speaker: '', text: 'Run. Don\'t look back.', textRu: 'Бежать. Не оглядываться.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Nothing caught up. The wind itself taught you the dash.', textRu: 'Никто не догнал. Сам ветер научил делать рывок.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'safe_clearing', targetNameRu: 'Безопасная поляна', targetNameEn: 'Safe Clearing', description: 'Доберись до безопасной поляны', descriptionEn: 'Reach the safe clearing' },
  ],
  spawnObjects: [{
    objectId: 'safe_clearing', nameRu: 'Безопасная поляна', nameEn: 'Safe Clearing', icon: '🌿', color: 0x44dd44,
    type: 'waypoint', count: 1, radius: 2800,
  }],
  rewardSpellId: 'dash',
  xpReward: 40,
};

const QUEST_FOX: BodyQuestDef = {
  id: 'bq_fox', bodyId: 'fox', tier: 1,
  nameRu: 'Хитрый охотник',
  nameEn: 'The Cunning Hunter',
  description: 'Поймай зайцев на лугу — тело само знает как.',
  descriptionEn: 'Catch the hares in the meadow — the body knows how.',
  introMessages: [
    { speaker: '', text: 'Sharp nose. Sharp mind. The meadow smells of hare.', textRu: 'Острый нос. Острый ум. На лугу пахнет зайцем.' },
    { speaker: '', text: 'They are fast — but not faster.', textRu: 'Они быстрые — но не быстрее.' },
    { speaker: '', text: 'Three will do. The body knows what to do.', textRu: 'Трёх хватит. Тело само знает что делать.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Quick and clean. The fox\'s body teaches you to strike first. The hook is yours.', textRu: 'Быстро и точно. Тело лисы учит бить первой. Хук — твой.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'hare', targetNameRu: 'Заяц', targetNameEn: 'Hare', description: 'Поймай 3 зайца', descriptionEn: 'Catch 3 hares' },
  ],
  rewardSpellId: 'hook',
  xpReward: 50,
};

const QUEST_BOAR: BodyQuestDef = {
  id: 'bq_boar', bodyId: 'boar', tier: 1,
  nameRu: 'Неудержимый',
  nameEn: 'Unstoppable',
  description: 'Прогони волков — лес расступается перед тобой.',
  descriptionEn: 'Drive off the wolves — the forest parts before you.',
  introMessages: [
    { speaker: '', text: 'Thick hide. Powerful legs. The forest parts before you.', textRu: 'Толстая шкура. Мощные ноги. Лес расступается перед тобой.' },
    { speaker: '', text: 'Wolves circle nearby. They will learn to fear the charge.', textRu: 'Волки кружат рядом. Они научатся бояться удара.' },
  ],
  completeMessages: [
    { speaker: '', text: 'Nothing stood in the way. The boar\'s body teaches you to charge straight through. The ram is yours.', textRu: 'Ничто не встало поперёк. Тело кабана учит идти напролом. Таран — твой.' },
  ],
  objectives: [
    { type: 'kill', count: 3, targetId: 'wolf', targetNameRu: 'Волк', targetNameEn: 'Wolf', description: 'Прогони 3 волков', descriptionEn: 'Drive off 3 wolves' },
  ],
  rewardSpellId: 'ram',
  xpReward: 60,
};

const QUEST_GROUSE: BodyQuestDef = {
  id: 'bq_grouse', bodyId: 'grouse', tier: 1,
  nameRu: 'Инстинкт целителя',
  nameEn: 'Healer\'s Instinct',
  description: 'Выживи 30 секунд — тело само подбирает целебные ягоды.',
  descriptionEn: 'Survive 30 seconds — the body picks the healing berries on its own.',
  introMessages: [
    { speaker: '', text: 'Small wings. Sharp eyes. The undergrowth holds many secrets.', textRu: 'Маленькие крылья. Острые глаза. В подлеске много тайн.' },
    { speaker: '', text: 'Some berries heal. The body remembers which.', textRu: 'Некоторые ягоды лечат. Тело помнит какие.' },
  ],
  completeMessages: [
    { speaker: '', text: 'The smallest creature taught the most important thing — to heal.', textRu: 'Самое маленькое существо научило самому важному — лечить.' },
  ],
  objectives: [
    { type: 'survive', count: 30, description: 'Выживи 30 секунд', descriptionEn: 'Survive 30 seconds' },
  ],
  rewardSpellId: 'neutral_heal',
  xpReward: 40,
};

// ═══════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════

// ── Босс: Игнис — нарративный вход в данж лаборатории ───────────────────────
// Захватив тело Стража, Сфера чувствует чужую частоту — варп-разрыв.
// Дойти до разрыва → переход в паровой мир (зона lab). Награда — Стена огня.
const QUEST_IGNIS: BodyQuestDef = {
  id: 'bq_ignis', bodyId: 'ignis', tier: 3,
  nameRu: 'Зов разрыва',
  nameEn: 'The Call of the Rift',
  description: 'Тело Стража чувствует чужую частоту. Найди её источник.',
  descriptionEn: "The Guardian's body senses an alien frequency. Find its source.",
  introMessages: [
    { speaker: '', text: 'A thousand years of fire. Stone. Patience.', textRu: 'Тысяча лет огня. Камень. Терпение.' },
    { speaker: '', text: 'But now this body hears something new. A frequency that does not belong to this world.', textRu: 'Но теперь это тело слышит новое. Частоту, которой нет в этом мире.' },
    { speaker: '', text: 'It calls. Follow it.', textRu: 'Она зовёт. Иди за ней.' },
  ],
  completeMessages: [
    { speaker: '', text: 'A tear in the world. The Guardian has never seen its like.', textRu: 'Разрыв в ткани мира. Страж такого не видел никогда.' },
    { speaker: '', text: 'But you have. It leads home. And home is in danger.', textRu: 'А ты — видел. Он ведёт домой. И дома беда.' },
  ],
  objectives: [
    { type: 'reach', count: 1, targetId: 'warp_rift', targetNameRu: 'Варп-разрыв', targetNameEn: 'Warp Rift', description: 'Дойди до варп-разрыва', descriptionEn: 'Reach the warp rift' },
  ],
  spawnObjects: [{
    objectId: 'warp_rift', nameRu: 'Варп-разрыв', nameEn: 'Warp Rift', icon: '🌀', color: 0x8844cc,
    type: 'waypoint', count: 1, radius: 1400,
  }],
  rewardSpellId: 'mob_fire_wall',
  xpReward: 150,
};

export const BODY_QUESTS: BodyQuestDef[] = [
  QUEST_IGNIS,
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
  QUEST_MONK,
  QUEST_ELDER,
  QUEST_BANDIT_ARCHER_VET, QUEST_BANDIT_CROSSBOW_VET,
  QUEST_BANDIT_BRUTE_VET,
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
