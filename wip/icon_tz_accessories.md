# ТЗ: SVG-иконки аксессуаров и материалов для Essence

## Контекст

В игре уже есть SVG-иконки для **оружия** (`public/weapons.svg`) и **брони** (`public/armor.svg`).
Все остальные предметы (кольца, амулеты, руны, щиты, ресурсы крафта) сейчас рисуются emoji
(💍, 📿, 🔮, ✦, 🛡, ⚒). Нужно сделать им SVG-иконки в **том же стиле**.

## Что нужно сделать

Создать **два новых SVG-файла**:

1. `public/accessories.svg` — кольца, амулеты, руны, щиты (12 иконок)
2. `public/materials.svg` — ресурсы крафта (3 иконки)

Каждая иконка — отдельный `<symbol id="...">` внутри одного `<svg>`-файла, ровно как в
`public/weapons.svg` и `public/armor.svg`.

---

## Список иконок

### 1. `accessories.svg` — 12 символов (3 тира × 4 типа)

| symbol id | Предмет | Тир | Цвет металла | Заметки |
|-----------|---------|-----|--------------|---------|
| `icon_shield_t1` | Steel Shield | T1 | сталь (g_steel) | Круглый/каплевидный щит, простой |
| `icon_shield_t2` | Hardened Shield | T2 | сталь + латунь (g_brass) | С усилениями по краям |
| `icon_shield_t3` | Master Shield | T3 | сталь + латунь + зелёное свечение | Богато украшенный, гербовый |
| `icon_ring_t1` | Steel Ring | T1 | сталь | Простое кольцо, без камня |
| `icon_ring_t2` | Hardened Ring | T2 | сталь | Кольцо с маленьким голубым камешком |
| `icon_ring_t3` | Master Ring | T3 | латунь | Кольцо с крупным камнем + блик |
| `icon_amulet_t1` | Steel Amulet | T1 | сталь | Цепочка + простой кулон |
| `icon_amulet_t2` | Hardened Amulet | T2 | сталь | Цепочка + кулон с символом |
| `icon_amulet_t3` | Master Amulet | T3 | латунь | Цепочка + крупный кулон с камнем |
| `icon_weapon_rune_t1` | Steel Weapon Rune | T1 | камень + красная руна | Каменный диск с насечкой ⚔ |
| `icon_weapon_rune_t2` | Hardened Weapon Rune | T2 | камень + красная руна | Диск с резной обводкой |
| `icon_weapon_rune_t3` | Master Weapon Rune | T3 | камень + красное свечение | Диск с глубокой резьбой и свечением |
| `icon_armor_rune_t1` | Steel Armor Rune | T1 | камень + синяя руна | Диск с символом щита |
| `icon_armor_rune_t2` | Hardened Armor Rune | T2 | камень + синяя руна | Диск с резной обводкой |
| `icon_armor_rune_t3` | Master Armor Rune | T3 | камень + синее свечение | Диск с глубокой резьбой и свечением |

> Тир по визуалу: T1 — простой; T2 — с украшениями/мелким камнем; T3 — богатый, светящийся.

### 2. `materials.svg` — 3 символа

| symbol id | Предмет | Описание |
|-----------|---------|----------|
| `icon_copper_ore` | Copper Ore | Кусок руды красно-коричневого цвета (g_copper), грубо обработанный, с прожилками |
| `icon_willow_branch` | Willow Branch | Изогнутая ветка дерева, кора (g_wood), 2-3 листа |
| `icon_wolf_hide` | Wolf Hide | Кусок шкуры серо-коричневого цвета, с мехом по краю |

---

## Технические требования

### Структура файла (одинаковая для accessories.svg и materials.svg)

```xml
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <defs>
    <!-- Скопируй градиенты и фильтры из weapons.svg (см. ниже) -->
  </defs>

  <symbol id="icon_xxx" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_xxx)"/>
    <!-- ... иконка ... -->
  </symbol>

  <!-- ... остальные symbol ... -->
</svg>
```

### Размер
- **viewBox: `0 0 156 156`** — обязательно (как в weapons.svg / armor.svg)
- Иконка занимает примерно **центральные 110×110 px** с отступами
- Композиция чаще всего по диагонали (повороты −45°, −30°, −15°)

