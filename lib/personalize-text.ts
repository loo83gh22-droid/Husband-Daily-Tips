/**
 * Personalizes action text by replacing generic terms with the partner's name
 * @param text - The original text to personalize
 * @param partnerName - The partner's name (optional)
 * @returns Personalized text, or original text if no partner name is provided
 */
export function personalizeText(text: string | null | undefined, partnerName: string | null | undefined): string {
  if (!text || !partnerName) {
    return text || '';
  }

  let personalizedText = text;

  // Replace possessive "her" (her day, her feelings, etc.) with "Partner's"
  // Match "her" followed by a space and a word (possessive adjective)
  personalizedText = personalizedText.replace(/\bher\s+([a-z]+)/gi, (match, word) => {
    // Check if it's a possessive context (her + noun)
    // Common possessive patterns: her day, her feelings, her needs, etc.
    return `${partnerName}'s ${word}`;
  });

  // Replace object pronoun "her" (give her, tell her, etc.) with partner name
  // Match "her" at end of sentence or followed by punctuation/space
  personalizedText = personalizedText.replace(/\bher\b(?=\s|\.|,|!|\?|$)/gi, partnerName);

  // Replace subject pronoun "she" with partner name
  personalizedText = personalizedText.replace(/\bshe\b/gi, partnerName);

  // Replace possessive pronoun "hers" with "Partner's"
  personalizedText = personalizedText.replace(/\bhers\b/gi, `${partnerName}'s`);

  // Replace "your partner" -> partner name
  personalizedText = personalizedText.replace(/\byour partner\b/gi, partnerName);
  
  // Replace "your wife" -> partner name
  personalizedText = personalizedText.replace(/\byour wife\b/gi, partnerName);
  
  // Replace "your spouse" -> partner name
  personalizedText = personalizedText.replace(/\byour spouse\b/gi, partnerName);
  
  // Replace standalone "partner" -> partner name (be careful with context)
  personalizedText = personalizedText.replace(/\bpartner\b/gi, partnerName);
  
  // Replace standalone "wife" -> partner name
  personalizedText = personalizedText.replace(/\bwife\b/gi, partnerName);
  
  // Replace standalone "spouse" -> partner name
  personalizedText = personalizedText.replace(/\bspouse\b/gi, partnerName);

  // Handle "Don't Interrupt Her" -> "Don't Interrupt Jodi"
  personalizedText = personalizedText.replace(/\binterrupt her\b/gi, `interrupt ${partnerName}`);
  
  // Handle "When she's talking" -> "When Jodi's talking" or "When Jodi is talking"
  personalizedText = personalizedText.replace(/\bwhen she's\b/gi, `when ${partnerName} is`);
  personalizedText = personalizedText.replace(/\bwhen she is\b/gi, `when ${partnerName} is`);
  
  // Handle "After she tells you" -> "After Jodi tells you"
  personalizedText = personalizedText.replace(/\bafter she\b/gi, `after ${partnerName}`);

  return personalizedText;
}

