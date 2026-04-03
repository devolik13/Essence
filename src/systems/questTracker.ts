import { QuestDef, QuestProgress } from '../types/quests';

export class QuestTracker {
  private quests: QuestProgress[];

  constructor(defs: QuestDef[]) {
    this.quests = defs.map(def => ({
      def,
      counts: def.objectives.map(() => 0),
      completed: false,
    }));
  }

  /** Returns newly completed quests (may be empty) */
  onKill(creatureId: string): QuestProgress[] {
    return this.advance('kill', creatureId);
  }

  onCapture(_creatureId: string): QuestProgress[] {
    return this.advance('capture', undefined);
  }

  onSpellLearned(spellId: string): QuestProgress[] {
    return this.advance('learn_spell', spellId);
  }

  getAll(): QuestProgress[] {
    return this.quests;
  }

  getActive(): QuestProgress[] {
    return this.quests.filter(q => !q.completed);
  }

  restoreState(completedIds: string[], counts: Record<string, number[]>) {
    for (const q of this.quests) {
      if (counts[q.def.id]) q.counts = [...counts[q.def.id]];
      if (completedIds.includes(q.def.id)) q.completed = true;
    }
  }

  private advance(type: string, targetId: string | undefined): QuestProgress[] {
    const completed: QuestProgress[] = [];

    for (const q of this.quests) {
      if (q.completed) continue;

      let progressed = false;
      for (let i = 0; i < q.def.objectives.length; i++) {
        const obj = q.def.objectives[i];
        if (obj.type !== type) continue;
        // targetId undefined in objective = any target
        if (obj.targetId !== undefined && obj.targetId !== targetId) continue;
        if (q.counts[i] < obj.count) {
          q.counts[i]++;
          progressed = true;
        }
      }

      if (progressed && this.isComplete(q)) {
        q.completed = true;
        completed.push(q);
      }
    }

    return completed;
  }

  private isComplete(q: QuestProgress): boolean {
    return q.def.objectives.every((obj, i) => q.counts[i] >= obj.count);
  }
}
