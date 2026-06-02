/**
 * CraftPix "Top-Down Simple Summer" — реестр декораций.
 * Подгружаются в BootScene, используются в GameScene.spawnDecorations.
 *
 * Все PNG лежат в public/assets/deco/
 */

const FOLDER = 'assets/deco/';
const PREFIX = 'Top-Down Simple Summer_';
const PROP = `${PREFIX}Prop - `;
const GROUND = `${PREFIX}Ground `;

/** Каждый элемент: [key, file] — BootScene.preload() пройдёт по списку. */
export const CP_ASSETS: Array<[string, string]> = [
  // Ground tiles (56 вариаций)
  ...Array.from({ length: 56 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return [`cp_ground_${num}`, `${FOLDER}${GROUND}${num}.webp`] as [string, string];
  }),

  // Props
  ['cp_banner_blue',    `${FOLDER}${PROP}Blue Banner.webp`],
  ['cp_bush_lg',        `${FOLDER}${PROP}Bushes Large.webp`],
  ['cp_bush_md',        `${FOLDER}${PROP}Bushes Medium.webp`],
  ['cp_bush_sm',        `${FOLDER}${PROP}Bushes Small.webp`],
  ['cp_campfire',       `${FOLDER}${PROP}Campfire.webp`],
  ['cp_castle_round',   `${FOLDER}${PROP}Castle Round.webp`],
  ['cp_castle_square',  `${FOLDER}${PROP}Castle Square.webp`],
  ['cp_flag',           `${FOLDER}${PROP}Flag.webp`],
  ['cp_house',          `${FOLDER}${PROP}House.webp`],
  ['cp_mage_tower',     `${FOLDER}${PROP}Magic Stone Tower.webp`],
  ['cp_banner_red',     `${FOLDER}${PROP}Red Banner.webp`],
  ['cp_rock_01',        `${FOLDER}${PROP}Rock 01.webp`],
  ['cp_rock_02',        `${FOLDER}${PROP}Rock 02.webp`],
  ['cp_rock_03',        `${FOLDER}${PROP}Rock 03.webp`],
  ['cp_rock_04',        `${FOLDER}${PROP}Rock 04.webp`],
  ['cp_rock_05',        `${FOLDER}${PROP}Rock 05.webp`],
  ['cp_tent',           `${FOLDER}${PROP}Tent.webp`],
  ['cp_chest',          `${FOLDER}${PROP}Treasure Chest.webp`],
  ['cp_tree_md',        `${FOLDER}${PROP}Tree Medium.webp`],
  ['cp_tree_sm',        `${FOLDER}${PROP}Tree Small.webp`],
  ['cp_stump_short',    `${FOLDER}${PROP}Tree Stump Short.webp`],
  ['cp_stump_tall',     `${FOLDER}${PROP}Tree Stump Tall.webp`],
  ['cp_watch_short',    `${FOLDER}${PROP}Watchtower Short.webp`],
  ['cp_watch_tall',     `${FOLDER}${PROP}Watchtower Tall.webp`],
  ['cp_well',           `${FOLDER}${PROP}Well.webp`],
  ['cp_windmill',       `${FOLDER}${PROP}Windmill.webp`],
  ['cp_barrel',         `${FOLDER}${PROP}Wooden Barrel.webp`],
  ['cp_bridge_h',       `${FOLDER}${PROP}Wooden Bridge Horizontal.webp`],
  ['cp_bridge_v',       `${FOLDER}${PROP}Wooden Bridge Vertical.webp`],
  ['cp_cart',           `${FOLDER}${PROP}Wooden Cart.webp`],
  ['cp_fence_h',        `${FOLDER}${PROP}Wooden Fence Horizontal.webp`],
  ['cp_fence_v',        `${FOLDER}${PROP}Wooden Fence Vertical.webp`],
  // Tree Large с маленькой 'p' в "prop"
  ['cp_tree_lg',        `${FOLDER}${PREFIX}prop - Tree Large.webp`],
];

/** Случайные ключи для быстрого выбора. */
export const CP_POOLS = {
  trees:   ['cp_tree_lg', 'cp_tree_md', 'cp_tree_sm'],
  stumps:  ['cp_stump_short', 'cp_stump_tall'],
  bushes:  ['cp_bush_lg', 'cp_bush_md', 'cp_bush_sm'],
  rocks:   ['cp_rock_01', 'cp_rock_02', 'cp_rock_03', 'cp_rock_04', 'cp_rock_05'],
  houses:  ['cp_house'],
  towers:  ['cp_watch_short', 'cp_watch_tall', 'cp_mage_tower'],
  castles: ['cp_castle_round', 'cp_castle_square'],
  props:   ['cp_barrel', 'cp_cart', 'cp_chest', 'cp_tent', 'cp_campfire'],
  banners: ['cp_banner_blue', 'cp_banner_red', 'cp_flag'],
} as const;

