import { QuestTracker } from '../systems/questTracker';
import { t } from '../i18n';

export interface DialogMessage {
  speaker: string;
  text: string;
}

export interface DialogResult {
  messages: DialogMessage[];
  questToGive?: string;
  questToComplete?: string;
  onEnd?: string;
}

type DialogProvider = (qt: QuestTracker) => DialogResult | null;

function questReady(qt: QuestTracker, questId: string): boolean {
  const q = qt.getAll().find(q => q.def.id === questId);
  return !!q && !q.completed && qt.isQuestAvailable(q) && q.counts.every(c => c === 0);
}

function questActive(qt: QuestTracker, questId: string): boolean {
  const q = qt.getAll().find(q => q.def.id === questId);
  if (!q || q.completed) return false;
  if (!qt.isQuestAvailable(q)) return false;
  return q.counts.some(c => c > 0);
}

function questDone(qt: QuestTracker, questId: string): boolean {
  return qt.getAll().some(q => q.def.id === questId && q.completed);
}

function questTurnIn(qt: QuestTracker, questId: string): boolean {
  const q = qt.getAll().find(q => q.def.id === questId);
  if (!q || q.completed) return false;
  return q.def.objectives.every((obj, i) => q.counts[i] >= obj.count);
}

const NPC_DIALOGS: Record<string, DialogProvider[]> = {

  // ═══ BERT — Hunter, practical, knows paths ═══════════════════════════════
  bert: [
    // Quest 4: Talk to Bert → learn about 4 zones
    (qt) => {
      if (questReady(qt, 'q4_rangers_request')) {
        return {
          questToGive: 'q4_rangers_request',
          messages: [
            { speaker: 'Bert — Hunter', text: "Heard the legend of the Guardians? Fire, water, earth, wind. Four places around us. They say whoever defeats all four gains their power." },
            { speaker: 'Bert — Hunter', text: "I don't believe in such things. But you look like you're heading somewhere anyway. North — the lake. South — the grove. West — the hills. East — the peaks." },
            { speaker: 'Bert — Hunter', text: "Be careful out there. The elementals aren't like the goblins." },
          ],
        };
      }
      return null;
    },
    // Quest 7 (Stone Heart) — Sven is missing
    (qt) => {
      if (questReady(qt, 'q7_stone_heart')) {
        return {
          messages: [
            { speaker: 'Bert — Hunter', text: "Miner Sven went into the hills two days ago. Hasn't come back." },
            { speaker: 'Bert — Hunter', text: "You know the way — we went together three weeks back. Through the Grey Gorge, where the rock splits." },
            { speaker: 'Bert — Hunter', text: "...You DO remember, right?" },
          ],
        };
      }
      return null;
    },
    // After all zones explored
    (qt) => {
      if (questDone(qt, 'q5_frozen_trail') && questDone(qt, 'q6_ashen_path') &&
          questDone(qt, 'q7_stone_heart') && questDone(qt, 'q8_wind_song') &&
          !questDone(qt, 'q9_gathering_storm')) {
        return {
          messages: [
            { speaker: 'Bert — Hunter', text: "You've been to all four zones. I can tell — you move differently now." },
            { speaker: 'Bert — Hunter', text: "The Guardians sense it too. Be ready." },
          ],
        };
      }
      return null;
    },
    // Default
    (qt) => {
      if (questDone(qt, 'q12_guardians_trial')) {
        return {
          messages: [
            { speaker: 'Bert — Hunter', text: "Still can't believe you took down a Guardian. Drinks are on me tonight." },
          ],
        };
      }
      return {
        messages: [
          { speaker: 'Bert — Hunter', text: "Don't wander too far from the village until you're ready. The elementals don't play nice." },
        ],
      };
    },
  ],

  // ═══ ALDRIC — Blacksmith, skeptic ═══════════════════════════════════════
  aldric: [
    // Quest 6 (Ashen Path) — wants volcanic stone
    (qt) => {
      if (questReady(qt, 'q6_ashen_path')) {
        return {
          messages: [
            { speaker: 'Aldric — Blacksmith', text: "You said you'd bring back a stone from the grove. Where is it?" },
            { speaker: 'Aldric — Blacksmith', text: "Volcanic. With red veins. From the vent in the Ashen Grove." },
            { speaker: 'Aldric — Blacksmith', text: "You volunteered yourself. Said you weren't afraid. Changed your mind?" },
          ],
        };
      }
      return null;
    },
    // After Ashen Path done
    (qt) => {
      if (questDone(qt, 'q6_ashen_path') && !questDone(qt, 'q9_gathering_storm')) {
        return {
          messages: [
            { speaker: 'Aldric — Blacksmith', text: "So you made it back from the grove." },
            { speaker: 'Aldric — Blacksmith', text: "...Not bad." },
          ],
        };
      }
      return null;
    },
    // After Guardian defeated
    (qt) => {
      if (questDone(qt, 'q12_guardians_trial')) {
        return {
          messages: [
            { speaker: 'Aldric — Blacksmith', text: "You took down a Guardian." },
            { speaker: 'Aldric — Blacksmith', text: "Here. My best work. For a worthy fighter." },
          ],
        };
      }
      return null;
    },
    // Default
    () => ({
      messages: [
        { speaker: 'Aldric — Blacksmith', text: "I forge weapons and armor for the village. Use the workbenches if you need to craft something." },
        { speaker: 'Aldric — Blacksmith', text: "Bring me ore, wood, and hides. Start with copper — it's soft, but it'll do." },
      ],
    }),
  ],

  // ═══ MIRA — Kind, observant ════════════════════════════════════════════
  mira: [
    // Quest 5 (Frozen Trail) — father is sick, needs lotus
    (qt) => {
      if (questReady(qt, 'q5_frozen_trail')) {
        return {
          messages: [
            { speaker: 'Mira', text: "Father hasn't been able to get up for three days. Fever." },
            { speaker: 'Mira', text: "Helga says a Misty Lotus might help. It only grows on the island in the lake." },
            { speaker: 'Mira', text: "You were heading there before, weren't you? Remember the crossing?" },
          ],
        };
      }
      return null;
    },
    // After Frozen Trail
    (qt) => {
      if (questDone(qt, 'q5_frozen_trail') && !questDone(qt, 'q9_gathering_storm')) {
        return {
          messages: [
            { speaker: 'Mira', text: "Thank you. Really." },
            { speaker: 'Mira', text: "You've changed somehow. I don't know. Doesn't matter." },
          ],
        };
      }
      return null;
    },
    // After Guardian defeated
    (qt) => {
      if (questDone(qt, 'q12_guardians_trial')) {
        return {
          messages: [
            { speaker: 'Mira', text: "You're different now. Not bad — just... different. It's a good thing." },
          ],
        };
      }
      return null;
    },
    // Default
    () => ({
      messages: [
        { speaker: 'Mira', text: "Father says you came from another world. I believe him. There's something different about how you move between bodies." },
        { speaker: 'Mira', text: "The four Guardians protect the balance of this land. Ignis to the south, Aquaris to the north, Terra to the west, Aeros to the east." },
      ],
    }),
  ],

  // ═══ POL — Innkeeper, friendly ════════════════════════════════════════
  pol: [
    (qt) => {
      if (questDone(qt, 'q12_guardians_trial')) {
        return {
          messages: [
            { speaker: 'Pol — Innkeeper', text: "A Guardian! You actually did it! Tonight — the best barrel I've got!" },
          ],
        };
      }
      return null;
    },
    () => ({
      messages: [
        { speaker: 'Pol — Innkeeper', text: "Welcome to the Rusty Tankard. You're one of those... Spheres, aren't you? We've seen a few come through. Most don't last long." },
        { speaker: 'Pol — Innkeeper', text: "Word of advice — don't go into the elemental zones unprepared. The creatures there wield magic." },
      ],
    }),
  ],

  // ═══ STRANGER — Silent, knows everything ═══════════════════════════════
  stranger: [
    // Quest 8 (Wind Song) — only speaks when 3 other zones done
    (qt) => {
      if (questDone(qt, 'q5_frozen_trail') && questDone(qt, 'q6_ashen_path') &&
          questDone(qt, 'q7_stone_heart') && !questDone(qt, 'q8_wind_song')) {
        return {
          messages: [
            { speaker: '???', text: "Three Guardians. Not bad." },
            { speaker: '???', text: "The fourth is different. He already knows about you. Sees right through people." },
            { speaker: '???', text: "Go to him yourself. Let him start first. That's the only way." },
          ],
        };
      }
      return null;
    },
    // After Guardian defeated — leaves
    (qt) => {
      if (questDone(qt, 'q12_guardians_trial')) {
        return {
          messages: [
            { speaker: '???', text: "..." },
            { speaker: '???', text: "It's done then. Good." },
            { speaker: '???', text: "The Void is closer than anyone thinks. But you know that now." },
          ],
        };
      }
      return null;
    },
    // Default — barely speaks
    () => ({
      messages: [
        { speaker: '???', text: "..." },
        { speaker: '???', text: "You can see me. Interesting. Most can't. Or pretend not to." },
      ],
    }),
  ],
};

