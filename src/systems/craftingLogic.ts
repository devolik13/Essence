/**
 * Чистая логика крафта/торговли/разбора — оперирует Sphere (данными), без сцены/UI.
 * GameScene вызывает эти функции и сам делает сообщения/звуки/события/сохранение.
 * Вынесено из GameScene для уменьшения размера сцены и тестируемости.
 */
import { Sphere } from '../entities/Sphere';
import { lt } from '../i18n';
import { RECIPES, ITEMS } from '../data/itemDB';
import { RecipeDef } from '../types/items';
import { formatCurrency } from './currency';

export interface EconResult {
  ok: boolean;
  /** Сообщение для показа игроку (пустое — ничего не показывать). */
  msg: string;
}

/** Купить рецепт у торговца. */
export function buyRecipe(sphere: Sphere, recipeId: string, price: number): EconResult {
  if (sphere.copper < price) return { ok: false, msg: `Not enough coins! Need ${formatCurrency(price)}` };
  if (sphere.learnedRecipes.includes(recipeId)) return { ok: false, msg: 'Already known' };
  sphere.copper -= price;
  sphere.learnedRecipes.push(recipeId);
  return { ok: true, msg: `Learned recipe! -${formatCurrency(price)}` };
}

/** Купить сырьё у торговца (нитки/заклёпки и т.п.). */
export function buyMaterial(sphere: Sphere, itemId: string, qty: number, price: number): EconResult {
  if (sphere.copper < price) return { ok: false, msg: `Not enough coins! Need ${formatCurrency(price)}` };
  sphere.copper -= price;
  sphere.addItem(itemId, qty);
  return { ok: true, msg: `+${qty}× ${ITEMS[itemId] ? lt(ITEMS[itemId].nameRu, ITEMS[itemId].nameEn) : itemId}  -${formatCurrency(price)}` };
}

/** Списать материалы рецепта из инвентаря (старт крафта). */
export function consumeCraftMaterials(sphere: Sphere, recipe: RecipeDef): void {
  for (const [itemId, qty] of Object.entries(recipe.materials)) {
    const inv = sphere.inventory.find(i => i.itemId === itemId);
    if (inv) inv.quantity -= qty;
  }
  sphere.inventory = sphere.inventory.filter(i => i.quantity > 0);
}

/** Положить результат крафта в инвентарь (завершение крафта). */
export function completeCraft(sphere: Sphere, recipe: RecipeDef): void {
  const existing = sphere.inventory.find(i => i.itemId === recipe.resultId);
  if (existing) existing.quantity += recipe.resultQty;
  else sphere.inventory.push({ itemId: recipe.resultId, quantity: recipe.resultQty });
}

/** Разобрать предмет — вернуть 50% материалов, снять с экипировки. */
export function disassemble(sphere: Sphere, itemId: string): EconResult {
  const inv = sphere.inventory.find(i => i.itemId === itemId);
  if (!inv || inv.quantity <= 0) return { ok: false, msg: '' };

  const recipe = RECIPES.find(r => r.resultId === itemId);
  if (!recipe) return { ok: false, msg: 'Cannot disassemble this item' };

  inv.quantity -= 1;
  if (inv.quantity <= 0) sphere.inventory = sphere.inventory.filter(i => i.quantity > 0);

  // Снять с экипировки, если надето
  const equip = sphere.equipment as Record<string, string | undefined>;
  for (const key of Object.keys(equip)) {
    if (equip[key] === itemId) equip[key] = undefined;
  }

  // Вернуть 50% материалов
  const returned: string[] = [];
  for (const [matId, qty] of Object.entries(recipe.materials)) {
    const returnQty = Math.max(1, Math.floor(qty * 0.5));
    const existing = sphere.inventory.find(i => i.itemId === matId);
    if (existing) existing.quantity += returnQty;
    else sphere.inventory.push({ itemId: matId, quantity: returnQty });
    returned.push(`${returnQty}x ${ITEMS[matId] ? lt(ITEMS[matId].nameRu, ITEMS[matId].nameEn) : matId}`);
  }

  return { ok: true, msg: `Disassembled! Got: ${returned.join(', ')}` };
}
