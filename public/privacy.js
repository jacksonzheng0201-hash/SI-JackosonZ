const patterns = [
  /[A-Z0-9._%+-]+\s*@\s*[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b[A-Z0-9._%+-]+\s*(?:\[at\]|\(at\))\s*[A-Z0-9.-]+\s*(?:\[dot\]|\(dot\)|\.)\s*[A-Z]{2,}\b/i,
  /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/,
  /\b\d{3}[-.]\d{4}\b/,
  /\+\d[\d\s.-]{8,14}\d/,
  /\b\d{1,5}\s+(?:[A-Za-z0-9.'-]+\s+){1,4}(?:street|road|avenue|lane|drive|court|boulevard|terrace|trail|place|way|st|rd|ave|blvd|dr|ln|ct)\b\.?/i,
  /(?:^|[^\w'-])(?:[A-Z][A-Za-z0-9.'-]+\s+){1,4}(?:[Ee]lementary|[Mm]iddle|[Hh]igh)\s[Ss]chool\b/,
  /\b(?:my|our|their|his|her)\s+(?:(?:full|real|first|last|home|work|email|e-mail|phone|ip)\s+)?(?:name|address|password|location)\s*(?:is|:|=)\s*\S+/i,
  /\b(?:my|our|their|his|her)\s+(?:home|phone|mobile|cell|work|ip)\s+number\s*(?:is|:|=)\s*\S+/i,
  /(?:^|\s)(?:[Mm]y|[Oo]ur|[Tt]heir|[Hh]is|[Hh]er)\s+(?:[Ss]chool|[Cc]lass|[Tt]eacher)\s*(?:is|:|=)\s*[A-Z][A-Za-z0-9.'-]+/,
  /\bi\s+live\s+at\s+\S+/i,
  /(?:^|\s)[Ii]\s+live\s+in\s+[A-Z][A-Za-z0-9.'-]{2,}/,
  /\b(?:api[ _-]?key|access[ _-]?token|password|passcode)\s*(?:is|:|=)\s*\S+/i,
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
    : 'That looks like personal information, so it was not sent to OpenAI. Remove a real name, school, address, phone number, or secret. If your question has none of those, rephrase it and ask again. A second warning closes the AI space.';
}
