import Phaser from 'phaser';
import { CP_ASSETS } from '../data/craftpixAssets';
import { PlacedMapObject, TINT_PALETTE } from '../types/mapObjects';
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
  private spriteToObj = new Map<Phaser.GameObjects.Image, PlacedMapObject>();

  // Выделение
  private selectedObj: PlacedMapObject | null = null;
  private selectionOutline?: Phaser.GameObjects.Rectangle;
  private dragStartPos: { x: number; y: number } | null = null;

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
  private currentTintIndex = 0; // 0 = белый = без тинта
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
    if (obj.tint !== undefined && obj.tint !== 0xffffff) img.setTint(obj.tint);
    this.sprites.set(obj, img);
    this.spriteToObj.set(img, obj);
    // Если редактор уже открыт — сразу делаем интерактивным
    if (this.active) this.enableSpriteInteraction(img);
  }

  private enableSpriteInteraction(img: Phaser.GameObjects.Image): void {
    img.setInteractive({ draggable: true, useHandCursor: true });
  }

  private disableSpriteInteraction(img: Phaser.GameObjects.Image): void {
    img.disableInteractive();
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

    // Делаем все placed объекты интерактивными
    for (const img of this.sprites.values()) this.enableSpriteInteraction(img);

    this.buildUI();
    this.attachInput();
    // Визуальный индикатор
    this.indicator = this.scene.add.text(
      this.scene.cameras.main.width / 2, 10,
      '★ EDITOR MODE ★  ` / F2 / F9 = exit  LMB=place  RMB=delete  Arrows=move  [ / ]=scale  Q/E=rotate  T=tint  S=snap',
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

    // Снимаем interactive с всех placed объектов + убираем выделение
    for (const img of this.sprites.values()) this.disableSpriteInteraction(img);
    this.deselectPlaced();

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
      `scale ${this.currentScale.toFixed(2)}  angle ${this.currentAngle}°  tint #${TINT_PALETTE[this.currentTintIndex].toString(16).padStart(6, '0')}  snap:${this.snapToGrid ? 'ON' : 'off'}`, {
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
    const t = TINT_PALETTE[this.currentTintIndex];
    if (t !== 0xffffff) this.previewImage.setTint(t);
  }

  private updateHint(): void {
    this.hintText?.setText(
      `scale ${this.currentScale.toFixed(2)}  angle ${this.currentAngle}°  tint #${TINT_PALETTE[this.currentTintIndex].toString(16).padStart(6, '0')}  snap:${this.snapToGrid ? 'ON' : 'off'}`
    );
  }

  // ── Ввод ────────────────────────────────────────────────

  // Drag-обработчики (нужны ссылки для off())
  private dragStartHandler?: (p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image) => void;
  private dragHandler?: (p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image, dx: number, dy: number) => void;
  private dragEndHandler?: (p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image) => void;
  private gameobjectDownHandler?: (p: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => void;

  private attachInput(): void {
    // Клавиатура через DOM (чтобы не конфликтовать с игрой)
    const kb = (e: KeyboardEvent) => this.handleKey(e);
    window.addEventListener('keydown', kb);
    this.keyHandlers.push({ key: 'global', fn: kb });

    // Клик по свободной карте (для постановки нового объекта или деселекта)
    this.pointerHandler = (p) => this.handleMapClick(p);
    this.scene.input.on('pointerdown', this.pointerHandler);

    // Клик на существующий placed-спрайт = выделить его
    this.gameobjectDownHandler = (p, obj) => {
      const img = obj as Phaser.GameObjects.Image;
      const placed = this.spriteToObj.get(img);
      if (!placed) return;
      if (p.rightButtonDown()) {
        this.deleteObject(placed);
      } else {
        this.selectPlaced(placed);
      }
    };
    this.scene.input.on('gameobjectdown', this.gameobjectDownHandler);

    // Drag через Phaser Input
    this.dragStartHandler = (_p, obj) => {
      const placed = this.spriteToObj.get(obj);
      if (placed) this.dragStartPos = { x: placed.x, y: placed.y };
    };
    this.dragHandler = (_p, obj, dx, dy) => {
      const placed = this.spriteToObj.get(obj);
      if (!placed) return;
      const pos = this.applySnap(dx, dy);
      obj.setPosition(pos.x, pos.y);
      obj.setDepth(pos.y);
      placed.x = pos.x;
      placed.y = pos.y;
      if (this.selectedObj === placed) this.updateSelectionOutline();
    };
    this.dragEndHandler = () => {
      this.dragStartPos = null;
      this.save();
    };
    this.scene.input.on('dragstart', this.dragStartHandler);
    this.scene.input.on('drag', this.dragHandler);
    this.scene.input.on('dragend', this.dragEndHandler);

    // Движение мыши — обновляем preview
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
    if (this.gameobjectDownHandler) this.scene.input.off('gameobjectdown', this.gameobjectDownHandler);
    if (this.dragStartHandler) this.scene.input.off('dragstart', this.dragStartHandler);
    if (this.dragHandler) this.scene.input.off('drag', this.dragHandler);
    if (this.dragEndHandler) this.scene.input.off('dragend', this.dragEndHandler);
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

    // Scale — действует на выделенный placed (если есть), иначе на preview
    if (e.key === '[' || e.key === ']') {
      const delta = e.key === '[' ? -0.05 : 0.05;
      if (this.selectedObj) {
        this.selectedObj.scale = Math.max(0.05, Math.min(2.0, this.selectedObj.scale + delta));
        const sp = this.sprites.get(this.selectedObj);
        if (sp) sp.setScale(this.selectedObj.scale);
        this.updateSelectionOutline();
        this.save();
      } else {
        this.currentScale = Math.max(0.05, Math.min(2.0, this.currentScale + delta));
        this.refreshPreview();
      }
    }

    // Rotate — действует на выделенный placed (если есть), иначе на preview
    if (e.key === 'q' || e.key === 'Q' || e.key === 'e' || e.key === 'E') {
      const delta = (e.key === 'q' || e.key === 'Q') ? -15 : 15;
      if (this.selectedObj) {
        this.selectedObj.angle = (((this.selectedObj.angle ?? 0) + delta) % 360);
        const sp = this.sprites.get(this.selectedObj);
        if (sp) sp.setAngle(this.selectedObj.angle);
        this.updateSelectionOutline();
        this.save();
      } else {
        this.currentAngle = (this.currentAngle + delta) % 360;
        this.refreshPreview();
      }
    }

    // Tint — Shift+T = сброс, T = следующий цвет в палитре
    if (e.key === 't' || e.key === 'T') {
      if (this.selectedObj) {
        if (e.shiftKey) {
          this.selectedObj.tint = undefined;
        } else {
          const currentIdx = TINT_PALETTE.findIndex(c => c === (this.selectedObj?.tint ?? 0xffffff));
          const nextIdx = (currentIdx + 1) % TINT_PALETTE.length;
          const nextTint = TINT_PALETTE[nextIdx];
          this.selectedObj.tint = nextTint === 0xffffff ? undefined : nextTint;
        }
        const sp = this.sprites.get(this.selectedObj);
        if (sp) {
          if (this.selectedObj.tint === undefined) sp.clearTint();
          else sp.setTint(this.selectedObj.tint);
        }
        this.save();
      } else {
        if (e.shiftKey) {
          this.currentTintIndex = 0;
        } else {
          this.currentTintIndex = (this.currentTintIndex + 1) % TINT_PALETTE.length;
        }
        this.refreshPreview();
      }
      e.preventDefault();
    }

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

    // ESC — снять выбор (ассета и placed)
    if (e.key === 'Escape') {
      this.selectedKey = null;
      this.selectedKeyText?.setText('Selected: (click an icon)');
      this.previewImage?.destroy();
      this.previewImage = undefined;
      this.deselectPlaced();
      this.renderThumbs();
    }

    // Delete / Backspace — удалить выделенный placed
    if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedObj) {
      this.deleteObject(this.selectedObj);
      e.preventDefault();
    }
  }

  private refreshPreview(): void {
    if (!this.previewImage) return;
    this.previewImage.setScale(this.currentScale);
    this.previewImage.setAngle(this.currentAngle);
    const t = TINT_PALETTE[this.currentTintIndex];
    if (t === 0xffffff) this.previewImage.clearTint();
    else this.previewImage.setTint(t);
    this.updateHint();
  }

  /**
   * Клик по карте — НЕ по placed-спрайту. Если клик попал на спрайт,
   * Phaser сначала вызвал gameobjectdown, там мы обработали выделение.
   * Здесь: постановка нового объекта ИЛИ деселект (если ПКМ или пустой клик).
   */
  private handleMapClick(p: Phaser.Input.Pointer): void {
    // Клики по панели игнорируем
    if (p.x >= this.scene.cameras.main.width - this.PANEL_W) return;

    // Проверяем не попали ли в placed-спрайт (gameobjectdown уже отработал)
    const hits = this.scene.input.hitTestPointer(p);
    const hitPlaced = hits.some(h => this.spriteToObj.has(h as Phaser.GameObjects.Image));
    if (hitPlaced) return; // спрайт разобрался сам

    const wp = this.scene.cameras.main.getWorldPoint(p.x, p.y);

    if (p.rightButtonDown()) {
      // ПКМ на пустом = снять выделение
      this.deselectPlaced();
      return;
    }

    if (p.leftButtonDown()) {
      if (this.selectedKey) {
        // Ставим новый
        const pos = this.applySnap(wp.x, wp.y);
        this.placeObject(this.selectedKey, pos.x, pos.y);
      } else {
        // Клик на пустом без выбранного ассета = снять выделение placed
        this.deselectPlaced();
      }
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
    const tint = TINT_PALETTE[this.currentTintIndex];
    const obj: PlacedMapObject = {
      key, x, y,
      scale: this.currentScale,
      angle: this.currentAngle || undefined,
      tint: tint === 0xffffff ? undefined : tint,
    };
    this.objects.push(obj);
    this.renderObject(obj);
    this.save();
  }

  private deleteObject(obj: PlacedMapObject): void {
    const sprite = this.sprites.get(obj);
    if (sprite) {
      this.spriteToObj.delete(sprite);
      sprite.destroy();
    }
    this.sprites.delete(obj);
    this.objects = this.objects.filter(o => o !== obj);
    if (this.selectedObj === obj) this.deselectPlaced();
    this.save();
  }

  private selectPlaced(obj: PlacedMapObject): void {
    this.selectedObj = obj;
    // Снимаем выбранный из панели ассет — чтобы не поставить при перетаскивании
    if (this.selectedKey) {
      this.selectedKey = null;
      this.previewImage?.destroy();
      this.previewImage = undefined;
      this.selectedKeyText?.setText('Selected: (click icon or drag object)');
      this.renderThumbs();
    }
    this.updateSelectionOutline();
    this.selectedKeyText?.setText(`Placed: ${obj.key.replace('cp_', '')}  [Del]=delete  [drag]=move  [T]=tint`);
  }

  private deselectPlaced(): void {
    this.selectedObj = null;
    this.selectionOutline?.destroy();
    this.selectionOutline = undefined;
  }

  private updateSelectionOutline(): void {
    if (!this.selectedObj) return;
    const sprite = this.sprites.get(this.selectedObj);
    if (!sprite) return;
    const w = sprite.displayWidth;
    const h = sprite.displayHeight;
    const cx = sprite.x;
    const cy = sprite.y - h / 2 + h * 0.1; // origin 0.5/0.9 → центр баунда чуть выше
    if (!this.selectionOutline) {
      this.selectionOutline = this.scene.add.rectangle(cx, cy, w + 6, h + 6)
        .setStrokeStyle(3, 0xffdd55)
        .setFillStyle(0, 0)
        .setDepth(99997);
    } else {
      this.selectionOutline.setPosition(cx, cy);
      this.selectionOutline.setSize(w + 6, h + 6);
    }
  }

  private save(): void {
    saveMapObjects(this.zoneId, this.objects);
  }
}
