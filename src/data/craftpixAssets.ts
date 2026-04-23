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
