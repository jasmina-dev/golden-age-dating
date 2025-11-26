// Vouches Data Structure

export interface Vouch {
  id: string;
  userId: string; // The user being vouched for
  friendName: string; // The friend who wrote the vouch
  greenFlag: string; // Answer to "What's their biggest green flag?"
  hiddenTalent: string; // Answer to "What's their hidden talent?"
  worstHabit?: string; // Answer to "What's their worst habit?" (optional, for future use)
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number; // Timestamp
}

// In-memory storage (mock)
// Initialize with sample vouches for Amanda, Nina, and David
let vouchesStorage: Vouch[] = [
  // Vouches for David (id: '1')
  {
    id: 'vouch_david_1',
    userId: '1',
    friendName: 'Sarah',
    greenFlag: "He's incredibly patient and thoughtful. When we go hiking, he always notices the small details in nature that others miss.",
    hiddenTalent: "He can make the most perfect sourdough bread from scratch. It's honestly impressive.",
    worstHabit: 'Takes forever to choose a restaurant, but always picks the best one.',
    status: 'approved',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
  },
  {
    id: 'vouch_david_2',
    userId: '1',
    friendName: 'Marcus',
    greenFlag: "David is one of the most genuine people I know. He shows up for his friends consistently and remembers the little things that matter.",
    hiddenTalent: "He can throw a perfect ceramic bowl on the wheel in under 5 minutes. It's mesmerizing to watch.",
    worstHabit: 'He gets lost in his studio and forgets to text back, but his work is worth the wait.',
    status: 'approved',
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
  },
  {
    id: 'vouch_david_3',
    userId: '1',
    friendName: 'Emma',
    greenFlag: "He's an amazing listener and gives really thoughtful advice. He's the friend you call when you need someone who truly understands.",
    hiddenTalent: "He can identify any hiking trail just by looking at a photo. It's like he has a mental map of every greenbelt.",
    worstHabit: 'He\'s a bit of a perfectionist with his ceramics, but that\'s why his work is so beautiful.',
    status: 'approved',
    createdAt: Date.now() - 21 * 24 * 60 * 60 * 1000, // 21 days ago
  },
  // Vouches for Amanda (id: '18')
  {
    id: 'vouch_amanda_1',
    userId: '18',
    friendName: 'Maya',
    greenFlag: "She's one of the most authentic people I know. She shows up exactly as she is, no pretense, and that's incredibly refreshing.",
    hiddenTalent: "She can identify almost any plant or bird on a hike. It's like having a nature guide with you.",
    worstHabit: 'She gets so absorbed in her ceramics that she forgets to eat, but her dedication is inspiring.',
    status: 'approved',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
  },
  {
    id: 'vouch_amanda_2',
    userId: '18',
    friendName: 'Rachel',
    greenFlag: "Amanda has this incredible ability to make you feel seen and heard. She's present in every conversation and remembers everything you tell her.",
    hiddenTalent: "She can make the most beautiful ceramic pieces look effortless, but I've seen her work - it takes serious skill and patience.",
    worstHabit: 'She\'s always running 10 minutes late, but she\'s worth the wait.',
    status: 'approved',
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000, // 12 days ago
  },
  {
    id: 'vouch_amanda_3',
    userId: '18',
    friendName: 'Lily',
    greenFlag: "She's incredibly creative and supportive. When I was starting my yoga studio, she was the first person to show up and help.",
    hiddenTalent: "She can cook a gourmet meal from whatever random ingredients are in your fridge. It's like magic.",
    worstHabit: 'She has too many plants and sometimes forgets to water them, but her apartment is beautiful.',
    status: 'approved',
    createdAt: Date.now() - 18 * 24 * 60 * 60 * 1000, // 18 days ago
  },
  // Vouches for Nina (id: '19')
  {
    id: 'vouch_nina_1',
    userId: '19',
    friendName: 'Alex',
    greenFlag: "She asks the best questions and really listens to your answers. Conversations with her always go deeper and make you think.",
    hiddenTalent: "She can quote obscure film dialogue from memory. It's both impressive and slightly terrifying.",
    worstHabit: 'She has strong opinions about movies and will debate you for hours, but it\'s always a good conversation.',
    status: 'approved',
    createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000, // 6 days ago
  },
  {
    id: 'vouch_nina_2',
    userId: '19',
    friendName: 'Ben',
    greenFlag: "Nina is intellectually curious in the best way. She's always reading something interesting and loves to share what she's learning.",
    hiddenTalent: "She can explain complex philosophical concepts in a way that actually makes sense. It's a gift.",
    worstHabit: 'She\'s a night owl and will text you deep thoughts at 2am, but they\'re usually worth reading.',
    status: 'approved',
    createdAt: Date.now() - 13 * 24 * 60 * 60 * 1000, // 13 days ago
  },
  {
    id: 'vouch_nina_3',
    userId: '19',
    friendName: 'Jessica',
    greenFlag: "She's incredibly thoughtful and remembers details about your life that you mentioned months ago. She makes everyone feel valued.",
    hiddenTalent: "She can recommend the perfect indie film for any mood. Her taste is impeccable.",
    worstHabit: 'She overthinks everything, but that\'s also why she gives such good advice.',
    status: 'approved',
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
  },
];

/**
 * Get all vouches for a user
 */
export const getVouchesByUserId = (userId: string): Vouch[] => {
  return vouchesStorage
    .filter((vouch) => vouch.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt); // Most recent first
};

/**
 * Get approved vouches for a user (limited to most recent)
 */
export const getApprovedVouchesByUserId = (userId: string, limit?: number): Vouch[] => {
  const approved = vouchesStorage
    .filter((vouch) => vouch.userId === userId && vouch.status === 'approved')
    .sort((a, b) => b.createdAt - a.createdAt); // Most recent first
  
  return limit ? approved.slice(0, limit) : approved;
};

/**
 * Save a new vouch
 */
export const saveVouch = (vouch: Vouch): void => {
  try {
    vouchesStorage.push(vouch);
    console.log('Vouch saved successfully:', vouch);
  } catch (error) {
    console.error('Error saving vouch:', error);
    throw error;
  }
};

/**
 * Update vouch status
 */
export const updateVouchStatus = (vouchId: string, status: 'pending' | 'approved' | 'rejected'): void => {
  const vouch = vouchesStorage.find((v) => v.id === vouchId);
  if (vouch) {
    vouch.status = status;
    console.log('Vouch status updated:', vouch);
  }
};

/**
 * Clear all vouches (for testing/reset)
 */
export const clearVouches = (): void => {
  vouchesStorage = [];
};

