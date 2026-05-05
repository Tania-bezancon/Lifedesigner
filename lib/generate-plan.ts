import type { Lang } from "@/lib/i18n/dictionaries";

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

type ArchetypeData = { reply: string[]; days: PlanDay[] };

const ARCHETYPES_EN: Record<Archetype, ArchetypeData> = {
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
          { time: "07:12", text: "sunlight, before the phone", why: "10 min of natural light anchors your circadian rhythm." },
          { time: "22:43", text: "phone out of the bedroom", why: "removes 40% of late-night cortisol triggers." },
        ],
      },
      { day: "tue", num: "02", items: [{ time: "21:30", text: "dim lights, slow tea", why: "reduces blue-light exposure 90 min before sleep." }] },
      { day: "wed", num: "03", items: [
        { time: "07:12", text: "walk · 18 min", why: "morning movement raises your sleep pressure tonight." },
        { time: "22:00", text: "no screens after", why: "your tuesday data shows you fall asleep 32 min faster." },
      ] },
      { day: "thu", num: "04", items: [{ time: "21:00", text: "read · 28 min, paper", why: "switches the nervous system from doing to resting." }] },
      { day: "fri", num: "05", items: [{ time: "21:30", text: "a bath · 38°C", why: "the post-bath temperature drop signals melatonin release." }] },
      { day: "sat", num: "06", items: [{ time: "—", text: "sleep in, fully", why: "no alarms. catch up on what monday cost." }] },
      { day: "sun", num: "07", items: [{ time: "17:00", text: "debrief · 5 min, out loud", why: "we'll adjust next week from your own words." }] },
    ],
  },
  energy: {
    reply: [
      "you wake up tired. it's not a discipline problem — it's a sequencing problem.",
      "light first. movement second. screens last.",
      "we move at 07:12 — short, steady, no hero workouts.",
    ],
    days: [
      { day: "mon", num: "01", isToday: true, items: [
        { time: "07:12", text: "walk · 22 min, eyes on the horizon", why: "horizon focus releases tension built overnight." },
        { time: "09:00", text: "first email — not before", why: "protects the first cortisol peak for your work, not theirs." },
      ] },
      { day: "tue", num: "02", items: [{ time: "07:12", text: "stretch · 8 min, hips first", why: "8 hours of sitting starts there." }] },
      { day: "wed", num: "03", items: [
        { time: "07:12", text: "walk · 22 min", why: "third walk this week — habit at 21 days, comfort at 66." },
        { time: "18:30", text: "run · 4 km, conversational pace", why: "if you can talk, you can run again tomorrow." },
      ] },
      { day: "thu", num: "04", items: [{ time: "07:12", text: "stretch · 8 min", why: "we keep the streak. 0 hero days." }] },
      { day: "fri", num: "05", items: [{ time: "07:12", text: "walk · 22 min", why: "you're 70% through the week. small finish." }] },
      { day: "sat", num: "06", items: [{ time: "10:00", text: "long walk · 60 min, no phone", why: "active recovery beats passive scrolling for tomorrow's energy." }] },
      { day: "sun", num: "07", items: [{ time: "17:00", text: "what worked, what didn't", why: "your own debrief, in your own voice." }] },
    ],
  },
  connection: {
    reply: [
      "you said you've lost touch. that's reversible — and faster than you think.",
      "two real moments this week. that's the whole prescription.",
      "we'll start with one text on monday night.",
    ],
    days: [
      { day: "mon", num: "01", isToday: true, items: [{ time: "20:00", text: "text one friend, no plan needed", why: "lowest-friction reconnection. one line is enough." }] },
      { day: "tue", num: "02", items: [{ time: "19:00", text: "write three lines about today", why: "naming what you felt makes you better company on wednesday." }] },
      { day: "wed", num: "03", items: [{ time: "12:30", text: "lunch with someone you miss", why: "midweek lunch beats weekend dinner — less performative." }] },
      { day: "thu", num: "04", items: [{ time: "07:12", text: "walk · 18 min", why: "thursdays slump. movement holds the week together." }] },
      { day: "fri", num: "05", items: [{ time: "19:00", text: "call your sister", why: "voice carries 38% more emotional content than text." }] },
      { day: "sat", num: "06", items: [{ time: "10:00", text: "market · with a friend", why: "shared errands count as quality time. nobody admits this." }] },
      { day: "sun", num: "07", items: [{ time: "17:00", text: "debrief · 10 min, out loud", why: "say what felt good. we keep that." }] },
    ],
  },
  focus: {
    reply: [
      "you're overwhelmed. we don't add — we subtract.",
      "evenings end at 20:00. that's the new rule, no exceptions.",
      "three deep-work blocks this week. the rest can wait.",
    ],
    days: [
      { day: "mon", num: "01", isToday: true, items: [
        { time: "09:00", text: "deep work · 92 min, slack closed", why: "your peak cognitive window is the first 90 min after coffee." },
        { time: "20:00", text: "stop. close the laptop.", why: "evenings are for the version of you that isn't working." },
      ] },
      { day: "tue", num: "02", items: [{ time: "09:00", text: "deep work · 92 min", why: "two days in a row builds the habit; three breaks it." }] },
      { day: "wed", num: "03", items: [{ time: "12:30", text: "lunch out, notifications off", why: "midweek reset prevents thursday burnout." }] },
      { day: "thu", num: "04", items: [{ time: "09:00", text: "deep work · 92 min", why: "third block. friday is for shipping, not starting." }] },
      { day: "fri", num: "05", items: [{ time: "17:00", text: "leave early. you earned it.", why: "ending strong on friday makes monday feel chosen." }] },
      { day: "sat", num: "06", items: [{ time: "—", text: "no work, no exception", why: "the rule is the rule. one slip turns into four." }] },
      { day: "sun", num: "07", items: [{ time: "17:00", text: "look at next week — 10 min, gently", why: "scout, don't plan. anxiety lives in over-planning." }] },
    ],
  },
  calm: {
    reply: [
      "the noise is in the schedule, not in you.",
      "we'll thin out the week, not fill it. less, on purpose.",
      "every day starts with tea, before the phone.",
    ],
    days: [
      { day: "mon", num: "01", isToday: true, items: [
        { time: "07:30", text: "tea, before the phone", why: "the first 12 minutes of the day shape the next 12 hours." },
        { time: "21:00", text: "read · 28 min, paper", why: "lowers heart rate by ~6 bpm in 8 min." },
      ] },
      { day: "tue", num: "02", items: [{ time: "07:30", text: "slow morning, no rush", why: "leave 18 minutes of margin. it's the whole point." }] },
      { day: "wed", num: "03", items: [{ time: "13:00", text: "lunch alone, near a window", why: "natural light at midday resets your evening cortisol." }] },
      { day: "thu", num: "04", items: [{ time: "07:30", text: "tea, no phone", why: "we're protecting the morning. four days running." }] },
      { day: "fri", num: "05", items: [{ time: "21:00", text: "stretch · 10 min, slow", why: "the body holds the week. it gets to release first." }] },
      { day: "sat", num: "06", items: [{ time: "—", text: "one thing you used to love", why: "no productivity. just memory and pleasure." }] },
      { day: "sun", num: "07", items: [{ time: "17:00", text: "10 minutes of nothing", why: "boredom is a nutrient. you've been deficient." }] },
    ],
  },
  default: {
    reply: [
      "noted. we'll keep it modest — a few habits, mindful of your monday.",
      "the rules are small enough to keep, even on a bad day.",
      "you can always change one item. the rest will adjust.",
    ],
    days: [
      { day: "mon", num: "01", isToday: true, items: [
        { time: "07:12", text: "walk · 18 min", why: "lowest-friction habit. start where you'll actually start." },
        { time: "22:30", text: "phone out of the bedroom", why: "the single highest-leverage change in the week." },
      ] },
      { day: "tue", num: "02", items: [{ time: "19:00", text: "write three lines", why: "writing slows the day down. three lines is the minimum." }] },
      { day: "wed", num: "03", items: [
        { time: "12:30", text: "lunch with someone", why: "midweek connection prevents thursday isolation." },
        { time: "21:00", text: "read · 28 min", why: "displaces 28 min of evening scrolling." },
      ] },
      { day: "thu", num: "04", items: [{ time: "07:12", text: "walk · 18 min", why: "second walk. consistency beats intensity." }] },
      { day: "fri", num: "05", items: [{ time: "18:30", text: "run · 4 km, easy", why: "weekend energy starts here, not saturday morning." }] },
      { day: "sat", num: "06", items: [
        { time: "10:00", text: "market · no list", why: "browse without optimizing. it's a small freedom." },
        { time: "—", text: "one thing you used to love", why: "no productivity. just remember." },
      ] },
      { day: "sun", num: "07", items: [{ time: "17:00", text: "debrief · 10 min, out loud", why: "your own voice tells me how to redesign tuesday." }] },
    ],
  },
};

