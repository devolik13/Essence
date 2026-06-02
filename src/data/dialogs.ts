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

  // ═══ CAPTAIN VERN — Waldmar, terse, watches the road ═══════════════════════
  captain: [
    // After Chapter 1 finale — the Void has arrived
    (qt) => {
      if (questDone(qt, 'q12_guardians_trial')) {
        return {
          messages: [
            { speaker: 'Captain Vern', text: "Two more hunters didn't come back last night. That's five this week." },
            { speaker: 'Captain Vern', text: "Whatever's out there doesn't leave bodies. Just tracks that stop mid-stride." },
            { speaker: 'Captain Vern', text: "If you're heading into the trees — don't go alone. And don't trust anyone who's been out there too long." },
          ],
        };
      }
      return null;
    },
    // Default
    () => ({
      messages: [
        { speaker: 'Captain Vern', text: "Ashworth, yes? You're a ways from home." },
        { speaker: 'Captain Vern', text: "Walls here hold. For now. The trees to the north have gone quiet, though. Birds won't nest in them anymore." },
        { speaker: 'Captain Vern', text: "If you find work in the city — good. If you find trouble — find me first." },
      ],
    }),
  ],

  // ═══ HEALER LENA — spiritual, feels the corruption ════════════════════════
  healer: [
    // After finale
    (qt) => {
      if (questDone(qt, 'q12_guardians_trial')) {
        return {
          messages: [
            { speaker: 'Healer Lena', text: "They come to me with cuts and fevers. I can set those." },
            { speaker: 'Healer Lena', text: "But some of them — their eyes are wrong. They answer questions no one asked. They remember things that didn't happen." },
            { speaker: 'Healer Lena', text: "Whatever it is, it isn't sickness. Tinctures won't fix it. Something inside them has been... rewritten." },
          ],
        };
      }
      return null;
    },
    // Default
    () => ({
      messages: [
        { speaker: 'Healer Lena', text: "Sit if you need a bandage. Stand if you need advice. I don't always have both." },
        { speaker: 'Healer Lena', text: "You carry something. Not an injury — deeper. Like you've been somewhere you shouldn't have been, and part of you stayed there." },
        { speaker: 'Healer Lena', text: "...Sorry. Old habit. Comes from treating too many pilgrims." },
      ],
    }),
  ],

  // ═══ BLACKSMITH GORM — craftsman, pragmatic, notices the odd orders ═══════
  blacksmith: [
    (qt) => {
      if (questDone(qt, 'q12_guardians_trial')) {
        return {
          messages: [
            { speaker: 'Blacksmith Gorm', text: "Business should be good. Five new orders for blades this week. Should be." },
            { speaker: 'Blacksmith Gorm', text: "But three of the buyers didn't haggle. Not one copper. Paid the asking price, took the steel, walked out without checking the edge." },
            { speaker: 'Blacksmith Gorm', text: "A man who doesn't haggle over steel isn't planning to use it on an animal. Keep that in mind." },
          ],
        };
      }
      return null;
    },
    () => ({
      messages: [
        { speaker: 'Blacksmith Gorm', text: "Aldric's work? Good hands, that one. Tell him Gorm said his pommels still come out lopsided." },
        { speaker: 'Blacksmith Gorm', text: "I can sharpen. I can straighten. I don't do enchantments — find a mage for that, and pay twice what they ask. They're worth it once." },
        { speaker: 'Blacksmith Gorm', text: "City's been restless lately. More guards on the wall, fewer merchants on the road. Bad signs, usually." },
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

export const CHAPTER1_FINALE_DIALOG: DialogMessage[] = [
  // The Celebration
  { speaker: '', text: 'Bert told everyone. The village gathered at the tavern. Innkeeper Pol rolled out the best barrel. Lights, noise, laughter.' },
  { speaker: 'Aldric — Blacksmith', text: 'Good work. For a good fighter.' },
  { speaker: '', text: 'He holds out a weapon with his personal mark. No more words needed.' },
  { speaker: 'Mira', text: "You've changed. Not worse — just... different. That's good." },

  // The Messenger
  { speaker: '', text: 'Amid the noise and firelight — a messenger. Dusty. Rode his horse to exhaustion. From Valdmar — a neighboring city, two days away.' },
  { speaker: 'Messenger', text: "Hunters haven't returned from the forest for a week now. Livestock disappears at night — without a trace." },
  { speaker: 'Messenger', text: "People are acting strange. They speak in words that aren't theirs. They stare at one point." },
  { speaker: '', text: 'Silence.' },
  { speaker: 'Bert — Hunter', text: 'It started three weeks ago. Around the time you arrived in Ashworth.' },
  { speaker: '', text: 'The Nameless Stranger stands up. Pulls on his cloak. Leaves without a word. His mug is still warm.' },

  // The Journey Home
  { speaker: '', text: 'Four frequencies. One pattern. Somewhere in the Steam World a rift is opening right now.' },
  { speaker: '', text: 'The Sphere feels it — like a pull, like a call. The Machine is calling.' },
  { speaker: '', text: '[Screen fades to black.]' },

  // Steam World — the rift
  { speaker: '', text: 'A warp rift on the street. A Void creature is already here. The skills from the Fantasy World work.' },
  { speaker: '', text: 'The Seal of Elements activates — the rift closes.' },
  { speaker: 'Marie Curie', text: 'A stable closure. The first real one.' },
  { speaker: 'Nikola Tesla', text: 'We need more Seals like this.' },
  { speaker: '', text: 'Valdmar is waiting. This is no longer coincidence.' },
  { speaker: '', text: 'Chapter 1 — Complete.\n\n[Chapter 2 — The Shadow]' },
];

export const PROLOGUE_DIALOG: DialogMessage[] = [
  // ACT 1 — Warp Rifts
  { speaker: '', text: "Late 19th century. The age of steam and electricity." },
  { speaker: '', text: "They began appearing without warning. Warp rifts — tears in space that open for seconds and vanish. From them emerge creatures — translucent, almost non-material. They seize people and drag them into the rift." },
  { speaker: '', text: "Bullets pass through. Explosions scatter. Electric discharge leaves no trace. Armies are powerless." },

  // The Discovery
  { speaker: '', text: "Nikola Tesla and Marie Curie work with wave measurements near the rifts. Tesla builds an unconventional resonator — and finds something. A frequency that should not exist." },
  { speaker: 'Nikola Tesla', text: "Somewhere there is another place. It vibrates at the same frequency as they do." },
  { speaker: '', text: "Physical matter cannot be transferred — flesh won't pass through. But brain waves resonate perfectly. Conclusion: consciousness can be transferred." },

  // The First Volunteer
  { speaker: '', text: "A colleague — a young assistant — has been listening to their arguments for three nights. Tesla insists: more time is needed. Curie says quietly: yesterday a rift opened two blocks from the laboratory." },
  { speaker: '', text: "The assistant sets down his papers." },
  { speaker: 'You', text: "I'll go first." },

  // Before the Machine
  { speaker: '', text: "The Transfer Machine looks like a copper-and-glass coffin. Inside — grilles, wires, the smell of ozone." },
  { speaker: 'Nikola Tesla', text: "..." },
  { speaker: 'Marie Curie', text: "We don't know what's there. We don't know how long. We don't know if you'll come back as yourself." },
  { speaker: '', text: "You lie down. The lid closes. Darkness." },

  // Awakening
  { speaker: '', text: "No hands. No weight. Only light and the sensation of vast space." },
  { speaker: '', text: "Below — a village. Living people. The smell of smoke and bread. Near the resurrection stone stand bodies — as if waiting." },
  { speaker: '', text: "You are the Essence. Find a body. Press [E] to possess it." },
];
