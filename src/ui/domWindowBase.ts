/**
 * Shared lifecycle for DOM overlay windows.
 *
 * Windows are FLOATING and NON-MODAL:
 *  - the backdrop is non-blocking (`pointer-events: none`) so clicks fall through
 *    to the Phaser canvas and to other windows — multiple windows can be open and
 *    interactive at once;
 *  - Escape still calls `onClose` for whichever windows are listening;
 *  - `makeDraggable` lets a window be dragged by its header, and the position is
 *    remembered per-window via `restoreWindowPos`.
 */

export interface DOMWindowHandle {
  /** Root element appended to document.body */
  root: HTMLElement;
  /** Call to unmount and remove all listeners */
  destroy: () => void;
}

/**
 * Creates a window shell: root container → backdrop → inner stage.
 * Registers Escape key (+ optional extra keys) to call `onClose`.
 * Appends the root to document.body automatically.
 *
 * The backdrop is NON-BLOCKING (`pointer-events: none`): it does not intercept
 * clicks and there is no backdrop-click-to-close. The game and any other open
 * windows remain interactive underneath.
 *
 * @param rootClass     CSS class for the outermost container div
 * @param backdropClass CSS class for the backdrop div
 * @param onClose       Called when user presses Escape or an extra key
 * @param extraKeys     Additional key strings (besides 'Escape') that trigger onClose
 * @returns `{ root, stage, destroy }` — put your window content inside `stage`
 */
export function openWindowShell(
  rootClass: string,
  backdropClass: string,
  onClose: () => void,
  extraKeys: string[] = [],
): DOMWindowHandle & { stage: HTMLElement } {
  const root = document.createElement('div');
  if (rootClass) root.className = rootClass;
  // Root itself must not block the game — only the actual window panels
  // (which set pointer-events: auto via their own CSS) should be interactive.
  root.style.pointerEvents = 'none';

  const backdrop = document.createElement('div');
  backdrop.className = backdropClass;
  // Non-modal: backdrop passes clicks through and is not clickable-to-close.
  backdrop.style.pointerEvents = 'none';
  root.appendChild(backdrop);

  const stage = document.createElement('div');
  root.appendChild(stage);

  const closeKeys = new Set(['Escape', ...extraKeys]);
  const keyHandler = (e: KeyboardEvent) => {
    if (closeKeys.has(e.key)) onClose();
  };
  window.addEventListener('keydown', keyHandler);

  document.body.appendChild(root);

  const destroy = () => {
    window.removeEventListener('keydown', keyHandler);
    root.parentElement?.removeChild(root);
  };

  return { root, stage, destroy };
}

/** Clamp helper keeping a window's top-left so its header stays grabbable. */
function clampPos(left: number, top: number): { left: number; top: number } {
  const maxLeft = Math.max(0, window.innerWidth - 40);
  const maxTop = Math.max(0, window.innerHeight - 30);
  return {
    left: Math.max(0, Math.min(maxLeft, left)),
    top: Math.max(0, Math.min(maxTop, top)),
  };
}

/**
 * Make `win` draggable by `handle`. Converts the window to `position: fixed`
 * (so flex/grid centering of the parent stage no longer applies) on first drag,
 * clamps it on screen, and persists the position to `localStorage[storageKey]`.
 *
 * Clicks on buttons / close controls inside the handle do NOT start a drag.
 */
export function makeDraggable(win: HTMLElement, handle: HTMLElement, storageKey: string): void {
  handle.style.cursor = 'move';

  let dragging = false;
  let offX = 0;
  let offY = 0;

  const onMove = (e: MouseEvent) => {
    if (!dragging) return;
    const { left, top } = clampPos(e.clientX - offX, e.clientY - offY);
    win.style.left = left + 'px';
    win.style.top = top + 'px';
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    try {
      const left = parseFloat(win.style.left) || 0;
      const top = parseFloat(win.style.top) || 0;
      localStorage.setItem(storageKey, JSON.stringify({ left, top }));
    } catch { /* localStorage unavailable */ }
  };

  handle.addEventListener('mousedown', (e: MouseEvent) => {
    if (e.button !== 0) return;
    // Don't drag when interacting with controls inside the header.
    const tgt = e.target as HTMLElement | null;
    if (tgt && tgt.closest('button, .cv-close, .win-close, .ess-close-btn, .bf-close')) return;

    // Ensure the window is fixed-positioned so left/top take effect and the
    // parent stage's flex/grid centering is overridden.
    const rect = win.getBoundingClientRect();
    win.style.position = 'fixed';
    win.style.left = rect.left + 'px';
    win.style.top = rect.top + 'px';
    // Pin size to the current rect so any CSS `right`/`bottom` (e.g. `inset`)
    // doesn't stretch the window once left/top are overridden.
    win.style.right = 'auto';
    win.style.bottom = 'auto';
    win.style.width = rect.width + 'px';
    win.style.height = rect.height + 'px';
    win.style.margin = '0';

    offX = e.clientX - rect.left;
    offY = e.clientY - rect.top;
    dragging = true;
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    e.preventDefault();
  });
}

/**
 * Apply a previously-saved position (from `makeDraggable`) to `win`, if any.
 * Call this right after a window opens so it reappears where the user left it.
 */
export function restoreWindowPos(win: HTMLElement, storageKey: string): void {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch { /* localStorage unavailable */ }
  if (!raw) return;
  try {
    const saved = JSON.parse(raw) as { left?: number; top?: number };
    if (typeof saved.left !== 'number' || typeof saved.top !== 'number') return;
    const { left, top } = clampPos(saved.left, saved.top);
    // Pin current rendered size before overriding left/top, so any CSS
    // `right`/`bottom` (e.g. `inset`) doesn't stretch/collapse the window.
    const rect = win.getBoundingClientRect();
    win.style.position = 'fixed';
    win.style.right = 'auto';
    win.style.bottom = 'auto';
    win.style.width = rect.width + 'px';
    win.style.height = rect.height + 'px';
    win.style.left = left + 'px';
    win.style.top = top + 'px';
    win.style.margin = '0';
  } catch { /* corrupt save */ }
}
