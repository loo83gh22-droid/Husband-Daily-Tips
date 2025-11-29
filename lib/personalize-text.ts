/**
 * Personalizes action text by replacing the FIRST instance of partner-related terms with the partner's name,
 * then using pronouns (she/her) for subsequent references
 * @param text - The original text to personalize
 * @param partnerName - The partner's name (optional)
 * @returns Personalized text, or original text if no partner name is provided
 */
export function personalizeText(text: string | null | undefined, partnerName: string | null | undefined): string {
  if (!text || !partnerName) {
    return text || '';
  }

  let personalizedText = text;
  let nameUsed = false; // Track if we've used the name once

  // Helper to replace first occurrence only, then use pronouns for rest
  const replaceFirstThenPronouns = (
    pattern: RegExp,
    nameReplacement: string | ((match: string, ...args: any[]) => string),
    pronounReplacement: string = ''
  ) => {
    if (nameUsed) {
      // After first replacement, replace with pronouns
      if (pronounReplacement) {
        personalizedText = personalizedText.replace(pattern, pronounReplacement);
      }
      // If no pronoun replacement specified, leave as is (already pronouns)
      return;
    }
    
    // Replace first occurrence with name
    const match = personalizedText.match(pattern);
    if (match) {
      if (typeof nameReplacement === 'function') {
        personalizedText = personalizedText.replace(pattern, (match, ...args) => {
          nameUsed = true;
          return nameReplacement(match, ...args);
        });
      } else {
        personalizedText = personalizedText.replace(pattern, () => {
          nameUsed = true;
          return nameReplacement;
        });
      }
    }
  };

  // Priority order: Replace the first occurrence of any partner reference with the name
  
  // 1. "your partner" -> partner name (first occurrence only), then "her" for rest
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\byour partner\b/i, () => {
      nameUsed = true;
      return partnerName;
    });
  } else {
    personalizedText = personalizedText.replace(/\byour partner\b/gi, 'her');
  }

  // 2. "your wife" -> partner name (first occurrence only), then "her" for rest
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\byour wife\b/i, () => {
      nameUsed = true;
      return partnerName;
    });
  } else {
    personalizedText = personalizedText.replace(/\byour wife\b/gi, 'her');
  }

  // 3. "your spouse" -> partner name (first occurrence only), then "her" for rest
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\byour spouse\b/i, () => {
      nameUsed = true;
      return partnerName;
    });
  } else {
    personalizedText = personalizedText.replace(/\byour spouse\b/gi, 'her');
  }

  // 4. Possessive "her + noun" (her day, her feelings) -> handled carefully
  // For clearly possessive nouns (day, feelings, needs, schedule, time, energy, body, boundaries, perspective, effort)
  // we use "Partner's + noun" for the first occurrence.
  // For generic phrases like "tell her something", we use "Partner + noun" (no 's) to avoid awkward "Jodi's something".
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bher\s+([a-z]+)/i, (match, word) => {
      nameUsed = true;
      const lowercaseWord = word.toLowerCase();
      const possessiveNouns = new Set([
        'day',
        'feelings',
        'needs',
        'schedule',
        'time',
        'energy',
        'body',
        'boundaries',
        'perspective',
        'effort',
        'work',
        'ideas',
        'wins',
      ]);

      if (possessiveNouns.has(lowercaseWord)) {
        return `${partnerName}'s ${word}`;
      }

      // Default: treat as object pronoun + noun (e.g., "tell Jodi something")
      return `${partnerName} ${word}`;
    });
  } else {
    // Keep as "her + noun" for subsequent occurrences
    // No change needed - already pronouns
  }

  // 5. Object pronoun "her" (give her, tell her) -> partner name (first occurrence only), then "her" for rest
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bher\b(?=\s|\.|,|!|\?|$)/i, () => {
      nameUsed = true;
      return partnerName;
    });
  }
  // Subsequent "her" stays as "her" (already pronouns)

  // 6. Contractions and verb forms with "she" -> partner name (first occurrence only), then "she" for rest
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bshe's\b/i, () => {
      nameUsed = true;
      return `${partnerName} is`;
    });
  } else {
    personalizedText = personalizedText.replace(/\bshe's\b/gi, "she's");
  }
  
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bshe is\b/i, () => {
      nameUsed = true;
      return `${partnerName} is`;
    });
  } else {
    personalizedText = personalizedText.replace(/\bshe is\b/gi, 'she is');
  }
  
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bshe has\b/i, () => {
      nameUsed = true;
      return `${partnerName} has`;
    });
  } else {
    personalizedText = personalizedText.replace(/\bshe has\b/gi, 'she has');
  }
  
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bshe was\b/i, () => {
      nameUsed = true;
      return `${partnerName} was`;
    });
  } else {
    personalizedText = personalizedText.replace(/\bshe was\b/gi, 'she was');
  }
  
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bshe will\b/i, () => {
      nameUsed = true;
      return `${partnerName} will`;
    });
  } else {
    personalizedText = personalizedText.replace(/\bshe will\b/gi, 'she will');
  }
  
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bshe can\b/i, () => {
      nameUsed = true;
      return `${partnerName} can`;
    });
  } else {
    personalizedText = personalizedText.replace(/\bshe can\b/gi, 'she can');
  }
  
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bshe should\b/i, () => {
      nameUsed = true;
      return `${partnerName} should`;
    });
  } else {
    personalizedText = personalizedText.replace(/\bshe should\b/gi, 'she should');
  }
  
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bshe would\b/i, () => {
      nameUsed = true;
      return `${partnerName} would`;
    });
  } else {
    personalizedText = personalizedText.replace(/\bshe would\b/gi, 'she would');
  }
  
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bshe could\b/i, () => {
      nameUsed = true;
      return `${partnerName} could`;
    });
  } else {
    personalizedText = personalizedText.replace(/\bshe could\b/gi, 'she could');
  }

  // 7. Subject pronoun "she" -> partner name (first occurrence only), then "she" for rest
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bshe\b/i, () => {
      nameUsed = true;
      return partnerName;
    });
  }
  // Subsequent "she" stays as "she" (already pronouns)

  // 8. Possessive pronoun "hers" -> "Partner's" (first occurrence only), then "hers" for rest
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bhers\b/i, () => {
      nameUsed = true;
      return `${partnerName}'s`;
    });
  }
  // Subsequent "hers" stays as "hers" (already pronouns)

  // 9. Standalone "partner" -> partner name (first occurrence only), then "her" for rest
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bpartner\b/i, () => {
      nameUsed = true;
      return partnerName;
    });
  } else {
    personalizedText = personalizedText.replace(/\bpartner\b/gi, 'her');
  }

  // 10. Standalone "wife" -> partner name (first occurrence only), then "her" for rest
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bwife\b/i, () => {
      nameUsed = true;
      return partnerName;
    });
  } else {
    personalizedText = personalizedText.replace(/\bwife\b/gi, 'her');
  }

  // 11. Standalone "spouse" -> partner name (first occurrence only), then "her" for rest
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bspouse\b/i, () => {
      nameUsed = true;
      return partnerName;
    });
  } else {
    personalizedText = personalizedText.replace(/\bspouse\b/gi, 'her');
  }

  // 12. Specific phrases
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\binterrupt her\b/i, () => {
      nameUsed = true;
      return `interrupt ${partnerName}`;
    });
  } else {
    personalizedText = personalizedText.replace(/\binterrupt her\b/gi, 'interrupt her');
  }
  
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bvalidate her\b/i, () => {
      nameUsed = true;
      return `validate ${partnerName}'s`;
    });
  } else {
    personalizedText = personalizedText.replace(/\bvalidate her\b/gi, "validate her");
  }
  
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\bask her\b/i, () => {
      nameUsed = true;
      return `ask ${partnerName}`;
    });
  } else {
    personalizedText = personalizedText.replace(/\bask her\b/gi, 'ask her');
  }
  
  if (!nameUsed) {
    personalizedText = personalizedText.replace(/\btell her\b/i, () => {
      nameUsed = true;
      return `tell ${partnerName}`;
    });
  } else {
    personalizedText = personalizedText.replace(/\btell her\b/gi, 'tell her');
  }

  return personalizedText;
}
