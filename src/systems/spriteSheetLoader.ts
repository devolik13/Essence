/**
 * Loads our public/*.svg sprite sheets and registers each <symbol> as a
 * Phaser texture, so canvas-rendered UI (skill bar) can show them as Images.
 *
 * Texture key format: "spritesvg_<symbolId>" (e.g. "spritesvg_icon_sword").
 */
import Phaser from 'phaser';

const SPRITE_SHEETS = [
  'weapons.svg',
  'armor.svg',
  'spells.svg',
  'weapon-abilities.svg',
  'neutral-abilities.svg',
];

const RENDER_SIZE = 96; // px — large enough to look sharp at 32-48px slot icons

/**
 * Build a standalone SVG document for a single <symbol> by inlining all <defs>
 * (gradients, filters) from its parent sheet.
 */
function buildStandaloneSvg(symbol: Element, defsHtml: string): string {
  const viewBox = symbol.getAttribute('viewBox') || '0 0 156 156';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${RENDER_SIZE}" height="${RENDER_SIZE}">${defsHtml}${symbol.innerHTML}</svg>`;
}

/** UTF-8 safe base64 (без устаревшего unescape). */
function toDataUri(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return `data:image/svg+xml;base64,${btoa(bin)}`;
}

async function loadSheet(scene: Phaser.Scene, file: string): Promise<void> {
  const text = await fetch(`/${file}`).then(r => r.text());
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const defs = doc.querySelector('defs');
  const defsHtml = defs ? defs.outerHTML : '';
  const symbols = Array.from(doc.querySelectorAll('symbol'));

  await Promise.all(symbols.map(sym => {
    const id = sym.getAttribute('id');
    if (!id) return Promise.resolve();
    const key = `spritesvg_${id}`;
    if (scene.textures.exists(key)) return Promise.resolve();
    const dataUri = toDataUri(buildStandaloneSvg(sym, defsHtml));
    return new Promise<void>(resolve => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        scene.textures.off(Phaser.Textures.Events.ADD, onAdd);
        scene.textures.off(Phaser.Textures.Events.ERROR, onErr);
        clearTimeout(timer);
        resolve();
      };
      // Резолвим и на ADD (успех), и на ERROR (битый SVG не должен вешать загрузку).
      const onAdd = (addedKey: string) => { if (addedKey === key) finish(); };
      const onErr = (errKey: string) => { if (errKey === key) finish(); };
      scene.textures.on(Phaser.Textures.Events.ADD, onAdd);
      scene.textures.on(Phaser.Textures.Events.ERROR, onErr);
      // Страховка: если событие так и не пришло — не виснем на загрузке навсегда.
      const timer = setTimeout(finish, 5000);
      scene.textures.addBase64(key, dataUri);
    });
  }));
}

export async function loadAllSpriteSheets(scene: Phaser.Scene): Promise<void> {
  await Promise.all(SPRITE_SHEETS.map(file => loadSheet(scene, file)));
}

/** Phaser texture key for a given sprite symbol id. */
export function spriteTextureKey(symbolId: string): string {
  return `spritesvg_${symbolId}`;
}
