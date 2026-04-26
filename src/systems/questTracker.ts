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

  /** Check if quest prerequisites are met */
  isQuestAvailable(q: QuestProgress): boolean {
    if (q.completed) return false;
    if (!q.def.prerequisiteIds || q.def.prerequisiteIds.length === 0) return true;
    return q.def.prerequisiteIds.every(preId =>
      this.quests.some(pq => pq.def.id === preId && pq.completed)
    );
  }

  /** Returns newly completed quests */
  onKill(creatureId: string): QuestProgress[] {
    return this.advance('kill', creatureId);
  }

  onCapture(creatureId: string): QuestProgress[] {
    // Capture advances both specific creature and generic 'capture' objectives
    const results = this.advance('capture', creatureId);
    return results;
  }

  onSpellLearned(spellId: string): QuestProgress[] {
    return this.advance('learn_spell', spellId);
  }

  onTalk(npcId: string): QuestProgress[] {
    return this.advance('talk', npcId);
  }

  onCraftT3(): QuestProgress[] {
    return this.advance('craft_t3', undefined);
  }

  onBossKill(bossId: string): QuestProgress[] {
    return this.advance('kill_boss', bossId);
  }

  getAll(): QuestProgress[] {
    return this.quests;
  }

  getActive(): QuestProgress[] {
    return this.quests.filter(q => !q.completed && this.isQuestAvailable(q));
  }

  getCompleted(): QuestProgress[] {
    return this.quests.filter(q => q.completed);
  }

  /** Get the next available quest that hasn't started yet */
  getNextQuest(): QuestProgress | null {
    return this.quests.find(q => !q.completed && this.isQuestAvailable(q) &&
      q.counts.every(c => c === 0)) ?? null;
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
      // Check prerequisites
      if (!this.isQuestAvailable(q)) continue;

      let progressed = false;
      for (let i = 0; i < q.def.objectives.length; i++) {
        const obj = q.def.objectives[i];
        if (obj.type !== type) continue;
        // targetId undefined in objective = any target matches
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
