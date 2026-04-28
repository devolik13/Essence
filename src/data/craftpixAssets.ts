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
    return [`cp_ground_${num}`, `${FOLDER}${GROUND}${num}.png`] as [string, string];
  }),

  // Props
  ['cp_banner_blue',    `${FOLDER}${PROP}Blue Banner.png`],
  ['cp_bush_lg',        `${FOLDER}${PROP}Bushes Large.png`],
  ['cp_bush_md',        `${FOLDER}${PROP}Bushes Medium.png`],
  ['cp_bush_sm',        `${FOLDER}${PROP}Bushes Small.png`],
  ['cp_campfire',       `${FOLDER}${PROP}Campfire.png`],
  ['cp_castle_round',   `${FOLDER}${PROP}Castle Round.png`],
  ['cp_castle_square',  `${FOLDER}${PROP}Castle Square.png`],
  ['cp_flag',           `${FOLDER}${PROP}Flag.png`],
  ['cp_house',          `${FOLDER}${PROP}House.png`],
  ['cp_mage_tower',     `${FOLDER}${PROP}Magic Stone Tower.png`],
  ['cp_banner_red',     `${FOLDER}${PROP}Red Banner.png`],
  ['cp_rock_01',        `${FOLDER}${PROP}Rock 01.png`],
  ['cp_rock_02',        `${FOLDER}${PROP}Rock 02.png`],
  ['cp_rock_03',        `${FOLDER}${PROP}Rock 03.png`],
  ['cp_rock_04',        `${FOLDER}${PROP}Rock 04.png`],
  ['cp_rock_05',        `${FOLDER}${PROP}Rock 05.png`],
  ['cp_tent',           `${FOLDER}${PROP}Tent.png`],
  ['cp_chest',          `${FOLDER}${PROP}Treasure Chest.png`],
  ['cp_tree_md',        `${FOLDER}${PROP}Tree Medium.png`],
  ['cp_tree_sm',        `${FOLDER}${PROP}Tree Small.png`],
  ['cp_stump_short',    `${FOLDER}${PROP}Tree Stump Short.png`],
  ['cp_stump_tall',     `${FOLDER}${PROP}Tree Stump Tall.png`],
  ['cp_watch_short',    `${FOLDER}${PROP}Watchtower Short.png`],
  ['cp_watch_tall',     `${FOLDER}${PROP}Watchtower Tall.png`],
  ['cp_well',           `${FOLDER}${PROP}Well.png`],
  ['cp_windmill',       `${FOLDER}${PROP}Windmill.png`],
  ['cp_barrel',         `${FOLDER}${PROP}Wooden Barrel.png`],
  ['cp_bridge_h',       `${FOLDER}${PROP}Wooden Bridge Horizontal.png`],
  ['cp_bridge_v',       `${FOLDER}${PROP}Wooden Bridge Vertical.png`],
  ['cp_cart',           `${FOLDER}${PROP}Wooden Cart.png`],
  ['cp_fence_h',        `${FOLDER}${PROP}Wooden Fence Horizontal.png`],
  ['cp_fence_v',        `${FOLDER}${PROP}Wooden Fence Vertical.png`],
  // Tree Large с маленькой 'p' в "prop"
  ['cp_tree_lg',        `${FOLDER}${PREFIX}prop - Tree Large.png`],
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

/** Ассеты мобов для редактора карт. [key, path, frameWidth, frameHeight] */
export const MOB_ASSETS: Array<[string, string, number, number]> = [
  ['mob_goblin',         'assets/mobs/goblin/front_idle.png', 480, 480],
  ['mob_goblin_veteran', 'assets/mobs/goblin/front_idle.png', 480, 480],
  ['mob_ranger',         'assets/mobs/ranger/front_idle.png', 900, 900],
  ['mob_ranger_archer',  'assets/mobs/ranger_archer/front_idle.png', 900, 900],
  ['mob_ranger_pike',    'assets/mobs/ranger_pike/front_idle.png', 900, 900],
  ['mob_hare',           'assets/mobs/animals/Hare/Hare_Idle_with_shadow.png', 32, 32],
  ['mob_deer',           'assets/mobs/animals/Deer/Deer_Idle_with_shadow.png', 32, 32],
  ['mob_fox',            'assets/mobs/animals/Fox/Fox_Idle_with_shadow.png', 32, 32],
  ['mob_boar',           'assets/mobs/animals/Boar/Boar_Idle_with_shadow.png', 32, 32],
  ['mob_grouse',         'assets/mobs/animals/Black_grouse/Black_grouse_Idle_with_shadow.png', 32, 32],
];

