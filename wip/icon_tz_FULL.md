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

# Приложение A: содержимое `public/weapons.svg`

Это полный текст референсного файла. Изучи структуру, скопируй из него `<defs>` (градиенты, фильтры) для своих новых файлов.

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

  
  <symbol id="icon_mace" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_str)"></rect>
    <g transform="translate(78,78) rotate(-30) translate(-78,-78)">
      
      <rect x="74" y="56" width="8" height="78" fill="url(#g_wood)" stroke="#1a1208" stroke-width="0.8"></rect>
      
      <rect x="73" y="92" width="10" height="3" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.5"></rect>
      <rect x="73" y="106" width="10" height="3" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.5"></rect>
      <rect x="73" y="120" width="10" height="3" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.5"></rect>
      
      <circle cx="78" cy="138" r="6" fill="url(#g_brass)" stroke="#1a1208" stroke-width="1"></circle>
      
      <rect x="70" y="56" width="16" height="5" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.8"></rect>
      
      <ellipse cx="78" cy="42" rx="20" ry="18" fill="url(#g_steel)" stroke="#1a1208" stroke-width="1"></ellipse>
      
      <path d="M78 22 L84 32 L78 36 L72 32 Z" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.8"></path>
      <path d="M78 62 L84 52 L78 48 L72 52 Z" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.8"></path>
      <path d="M58 42 L68 36 L72 42 L68 48 Z" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.8"></path>
      <path d="M98 42 L88 36 L84 42 L88 48 Z" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.8"></path>
      
      <path d="M76 22 L80 22 L78 12 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.8"></path>
      
      <circle cx="78" cy="42" r="4" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.7"></circle>
    </g>
  </symbol>

  
  <symbol id="icon_greatsword" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_str)"></rect>
    <g transform="translate(78,78) rotate(-45) translate(-78,-78)">
      
      <path d="M72 142 L84 142 L82 150 L74 150 Z" fill="url(#g_brass)" stroke="#1a1208" stroke-width="1"></path>
      <circle cx="78" cy="146" r="2" fill="#f0d088" opacity="0.6"></circle>
      
      <rect x="73" y="108" width="10" height="34" fill="url(#g_leather)" stroke="#1a1208" stroke-width="0.8"></rect>
      <line x1="73" y1="114" x2="83" y2="114" stroke="#1a1208" stroke-width="0.5"></line>
      <line x1="73" y1="120" x2="83" y2="120" stroke="#1a1208" stroke-width="0.5"></line>
      <line x1="73" y1="126" x2="83" y2="126" stroke="#1a1208" stroke-width="0.5"></line>
      <line x1="73" y1="132" x2="83" y2="132" stroke="#1a1208" stroke-width="0.5"></line>
      <line x1="73" y1="138" x2="83" y2="138" stroke="#1a1208" stroke-width="0.5"></line>
      
      <path d="M48 102 L108 102 L104 110 L52 110 Z" fill="url(#g_brass)" stroke="#1a1208" stroke-width="1"></path>
      <circle cx="48" cy="106" r="5" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.8"></circle>
      <circle cx="108" cy="106" r="5" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.8"></circle>
      
      <path d="M70 102 L78 8 L86 102 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M75 100 L78 18 L81 100 Z" fill="#0d0a06" opacity="0.55"></path>
      
      <path d="M74 100 L78 16 L78 96 Z" fill="#f0ece4" opacity="0.35"></path>
    </g>
  </symbol>

  
  <symbol id="icon_spear" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_str)"></rect>
    <g transform="translate(78,78) rotate(-30) translate(-78,-78)">
      
      <rect x="76" y="36" width="4" height="108" fill="url(#g_wood)" stroke="#1a1208" stroke-width="0.7"></rect>
      
      <rect x="74" y="60" width="8" height="3" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.4"></rect>
      <rect x="74" y="92" width="8" height="3" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.4"></rect>
      <rect x="74" y="124" width="8" height="3" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.4"></rect>
      
      <rect x="72" y="32" width="12" height="8" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.8"></rect>
      
      <path d="M78 6 Q88 18 86 32 L70 32 Q68 18 78 6 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M78 8 L78 30" stroke="#0d0a06" stroke-width="1.5" stroke-linecap="round" opacity="0.6"></path>
      
      <path d="M76 28 Q72 20 76 10 L78 8 L78 28 Z" fill="#f0ece4" opacity="0.35"></path>
      
      <rect x="73" y="142" width="10" height="6" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.7"></rect>
    </g>
  </symbol>

  
  <symbol id="icon_hammer" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_str)"></rect>
    <g transform="translate(78,78) rotate(-30) translate(-78,-78)">
      
      <rect x="74" y="50" width="8" height="92" fill="url(#g_wood)" stroke="#1a1208" stroke-width="0.8"></rect>
      
      <rect x="73" y="78" width="10" height="3" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.5"></rect>
      <rect x="73" y="98" width="10" height="3" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.5"></rect>
      <rect x="73" y="118" width="10" height="3" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.5"></rect>
      
      <rect x="71" y="138" width="14" height="8" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.8"></rect>
      
      <rect x="44" y="32" width="68" height="26" fill="url(#g_steel)" stroke="#1a1208" stroke-width="1"></rect>
      
      <rect x="40" y="34" width="6" height="22" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.8"></rect>
      <rect x="110" y="34" width="6" height="22" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.8"></rect>
      
      <circle cx="56" cy="40" r="2.5" fill="url(#g_rivet)"></circle>
      <circle cx="56" cy="50" r="2.5" fill="url(#g_rivet)"></circle>
      <circle cx="100" cy="40" r="2.5" fill="url(#g_rivet)"></circle>
      <circle cx="100" cy="50" r="2.5" fill="url(#g_rivet)"></circle>
      
      <rect x="69" y="56" width="18" height="6" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.7"></rect>
      <rect x="69" y="28" width="18" height="6" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.7"></rect>
      
      <path d="M74 28 L82 28 L78 16 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.8"></path>
      
      <rect x="46" y="34" width="64" height="3" fill="#f0ece4" opacity="0.3"></rect>
    </g>
  </symbol>

  

  
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

  
  <symbol id="icon_fists" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_agi)"></rect>
    
    <g transform="translate(60,90) rotate(-15) translate(-60,-90)" opacity="0.85">
      <path d="M30 70 Q30 50 50 50 L80 50 Q100 50 100 70 L100 90 Q100 110 80 110 L50 110 Q30 110 30 90 Z" fill="url(#g_brass)" stroke="#1a1208" stroke-width="1.2"></path>
      <circle cx="48" cy="70" r="6" fill="#0d0a06"></circle>
      <circle cx="65" cy="70" r="6" fill="#0d0a06"></circle>
      <circle cx="82" cy="70" r="6" fill="#0d0a06"></circle>
      
      <path d="M44 50 L48 38 L52 50 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.7"></path>
      <path d="M61 50 L65 38 L69 50 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.7"></path>
      <path d="M78 50 L82 38 L86 50 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.7"></path>
    </g>
    
    <g transform="translate(96,66) rotate(15) translate(-96,-66)">
      <path d="M58 46 Q58 26 78 26 L108 26 Q128 26 128 46 L128 66 Q128 86 108 86 L78 86 Q58 86 58 66 Z" fill="url(#g_brass)" stroke="#1a1208" stroke-width="1.2"></path>
      <circle cx="76" cy="46" r="6" fill="#0d0a06"></circle>
      <circle cx="93" cy="46" r="6" fill="#0d0a06"></circle>
      <circle cx="110" cy="46" r="6" fill="#0d0a06"></circle>
      
      <path d="M72 26 L76 14 L80 26 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.7"></path>
      <path d="M89 26 L93 14 L97 26 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.7"></path>
      <path d="M106 26 L110 14 L114 26 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.7"></path>
      
      <path d="M62 30 Q62 28 70 28 L120 28 Q124 28 124 32 L124 36 L62 36 Z" fill="#f0d088" opacity="0.35"></path>
    </g>
  </symbol>

  
  <symbol id="icon_shortbow" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_agi)"></rect>
    <g transform="translate(78,78) rotate(15) translate(-78,-78)">
      
      <path d="M62 38 Q42 78 62 118" stroke="url(#g_wood)" stroke-width="7" fill="none" stroke-linecap="round"></path>
      <path d="M62 38 Q42 78 62 118" stroke="#1a1208" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.4" transform="translate(0,1)"></path>
      
      <path d="M62 38 Q66 30 70 28" stroke="url(#g_wood)" stroke-width="5" fill="none" stroke-linecap="round"></path>
      <path d="M62 118 Q66 126 70 128" stroke="url(#g_wood)" stroke-width="5" fill="none" stroke-linecap="round"></path>
      
      <line x1="70" y1="28" x2="70" y2="128" stroke="url(#g_string)" stroke-width="1.2"></line>
      
      <rect x="46" y="72" width="8" height="14" fill="url(#g_leather)" stroke="#1a1208" stroke-width="0.6" rx="1"></rect>
      <line x1="46" y1="76" x2="54" y2="76" stroke="#1a1208" stroke-width="0.4"></line>
      <line x1="46" y1="80" x2="54" y2="80" stroke="#1a1208" stroke-width="0.4"></line>
      
      <line x1="78" y1="78" x2="124" y2="78" stroke="url(#g_wood)" stroke-width="1.6"></line>
      
      <path d="M124 78 L116 74 L116 82 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.5"></path>
      
      <path d="M82 78 L74 73 L74 75 L80 78 L74 81 L74 83 Z" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.4"></path>
      
      <circle cx="70" cy="78" r="1.5" fill="#1a1208"></circle>
    </g>
  </symbol>

  
  <symbol id="icon_longbow" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_agi)"></rect>
    <g>
      
      <path d="M58 14 Q34 78 58 142" stroke="url(#g_wood)" stroke-width="6" fill="none" stroke-linecap="round"></path>
      <path d="M58 14 Q34 78 58 142" stroke="#1a1208" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.35" transform="translate(0,1)"></path>
      
      <circle cx="58" cy="14" r="3" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.6"></circle>
      <circle cx="58" cy="142" r="3" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.6"></circle>
      
      <line x1="58" y1="14" x2="58" y2="142" stroke="url(#g_string)" stroke-width="1.2"></line>
      
      <rect x="36" y="68" width="8" height="20" fill="url(#g_leather)" stroke="#1a1208" stroke-width="0.6" rx="1"></rect>
      <line x1="36" y1="72" x2="44" y2="72" stroke="#1a1208" stroke-width="0.4"></line>
      <line x1="36" y1="76" x2="44" y2="76" stroke="#1a1208" stroke-width="0.4"></line>
      <line x1="36" y1="80" x2="44" y2="80" stroke="#1a1208" stroke-width="0.4"></line>
      <line x1="36" y1="84" x2="44" y2="84" stroke="#1a1208" stroke-width="0.4"></line>
      
      <line x1="64" y1="78" x2="124" y2="78" stroke="url(#g_wood)" stroke-width="1.8"></line>
      
      <path d="M124 78 L114 73 L114 83 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.5"></path>
      
      <path d="M68 78 L60 72 L60 75 L66 78 L60 81 L60 84 Z" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.4"></path>
      <circle cx="58" cy="78" r="1.5" fill="#1a1208"></circle>
    </g>
  </symbol>

  
  <symbol id="icon_crossbow" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_agi)"></rect>
    <g transform="translate(78,78) rotate(-20) translate(-78,-78)">
      
      <path d="M16 60 Q78 48 140 60" stroke="url(#g_wood)" stroke-width="6" fill="none" stroke-linecap="round"></path>
      <path d="M16 60 Q78 48 140 60" stroke="#1a1208" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.35" transform="translate(0,1)"></path>
      
      <line x1="16" y1="60" x2="78" y2="68" stroke="url(#g_string)" stroke-width="1.2"></line>
      <line x1="78" y1="68" x2="140" y2="60" stroke="url(#g_string)" stroke-width="1.2"></line>
      
      <path d="M58 60 L98 60 L120 124 L96 132 L78 92 L58 92 Z" fill="url(#g_wood)" stroke="#1a1208" stroke-width="1"></path>
      
      <line x1="20" y1="74" x2="98" y2="62" stroke="url(#g_wood)" stroke-width="1.6"></line>
      <path d="M20 74 L28 70 L28 78 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.5"></path>
      
      <path d="M98 62 L106 56 L106 60 L102 62 L106 66 L106 70 Z" fill="url(#g_copper)" stroke="#1a1208" stroke-width="0.4"></path>
      
      <path d="M88 92 L94 96 L92 102 L86 100 Z" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.7"></path>
      
      <circle cx="78" cy="68" r="3" fill="url(#g_rivet)"></circle>
      <circle cx="68" cy="80" r="2" fill="url(#g_rivet)"></circle>
      <circle cx="86" cy="80" r="2" fill="url(#g_rivet)"></circle>
      
      <path d="M60 62 L96 62 L96 65 L60 65 Z" fill="#f0ece4" opacity="0.2"></path>
    </g>
  </symbol>

  

  

  
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

  
  <symbol id="icon_staff_water" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_int)"></rect>
    <g transform="translate(78,78) rotate(-20) translate(-78,-78)">
      <rect x="75" y="42" width="6" height="100" fill="url(#g_wood)" stroke="#1a1208" stroke-width="0.7"></rect>
      <rect x="73" y="62" width="10" height="3" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.4"></rect>
      <rect x="73" y="86" width="10" height="3" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.4"></rect>
      <rect x="73" y="110" width="10" height="3" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.4"></rect>
      <rect x="73" y="134" width="10" height="3" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.4"></rect>
      <path d="M64 46 Q66 36 72 32 L78 30 L84 32 Q90 36 92 46 L88 50 L78 46 L68 50 Z" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.9"></path>
      <g filter="url(#f_glow_blue)">
        
        <path d="M78 8 L88 30 L82 44 L74 44 L68 30 Z" fill="url(#g_water)" stroke="#0c1f33" stroke-width="0.8"></path>
        <path d="M78 8 L82 44 L78 30 Z" fill="#ffffff" opacity="0.3"></path>
        <path d="M78 8 L74 44 L78 30 Z" fill="#000000" opacity="0.25"></path>
        
        <path d="M68 30 L62 22 L66 36 Z" fill="url(#g_water)" stroke="#0c1f33" stroke-width="0.6"></path>
        <path d="M88 30 L94 22 L90 36 Z" fill="url(#g_water)" stroke="#0c1f33" stroke-width="0.6"></path>
      </g>
      <rect x="71" y="140" width="14" height="6" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.7"></rect>
    </g>
  </symbol>

  
  <symbol id="icon_staff_earth" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_int)"></rect>
    <g transform="translate(78,78) rotate(-20) translate(-78,-78)">
      <rect x="74" y="42" width="8" height="100" fill="url(#g_wood)" stroke="#1a1208" stroke-width="0.7"></rect>
      <rect x="72" y="62" width="12" height="3" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.4"></rect>
      <rect x="72" y="86" width="12" height="3" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.4"></rect>
      <rect x="72" y="110" width="12" height="3" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.4"></rect>
      <rect x="72" y="134" width="12" height="3" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.4"></rect>
      
      <path d="M62 50 Q60 40 68 32 L78 28 L88 32 Q96 40 94 50 L86 52 L78 48 L70 52 Z" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.9"></path>
      <g filter="url(#f_glow_amber)">
        
        <path d="M78 6 L92 18 L96 32 L90 44 L78 46 L66 44 L60 32 L64 18 Z" fill="url(#g_earth)" stroke="#1f1208" stroke-width="0.9"></path>
        
        <path d="M78 6 L96 32 L78 28 Z" fill="#ffffff" opacity="0.22"></path>
        <path d="M78 6 L60 32 L78 28 Z" fill="#000000" opacity="0.25"></path>
        <path d="M78 28 L90 44 L78 46 Z" fill="#000000" opacity="0.18"></path>
      </g>
      <rect x="70" y="140" width="16" height="6" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.7"></rect>
    </g>
  </symbol>

  
  <symbol id="icon_staff_wind" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_int)"></rect>
    <g transform="translate(78,78) rotate(-20) translate(-78,-78)">
      <rect x="75" y="42" width="6" height="100" fill="url(#g_wood)" stroke="#1a1208" stroke-width="0.7"></rect>
      <rect x="73" y="62" width="10" height="3" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.4"></rect>
      <rect x="73" y="86" width="10" height="3" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.4"></rect>
      <rect x="73" y="110" width="10" height="3" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.4"></rect>
      <rect x="73" y="134" width="10" height="3" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.4"></rect>
      
      <g fill="none" stroke="url(#g_steel_h)" stroke-width="2.4" stroke-linecap="round">
        <path d="M64 50 Q70 30 78 28 Q86 30 92 50"></path>
        <path d="M68 46 Q74 36 78 36 Q82 36 88 46"></path>
      </g>
      <g filter="url(#f_glow_pale)">
        
        <circle cx="78" cy="26" r="14" fill="url(#g_wind)" stroke="#1c2a18" stroke-width="0.8"></circle>
        
        <path d="M70 22 Q78 18 86 22 Q82 28 78 26 Q74 24 70 22 Z" fill="#ffffff" opacity="0.4"></path>
        <path d="M72 30 Q78 28 84 30" stroke="#ffffff" stroke-width="1" fill="none" opacity="0.5"></path>
      </g>
      <rect x="71" y="140" width="14" height="6" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.7"></rect>
    </g>
  </symbol>

  
  <symbol id="icon_staff_nature" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_int)"></rect>
    <g transform="translate(78,78) rotate(-20) translate(-78,-78)">
      
      <path d="M78 142 Q72 100 76 60 Q80 50 78 42" stroke="url(#g_wood)" stroke-width="7" fill="none" stroke-linecap="round"></path>
      
      <path d="M78 142 Q72 100 76 60 Q80 50 78 42" stroke="#1a1208" stroke-width="0.8" fill="none" opacity="0.5"></path>
      
      <path d="M70 90 Q78 86 86 90" stroke="#3a5a22" stroke-width="1.4" fill="none"></path>
      <path d="M70 110 Q78 106 86 110" stroke="#3a5a22" stroke-width="1.4" fill="none"></path>
      
      <g filter="url(#f_glow_green)">
        
        <path d="M78 42 Q70 30 60 26 Q56 22 60 18" stroke="url(#g_wood)" stroke-width="5" fill="none" stroke-linecap="round"></path>
        <path d="M78 42 Q86 30 96 26 Q100 22 96 18" stroke="url(#g_wood)" stroke-width="5" fill="none" stroke-linecap="round"></path>
        
        <path d="M58 14 Q50 16 48 24 Q56 22 60 18 Z" fill="url(#g_nature)" stroke="#0e1a08" stroke-width="0.6"></path>
        <path d="M98 14 Q106 16 108 24 Q100 22 96 18 Z" fill="url(#g_nature)" stroke="#0e1a08" stroke-width="0.6"></path>
        <path d="M68 22 Q60 30 64 38 Q72 34 70 26 Z" fill="url(#g_nature)" stroke="#0e1a08" stroke-width="0.6"></path>
        <path d="M88 22 Q96 30 92 38 Q84 34 86 26 Z" fill="url(#g_nature)" stroke="#0e1a08" stroke-width="0.6"></path>
        
        <circle cx="78" cy="36" r="4" fill="url(#g_nature)" stroke="#0e1a08" stroke-width="0.6"></circle>
        <circle cx="77" cy="35" r="1.2" fill="#ffffff" opacity="0.5"></circle>
      </g>
      
      <rect x="71" y="140" width="14" height="6" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.7"></rect>
    </g>
  </symbol>

