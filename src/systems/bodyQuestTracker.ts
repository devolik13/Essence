import { BodyQuestDef, BodyObjectiveType } from '../types/bodyQuests';

export interface BodyQuestProgress {
  def: BodyQuestDef;
  counts: number[];
  completed: boolean;
  surviveTimers: number[];
  protectTimers: number[];  // countdown for protect objectives (seconds remaining)
  started: boolean;
}

export class BodyQuestTracker {
  private active: BodyQuestProgress | null = null;

  start(def: BodyQuestDef): void {
    this.active = {
      def,
      counts: def.objectives.map(() => 0),
      completed: false,
      surviveTimers: def.objectives.map(obj => obj.type === 'survive' ? obj.count : 0),
      protectTimers: def.objectives.map(obj => obj.type === 'protect' ? obj.count : 0),
      started: true,
    };
  }

  clear(): void {
    this.active = null;
  }

  getActive(): BodyQuestProgress | null {
    return this.active;
  }

  isComplete(): boolean {
    if (!this.active) return false;
    return this.active.def.objectives.every((obj, i) => this.active!.counts[i] >= obj.count);
  }

  update(dt: number): boolean {
    if (!this.active || this.active.completed) return false;
    let changed = false;
    for (let i = 0; i < this.active.def.objectives.length; i++) {
      const obj = this.active.def.objectives[i];

      if (obj.type === 'survive') {
        if (this.active.counts[i] >= obj.count) continue;
        this.active.surviveTimers[i] -= dt;
        if (this.active.surviveTimers[i] <= 0) {
          this.active.counts[i] = obj.count;
          changed = true;
        }
      }

      if (obj.type === 'protect') {
        if (this.active.counts[i] >= obj.count) continue;
        // Only tick after the preceding reach objective is done
        const reachDone = this.active.def.objectives.some(
          (o, j) => o.type === 'reach' && o.targetId === obj.targetId && this.active!.counts[j] >= o.count,
        );
        if (!reachDone) continue;
        this.active.protectTimers[i] -= dt;
        if (this.active.protectTimers[i] <= 0) {
          this.active.counts[i] = obj.count;
          changed = true;
        }
      }
    }
    if (changed && this.isComplete()) {
      this.active.completed = true;
    }
    return changed;
  }

  /** Called when a protected creature dies — resets the protect timer so player must try again. */
  /** Reset protect+reach for a target — used when target dies or player leaves the zone. */
  failProtect(creatureId: string): boolean {
    if (!this.active || this.active.completed) return false;
    let reset = false;
    for (let i = 0; i < this.active.def.objectives.length; i++) {
      const obj = this.active.def.objectives[i];
      if (obj.type !== 'protect' || obj.targetId !== creatureId) continue;
      if (this.active.counts[i] >= obj.count) continue;
      this.active.protectTimers[i] = obj.count;
      for (let j = 0; j < this.active.def.objectives.length; j++) {
        const o = this.active.def.objectives[j];
        if (o.type === 'reach' && o.targetId === creatureId) {
          this.active.counts[j] = 0;
        }
      }
      reset = true;
    }
    return reset;
  }

  /** True if a protect objective for this id is currently active (reach done, timer ticking). */
  isProtectActive(creatureId: string): boolean {
    if (!this.active || this.active.completed) return false;
    for (let i = 0; i < this.active.def.objectives.length; i++) {
      const obj = this.active.def.objectives[i];
      if (obj.type !== 'protect' || obj.targetId !== creatureId) continue;
      if (this.active.counts[i] >= obj.count) continue;
      const reachDone = this.active.def.objectives.some(
        (o, j) => o.type === 'reach' && o.targetId === creatureId && this.active!.counts[j] >= o.count,
      );
      if (reachDone) return true;
    }
    return false;
  }

  getProtectRemaining(index: number): number {
    if (!this.active) return 0;
    return Math.max(0, this.active.protectTimers[index]);
  }

  onKill(creatureId: string): boolean {
    return this.advance('kill', creatureId);
  }

  onReach(targetId: string): boolean {
    return this.advance('reach', targetId);
  }

  onCollect(targetId: string): boolean {
    return this.advance('collect', targetId);
  }

  onSteal(targetId: string): boolean {
    return this.advance('steal', targetId);
  }

  onDestroy(targetId: string): boolean {
    return this.advance('destroy', targetId);
  }

  onProtect(targetId: string): boolean {
    return this.advance('protect', targetId);
  }

  onEscort(targetId: string): boolean {
    return this.advance('escort', targetId);
  }

  getSurviveRemaining(index: number): number {
    if (!this.active) return 0;
    return Math.max(0, this.active.surviveTimers[index]);
  }

  private advance(type: BodyObjectiveType, targetId?: string): boolean {
    if (!this.active || this.active.completed) return false;
    let changed = false;
    for (let i = 0; i < this.active.def.objectives.length; i++) {
      const obj = this.active.def.objectives[i];
      if (obj.type !== type) continue;
      if (obj.targetId !== undefined && obj.targetId !== targetId) continue;
      if (this.active.counts[i] < obj.count) {
        this.active.counts[i]++;
        changed = true;
      }
    }
    if (changed && this.isComplete()) {
      this.active.completed = true;
    }
    return changed;
  }
}