/** Мобы для редактора карт — используют уже загруженные mob_sheet_* / animal_* текстуры. */
export interface EditorMobEntry { key: string; textureKey: string }
export const EDITOR_MOB_ENTRIES: EditorMobEntry[] = [
  // key = mob_{creatureId} (getMobSpawns strips mob_ prefix)
  // textureKey = already loaded via MOB_SPRITE_SETS / ANIMAL_SPRITE_SETS
  // ── Гоблины ──────────────────────────────────────────────────────────────
  { key: 'mob_goblin',                  textureKey: 'mob_sheet_goblin_front_idle'          },
  { key: 'mob_goblin_veteran',          textureKey: 'mob_sheet_goblin_veteran_front_idle'  },
  // ── Орки ─────────────────────────────────────────────────────────────────
  { key: 'mob_orc',                     textureKey: 'mob_sheet_orc_front_idle'             },
  { key: 'mob_orc_veteran',             textureKey: 'mob_sheet_orc_veteran_front_idle'     },
  { key: 'mob_shaman',                  textureKey: 'mob_sheet_shaman_front_idle'          },
  // ── Бандиты ──────────────────────────────────────────────────────────────
  { key: 'mob_bandit_brute',            textureKey: 'mob_sheet_bandit_brute_front_idle'    },
  { key: 'mob_bandit_brute_veteran',    textureKey: 'mob_sheet_bandit_brute_front_idle'    },
  { key: 'mob_bandit_crossbow',         textureKey: 'mob_sheet_bandit_crossbow_front_idle' },
  { key: 'mob_bandit_crossbow_veteran', textureKey: 'mob_sheet_bandit_crossbow_front_idle' },
  { key: 'mob_bandit_archer',           textureKey: 'mob_sheet_bandit_archer_front_idle'   },
  { key: 'mob_bandit_archer_veteran',   textureKey: 'mob_sheet_bandit_archer_front_idle'   },
  { key: 'mob_bandit_spear',            textureKey: 'mob_sheet_bandit_spear_front_idle'    },
  // ── Скауты ───────────────────────────────────────────────────────────────
  { key: 'mob_scout',                   textureKey: 'mob_sheet_scout_front_idle'           },
  { key: 'mob_scout_veteran',           textureKey: 'mob_sheet_scout_front_idle'           },
  // ── Медведи ──────────────────────────────────────────────────────────────
  { key: 'mob_bear',                    textureKey: 'mob_sheet_bear_front_idle'            },
  { key: 'mob_bear_veteran',            textureKey: 'mob_sheet_bear_veteran_front_idle'    },
  { key: 'mob_monk',                    textureKey: 'mob_sheet_monk_front_idle'            },
  { key: 'mob_elder',                   textureKey: 'mob_sheet_elder_front_idle'           },
  { key: 'mob_ignis',                   textureKey: 'mob_sheet_ignis_front_idle'           },
  { key: 'mob_aquaris',                 textureKey: 'mob_sheet_aquaris_front_idle'         },
  { key: 'mob_terra',                   textureKey: 'mob_sheet_terra_front_idle'           },
  { key: 'mob_aeros',                   textureKey: 'mob_sheet_aeros_front_idle'           },
  { key: 'mob_wolf',                    textureKey: 'mob_sheet_wolf_front_idle'            },
  { key: 'mob_wolf_veteran',            textureKey: 'mob_sheet_wolf_front_idle'            },
  // ── Элементали ───────────────────────────────────────────────────────────
  { key: 'mob_spark',                   textureKey: 'animal_slime_fire_idle'               },
  { key: 'mob_asher',                   textureKey: 'animal_slime_fire_idle'               },
  { key: 'mob_splasher',                textureKey: 'animal_slime_water_idle'              },
  { key: 'mob_fogger',                  textureKey: 'animal_slime_water_idle'              },
  { key: 'mob_pebble',                  textureKey: 'animal_slime_earth_idle'              },
  { key: 'mob_mudder',                  textureKey: 'animal_slime_earth_idle'              },
  { key: 'mob_gusty',                   textureKey: 'animal_slime_air_idle'                },
  { key: 'mob_whistler',                textureKey: 'animal_slime_air_idle'                },
  // ── Животные ─────────────────────────────────────────────────────────────
  { key: 'mob_hare',                    textureKey: 'animal_hare_idle'                     },
  { key: 'mob_deer',                    textureKey: 'animal_deer_idle'                     },
  { key: 'mob_fox',                     textureKey: 'animal_fox_idle'                      },
  { key: 'mob_boar',                    textureKey: 'animal_boar_idle'                     },
  { key: 'mob_grouse',                  textureKey: 'animal_grouse_idle'                   },
];
/** @deprecated use EDITOR_MOB_ENTRIES — kept only to avoid import errors during migration */
export const MOB_ASSETS: Array<[string, string, number, number]> = [];

export interface MobSpriteSet {
  folder: string;
  frameW: number;
  frameH: number;
  anims: Record<string, { file: string; frames: number; }>;
}

const GOBLIN_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/goblin/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'Goblin_es-iso_idle_down-v1.webp',                       frames: 16 },
    back_idle:    { file: 'Goblin_es-iso_idle_up-v1.webp',                         frames: 16 },
    left_idle:    { file: 'Goblin_es-iso_idle_right-v1.webp',                      frames: 16 },
    right_idle:   { file: 'Goblin_es-iso_idle_right-v1.webp',                      frames: 16 },
    front_walk:   { file: 'Goblin_es-iso_walk_down-v1.webp',                       frames: 16 },
    back_walk:    { file: 'Goblin_es-iso_walk_up-v1.webp',                         frames: 16 },
    left_walk:    { file: 'Goblin_es-iso_walk_right-v1.webp',                      frames: 16 },
    right_walk:   { file: 'Goblin_es-iso_walk_right-v1.webp',                      frames: 16 },
    front_attack: { file: 'Goblin_es-iso_custom_attack_with_dagger_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'Goblin_es-iso_custom_attack_with_dagger_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'Goblin_es-iso_custom_attack_with_dagger_right-v1.webp', frames: 16 },
    right_attack: { file: 'Goblin_es-iso_custom_attack_with_dagger_right-v1.webp', frames: 16 },
    dying:        { file: 'Goblin_es-iso_custom_death_down-v1.webp',               frames: 16 },
  },
};

const GOBLIN_VETERAN_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/goblin_veteran/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'Goblin_veteran-iso_idle_down-v2.webp',                  frames: 16 },
    back_idle:    { file: 'Goblin_veteran-iso_idle_up-v2.webp',                    frames: 16 },
    left_idle:    { file: 'Goblin_veteran-iso_idle_right-v2.webp',                 frames: 16 },
    right_idle:   { file: 'Goblin_veteran-iso_idle_right-v2.webp',                 frames: 16 },
    front_walk:   { file: 'Goblin_veteran-iso_walk_down-v2.webp',                  frames: 16 },
    back_walk:    { file: 'Goblin_veteran-iso_walk_up-v2.webp',                    frames: 16 },
    left_walk:    { file: 'Goblin_veteran-iso_walk_right-v2.webp',                 frames: 16 },
    right_walk:   { file: 'Goblin_veteran-iso_walk_right-v2.webp',                 frames: 16 },
    front_attack: { file: 'Goblin_veteran-iso_custom_attack_dagger_down-v2.webp',  frames: 16 },
    back_attack:  { file: 'Goblin_veteran-iso_custom_attack_dagger_up-v2.webp',    frames: 16 },
    left_attack:  { file: 'Goblin_veteran-iso_custom_attack_dagger_right-v2.webp', frames: 16 },
    right_attack: { file: 'Goblin_veteran-iso_custom_attack_dagger_right-v2.webp', frames: 16 },
    dying:        { file: 'Goblin_veteran-iso_custom_death_down-v2.webp',          frames: 16 },
  },
};

