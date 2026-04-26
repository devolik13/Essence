import { BodyQuestDef, BodyObjectiveType } from '../types/bodyQuests';

export interface BodyQuestProgress {
  def: BodyQuestDef;
  counts: number[];
  completed: boolean;
  surviveTimers: number[];
  started: boolean;
}

export class BodyQuestTracker {
  private active: BodyQuestProgress | null = null;

  start(def: BodyQuestDef): void {
    this.active = {
      def,
      counts: def.objectives.map(() => 0),
      completed: false,
      surviveTimers: def.objectives.map(obj =>
        obj.type === 'survive' ? obj.count : 0
      ),
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
      if (obj.type !== 'survive') continue;
      if (this.active.counts[i] >= obj.count) continue;
      this.active.surviveTimers[i] -= dt;
      if (this.active.surviveTimers[i] <= 0) {
        this.active.counts[i] = obj.count;
        changed = true;
      }
    }
    if (changed && this.isComplete()) {
      this.active.completed = true;
    }
    return changed;
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
