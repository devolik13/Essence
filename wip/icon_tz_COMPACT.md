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


---

# Приложение: образцы из существующих файлов

Ниже — выжимка из `public/weapons.svg` и `public/armor.svg`. Это реальный код, который ты должен скопировать и переиспользовать.

## A. Полный блок `<defs>` из weapons.svg (градиенты + фильтры + фоны)

Скопируй это в `<defs>` своих новых файлов как есть.

```xml
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <defs>
    
    <linearGradient id="g_steel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d8d4cc"></stop>
      <stop offset="0.5" stop-color="#8a857a"></stop>
      <stop offset="1" stop-color="#3a362e"></stop>
    </linearGradient>
    <linearGradient id="g_steel_h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#bfb9ad"></stop>
      <stop offset="0.5" stop-color="#75705f"></stop>
      <stop offset="1" stop-color="#2e2a22"></stop>
    </linearGradient>
    <linearGradient id="g_brass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e6c578"></stop>
      <stop offset="0.5" stop-color="#a07a2f"></stop>
      <stop offset="1" stop-color="#4a3818"></stop>
    </linearGradient>
    <linearGradient id="g_copper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e09060"></stop>
      <stop offset="0.5" stop-color="#9a5028"></stop>
      <stop offset="1" stop-color="#3e1d0e"></stop>
    </linearGradient>
    <linearGradient id="g_wood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7a5634"></stop>
      <stop offset="0.5" stop-color="#4d361f"></stop>
      <stop offset="1" stop-color="#241810"></stop>
    </linearGradient>
    <linearGradient id="g_leather" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5a3a22"></stop>
      <stop offset="1" stop-color="#1f1208"></stop>
    </linearGradient>
    <linearGradient id="g_string" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c8b890"></stop>
      <stop offset="1" stop-color="#5a4a30"></stop>
    </linearGradient>

    
    <radialGradient id="g_fire" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#ffe6b0"></stop>
      <stop offset="0.35" stop-color="#ff8a3a"></stop>
      <stop offset="0.75" stop-color="#a8330e"></stop>
      <stop offset="1" stop-color="#3a0e04"></stop>
    </radialGradient>
    <radialGradient id="g_water" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#e8f4ff"></stop>
      <stop offset="0.4" stop-color="#7ab8e8"></stop>
      <stop offset="0.85" stop-color="#264f7c"></stop>
      <stop offset="1" stop-color="#0c1f33"></stop>
    </radialGradient>
    <radialGradient id="g_earth" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#f0d090"></stop>
      <stop offset="0.4" stop-color="#b8843a"></stop>
      <stop offset="0.85" stop-color="#5a3a16"></stop>
      <stop offset="1" stop-color="#1f1208"></stop>
    </radialGradient>
    <radialGradient id="g_wind" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#f4fff0"></stop>
      <stop offset="0.4" stop-color="#c8e8b0"></stop>
      <stop offset="0.85" stop-color="#5a7a52"></stop>
      <stop offset="1" stop-color="#1c2a18"></stop>
    </radialGradient>
    <radialGradient id="g_nature" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#c8e090"></stop>
      <stop offset="0.4" stop-color="#5a8a32"></stop>
      <stop offset="0.85" stop-color="#2a4818"></stop>
      <stop offset="1" stop-color="#0e1a08"></stop>
    </radialGradient>

    
    <filter id="f_glow_red" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="b"></feGaussianBlur>
      <feFlood flood-color="#ff5a18" flood-opacity="0.55"></feFlood>
      <feComposite in2="b" operator="in" result="c"></feComposite>
      <feMerge><feMergeNode in="c"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
    </filter>
    <filter id="f_glow_blue" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="b"></feGaussianBlur>
      <feFlood flood-color="#5aa8e8" flood-opacity="0.55"></feFlood>
      <feComposite in2="b" operator="in" result="c"></feComposite>
      <feMerge><feMergeNode in="c"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
    </filter>
    <filter id="f_glow_amber" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="b"></feGaussianBlur>
      <feFlood flood-color="#e0a040" flood-opacity="0.5"></feFlood>
      <feComposite in2="b" operator="in" result="c"></feComposite>
      <feMerge><feMergeNode in="c"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
    </filter>
    <filter id="f_glow_pale" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="b"></feGaussianBlur>
      <feFlood flood-color="#d8f0c0" flood-opacity="0.5"></feFlood>
      <feComposite in2="b" operator="in" result="c"></feComposite>
      <feMerge><feMergeNode in="c"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
    </filter>
    <filter id="f_glow_green" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="b"></feGaussianBlur>
      <feFlood flood-color="#7abc4a" flood-opacity="0.5"></feFlood>
      <feComposite in2="b" operator="in" result="c"></feComposite>
      <feMerge><feMergeNode in="c"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
    </filter>

    
    <radialGradient id="g_rivet" cx="0.35" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#ffd890"></stop>
      <stop offset="0.6" stop-color="#8c6520"></stop>
      <stop offset="1" stop-color="#2c1e08"></stop>
    </radialGradient>

    
    <radialGradient id="bg_str" cx="0.5" cy="0.5" r="0.6">
      <stop offset="0" stop-color="#3a1a14" stop-opacity="0.55"></stop>
      <stop offset="1" stop-color="#0b0905" stop-opacity="0"></stop>
    </radialGradient>
    <radialGradient id="bg_agi" cx="0.5" cy="0.5" r="0.6">
      <stop offset="0" stop-color="#1a3220" stop-opacity="0.55"></stop>
      <stop offset="1" stop-color="#0b0905" stop-opacity="0"></stop>
    </radialGradient>
    <radialGradient id="bg_int" cx="0.5" cy="0.5" r="0.6">
      <stop offset="0" stop-color="#172a3e" stop-opacity="0.55"></stop>
      <stop offset="1" stop-color="#0b0905" stop-opacity="0"></stop>
    </radialGradient>
  </defs>

```