const SHAMAN_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/shaman/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'Shaman-iso_idle_down-v1.webp',               frames: 16 },
    back_idle:    { file: 'Shaman-iso_idle_up-v1.webp',                 frames: 16 },
    left_idle:    { file: 'Shaman-iso_idle_right-v1.webp',              frames: 16 },
    right_idle:   { file: 'Shaman-iso_idle_right-v1.webp',              frames: 16 },
    front_walk:   { file: 'Shaman-iso_walk_down-v1.webp',               frames: 16 },
    back_walk:    { file: 'Shaman-iso_walk_up-v1.webp',                 frames: 16 },
    left_walk:    { file: 'Shaman-iso_walk_right-v1.webp',              frames: 16 },
    right_walk:   { file: 'Shaman-iso_walk_right-v1.webp',              frames: 16 },
    front_attack: { file: 'Shaman-iso_custom_cast_spell_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'Shaman-iso_custom_cast_spell_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'Shaman-iso_custom_cast_spell_right-v1.webp', frames: 16 },
    right_attack: { file: 'Shaman-iso_custom_cast_spell_right-v1.webp', frames: 16 },
    dying:        { file: 'Shaman-iso_custom_death_down-v1.webp',       frames: 16 },
  },
};

const WOLF_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/wolf/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'wolf_E-iso_idle_down-v1.webp',         frames: 16 },
    back_idle:    { file: 'wolf_E-iso_idle_up-v1.webp',           frames: 16 },
    left_idle:    { file: 'wolf_E-iso_idle_right-v1.webp',        frames: 16 },
    right_idle:   { file: 'wolf_E-iso_idle_right-v1.webp',        frames: 16 },
    front_walk:   { file: 'wolf_E-iso_custom_move_down-v1.webp',  frames: 16 },
    back_walk:    { file: 'wolf_E-iso_custom_move_up-v1.webp',    frames: 16 },
    left_walk:    { file: 'wolf_E-iso_custom_move_right-v1.webp', frames: 16 },
    right_walk:   { file: 'wolf_E-iso_custom_move_right-v1.webp', frames: 16 },
    front_attack: { file: 'wolf_E-iso_custom_bite_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'wolf_E-iso_custom_bite_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'wolf_E-iso_custom_bite_right-v1.webp', frames: 16 },
    right_attack: { file: 'wolf_E-iso_custom_bite_right-v1.webp', frames: 16 },
    dying:        { file: 'wolf_E-iso_custom_death_down-v1.webp', frames: 16 },
  },
};

const MONK_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/monk/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'Monk-iso_idle_down-v1.webp',          frames: 16 },
    back_idle:    { file: 'Monk-iso_idle_up-v1.webp',            frames: 16 },
    left_idle:    { file: 'Monk-iso_idle_right-v1.webp',         frames: 16 },
    right_idle:   { file: 'Monk-iso_idle_right-v1.webp',         frames: 16 },
    front_walk:   { file: 'Monk-iso_walk_down-v1.webp',          frames: 16 },
    back_walk:    { file: 'Monk-iso_walk_up-v1.webp',            frames: 16 },
    left_walk:    { file: 'Monk-iso_walk_right-v1.webp',         frames: 16 },
    right_walk:   { file: 'Monk-iso_walk_right-v1.webp',         frames: 16 },
    front_attack: { file: 'Monk-iso_custom_punch_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'Monk-iso_custom_punch_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'Monk-iso_custom_punch_right-v1.webp', frames: 16 },
    right_attack: { file: 'Monk-iso_custom_punch_right-v1.webp', frames: 16 },
    dying:        { file: 'Monk-iso_custom_death_down-v1.webp',  frames: 16 },
  },
};

const IGNIS_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/ignis/',
  frameW: 256, frameH: 256,
  anims: {
    front_idle:   { file: 'Fire_boss-iso_idle_down-v1.webp',         frames: 16 },
    back_idle:    { file: 'Fire_boss-iso_idle_up-v1.webp',           frames: 16 },
    left_idle:    { file: 'Fire_boss-iso_idle_right-v1.webp',        frames: 16 },
    right_idle:   { file: 'Fire_boss-iso_idle_right-v1.webp',        frames: 16 },
    front_walk:   { file: 'Fire_boss-iso_walk_down-v1.webp',         frames: 16 },
    back_walk:    { file: 'Fire_boss-iso_walk_up-v1.webp',           frames: 16 },
    left_walk:    { file: 'Fire_boss-iso_walk_right-v1.webp',        frames: 16 },
    right_walk:   { file: 'Fire_boss-iso_walk_right-v1.webp',        frames: 16 },
    front_attack: { file: 'Fire_boss-iso_custom_cast_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'Fire_boss-iso_custom_cast_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'Fire_boss-iso_custom_cast_right-v1.webp', frames: 16 },
    right_attack: { file: 'Fire_boss-iso_custom_cast_right-v1.webp', frames: 16 },
    dying:        { file: 'Fire_boss-iso_custom_death_down-v1.webp', frames: 16 },
  },
};

const AQUARIS_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/aquaris/',
  frameW: 256, frameH: 256,
  anims: {
    front_idle:   { file: 'Water_boss-iso_idle_down-v1.webp',         frames: 16 },
    back_idle:    { file: 'Water_boss-iso_idle_up-v1.webp',           frames: 16 },
    left_idle:    { file: 'Water_boss-iso_idle_right-v1.webp',        frames: 16 },
    right_idle:   { file: 'Water_boss-iso_idle_right-v1.webp',        frames: 16 },
    front_walk:   { file: 'Water_boss-iso_walk_down-v1.webp',         frames: 16 },
    back_walk:    { file: 'Water_boss-iso_walk_up-v1.webp',           frames: 16 },
    left_walk:    { file: 'Water_boss-iso_walk_right-v1.webp',        frames: 16 },
    right_walk:   { file: 'Water_boss-iso_walk_right-v1.webp',        frames: 16 },
    front_attack: { file: 'Water_boss-iso_custom_cast_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'Water_boss-iso_custom_cast_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'Water_boss-iso_custom_cast_right-v1.webp', frames: 16 },
    right_attack: { file: 'Water_boss-iso_custom_cast_right-v1.webp', frames: 16 },
    dying:        { file: 'Water_boss-iso_custom_death_down-v1.webp', frames: 16 },
  },
};

