import Phaser from 'phaser';
import { CP_ASSETS } from '../data/craftpixAssets';
import { PlacedMapObject } from '../types/mapObjects';
import { loadMapObjects, saveMapObjects, exportMapObjects } from './mapObjectStore';

/**
 * In-game редактор карт.
 *
 * Управление (в режиме редактора):
 *   F9            — выход из редактора (с авто-сохранением)
 *   ЛКМ на карте  — поставить выбранный ассет
 *   ПКМ на объекте — удалить ближайший объект
 *   Стрелки       — перемещение камеры
 *   Shift+стрелки — быстрое перемещение
 *   [ / ]         — уменьшить/увеличить scale выбранного объекта
 *   Q / E         — поворот preview'а влево/вправо
 *   S             — snap-to-grid toggle (32px сетка)
 *   Ctrl+S        — экспорт JSON в консоль
 *   ESC           — снять выбор ассета
 */
export class MapEditor {
  private scene: Phaser.Scene;
  private zoneId: string;

  private active = false;
  private objects: PlacedMapObject[] = [];
  private sprites = new Map<PlacedMapObject, Phaser.GameObjects.Image>();

  // UI
  private panel?: Phaser.GameObjects.Container;
  private panelBg?: Phaser.GameObjects.Rectangle;
  private thumbs: Phaser.GameObjects.Image[] = [];
  private thumbLabels: Phaser.GameObjects.Text[] = [];
  private searchText?: Phaser.GameObjects.Text;
  private selectedKeyText?: Phaser.GameObjects.Text;
  private hintText?: Phaser.GameObjects.Text;
  private previewImage?: Phaser.GameObjects.Image;
  private indicator?: Phaser.GameObjects.Text;
  private scrollOffset = 0;

  // Состояние
  private selectedKey: string | null = null;
  private currentScale = 0.3;
  private currentAngle = 0;
  private snapToGrid = false;
  private readonly SNAP_SIZE = 32;

  // Константы UI
  private readonly PANEL_W = 240;
  private readonly THUMB_SIZE = 48;
  private readonly COLS = 4;
  private readonly GAP = 4;
  private readonly PANEL_HEADER_H = 100;

  // Слушатели (для cleanup при выходе)
  private keyHandlers: Array<{ key: string; fn: (e: KeyboardEvent) => void }> = [];
  private pointerHandler?: (p: Phaser.Input.Pointer) => void;
  private pointerMoveHandler?: (p: Phaser.Input.Pointer) => void;
  private wheelHandler?: (p: Phaser.Input.Pointer, gos: unknown[], dx: number, dy: number) => void;

  constructor(scene: Phaser.Scene, zoneId: string) {
    this.scene = scene;
    this.zoneId = zoneId;
    this.objects = loadMapObjects(zoneId);
  }

  /** Возвращает все сохранённые объекты (для начальной отрисовки при загрузке зоны). */
  getObjects(): PlacedMapObject[] {
    return this.objects;
  }

  /** Рендерит все сохранённые объекты на карте. Вызывается один раз при создании зоны. */
  spawnAll(): void {
    for (const obj of this.objects) {
      this.renderObject(obj);
    }
  }

  private renderObject(obj: PlacedMapObject): void {
    if (!this.scene.textures.exists(obj.key)) return;
    const img = this.scene.add.image(obj.x, obj.y, obj.key);
    img.setOrigin(0.5, 0.9);
    img.setScale(obj.scale);
    img.setAngle(obj.angle ?? 0);
    img.setDepth(obj.y);
    this.sprites.set(obj, img);
  }

  /** Переключение режима редактора. */
  toggle(): void {
    if (this.active) this.stop(); else this.start();
  }

