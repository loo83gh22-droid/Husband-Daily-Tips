/**
 * Maps action names to how-to guide slugs
 * This helps users find relevant guides for each action
 */

export function getGuideSlugForAction(actionName: string, actionTheme?: string): string | null {
  // Normalize action name for matching
  const normalizedName = actionName.toLowerCase().trim();

  // Direct name matches (most specific)
  const directMatches: Record<string, string> = {
    // Communication
    'listen without fixing': 'listen-without-fixing',
    'active listening session': 'listen-without-fixing',
    'have a hard conversation': 'have-hard-conversation',
    'ask better questions': 'ask-better-questions',
    'apologize the right way': 'apologize-right-way',
    'share your feelings': 'share-your-feelings',
    'daily check-in': 'daily-check-in',
    'express gratitude to partner': 'express-gratitude-to-partner',
    'practice the 5:1 ratio': 'practice-5-1-ratio',
    'be present during quality time': 'be-present-quality-time',

    // Intimacy
    'speak her love language': 'practice-love-languages',
    'practice love languages': 'practice-love-languages',
    'practice love language': 'practice-love-languages',
    'love language practice': 'practice-love-languages',
    'love languages': 'practice-love-languages',
    'build your love map': 'create-love-map',
    'create love map': 'create-love-map',
    'turn toward her bids': 'practice-turning-toward',
    'practice turning toward': 'practice-turning-toward',
    'non-sexual physical touch': 'non-sexual-physical-touch',
    'give non-sexual physical affection': 'non-sexual-physical-touch',
    'express gratitude for who she is': 'share-gratitude-for-character',
    'practice acts of service': 'practice-acts-of-service',
    'practice words of affirmation': 'practice-words-of-affirmation',

    // Partnership
    'help when hosting party': 'help-hosting-party',
    'help hosting party': 'help-hosting-party',
    'take over morning routine': 'handle-morning-routine',
    'handle morning routine': 'handle-morning-routine',
    'notice what needs doing': 'notice-what-needs-doing',
    'help when she\'s stressed': 'help-when-shes-stressed',
    'handle household tasks': 'handle-household-tasks',
    'support her goals': 'support-her-goals',
    'plan together': 'plan-together',
    'take over a chore': 'take-over-chore-completely',
    'be proactive around house': 'be-proactive-around-house',

    // Romance
    'plan perfect date night': 'plan-perfect-date-night',
    'plan a surprise': 'handle-surprise-right',
    'plan surprise date': 'plan-surprise-date',
    'give genuine compliment': 'give-genuine-compliment',
    'write love note': 'write-love-note',
    'plan weekend getaway': 'plan-weekend-getaway',
    'give physical affection': 'give-physical-affection',

    // Gratitude
    'express gratitude daily': 'express-gratitude-daily',
    'create gratitude list': 'gratitude-list',
    'thank her for chores': 'thank-her-for-chores',
    'acknowledge her effort': 'appreciate-her-effort',
    'send gratitude text': 'send-gratitude-text',
    'morning gratitude': 'morning-gratitude',

    // Conflict
    'resolve disagreement': 'resolve-disagreement',
    'take responsibility': 'take-responsibility',
    'find common ground': 'find-common-ground',
    'stay calm during conflict': 'stay-calm-during-conflict',
    'use i statements': 'use-i-statements',
    'make amends': 'make-amends',

    // Reconnection
    'have 20 minute conversation': 'have-20-minute-conversation',
    'ask about inner world': 'ask-about-inner-world',
    'state of union conversation': 'state-of-union-conversation',
    'do something you used to enjoy': 'do-something-you-used-to-enjoy',
    'plan surprise that shows you know her': 'plan-surprise-that-shows-you-know-her',
    'sit close and talk': 'sit-close-and-talk',

    // Quality Time
    'tech-free quality time': 'tech-free-quality-time',
    'weekly date night': 'weekly-date-night-conversation',
    'create daily ritual': 'create-daily-ritual',
    'create morning ritual': 'create-morning-ritual',
    'create evening ritual': 'create-evening-ritual',

    // Outdoor
    'go for hike': 'go-for-hike-together',
    'hike together': 'go-for-hike-together',
    'morning walk': 'morning-walk-together',
    'picnic in nature': 'picnic-in-nature',
    'stargazing date': 'stargazing-date',
    'bike ride': 'bike-ride-together',
    'evening stroll': 'evening-stroll-together',

    // Active
    'run together': 'run-together',
    'yoga together': 'yoga-in-nature',
    'outdoor workout': 'outdoor-workout',
    'swim together': 'swim-together',
    'disc golf': 'disc-golf-together',
  };

  // Check direct matches first
  if (directMatches[normalizedName]) {
    return directMatches[normalizedName];
  }

  // Keyword-based matching (fallback)
  const keywordMatches: Array<{ keywords: string[]; slug: string }> = [
    // Communication
    { keywords: ['listen', 'listening', 'hear'], slug: 'listen-without-fixing' },
    { keywords: ['conversation', 'talk', 'discuss'], slug: 'have-hard-conversation' },
    { keywords: ['question', 'ask'], slug: 'ask-better-questions' },
    { keywords: ['apologize', 'sorry', 'apology'], slug: 'apologize-right-way' },
    { keywords: ['feelings', 'emotions', 'feel'], slug: 'share-your-feelings' },
    { keywords: ['check-in', 'check in'], slug: 'daily-check-in' },
    { keywords: ['gratitude', 'thank', 'appreciate'], slug: 'express-gratitude-to-partner' },
    { keywords: ['present', 'attention', 'focus'], slug: 'be-present-quality-time' },

    // Intimacy
    { keywords: ['love language', 'love languages'], slug: 'practice-love-languages' },
    { keywords: ['love map', 'know her'], slug: 'create-love-map' },
    { keywords: ['turn toward', 'bids', 'connection'], slug: 'practice-turning-toward' },
    { keywords: ['physical touch', 'hug', 'cuddle', 'affection'], slug: 'non-sexual-physical-touch' },
    { keywords: ['acts of service', 'help', 'service'], slug: 'practice-acts-of-service' },
    { keywords: ['words of affirmation', 'compliment', 'affirmation'], slug: 'practice-words-of-affirmation' },

    // Partnership
    { keywords: ['hosting', 'party', 'guests'], slug: 'help-hosting-party' },
    { keywords: ['morning routine', 'breakfast', 'morning'], slug: 'handle-morning-routine' },
    { keywords: ['notice', 'needs doing', 'proactive'], slug: 'notice-what-needs-doing' },
    { keywords: ['stressed', 'overwhelmed', 'help'], slug: 'help-when-shes-stressed' },
    { keywords: ['household', 'chore', 'task'], slug: 'handle-household-tasks' },
    { keywords: ['goals', 'support', 'dreams'], slug: 'support-her-goals' },
    { keywords: ['plan', 'together', 'collaborate'], slug: 'plan-together' },

    // Romance
    { keywords: ['date night', 'date'], slug: 'plan-perfect-date-night' },
    { keywords: ['surprise'], slug: 'handle-surprise-right' },
    { keywords: ['compliment'], slug: 'give-genuine-compliment' },
    { keywords: ['love note', 'note', 'letter'], slug: 'write-love-note' },
    { keywords: ['weekend getaway', 'getaway', 'trip'], slug: 'plan-weekend-getaway' },

    // Gratitude
    { keywords: ['gratitude list', 'grateful'], slug: 'gratitude-list' },
    { keywords: ['gratitude text', 'text'], slug: 'send-gratitude-text' },
    { keywords: ['morning gratitude'], slug: 'morning-gratitude' },

    // Conflict
    { keywords: ['disagreement', 'conflict', 'argument'], slug: 'resolve-disagreement' },
    { keywords: ['responsibility', 'accountable'], slug: 'take-responsibility' },
    { keywords: ['common ground', 'compromise'], slug: 'find-common-ground' },
    { keywords: ['calm', 'stay calm'], slug: 'stay-calm-during-conflict' },
    { keywords: ['i statements', 'i feel'], slug: 'use-i-statements' },
    { keywords: ['amends', 'make right'], slug: 'make-amends' },

    // Reconnection
    { keywords: ['20 minute', 'conversation'], slug: 'have-20-minute-conversation' },
    { keywords: ['inner world', 'thoughts', 'feelings'], slug: 'ask-about-inner-world' },
    { keywords: ['state of union', 'check-in'], slug: 'state-of-union-conversation' },
    { keywords: ['used to enjoy', 'remember'], slug: 'do-something-you-used-to-enjoy' },
    { keywords: ['know her', 'knows her'], slug: 'plan-surprise-that-shows-you-know-her' },
    { keywords: ['sit close', 'close'], slug: 'sit-close-and-talk' },

    // Quality Time
    { keywords: ['tech-free', 'no phone', 'phone away'], slug: 'tech-free-quality-time' },
    { keywords: ['weekly date', 'date night'], slug: 'weekly-date-night-conversation' },
    { keywords: ['daily ritual', 'ritual'], slug: 'create-daily-ritual' },
    { keywords: ['morning ritual'], slug: 'create-morning-ritual' },
    { keywords: ['evening ritual'], slug: 'create-evening-ritual' },

    // Outdoor
    { keywords: ['hike', 'hiking'], slug: 'go-for-hike-together' },
    { keywords: ['walk', 'stroll'], slug: 'morning-walk-together' },
    { keywords: ['picnic'], slug: 'picnic-in-nature' },
    { keywords: ['stargazing', 'stars'], slug: 'stargazing-date' },
    { keywords: ['bike', 'biking', 'cycling'], slug: 'bike-ride-together' },

    // Active
    { keywords: ['run', 'running'], slug: 'run-together' },
    { keywords: ['yoga'], slug: 'yoga-in-nature' },
    { keywords: ['workout', 'exercise'], slug: 'outdoor-workout' },
    { keywords: ['swim', 'swimming'], slug: 'swim-together' },
    { keywords: ['disc golf', 'frisbee'], slug: 'disc-golf-together' },
  ];

  // Check keyword matches
  for (const match of keywordMatches) {
    if (match.keywords.some((keyword) => normalizedName.includes(keyword))) {
      return match.slug;
    }
  }

  // Theme-based fallback (if no specific match found)
  if (actionTheme) {
    const themeFallbacks: Record<string, string> = {
      communication: 'listen-without-fixing',
      intimacy: 'practice-love-languages',
      partnership: 'notice-what-needs-doing',
      romance: 'plan-perfect-date-night',
      gratitude: 'express-gratitude-daily',
      conflict: 'resolve-disagreement',
      reconnection: 'have-20-minute-conversation',
      quality_time: 'tech-free-quality-time',
      outdoor: 'go-for-hike-together',
      active: 'run-together',
    };

    const normalizedTheme = actionTheme.toLowerCase().trim();
    if (themeFallbacks[normalizedTheme]) {
      return themeFallbacks[normalizedTheme];
    }
  }

  // No match found
  return null;
}