const TERRA_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/terra/',
  frameW: 256, frameH: 256,
  anims: {
    front_idle:   { file: 'Earth_boss-iso_idle_down-v1.webp',         frames: 16 },
    back_idle:    { file: 'Earth_boss-iso_idle_up-v1.webp',           frames: 16 },
    left_idle:    { file: 'Earth_boss-iso_idle_right-v1.webp',        frames: 16 },
    right_idle:   { file: 'Earth_boss-iso_idle_right-v1.webp',        frames: 16 },
    front_walk:   { file: 'Earth_boss-iso_walk_down-v1.webp',         frames: 16 },
    back_walk:    { file: 'Earth_boss-iso_walk_up-v1.webp',           frames: 16 },
    left_walk:    { file: 'Earth_boss-iso_walk_right-v1.webp',        frames: 16 },
    right_walk:   { file: 'Earth_boss-iso_walk_right-v1.webp',        frames: 16 },
    front_attack: { file: 'Earth_boss-iso_custom_cast_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'Earth_boss-iso_custom_cast_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'Earth_boss-iso_custom_cast_right-v1.webp', frames: 16 },
    right_attack: { file: 'Earth_boss-iso_custom_cast_right-v1.webp', frames: 16 },
    dying:        { file: 'Earth_boss-iso_custom_death_down-v1.webp', frames: 16 },
  },
};

const AEROS_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/aeros/',
  frameW: 256, frameH: 256,
  anims: {
    front_idle:   { file: 'Air_boss-iso_idle_down-v1.webp',         frames: 16 },
    back_idle:    { file: 'Air_boss-iso_idle_up-v1.webp',           frames: 16 },
    left_idle:    { file: 'Air_boss-iso_idle_right-v1.webp',        frames: 16 },
    right_idle:   { file: 'Air_boss-iso_idle_right-v1.webp',        frames: 16 },
    front_walk:   { file: 'Air_boss-iso_walk_down-v1.webp',         frames: 16 },
    back_walk:    { file: 'Air_boss-iso_walk_up-v1.webp',           frames: 16 },
    left_walk:    { file: 'Air_boss-iso_walk_right-v1.webp',        frames: 16 },
    right_walk:   { file: 'Air_boss-iso_walk_right-v1.webp',        frames: 16 },
    front_attack: { file: 'Air_boss-iso_custom_cast_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'Air_boss-iso_custom_cast_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'Air_boss-iso_custom_cast_right-v1.webp', frames: 16 },
    right_attack: { file: 'Air_boss-iso_custom_cast_right-v1.webp', frames: 16 },
    dying:        { file: 'Air_boss-iso_custom_death_down-v1.webp', frames: 16 },
  },
};

const ELDER_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/elder/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'Elder-iso_idle_down-v1.webp',          frames: 16 },
    back_idle:    { file: 'Elder-iso_idle_up-v1.webp',            frames: 16 },
    left_idle:    { file: 'Elder-iso_idle_right-v1.webp',         frames: 16 },
    right_idle:   { file: 'Elder-iso_idle_right-v1.webp',         frames: 16 },
    front_walk:   { file: 'Elder-iso_walk_down-v1.webp',          frames: 16 },
    back_walk:    { file: 'Elder-iso_walk_up-v1.webp',            frames: 16 },
    left_walk:    { file: 'Elder-iso_walk_right-v1.webp',         frames: 16 },
    right_walk:   { file: 'Elder-iso_walk_right-v1.webp',         frames: 16 },
    front_attack: { file: 'Elder-iso_custom_punch_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'Elder-iso_custom_punch_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'Elder-iso_custom_punch_right-v1.webp', frames: 16 },
    right_attack: { file: 'Elder-iso_custom_punch_right-v1.webp', frames: 16 },
    dying:        { file: 'Elder-iso_custom_death_down-v1.webp',  frames: 16 },
  },
};

const BEAR_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/bear/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'bear-iso_idle_down-v1.webp',         frames: 16 },
    back_idle:    { file: 'bear-iso_idle_up-v1.webp',           frames: 16 },
    left_idle:    { file: 'bear-iso_idle_right-v1.webp',        frames: 16 },
    right_idle:   { file: 'bear-iso_idle_right-v1.webp',        frames: 16 },
    front_walk:   { file: 'bear-iso_walk_down-v1.webp',         frames: 16 },
    back_walk:    { file: 'bear-iso_walk_up-v1.webp',           frames: 16 },
    left_walk:    { file: 'bear-iso_walk_right-v1.webp',        frames: 16 },
    right_walk:   { file: 'bear-iso_walk_right-v1.webp',        frames: 16 },
    front_attack: { file: 'bear-iso_custom_bite_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'bear-iso_custom_bite_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'bear-iso_custom_bite_right-v1.webp', frames: 16 },
    right_attack: { file: 'bear-iso_custom_bite_right-v1.webp', frames: 16 },
    dying:        { file: 'bear-iso_custom_death_down-v1.webp', frames: 16 },
  },
};