### Фон
Каждый символ начинается с `<rect width="156" height="156" fill="url(#bg_xxx)"/>` где `bg_xxx`:
- **`bg_str`** (тёмно-красный) — щиты, оружейные руны
- **`bg_agi`** (тёмно-зелёный) — кольца, амулеты
- **`bg_int`** (тёмно-синий) — броневые руны
- **Для материалов** — добавь нейтральный `bg_material` (тёмно-коричневый, см. ниже)

### Градиенты (скопируй из weapons.svg)
Эти градиенты используй везде, **не изобретай свои**:

```xml
<linearGradient id="g_steel" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#d8d4cc"/>
  <stop offset="0.5" stop-color="#8a857a"/>
  <stop offset="1" stop-color="#3a362e"/>
</linearGradient>
<linearGradient id="g_brass" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#e6c578"/>
  <stop offset="0.5" stop-color="#a07a2f"/>
  <stop offset="1" stop-color="#4a3818"/>
</linearGradient>
<linearGradient id="g_copper" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#e09060"/>
  <stop offset="0.5" stop-color="#9a5028"/>
  <stop offset="1" stop-color="#3e1d0e"/>
</linearGradient>
<linearGradient id="g_wood" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#7a5634"/>
  <stop offset="0.5" stop-color="#4d361f"/>
  <stop offset="1" stop-color="#241810"/>
</linearGradient>
<linearGradient id="g_leather" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#5a3a22"/>
  <stop offset="1" stop-color="#1f1208"/>
</linearGradient>
<radialGradient id="g_fire" cx="0.4" cy="0.35" r="0.7">
  <stop offset="0" stop-color="#ffe6b0"/>
  <stop offset="0.35" stop-color="#ff8a3a"/>
  <stop offset="0.75" stop-color="#a8330e"/>
  <stop offset="1" stop-color="#3a0e04"/>
</radialGradient>
<radialGradient id="g_water" cx="0.4" cy="0.35" r="0.7">
  <stop offset="0" stop-color="#e8f4ff"/>
  <stop offset="0.4" stop-color="#7ab8e8"/>
  <stop offset="0.85" stop-color="#264f7c"/>
  <stop offset="1" stop-color="#0c1f33"/>
</radialGradient>
<radialGradient id="g_nature" cx="0.4" cy="0.35" r="0.7">
  <stop offset="0" stop-color="#c8e090"/>
  <stop offset="0.4" stop-color="#5a8a32"/>
  <stop offset="0.85" stop-color="#2a4818"/>
  <stop offset="1" stop-color="#0e1a08"/>
</radialGradient>

<radialGradient id="bg_str" cx="0.5" cy="0.5" r="0.6">
  <stop offset="0" stop-color="#3a1a14" stop-opacity="0.55"/>
  <stop offset="1" stop-color="#0b0905" stop-opacity="0"/>
</radialGradient>
<radialGradient id="bg_agi" cx="0.5" cy="0.5" r="0.6">
  <stop offset="0" stop-color="#1a3220" stop-opacity="0.55"/>
  <stop offset="1" stop-color="#0b0905" stop-opacity="0"/>
</radialGradient>
<radialGradient id="bg_int" cx="0.5" cy="0.5" r="0.6">
  <stop offset="0" stop-color="#172a3e" stop-opacity="0.55"/>
  <stop offset="1" stop-color="#0b0905" stop-opacity="0"/>
</radialGradient>

<!-- Только для materials.svg добавь: -->
<radialGradient id="bg_material" cx="0.5" cy="0.5" r="0.6">
  <stop offset="0" stop-color="#3a2a1a" stop-opacity="0.55"/>
  <stop offset="1" stop-color="#0b0905" stop-opacity="0"/>
</radialGradient>
```

