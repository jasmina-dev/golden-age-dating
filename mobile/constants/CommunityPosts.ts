// Community Posts Data Structure

export interface CommunityPost {
  id: string;
  userId: string; // ID of the user who created the post
  userName: string;
  userAge: number;
  content: string;
  likes: number;
  comments: number;
}

// Global community posts data
export const communityPosts: CommunityPost[] = [
  {
    id: 'post-1',
    userId: '1', // David
    userName: 'David',
    userAge: 33,
    content: "This year I learned that vulnerability is strength. Opening up about my fears and insecurities has brought me closer to the people who matter most. It's scary, but so worth it.",
    likes: 42,
    comments: 8,
  },
  {
    id: 'post-2',
    userId: '2', // Sarah
    userName: 'Sarah',
    userAge: 31,
    content: "That it's not about finding someone perfect, but finding someone whose imperfections you can embrace. My partner's quirks are now the things I love most.",
    likes: 56,
    comments: 12,
  },
  {
    id: 'post-3',
    userId: '3', // Ben
    userName: 'Ben',
    userAge: 29,
    content: 'Love languages are real. Once I understood that my partner shows love through actions, not words, everything changed. Communication isn\'t just about talking—it\'s about understanding how others express themselves.',
    likes: 38,
    comments: 15,
  },
  {
    id: 'post-4',
    userId: '4', // Emma
    userName: 'Emma',
    userAge: 27,
    content: "Sometimes the best thing you can do for love is to love yourself first. I spent this year working on me, and I'm finally ready to share that with someone else. Self-love isn't selfish—it's necessary.",
    likes: 64,
    comments: 9,
  },
  {
    id: 'post-5',
    userId: '5', // Marcus
    userName: 'Marcus',
    userAge: 35,
    content: 'Travel has taught me that connection transcends language. I\'ve met incredible people around the world who showed me that love and understanding don\'t need words. Food, laughter, and shared experiences are universal.',
    likes: 51,
    comments: 7,
  },
  {
    id: 'post-6',
    userId: '2', // Sarah - second post
    userName: 'Sarah',
    userAge: 31,
    content: 'The most important lesson: listen to understand, not to respond. Real intimacy comes from truly hearing someone and validating their experience, even when you don\'t agree.',
    likes: 43,
    comments: 11,
  },
  {
    id: 'post-7',
    userId: '1', // David - second post
    userName: 'David',
    userAge: 33,
    content: 'I\'ve learned that relationships require effort, but they shouldn\'t feel like work. When it\'s right, the effort feels natural and fulfilling. If you\'re constantly struggling, it might be time to reassess.',
    likes: 39,
    comments: 6,
  },
];

/**
 * Get posts by a specific user ID
 */
export const getPostsByUserId = (userId: string): CommunityPost[] => {
  return communityPosts.filter((post) => post.userId === userId);
};

/**
 * Get all community posts
 */
export const getAllCommunityPosts = (): CommunityPost[] => {
  return [...communityPosts];
};