const BANDIT_ARCHER_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/bandit_archer/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'bandit_female_archer-iso_idle_down-v2.webp',                  frames: 16 },
    back_idle:    { file: 'bandit_female_archer-iso_idle_up-v2.webp',                    frames: 16 },
    left_idle:    { file: 'bandit_female_archer-iso_idle_right-v2.webp',                 frames: 16 },
    right_idle:   { file: 'bandit_female_archer-iso_idle_right-v2.webp',                 frames: 16 },
    front_walk:   { file: 'bandit_female_archer-iso_walk_down-v2.webp',                  frames: 16 },
    back_walk:    { file: 'bandit_female_archer-iso_walk_up-v2.webp',                    frames: 16 },
    left_walk:    { file: 'bandit_female_archer-iso_walk_right-v2.webp',                 frames: 16 },
    right_walk:   { file: 'bandit_female_archer-iso_walk_right-v2.webp',                 frames: 16 },
    front_attack: { file: 'bandit_female_archer-iso_custom_shoots_a_bow_down-v2.webp',   frames: 16 },
    back_attack:  { file: 'bandit_female_archer-iso_custom_shoots_a_bow_up-v2.webp',     frames: 16 },
    left_attack:  { file: 'bandit_female_archer-iso_custom_shoots_a_bow_right-v2.webp',  frames: 16 },
    right_attack: { file: 'bandit_female_archer-iso_custom_shoots_a_bow_right-v2.webp',  frames: 16 },
    dying:        { file: 'bandit_female_archer-iso_custom_death_down-v2.webp',          frames: 16 },
  },
};

const BANDIT_SPEAR_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/bandit_spear/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'Bandit_spear-iso_idle_down-v1.webp',                      frames: 16 },
    back_idle:    { file: 'Bandit_spear-iso_idle_up-v1.webp',                        frames: 16 },
    left_idle:    { file: 'Bandit_spear-iso_idle_right-v1.webp',                     frames: 16 },
    right_idle:   { file: 'Bandit_spear-iso_idle_right-v1.webp',                     frames: 16 },
    front_walk:   { file: 'Bandit_spear-iso_walk_down-v1.webp',                      frames: 16 },
    back_walk:    { file: 'Bandit_spear-iso_walk_up-v1.webp',                        frames: 16 },
    left_walk:    { file: 'Bandit_spear-iso_walk_right-v1.webp',                     frames: 16 },
    right_walk:   { file: 'Bandit_spear-iso_walk_right-v1.webp',                     frames: 16 },
    front_attack: { file: 'Bandit_spear-iso_custom_attack_with_spear_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'Bandit_spear-iso_custom_attack_with_spear_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'Bandit_spear-iso_custom_attack_with_spear_right-v1.webp', frames: 16 },
    right_attack: { file: 'Bandit_spear-iso_custom_attack_with_spear_right-v1.webp', frames: 16 },
    dying:        { file: 'Bandit_spear-iso_custom_death_down-v1.webp',              frames: 16 },
  },
};

const BANDIT_BRUTE_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/bandit_brute/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'bandit_hammer-iso_idle_down-v1.webp',                          frames: 16 },
    back_idle:    { file: 'bandit_hammer-iso_idle_up-v1.webp',                            frames: 16 },
    left_idle:    { file: 'bandit_hammer-iso_idle_right-v1.webp',                         frames: 16 },
    right_idle:   { file: 'bandit_hammer-iso_idle_right-v1.webp',                         frames: 16 },
    front_walk:   { file: 'bandit_hammer-iso_walk_down-v1.webp',                          frames: 16 },
    back_walk:    { file: 'bandit_hammer-iso_walk_up-v1.webp',                            frames: 16 },
    left_walk:    { file: 'bandit_hammer-iso_walk_right-v1.webp',                         frames: 16 },
    right_walk:   { file: 'bandit_hammer-iso_walk_right-v1.webp',                         frames: 16 },
    front_attack: { file: 'bandit_hammer-iso_custom_attack_with_his_hammer_down-v1.webp', frames: 16 },
    back_attack:  { file: 'bandit_hammer-iso_custom_attack_with_his_hammer_up-v1.webp',   frames: 16 },
    left_attack:  { file: 'bandit_hammer-iso_custom_attack_with_his_hammer_right-v1.webp',frames: 16 },
    right_attack: { file: 'bandit_hammer-iso_custom_attack_with_his_hammer_right-v1.webp',frames: 16 },
    dying:        { file: 'bandit_hammer-iso_custom_death_down-v1.webp',                  frames: 16 },
  },
};

const SCOUT_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/scout/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'Scout_shortbow-iso_idle_down-v1.webp',          frames: 16 },
    back_idle:    { file: 'Scout_shortbow-iso_idle_up-v1.webp',            frames: 16 },
    left_idle:    { file: 'Scout_shortbow-iso_idle_right-v1.webp',         frames: 16 },
    right_idle:   { file: 'Scout_shortbow-iso_idle_right-v1.webp',         frames: 16 },
    front_walk:   { file: 'Scout_shortbow-iso_walk_down-v1.webp',          frames: 16 },
    back_walk:    { file: 'Scout_shortbow-iso_walk_up-v1.webp',            frames: 16 },
    left_walk:    { file: 'Scout_shortbow-iso_walk_right-v1.webp',         frames: 16 },
    right_walk:   { file: 'Scout_shortbow-iso_walk_right-v1.webp',         frames: 16 },
    front_attack: { file: 'Scout_shortbow-iso_custom_shoot_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'Scout_shortbow-iso_custom_shoot_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'Scout_shortbow-iso_custom_shoot_right-v1.webp', frames: 16 },
    right_attack: { file: 'Scout_shortbow-iso_custom_shoot_right-v1.webp', frames: 16 },
    dying:        { file: 'Scout_shortbow-iso_custom_death_down-v1.webp',  frames: 16 },
  },
};

const SWORDSMAN_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/swordsman/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'male_warrior-iso_idle_down-v1.webp',               frames: 16 },
    back_idle:    { file: 'male_warrior-iso_idle_up-v1.webp',                 frames: 16 },
    left_idle:    { file: 'male_warrior-iso_idle_right-v1.webp',              frames: 16 },
    right_idle:   { file: 'male_warrior-iso_idle_right-v1.webp',              frames: 16 },
    front_walk:   { file: 'male_warrior-iso_walk_down-v1.webp',               frames: 16 },
    back_walk:    { file: 'male_warrior-iso_walk_up-v1.webp',                 frames: 16 },
    left_walk:    { file: 'male_warrior-iso_walk_right-v1.webp',              frames: 16 },
    right_walk:   { file: 'male_warrior-iso_walk_right-v1.webp',              frames: 16 },
    front_attack: { file: 'male_warrior-iso_custom_attack_sword_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'male_warrior-iso_custom_attack_sword_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'male_warrior-iso_custom_attack_sword_right-v1.webp', frames: 16 },
    right_attack: { file: 'male_warrior-iso_custom_attack_sword_right-v1.webp', frames: 16 },
    dying:        { file: 'male_warrior-iso_custom_death_down-v1.webp',         frames: 16 },
  },
};