export interface MobSpriteSet {
  folder: string;
  frameW: number;
  frameH: number;
  anims: Record<string, { file: string; frames: number; }>;
}

const GOBLIN_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/goblin/',
  frameW: 480, frameH: 480,
  anims: {
    front_idle:     { file: 'front_idle.png',     frames: 16 },
    front_walk:     { file: 'front_walking.png',  frames: 20 },
    front_attack:   { file: 'front_attacking.png', frames: 10 },
    back_idle:      { file: 'back_idle.png',      frames: 16 },
    back_walk:      { file: 'back_walking.png',   frames: 20 },
    back_attack:    { file: 'back_attacking.png',  frames: 10 },
    left_idle:      { file: 'left_idle.png',      frames: 16 },
    left_walk:      { file: 'left_walking.png',   frames: 20 },
    left_attack:    { file: 'left_attacking.png',  frames: 10 },
    right_idle:     { file: 'right_idle.png',     frames: 16 },
    right_walk:     { file: 'right_walking.png',  frames: 20 },
    right_attack:   { file: 'right_attacking.png', frames: 10 },
    dying:          { file: 'dying.png',          frames: 10 },
  },
};

const BANDIT_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/bandit/',
  frameW: 480, frameH: 480,
  anims: {
    front_idle:     { file: 'front_idle.png',      frames: 16 },
    front_walk:     { file: 'front_walking.png',   frames: 20 },
    front_attack:   { file: 'front_attacking.png', frames: 10 },
    back_idle:      { file: 'back_idle.png',       frames: 16 },
    back_walk:      { file: 'back_walking.png',    frames: 20 },
    back_attack:    { file: 'back_attacking.png',  frames: 10 },
    left_idle:      { file: 'left_idle.png',       frames: 16 },
    left_walk:      { file: 'left_walking.png',    frames: 20 },
    left_attack:    { file: 'left_attacking.png',  frames: 10 },
    right_idle:     { file: 'right_idle.png',      frames: 16 },
    right_walk:     { file: 'right_walking.png',   frames: 20 },
    right_attack:   { file: 'right_attacking.png', frames: 10 },
    dying:          { file: 'dying.png',           frames: 10 },
  },
};

const RANGER_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/ranger/',
  frameW: 900, frameH: 900,
  anims: {
    front_idle:     { file: 'front_idle.png',      frames: 18 },
    front_walk:     { file: 'front_walking.png',   frames: 24 },
    front_attack:   { file: 'front_attacking.png', frames: 9 },
    dying:          { file: 'dying.png',            frames: 15 },
  },
};

const RANGER_ARCHER_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/ranger_archer/',
  frameW: 900, frameH: 900,
  anims: {
    front_idle:     { file: 'front_idle.png',      frames: 18 },
    front_walk:     { file: 'front_walking.png',   frames: 24 },
    front_attack:   { file: 'front_attacking.png', frames: 12 },
    dying:          { file: 'dying.png',            frames: 15 },
  },
};

const RANGER_PIKE_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/ranger_pike/',
  frameW: 900, frameH: 900,
  anims: {
    front_idle:     { file: 'front_idle.png',      frames: 18 },
    front_walk:     { file: 'front_walking.png',   frames: 24 },
    front_attack:   { file: 'front_attacking.png', frames: 12 },
    dying:          { file: 'dying.png',            frames: 15 },
  },
};

const SWORDSMAN_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/swordsman/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:     { file: 'idle.png',    frames: 8 },
    front_walk:     { file: 'walk.png',    frames: 8 },
    front_attack:   { file: 'attack.png',  frames: 6 },
    dying:          { file: 'dead.png',    frames: 3 },
  },
};

const ARCHER_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/archer/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:     { file: 'idle.png',    frames: 6 },
    front_walk:     { file: 'walk.png',    frames: 8 },
    front_attack:   { file: 'attack.png',  frames: 14 },
    dying:          { file: 'dead.png',    frames: 3 },
  },
};

const WIZARD_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/wizard/',
  frameW: 128, frameH: 128,
  anims: {
    front_idle:     { file: 'idle.png',    frames: 6 },
    front_walk:     { file: 'walk.png',    frames: 7 },
    front_attack:   { file: 'attack.png',  frames: 10 },
    dying:          { file: 'dead.png',    frames: 4 },
  },
};

const ORC_SPRITES: MobSpriteSet = {
  folder: 'assets/mobs/orc/',
  frameW: 256, frameH: 256,
  anims: {
    front_idle:   { file: 'orc-idle-v1.webp',   frames: 25 },
    front_walk:   { file: 'orc-walk-v1.webp',   frames: 25 },
    front_attack: { file: 'orc-attack-v1.webp', frames: 25 },
    dying:        { file: 'orc-death-v1.webp',  frames: 25 },
  },
};