## B. Пример простого symbol — `icon_sword` (диагональная композиция, поворот −45°)

```xml
  <symbol id="icon_sword" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_str)"></rect>
    <g transform="translate(78,78) rotate(-45) translate(-78,-78)">
      
      <circle cx="78" cy="128" r="7" fill="url(#g_brass)" stroke="#1a1208" stroke-width="1"></circle>
      <circle cx="76" cy="126" r="2" fill="#f0d088" opacity="0.7"></circle>
      
      <rect x="74" y="106" width="8" height="22" fill="url(#g_leather)" stroke="#1a1208" stroke-width="0.7"></rect>
      <line x1="74" y1="110" x2="82" y2="110" stroke="#1a1208" stroke-width="0.5"></line>
      <line x1="74" y1="115" x2="82" y2="115" stroke="#1a1208" stroke-width="0.5"></line>
      <line x1="74" y1="120" x2="82" y2="120" stroke="#1a1208" stroke-width="0.5"></line>
      <line x1="74" y1="125" x2="82" y2="125" stroke="#1a1208" stroke-width="0.5"></line>
      
      <path d="M58 102 L98 102 L96 108 L60 108 Z" fill="url(#g_brass)" stroke="#1a1208" stroke-width="1"></path>
      <circle cx="58" cy="105" r="4" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.8"></circle>
      <circle cx="98" cy="105" r="4" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.8"></circle>
      
      <path d="M73 102 L78 22 L83 102 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M77 100 L78 32 L79 100 Z" fill="#0d0a06" opacity="0.55"></path>
      
      <path d="M76 100 L78 30 L78 96 Z" fill="#f0ece4" opacity="0.35"></path>
    </g>
  </symbol>

```

## C. Пример составного symbol — `icon_dagger` (мелкие детали, заклёпки)

```xml
  <symbol id="icon_dagger" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_agi)"></rect>
    <g transform="translate(78,78) rotate(-45) translate(-78,-78)">
      
      <circle cx="78" cy="118" r="6" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.8"></circle>
      <circle cx="78" cy="118" r="3" fill="#3a8a4a" stroke="#1a1208" stroke-width="0.4"></circle>
      
      <rect x="75" y="100" width="6" height="18" fill="url(#g_leather)" stroke="#1a1208" stroke-width="0.6"></rect>
      <line x1="75" y1="105" x2="81" y2="105" stroke="#1a1208" stroke-width="0.4"></line>
      <line x1="75" y1="110" x2="81" y2="110" stroke="#1a1208" stroke-width="0.4"></line>
      <line x1="75" y1="115" x2="81" y2="115" stroke="#1a1208" stroke-width="0.4"></line>
      
      <path d="M64 96 Q78 92 92 96 L90 102 Q78 99 66 102 Z" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.8"></path>
      
      <path d="M76 96 Q70 70 78 40 Q82 70 80 96 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <path d="M77 94 Q75 70 78 46 Q80 70 79 94 Z" fill="#0d0a06" opacity="0.5"></path>
      
      <path d="M76 94 Q73 68 78 44 L78 90 Z" fill="#f0ece4" opacity="0.3"></path>
    </g>
  </symbol>

  

```

## D. Пример с radial-градиентом стихии — `icon_staff_fire`

```xml
  <symbol id="icon_staff_fire" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_int)"></rect>
    <g transform="translate(78,78) rotate(-20) translate(-78,-78)">
      
      <rect x="75" y="42" width="6" height="100" fill="url(#g_wood)" stroke="#1a1208" stroke-width="0.7"></rect>
      
      <rect x="73" y="62" width="10" height="3" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.4"></rect>
      <rect x="73" y="86" width="10" height="3" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.4"></rect>
      <rect x="73" y="110" width="10" height="3" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.4"></rect>
      <rect x="73" y="134" width="10" height="3" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.4"></rect>
      
      <path d="M64 46 Q66 36 72 32 L78 30 L84 32 Q90 36 92 46 L88 50 L78 46 L68 50 Z" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <g filter="url(#f_glow_red)">
        <path d="M78 8 L92 28 L84 44 L72 44 L64 28 Z" fill="url(#g_fire)" stroke="#3a0e04" stroke-width="0.8"></path>
        
        <path d="M78 8 L84 44 L78 30 Z" fill="#ffffff" opacity="0.25"></path>
        <path d="M78 8 L72 44 L78 30 Z" fill="#000000" opacity="0.25"></path>
      </g>
      
      <rect x="71" y="140" width="14" height="6" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.7"></rect>
    </g>
  </symbol>

  

```