const ARCHER_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/archer/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'Female_Archer-iso_idle_down-v1.webp',                  frames: 16 },
    back_idle:    { file: 'Female_Archer-iso_idle_up-v1.webp',                    frames: 16 },
    left_idle:    { file: 'Female_Archer-iso_idle_right-v1.webp',                 frames: 16 },
    right_idle:   { file: 'Female_Archer-iso_idle_right-v1.webp',                 frames: 16 },
    front_walk:   { file: 'Female_Archer-iso_walk_down-v1.webp',                  frames: 16 },
    back_walk:    { file: 'Female_Archer-iso_walk_up-v1.webp',                    frames: 16 },
    left_walk:    { file: 'Female_Archer-iso_walk_right-v1.webp',                 frames: 16 },
    right_walk:   { file: 'Female_Archer-iso_walk_right-v1.webp',                 frames: 16 },
    front_attack: { file: 'Female_Archer-iso_custom_shooting_archer_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'Female_Archer-iso_custom_shooting_archer_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'Female_Archer-iso_custom_shooting_archer_right-v1.webp', frames: 16 },
    right_attack: { file: 'Female_Archer-iso_custom_shooting_archer_right-v1.webp', frames: 16 },
    dying:        { file: 'Female_Archer-iso_custom_death_down-v1.webp',          frames: 16 },
  },
};

const WIZARD_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/wizard/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'Female_wizard-iso_idle_down-v1.webp',                    frames: 16 },
    back_idle:    { file: 'Female_wizard-iso_idle_up-v1.webp',                      frames: 16 },
    left_idle:    { file: 'Female_wizard-iso_idle_right-v1.webp',                   frames: 16 },
    right_idle:   { file: 'Female_wizard-iso_idle_right-v1.webp',                   frames: 16 },
    front_walk:   { file: 'Female_wizard-iso_walk_down-v1.webp',                    frames: 16 },
    back_walk:    { file: 'Female_wizard-iso_walk_up-v1.webp',                      frames: 16 },
    left_walk:    { file: 'Female_wizard-iso_walk_right-v1.webp',                   frames: 16 },
    right_walk:   { file: 'Female_wizard-iso_walk_right-v1.webp',                   frames: 16 },
    front_attack: { file: 'Female_wizard-iso_custom_casting_spell_down-v1.webp',    frames: 16 },
    back_attack:  { file: 'Female_wizard-iso_custom_casting_spell_up-v1.webp',      frames: 16 },
    left_attack:  { file: 'Female_wizard-iso_custom_casting_spell_right-v1.webp',   frames: 16 },
    right_attack: { file: 'Female_wizard-iso_custom_casting_spell_right-v1.webp',   frames: 16 },
    dying:        { file: 'Female_wizard-iso_custom_death_down-v1.webp',            frames: 16 },
  },
};

const ORC_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/orc/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'orc_greatsword-iso_idle_down-v1.webp',              frames: 16 },
    back_idle:    { file: 'orc_greatsword-iso_idle_up-v1.webp',                frames: 16 },
    left_idle:    { file: 'orc_greatsword-iso_idle_right-v1.webp',             frames: 16 },
    right_idle:   { file: 'orc_greatsword-iso_idle_right-v1.webp',             frames: 16 },
    front_walk:   { file: 'orc_greatsword-iso_walk_down-v1.webp',              frames: 16 },
    back_walk:    { file: 'orc_greatsword-iso_walk_up-v1.webp',                frames: 16 },
    left_walk:    { file: 'orc_greatsword-iso_walk_right-v1.webp',             frames: 16 },
    right_walk:   { file: 'orc_greatsword-iso_walk_right-v1.webp',             frames: 16 },
    front_attack: { file: 'orc_greatsword-iso_custom_attack_gs_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'orc_greatsword-iso_custom_attack_gs_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'orc_greatsword-iso_custom_attack_gs_right-v1.webp', frames: 16 },
    right_attack: { file: 'orc_greatsword-iso_custom_attack_gs_right-v1.webp', frames: 16 },
    dying:        { file: 'orc_greatsword-iso_custom_death_down-v1.webp',      frames: 16 },
  },
};

const BANDIT_CROSSBOW_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/bandit_crossbow/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'Bandit_crossbow-iso_idle_down-v1.webp',              frames: 16 },
    back_idle:    { file: 'Bandit_crossbow-iso_idle_up-v1.webp',                frames: 16 },
    left_idle:    { file: 'Bandit_crossbow-iso_idle_right-v1.webp',             frames: 16 },
    right_idle:   { file: 'Bandit_crossbow-iso_idle_right-v1.webp',             frames: 16 },
    front_walk:   { file: 'Bandit_crossbow-iso_walk_down-v1.webp',              frames: 16 },
    back_walk:    { file: 'Bandit_crossbow-iso_walk_up-v1.webp',                frames: 16 },
    left_walk:    { file: 'Bandit_crossbow-iso_walk_right-v1.webp',             frames: 16 },
    right_walk:   { file: 'Bandit_crossbow-iso_walk_right-v1.webp',             frames: 16 },
    front_attack: { file: 'Bandit_crossbow-iso_custom_shooting_down-v1.webp',   frames: 16 },
    back_attack:  { file: 'Bandit_crossbow-iso_custom_shooting_up-v1.webp',     frames: 16 },
    left_attack:  { file: 'Bandit_crossbow-iso_custom_shooting_right-v1.webp',  frames: 16 },
    right_attack: { file: 'Bandit_crossbow-iso_custom_shooting_right-v1.webp',  frames: 16 },
    dying:        { file: 'Bandit_crossbow-iso_custom_death_down-v1.webp',      frames: 16 },
  },
};

