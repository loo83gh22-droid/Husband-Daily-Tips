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

  // Replace common generic terms with the partner's name
  // Use case-insensitive replacement with word boundaries to avoid partial matches
  const replacements: Array<{ pattern: RegExp; replacement: string }> = [
    // "your partner" -> "Sarah"
    { pattern: /\byour partner\b/gi, replacement: partnerName },
    // "your wife" -> "Sarah"
    { pattern: /\byour wife\b/gi, replacement: partnerName },
    // "your spouse" -> "Sarah"
    { pattern: /\byour spouse\b/gi, replacement: partnerName },
    // "partner" (standalone) -> "Sarah" (but be careful not to replace "partner" in other contexts)
    { pattern: /\bpartner\b/gi, replacement: partnerName },
    // "wife" (standalone) -> "Sarah"
    { pattern: /\bwife\b/gi, replacement: partnerName },
    // "spouse" (standalone) -> "Sarah"
    { pattern: /\bspouse\b/gi, replacement: partnerName },
    // "her" -> "her" (keep as is, but could be "Sarah's" in some contexts)
    // "she" -> "she" (keep as is)
  ];

  let personalizedText = text;
  replacements.forEach(({ pattern, replacement }) => {
    personalizedText = personalizedText.replace(pattern, replacement);
  });

  return personalizedText;
}

