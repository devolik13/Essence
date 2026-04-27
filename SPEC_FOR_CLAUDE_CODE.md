# BestiaryScene — Spec для Claude Code

> Цель: интегрировать бестиарий в Phaser-игру `Essence`. UI-стиль и данные уже определены — этот документ описывает только **архитектуру и контракты**.

## 1. Стек и место в игре

- **Сцена:** `src/scenes/BestiaryScene.ts` extends `Phaser.Scene` (`key: 'BestiaryScene'`)
- **Запуск:** оверлей поверх `GameScene` (через `scene.launch('BestiaryScene')`, не `start`). Игровой мир ставится на паузу командой `this.scene.pause('GameScene')`.
- **Закрытие:** Esc или клик по «закрыть» → `this.scene.stop('BestiaryScene'); this.scene.resume('GameScene');`
- **Точка входа:** хоткей `B` в `UIScene` или иконка в HUD.

## 2. Данные

### Источник
- `src/data/creatureDB.ts` — единственный источник правды. **Никаких дублирующих списков**.
- Импорт: `import { CREATURE_DB, getAllCreatures } from '../data/creatureDB';`
- Тип записи: `BodyDefinition` из `src/types/bodies.ts`. Используем поля:
  - `id`, `name`, `nameRu`
  - `type` (`BodyType.Combat | Passive | Fleeing`)
  - `damageType` (`'melee' | 'magic' | 'ranged'`)
  - `element?` (`'fire' | 'water' | 'earth' | 'wind' | 'nature'`)
  - `npcStats: Partial<Record<StatName, number>>`
  - `caps: Partial<Record<StatName, number>>` — «чему учит»
  - `weapon: WeaponType`
  - `xpReward`
  - `signatureSpell?: AbilityDef`, `spellXPThreshold?: number`
  - `abilityName: string`
  - `isBoss?: boolean`, `faction?: string`
  - `color: number` — цвет тела, использовать как акцент карточки

### Прогресс игрока (открытые записи)

Новый файл `src/data/bestiaryProgress.ts`:

```ts
export type BestiaryRevealReason = 'killed' | 'sphered' | 'purchased' | 'gifted';

export interface BestiaryEntry {
  reason: BestiaryRevealReason;
  firstSeenAt: number;       // Date.now()
  killCount: number;
  sphereCount: number;       // сколько раз вселялся
}

export type BestiaryProgress = Record<string, BestiaryEntry>;

const STORAGE_KEY = 'essence.bestiary.progress.v1';

export function loadProgress(): BestiaryProgress { /* JSON.parse(localStorage) */ }
export function saveProgress(p: BestiaryProgress): void { /* localStorage.setItem */ }
export function reveal(p: BestiaryProgress, id: string, reason: BestiaryRevealReason): BestiaryProgress { /* мерж */ }
export function isRevealed(p: BestiaryProgress, id: string): boolean { /* boolean */ }
```

Хранение — `localStorage` сейчас, позже мигрировать на серверный профиль (когда появится бэкенд PvP).

### События открытия

В `GameScene` повесить хуки:
- `creature-killed` (уже есть) → `reveal(progress, def.id, 'killed')`, `entry.killCount++`
- При `Sphere.possess(target)` → `reveal(progress, def.id, 'sphered')`, `entry.sphereCount++`
- Купить у NPC-торговца знаний → emit `'bestiary-purchased'` с `id` → `reveal(progress, id, 'purchased')`

Эмит общего события для обновления UI:
```ts
this.game.events.emit('bestiary-revealed', { id, reason });
```

`BestiaryScene` слушает это, чтобы перерисовать список без перезапуска.

## 3. Layout (1920×1080 reference; адаптивный scale)

```
┌───────────────────────────────────────────────────────────────┐
│  ⌬ БЕСТИАРИЙ      [ALL] [REVEALED] [LOCKED]    12/51    [✕]   │  72px header
├──────────────────┬──┬─────────────────────────────────────────┤
│                  │  │                                         │
│  Лесные звери ▾  │  │   ┌─ Wolf ─────────  ⊕Combat  ⚔Melee ─┐│
│  ▣ Hare          │S │   │  [Art slot 320×320]                ││
│  ▣ Deer          │P │   │  ──── divider ────                 ││
│  ▣ Wolf  ←       │I │   │  HP 8 · STR 8 · ACC 7 · EVA 8 ...  ││
│  ▣ Bear (?)      │N │   │  Учит: Agility→20, STR→12 ...      ││
│  Гуманоиды ▾     │E │   │  Способность: Sword Strike         ││
│  ▣ Goblin        │  │   │  ✦ Сигнатурное: ... (✦40 XP)       ││
│  ▣ Orc           │  │   │  Оружие: Sword                     ││
│  ...             │  │   │  Биом: Trade Road · Глава 1        ││
│                  │  │   │  Дроп: 🔒 пока не открыто          ││
│  Стражи ▾        │  │   └────────────────────────────────────┘│
│  ▣ Ignis (?)     │  │                                         │
│  ...             │  │                                         │
└──────────────────┴──┴─────────────────────────────────────────┘
   320px              1600px right page
```

