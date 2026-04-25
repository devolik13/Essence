import Phaser from 'phaser';
import { CP_ASSETS, MOB_ASSETS } from '../data/craftpixAssets';
import { PlacedMapObject, TINT_PALETTE, isKeyDefaultSolid } from '../types/mapObjects';
import { loadMapObjects, saveMapObjects, exportMapObjects, resetToBundled, hasUnsavedChanges } from './mapObjectStore';
import { addMapCollider, clearMapColliders } from './mapColliders';

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
  private statusText?: Phaser.GameObjects.Text;
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
  private readonly PANEL_HEADER_H = 170;

  // Слушатели (для cleanup при выходе)
  private keyHandlers: Array<{ key: string; fn: (e: KeyboardEvent) => void }> = [];
  private pointerHandler?: (p: Phaser.Input.Pointer) => void;
  private pointerMoveHandler?: (p: Phaser.Input.Pointer) => void;
  private wheelHandler?: (p: Phaser.Input.Pointer, gos: unknown[], dx: number, dy: number) => void;
  private updateHandler?: () => void;

  // Undo/redo — храним JSON-снимки objects[]
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private readonly MAX_UNDO = 50;

  // Поиск ассетов по имени
  private searchInput?: HTMLInputElement;
  private filterText = '';

  // Камера до входа в редактор (для восстановления)
  private savedCamZoom = 1;

  // Сетка
  private gridGraphics?: Phaser.GameObjects.Graphics;
  private gridVisible = false;

  // Всплывающее сообщение (toast)
  private toast?: Phaser.GameObjects.Text;

  // Быстрые локации для телепорта (зависят от зоны)
  private readonly VILLAGE_JUMPS: Record<string, { x: number; y: number; name: string }> = {
    '1': { x: 3200, y: 2800, name: 'Eshworth' },
    '2': { x: 8800, y: 2800, name: 'Waldmar' },
    '3': { x: 2000, y: 5800, name: 'Deep Mines' },
    '4': { x: 6000, y: 2800, name: 'Trade Road' },
    '5': { x: 5760, y: 3840, name: 'Map center' },
  };

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
      if (obj.key.startsWith('mob_')) continue;
      this.renderObject(obj);
    }
    this.rebuildColliders();
  }

  /** Возвращает mob spawn points из карты (mob_goblin → 'goblin'). */
  getMobSpawns(): Array<{ x: number; y: number; creatureId: string }> {
    return this.objects
      .filter(o => o.key.startsWith('mob_'))
      .map(o => ({ x: o.x, y: o.y, creatureId: o.key.replace('mob_', '') }));
  }

  /** Твёрдый ли объект (явный флаг → иначе по префиксу key). */
  private isSolid(obj: PlacedMapObject): boolean {
    if (obj.solid !== undefined) return obj.solid;
    return isKeyDefaultSolid(obj.key);
  }

  /** Радиус коллайдера: явный → иначе ~30% от ширины спрайта. */
  private colliderRadiusOf(obj: PlacedMapObject): number {
    if (obj.colliderRadius !== undefined) return obj.colliderRadius;
    const sp = this.sprites.get(obj);
    const w = sp ? sp.displayWidth : 32;
    const h = sp ? sp.displayHeight : 32;
    return Math.max(10, Math.min(w, h) * 0.3);
  }

  /** Перестраивает глобальный массив mapColliders (вызвать после любых правок). */
  private rebuildColliders(): void {
    clearMapColliders();
    for (const obj of this.objects) {
      if (!this.isSolid(obj)) continue;
      const sp = this.sprites.get(obj);
      const h = sp ? sp.displayHeight : 32;
      const r = this.colliderRadiusOf(obj);
      addMapCollider({ x: obj.x, y: obj.y - h * 0.2, r });
    }
  }

  // ── Undo / Redo ─────────────────────────────────────────

  /** Делает снимок текущего состояния в undo-стек (вызывать ПЕРЕД мутацией). */
  private snapshot(): void {
    const cur = JSON.stringify(this.objects);
    const last = this.undoStack[this.undoStack.length - 1];
    if (cur === last) return; // не плодим дубликаты
    this.undoStack.push(cur);
    if (this.undoStack.length > this.MAX_UNDO) this.undoStack.shift();
    this.redoStack = [];
  }

  private undo(): void {
    if (this.undoStack.length === 0) { this.showToast('Nothing to undo'); return; }
    const snap = this.undoStack.pop() as string;
    this.redoStack.push(JSON.stringify(this.objects));
    this.restoreSnapshot(snap);
    this.showToast('↶ Undo');
  }

  private redo(): void {
    if (this.redoStack.length === 0) { this.showToast('Nothing to redo'); return; }
    const snap = this.redoStack.pop() as string;
    this.undoStack.push(JSON.stringify(this.objects));
    this.restoreSnapshot(snap);
    this.showToast('↷ Redo');
  }

  private restoreSnapshot(json: string): void {
    for (const img of this.sprites.values()) img.destroy();
    this.sprites.clear();
    this.spriteToObj.clear();
    this.deselectPlaced();
    this.objects = JSON.parse(json);
    for (const obj of this.objects) this.renderObject(obj);
    saveMapObjects(this.zoneId, this.objects);
    this.rebuildColliders();
    this.updateStatusText();
  }

  private renderObject(obj: PlacedMapObject): void {
    if (!this.scene.textures.exists(obj.key)) return;
    const isMob = obj.key.startsWith('mob_');
    const img = isMob
      ? this.scene.add.image(obj.x, obj.y, obj.key, 0)
      : this.scene.add.image(obj.x, obj.y, obj.key);
    img.setOrigin(0.5, isMob ? 0.5 : 0.9);
    img.setScale(obj.scale);
    img.setAngle(obj.angle ?? 0);
    img.setDepth(obj.y);
    if (obj.tint !== undefined && obj.tint !== 0xffffff) img.setTint(obj.tint);
    this.sprites.set(obj, img);
    this.spriteToObj.set(img, obj);
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
    this.savedCamZoom = this.scene.cameras.main.zoom;
    this.scene.cameras.main.stopFollow();
    this.scene.events.emit('editor-mode', true);
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
    this.createSearchInput();
    this.attachInput();
    // Визуальный индикатор
    this.indicator = this.scene.add.text(
      this.scene.cameras.main.width / 2, 10,
      '★ EDITOR MODE ★  exit=` F2 F9  Ctrl+E=EXPORT  Ctrl+Z=undo  Ctrl+D=dupe  G=grid  1-5=jump  [ ]Q/E T C S=edit',
      { fontSize: '11px', color: '#ffdd55', backgroundColor: '#000000cc',
        stroke: '#000000', strokeThickness: 2, padding: { x: 8, y: 4 } } as Phaser.Types.GameObjects.Text.TextStyle
    ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(99999);
  }

  private stop(): void {
    this.active = false;
    this.save();
    // Напомним про экспорт, если раскладка расходится с git-файлом
    if (hasUnsavedChanges(this.zoneId, this.objects)) {
      console.warn(
        `[MapEditor] ${this.zoneId}: есть несохранённые изменения. ` +
        `Открой редактор снова и нажми Ctrl+E чтобы скачать ${this.zoneId}.json, ` +
        `потом положи в src/data/mapLayouts/ и сделай push.`
      );
    }
    this.detachInput();
    this.removeSearchInput();
    this.panel?.destroy();
    this.panel = undefined;
    this.indicator?.destroy();
    this.indicator = undefined;
    this.previewImage?.destroy();
    this.previewImage = undefined;
    this.gridGraphics?.destroy();
    this.gridGraphics = undefined;
    this.gridVisible = false;
    this.toast?.destroy();
    this.toast = undefined;
    this.selectedKey = null;
    this.thumbs = [];
    this.thumbLabels = [];
    this.undoStack = [];
    this.redoStack = [];

    // Снимаем interactive с всех placed объектов + убираем выделение
    for (const img of this.sprites.values()) this.disableSpriteInteraction(img);
    this.deselectPlaced();

    // Разморозка + возврат камеры + нормальная прозрачность
    const gs = this.scene as unknown as { editorMode: boolean; creatures?: Array<{ setAlpha?: (a: number) => void; sprite?: { setAlpha?: (a: number) => void } }>; playerBody?: Phaser.GameObjects.GameObject & { setAlpha?: (a: number) => void }; sphere?: { setAlpha?: (a: number) => void } };
    gs.editorMode = false;
    this.scene.events.emit('editor-mode', false);
    if (gs.creatures) {
      for (const c of gs.creatures) {
        c.setAlpha?.(1);
        c.sprite?.setAlpha?.(1);
      }
    }
    gs.playerBody?.setAlpha?.(1);
    gs.sphere?.setAlpha?.(1);
    this.scene.cameras.main.zoom = this.savedCamZoom;
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
      .setOrigin(0, 0).setStrokeStyle(2, 0xffdd55)
      .setInteractive().setScrollFactor(0);
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

    this.panel?.add(this.scene.add.text(8, 60,
      'Wheel=scroll · Ctrl+Z/Y=undo/redo · Ctrl+D=dup · G=grid\n1-5=jump: Eshworth/Waldmar/Mines/Road/Center', {
      fontSize: '9px', color: '#888888', lineSpacing: 2,
    } as Phaser.Types.GameObjects.Text.TextStyle));

    // Кнопки Export / Reload + статус
    const btnY = 92;
    const exportBtn = this.makeButton(8, btnY, 100, 20, '⬇ Export', 0xffaa44, () => this.exportToFile());
    const resetBtn = this.makeButton(114, btnY, 110, 20, '↺ Load from file', 0x6688cc, () => this.resetFromBundle());
    this.panel?.add([exportBtn.bg, exportBtn.txt, resetBtn.bg, resetBtn.txt]);

    this.statusText = this.scene.add.text(8, 114, '', {
      fontSize: '10px', color: '#88cc88', fontStyle: 'bold',
    } as Phaser.Types.GameObjects.Text.TextStyle);
    this.panel?.add(this.statusText);
    this.updateStatusText();

    this.renderThumbs();
  }

  private renderThumbs(): void {
    if (!this.panel) return;
    for (const t of this.thumbs) t.destroy();
    for (const l of this.thumbLabels) l.destroy();
    this.thumbs = [];
    this.thumbLabels = [];

    let decoKeys = CP_ASSETS.map(([k]) => k);
    let mobKeys = MOB_ASSETS.map(([k]) => k);
    if (this.filterText) {
      decoKeys = decoKeys.filter(k => k.toLowerCase().includes(this.filterText));
      mobKeys = mobKeys.filter(k => k.toLowerCase().includes(this.filterText));
    }
    const startY = this.PANEL_HEADER_H - this.scrollOffset;
    const cam = this.scene.cameras.main;

    let idx = 0;

    // ── Mobs section ──
    if (mobKeys.length > 0) {
      const headerY = startY + Math.floor(idx / this.COLS) * (this.THUMB_SIZE + this.GAP + 10);
      if (headerY + 40 > 0 && headerY + 40 < cam.height) {
        const hdr = this.scene.add.text(8, headerY, '▸ Mobs', {
          fontSize: '12px', color: '#ff8855', fontStyle: 'bold',
        } as Phaser.Types.GameObjects.Text.TextStyle);
        this.panel.add(hdr);
        this.thumbLabels.push(hdr);
      }
      idx += this.COLS; // reserve a row for header

      for (const key of mobKeys) {
        if (!this.scene.textures.exists(key)) continue;
        const col = idx % this.COLS;
        const row = Math.floor(idx / this.COLS);
        const x = 8 + col * (this.THUMB_SIZE + this.GAP);
        const y = startY + row * (this.THUMB_SIZE + this.GAP + 10);
        const absY = y + 40;
        idx++;
        if (absY < this.PANEL_HEADER_H - this.THUMB_SIZE || absY > cam.height) continue;

        const thumb = this.scene.add.image(x + this.THUMB_SIZE / 2, y + this.THUMB_SIZE / 2, key, 0)
          .setDisplaySize(this.THUMB_SIZE - 4, this.THUMB_SIZE - 4)
          .setInteractive({ useHandCursor: true })
          .setScrollFactor(0);
        thumb.on('pointerdown', () => this.selectAsset(key));
        if (key === this.selectedKey) thumb.setTint(0xffdd55);
        this.panel.add(thumb);
        this.thumbs.push(thumb);

        const short = key.replace('mob_', '');
        const lbl = this.scene.add.text(x + this.THUMB_SIZE / 2, y + this.THUMB_SIZE + 2,
          short, { fontSize: '8px', color: '#ff8855' } as Phaser.Types.GameObjects.Text.TextStyle)
          .setOrigin(0.5, 0);
        this.panel.add(lbl);
        this.thumbLabels.push(lbl);
      }
      // pad to next full row
      if (idx % this.COLS !== 0) idx += this.COLS - (idx % this.COLS);
    }

    // ── Decorations section ──
    if (decoKeys.length > 0) {
      const headerY = startY + Math.floor(idx / this.COLS) * (this.THUMB_SIZE + this.GAP + 10);
      if (headerY + 40 > 0 && headerY + 40 < cam.height) {
        const hdr = this.scene.add.text(8, headerY, '▸ Decorations', {
          fontSize: '12px', color: '#ffdd55', fontStyle: 'bold',
        } as Phaser.Types.GameObjects.Text.TextStyle);
        this.panel.add(hdr);
        this.thumbLabels.push(hdr);
      }
      idx += this.COLS;

      for (const key of decoKeys) {
        if (!this.scene.textures.exists(key)) continue;
        const col = idx % this.COLS;
        const row = Math.floor(idx / this.COLS);
        const x = 8 + col * (this.THUMB_SIZE + this.GAP);
        const y = startY + row * (this.THUMB_SIZE + this.GAP + 10);
        const absY = y + 40;
        idx++;
        if (absY < this.PANEL_HEADER_H - this.THUMB_SIZE || absY > cam.height) continue;

        const thumb = this.scene.add.image(x + this.THUMB_SIZE / 2, y + this.THUMB_SIZE / 2, key)
          .setDisplaySize(this.THUMB_SIZE - 4, this.THUMB_SIZE - 4)
          .setInteractive({ useHandCursor: true })
          .setScrollFactor(0);
        thumb.on('pointerdown', () => this.selectAsset(key));
        if (key === this.selectedKey) thumb.setTint(0xffdd55);
        this.panel.add(thumb);
        this.thumbs.push(thumb);

        const short = key.replace('cp_', '').slice(0, 9);
        const lbl = this.scene.add.text(x + this.THUMB_SIZE / 2, y + this.THUMB_SIZE + 2,
          short, { fontSize: '8px', color: '#cccccc' } as Phaser.Types.GameObjects.Text.TextStyle)
          .setOrigin(0.5, 0);
        this.panel.add(lbl);
        this.thumbLabels.push(lbl);
      }
    }
  }

  private selectAsset(key: string): void {
    this.selectedKey = key;
    this.currentAngle = 0;
    this.currentScale = key.startsWith('mob_') ? 0.07 : 0.3;
    const label = key.startsWith('mob_') ? key.replace('mob_', '🟢 ') : key.replace('cp_', '');
    this.selectedKeyText?.setText('Selected: ' + label);
    this.updateHint();
    this.updatePreview();
    this.renderThumbs();
  }

  private updatePreview(): void {
    this.previewImage?.destroy();
    this.previewImage = undefined;
    if (!this.selectedKey) return;
    const p = this.scene.input.activePointer;
    const worldPt = this.scene.cameras.main.getWorldPoint(p.x, p.y);
    const isMob = this.selectedKey.startsWith('mob_');
    this.previewImage = this.scene.add.image(worldPt.x, worldPt.y, this.selectedKey, isMob ? 0 : undefined)
      .setOrigin(0.5, isMob ? 0.5 : 0.9)
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
      if (placed) {
        this.dragStartPos = { x: placed.x, y: placed.y };
        this.snapshot();
      }
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
      // Middle-mouse drag → pan camera
      if (p.middleButtonDown()) {
        const cam = this.scene.cameras.main;
        cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom;
        cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom;
        return;
      }
      if (!this.previewImage || !this.selectedKey) return;
      const wp = this.scene.cameras.main.getWorldPoint(p.x, p.y);
      const pos = this.applySnap(wp.x, wp.y);
      this.previewImage.setPosition(pos.x, pos.y);
    };
    this.scene.input.on('pointermove', this.pointerMoveHandler);

    // Колёсико: Ctrl+wheel = zoom, обычное = скролл палитры
    this.wheelHandler = (p, _gos, _dx, dy) => {
      if (p.event.ctrlKey || p.event.metaKey) {
        const cam = this.scene.cameras.main;
        cam.zoom = Math.max(0.3, Math.min(3, cam.zoom - dy * 0.001));
        p.event.preventDefault();
        return;
      }
      if (p.x < this.scene.cameras.main.width - this.PANEL_W) return;
      this.scrollOffset = Math.max(0, this.scrollOffset + dy * 0.5);
      this.renderThumbs();
    };
    this.scene.input.on('wheel', this.wheelHandler);

    // Перерисовка сетки каждый кадр (камера может ехать)
    this.updateHandler = () => { if (this.gridVisible) this.drawGrid(); };
    this.scene.events.on('update', this.updateHandler);
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
    if (this.updateHandler) this.scene.events.off('update', this.updateHandler);
  }

  private handleKey(e: KeyboardEvent): void {
    if (!this.active) return;
    // Если фокус в поле поиска — пропускаем всю хоткей-логику
    if (document.activeElement instanceof HTMLInputElement) return;

    // Undo / Redo
    if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
      if (e.shiftKey) this.redo(); else this.undo();
      e.preventDefault();
      return;
    }
    if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
      this.redo();
      e.preventDefault();
      return;
    }

    // Ctrl+D — дубликат выделенного объекта
    if (e.ctrlKey && (e.key === 'd' || e.key === 'D') && this.selectedObj) {
      this.snapshot();
      const clone: PlacedMapObject = { ...this.selectedObj, x: this.selectedObj.x + 32, y: this.selectedObj.y + 32 };
      this.objects.push(clone);
      this.renderObject(clone);
      this.save();
      this.selectPlaced(clone);
      this.showToast('⎘ Duplicated');
      e.preventDefault();
      return;
    }

    // Перемещение камеры (стрелки, Shift=быстро)
    const speed = e.shiftKey ? 120 : 32;
    const cam = this.scene.cameras.main;
    if (e.key === 'ArrowLeft')  cam.scrollX -= speed;
    if (e.key === 'ArrowRight') cam.scrollX += speed;
    if (e.key === 'ArrowUp')    cam.scrollY -= speed;
    if (e.key === 'ArrowDown')  cam.scrollY += speed;

    // Zoom +/-
    if (e.key === '+' || e.key === '=') { cam.zoom = Math.min(cam.zoom + 0.1, 3); e.preventDefault(); return; }
    if (e.key === '-' || e.key === '_') { cam.zoom = Math.max(cam.zoom - 0.1, 0.3); e.preventDefault(); return; }

    // Телепорт 1-5 к ключевым локациям (только в village)
    if (this.zoneId === 'village' && this.VILLAGE_JUMPS[e.key]) {
      const jump = this.VILLAGE_JUMPS[e.key];
      cam.centerOn(jump.x, jump.y);
      this.showToast(`→ ${jump.name}`);
      e.preventDefault();
      return;
    }

    // G — сетка
    if (e.key === 'g' || e.key === 'G') {
      this.toggleGrid();
      e.preventDefault();
      return;
    }

    // Scale — действует на выделенный placed (если есть), иначе на preview
    if (e.key === '[' || e.key === ']') {
      const delta = e.key === '[' ? -0.05 : 0.05;
      if (this.selectedObj) {
        this.snapshot();
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
        this.snapshot();
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
        this.snapshot();
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

    // Ctrl+E — экспорт JSON-файла (скачивание в браузере)
    if (e.ctrlKey && (e.key === 'e' || e.key === 'E')) {
      this.exportToFile();
      e.preventDefault();
      return;
    }

    // Snap
    if (e.key === 's' || e.key === 'S') {
      if (e.ctrlKey) {
        // Ctrl+S теперь алиас для экспорта файла + лог в консоль
        this.exportToFile();
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

    // C — toggle solid/walkable для выделенного
    if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && this.selectedObj) {
      this.snapshot();
      const wasSolid = this.isSolid(this.selectedObj);
      this.selectedObj.solid = !wasSolid;
      this.updateSelectionOutline();
      this.save();
      this.showToast(wasSolid ? '✓ walkable' : '■ solid');
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
    this.snapshot();
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
    this.snapshot();
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
    const solid = this.isSolid(this.selectedObj);
    const color = solid ? 0xff6644 : 0x66ff88; // красный = непроходимый, зелёный = walkable
    if (!this.selectionOutline) {
      this.selectionOutline = this.scene.add.rectangle(cx, cy, w + 6, h + 6)
        .setStrokeStyle(3, color)
        .setFillStyle(0, 0)
        .setDepth(99997);
    } else {
      this.selectionOutline.setPosition(cx, cy);
      this.selectionOutline.setSize(w + 6, h + 6);
      this.selectionOutline.setStrokeStyle(3, color);
    }
    this.selectedKeyText?.setText(
      `Placed: ${this.selectedObj.key.replace('cp_', '')}  ${solid ? '[SOLID]' : '[walk]'}  [Del] [drag] [T]=tint [C]=solid`
    );
  }

  private save(): void {
    saveMapObjects(this.zoneId, this.objects);
    this.rebuildColliders();
    this.updateStatusText();
  }

  // ── Экспорт в файл / сброс из файла ─────────────────────

  /** Скачивает текущую раскладку как JSON-файл (пользователь кладёт в src/data/mapLayouts/). */
  private exportToFile(): void {
    const json = JSON.stringify(this.objects, null, 2) + '\n';
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.zoneId}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    this.showToast(`💾 ${this.zoneId}.json downloaded — put it in src/data/mapLayouts/ and push`);
    this.updateStatusText();
  }

  /** Сбрасывает локальные изменения, грузит из bundled-файла (чтобы подтянуть правки из git). */
  private resetFromBundle(): void {
    if (!confirm('Reset all unsaved changes and reload layout from the bundled file?')) return;
    this.snapshot();
    const bundled = resetToBundled(this.zoneId);
    this.restoreSnapshot(JSON.stringify(bundled));
    this.showToast(`↺ Reloaded from ${this.zoneId}.json`);
  }

  private updateStatusText(): void {
    if (!this.statusText) return;
    const dirty = hasUnsavedChanges(this.zoneId, this.objects);
    const count = this.objects.length;
    this.statusText.setText(
      dirty
        ? `● ${count} obj · UNSAVED (Ctrl+E to export)`
        : `${count} obj · synced with file`
    );
    this.statusText.setColor(dirty ? '#ffaa44' : '#88cc88');
  }

  // ── Toast ───────────────────────────────────────────────

  private showToast(text: string, color = '#ffdd55'): void {
    this.toast?.destroy();
    const cam = this.scene.cameras.main;
    this.toast = this.scene.add.text(cam.width / 2, cam.height / 2 - 60, text, {
      fontSize: '22px', color, backgroundColor: '#000000cc',
      stroke: '#000000', strokeThickness: 3, padding: { x: 12, y: 6 },
    } as Phaser.Types.GameObjects.Text.TextStyle)
      .setOrigin(0.5).setScrollFactor(0).setDepth(100001);
    this.scene.tweens.add({
      targets: this.toast, alpha: 0, duration: 900, delay: 500,
      onComplete: () => { this.toast?.destroy(); this.toast = undefined; },
    });
  }

  // ── Search input ────────────────────────────────────────

  private createSearchInput(): void {
    const canvas = (this.scene.sys.game.canvas as HTMLCanvasElement);
    const rect = canvas.getBoundingClientRect();
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search...';
    input.style.position = 'absolute';
    input.style.left = `${rect.right - this.PANEL_W + 8}px`;
    input.style.top = `${rect.top + 174}px`;
    input.style.width = `${this.PANEL_W - 20}px`;
    input.style.padding = '3px 6px';
    input.style.background = '#1a1a1a';
    input.style.color = '#ffffff';
    input.style.border = '1px solid #ffdd55';
    input.style.fontSize = '12px';
    input.style.fontFamily = 'monospace';
    input.style.zIndex = '10000';
    input.style.outline = 'none';
    input.value = this.filterText;
    input.addEventListener('input', () => {
      this.filterText = input.value.trim().toLowerCase();
      this.scrollOffset = 0;
      this.renderThumbs();
    });
    input.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Escape' || e.key === 'Enter') {
        input.blur();
      }
    });
    document.body.appendChild(input);
    this.searchInput = input;
  }

  private removeSearchInput(): void {
    this.searchInput?.remove();
    this.searchInput = undefined;
    this.filterText = '';
  }

  // ── Grid overlay ────────────────────────────────────────

  private toggleGrid(): void {
    this.gridVisible = !this.gridVisible;
    if (this.gridVisible) {
      if (!this.gridGraphics) {
        this.gridGraphics = this.scene.add.graphics()
          .setScrollFactor(0).setDepth(99996);
      }
      this.drawGrid();
    } else {
      this.gridGraphics?.clear();
    }
    this.showToast(this.gridVisible ? 'Grid ON' : 'Grid OFF');
  }

  private makeButton(
    x: number, y: number, w: number, h: number, label: string, color: number,
    onClick: () => void,
  ): { bg: Phaser.GameObjects.Rectangle; txt: Phaser.GameObjects.Text } {
    const bg = this.scene.add.rectangle(x, y, w, h, color, 0.85)
      .setOrigin(0, 0).setStrokeStyle(1, 0xffffff)
      .setInteractive({ useHandCursor: true }).setScrollFactor(0);
    const txt = this.scene.add.text(x + w / 2, y + h / 2, label, {
      fontSize: '11px', color: '#ffffff', fontStyle: 'bold',
    } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5).setScrollFactor(0);
    bg.on('pointerover', () => bg.setFillStyle(color, 1));
    bg.on('pointerout', () => bg.setFillStyle(color, 0.85));
    bg.on('pointerdown', onClick);
    return { bg, txt };
  }

  private drawGrid(): void {
    if (!this.gridGraphics || !this.gridVisible) return;
    const cam = this.scene.cameras.main;
    const g = this.gridGraphics;
    g.clear();
    g.lineStyle(1, 0xffdd55, 0.25);
    const size = this.SNAP_SIZE;
    const offX = -((cam.scrollX % size) + size) % size;
    const offY = -((cam.scrollY % size) + size) % size;
    g.beginPath();
    for (let x = offX; x < cam.width; x += size) {
      g.moveTo(x, 0); g.lineTo(x, cam.height);
    }
    for (let y = offY; y < cam.height; y += size) {
      g.moveTo(0, y); g.lineTo(cam.width, y);
    }
    g.strokePath();
  }
}
