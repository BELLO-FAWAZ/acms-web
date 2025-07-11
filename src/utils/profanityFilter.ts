
// Common profanity words - this is a basic list, you can expand it as needed
const profanityList = [
  'damn', 'hell', 'shit', 'fuck', 'bitch', 'ass', 'bastard', 'crap',
  'piss', 'cock', 'dick', 'pussy', 'whore', 'slut', 'nigger', 'faggot',
  'retard', 'gay', 'homo', 'lesbian', 'queer', 'tranny', 'chink', 'spic',
  'kike', 'wetback', 'gook', 'towelhead', 'sand nigger', 'beaner',
  // Add more words as needed
];

export const containsProfanity = (text: string): boolean => {
  const lowercaseText = text.toLowerCase();
  return profanityList.some(word => {
    // Check for exact word matches with word boundaries
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowercaseText);
  });
};

export const getProfanityWords = (text: string): string[] => {
  const lowercaseText = text.toLowerCase();
  const foundWords: string[] = [];
  
  profanityList.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowercaseText)) {
      foundWords.push(word);
    }
  });
  
  return foundWords;
};

export const filterProfanity = (text: string): string => {
  let filteredText = text;
  
  profanityList.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(word.length));
  });
  
  return filteredText;
};
