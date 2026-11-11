const patterns = [
  /[A-Z0-9._%+-]+\s*@\s*[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b[A-Z0-9._%+-]+\s*(?:\[at\]|\(at\))\s*[A-Z0-9.-]+\s*(?:\[dot\]|\(dot\)|\.)\s*[A-Z]{2,}\b/i,
  /(?:\+?\d[\d ().-]{7,}\d)/,
  /\b\d{1,6}\s+(?:[A-Z0-9.'-]+\s+){0,5}(?:street|st\.?|road|rd\.?|avenue|ave\.?|lane|ln\.?|drive|dr\.?|court|ct\.?|boulevard|blvd\.?|way|place|pl\.?|terrace|trail)\b/i,
  /\b(?:my|our|their|his|her)\s+(?:(?:full|real|first|last|home|email|e-mail|phone|school|ip)\s+)?(?:name|address|number|password|school|location)\s*(?:is|are|:|=)\s*\S+/i,
  /\b(?:i\s+live\s+(?:at|on|in)|i\s+(?:go to|attend)\s+(?:school\s+at\s+)?|my\s+name'?s)\s+\S+/i,
  /\b(?:api[ _-]?key|password|secret|token)\s*(?:is|:|=)\s*\S+/i,
  /\bsk-[A-Za-z0-9_-]{12,}/,
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
  /\b-?\d{1,2}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}\b/,
];

export function containsPersonalInformation(text) {
  const normalized = String(text).normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '');
  return patterns.some(pattern => pattern.test(normalized));
}

export function privacyMessage(strikes) {
  return strikes >= 2
    ? 'The AI space is now closed on this browser because personal information was entered again. Your garden still works. Ask a trusted adult for help.'
    : 'That looks like personal information. It was not sent to OpenAI. Please remove names, addresses, contact details, or secrets. If it happens again, the AI space will close.';
}
