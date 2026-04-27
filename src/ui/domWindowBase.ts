/**
 * Shared lifecycle for DOM overlay windows.
 * Provides backdrop, Escape-to-close, click-backdrop-to-close, and cleanup.
 */

export interface DOMWindowHandle {
  /** Root element appended to document.body */
  root: HTMLElement;
  /** Call to unmount and remove all listeners */
  destroy: () => void;
}

/**
 * Creates a window shell: root container → backdrop → inner stage.
 * Registers Escape key (+ optional extra keys) and backdrop-click to call `onClose`.
 * Appends the root to document.body automatically.
 *
 * @param rootClass     CSS class for the outermost container div
 * @param backdropClass CSS class for the backdrop div
 * @param onClose       Called when user presses Escape, extra key, or clicks backdrop
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

  const backdrop = document.createElement('div');
  backdrop.className = backdropClass;
  backdrop.addEventListener('click', onClose);
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