### Фильтры свечения для T3 (для свечения у T3-рун и T3-щита)
```xml
<filter id="f_glow_red" x="-30%" y="-30%" width="160%" height="160%">
  <feGaussianBlur stdDeviation="2.5" result="b"/>
  <feFlood flood-color="#ff5a18" flood-opacity="0.55"/>
  <feComposite in2="b" operator="in" result="c"/>
  <feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="f_glow_blue" x="-30%" y="-30%" width="160%" height="160%">
  <feGaussianBlur stdDeviation="2.5" result="b"/>
  <feFlood flood-color="#5aa8e8" flood-opacity="0.55"/>
  <feComposite in2="b" operator="in" result="c"/>
  <feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="f_glow_green" x="-30%" y="-30%" width="160%" height="160%">
  <feGaussianBlur stdDeviation="2.5" result="b"/>
  <feFlood flood-color="#5acf6c" flood-opacity="0.55"/>
  <feComposite in2="b" operator="in" result="c"/>
  <feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
```

### Стилевые правила (как в weapons.svg)

- **Обводка** везде `stroke="#1a1208"`, толщина `0.5`–`1` (тоньше = детали, толще = силуэт)
- **Блики**: тонкая белая полоска `fill="#f0ece4" opacity="0.35"` поверх металла
- **Тень**: тёмная полоска `fill="#0d0a06" opacity="0.55"` для глубины
- **Заклёпки**: `<circle r="2-4" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.5"/>`
- **Минимум деталей** — иконка должна читаться в 36×36 px на скилл-баре

### Что НЕ делать
- ❌ Никакого текста внутри иконок
- ❌ Никаких внешних шрифтов
- ❌ Никаких `<image>` или растровых вставок
- ❌ Никаких новых градиентов с уникальными именами (используй уже существующие)
- ❌ Цвета вне палитры (только то что в `<defs>` weapons.svg + добавки выше)

---

## Референсы из существующих файлов

Перед работой **обязательно** открой и изучи:
- `/home/user/Essence/public/weapons.svg` — как устроены `<symbol>`, как используются градиенты, как делается ротация для диагональной композиции (см. `icon_sword`, `icon_dagger`, `icon_staff_fire`)
- `/home/user/Essence/public/armor.svg` — как делается симметричная композиция без ротации (см. `icon_heavy_chest`, `icon_robe_helmet`)

Скопируй структуру и стиль 1-в-1.

---

## Куда положить и что обновить в коде

После создания SVG-файлов нужно (это уже сделает код-Клод, не дизайн):

1. **Подключить файлы в `index.html`** — fetch'ом до старта игры (как уже сделано для weapons.svg/armor.svg)
2. **Обновить `src/ui/weaponIcon.ts`** — функция `spriteForItem(itemId)` должна вернуть:
   - для `shield_t1/t2/t3` → `{ file: 'accessories.svg', id: 'icon_shield_tN' }`
   - для `ring_t1/t2/t3` → `{ file: 'accessories.svg', id: 'icon_ring_tN' }`
   - для `amulet_t1/t2/t3` → `{ file: 'accessories.svg', id: 'icon_amulet_tN' }`
   - для `weapon_rune_t1/t2/t3` → `{ file: 'accessories.svg', id: 'icon_weapon_rune_tN' }`
   - для `armor_rune_t1/t2/t3` → `{ file: 'accessories.svg', id: 'icon_armor_rune_tN' }`
   - для `copper_ore`/`willow_branch`/`wolf_hide` → `{ file: 'materials.svg', id: 'icon_<id>' }`

---

## Чеклист готовности (для дизайн-Клода)

- [ ] Создан `public/accessories.svg` с 15 `<symbol>` (id'шники из таблицы)
- [ ] Создан `public/materials.svg` с 3 `<symbol>`
- [ ] Все символы — `viewBox="0 0 156 156"`
- [ ] Все используют только градиенты из общей палитры
- [ ] Каждый символ начинается с `<rect ... fill="url(#bg_xxx)"/>`
- [ ] T3-руны и T3-щит используют `filter="url(#f_glow_*)"`
- [ ] Файлы открываются без ошибок и валидны (можно проверить через браузер: открыть svg → должен отрисовать пустоту, т.к. `style="display:none"`, но без console errors)
- [ ] Иконки читаемы в 36×36 px (визуально проверить уменьшением)

---

## Итог

**18 SVG-иконок** в **2 файлах** (`accessories.svg` + `materials.svg`), стиль 1-в-1 как в существующих
`weapons.svg`/`armor.svg`. Размер каждого файла должен получиться примерно 15-30 КБ.