## E. Пример из armor.svg — симметричный без поворота — `icon_heavy_chest`

```xml
  <symbol id="icon_heavy_chest" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_str)"></rect>
    <g>
      
      <path d="M30 36 L60 26 L96 26 L126 36 L120 130 L36 130 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M44 36 L52 28 L60 28 L60 44 Z" fill="url(#g_leather_h)" stroke="#1a1208" stroke-width="0.8"></path>
      <path d="M112 36 L104 28 L96 28 L96 44 Z" fill="url(#g_leather_h)" stroke="#1a1208" stroke-width="0.8"></path>
      
      <path d="M48 48 L78 42 L108 48 L114 110 Q78 124 42 110 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="1.2"></path>
      
      <path d="M78 44 L78 116" stroke="#1a1208" stroke-width="1" opacity="0.45"></path>
      
      <path d="M62 56 Q70 70 70 96" fill="none" stroke="#1a1208" stroke-width="0.8" opacity="0.45"></path>
      <path d="M94 56 Q86 70 86 96" fill="none" stroke="#1a1208" stroke-width="0.8" opacity="0.45"></path>
      
      <rect x="36" y="78" width="10" height="8" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.7"></rect>
      <rect x="36" y="92" width="10" height="8" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.7"></rect>
      <rect x="110" y="78" width="10" height="8" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.7"></rect>
      <rect x="110" y="92" width="10" height="8" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.7"></rect>
      
      <circle cx="41" cy="82" r="1.3" fill="#1a1208"></circle>
      <circle cx="41" cy="96" r="1.3" fill="#1a1208"></circle>
      <circle cx="115" cy="82" r="1.3" fill="#1a1208"></circle>
      <circle cx="115" cy="96" r="1.3" fill="#1a1208"></circle>
      
      <path d="M58 80 L66 86" stroke="#1a1208" stroke-width="0.7" opacity="0.5"></path>
      <path d="M88 96 L96 102" stroke="#1a1208" stroke-width="0.7" opacity="0.5"></path>
      
      <path d="M52 52 Q78 46 104 52 L102 60 Q78 54 54 60 Z" fill="#f0ece4" opacity="0.22"></path>
      
      <path d="M44 110 Q78 124 112 110 L114 120 Q78 130 42 120 Z" fill="#000" opacity="0.35"></path>
    </g>
  </symbol>

  

```

## F. Пример лёгкой брони — `icon_robe_helmet` (как делать капюшон/ткань)

```xml
  <symbol id="icon_robe_helmet" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_int)"></rect>
    <g>
      
      <path d="M30 110 Q78 96 126 110 Q78 126 30 110 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M50 108 Q50 92 78 86 Q106 92 106 108 Q78 118 50 108 Z" fill="url(#g_cloth)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M104 92 Q120 60 104 28 Q98 24 92 30 Q86 60 96 90 Z" fill="url(#g_cloth)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M100 36 Q108 56 100 84" fill="none" stroke="#1a1208" stroke-width="0.5" opacity="0.5"></path>
      
      <path d="M62 104 L74 104" stroke="#3a3346" stroke-width="0.6" stroke-dasharray="2,2"></path>
      <path d="M82 104 L98 104" stroke="#3a3346" stroke-width="0.6" stroke-dasharray="2,2"></path>
      
      <rect x="66" y="96" width="8" height="6" fill="url(#g_cloth_h)" stroke="#3a3346" stroke-width="0.5" stroke-dasharray="1,1"></rect>
      
      <path d="M44 108 Q78 122 110 108 L108 116 Q78 128 44 116 Z" fill="url(#g_rope)" stroke="#1a1208" stroke-width="0.8" opacity="0.85"></path>
      
      <circle cx="44" cy="113" r="3" fill="url(#g_rope)" stroke="#1a1208" stroke-width="0.6"></circle>
      <path d="M40 116 L34 124" stroke="url(#g_rope)" stroke-width="2" stroke-linecap="round"></path>
      
      <path d="M58 96 Q78 88 96 96 L94 100 Q78 92 60 100 Z" fill="#7a8094" opacity="0.3"></path>
      
      <path d="M96 30 L94 22 L98 22 L96 30 Z" fill="url(#g_rope)"></path>
    </g>
  </symbol>

  

```

---

Этих 6 примеров достаточно чтобы понять стиль и сделать оставшиеся 18 иконок. Если нужны полные файлы — попроси, пришлю.
