export const goalArticles = {
  litter: ['little-cleanup', 'bag-comeback', 'leftover-remix'],
  materials: ['bag-comeback', 'little-cleanup', 'leftover-remix'],
  food: ['leftover-remix', 'bag-comeback', 'little-cleanup'],
  electricity: ['leftover-remix', 'little-cleanup', 'bag-comeback'],
  prevention: ['bag-comeback', 'little-cleanup', 'leftover-remix'],
};

export function featuredArticle(goalKind) {
  return goalArticles[goalKind]?.[0] || 'bag-comeback';
}

export const articles = [
  {
    id: 'bag-comeback', category: 'REUSE & REPEAT', title: 'Give your bag a comeback',
    preview: 'The next small win might already be in your cupboard.',
    color: 'sage', icon: 'i-leaf',
    paragraphs: [
      'Your everyday bag can have another adventure. Before you head out with your family, check whether a bag you already own can do the job. A small habit starts with remembering one thing.',
      'Here is why paying attention matters: EPA reports that only 8.7% of U.S. plastic municipal waste was recycled in 2018. That figure is for all plastic in this waste category, not just bags. It does not mean the rest ended up in the ocean.',
      'Reusing and recycling are different steps. Reuse a suitable bag when you can. When a plastic bag is worn out, check your local rules: it usually does not belong in an ordinary curbside recycling bin. Some accepted bags go to a store drop-off instead.',
    ],
    action: 'Try this: put one reusable bag where your family will remember it before a trip. Log a reuse only after you actually use it again.',
    source: { title: 'EPA · Plastics: Material-Specific Data (2018)', url: 'https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/plastics-material-specific-data' },
    question: 'How can I build a habit of reusing bags for my goal?',
  },
  {
    id: 'leftover-remix', category: 'LESS WASTE, MORE POSSIBILITY', title: 'The great leftover remix',
    preview: 'Before you buy more, discover what your kitchen already has.',
    color: 'peach', icon: 'i-spark',
    paragraphs: [
      'A little planning can give food a second chance to become a meal—not trash. You do not need a perfect kitchen or an expensive recipe. Start by looking at what is already there with a trusted adult.',
      'EPA recommends checking your refrigerator, freezer, and pantry before shopping. Plan meals around food that needs using, then write a shopping list with the quantities you need. This can help avoid buying food you will not use.',
      'Leftovers can become part of a new meal. Ask an adult what has been stored safely and what fits your family’s needs. Never taste food to check whether it is safe, and do not eat food that might be spoiled just to earn progress.',
    ],
    action: 'Try this: plan one meal with an adult using safe food you already have. Count a portion only when you actually use it instead of wasting it.',
    source: { title: 'EPA · Preventing Wasted Food at Home', url: 'https://www.epa.gov/recycle/preventing-wasted-food-home' },
    question: 'How can I plan a meal to waste less food for my goal?',
  },
  {
    id: 'little-cleanup', category: 'SMALL STEPS, REAL CARE', title: 'Be a good neighbor to wildlife',
    preview: 'A safer, cleaner space begins with one careful action.',
    color: 'sand', icon: 'i-shield',
    paragraphs: [
      'You share the world with birds, fish, and many other animals. Caring for the places around you is one way to be a good neighbor. You do not have to clean a whole park to begin.',
      'NOAA explains that animals can mistake plastic for food. Eating it can cause injuries and block their digestive systems. Many plastics break into smaller pieces that animals can swallow, so litter matters even when it is small.',
      'A cleanup should protect you, too. Go with a trusted adult, follow their safety guidance, and leave broken glass, needles, batteries, chemicals, and unknown trash alone. Do not enter water, roads, private land, or isolated places to reach an item.',
    ],
    action: 'Try this: ask an adult to help choose a safe, small cleanup area. Collect only ordinary safe litter, follow local disposal rules, and wash your hands afterward.',
    source: { title: 'NOAA · Ingestion: When Animals Eat Marine Debris', url: 'https://marinedebris.noaa.gov/why-marine-debris-problem/ingestion' },
    question: 'What is one safe way to collect litter for my goal?',
  },
];