const CARAVAN_GUARD_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/caravan_guard/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'Caravan_guard-iso_idle_down-v1.webp',                 frames: 16 },
    back_idle:    { file: 'Caravan_guard-iso_idle_up-v1.webp',                   frames: 16 },
    left_idle:    { file: 'Caravan_guard-iso_idle_right-v1.webp',                frames: 16 },
    right_idle:   { file: 'Caravan_guard-iso_idle_right-v1.webp',                frames: 16 },
    front_walk:   { file: 'Caravan_guard-iso_walk_down-v1.webp',                 frames: 16 },
    back_walk:    { file: 'Caravan_guard-iso_walk_up-v1.webp',                   frames: 16 },
    left_walk:    { file: 'Caravan_guard-iso_walk_right-v1.webp',                frames: 16 },
    right_walk:   { file: 'Caravan_guard-iso_walk_right-v1.webp',                frames: 16 },
    front_attack: { file: 'Caravan_guard-iso_custom_spear_attack_down-v1.webp',  frames: 16 },
    back_attack:  { file: 'Caravan_guard-iso_custom_spear_attack_up-v1.webp',    frames: 16 },
    left_attack:  { file: 'Caravan_guard-iso_custom_spear_attack_right-v1.webp', frames: 16 },
    right_attack: { file: 'Caravan_guard-iso_custom_spear_attack_right-v1.webp', frames: 16 },
    dying:        { file: 'Caravan_guard-iso_custom_death_down-v1.webp',         frames: 16 },
  },
};

const CARAVAN_MERCHANT_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/caravan_merchant/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:   { file: 'Caravan_merchant-iso_idle_down-v1.webp',                          frames: 16 },
    back_idle:    { file: 'Caravan_merchant-iso_idle_up-v1.webp',                            frames: 16 },
    left_idle:    { file: 'Caravan_merchant-iso_idle_right-v1.webp',                         frames: 16 },
    right_idle:   { file: 'Caravan_merchant-iso_idle_right-v1.webp',                         frames: 16 },
    front_walk:   { file: 'Caravan_merchant-iso_walk_down-v1.webp',                          frames: 16 },
    back_walk:    { file: 'Caravan_merchant-iso_walk_up-v1.webp',                            frames: 16 },
    left_walk:    { file: 'Caravan_merchant-iso_walk_right-v1.webp',                         frames: 16 },
    right_walk:   { file: 'Caravan_merchant-iso_walk_right-v1.webp',                         frames: 16 },
    front_attack: { file: 'Caravan_merchant-iso_custom_casting_a_heal_spell_down-v1.webp',   frames: 16 },
    back_attack:  { file: 'Caravan_merchant-iso_custom_casting_a_heal_spell_up-v1.webp',     frames: 16 },
    left_attack:  { file: 'Caravan_merchant-iso_custom_casting_a_heal_spell_right-v1.webp',  frames: 16 },
    right_attack: { file: 'Caravan_merchant-iso_custom_casting_a_heal_spell_right-v1.webp',  frames: 16 },
    dying:        { file: 'Caravan_merchant-iso_custom_death_down-v1.webp',                  frames: 16 },
  },
};

export const MOB_SPRITE_SETS: Record<string, MobSpriteSet> = {
  goblin: GOBLIN_SPRITES,
  goblin_veteran: GOBLIN_VETERAN_SPRITES,
  scout: SCOUT_SPRITES,
  scout_veteran: SCOUT_SPRITES,
  swordsman: SWORDSMAN_SPRITES,
  archer: ARCHER_SPRITES,
  wizard: WIZARD_SPRITES,
  orc: ORC_SPRITES,
  orc_veteran: ORC_SPRITES,
  shaman: SHAMAN_SPRITES,
  spirit_wolf: SHAMAN_SPRITES,
  bear: BEAR_SPRITES,
  bear_veteran: BEAR_SPRITES,
  wolf: WOLF_SPRITES,
  wolf_veteran: WOLF_SPRITES,
  monk: MONK_SPRITES,
  elder: ELDER_SPRITES,
  ignis: IGNIS_SPRITES,
  aquaris: AQUARIS_SPRITES,
  terra: TERRA_SPRITES,
  aeros: AEROS_SPRITES,
  bandit_archer: BANDIT_ARCHER_SPRITES,
  bandit_archer_veteran: BANDIT_ARCHER_SPRITES,
  bandit_spear: BANDIT_SPEAR_SPRITES,
  bandit_brute: BANDIT_BRUTE_SPRITES,
  bandit_brute_veteran: BANDIT_BRUTE_SPRITES,
  bandit_crossbow: BANDIT_CROSSBOW_SPRITES,
  bandit_crossbow_veteran: BANDIT_CROSSBOW_SPRITES,
  caravan_guard: CARAVAN_GUARD_SPRITES,
  caravan_merchant: CARAVAN_MERCHANT_SPRITES,
};

/**
 * Animal sprites: single spritesheet per animation, rows = directions.
 * Row order: down(0), up(1), left(2), right(3). Frame size: 32×32.
 */
export interface AnimalSpriteSet {
  folder: string;
  frameW: number;
  frameH: number;
  sheets: Record<string, { file: string; cols: number }>;
}

const ANIMAL_DIR = 'assets/mobs/animals/';

