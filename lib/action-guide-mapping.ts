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
    'validate her feelings': 'listen-without-fixing',
    'ask open-ended questions': 'ask-better-questions',
    'put your phone down': 'be-present-quality-time',
    'repeat back what you heard': 'listen-without-fixing',
    'ask "what do you need from me?"': 'ask-better-questions',
    'share your day without complaining': 'share-your-feelings',
    'have a "no problem solving" conversation': 'have-no-problem-solving-conversation',
    'tell her something you appreciate': 'express-gratitude-to-partner',
    'don\'t interrupt her': 'listen-without-fixing',
    'ask follow-up questions': 'ask-better-questions',
    'remember something she told you': 'create-love-map',
    'have a real conversation': 'have-20-minute-conversation',
    'text your wife right now': 'daily-connection-messages',
    'text your wife right now!': 'daily-connection-messages',
    'send your wife a text': 'daily-connection-messages',

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
    'give your wife a massage tonight': 'give-wife-massage',
    'give her a massage': 'give-wife-massage',
    'massage your wife': 'give-wife-massage',
    'express gratitude for who she is': 'share-gratitude-for-character',
    'practice acts of service': 'practice-acts-of-service',
    'practice words of affirmation': 'practice-words-of-affirmation',
    'hold hands while walking': 'non-sexual-physical-touch',
    'ask about her dreams': 'create-love-map',
    'give her a back rub': 'non-sexual-physical-touch',
    'tell her why you fell in love': 'create-love-map',
    'kiss her goodbye and hello': 'non-sexual-physical-touch',
    'ask "how are you really?"': 'ask-about-inner-world',
    'share a vulnerable moment': 'share-your-feelings',
    'create a "us" memory': 'do-something-you-used-to-enjoy',

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
    'take over a task completely': 'take-over-chore-completely',
    'handle something she usually does': 'handle-household-tasks',
    'make a decision without asking': 'plan-together',
    'plan something together': 'plan-together',
    'handle a problem before she notices': 'notice-what-needs-doing',
    'ask about her work/projects': 'support-her-goals',
    'take initiative on household maintenance': 'handle-household-tasks',
    'organize attendance at a remembrance day ceremony': 'take-initiative-in-planning',
    // Holiday planning actions that show initiative
    'plan a canada day bbq and fireworks viewing': 'take-initiative-in-planning',
    'organize a canada day day trip': 'take-initiative-in-planning',
    'host a canada day gathering': 'take-initiative-in-planning',
    'plan a 4th of july bbq and fireworks': 'take-initiative-in-planning',
    'organize a 4th of july parade and picnic': 'take-initiative-in-planning',
    'take charge of thanksgiving planning': 'take-initiative-in-planning',
    'plan and host thanksgiving dinner': 'take-initiative-in-planning',
    'take charge of canadian thanksgiving planning': 'take-initiative-in-planning',
    'plan a surprise valentine\'s day experience': 'take-initiative-in-planning',
    'take charge of christmas decorating': 'take-initiative-in-planning',
    'plan a special christmas eve or day celebration': 'take-initiative-in-planning',
    'plan a new year\'s eve celebration': 'take-initiative-in-planning',
    'plan a memorial day weekend getaway': 'take-initiative-in-planning',
    'plan a labor day weekend adventure': 'take-initiative-in-planning',
    'plan a labour day weekend adventure': 'take-initiative-in-planning',
    'plan a victoria day weekend celebration': 'take-initiative-in-planning',
    'plan a day of service together': 'take-initiative-in-planning',
    'organize a community activity together': 'take-initiative-in-planning',
    'plan a historical day trip': 'take-initiative-in-planning',
    'organize a presidents\' day weekend getaway': 'take-initiative-in-planning',
    'plan a juneteenth celebration together': 'take-initiative-in-planning',
    'organize a juneteenth community event': 'take-initiative-in-planning',
    'plan a columbus day cultural exploration': 'take-initiative-in-planning',
    'plan a veterans day dinner': 'take-initiative-in-planning',
    'plan a family day celebration': 'take-initiative-in-planning',
    'plan a good friday reflective day': 'take-initiative-in-planning',
    'plan a truth and reconciliation day': 'take-initiative-in-planning',
    'organize a visit to a veterans memorial': 'take-initiative-in-planning',
    'organize participation in truth and reconciliation events': 'take-initiative-in-planning',
    'organize a meaningful good friday activity': 'take-initiative-in-planning',
    'organize a family day activity': 'take-initiative-in-planning',
    'plan a quiet reflective day together': 'take-initiative-in-planning',
    'plan a day of learning and reflection': 'take-initiative-in-planning',
    'plan a dinner for a veteran you know': 'take-initiative-in-planning',
    'organize a columbus day weekend activity': 'take-initiative-in-planning',
    'plan a cultural exploration day': 'take-initiative-in-planning',
    'plan a surprise valentine\'s day date': 'take-initiative-in-planning',
    'put together an easter egg hunt for your wife/partner': 'take-initiative-in-planning',
    'go get a real christmas tree together': 'take-initiative-in-planning',
    'set relationship goals for the new year together': 'plan-together',

    // Birthday actions (all require taking initiative)
    'plan a surprise birthday party': 'take-initiative-in-planning',
    'book a weekend getaway': 'plan-weekend-getaway',
    'plan a special birthday dinner': 'plan-perfect-date-night',
    'organize a birthday experience': 'plan-surprise-that-shows-you-know-her',
    'create a birthday scavenger hunt': 'plan-surprise-that-shows-you-know-her',
    'plan a birthday celebration with friends': 'take-initiative-in-planning',
    'arrange a birthday photo shoot': 'plan-surprise-that-shows-you-know-her',
    'plan a birthday staycation': 'plan-weekend-getaway',

    // Anniversary actions
    'plan a romantic anniversary getaway': 'plan-anniversary-celebration',
    'recreate your first date': 'plan-anniversary-celebration',
    'plan an anniversary surprise party': 'plan-anniversary-celebration',
    'write and read anniversary vows': 'plan-anniversary-celebration',
    'plan an anniversary photo session': 'plan-anniversary-celebration',

    // Long-distance / Virtual actions
    'plan a virtual date night': 'plan-virtual-date',
    'cook the same meal together over video': 'plan-virtual-date',
    'watch a movie together remotely': 'plan-virtual-date',
    'play an online game together': 'plan-virtual-date',
    'send a surprise video message': 'stay-connected-video-calls',
    'have a video call just to talk': 'stay-connected-video-calls',
    'send a thoughtful care package': 'send-thoughtful-care-package',
    'plan a future visit together': 'plan-future-visit',
    'send a good morning or good night message': 'daily-connection-messages',
    'share your day through photos': 'share-day-through-photos',

    // Date night actions
    'go dancing': 'plan-perfect-date-night',
    'go for beer & wings': 'plan-perfect-date-night',
    'sign up for a couples art class project': 'plan-perfect-date-night',

    // Holiday "Together" actions that should use initiative guide (they say "together" but require taking charge)
    'plan a special us thanksgiving together': 'take-initiative-in-planning',
    'plan a special canadian thanksgiving together': 'take-initiative-in-planning',
    'celebrate independence day together': 'take-initiative-in-planning',
    'celebrate canada day together': 'take-initiative-in-planning',
    'honor memorial day together': 'take-initiative-in-planning',
    'enjoy a labor day weekend together': 'take-initiative-in-planning',
    'enjoy a labour day weekend together': 'take-initiative-in-planning',
    'enjoy victoria day weekend together': 'take-initiative-in-planning',

    // Romance
    'plan perfect date night': 'plan-perfect-date-night',
    'plan a surprise': 'handle-surprise-right',
    'plan surprise date': 'plan-surprise-date',
    'give genuine compliment': 'give-genuine-compliment',
    'write love note': 'write-love-note',
    'plan weekend getaway': 'plan-weekend-getaway',
    'give physical affection': 'give-physical-affection',
    'leave a love note': 'write-love-note',
    'bring her favorite treat': 'plan-surprise-that-shows-you-know-her',
    'compliment her character': 'give-genuine-compliment',
    'tell her she\'s beautiful': 'give-genuine-compliment',
    'recreate a favorite memory': 'do-something-you-used-to-enjoy',
    'give her your full attention': 'be-present-quality-time',
    'tell her why you love her': 'write-love-note',
    'flirt with her': 'plan-perfect-date-night',
    'do something she loves': 'plan-surprise-that-shows-you-know-her',
    'make her laugh': 'plan-perfect-date-night',
    'surprise her with her favorite': 'plan-surprise-that-shows-you-know-her',

    // Gratitude
    'express gratitude daily': 'express-gratitude-daily',
    'create gratitude list': 'gratitude-list',
    'thank her for chores': 'thank-her-for-chores',
    'acknowledge her effort': 'appreciate-her-effort',
    'send gratitude text': 'send-gratitude-text',
    'morning gratitude': 'morning-gratitude',
    'thank her for something specific': 'express-gratitude-to-partner',
    'write down what you\'re grateful for': 'gratitude-list',
    'celebrate her accomplishment': 'appreciate-her-effort',
    'thank her for who she is': 'share-gratitude-for-character',
    'notice the small things': 'express-gratitude-daily',
    'express gratitude publicly': 'express-gratitude-to-partner',
    'send a gratitude text': 'send-gratitude-text',
    'thank her for the little things': 'express-gratitude-daily',
    'tell her what you\'re grateful for': 'express-gratitude-to-partner',
    'appreciate her uniqueness': 'share-gratitude-for-character',
    'say thank you before bed': 'express-gratitude-daily',

    // Conflict
    'resolve disagreement': 'resolve-disagreement',
    'take responsibility': 'take-responsibility',
    'find common ground': 'find-common-ground',
    'stay calm during conflict': 'stay-calm-during-conflict',
    'use i statements': 'use-i-statements',
    'make amends': 'make-amends',
    'use "i feel" instead of "you always"': 'use-i-statements',
    'take a break when things get heated': 'stay-calm-during-conflict',
    'apologize first': 'apologize-right-way',
    'listen without defending': 'listen-without-fixing',
    'take responsibility for your part': 'take-responsibility',
    'propose a solution': 'resolve-disagreement',
    'stay calm and speak softly': 'stay-calm-during-conflict',

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
    'nature photography walk': 'nature-photography-walk',
    'photography walk': 'nature-photography-walk',
    'take photos together': 'nature-photography-walk',
    'capture moments together': 'nature-photography-walk',

    // Active
    'run together': 'run-together',
    'yoga together': 'yoga-in-nature',
    'outdoor workout': 'outdoor-workout',
    'swim together': 'swim-together',
    'disc golf': 'disc-golf-together',

    // Cooking Together
    'cook a meal together': 'cook-together',
    'cook together': 'cook-together',
    'cooking together': 'cook-together',
    'cook her favorite meal': 'cook-her-favorite-meal',
    'make her favorite meal': 'cook-her-favorite-meal',
    'try a new recipe together': 'cook-together',
    'cooking date night': 'cook-together',

    // Financial Communication
    'have a complete financial conversation': 'talk-about-finances',
    'financial conversation': 'talk-about-finances',
    'talk about finances': 'talk-about-finances',
    'review budget together': 'talk-about-finances',
    'set financial goals together': 'talk-about-finances',
    'discuss money values': 'talk-about-finances',

    // Cleaning
    'do a deep clean together': 'clean-together',
    'deep clean together': 'clean-together',
    'clean together': 'clean-together',
    'cleaning together': 'clean-together',
    'tackle a cleaning project': 'clean-together',
    'organize a cluttered space': 'clean-together',

    // Pet Responsibility
    'take full pet responsibility': 'pet-responsibility',
    'pet responsibility': 'pet-responsibility',
    'handle pet poop patrol': 'pet-responsibility',
    'poop patrol': 'pet-responsibility',
    'research pet care': 'pet-responsibility',
    'create pet care plan': 'pet-responsibility',

    // Family Actions for Mom
    'make mom breakfast in bed': 'breakfast-in-bed-for-mom',
    'breakfast in bed for mom': 'breakfast-in-bed-for-mom',
    'breakfast in bed': 'breakfast-in-bed-for-mom',
    'write and read a poem about her': 'poem-for-mom',
    'poem for mom': 'poem-for-mom',
    'write poem about mom': 'poem-for-mom',
    'take the kids out so mom gets a break': 'give-mom-a-break',
    'give mom a break': 'give-mom-a-break',
    'mom gets a break': 'give-mom-a-break',
    'plan family activity for mom': 'give-mom-a-break',
    'mom appreciation day': 'mom-appreciation-day',
    'create a mom appreciation day': 'mom-appreciation-day',
    'create mom appreciation day': 'mom-appreciation-day',
    'handle bedtime routine': 'give-mom-a-break',

    // Relationship Games
    'play relationship games': 'relationship-games',
    'relationship games': 'relationship-games',
    'we\'re not really strangers': 'relationship-games',
    'gottman card decks': 'relationship-games',
    'tabletopics for couples': 'relationship-games',
    'adventure challenge couples': 'relationship-games',
    'intimacy building games': 'relationship-games',

    // Intimacy
    'initiate physical intimacy without pressure': 'initiate-intimacy',
    'initiate intimacy': 'initiate-intimacy',
    'initiate without pressure': 'initiate-intimacy',
    'focus on her pleasure': 'focus-on-her-pleasure',
    'her pleasure': 'focus-on-her-pleasure',
    'make it about her pleasure': 'focus-on-her-pleasure',
    'have conversation about intimacy': 'initiate-intimacy',
    'create intimacy without sex': 'initiate-intimacy',
    'plan romantic evening': 'initiate-intimacy',
    'learn about her body': 'focus-on-her-pleasure',
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
    { keywords: ['take initiative', 'take charge', 'show initiative', 'take the lead', 'organize', 'host'], slug: 'take-initiative-in-planning' },
    { keywords: ['no problem solving', 'problem-free', 'just connection'], slug: 'have-no-problem-solving-conversation' },

    // Romance
    { keywords: ['date night', 'date'], slug: 'plan-perfect-date-night' },
    { keywords: ['surprise'], slug: 'handle-surprise-right' },
    { keywords: ['compliment'], slug: 'give-genuine-compliment' },
    { keywords: ['love note', 'note', 'letter'], slug: 'write-love-note' },
    { keywords: ['weekend getaway', 'getaway', 'trip'], slug: 'plan-weekend-getaway' },
    { keywords: ['virtual date', 'video date', 'online date', 'long distance date'], slug: 'plan-virtual-date' },
    { keywords: ['video call', 'video chat', 'video message', 'surprise video'], slug: 'stay-connected-video-calls' },
    { keywords: ['care package', 'send package', 'thoughtful gift'], slug: 'send-thoughtful-care-package' },
    { keywords: ['plan visit', 'future visit', 'next visit', 'plan trip'], slug: 'plan-future-visit' },
    { keywords: ['good morning', 'good night', 'morning message', 'night message', 'daily message', 'text your wife', 'send text'], slug: 'daily-connection-messages' },
    { keywords: ['share photos', 'send photos', 'photo message', 'daily photos'], slug: 'share-day-through-photos' },

    // Intimacy
    { keywords: ['massage', 'give massage', 'back rub', 'shoulder rub'], slug: 'give-wife-massage' },

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

    // Cooking Together
    { keywords: ['cook', 'cooking', 'meal together'], slug: 'cook-together' },
    { keywords: ['favorite meal', 'her favorite'], slug: 'cook-her-favorite-meal' },
    { keywords: ['recipe together', 'new recipe'], slug: 'cook-together' },

    // Financial Communication
    { keywords: ['financial', 'finances', 'money', 'budget'], slug: 'talk-about-finances' },
    { keywords: ['financial goals', 'money goals'], slug: 'talk-about-finances' },
    { keywords: ['money values', 'spending habits'], slug: 'talk-about-finances' },

    // Cleaning
    { keywords: ['clean together', 'cleaning together', 'deep clean'], slug: 'clean-together' },
    { keywords: ['cleaning project', 'organize', 'cluttered'], slug: 'clean-together' },

    // Pet Responsibility
    { keywords: ['pet responsibility', 'pet care', 'poop patrol'], slug: 'pet-responsibility' },
    { keywords: ['pet', 'dog', 'cat', 'pet waste'], slug: 'pet-responsibility' },

    // Family Actions for Mom
    { keywords: ['breakfast in bed', 'mom breakfast'], slug: 'breakfast-in-bed-for-mom' },
    { keywords: ['poem for mom', 'poem about her'], slug: 'poem-for-mom' },
    { keywords: ['mom break', 'give mom a break', 'kids out'], slug: 'give-mom-a-break' },
    { keywords: ['mom appreciation', 'family activity for mom'], slug: 'give-mom-a-break' },

    // Relationship Games
    { keywords: ['relationship game', 'couples game', 'intimacy game'], slug: 'relationship-games' },
    { keywords: ['we\'re not really strangers', 'gottman', 'tabletopics'], slug: 'relationship-games' },

    // Intimacy
    { keywords: ['initiate intimacy', 'initiate physical'], slug: 'initiate-intimacy' },
    { keywords: ['her pleasure', 'focus on pleasure'], slug: 'focus-on-her-pleasure' },
    { keywords: ['intimacy conversation', 'talk about intimacy'], slug: 'initiate-intimacy' },
  ];

  // Check keyword matches
  for (const match of keywordMatches) {
    if (match.keywords.some((keyword) => normalizedName.includes(keyword))) {
      return match.slug;
    }
  }

  // Theme-based fallback - ensures all actions have a guide
  // This provides a best-fit guide even when there's no exact match
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

