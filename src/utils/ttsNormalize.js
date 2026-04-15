/**
 * Normalizes text before passing it to TTS.
 * Expands common abbreviations and cleans up symbols that
 * speech engines tend to mispronounce or skip.
 */
export async function normalizeTextForTTS(text) {
  if (!text) return '';

  return text
    // Remove markdown-style symbols
    .replace(/[*_~`#]/g, '')
    // Expand common Russian abbreviations
    .replace(/\bт\.е\./gi, 'то есть')
    .replace(/\bт\.д\./gi, 'так далее')
    .replace(/\bт\.п\./gi, 'тому подобное')
    .replace(/\bдр\./gi, 'другие')
    .replace(/\bг\./gi, 'год')
    .replace(/\bв\./gi, 'век')
    // Normalize multiple spaces/newlines
    .replace(/\s+/g, ' ')
    .trim();
}
