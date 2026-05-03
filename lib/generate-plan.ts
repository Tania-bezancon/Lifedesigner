export type PlanItem = { time: string; text: string };
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
      "okay. let's protect your evenings first.",
      "a little less screen, a little more darkness.",
      "monday begins gently — phone out of the bedroom.",
    ],
    days: [
      {
        day: "mon",
        num: "01",
        isToday: true,
        items: [
          { time: "07:00", text: "walk · 20 min, light on the face" },
          { time: "22:30", text: "phone out of bedroom" },
        ],
      },
      {
        day: "tue",
        num: "02",
        items: [{ time: "21:30", text: "lights down, slow tea" }],
      },
      {
        day: "wed",
        num: "03",
        items: [
          { time: "07:00", text: "walk · 20 min" },
          { time: "22:00", text: "no screens after" },
        ],
      },
      {
        day: "thu",
        num: "04",
        items: [{ time: "21:00", text: "read · 30 min" }],
      },
      {
        day: "fri",
        num: "05",
        items: [{ time: "21:30", text: "a bath, slowly" }],
      },
      {
        day: "sat",
        num: "06",
        items: [{ time: "—", text: "sleep in. fully." }],
      },
      {
        day: "sun",
        num: "07",
        items: [{ time: "17:00", text: "debrief · 5 min, out loud" }],
      },
    ],
  },
  energy: {
    reply: [
      "morning light, before anything else.",
      "we move at seven — short and steady.",
      "no email before nine.",
    ],
    days: [
      {
        day: "mon",
        num: "01",
        isToday: true,
        items: [
          { time: "07:00", text: "walk · 20 min, sunlight" },
          { time: "09:00", text: "first email" },
        ],
      },
      {
        day: "tue",
        num: "02",
        items: [{ time: "07:00", text: "stretch · 8 min" }],
      },
      {
        day: "wed",
        num: "03",
        items: [
          { time: "07:00", text: "walk · 20 min" },
          { time: "18:30", text: "run · 4 km" },
        ],
      },
      {
        day: "thu",
        num: "04",
        items: [{ time: "07:00", text: "stretch · 8 min" }],
      },
      {
        day: "fri",
        num: "05",
        items: [{ time: "07:00", text: "walk · 20 min" }],
      },
      {
        day: "sat",
        num: "06",
        items: [{ time: "10:00", text: "long walk, no phone" }],
      },
      {
        day: "sun",
        num: "07",
        items: [{ time: "17:00", text: "what worked, what didn't" }],
      },
    ],
  },
  connection: {
    reply: [
      "you said you'd lost touch.",
      "we'll put two real moments back in.",
      "lunch with someone you miss — wednesday.",
    ],
    days: [
      {
        day: "mon",
        num: "01",
        isToday: true,
        items: [
          { time: "20:00", text: "text one friend, no plan needed" },
        ],
      },
      {
        day: "tue",
        num: "02",
        items: [{ time: "19:00", text: "write three lines" }],
      },
      {
        day: "wed",
        num: "03",
        items: [
          { time: "12:30", text: "lunch with someone you miss" },
        ],
      },
      {
        day: "thu",
        num: "04",
        items: [{ time: "07:00", text: "walk · 20 min" }],
      },
      {
        day: "fri",
        num: "05",
        items: [{ time: "19:00", text: "call your sister" }],
      },
      {
        day: "sat",
        num: "06",
        items: [
          { time: "10:00", text: "market · with a friend" },
        ],
      },
      {
        day: "sun",
        num: "07",
        items: [{ time: "17:00", text: "debrief · 10 min, out loud" }],
      },
    ],
  },
  focus: {
    reply: [
      "the week is too loud right now.",
      "we'll cut, then protect what matters.",
      "evenings end at eight — that's the rule.",
    ],
    days: [
      {
        day: "mon",
        num: "01",
        isToday: true,
        items: [
          { time: "09:00", text: "deep work · 90 min, no slack" },
          { time: "20:00", text: "stop. close laptop." },
        ],
      },
      {
        day: "tue",
        num: "02",
        items: [{ time: "09:00", text: "deep work · 90 min" }],
      },
      {
        day: "wed",
        num: "03",
        items: [{ time: "12:30", text: "lunch out, no notifications" }],
      },
      {
        day: "thu",
        num: "04",
        items: [{ time: "09:00", text: "deep work · 90 min" }],
      },
      {
        day: "fri",
        num: "05",
        items: [{ time: "17:00", text: "leave early. you earned it." }],
      },
      {
        day: "sat",
        num: "06",
        items: [{ time: "—", text: "no work, no exception" }],
      },
      {
        day: "sun",
        num: "07",
        items: [{ time: "17:00", text: "look at next week, gently" }],
      },
    ],
  },
  calm: {
    reply: [
      "we'll thin out the week, not fill it.",
      "less, on purpose.",
      "a slow morning, every day.",
    ],
    days: [
      {
        day: "mon",
        num: "01",
        isToday: true,
        items: [
          { time: "07:30", text: "tea, before the phone" },
          { time: "21:00", text: "read · 30 min" },
        ],
      },
      {
        day: "tue",
        num: "02",
        items: [{ time: "07:30", text: "slow morning, no rush" }],
      },
      {
        day: "wed",
        num: "03",
        items: [{ time: "13:00", text: "lunch alone, near a window" }],
      },
      {
        day: "thu",
        num: "04",
        items: [{ time: "07:30", text: "tea, no phone" }],
      },
      {
        day: "fri",
        num: "05",
        items: [{ time: "21:00", text: "stretch · 10 min" }],
      },
      {
        day: "sat",
        num: "06",
        items: [{ time: "—", text: "one thing you used to love" }],
      },
      {
        day: "sun",
        num: "07",
        items: [{ time: "17:00", text: "10 minutes of nothing" }],
      },
    ],
  },
  default: {
    reply: [
      "noted.",
      "we'll keep it modest — a few habits, mindful of your monday.",
      "you can always change one.",
    ],
    days: [
      {
        day: "mon",
        num: "01",
        isToday: true,
        items: [
          { time: "07:00", text: "walk · 20 min" },
          { time: "22:30", text: "phone out of bedroom" },
        ],
      },
      {
        day: "tue",
        num: "02",
        items: [{ time: "19:00", text: "write three lines" }],
      },
      {
        day: "wed",
        num: "03",
        items: [
          { time: "12:30", text: "lunch with lea" },
          { time: "21:00", text: "read · 30 min" },
        ],
      },
      {
        day: "thu",
        num: "04",
        items: [{ time: "07:00", text: "walk · 20 min" }],
      },
      {
        day: "fri",
        num: "05",
        items: [{ time: "18:30", text: "run · 4 km" }],
      },
      {
        day: "sat",
        num: "06",
        items: [
          { time: "10:00", text: "market · no list" },
          { time: "—", text: "one thing you used to love" },
        ],
      },
      {
        day: "sun",
        num: "07",
        items: [{ time: "17:00", text: "debrief · 10 min, out loud" }],
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
