export type PlanItem = { time: string; text: string; why?: string };
export type PlanDay = {
  day: string;
  num: string;
  items: PlanItem[];
  isToday?: boolean;
};

export type Archetype =
  | "sleep"
  | "energy"
  | "connection"
  | "focus"
  | "calm"
  | "default";

export type GeneratedPlan = {
  intent: string;
  archetype: Archetype;
  reply: string[];
  days: PlanDay[];
};

const ARCHETYPES: Record<Archetype, { reply: string[]; days: PlanDay[] }> = {
  sleep: {
    reply: [
      "you sleep badly. that means we redesign the evening, not the morning.",
      "phone out of the bedroom monday — that one change is worth four hours.",
      "we'll measure light, not minutes.",
    ],
    days: [
      {
        day: "mon",
        num: "01",
        isToday: true,
        items: [
          {
            time: "07:12",
            text: "sunlight, before the phone",
            why: "10 min of natural light anchors your circadian rhythm.",
          },
          {
            time: "22:43",
            text: "phone out of the bedroom",
            why: "removes 40% of late-night cortisol triggers.",
          },
        ],
      },
      {
        day: "tue",
        num: "02",
        items: [
          {
            time: "21:30",
            text: "dim lights, slow tea",
            why: "reduces blue-light exposure 90 min before sleep.",
          },
        ],
      },
      {
        day: "wed",
        num: "03",
        items: [
          {
            time: "07:12",
            text: "walk · 18 min",
            why: "morning movement raises your sleep pressure tonight.",
          },
          {
            time: "22:00",
            text: "no screens after",
            why: "your tuesday data shows you fall asleep 32 min faster.",
          },
        ],
      },
      {
        day: "thu",
        num: "04",
        items: [
          {
            time: "21:00",
            text: "read · 28 min, paper",
            why: "switches the nervous system from doing to resting.",
          },
        ],
      },
      {
        day: "fri",
        num: "05",
        items: [
          {
            time: "21:30",
            text: "a bath · 38°C",
            why: "the post-bath temperature drop signals melatonin release.",
          },
        ],
      },
      {
        day: "sat",
        num: "06",
        items: [
          {
            time: "—",
            text: "sleep in, fully",
            why: "no alarms. catch up on what monday cost.",
          },
        ],
      },
      {
        day: "sun",
        num: "07",
        items: [
          {
            time: "17:00",
            text: "debrief · 5 min, out loud",
            why: "we'll adjust next week from your own words.",
          },
        ],
      },
    ],
  },
  energy: {
    reply: [
      "you wake up tired. it's not a discipline problem — it's a sequencing problem.",
      "light first. movement second. screens last.",
      "we move at 07:12 — short, steady, no hero workouts.",
    ],
    days: [
      {
        day: "mon",
        num: "01",
        isToday: true,
        items: [
          {
            time: "07:12",
            text: "walk · 22 min, eyes on the horizon",
            why: "horizon focus releases tension built overnight.",
          },
          {
            time: "09:00",
            text: "first email — not before",
            why: "protects the first cortisol peak for your work, not theirs.",
          },
        ],
      },
      {
        day: "tue",
        num: "02",
        items: [
          {
            time: "07:12",
            text: "stretch · 8 min, hips first",
            why: "8 hours of sitting starts there.",
          },
        ],
      },
      {
        day: "wed",
        num: "03",
        items: [
          {
            time: "07:12",
            text: "walk · 22 min",
            why: "third walk this week — habit at 21 days, comfort at 66.",
          },
          {
            time: "18:30",
            text: "run · 4 km, conversational pace",
            why: "if you can talk, you can run again tomorrow.",
          },
        ],
      },
      {
        day: "thu",
        num: "04",
        items: [
          {
            time: "07:12",
            text: "stretch · 8 min",
            why: "we keep the streak. 0 hero days.",
          },
        ],
      },
      {
        day: "fri",
        num: "05",
        items: [
          {
            time: "07:12",
            text: "walk · 22 min",
            why: "you're 70% through the week. small finish.",
          },
        ],
      },
      {
        day: "sat",
        num: "06",
        items: [
          {
            time: "10:00",
            text: "long walk · 60 min, no phone",
            why: "active recovery beats passive scrolling for tomorrow's energy.",
          },
        ],
      },
      {
        day: "sun",
        num: "07",
        items: [
          {
            time: "17:00",
            text: "what worked, what didn't",
            why: "your own debrief, in your own voice.",
          },
        ],
      },
    ],
  },
  connection: {
    reply: [
      "you said you've lost touch. that's reversible — and faster than you think.",
      "two real moments this week. that's the whole prescription.",
      "we'll start with one text on monday night.",
    ],
    days: [
      {
        day: "mon",
        num: "01",
        isToday: true,
        items: [
          {
            time: "20:00",
            text: "text one friend, no plan needed",
            why: "lowest-friction reconnection. one line is enough.",
          },
        ],
      },
      {
        day: "tue",
        num: "02",
        items: [
          {
            time: "19:00",
            text: "write three lines about today",
            why: "naming what you felt makes you better company on wednesday.",
          },
        ],
      },
      {
        day: "wed",
        num: "03",
        items: [
          {
            time: "12:30",
            text: "lunch with someone you miss",
            why: "midweek lunch beats weekend dinner — less performative.",
          },
        ],
      },
      {
        day: "thu",
        num: "04",
        items: [
          {
            time: "07:12",
            text: "walk · 18 min",
            why: "thursdays slump. movement holds the week together.",
          },
        ],
      },
      {
        day: "fri",
        num: "05",
        items: [
          {
            time: "19:00",
            text: "call your sister",
            why: "voice carries 38% more emotional content than text.",
          },
        ],
      },
      {
        day: "sat",
        num: "06",
        items: [
          {
            time: "10:00",
            text: "market · with a friend",
            why: "shared errands count as quality time. nobody admits this.",
          },
        ],
      },
      {
        day: "sun",
        num: "07",
        items: [
          {
            time: "17:00",
            text: "debrief · 10 min, out loud",
            why: "say what felt good. we keep that.",
          },
        ],
      },
    ],
  },
  focus: {
    reply: [
      "you're overwhelmed. we don't add — we subtract.",
      "evenings end at 20:00. that's the new rule, no exceptions.",
      "three deep-work blocks this week. the rest can wait.",
    ],
    days: [
      {
        day: "mon",
        num: "01",
        isToday: true,
        items: [
          {
            time: "09:00",
            text: "deep work · 92 min, slack closed",
            why: "your peak cognitive window is the first 90 min after coffee.",
          },
          {
            time: "20:00",
            text: "stop. close the laptop.",
            why: "evenings are for the version of you that isn't working.",
          },
        ],
      },
      {
        day: "tue",
        num: "02",
        items: [
          {
            time: "09:00",
            text: "deep work · 92 min",
            why: "two days in a row builds the habit; three breaks it.",
          },
        ],
      },
      {
        day: "wed",
        num: "03",
        items: [
          {
            time: "12:30",
            text: "lunch out, notifications off",
            why: "midweek reset prevents thursday burnout.",
          },
        ],
      },
      {
        day: "thu",
        num: "04",
        items: [
          {
            time: "09:00",
            text: "deep work · 92 min",
            why: "third block. friday is for shipping, not starting.",
          },
        ],
      },
      {
        day: "fri",
        num: "05",
        items: [
          {
            time: "17:00",
            text: "leave early. you earned it.",
            why: "ending strong on friday makes monday feel chosen.",
          },
        ],
      },
      {
        day: "sat",
        num: "06",
        items: [
          {
            time: "—",
            text: "no work, no exception",
            why: "the rule is the rule. one slip turns into four.",
          },
        ],
      },
      {
        day: "sun",
        num: "07",
        items: [
          {
            time: "17:00",
            text: "look at next week — 10 min, gently",
            why: "scout, don't plan. anxiety lives in over-planning.",
          },
        ],
      },
    ],
  },
  calm: {
    reply: [
      "the noise is in the schedule, not in you.",
      "we'll thin out the week, not fill it. less, on purpose.",
      "every day starts with tea, before the phone.",
    ],
    days: [
      {
        day: "mon",
        num: "01",
        isToday: true,
        items: [
          {
            time: "07:30",
            text: "tea, before the phone",
            why: "the first 12 minutes of the day shape the next 12 hours.",
          },
          {
            time: "21:00",
            text: "read · 28 min, paper",
            why: "lowers heart rate by ~6 bpm in 8 min.",
          },
        ],
      },
      {
        day: "tue",
        num: "02",
        items: [
          {
            time: "07:30",
            text: "slow morning, no rush",
            why: "leave 18 minutes of margin. it's the whole point.",
          },
        ],
      },
      {
        day: "wed",
        num: "03",
        items: [
          {
            time: "13:00",
            text: "lunch alone, near a window",
            why: "natural light at midday resets your evening cortisol.",
          },
        ],
      },
      {
        day: "thu",
        num: "04",
        items: [
          {
            time: "07:30",
            text: "tea, no phone",
            why: "we're protecting the morning. four days running.",
          },
        ],
      },
      {
        day: "fri",
        num: "05",
        items: [
          {
            time: "21:00",
            text: "stretch · 10 min, slow",
            why: "the body holds the week. it gets to release first.",
          },
        ],
      },
      {
        day: "sat",
        num: "06",
        items: [
          {
            time: "—",
            text: "one thing you used to love",
            why: "no productivity. just memory and pleasure.",
          },
        ],
      },
      {
        day: "sun",
        num: "07",
        items: [
          {
            time: "17:00",
            text: "10 minutes of nothing",
            why: "boredom is a nutrient. you've been deficient.",
          },
        ],
      },
    ],
  },
  default: {
    reply: [
      "noted. we'll keep it modest — a few habits, mindful of your monday.",
      "the rules are small enough to keep, even on a bad day.",
      "you can always change one item. the rest will adjust.",
    ],
    days: [
      {
        day: "mon",
        num: "01",
        isToday: true,
        items: [
          {
            time: "07:12",
            text: "walk · 18 min",
            why: "lowest-friction habit. start where you'll actually start.",
          },
          {
            time: "22:30",
            text: "phone out of the bedroom",
            why: "the single highest-leverage change in the week.",
          },
        ],
      },
      {
        day: "tue",
        num: "02",
        items: [
          {
            time: "19:00",
            text: "write three lines",
            why: "writing slows the day down. three lines is the minimum.",
          },
        ],
      },
      {
        day: "wed",
        num: "03",
        items: [
          {
            time: "12:30",
            text: "lunch with someone",
            why: "midweek connection prevents thursday isolation.",
          },
          {
            time: "21:00",
            text: "read · 28 min",
            why: "displaces 28 min of evening scrolling.",
          },
        ],
      },
      {
        day: "thu",
        num: "04",
        items: [
          {
            time: "07:12",
            text: "walk · 18 min",
            why: "second walk. consistency beats intensity.",
          },
        ],
      },
      {
        day: "fri",
        num: "05",
        items: [
          {
            time: "18:30",
            text: "run · 4 km, easy",
            why: "weekend energy starts here, not saturday morning.",
          },
        ],
      },
      {
        day: "sat",
        num: "06",
        items: [
          {
            time: "10:00",
            text: "market · no list",
            why: "browse without optimizing. it's a small freedom.",
          },
          {
            time: "—",
            text: "one thing you used to love",
            why: "no productivity. just remember.",
          },
        ],
      },
      {
        day: "sun",
        num: "07",
        items: [
          {
            time: "17:00",
            text: "debrief · 10 min, out loud",
            why: "your own voice tells me how to redesign tuesday.",
          },
        ],
      },
    ],
  },
};

function pickArchetype(input: string): Archetype {
  const t = input.toLowerCase();
  if (/sleep|tired|exhaust|insomn|fatigue|rest/.test(t)) return "sleep";
  if (/energy|motivat|burnout|drained|lethargic|listless/.test(t)) return "energy";
  if (/friend|lonely|alone|isolat|connect|family|sister|brother|miss/.test(t))
    return "connection";
  if (/work|focus|productiv|overwhelm|stress|deadline|busy/.test(t))
    return "focus";
  if (/anxiety|anxious|peace|calm|slow|quiet|chaos|noisy|noise/.test(t))
    return "calm";
  return "default";
}

export function generatePlan(input: string): GeneratedPlan {
  const archetype = pickArchetype(input);
  const tpl = ARCHETYPES[archetype];
  return {
    intent: input.trim(),
    archetype,
    reply: tpl.reply,
    days: tpl.days,
  };
}

export const DEFAULT_PLAN = ARCHETYPES.default;