- **Левая панель** (320px): группы из `BESTIARY_GROUPS` (см. ниже), плитки 56×56 с глифом и именем. Закрытые — тёмные плитки с `<use href="#bf_lock" />`.
- **Spine** (24px): `<use href="#bf_spine" />` — растянуть по высоте.
- **Правая страница**: карточка существа (см. ниже).
- **Анимация перелистывания**: правую страницу при выборе перекручивать через `Tween` — `rotationY` 0→90 (исчезает) → подмена контента → 90→0. Длительность 280ms.

### Группировка

```ts
export const BESTIARY_GROUPS: { id: string; titleRu: string; titleEn: string; ids: string[] }[] = [
  { id: 'beasts',    titleRu: 'Лесные звери', titleEn: 'Forest beasts',
    ids: ['hare','deer','fox','grouse','boar','wolf','bear'] },
  { id: 'humanoids', titleRu: 'Гуманоиды',    titleEn: 'Humanoids',
    ids: ['goblin','orc','scout'] },
  { id: 'shamans',   titleRu: 'Шаманы природы', titleEn: 'Nature shamans',
    ids: ['shaman','spirit_wolf'] },
  { id: 'fire_e',    titleRu: 'Элементали огня', titleEn: 'Fire elementals',
    ids: ['spark','asher'] },
  { id: 'water_e',   titleRu: 'Элементали воды', titleEn: 'Water elementals',
    ids: ['splasher','fogger'] },
  { id: 'earth_e',   titleRu: 'Элементали земли', titleEn: 'Earth elementals',
    ids: ['pebble','mudder'] },
  { id: 'wind_e',    titleRu: 'Элементали воздуха', titleEn: 'Wind elementals',
    ids: ['gusty','whistler'] },
  { id: 'bandits',   titleRu: 'Лагерь разбойников', titleEn: 'Bandits',
    ids: ['bandit_archer','bandit_crossbow','bandit_spear','bandit_brute'] },
  { id: 'veterans',  titleRu: 'Ветераны', titleEn: 'Veterans',
    ids: ['goblin_veteran','wolf_veteran','bear_veteran','orc_veteran','scout_veteran',
          'bandit_archer_veteran','bandit_crossbow_veteran','bandit_spear_veteran','bandit_brute_veteran'] },
  { id: 'guardians', titleRu: 'Стражи стихий', titleEn: 'Element guardians',
    ids: ['ignis','aquaris','terra','aeros'] },
  { id: 'caravan',   titleRu: 'Караван',  titleEn: 'Caravan',
    ids: ['caravan_guard','ambusher','caravan_merchant'] },
];
// Тестовые dummy_* и t_* НЕ показывать в бестиарии.
```

### Карточка существа (revealed)

Поля и порядок:
1. **Заголовок:** `nameRu`, мелким — `name` (en), справа — печать стихии (`#bf_seal_<element>` или `#bf_seal_neutral` если нет элемента).
2. **Бейджи** (ряд 48×48): тип поведения (`bf_b_combat/passive/fleeing`, `bf_b_boss` если `isBoss`), тип урона (`bf_dmg_melee/ranged/magic`).
3. **Арт-слот** 320×320: пока заглушка с `bf_unknown` или цветной круг по `def.color`. `// TODO: connect craftpix`
4. **Divider** `#bf_divider`.
5. **Боевые статы:** перечислить все `npcStats[stat] > 0` в виде «лейбл — значение — мини-бар» (`STAT_NAMES_SHORT[stat]`).
6. **Caps (что учит):** перечислить `caps[stat]` → "STR → cap 12". Подсветить, если у игрока этот стат уже ≥ cap (серым).
7. **Способность:** `def.abilityName`.
8. **Сигнатурное заклинание** (если есть): `def.signatureSpell.nameRu` + бейдж `bf_xp_gem` с порогом `def.spellXPThreshold || 50` XP.
9. **Оружие:** `def.weapon`.
10. **Биом:** TODO — взять из `chapter1.ts` / `zones.ts`. Сейчас вывести «—».
11. **Дроп:** TODO — пока «🔒 откроется позже».
12. **XP-награда:** `def.xpReward`.