  private start(): void {
    this.active = true;

    // Заморозка геймплея + отключение камеры-следящей + призрачный вид мобов
    const gs = this.scene as unknown as { editorMode: boolean; creatures?: Array<{ setAlpha?: (a: number) => void; sprite?: { setAlpha?: (a: number) => void } }>; playerBody?: { setAlpha?: (a: number) => void }; sphere?: { setAlpha?: (a: number) => void } };
    gs.editorMode = true;
    this.scene.cameras.main.stopFollow();
    if (gs.creatures) {
      for (const c of gs.creatures) {
        c.setAlpha?.(0.25);
        c.sprite?.setAlpha?.(0.25);
      }
    }
    gs.playerBody?.setAlpha?.(0.35);
    gs.sphere?.setAlpha?.(0.35);

    this.buildUI();
    this.attachInput();
    // Визуальный индикатор
    this.indicator = this.scene.add.text(
      this.scene.cameras.main.width / 2, 10,
      '★ EDITOR MODE ★  ` / F2 / F9 = exit  LMB=place  RMB=delete  Arrows=move  [ / ]=scale  Q/E=rotate  S=snap',
      { fontSize: '11px', color: '#ffdd55', backgroundColor: '#000000cc',
        stroke: '#000000', strokeThickness: 2, padding: { x: 8, y: 4 } } as Phaser.Types.GameObjects.Text.TextStyle
    ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(99999);
  }

  private stop(): void {
    this.active = false;
    this.save();
    this.detachInput();
    this.panel?.destroy();
    this.panel = undefined;
    this.indicator?.destroy();
    this.indicator = undefined;
    this.previewImage?.destroy();
    this.previewImage = undefined;
    this.selectedKey = null;
    this.thumbs = [];
    this.thumbLabels = [];

    // Разморозка + возврат камеры + нормальная прозрачность
    const gs = this.scene as unknown as { editorMode: boolean; creatures?: Array<{ setAlpha?: (a: number) => void; sprite?: { setAlpha?: (a: number) => void } }>; playerBody?: Phaser.GameObjects.GameObject & { setAlpha?: (a: number) => void }; sphere?: { setAlpha?: (a: number) => void } };
    gs.editorMode = false;
    if (gs.creatures) {
      for (const c of gs.creatures) {
        c.setAlpha?.(1);
        c.sprite?.setAlpha?.(1);
      }
    }
    gs.playerBody?.setAlpha?.(1);
    gs.sphere?.setAlpha?.(1);
    if (gs.playerBody) {
      this.scene.cameras.main.startFollow(gs.playerBody as Phaser.GameObjects.GameObject, true, 0.1, 0.1);
    }
  }

  // ── UI ──────────────────────────────────────────────────

  private buildUI(): void {
    const cam = this.scene.cameras.main;
    const px = cam.width - this.PANEL_W;
    const py = 40;
    const ph = cam.height - py - 10;

    this.panel = this.scene.add.container(px, py).setScrollFactor(0).setDepth(99998);

    this.panelBg = this.scene.add.rectangle(0, 0, this.PANEL_W, ph, 0x000000, 0.85)
      .setOrigin(0, 0).setStrokeStyle(2, 0xffdd55);
    this.panel.add(this.panelBg);

    const title = this.scene.add.text(8, 6, 'CraftPix Assets', {
      fontSize: '14px', color: '#ffdd55', fontStyle: 'bold',
    } as Phaser.Types.GameObjects.Text.TextStyle);
    this.panel.add(title);

    this.selectedKeyText = this.scene.add.text(8, 26,
      'Selected: (click an icon)', {
      fontSize: '10px', color: '#ffffff',
    } as Phaser.Types.GameObjects.Text.TextStyle);
    this.panel.add(this.selectedKeyText);

    this.hintText = this.scene.add.text(8, 44,
      `scale ${this.currentScale.toFixed(2)}  angle ${this.currentAngle}°  snap:${this.snapToGrid ? 'ON' : 'off'}`, {
      fontSize: '10px', color: '#aaaaaa',
    } as Phaser.Types.GameObjects.Text.TextStyle);
    this.panel.add(this.hintText);

    this.scene.add.text(8, 60, 'Scroll panel with wheel', {
      fontSize: '9px', color: '#888888',
    } as Phaser.Types.GameObjects.Text.TextStyle);
    this.panel?.add(this.scene.add.text(8, 60, 'Wheel = scroll · Ctrl+S = export', {
      fontSize: '9px', color: '#888888',
    } as Phaser.Types.GameObjects.Text.TextStyle));

    this.renderThumbs();
  }

  private renderThumbs(): void {
    if (!this.panel) return;
    for (const t of this.thumbs) t.destroy();
    for (const l of this.thumbLabels) l.destroy();
    this.thumbs = [];
    this.thumbLabels = [];

    const assetKeys = CP_ASSETS.map(([k]) => k);
    const startY = this.PANEL_HEADER_H - this.scrollOffset;

    for (let i = 0; i < assetKeys.length; i++) {
      const key = assetKeys[i];
      if (!this.scene.textures.exists(key)) continue;
      const col = i % this.COLS;
      const row = Math.floor(i / this.COLS);
      const x = 8 + col * (this.THUMB_SIZE + this.GAP);
      const y = startY + row * (this.THUMB_SIZE + this.GAP + 10);

      const cam = this.scene.cameras.main;
      const absY = y + 40;
      if (absY < this.PANEL_HEADER_H - this.THUMB_SIZE || absY > cam.height) continue; // clip offscreen

      const thumb = this.scene.add.image(x + this.THUMB_SIZE / 2, y + this.THUMB_SIZE / 2, key)
        .setDisplaySize(this.THUMB_SIZE - 4, this.THUMB_SIZE - 4)
        .setInteractive({ useHandCursor: true });
      thumb.on('pointerdown', () => this.selectAsset(key));
      if (key === this.selectedKey) thumb.setTint(0xffdd55);
      this.panel.add(thumb);
      this.thumbs.push(thumb);

      // Короткая подпись (последние 10 символов имени)
      const short = key.replace('cp_', '').slice(0, 9);
      const lbl = this.scene.add.text(x + this.THUMB_SIZE / 2, y + this.THUMB_SIZE + 2,
        short, { fontSize: '8px', color: '#cccccc' } as Phaser.Types.GameObjects.Text.TextStyle)
        .setOrigin(0.5, 0);
      this.panel.add(lbl);
      this.thumbLabels.push(lbl);
    }
  }

  private selectAsset(key: string): void {
    this.selectedKey = key;
    this.currentAngle = 0;
    this.selectedKeyText?.setText('Selected: ' + key.replace('cp_', ''));
    this.updatePreview();
    this.renderThumbs(); // перерисовать с подсветкой
  }

  private updatePreview(): void {
    this.previewImage?.destroy();
    this.previewImage = undefined;
    if (!this.selectedKey) return;
    const p = this.scene.input.activePointer;
    const worldPt = this.scene.cameras.main.getWorldPoint(p.x, p.y);
    this.previewImage = this.scene.add.image(worldPt.x, worldPt.y, this.selectedKey)
      .setOrigin(0.5, 0.9)
      .setScale(this.currentScale)
      .setAngle(this.currentAngle)
      .setAlpha(0.5)
      .setDepth(100000);
  }

  private updateHint(): void {
    this.hintText?.setText(
      `scale ${this.currentScale.toFixed(2)}  angle ${this.currentAngle}°  snap:${this.snapToGrid ? 'ON' : 'off'}`
    );
  }

  // ── Ввод ────────────────────────────────────────────────

  private attachInput(): void {
    // Клавиатура через DOM (чтобы не конфликтовать с игрой)
    const kb = (e: KeyboardEvent) => this.handleKey(e);
    window.addEventListener('keydown', kb);
    this.keyHandlers.push({ key: 'global', fn: kb });

    // Мышь
    this.pointerHandler = (p) => this.handleClick(p);
    this.scene.input.on('pointerdown', this.pointerHandler);

    this.pointerMoveHandler = (p) => {
      if (!this.previewImage || !this.selectedKey) return;
      const wp = this.scene.cameras.main.getWorldPoint(p.x, p.y);
      const pos = this.applySnap(wp.x, wp.y);
      this.previewImage.setPosition(pos.x, pos.y);
    };
    this.scene.input.on('pointermove', this.pointerMoveHandler);

    // Колёсико для скролла панели
    this.wheelHandler = (p, _gos, _dx, dy) => {
      if (p.x < this.scene.cameras.main.width - this.PANEL_W) return;
      this.scrollOffset = Math.max(0, this.scrollOffset + dy * 0.5);
      this.renderThumbs();
    };
    this.scene.input.on('wheel', this.wheelHandler);
  }

  private detachInput(): void {
    for (const h of this.keyHandlers) window.removeEventListener('keydown', h.fn);
    this.keyHandlers = [];
    if (this.pointerHandler) this.scene.input.off('pointerdown', this.pointerHandler);
    if (this.pointerMoveHandler) this.scene.input.off('pointermove', this.pointerMoveHandler);
    if (this.wheelHandler) this.scene.input.off('wheel', this.wheelHandler);
  }

  private handleKey(e: KeyboardEvent): void {
    if (!this.active) return;

    // Перемещение камеры
    const speed = e.shiftKey ? 32 : 12;
    const cam = this.scene.cameras.main;
    if (e.key === 'ArrowLeft')  cam.scrollX -= speed;
    if (e.key === 'ArrowRight') cam.scrollX += speed;
    if (e.key === 'ArrowUp')    cam.scrollY -= speed;
    if (e.key === 'ArrowDown')  cam.scrollY += speed;

    // Scale
    if (e.key === '[') { this.currentScale = Math.max(0.05, this.currentScale - 0.05); this.refreshPreview(); }
    if (e.key === ']') { this.currentScale = Math.min(2.0, this.currentScale + 0.05); this.refreshPreview(); }

    // Rotate
    if (e.key === 'q' || e.key === 'Q') { this.currentAngle = (this.currentAngle - 15) % 360; this.refreshPreview(); }
    if (e.key === 'e' || e.key === 'E') { this.currentAngle = (this.currentAngle + 15) % 360; this.refreshPreview(); }

    // Snap
    if (e.key === 's' || e.key === 'S') {
      if (e.ctrlKey) {
        const json = exportMapObjects(this.zoneId);
        console.log(`─── EXPORT ${this.zoneId} (${this.objects.length} objects) ───`);
        console.log(json);
        e.preventDefault();
      } else {
        this.snapToGrid = !this.snapToGrid;
        this.updateHint();
      }
    }

    // ESC — снять выбор
    if (e.key === 'Escape') {
      this.selectedKey = null;
      this.selectedKeyText?.setText('Selected: (click an icon)');
      this.previewImage?.destroy();
      this.previewImage = undefined;
      this.renderThumbs();
    }
  }

  private refreshPreview(): void {
    if (!this.previewImage) return;
    this.previewImage.setScale(this.currentScale);
    this.previewImage.setAngle(this.currentAngle);
    this.updateHint();
  }

  private handleClick(p: Phaser.Input.Pointer): void {
    // Клики по панели — игнорируем (там уже interactive'ы на thumb'ах)
    if (p.x >= this.scene.cameras.main.width - this.PANEL_W) return;

    const wp = this.scene.cameras.main.getWorldPoint(p.x, p.y);

    if (p.rightButtonDown()) {
      this.deleteNear(wp.x, wp.y);
    } else if (p.leftButtonDown() && this.selectedKey) {
      const pos = this.applySnap(wp.x, wp.y);
      this.placeObject(this.selectedKey, pos.x, pos.y);
    }
  }

  private applySnap(x: number, y: number): { x: number; y: number } {
    if (!this.snapToGrid) return { x, y };
    return {
      x: Math.round(x / this.SNAP_SIZE) * this.SNAP_SIZE,
      y: Math.round(y / this.SNAP_SIZE) * this.SNAP_SIZE,
    };
  }

  private placeObject(key: string, x: number, y: number): void {
    const obj: PlacedMapObject = {
      key, x, y,
      scale: this.currentScale,
      angle: this.currentAngle || undefined,
    };
    this.objects.push(obj);
    this.renderObject(obj);
    this.save();
  }

  private deleteNear(x: number, y: number): void {
    // Находим ближайший placed-объект в радиусе 80px
    let best: PlacedMapObject | null = null;
    let bestD = 80 * 80;
    for (const obj of this.objects) {
      const dx = obj.x - x, dy = obj.y - y;
      const d = dx * dx + dy * dy;
      if (d < bestD) { best = obj; bestD = d; }
    }
    if (!best) return;
    const sprite = this.sprites.get(best);
    if (sprite) sprite.destroy();
    this.sprites.delete(best);
    this.objects = this.objects.filter(o => o !== best);
    this.save();
  }

  private save(): void {
    saveMapObjects(this.zoneId, this.objects);
  }
}