const ARCHETYPES_FR: Record<Archetype, ArchetypeData> = {
  sleep: {
    reply: [
      "tu dors mal. donc on redessine le soir, pas le matin.",
      "téléphone hors de la chambre dès lundi — ce seul changement vaut quatre heures.",
      "on mesure la lumière, pas les minutes.",
    ],
    days: [
      { day: "lun", num: "01", isToday: true, items: [
        { time: "07:12", text: "lumière du jour, avant le téléphone", why: "10 min de lumière naturelle ancrent ton rythme circadien." },
        { time: "22:43", text: "téléphone hors de la chambre", why: "supprime 40% des pics de cortisol nocturnes." },
      ] },
      { day: "mar", num: "02", items: [{ time: "21:30", text: "lumière tamisée, thé lent", why: "réduit l'exposition à la lumière bleue 90 min avant le coucher." }] },
      { day: "mer", num: "03", items: [
        { time: "07:12", text: "marche · 18 min", why: "le mouvement matinal augmente ta pression de sommeil ce soir." },
        { time: "22:00", text: "plus d'écran après", why: "tes données de mardi montrent un endormissement 32 min plus rapide." },
      ] },
      { day: "jeu", num: "04", items: [{ time: "21:00", text: "lecture · 28 min, papier", why: "passe le système nerveux du faire au repos." }] },
      { day: "ven", num: "05", items: [{ time: "21:30", text: "bain · 38°C", why: "la chute de température post-bain déclenche la mélatonine." }] },
      { day: "sam", num: "06", items: [{ time: "—", text: "grasse matinée, complète", why: "pas de réveil. récupère ce que lundi t'a coûté." }] },
      { day: "dim", num: "07", items: [{ time: "17:00", text: "debrief · 5 min, à voix haute", why: "on ajustera la semaine prochaine avec tes propres mots." }] },
    ],
  },
  energy: {
    reply: [
      "tu te réveilles fatiguée. ce n'est pas un problème de discipline — c'est un problème d'ordre.",
      "la lumière d'abord. le mouvement ensuite. les écrans en dernier.",
      "on bouge à 07:12 — court, régulier, pas d'exploit.",
    ],
    days: [
      { day: "lun", num: "01", isToday: true, items: [
        { time: "07:12", text: "marche · 22 min, regard à l'horizon", why: "regarder loin libère la tension accumulée la nuit." },
        { time: "09:00", text: "premier email — pas avant", why: "protège le premier pic de cortisol pour ton travail, pas le leur." },
      ] },
      { day: "mar", num: "02", items: [{ time: "07:12", text: "étirements · 8 min, hanches d'abord", why: "8 heures assise commencent là." }] },
      { day: "mer", num: "03", items: [
        { time: "07:12", text: "marche · 22 min", why: "troisième marche cette semaine — habitude à 21 jours, confort à 66." },
        { time: "18:30", text: "course · 4 km, allure conversation", why: "si tu peux parler, tu peux courir demain aussi." },
      ] },
      { day: "jeu", num: "04", items: [{ time: "07:12", text: "étirements · 8 min", why: "on garde la série. 0 jour héroïque." }] },
      { day: "ven", num: "05", items: [{ time: "07:12", text: "marche · 22 min", why: "70% de la semaine est passé. petite arrivée." }] },
      { day: "sam", num: "06", items: [{ time: "10:00", text: "longue marche · 60 min, sans téléphone", why: "récupération active > scroll passif pour l'énergie de demain." }] },
      { day: "dim", num: "07", items: [{ time: "17:00", text: "ce qui a marché, ce qui n'a pas", why: "ton propre debrief, dans tes propres mots." }] },
    ],
  },
  connection: {
    reply: [
      "tu as dit que tu avais perdu le contact. c'est réversible — plus vite que tu ne le crois.",
      "deux vrais moments cette semaine. c'est toute l'ordonnance.",
      "on commence par un sms lundi soir.",
    ],
    days: [
      { day: "lun", num: "01", isToday: true, items: [{ time: "20:00", text: "écris à un.e ami.e, sans plan", why: "reconnexion à friction zéro. une ligne suffit." }] },
      { day: "mar", num: "02", items: [{ time: "19:00", text: "écris trois lignes sur ta journée", why: "nommer ce que tu ressens te rend meilleure compagnie mercredi." }] },
      { day: "mer", num: "03", items: [{ time: "12:30", text: "déjeuner avec quelqu'un qui te manque", why: "déjeuner en semaine > dîner du week-end — moins théâtral." }] },
      { day: "jeu", num: "04", items: [{ time: "07:12", text: "marche · 18 min", why: "les jeudis flanchent. le mouvement tient la semaine." }] },
      { day: "ven", num: "05", items: [{ time: "19:00", text: "appelle ta sœur", why: "la voix porte 38% de plus d'émotion que le texte." }] },
      { day: "sam", num: "06", items: [{ time: "10:00", text: "marché · à deux", why: "les courses partagées comptent comme un vrai moment. personne ne l'admet." }] },
      { day: "dim", num: "07", items: [{ time: "17:00", text: "debrief · 10 min, à voix haute", why: "dis ce qui a fait du bien. on garde ça." }] },
    ],
  },
  focus: {
    reply: [
      "tu es submergée. on n'ajoute pas — on retire.",
      "les soirées finissent à 20:00. nouvelle règle, sans exception.",
      "trois blocs de deep work cette semaine. le reste peut attendre.",
    ],
    days: [
      { day: "lun", num: "01", isToday: true, items: [
        { time: "09:00", text: "deep work · 92 min, slack fermé", why: "ta fenêtre cognitive de pointe = les 90 premières min après le café." },
        { time: "20:00", text: "stop. ferme le laptop.", why: "les soirées sont pour la version de toi qui ne travaille pas." },
      ] },
      { day: "mar", num: "02", items: [{ time: "09:00", text: "deep work · 92 min", why: "deux jours d'affilée installent l'habitude ; trois la cassent." }] },
      { day: "mer", num: "03", items: [{ time: "12:30", text: "déjeuner dehors, notifs coupées", why: "le reset du milieu de semaine évite le burnout du jeudi." }] },
      { day: "jeu", num: "04", items: [{ time: "09:00", text: "deep work · 92 min", why: "troisième bloc. vendredi est pour livrer, pas commencer." }] },
      { day: "ven", num: "05", items: [{ time: "17:00", text: "pars tôt. tu l'as mérité.", why: "finir fort vendredi rend lundi choisi." }] },
      { day: "sam", num: "06", items: [{ time: "—", text: "zéro travail, sans exception", why: "la règle est la règle. un écart en devient quatre." }] },
      { day: "dim", num: "07", items: [{ time: "17:00", text: "regarde la semaine prochaine — 10 min, doucement", why: "explore, ne planifie pas. l'anxiété vit dans la sur-planification." }] },
    ],
  },
  calm: {
    reply: [
      "le bruit est dans l'agenda, pas en toi.",
      "on allège la semaine, on ne la remplit pas. moins, exprès.",
      "chaque jour commence par un thé, avant le téléphone.",
    ],
    days: [
      { day: "lun", num: "01", isToday: true, items: [
        { time: "07:30", text: "thé, avant le téléphone", why: "les 12 premières minutes de la journée façonnent les 12 heures suivantes." },
        { time: "21:00", text: "lecture · 28 min, papier", why: "baisse le rythme cardiaque d'environ 6 bpm en 8 min." },
      ] },
      { day: "mar", num: "02", items: [{ time: "07:30", text: "matin lent, sans rush", why: "laisse 18 min de marge. c'est tout l'enjeu." }] },
      { day: "mer", num: "03", items: [{ time: "13:00", text: "déjeuner seule, près d'une fenêtre", why: "la lumière naturelle à midi remet à zéro ton cortisol du soir." }] },
      { day: "jeu", num: "04", items: [{ time: "07:30", text: "thé, sans téléphone", why: "on protège le matin. quatre jours d'affilée." }] },
      { day: "ven", num: "05", items: [{ time: "21:00", text: "étirements · 10 min, lents", why: "le corps tient la semaine. il a droit au relâchement en premier." }] },
      { day: "sam", num: "06", items: [{ time: "—", text: "une chose que tu aimais", why: "pas de productivité. juste mémoire et plaisir." }] },
      { day: "dim", num: "07", items: [{ time: "17:00", text: "10 minutes de rien", why: "l'ennui est un nutriment. tu en manques." }] },
    ],
  },
  default: {
    reply: [
      "noté. on garde modeste — quelques habitudes, attentives à ton lundi.",
      "les règles sont assez petites pour tenir, même un mauvais jour.",
      "tu peux changer un élément à tout moment. le reste s'ajustera.",
    ],
    days: [
      { day: "lun", num: "01", isToday: true, items: [
        { time: "07:12", text: "marche · 18 min", why: "habitude à friction minimale. commence là où tu commenceras vraiment." },
        { time: "22:30", text: "téléphone hors de la chambre", why: "le seul changement à plus fort levier de la semaine." },
      ] },
      { day: "mar", num: "02", items: [{ time: "19:00", text: "écris trois lignes", why: "écrire ralentit la journée. trois lignes c'est le minimum." }] },
      { day: "mer", num: "03", items: [
        { time: "12:30", text: "déjeuner avec quelqu'un", why: "la connexion en milieu de semaine évite l'isolement du jeudi." },
        { time: "21:00", text: "lecture · 28 min", why: "remplace 28 min de scroll du soir." },
      ] },
      { day: "jeu", num: "04", items: [{ time: "07:12", text: "marche · 18 min", why: "deuxième marche. la régularité bat l'intensité." }] },
      { day: "ven", num: "05", items: [{ time: "18:30", text: "course · 4 km, facile", why: "l'énergie du week-end commence là, pas samedi matin." }] },
      { day: "sam", num: "06", items: [
        { time: "10:00", text: "marché · sans liste", why: "flâner sans optimiser. c'est une petite liberté." },
        { time: "—", text: "une chose que tu aimais", why: "pas de productivité. juste te souvenir." },
      ] },
      { day: "dim", num: "07", items: [{ time: "17:00", text: "debrief · 10 min, à voix haute", why: "ta propre voix me dit comment redessiner mardi." }] },
    ],
  },
};