</svg>
```

---

# Приложение B: содержимое `public/armor.svg`

Второй референс — обрати внимание на симметричную композицию без поворотов (для брони).

```xml

<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
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
    <linearGradient id="g_leather_h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4a2e1a"></stop>
      <stop offset="0.5" stop-color="#2a1a0e"></stop>
      <stop offset="1" stop-color="#0f0805"></stop>
    </linearGradient>
    <linearGradient id="g_string" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c8b890"></stop>
      <stop offset="1" stop-color="#5a4a30"></stop>
    </linearGradient>

    
    <linearGradient id="g_cloth" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5e6478"></stop>
      <stop offset="0.5" stop-color="#3a3e52"></stop>
      <stop offset="1" stop-color="#15182a"></stop>
    </linearGradient>
    <linearGradient id="g_cloth_h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4e5468"></stop>
      <stop offset="0.5" stop-color="#2e3346"></stop>
      <stop offset="1" stop-color="#10131f"></stop>
    </linearGradient>
    <linearGradient id="g_rope" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a0825a"></stop>
      <stop offset="1" stop-color="#3a2c1c"></stop>
    </linearGradient>

    
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

  

  
  <symbol id="icon_heavy_helmet" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_str)"></rect>
    <g>
      
      <path d="M58 102 Q78 116 98 102" fill="none" stroke="url(#g_leather)" stroke-width="6" stroke-linecap="round"></path>
      <circle cx="58" cy="102" r="3" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.7"></circle>
      <circle cx="98" cy="102" r="3" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.7"></circle>
      
      <path d="M40 84 Q40 36 78 30 Q116 36 116 84 L116 96 Q116 100 110 100 L46 100 Q40 100 40 96 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="1.2"></path>
      
      <path d="M78 30 L78 96" stroke="#1a1208" stroke-width="1.2" opacity="0.5"></path>
      <path d="M78 32 L78 96" stroke="url(#g_brass)" stroke-width="2.5" opacity="0.6"></path>
      
      <circle cx="50" cy="74" r="2.8" fill="url(#g_rivet)"></circle>
      <circle cx="50" cy="90" r="2.8" fill="url(#g_rivet)"></circle>
      <circle cx="106" cy="74" r="2.8" fill="url(#g_rivet)"></circle>
      <circle cx="106" cy="90" r="2.8" fill="url(#g_rivet)"></circle>
      
      <path d="M40 64 Q78 56 116 64 L116 72 Q78 64 40 72 Z" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <path d="M74 64 L82 64 L80 90 L76 90 Z" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <path d="M52 50 Q60 46 64 52" fill="none" stroke="#1a1208" stroke-width="0.8" opacity="0.6"></path>
      <path d="M98 78 Q104 76 106 80" fill="none" stroke="#1a1208" stroke-width="0.8" opacity="0.5"></path>
      
      <path d="M48 50 Q78 38 108 50 L108 56 Q78 46 48 56 Z" fill="#f0ece4" opacity="0.18"></path>
      
      <path d="M46 96 Q78 100 110 96 L108 102 Q78 106 48 102 Z" fill="#000" opacity="0.4"></path>
    </g>
  </symbol>

  
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

  
  <symbol id="icon_heavy_gloves" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_str)"></rect>
    
    <g transform="translate(50,84) rotate(-12) translate(-50,-84)" opacity="0.85">
      
      <path d="M28 100 L72 100 L70 124 L30 124 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <rect x="28" y="92" width="44" height="12" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.9"></rect>
      <circle cx="36" cy="98" r="2" fill="url(#g_rivet)"></circle>
      <circle cx="64" cy="98" r="2" fill="url(#g_rivet)"></circle>
      
      <path d="M30 92 Q30 60 50 56 Q70 60 70 92 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.9"></path>
      <path d="M50 56 L50 92" stroke="#1a1208" stroke-width="0.5" opacity="0.4"></path>
      
      <rect x="34" y="62" width="8" height="6" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.6"></rect>
      <rect x="44" y="60" width="8" height="6" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.6"></rect>
      <rect x="54" y="62" width="8" height="6" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.6"></rect>
    </g>
    
    <g transform="translate(96,72) rotate(12) translate(-96,-72)">
      <path d="M68 92 L120 92 L118 118 L70 118 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="1"></path>
      
      <rect x="68" y="84" width="52" height="12" fill="url(#g_steel)" stroke="#1a1208" stroke-width="1"></rect>
      <circle cx="76" cy="90" r="2.5" fill="url(#g_rivet)"></circle>
      <circle cx="112" cy="90" r="2.5" fill="url(#g_rivet)"></circle>
      
      <path d="M70 84 Q70 48 94 44 Q118 48 118 84 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M94 44 L94 84" stroke="#1a1208" stroke-width="0.6" opacity="0.45"></path>
      
      <rect x="74" y="52" width="10" height="7" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.7"></rect>
      <rect x="86" y="50" width="10" height="7" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.7"></rect>
      <rect x="98" y="50" width="10" height="7" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.7"></rect>
      <rect x="110" y="52" width="8" height="7" fill="url(#g_steel_h)" stroke="#1a1208" stroke-width="0.7"></rect>
      
      <path d="M76 50 Q94 44 112 50 L112 56 Q94 50 76 56 Z" fill="#f0ece4" opacity="0.2"></path>
      
      <path d="M84 70 L98 76" stroke="#1a1208" stroke-width="0.6" opacity="0.5"></path>
    </g>
  </symbol>

  
  <symbol id="icon_heavy_boots" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_str)"></rect>
    
    <g transform="translate(54,90) rotate(-6) translate(-54,-90)" opacity="0.85">
      
      <path d="M30 50 L62 50 L62 100 Q60 110 50 112 L34 112 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <rect x="28" y="46" width="36" height="8" fill="url(#g_leather_h)" stroke="#1a1208" stroke-width="0.7"></rect>
      
      <rect x="28" y="84" width="36" height="6" fill="url(#g_leather_h)" stroke="#1a1208" stroke-width="0.6"></rect>
      <rect x="42" y="82" width="6" height="10" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.6"></rect>
      
      <path d="M30 100 L34 112 L84 116 Q90 116 90 110 L88 102 L62 100 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <path d="M70 102 Q90 102 90 110 L86 116 L70 116 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.8"></path>
      
      <path d="M30 112 L86 116 L86 120 L32 116 Z" fill="#0e0a06" stroke="#1a1208" stroke-width="0.6"></path>
    </g>
    
    <g transform="translate(94,72) rotate(8) translate(-94,-72)">
      
      <path d="M68 28 L102 28 L102 84 Q100 96 90 98 L72 98 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="1"></path>
      
      <rect x="66" y="24" width="40" height="9" fill="url(#g_leather_h)" stroke="#1a1208" stroke-width="0.8"></rect>
      
      <path d="M82 38 L86 42 L82 46 L86 50 L82 54 L86 58 L82 62 L86 66 L82 70 L86 74" fill="none" stroke="url(#g_string)" stroke-width="0.8"></path>
      
      <rect x="66" y="68" width="40" height="7" fill="url(#g_leather_h)" stroke="#1a1208" stroke-width="0.7"></rect>
      <rect x="84" y="65" width="7" height="13" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.7"></rect>
      <circle cx="87" cy="71" r="1.3" fill="#1a1208"></circle>
      
      <path d="M68 86 L72 100 L128 104 Q136 104 136 96 L134 88 L102 86 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M114 88 Q136 90 136 98 L132 104 L114 104 Z" fill="url(#g_steel)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <circle cx="124" cy="96" r="2" fill="url(#g_rivet)"></circle>
      
      <path d="M68 100 L132 104 L132 110 L70 106 Z" fill="#0e0a06" stroke="#1a1208" stroke-width="0.7"></path>
      
      <path d="M70 30 L100 30 L100 36 Q86 32 70 36 Z" fill="#f0ece4" opacity="0.15"></path>
    </g>
  </symbol>

  

  
  <symbol id="icon_leather_helmet" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_agi)"></rect>
    <g>
      
      <path d="M28 110 Q78 96 128 110 L128 130 L28 130 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="1"></path>
      <path d="M28 116 Q78 102 128 116" fill="none" stroke="#1a1208" stroke-width="0.5" opacity="0.5" stroke-dasharray="2,2"></path>
      
      <path d="M44 110 Q40 56 78 28 Q116 56 112 110 Q78 122 44 110 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="1.2"></path>
      
      <path d="M58 108 Q60 70 78 60 Q96 70 98 108 Q78 116 58 108 Z" fill="#0a0604" stroke="#1a1208" stroke-width="0.8"></path>
      
      <path d="M50 60 Q48 84 50 108" fill="none" stroke="#3a2a18" stroke-width="0.5" stroke-dasharray="2,2"></path>
      <path d="M106 60 Q108 84 106 108" fill="none" stroke="#3a2a18" stroke-width="0.5" stroke-dasharray="2,2"></path>
      
      <path d="M78 30 Q76 60 78 90" fill="none" stroke="#3a2a18" stroke-width="0.5" stroke-dasharray="2,2"></path>
      
      <path d="M58 50 Q78 36 98 50 L96 56 Q78 44 60 56 Z" fill="#a07050" opacity="0.25"></path>
      
      <path d="M88 84 Q92 90 88 96" fill="none" stroke="#1a1208" stroke-width="0.6" opacity="0.5"></path>
      <path d="M52 90 Q56 94 52 100" fill="none" stroke="#1a1208" stroke-width="0.5" opacity="0.4"></path>
      
      <path d="M70 110 Q78 118 86 110" fill="none" stroke="url(#g_string)" stroke-width="1"></path>
    </g>
  </symbol>

  
  <symbol id="icon_leather_chest" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_agi)"></rect>
    <g>
      
      <path d="M30 38 L58 26 L98 26 L126 38 L120 64 L36 64 Z" fill="url(#g_leather_h)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M36 60 L120 60 L116 130 L40 130 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M40 58 L116 58" stroke="#3a2a18" stroke-width="0.6" stroke-dasharray="3,3"></path>
      
      <path d="M68 70 L88 90 M88 70 L68 90 M68 90 L88 110 M88 90 L68 110" stroke="url(#g_string)" stroke-width="1.2" fill="none"></path>
      
      <circle cx="68" cy="70" r="1.5" fill="#1a1208"></circle>
      <circle cx="88" cy="70" r="1.5" fill="#1a1208"></circle>
      <circle cx="68" cy="90" r="1.5" fill="#1a1208"></circle>
      <circle cx="88" cy="90" r="1.5" fill="#1a1208"></circle>
      <circle cx="68" cy="110" r="1.5" fill="#1a1208"></circle>
      <circle cx="88" cy="110" r="1.5" fill="#1a1208"></circle>
      
      <path d="M44 64 L48 128" stroke="#3a2a18" stroke-width="0.5" stroke-dasharray="2,2"></path>
      <path d="M112 64 L108 128" stroke="#3a2a18" stroke-width="0.5" stroke-dasharray="2,2"></path>
      
      <path d="M40 124 L116 124" stroke="#3a2a18" stroke-width="0.6" stroke-dasharray="3,3"></path>
      
      <rect x="38" y="100" width="80" height="6" fill="url(#g_leather_h)" stroke="#1a1208" stroke-width="0.7"></rect>
      <rect x="74" y="98" width="8" height="10" fill="url(#g_brass)" stroke="#1a1208" stroke-width="0.7"></rect>
      
      <path d="M40 64 Q78 60 116 64 L114 70 Q78 66 42 70 Z" fill="#a07050" opacity="0.18"></path>
      
      <path d="M50 110 Q56 116 50 122" fill="none" stroke="#1a1208" stroke-width="0.6" opacity="0.5"></path>
      <path d="M104 76 Q108 80 104 84" fill="none" stroke="#1a1208" stroke-width="0.5" opacity="0.4"></path>
    </g>
  </symbol>

  
  <symbol id="icon_leather_gloves" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_agi)"></rect>
    
    <g transform="translate(54,86) rotate(-12) translate(-54,-86)" opacity="0.85">
      
      <path d="M28 100 L70 100 L66 60 L32 60 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <path d="M30 64 L68 70 L30 76 L68 82 L30 88 L68 94" stroke="url(#g_string)" stroke-width="0.9" fill="none"></path>
      
      <path d="M32 60 Q34 40 50 36 Q64 40 66 60 Z" fill="url(#g_leather_h)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <path d="M50 36 L50 60" stroke="#1a1208" stroke-width="0.4" opacity="0.5"></path>
      
      <path d="M28 102 L70 102" stroke="#3a2a18" stroke-width="0.5" stroke-dasharray="2,2"></path>
    </g>
    
    <g transform="translate(96,68) rotate(12) translate(-96,-68)">
      
      <path d="M68 92 L122 92 L118 44 L72 44 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M70 50 L120 56 L70 62 L120 68 L70 74 L120 80 L70 86 L120 92" stroke="url(#g_string)" stroke-width="1.1" fill="none"></path>
      
      <circle cx="70" cy="50" r="1.2" fill="#1a1208"></circle>
      <circle cx="120" cy="56" r="1.2" fill="#1a1208"></circle>
      <circle cx="70" cy="86" r="1.2" fill="#1a1208"></circle>
      <circle cx="120" cy="92" r="1.2" fill="#1a1208"></circle>
      
      <path d="M72 44 Q76 18 94 14 Q112 18 118 44 Z" fill="url(#g_leather_h)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M94 14 L94 44" stroke="#1a1208" stroke-width="0.5" opacity="0.45"></path>
      
      <path d="M68 94 L122 94" stroke="#3a2a18" stroke-width="0.6" stroke-dasharray="3,3"></path>
      
      <path d="M76 22 Q94 16 112 22 L110 28 Q94 22 78 28 Z" fill="#a07050" opacity="0.22"></path>
    </g>
  </symbol>

  
  <symbol id="icon_leather_boots" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_agi)"></rect>
    
    <g transform="translate(54,90) rotate(-6) translate(-54,-90)" opacity="0.85">
      
      <path d="M28 44 L60 44 L60 98 Q58 110 48 112 L32 112 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <rect x="26" y="40" width="36" height="8" fill="url(#g_leather_h)" stroke="#1a1208" stroke-width="0.7"></rect>
      
      <path d="M40 50 L48 54 L40 58 L48 62 L40 66 L48 70 L40 74 L48 78 L40 82 L48 86 L40 90 L48 94" fill="none" stroke="url(#g_string)" stroke-width="0.7"></path>
      
      <path d="M28 100 L32 112 L82 116 Q88 116 88 110 L86 102 L60 100 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <path d="M28 112 L84 116 L84 120 L30 116 Z" fill="#0e0a06" stroke="#1a1208" stroke-width="0.6"></path>
      <path d="M30 114 L84 118" stroke="#3a2a18" stroke-width="0.4" stroke-dasharray="2,2"></path>
    </g>
    
    <g transform="translate(94,72) rotate(8) translate(-94,-72)">
      
      <path d="M68 22 L102 22 L102 82 Q100 96 90 98 L72 98 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="1"></path>
      
      <rect x="66" y="18" width="40" height="9" fill="url(#g_leather_h)" stroke="#1a1208" stroke-width="0.8"></rect>
      
      <path d="M82 32 L88 36 L82 40 L88 44 L82 48 L88 52 L82 56 L88 60 L82 64 L88 68 L82 72 L88 76 L82 80 L88 84" fill="none" stroke="url(#g_string)" stroke-width="0.9"></path>
      
      <circle cx="82" cy="32" r="1.2" fill="#1a1208"></circle>
      <circle cx="88" cy="36" r="1.2" fill="#1a1208"></circle>
      <circle cx="82" cy="80" r="1.2" fill="#1a1208"></circle>
      <circle cx="88" cy="84" r="1.2" fill="#1a1208"></circle>
      
      <path d="M68 30 L70 96" stroke="#3a2a18" stroke-width="0.5" stroke-dasharray="2,2"></path>
      <path d="M102 30 L100 96" stroke="#3a2a18" stroke-width="0.5" stroke-dasharray="2,2"></path>
      
      <path d="M68 86 L72 100 L130 104 Q138 104 138 96 L136 88 L102 86 Z" fill="url(#g_leather)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M68 100 L134 104 L134 110 L70 106 Z" fill="#0e0a06" stroke="#1a1208" stroke-width="0.7"></path>
      <path d="M72 102 L134 106" stroke="#3a2a18" stroke-width="0.5" stroke-dasharray="3,3"></path>
      
      <path d="M70 26 L100 26 L100 32 Q86 28 70 32 Z" fill="#a07050" opacity="0.2"></path>
    </g>
  </symbol>

  

  
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

  
  <symbol id="icon_robe_chest" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_int)"></rect>
    <g>
      
      <path d="M32 32 L60 24 L96 24 L124 32 L132 134 L24 134 Z" fill="url(#g_cloth)" stroke="#1a1208" stroke-width="1.1"></path>
      
      <path d="M32 32 L60 24 L72 36 L60 56 L40 50 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.8"></path>
      <path d="M124 32 L96 24 L84 36 L96 56 L116 50 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.8"></path>
      
      <path d="M70 30 L78 60 L86 30 Z" fill="#0a0e1c" stroke="#1a1208" stroke-width="0.7"></path>
      
      <path d="M76 36 L80 36 M75 42 L81 42 M74 48 L82 48" stroke="url(#g_string)" stroke-width="0.6"></path>
      
      <path d="M78 60 L78 132" stroke="#1a1208" stroke-width="0.6" opacity="0.45"></path>
      
      <path d="M28 86 Q78 92 128 86 L128 96 Q78 102 28 96 Z" fill="url(#g_rope)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <ellipse cx="78" cy="92" rx="9" ry="6" fill="url(#g_rope)" stroke="#1a1208" stroke-width="0.7"></ellipse>
      <path d="M70 96 L62 116 M86 96 L94 116" stroke="url(#g_rope)" stroke-width="3" stroke-linecap="round"></path>
      <path d="M70 96 L62 116" stroke="#1a1208" stroke-width="0.5" opacity="0.4"></path>
      
      <rect x="44" y="106" width="14" height="10" fill="url(#g_cloth_h)" stroke="#3a3346" stroke-width="0.5" stroke-dasharray="1.5,1.5"></rect>
      <rect x="100" y="116" width="12" height="9" fill="url(#g_cloth_h)" stroke="#3a3346" stroke-width="0.5" stroke-dasharray="1.5,1.5"></rect>
      
      <path d="M28 128 L128 128" stroke="#3a3346" stroke-width="0.6" stroke-dasharray="3,3"></path>
      
      <path d="M52 100 L48 130" stroke="#1a1208" stroke-width="0.4" opacity="0.4"></path>
      <path d="M104 100 L108 130" stroke="#1a1208" stroke-width="0.4" opacity="0.4"></path>
      
      <path d="M44 36 Q78 30 112 36 L110 44 Q78 36 46 44 Z" fill="#7a8094" opacity="0.18"></path>
    </g>
  </symbol>

  
  <symbol id="icon_robe_gloves" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_int)"></rect>
    
    <g transform="translate(54,86) rotate(-12) translate(-54,-86)" opacity="0.85">
      
      <path d="M28 96 L70 96 L66 56 L32 56 Z" fill="url(#g_cloth)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <path d="M30 60 L68 60 L67 64 L31 64 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.5" opacity="0.9"></path>
      <path d="M30 70 L68 70 L67 74 L31 74 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.5" opacity="0.9"></path>
      <path d="M30 80 L68 80 L67 84 L31 84 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.5" opacity="0.9"></path>
      <path d="M30 90 L68 90 L67 94 L31 94 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.5" opacity="0.9"></path>
      
      <path d="M32 56 Q34 40 50 38 Q64 40 66 56 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <path d="M40 38 L40 56 M50 36 L50 56 M60 38 L60 56" stroke="#0a0e1c" stroke-width="1.2"></path>
    </g>
    
    <g transform="translate(96,68) rotate(12) translate(-96,-68)">
      
      <path d="M68 90 L122 90 L118 42 L72 42 Z" fill="url(#g_cloth)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M70 48 L120 48 L119 53 L71 53 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.6" opacity="0.9"></path>
      <path d="M70 60 L120 60 L119 65 L71 65 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.6" opacity="0.9"></path>
      <path d="M70 72 L120 72 L119 77 L71 77 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.6" opacity="0.9"></path>
      <path d="M70 84 L120 84 L119 89 L71 89 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.6" opacity="0.9"></path>
      
      <path d="M118 42 L130 50 L132 60 L122 56 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.7"></path>
      
      <path d="M72 42 Q76 18 94 14 Q112 18 118 42 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M82 16 L82 42 M94 14 L94 42 M106 16 L106 42" stroke="#0a0e1c" stroke-width="1.4"></path>
      
      <path d="M76 22 Q94 16 112 22 L110 28 Q94 22 78 28 Z" fill="#7a8094" opacity="0.22"></path>
      
      <path d="M68 92 L122 92" stroke="#3a3346" stroke-width="0.6" stroke-dasharray="3,3"></path>
    </g>
  </symbol>

  
  <symbol id="icon_robe_boots" viewBox="0 0 156 156">
    <rect width="156" height="156" fill="url(#bg_int)"></rect>
    
    <g transform="translate(56,92) rotate(-8) translate(-56,-92)" opacity="0.85">
      
      <path d="M34 50 L60 50 L58 96 L36 96 Z" fill="url(#g_cloth)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <path d="M36 56 L58 56 L57 60 L37 60 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.5"></path>
      <path d="M36 68 L58 68 L57 72 L37 72 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.5"></path>
      <path d="M36 80 L58 80 L57 84 L37 84 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.5"></path>
      
      <path d="M34 96 L80 100 Q86 100 86 94 L84 90 L60 88 Z" fill="url(#g_cloth)" stroke="#1a1208" stroke-width="0.9"></path>
      
      <path d="M48 90 Q60 86 76 92" fill="none" stroke="url(#g_rope)" stroke-width="2.5" stroke-linecap="round"></path>
      
      <path d="M34 100 L82 102 L82 106 L34 104 Z" fill="#0e0a06" stroke="#1a1208" stroke-width="0.5"></path>
    </g>
    
    <g transform="translate(96,72) rotate(8) translate(-96,-72)">
      
      <path d="M70 24 L102 24 L100 80 L72 80 Z" fill="url(#g_cloth)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M70 32 L102 38 L102 42 L70 36 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.5"></path>
      <path d="M70 46 L102 52 L102 56 L70 50 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.5"></path>
      <path d="M70 60 L102 66 L102 70 L70 64 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.5"></path>
      
      <path d="M71 28 L73 78" stroke="#3a3346" stroke-width="0.5" stroke-dasharray="2,2"></path>
      <path d="M101 28 L99 78" stroke="#3a3346" stroke-width="0.5" stroke-dasharray="2,2"></path>
      
      <path d="M100 24 L114 30 L116 38 L106 36 Z" fill="url(#g_cloth_h)" stroke="#1a1208" stroke-width="0.7"></path>
      
      <path d="M70 80 L74 96 L132 100 Q140 100 140 92 L138 86 L102 80 Z" fill="url(#g_cloth)" stroke="#1a1208" stroke-width="1"></path>
      
      <path d="M86 84 Q108 88 130 88" fill="none" stroke="url(#g_rope)" stroke-width="2.5" stroke-linecap="round"></path>
      <path d="M88 92 Q108 94 128 94" fill="none" stroke="url(#g_rope)" stroke-width="1.6" stroke-linecap="round"></path>
      
      <path d="M70 96 L134 100 L134 106 L72 102 Z" fill="#0e0a06" stroke="#1a1208" stroke-width="0.7"></path>
      
      <path d="M72 28 L100 28 L100 34 Q86 30 72 34 Z" fill="#7a8094" opacity="0.18"></path>
    </g>
  </symbol>

</svg>
```