export const MOB_SPRITE_SETS: Record<string, MobSpriteSet> = {
  goblin: GOBLIN_SPRITES,
  goblin_veteran: GOBLIN_SPRITES,
  ranger: RANGER_SPRITES,
  ranger_archer: RANGER_ARCHER_SPRITES,
  ranger_pike: RANGER_PIKE_SPRITES,
  swordsman: SWORDSMAN_SPRITES,
  archer: ARCHER_SPRITES,
  wizard: WIZARD_SPRITES,
  orc: ORC_SPRITES,
  orc_veteran: ORC_SPRITES,
  bandit: BANDIT_SPRITES,
  bandit_veteran: BANDIT_SPRITES,
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
      idle: { file: 'Hare_Idle_with_shadow.png', cols: 4 },
      walk: { file: 'Hare_Walk_with_shadow.png', cols: 5 },
      run:  { file: 'Hare_Run_with_shadow.png', cols: 6 },
      death:{ file: 'Hare_Death_with_shadow.png', cols: 6 },
    },
  },
  deer: {
    folder: ANIMAL_DIR + 'Deer/', frameW: 32, frameH: 32,
    sheets: {
      idle: { file: 'Deer_Idle_with_shadow.png', cols: 4 },
      walk: { file: 'Deer_Walk_with_shadow.png', cols: 6 },
      run:  { file: 'Deer_Run_with_shadow.png', cols: 6 },
      death:{ file: 'Deer_Death_with_shadow.png', cols: 7 },
    },
  },
  fox: {
    folder: ANIMAL_DIR + 'Fox/', frameW: 32, frameH: 32,
    sheets: {
      idle: { file: 'Fox_Idle_with_shadow.png', cols: 4 },
      walk: { file: 'Fox_walk_with_shadow.png', cols: 6 },
      run:  { file: 'Fox_Run_with_shadow.png', cols: 6 },
      death:{ file: 'Fox_Death_with_shadow.png', cols: 6 },
    },
  },
  boar: {
    folder: ANIMAL_DIR + 'Boar/', frameW: 32, frameH: 32,
    sheets: {
      idle:   { file: 'Boar_Idle_with_shadow.png', cols: 4 },
      walk:   { file: 'Boar_Walk_with_shadow.png', cols: 6 },
      run:    { file: 'Boar_Run_with_shadow.png', cols: 5 },
      attack: { file: 'Boar_Attack_with_shadow.png', cols: 5 },
      death:  { file: 'Boar_Death_with_shadow.png', cols: 6 },
    },
  },
  grouse: {
    folder: ANIMAL_DIR + 'Black_grouse/', frameW: 32, frameH: 32,
    sheets: {
      idle: { file: 'Black_grouse_Idle_with_shadow.png', cols: 4 },
      walk: { file: 'Black_grouse_Walk_with_shadow.png', cols: 6 },
      death:{ file: 'Black_grouse_Death_with_shadow.png', cols: 6 },
    },
  },

  // ── Элементали-слаймы (4 направления, 64×64) ────────────────────────────
  slime_fire: {
    folder: 'assets/mobs/slime_fire/', frameW: 64, frameH: 64,
    sheets: {
      idle:   { file: 'idle.png',   cols: 6 },
      walk:   { file: 'walk.png',   cols: 8 },
      attack: { file: 'attack.png', cols: 10 },
      death:  { file: 'death.png',  cols: 10 },
    },
  },
  slime_water: {
    folder: 'assets/mobs/slime_water/', frameW: 64, frameH: 64,
    sheets: {
      idle:   { file: 'idle.png',   cols: 6 },
      walk:   { file: 'walk.png',   cols: 8 },
      attack: { file: 'attack.png', cols: 10 },
      death:  { file: 'death.png',  cols: 10 },
    },
  },
  slime_earth: {
    folder: 'assets/mobs/slime_earth/', frameW: 64, frameH: 64,
    sheets: {
      idle:   { file: 'idle.png',   cols: 6 },
      walk:   { file: 'walk.png',   cols: 8 },
      attack: { file: 'attack.png', cols: 10 },
      death:  { file: 'death.png',  cols: 10 },
    },
  },
  slime_air: {
    folder: 'assets/mobs/slime_air/', frameW: 64, frameH: 64,
    sheets: {
      idle:   { file: 'idle.png',   cols: 6 },
      walk:   { file: 'walk.png',   cols: 8 },
      attack: { file: 'attack.png', cols: 10 },
      death:  { file: 'death.png',  cols: 10 },
    },
  },
};

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