const ARCHETYPES = { en: ARCHETYPES_EN, fr: ARCHETYPES_FR } as const;

const KEYWORDS_EN: Record<Exclude<Archetype, "default">, RegExp> = {
  sleep: /sleep|tired|exhaust|insomn|fatigue|rest/,
  energy: /energy|motivat|burnout|drained|lethargic|listless/,
  connection: /friend|lonely|alone|isolat|connect|family|sister|brother|miss/,
  focus: /work|focus|productiv|overwhelm|stress|deadline|busy/,
  calm: /anxiety|anxious|peace|calm|slow|quiet|chaos|noisy|noise/,
};

const KEYWORDS_FR: Record<Exclude<Archetype, "default">, RegExp> = {
  sleep: /dors|sommeil|fatig|insomn|épuis|repos/,
  energy: /énergie|motiv|burnout|épuis|léthar/,
  connection: /ami|seul|isol|famille|sœur|frère|manque|relation/,
  focus: /travail|focus|productiv|submer|stress|délai|surcharg/,
  calm: /anxi|paix|calme|lent|silence|chaos|bruit/,
};

function pickArchetype(input: string, lang: Lang): Archetype {
  const text = input.toLowerCase();
  const keywords = lang === "fr" ? KEYWORDS_FR : KEYWORDS_EN;
  for (const [key, re] of Object.entries(keywords) as [Exclude<Archetype, "default">, RegExp][]) {
    if (re.test(text)) return key;
  }
  return "default";
}

export function generatePlan(input: string, lang: Lang = "en"): GeneratedPlan {
  const archetype = pickArchetype(input, lang);
  const tpl = ARCHETYPES[lang][archetype];
  return {
    intent: input.trim(),
    archetype,
    reply: tpl.reply,
    days: tpl.days,
  };
}

// Default plan exposed per language so PlanSection can render the right one
// when no user plan exists.
export const DEFAULT_PLAN = {
  en: ARCHETYPES_EN.default,
  fr: ARCHETYPES_FR.default,
} as const;