### Карточка (locked)

- Силуэт `bf_unknown` 320×320 на месте арта.
- Имя: «???», под ним — `bf_lock` 32×32.
- Подсказка: «Встреть в бою, вселись или купи у торговца знаний».
- Все остальные поля скрыть.

## 4. Реализация

Хранилище в сцене:
```ts
private progress!: BestiaryProgress;
private filter: 'all' | 'revealed' | 'locked' = 'all';
private lang: 'ru' | 'en' = 'ru';
private selectedId: string | null = null;
```

**Render strategy:**
- Использовать `this.add.dom().createFromHTML(...)` — DOM-overlay поверх Phaser canvas. Это даст:
  - простую вёрстку (CSS Grid)
  - готовые SVG из `bestiary/frames.svg`
  - доступ к `localStorage`
- Альтернатива (если DOM-overlay не подходит): рисовать на `Container` + `Graphics` + `Text`. Тогда SVG-рамки придётся загружать как текстуры (Phaser принимает SVG через `this.load.svg(...)`) — менее гибко, но без DOM.

**Рекомендую DOM-overlay** — этот UI редко открывается, не требует геймплейной отзывчивости.

## 5. Ассеты

Положить `bestiary/frames.svg` (приложен этим спеком) в `public/ui/frames.svg` или загрузить в Phaser:

```ts
this.load.html('bestiary-frames', 'ui/frames.svg');
// либо инлайнить содержимое в DOM-template сцены
```

**Использование внутри HTML-шаблона:**
```html
<svg width="96" height="96"><use href="#bf_seal_fire"/></svg>
<svg width="48" height="48"><use href="#bf_dmg_magic"/></svg>
```

Спрайт SVG должен быть вставлен в DOM один раз при создании сцены (например, через `document.body.insertAdjacentHTML('afterbegin', spriteString)`).

## 6. i18n

Использовать существующий `src/i18n.ts`. Ключи добавить:
```
bestiary.title         "Бестиарий" / "Bestiary"
bestiary.tab.all       "Все"
bestiary.tab.revealed  "Открытые"
bestiary.tab.locked    "Закрытые"
bestiary.locked.title  "???"
bestiary.locked.hint   "Встреть в бою, вселись или купи у торговца знаний."
bestiary.field.stats   "Боевые характеристики"
bestiary.field.teaches "Чему учит"
bestiary.field.ability "Способность"
bestiary.field.spell   "Сигнатурное заклинание"
bestiary.field.weapon  "Оружие"
bestiary.field.biome   "Биом"
bestiary.field.drop    "Возможный дроп"
bestiary.field.xp      "XP за победу"
bestiary.behavior.combat   "Боевой"
bestiary.behavior.passive  "Пассивный"
bestiary.behavior.fleeing  "Убегающий"
bestiary.behavior.boss     "Босс"
bestiary.dmg.melee   "Ближний"
bestiary.dmg.ranged  "Дальний"
bestiary.dmg.magic   "Магический"
bestiary.element.fire   "Огонь"
bestiary.element.water  "Вода"
bestiary.element.earth  "Земля"
bestiary.element.wind   "Воздух"
bestiary.element.nature "Природа"
```

## 7. Тесты

Минимум:
- `bestiaryProgress.test.ts` — `reveal` мерж новых записей, инкремент `killCount`, persist через mock localStorage.
- `BestiaryScene` — smoke-test: создать сцену, проверить что DOM-узел появляется, что 51 - dummy/t_ существ в группах.
- Манульный QA: прокликать все группы, переключить язык, открыть/закрыть фильтры, убедиться что закрытые показывают силуэт.

## 8. Дальнейшие шаги (не делать сейчас)

- Подключить `craftpixAssets.ts` — вытаскивать арт по `def.id` если есть.
- Подключить `itemDB.ts` для секции дроп.
- Подключить `zones.ts`/`chapter1.ts` для биома (где спавнится).
- NPC-торговец знаний: новая сущность с диалогом «купить запись о существе X за N золота».
- Анимация: страницы перелистываются, печать стихии «горит», лук открытия проигрывает анимацию плавления.

## 9. Ссылки

- Прототип UI на React (для визуальной справки): см. репо `Essence` ветка `claude/...` папка `bestiary/` — это just прототип, не интегрировать как есть.
- Frames SVG: `bestiary/frames.svg` (приложен).