export const ANIMAL_SPRITE_SETS: Record<string, AnimalSpriteSet> = {
  hare: {
    folder: ANIMAL_DIR + 'Hare/', frameW: 32, frameH: 32,
    sheets: {
      idle: { file: 'Hare_Idle_with_shadow.webp', cols: 4 },
      walk: { file: 'Hare_Walk_with_shadow.webp', cols: 5 },
      run:  { file: 'Hare_Run_with_shadow.webp', cols: 6 },
      death:{ file: 'Hare_Death_with_shadow.webp', cols: 6 },
    },
  },
  deer: {
    folder: ANIMAL_DIR + 'Deer/', frameW: 32, frameH: 32,
    sheets: {
      idle: { file: 'Deer_Idle_with_shadow.webp', cols: 4 },
      walk: { file: 'Deer_Walk_with_shadow.webp', cols: 6 },
      run:  { file: 'Deer_Run_with_shadow.webp', cols: 6 },
      death:{ file: 'Deer_Death_with_shadow.webp', cols: 7 },
    },
  },
  fox: {
    folder: ANIMAL_DIR + 'Fox/', frameW: 32, frameH: 32,
    sheets: {
      idle: { file: 'Fox_Idle_with_shadow.webp', cols: 4 },
      walk: { file: 'Fox_walk_with_shadow.webp', cols: 6 },
      run:  { file: 'Fox_Run_with_shadow.webp', cols: 6 },
      death:{ file: 'Fox_Death_with_shadow.webp', cols: 6 },
    },
  },
  boar: {
    folder: ANIMAL_DIR + 'Boar/', frameW: 32, frameH: 32,
    sheets: {
      idle:   { file: 'Boar_Idle_with_shadow.webp', cols: 4 },
      walk:   { file: 'Boar_Walk_with_shadow.webp', cols: 6 },
      run:    { file: 'Boar_Run_with_shadow.webp', cols: 5 },
      attack: { file: 'Boar_Attack_with_shadow.webp', cols: 5 },
      death:  { file: 'Boar_Death_with_shadow.webp', cols: 6 },
    },
  },
  grouse: {
    folder: ANIMAL_DIR + 'Black_grouse/', frameW: 32, frameH: 32,
    sheets: {
      idle: { file: 'Black_grouse_Idle_with_shadow.webp', cols: 4 },
      walk: { file: 'Black_grouse_Walk_with_shadow.webp', cols: 6 },
      death:{ file: 'Black_grouse_Death_with_shadow.webp', cols: 6 },
    },
  },

  // ── Элементали-слаймы (4 направления, 64×64) ────────────────────────────
  slime_fire: {
    folder: 'assets/mobs/slime_fire/', frameW: 64, frameH: 64,
    sheets: {
      idle:   { file: 'idle.webp',   cols: 6 },
      walk:   { file: 'walk.webp',   cols: 8 },
      attack: { file: 'attack.webp', cols: 10 },
      death:  { file: 'death.webp',  cols: 10 },
    },
  },
  slime_water: {
    folder: 'assets/mobs/slime_water/', frameW: 64, frameH: 64,
    sheets: {
      idle:   { file: 'idle.webp',   cols: 6 },
      walk:   { file: 'walk.webp',   cols: 8 },
      attack: { file: 'attack.webp', cols: 10 },
      death:  { file: 'death.webp',  cols: 10 },
    },
  },
  slime_earth: {
    folder: 'assets/mobs/slime_earth/', frameW: 64, frameH: 64,
    sheets: {
      idle:   { file: 'idle.webp',   cols: 6 },
      walk:   { file: 'walk.webp',   cols: 8 },
      attack: { file: 'attack.webp', cols: 9 },
      death:  { file: 'death.webp',  cols: 10 },
    },
  },
  slime_air: {
    folder: 'assets/mobs/slime_air/', frameW: 64, frameH: 64,
    sheets: {
      idle:   { file: 'idle.webp',   cols: 6 },
      walk:   { file: 'walk.webp',   cols: 8 },
      attack: { file: 'attack.webp', cols: 10 },
      death:  { file: 'death.webp',  cols: 10 },
    },
  },
};

/** Bestiary preview helpers — render first idle frame as static thumbnail */
export interface BestiaryPreviewMeta {
  url: string;
  frameW: number;
  frameH: number;
  sheetCols: number;
  sheetRows: number;
}

const ANIMAL_ALIAS: Record<string, string> = {
  spark: 'slime_fire',    asher: 'slime_fire',
  splasher: 'slime_water', fogger: 'slime_water',
  pebble: 'slime_earth',   mudder: 'slime_earth',
  gusty: 'slime_air',      whistler: 'slime_air',
};

const MOB_ALIAS: Record<string, string> = {
  scout_veteran: 'scout',
  bandit_archer_veteran: 'bandit_archer',
  bandit_brute_veteran: 'bandit_brute',
  bandit_crossbow_veteran: 'bandit_crossbow',
  goblin_veteran: 'goblin_veteran',
  orc_veteran: 'orc',
  bear_veteran: 'bear',
  wolf_veteran: 'wolf',
  spirit_wolf: 'shaman',
  // Starter bodies share their class sprite
  human_warrior: 'swordsman',
  human_archer: 'archer',
  human_mage: 'wizard',
};

export function getBestiaryPreview(creatureId: string): BestiaryPreviewMeta | null {
  const mobKey = MOB_SPRITE_SETS[creatureId] ? creatureId : MOB_ALIAS[creatureId];
  if (mobKey && MOB_SPRITE_SETS[mobKey]) {
    const set = MOB_SPRITE_SETS[mobKey];
    const idle = set.anims['front_idle'];
    if (idle) {
      return { url: '/' + set.folder + idle.file, frameW: set.frameW, frameH: set.frameH, sheetCols: 4, sheetRows: 4 };
    }
  }
  const animalKey = ANIMAL_SPRITE_SETS[creatureId] ? creatureId : ANIMAL_ALIAS[creatureId];
  if (animalKey && ANIMAL_SPRITE_SETS[animalKey]) {
    const set = ANIMAL_SPRITE_SETS[animalKey];
    const idle = set.sheets.idle;
    if (idle) {
      return { url: '/' + set.folder + idle.file, frameW: set.frameW, frameH: set.frameH, sheetCols: idle.cols, sheetRows: 4 };
    }
  }
  return null;
}

export function applyBestiaryPreview(el: HTMLElement, preview: BestiaryPreviewMeta, tileSize: number): void {
  const scaleX = tileSize / preview.frameW;
  const scaleY = tileSize / preview.frameH;
  el.style.backgroundImage = `url('${preview.url}')`;
  el.style.backgroundSize = `${preview.sheetCols * preview.frameW * scaleX}px ${preview.sheetRows * preview.frameH * scaleY}px`;
  el.style.backgroundPosition = '0 0';
  el.style.backgroundRepeat = 'no-repeat';
  el.style.imageRendering = 'pixelated';
}

/** Масштаб — ассеты большие (~200-500px), в игре нужно мельче. */
export const CP_SCALE = {
  ground: 0.125,   // 256px → 32px тайл
  tree:   0.18,
  bush:   0.20,
  rock:   0.20,
  house:  0.18,
  tower:  0.18,
  castle: 0.22,
  prop:   0.20,
  bridge: 0.25,
  fence:  0.20,
  well:   0.20,
  windmill: 0.22,
} as const;