export function getNPCDialog(npcId: string, qt: QuestTracker): DialogResult {
  const providers = NPC_DIALOGS[npcId];
  if (!providers) {
    return { messages: [{ speaker: npcId, text: '...' }] };
  }
  for (const provider of providers) {
    const result = provider(qt);
    if (result) return result;
  }
  return { messages: [{ speaker: npcId, text: '...' }] };
}

export const PROLOGUE_DIALOG: DialogMessage[] = [
  { speaker: 'Nikola Tesla', text: "They came from nowhere. Bullets pass through them. Shells crumble to dust. We tried everything — electricity, explosives, chemicals. Nothing works." },
  { speaker: 'Marie Curie', text: "I found the same frequency in my radiation readings — but from empty air. As if another world vibrates on the same wavelength as these creatures." },
  { speaker: 'Nikola Tesla', text: "We built the Transfer Machine. It separates consciousness from body and sends it to that other world — as a Sphere. A pure mind, able to inhabit any creature." },
  { speaker: 'Marie Curie', text: "Magic there isn't magic. It's physics at a different frequency. Learn it. Master it. Bring it back. It's the only weapon that works against the Void." },
  { speaker: 'Nikola Tesla', text: "You're not the first volunteer. But you might be the first to return strong enough. Go. Find a body. Learn everything you can." },
  { speaker: '', text: "You feel yourself dissolving... fading... and then reforming. A bright sphere of light in an unfamiliar world. You are the Essence." },
];
