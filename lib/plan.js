// The family's 7-day plan data and daily habit definitions.

export const FAMILY = [
  { id: "dad", name: "Dad", emoji: "👨", color: "clay" },
  { id: "mom", name: "Mom", emoji: "👩", color: "sage" },
  { id: "son", name: "Son", emoji: "👦", color: "clay" },
  { id: "daughter", name: "Daughter", emoji: "👧", color: "sage" },
];

export const MEAL_SLOTS = [
  { id: "breakfast", label: "Breakfast", time: "Morning" },
  { id: "lunch", label: "Lunch", time: "Midday" },
  { id: "snack", label: "Snack", time: "Afternoon" },
  { id: "dinner", label: "Dinner", time: "Evening" },
];

// 7 days, keyed by weekday index (0 = Sunday, the start of the week in KSA)
export const WEEK = [
  {
    day: "Sunday",
    takeout: false,
    meals: {
      breakfast: "Anda (egg) + 1 atta roti, tomato & cucumber; chai with less sugar",
      lunch: "Chicken salan + 1 atta roti or ½ plate rice + salad",
      snack: "Seasonal fruit (apple, orange, banana) + few almonds",
      dinner: "Masoor/moong daal + palak or bhindi sabzi + 1–2 atta roti",
    },
  },
  {
    day: "Monday",
    takeout: false,
    meals: {
      breakfast: "Vegetable omelette + 1 atta roti; fruit",
      lunch: "Chana daal + aloo sabzi + 1–2 atta roti + salad",
      snack: "Handful of dry fruits (almonds, walnuts) + an orange",
      dinner: "Mix sabzi (aloo-gobi or mixed veg) + roti + kachumar salad",
    },
  },
  {
    day: "Tuesday",
    takeout: true,
    meals: {
      breakfast: "Oats with milk & banana, or anda + roti before the busy day",
      lunch: "Takeout: choose grilled chicken/tikka + salad + 1 roti, skip the fries & soft drink",
      snack: "Cut cucumber & carrot + fruit",
      dinner: "Home light: daal + 1 roti + salad",
    },
  },
  {
    day: "Wednesday",
    takeout: false,
    meals: {
      breakfast: "Besan cheela (chickpea pancake) with veg + chutney; fruit",
      lunch: "Chicken/keema with palak + ½ plate rice + salad",
      snack: "Fruit + a small handful of peanuts",
      dinner: "Moong daal + bhindi or lauki sabzi + 1–2 atta roti",
    },
  },
  {
    day: "Thursday",
    takeout: false,
    meals: {
      breakfast: "Anda + atta paratha (dry-cooked, little oil) + tomato; fruit",
      lunch: "Rajma/lobia (beans) + ½ plate rice + salad",
      snack: "Dates (2–3) + walnuts",
      dinner: "Sabzi (mixed veg or karela/tinda) + daal + roti",
    },
  },
  {
    day: "Friday",
    takeout: true,
    meals: {
      breakfast: "Family breakfast: anda, atta roti/paratha, seasonal fruit",
      lunch: "Restaurant: choose roast/karahi over fried, salad first, water not soda",
      snack: "Fruit before you go out (so no one arrives hungry)",
      dinner: "Light home dinner: daal + roti + salad",
    },
  },
  {
    day: "Saturday",
    takeout: false,
    meals: {
      breakfast: "Halwa-free option: anda bhurji + roti + fruit; chai low sugar",
      lunch: "Chicken salan + ½ plate rice + big salad",
      snack: "Fresh fruit chaat (no added sugar) or a fruit + dry fruits",
      dinner: "Daal + sabzi + roti (family favourites, leftovers welcome)",
    },
  },
];

// Daily whole-family habits to check off
export const HABITS = [
  { id: "veg", label: "Half-plate veg at lunch & dinner", icon: "🥗" },
  { id: "water", label: "Water was the main drink", icon: "💧" },
  { id: "nosugar", label: "No sugary drinks today", icon: "🚫🥤" },
  { id: "move", label: "Everyone moved / played 30–60 min", icon: "🏃" },
  { id: "together", label: "Ate a meal together, no screens", icon: "🍽️" },
];

// Water tracking: cups per person per day
export const WATER_GOAL = 8;

// Roti & rice guide — what to buy, what to skip. "Roti" in the plan means whole-wheat atta.
export const BREAD_GUIDE = {
  choose: [
    "Atta roti / chapati — whole-wheat, the everyday choice",
    "Chakki atta (stone-ground whole wheat) — more fiber",
    "Add besan or bran to atta for extra fiber & protein",
    "Brown/basmati rice, and keep rice to ½ plate",
    "Oats — plain, with milk (not instant sweetened)",
    "Dry-cooked (phulka) roti with little or no oil",
  ],
  skip: [
    "Maida naan, sheermal, white bread (fast sugar, no fiber)",
    "Paratha soaked in ghee/oil — dry-cook it instead",
    "Big daily portions of white rice",
    "Puri, samosa, pakora (deep-fried) as daily items",
    "Rusk, sweet biscuits, cake with chai every day",
  ],
  note: "Whole-wheat atta roti keeps you full longer and doesn't spike blood sugar like maida (white flour) does. Portion for an adult: about 1–2 rotis OR ½ plate rice per meal (not both in big amounts) — less for the kids. Half the plate should be sabzi or salad.",
};

// STUDY PLAN — which books/subjects each child needs for the NEXT school day.
// Placeholder for now. Fill each weekday with subjects per child later.
// Structure ready: STUDY[weekdayIndex] = { childId: [ "Subject", ... ] }
// weekdayIndex: 0=Sun ... 6=Sat. Leave [] for holidays.
export const STUDY = {
  0: { son: [], daughter: [] }, // Sunday
  1: { son: [], daughter: [] }, // Monday
  2: { son: [], daughter: [] }, // Tuesday
  3: { son: [], daughter: [] }, // Wednesday
  4: { son: [], daughter: [] }, // Thursday
  5: { son: [], daughter: [] }, // Friday
  6: { son: [], daughter: [] }, // Saturday
};

export const CHILDREN = [
  { id: "son", name: "Son", emoji: "👦" },
  { id: "daughter", name: "Daughter", emoji: "👧" },
];

export const TIPS = [
  "Keep a jug of water on the table at every meal — make water, not soft drinks, the default.",
  "Half the plate should be sabzi or salad; roti/rice is only a quarter.",
  "Dry-cook rotis and parathas — less ghee/oil is the biggest home health win.",
  "A child's portion is about the size of their own fist for each food.",
  "Daal and beans are great protein and fibre — keep them in the week often.",
  "Reduce sugar in chai slowly — drop a little each week and taste adjusts.",
  "Fruit and dry fruits beat biscuits and rusk for snacks.",
  "A 20–30 minute walk after dinner helps digestion and blood sugar.",
];
