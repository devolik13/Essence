import { QuestTracker } from '../systems/questTracker';
import { t } from '../i18n';

export interface DialogMessage {
  speaker: string;
  /** Имя говорящего на русском (если отличается от speaker) */
  speakerRu?: string;
  /** Текст диалога. Канон для NPC-диалогов — английский. */
  text: string;
  /** Русский вариант текста (для lang=ru) */
  textRu?: string;
  /** Ключ текстуры иллюстрации (показывается над панелью диалога, если текстура загружена) */
  image?: string;
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
            { speaker: 'Bert — Hunter', speakerRu: 'Берт — охотник', text: "Heard the legend of the Guardians? Fire, water, earth, wind. Four places around us. They say whoever defeats all four gains their power.", textRu: 'Слышал легенду о Стражах? Огонь, вода, земля, ветер. Четыре места вокруг нас. Говорят — кто победит всех четырёх, получит их силу.' },
            { speaker: 'Bert — Hunter', speakerRu: 'Берт — охотник', text: "I don't believe in such things. But you look like you're heading somewhere anyway. North — the lake. South — the grove. West — the hills. East — the peaks.", textRu: 'Я не верю в такое. Но ты, смотрю, всё равно куда-то собрался. На севере — озеро. На юге — роща. На западе — холмы. На востоке — вершины.' },
            { speaker: 'Bert — Hunter', speakerRu: 'Берт — охотник', text: "Be careful out there. The elementals aren't like the goblins.", textRu: 'Будь там осторожен. Элементали — это тебе не гоблины.' },
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
            { speaker: 'Bert — Hunter', speakerRu: 'Берт — охотник', text: "Miner Sven went into the hills two days ago. Hasn't come back.", textRu: 'Горняк Свен ушёл в холмы позавчера. Не вернулся.' },
            { speaker: 'Bert — Hunter', speakerRu: 'Берт — охотник', text: "You know the way — we went together three weeks back. Through the Grey Gorge, where the rock splits.", textRu: 'Ты знаешь туда дорогу — ходили вместе недели три назад. Через Серый распадок, там где скала с трещиной.' },
            { speaker: 'Bert — Hunter', speakerRu: 'Берт — охотник', text: "...You DO remember, right?", textRu: '...Ты же ПОМНИШЬ, да?' },
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
            { speaker: 'Bert — Hunter', speakerRu: 'Берт — охотник', text: "You've been to all four zones. I can tell — you move differently now.", textRu: 'Ты побывал во всех четырёх зонах. Я вижу — ты теперь двигаешься иначе.' },
            { speaker: 'Bert — Hunter', speakerRu: 'Берт — охотник', text: "The Guardians sense it too. Be ready.", textRu: 'Стражи тоже это чувствуют. Будь готов.' },
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
            { speaker: 'Bert — Hunter', speakerRu: 'Берт — охотник', text: "Still can't believe you took down a Guardian. Drinks are on me tonight.", textRu: 'До сих пор не верю, что ты одолел Стража. Сегодня выпивка за мой счёт.' },
          ],
        };
      }
      return {
        messages: [
          { speaker: 'Bert — Hunter', speakerRu: 'Берт — охотник', text: "Don't wander too far from the village until you're ready. The elementals don't play nice.", textRu: 'Не уходи далеко от деревни, пока не будешь готов. Элементали шутить не любят.' },
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
            { speaker: 'Aldric — Blacksmith', speakerRu: 'Алдрик — кузнец', text: "You said you'd bring back a stone from the grove. Where is it?", textRu: 'Ты говорил, вернёшься с камнем из рощи. Где он?' },
            { speaker: 'Aldric — Blacksmith', speakerRu: 'Алдрик — кузнец', text: "Volcanic. With red veins. From the vent in the Ashen Grove.", textRu: 'Вулканический. С красными жилами. Из жерла в Пепельной роще.' },
            { speaker: 'Aldric — Blacksmith', speakerRu: 'Алдрик — кузнец', text: "You volunteered yourself. Said you weren't afraid. Changed your mind?", textRu: 'Ты сам вызвался. Сказал что не боишься. Или передумал?' },
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
            { speaker: 'Aldric — Blacksmith', speakerRu: 'Алдрик — кузнец', text: "So you made it back from the grove.", textRu: 'Дошёл, значит. И вернулся из рощи.' },
            { speaker: 'Aldric — Blacksmith', speakerRu: 'Алдрик — кузнец', text: "...Not bad.", textRu: '...Неплохо.' },
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
            { speaker: 'Aldric — Blacksmith', speakerRu: 'Алдрик — кузнец', text: "You took down a Guardian.", textRu: 'Ты одолел Стража.' },
            { speaker: 'Aldric — Blacksmith', speakerRu: 'Алдрик — кузнец', text: "Here. My best work. For a worthy fighter.", textRu: 'Держи. Моя лучшая работа. Для достойного бойца.' },
          ],
        };
      }
      return null;
    },
    // Default
    () => ({
      messages: [
        { speaker: 'Aldric — Blacksmith', speakerRu: 'Алдрик — кузнец', text: "I forge weapons and armor for the village. Use the workbenches if you need to craft something.", textRu: 'Я кую оружие и броню для деревни. Нужно что-то смастерить — пользуйся верстаками.' },
        { speaker: 'Aldric — Blacksmith', speakerRu: 'Алдрик — кузнец', text: "Bring me ore, wood, and hides. Start with copper — it's soft, but it'll do.", textRu: 'Неси руду, дерево и шкуры. Начни с меди — мягкая, но для начала сойдёт.' },
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
            { speaker: 'Mira', speakerRu: 'Мира', text: "Father hasn't been able to get up for three days. Fever.", textRu: 'Отец три дня не встаёт. Жар.' },
            { speaker: 'Mira', speakerRu: 'Мира', text: "Helga says a Misty Lotus might help. It only grows on the island in the lake.", textRu: 'Хельга говорит — Туманный лотос поможет. Он растёт только на острове посреди озера.' },
            { speaker: 'Mira', speakerRu: 'Мира', text: "You were heading there before, weren't you? Remember the crossing?", textRu: 'Ты же туда собирался раньше, нет? Помнишь где переправа?' },
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
            { speaker: 'Mira', speakerRu: 'Мира', text: "Thank you. Really.", textRu: 'Спасибо. Правда.' },
            { speaker: 'Mira', speakerRu: 'Мира', text: "You've changed somehow. I don't know. Doesn't matter.", textRu: 'Ты изменился как-то. Не знаю. Неважно.' },
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
            { speaker: 'Mira', speakerRu: 'Мира', text: "You're different now. Not bad — just... different. It's a good thing.", textRu: 'Ты другой стал. Не злой — просто... другой. Это хорошо.' },
          ],
        };
      }
      return null;
    },
    // Default
    () => ({
      messages: [
        { speaker: 'Mira', speakerRu: 'Мира', text: "Father says you came from another world. I believe him. There's something different about how you move between bodies.", textRu: 'Отец говорит, ты пришёл из другого мира. Я ему верю. Есть что-то особенное в том, как ты переходишь из тела в тело.' },
        { speaker: 'Mira', speakerRu: 'Мира', text: "The four Guardians protect the balance of this land. Ignis to the south, Aquaris to the north, Terra to the west, Aeros to the east.", textRu: 'Четыре Стража хранят равновесие этих земель. Игнис на юге, Акварис на севере, Терра на западе, Аэрос на востоке.' },
      ],
    }),
  ],

  // ═══ POL — Innkeeper, friendly ════════════════════════════════════════
  pol: [
    (qt) => {
      if (questDone(qt, 'q12_guardians_trial')) {
        return {
          messages: [
            { speaker: 'Pol — Innkeeper', speakerRu: 'Пол — трактирщик', text: "A Guardian! You actually did it! Tonight — the best barrel I've got!", textRu: 'Страж! Ты правда это сделал! Сегодня — лучший бочонок, что у меня есть!' },
          ],
        };
      }
      return null;
    },
    () => ({
      messages: [
        { speaker: 'Pol — Innkeeper', speakerRu: 'Пол — трактирщик', text: "Welcome to the Rusty Tankard. You're one of those... Spheres, aren't you? We've seen a few come through. Most don't last long.", textRu: 'Добро пожаловать в «Ржавую кружку». Ты ведь из этих... Сфер, да? Мы таких уже видали. Большинство долго не протягивает.' },
        { speaker: 'Pol — Innkeeper', speakerRu: 'Пол — трактирщик', text: "Word of advice — don't go into the elemental zones unprepared. The creatures there wield magic.", textRu: 'Совет: не суйся в стихийные зоны без подготовки. Тамошние твари владеют магией.' },
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
            { speaker: '???', text: "Three Guardians. Not bad.", textRu: 'Три Стража. Неплохо.' },
            { speaker: '???', text: "The fourth is different. He already knows about you. Sees right through people.", textRu: 'Четвёртый — другой. Он уже знает о тебе. Видит людей насквозь.' },
            { speaker: '???', text: "Go to him yourself. Let him start first. That's the only way.", textRu: 'Иди к нему сам. Позволь ему начать первым. Это единственный способ.' },
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
            { speaker: '???', text: "...", textRu: '...' },
            { speaker: '???', text: "It's done then. Good.", textRu: 'Значит, свершилось. Хорошо.' },
            { speaker: '???', text: "The Void is closer than anyone thinks. But you know that now.", textRu: 'Пустота ближе, чем все думают. Но теперь ты это знаешь.' },
          ],
        };
      }
      return null;
    },
    // Default — barely speaks
    () => ({
      messages: [
        { speaker: '???', text: "...", textRu: '...' },
        { speaker: '???', text: "You can see me. Interesting. Most can't. Or pretend not to.", textRu: 'Ты меня видишь. Любопытно. Большинство не видит. Или делает вид, что не видит.' },
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
            { speaker: 'Captain Vern', speakerRu: 'Капитан Верн', text: "Two more hunters didn't come back last night. That's five this week.", textRu: 'Этой ночью не вернулись ещё двое охотников. За неделю — уже пятеро.' },
            { speaker: 'Captain Vern', speakerRu: 'Капитан Верн', text: "Whatever's out there doesn't leave bodies. Just tracks that stop mid-stride.", textRu: 'То, что там бродит, не оставляет тел. Только следы, что обрываются на полушаге.' },
            { speaker: 'Captain Vern', speakerRu: 'Капитан Верн', text: "If you're heading into the trees — don't go alone. And don't trust anyone who's been out there too long.", textRu: 'Если пойдёшь в лес — не ходи один. И не доверяй тем, кто пробыл там слишком долго.' },
          ],
        };
      }
      return null;
    },
    // Default
    () => ({
      messages: [
        { speaker: 'Captain Vern', speakerRu: 'Капитан Верн', text: "Ashworth, yes? You're a ways from home.", textRu: 'Эшворт, да? Далеко же ты забрался от дома.' },
        { speaker: 'Captain Vern', speakerRu: 'Капитан Верн', text: "Walls here hold. For now. The trees to the north have gone quiet, though. Birds won't nest in them anymore.", textRu: 'Стены здесь держатся. Пока. Но лес на севере затих. Птицы больше не вьют там гнёзд.' },
        { speaker: 'Captain Vern', speakerRu: 'Капитан Верн', text: "If you find work in the city — good. If you find trouble — find me first.", textRu: 'Найдёшь в городе работу — хорошо. Найдёшь неприятности — сперва найди меня.' },
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
            { speaker: 'Healer Lena', speakerRu: 'Целительница Лена', text: "They come to me with cuts and fevers. I can set those.", textRu: 'Ко мне приходят с порезами и лихорадкой. С этим я справляюсь.' },
            { speaker: 'Healer Lena', speakerRu: 'Целительница Лена', text: "But some of them — their eyes are wrong. They answer questions no one asked. They remember things that didn't happen.", textRu: 'Но у некоторых — глаза не те. Они отвечают на вопросы, которых никто не задавал. Помнят то, чего не было.' },
            { speaker: 'Healer Lena', speakerRu: 'Целительница Лена', text: "Whatever it is, it isn't sickness. Tinctures won't fix it. Something inside them has been... rewritten.", textRu: 'Что бы это ни было — это не болезнь. Настойками не вылечишь. Что-то внутри них... переписано.' },
          ],
        };
      }
      return null;
    },
    // Default
    () => ({
      messages: [
        { speaker: 'Healer Lena', speakerRu: 'Целительница Лена', text: "Sit if you need a bandage. Stand if you need advice. I don't always have both.", textRu: 'Садись, если нужна перевязка. Стой, если нужен совет. И то и другое у меня бывает не всегда.' },
        { speaker: 'Healer Lena', speakerRu: 'Целительница Лена', text: "You carry something. Not an injury — deeper. Like you've been somewhere you shouldn't have been, and part of you stayed there.", textRu: 'Ты что-то несёшь в себе. Не рану — глубже. Будто побывал там, где быть не следовало, и часть тебя осталась там.' },
        { speaker: 'Healer Lena', speakerRu: 'Целительница Лена', text: "...Sorry. Old habit. Comes from treating too many pilgrims.", textRu: '...Прости. Старая привычка. Слишком много паломников лечила.' },
      ],
    }),
  ],

  // ═══ BLACKSMITH GORM — craftsman, pragmatic, notices the odd orders ═══════
  blacksmith: [
    (qt) => {
      if (questDone(qt, 'q12_guardians_trial')) {
        return {
          messages: [
            { speaker: 'Blacksmith Gorm', speakerRu: 'Кузнец Горм', text: "Business should be good. Five new orders for blades this week. Should be.", textRu: 'Дела должны идти в гору. Пять новых заказов на клинки за неделю. Должны бы.' },
            { speaker: 'Blacksmith Gorm', speakerRu: 'Кузнец Горм', text: "But three of the buyers didn't haggle. Not one copper. Paid the asking price, took the steel, walked out without checking the edge.", textRu: 'Но трое покупателей не торговались. Ни на медяк. Заплатили сколько просил, забрали сталь и ушли, даже не проверив заточку.' },
            { speaker: 'Blacksmith Gorm', speakerRu: 'Кузнец Горм', text: "A man who doesn't haggle over steel isn't planning to use it on an animal. Keep that in mind.", textRu: 'Тот, кто не торгуется за сталь, готовит её не на зверя. Имей это в виду.' },
          ],
        };
      }
      return null;
    },
    () => ({
      messages: [
        { speaker: 'Blacksmith Gorm', speakerRu: 'Кузнец Горм', text: "Aldric's work? Good hands, that one. Tell him Gorm said his pommels still come out lopsided.", textRu: 'Работа Алдрика? Руки у него хорошие. Передай ему: Горм сказал, что навершия у него всё ещё выходят кривыми.' },
        { speaker: 'Blacksmith Gorm', speakerRu: 'Кузнец Горм', text: "I can sharpen. I can straighten. I don't do enchantments — find a mage for that, and pay twice what they ask. They're worth it once.", textRu: 'Заточить могу. Выправить могу. Зачарований не делаю — ищи мага и плати вдвое больше, чем просит. Однажды это окупится.' },
        { speaker: 'Blacksmith Gorm', speakerRu: 'Кузнец Горм', text: "City's been restless lately. More guards on the wall, fewer merchants on the road. Bad signs, usually.", textRu: 'Город в последнее время неспокоен. Больше стражи на стенах, меньше торговцев на дорогах. Обычно это дурной знак.' },
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
  { speaker: '', text: 'Bert told everyone. The village gathered at the tavern. Innkeeper Pol rolled out the best barrel. Lights, noise, laughter.', textRu: 'Берт рассказал всем. Деревня собралась у таверны. Трактирщик Пол выкатил лучший бочонок. Огни, шум, смех.' },
  { speaker: 'Aldric — Blacksmith', speakerRu: 'Алдрик — кузнец', text: 'Good work. For a good fighter.', textRu: 'Работа хорошая. Для хорошего бойца.' },
  { speaker: '', text: 'He holds out a weapon with his personal mark. No more words needed.', textRu: 'Он протягивает оружие с личным клеймом. Больше слов не нужно.' },
  { speaker: 'Mira', speakerRu: 'Мира', text: "You've changed. Not worse — just... different. That's good.", textRu: 'Ты другой стал. Не злой — просто... другой. Это хорошо.' },

  // The Messenger
  { speaker: '', text: 'Amid the noise and firelight — a messenger. Dusty. Rode his horse to exhaustion. From Valdmar — a neighboring city, two days away.', textRu: 'Среди шума и огней — гонец. Запылённый, загнал лошадь. Из Вальдмара — соседний город, два дня пути.' },
  { speaker: 'Messenger', speakerRu: 'Гонец', text: "Hunters haven't returned from the forest for a week now. Livestock disappears at night — without a trace.", textRu: 'Охотники не возвращаются из леса уже неделю. Скот пропадает ночью — без следов.' },
  { speaker: 'Messenger', speakerRu: 'Гонец', text: "People are acting strange. They speak in words that aren't theirs. They stare at one point.", textRu: 'Люди ведут себя странно. Говорят не своими словами. Смотрят в одну точку.' },
  { speaker: '', text: 'Silence.', textRu: 'Тишина.' },
  { speaker: 'Bert — Hunter', speakerRu: 'Берт — охотник', text: 'It started three weeks ago. Around the time you arrived in Ashworth.', textRu: 'Три недели назад началось. Примерно когда ты пришёл в Эшворт.' },
  { speaker: '', text: 'The Nameless Stranger stands up. Pulls on his cloak. Leaves without a word. His mug is still warm.', textRu: 'Странник без имени встаёт. Накидывает плащ. Уходит не прощаясь. Его кружка ещё тёплая.' },

  // The Journey Home
  { speaker: '', text: 'Four frequencies. One pattern. Somewhere in the Steam World a rift is opening right now.', textRu: 'Четыре частоты. Один паттерн. Где-то в паровом мире прямо сейчас открывается разрыв.' },
  { speaker: '', text: 'The Sphere feels it — like a pull, like a call. The Machine is calling.', textRu: 'Сфера чувствует его — как тягу, как зов. Машина зовёт.' },
  { speaker: '', text: '[Screen fades to black.]', textRu: '[Экран гаснет.]' },

  // Steam World — the rift
  { speaker: '', text: 'A warp rift on the street. A Void creature is already here. The skills from the Fantasy World work.', textRu: 'Варп-разрыв на улице. Существо из Пустоты уже здесь. Навыки из фэнтезийного мира работают.' },
  { speaker: '', text: 'The Seal of Elements activates — the rift closes.', textRu: 'Печать Стихий активируется — разрыв закрывается.' },
  { speaker: 'Marie Curie', speakerRu: 'Мари Кюри', text: 'A stable closure. The first real one.', textRu: 'Стабильное закрытие. Первый раз по-настоящему.' },
  { speaker: 'Nikola Tesla', speakerRu: 'Никола Тесла', text: 'We need more Seals like this.', textRu: 'Нам нужно больше таких Печатей.' },
  { speaker: '', text: 'Valdmar is waiting. This is no longer coincidence.', textRu: 'Вальдмар ждёт. Это уже не случайность.' },
  { speaker: '', text: 'Chapter 1 — Complete.\n\n[Chapter 2 — The Shadow]', textRu: 'Глава 1 — завершена.\n\n[Глава 2 — Тень]' },
];

export const PROLOGUE_DIALOG: DialogMessage[] = [
  // ACT 1 — Warp Rifts
  { speaker: '', text: "Late 19th century. The age of steam and electricity.", textRu: 'Конец XIX века. Эпоха пара и электричества.', image: 'prologue_1' },
  { speaker: '', text: "They began appearing without warning. Warp rifts — tears in space that open for seconds and vanish. From them emerge creatures — translucent, almost non-material. They seize people and drag them into the rift.", textRu: 'Они начали появляться без предупреждения. Варп-разрывы — дыры в пространстве, которые открываются на секунды и исчезают. Из них выходят существа — полупрозрачные, почти нематериальные. Они хватают людей и утаскивают в разрыв.', image: 'prologue_2' },
  { speaker: '', text: "Bullets pass through. Explosions scatter. Electric discharge leaves no trace. Armies are powerless.", textRu: 'Пули проходят насквозь. Взрывы рассеиваются. Электрический разряд не оставляет следа. Армии бессильны.', image: 'prologue_2' },

  // The Discovery
  { speaker: '', text: "Nikola Tesla and Marie Curie work with wave measurements near the rifts. Tesla builds an unconventional resonator — and finds something. A frequency that should not exist.", textRu: 'Никола Тесла и Мари Кюри работают с волновыми измерениями возле разрывов. Тесла строит нестандартный резонатор — и находит нечто. Частоту, которой не должно существовать.', image: 'prologue_3' },
  { speaker: 'Nikola Tesla', speakerRu: 'Никола Тесла', text: "Somewhere there is another place. It vibrates at the same frequency as they do.", textRu: 'Где-то есть другое место. Оно вибрирует на той же частоте что и они.', image: 'prologue_3' },
  { speaker: '', text: "Physical matter cannot be transferred — flesh won't pass through. But brain waves resonate perfectly. Conclusion: consciousness can be transferred.", textRu: 'Физическую материю переправить невозможно — плоть не проходит. Но мозговые волны резонируют идеально. Вывод: сознание можно переправить.', image: 'prologue_3' },

  // The First Volunteer
  { speaker: '', text: "A colleague — a young assistant — has been listening to their arguments for three nights. Tesla insists: more time is needed. Curie says quietly: yesterday a rift opened two blocks from the laboratory.", textRu: 'Коллега учёных — молодой ассистент — слушает их спор третью ночь подряд. Тесла настаивает: нужно больше времени. Кюри говорит тихо: вчера разрыв открылся в двух кварталах от лаборатории.', image: 'prologue_4' },
  { speaker: '', text: "The assistant sets down his papers.", textRu: 'Ассистент откладывает бумаги.', image: 'prologue_4' },
  { speaker: 'You', speakerRu: 'Ты', text: "I'll go first.", textRu: 'Я пойду первым.', image: 'prologue_4' },

  // Before the Machine
  { speaker: '', text: "The Transfer Machine looks like a copper-and-glass coffin. Inside — grilles, wires, the smell of ozone.", textRu: 'Машина переноса выглядит как гроб из меди и стекла. Внутри — решётки, провода, запах озона.', image: 'prologue_5' },
  { speaker: 'Nikola Tesla', speakerRu: 'Никола Тесла', text: "...", textRu: '...', image: 'prologue_5' },
  { speaker: 'Marie Curie', speakerRu: 'Мари Кюри', text: "We don't know what's there. We don't know how long. We don't know if you'll come back as yourself.", textRu: 'Мы не знаем что там. Мы не знаем как долго. Мы не знаем вернёшься ли ты собой.', image: 'prologue_5' },
  { speaker: '', text: "You lie down. The lid closes. Darkness.", textRu: 'Ты ложишься. Крышка закрывается. Темнота.', image: 'prologue_5' },

  // Awakening
  { speaker: '', text: "No hands. No weight. Only light and the sensation of vast space.", textRu: 'Нет рук. Нет веса. Только свет и ощущение огромного пространства.', image: 'prologue_6' },
  { speaker: '', text: "Below — a village. Living people. The smell of smoke and bread. Near the resurrection stone stand bodies — as if waiting.", textRu: 'Внизу — деревня. Живые люди. Запах дыма и хлеба. У камня возрождения стоят тела — словно ждут.', image: 'prologue_6' },
  { speaker: '', text: "You are the Essence. Find a body. Press [E] to possess it.", textRu: 'Ты — Сущность. Найди тело. Нажми [E], чтобы вселиться.' },
];

// ─── Данж «Защита лаборатории» (паровой мир) ─────────────────────────────────

export const LAB_INTRO_DIALOG: DialogMessage[] = [
  { speaker: 'Anna', speakerRu: 'Анна', text: "He's waking up! Brother — can you hear me? Open your eyes!", textRu: 'Он приходит в себя! Брат — ты слышишь меня? Открой глаза!' },
  { speaker: 'Nikola Tesla', speakerRu: 'Никола Тесла', text: "Easy. The transfer back is rough — your body forgot it had weight. Breathe.", textRu: 'Спокойно. Обратный перенос тяжёлый — тело забыло, что у него есть вес. Дыши.' },
  { speaker: 'Marie Curie', speakerRu: 'Мари Кюри', text: "Nikola... the gauges. The frequency is spiking. That's not us — something is opening the rift from THEIR side.", textRu: 'Никола... приборы. Частота зашкаливает. Это не мы — что-то открывает разрыв с ИХ стороны.' },
  { speaker: 'Marie Curie', speakerRu: 'Мари Кюри', text: "They're not here by accident. They came straight for the Machine — they know exactly what it is.", textRu: 'Они здесь не случайно. Они шли прямо к Машине — они точно знают, что это.' },
  { speaker: 'Nikola Tesla', speakerRu: 'Никола Тесла', text: "Of course they know. Every soul we send through comes back able to fight them. We've been winning. They feel it.", textRu: 'Конечно знают. Каждая душа, что мы отправляем, возвращается способной их бить. Мы побеждали. Они это чувствуют.' },
  { speaker: 'Marie Curie', speakerRu: 'Мари Кюри', text: "So they're afraid. The Machine is the one weapon that works against them — and they came to break it before it breaks them.", textRu: 'Значит, они боятся. Машина — единственное оружие, что работает против них, и они пришли сломать её, пока она не сломала их.' },
  { speaker: 'Marie Curie', speakerRu: 'Мари Кюри', text: "If the Machine is destroyed, no one returns — not you, not the others. Protect it.", textRu: 'Если Машина будет уничтожена — никто не вернётся. Ни ты, ни остальные. Защити её.' },
  { speaker: 'Anna', speakerRu: 'Анна', text: "Brother... your hands are shaking. Please come back to me alive. Again.", textRu: 'Брат... у тебя дрожат руки. Пожалуйста, вернись ко мне живым. Снова.' },
  { speaker: 'Nikola Tesla', speakerRu: 'Никола Тесла', text: "Bullets pass through them. Use what you learned THERE. It works — you proved it yourself.", textRu: 'Пули проходят сквозь них. Используй то, чему научился ТАМ. Это работает — ты сам доказал.' },
];

export const LAB_VICTORY_DIALOG: DialogMessage[] = [
  { speaker: 'Marie Curie', speakerRu: 'Мари Кюри', text: "The rift is sealed. The frequencies... they obeyed you.", textRu: 'Разрыв закрыт. Частоты... они подчинились тебе.' },
  { speaker: 'Anna', speakerRu: 'Анна', text: "You did it. You really did it. Now rest — even heroes need supper.", textRu: 'Ты справился. Ты правда справился. А теперь отдыхай — даже героям нужен ужин.' },
  { speaker: 'Nikola Tesla', speakerRu: 'Никола Тесла', text: "This was only the first breach. Go back. Learn more. We'll hold the line here.", textRu: 'Это был только первый прорыв. Возвращайся туда. Учись дальше. Здесь мы удержим рубеж.' },
];
