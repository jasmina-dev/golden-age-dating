// Kindred User Data Structure
export interface KindredUser {
  id: string;
  name: string;
  age: number;
  location: string; // "City, State" format
  gender: string;
  bio: string;
  profileText: string; // Long string for 'Depth' section
  interests: string[]; // Array of at least 3 strings
  quizAnswers: {
    [key: string]: string; // Key-value pairs for compatibility quiz answers
  };
}

// Sample User Data - At least 6 fake profiles
export const sampleUserData: KindredUser[] = [
  {
    id: '1',
    name: 'David',
    age: 33,
    location: 'Austin, TX',
    gender: 'Male',
    bio: 'Ceramic artist and weekend hiker. Looking for someone who appreciates slow mornings and deep conversations.',
    profileText: 'My perfect Sunday starts with a long hike through the greenbelt, followed by a few hours in my studio throwing pots. There\'s something meditative about working with clay—the way it responds to your touch, the patience required. In the evening, I love cooking something new from a cookbook I\'ve been meaning to try, usually with a good playlist in the background. I\'m drawn to people who value authenticity over perfection, who can laugh at themselves, and who understand that the best relationships are built on mutual respect and genuine curiosity about each other\'s inner worlds. I believe in showing up fully, in being present, and in creating space for both joy and vulnerability.',
    interests: ['Hiking', 'Ceramics', 'Cooking', 'Indie Films', 'Philosophy'],
    quizAnswers: {
      'Would you move for love?': 'Maybe, for the right person',
      'How do you handle conflict in relationships?': 'Take time to think, then discuss',
      'What\'s your ideal Friday night?': 'Mix of both, depending on mood',
      'What matters most in a relationship?': 'Emotional connection and shared values',
      'How do you express love?': 'Through quality time and acts of service',
    },
  },
  {
    id: '2',
    name: 'Sarah',
    age: 31,
    location: 'Portland, OR',
    gender: 'Female',
    bio: 'Film enthusiast and aspiring writer. I believe in the power of stories to connect us.',
    profileText: 'I spend most of my free time watching indie films and writing short stories in coffee shops around the city. There\'s something magical about how a well-told story can make you feel less alone in the world. I\'m passionate about hiking—there\'s no better way to clear your head than a long trail with a good podcast. I love cooking, especially trying recipes from different cultures. I\'m looking for someone who values intellectual conversations, who isn\'t afraid of vulnerability, and who understands that love is an active choice you make every day. I believe in growth, in being honest about who you are and who you\'re becoming, and in creating a partnership where both people can flourish.',
    interests: ['Indie Films', 'Hiking', 'Cooking', 'Writing', 'Reading'],
    quizAnswers: {
      'Would you move for love?': 'Absolutely',
      'How do you handle conflict in relationships?': 'Address it immediately',
      'What\'s your ideal Friday night?': 'Quiet evening at home',
      'What matters most in a relationship?': 'Intellectual compatibility and emotional support',
      'How do you express love?': 'Through words of affirmation and quality time',
    },
  },
  {
    id: '3',
    name: 'Ben',
    age: 29,
    location: 'Austin, TX',
    gender: 'Male',
    bio: 'Live music lover and philosophy enthusiast. Always up for a good conversation over coffee or wine.',
    profileText: 'I\'m a photographer by trade, but my real passion is live music. There\'s nothing quite like the energy of a small venue, the way music can bring strangers together. I also love philosophy—I\'m always reading something that makes me question my assumptions. Photography is my way of capturing moments that might otherwise be forgotten. I enjoy hiking on weekends and cooking elaborate meals for friends. I\'m looking for someone who can keep up intellectually, who appreciates the arts, and who values authenticity. I believe relationships should be partnerships where both people encourage each other to grow. I\'m not interested in surface-level connections—I want to know what makes you tick, what you\'re passionate about, and what you\'re working toward.',
    interests: ['Live Music', 'Philosophy', 'Photography', 'Hiking', 'Cooking'],
    quizAnswers: {
      'Would you move for love?': 'Maybe, for the right person',
      'How do you handle conflict in relationships?': 'Take time to think, then discuss',
      'What\'s your ideal Friday night?': 'Going out to socialize',
      'What matters most in a relationship?': 'Intellectual connection and shared interests',
      'How do you express love?': 'Through quality time and physical touch',
    },
  },
  {
    id: '4',
    name: 'Emma',
    age: 27,
    location: 'Seattle, WA',
    gender: 'Female',
    bio: 'Yoga instructor and bookworm. I believe in living intentionally and finding joy in the small moments.',
    profileText: 'I teach yoga part-time and work as a librarian, which means I\'m surrounded by stories all day. I love reading—there\'s nothing better than getting lost in a good book with a cup of tea. I practice yoga daily, not just for the physical benefits but for the mental clarity it brings. I\'m passionate about meditation and mindfulness, and I try to bring that awareness into all aspects of my life. I enjoy hiking on weekends, especially in the Pacific Northwest where there\'s always a new trail to explore. I\'m looking for someone who values personal growth, who understands the importance of self-care, and who can appreciate quiet moments as much as adventurous ones. I believe in building a relationship on a foundation of mutual respect, open communication, and shared values.',
    interests: ['Yoga', 'Reading', 'Meditation', 'Hiking', 'Writing'],
    quizAnswers: {
      'Would you move for love?': 'Maybe, for the right person',
      'How do you handle conflict in relationships?': 'Take time to think, then discuss',
      'What\'s your ideal Friday night?': 'Quiet evening at home',
      'What matters most in a relationship?': 'Emotional connection and shared values',
      'How do you express love?': 'Through acts of service and quality time',
    },
  },
  {
    id: '5',
    name: 'Marcus',
    age: 35,
    location: 'Brooklyn, NY',
    gender: 'Male',
    bio: 'Chef and travel enthusiast. I believe food brings people together and every meal is an opportunity to create something beautiful.',
    profileText: 'I\'m a chef at a farm-to-table restaurant, which means I spend my days creating dishes that tell a story. I\'m passionate about cooking, obviously, but also about where food comes from and how it connects us to the earth and to each other. I love traveling—I try to visit a new country every year to learn about different cuisines and cultures. When I\'m not in the kitchen, I enjoy reading cookbooks (yes, for fun), going to farmers markets, and trying new restaurants. I\'m also into fitness—I need to balance all that cooking somehow. I\'m looking for someone who appreciates good food, who values experiences over things, and who isn\'t afraid to try new things. I believe in living fully, in being present, and in creating a life filled with both adventure and comfort.',
    interests: ['Cooking', 'Travel', 'Fitness', 'Reading', 'Art'],
    quizAnswers: {
      'Would you move for love?': 'Absolutely',
      'How do you handle conflict in relationships?': 'Address it immediately',
      'What\'s your ideal Friday night?': 'Going out to socialize',
      'What matters most in a relationship?': 'Shared experiences and mutual support',
      'How do you express love?': 'Through acts of service and quality time',
    },
  },
  {
    id: '6',
    name: 'Olivia',
    age: 28,
    location: 'San Francisco, CA',
    gender: 'Female',
    bio: 'Software engineer by day, artist by night. I love the intersection of technology and creativity.',
    profileText: 'I work as a software engineer, but my real passion is art. I spend my evenings painting, usually while listening to podcasts or audiobooks. I love the way coding and art both require problem-solving and creativity, just in different ways. I\'m into photography—I love capturing the way light changes throughout the day. I enjoy hiking on weekends, especially in the Bay Area where there are so many beautiful trails. I\'m also a big reader, mostly sci-fi and fantasy, and I love discussing books with others. I\'m looking for someone who values both intellectual and creative pursuits, who can appreciate the beauty in everyday moments, and who understands that life is about balance. I believe in being authentic, in pursuing your passions, and in building relationships based on mutual respect and genuine connection.',
    interests: ['Art', 'Photography', 'Reading', 'Hiking', 'Gaming'],
    quizAnswers: {
      'Would you move for love?': 'Maybe, for the right person',
      'How do you handle conflict in relationships?': 'Take time to think, then discuss',
      'What\'s your ideal Friday night?': 'Mix of both, depending on mood',
      'What matters most in a relationship?': 'Intellectual compatibility and emotional support',
      'How do you express love?': 'Through quality time and acts of service',
    },
  },
  {
    id: '7',
    name: 'James',
    age: 32,
    location: 'Denver, CO',
    gender: 'Male',
    bio: 'Outdoor enthusiast and environmental advocate. I believe in living sustainably and spending as much time in nature as possible.',
    profileText: 'I work in environmental conservation, which aligns perfectly with my love for the outdoors. I spend most weekends hiking, camping, or skiing depending on the season. There\'s something about being in nature that grounds me and reminds me what\'s truly important. I\'m passionate about sustainability—I try to live in a way that minimizes my impact on the planet. I enjoy reading, especially books about nature and environmental issues. I also love cooking, especially with fresh, local ingredients. I\'m looking for someone who shares my values around sustainability and the environment, who loves being outdoors, and who understands that the best relationships are built on shared values and mutual respect. I believe in living intentionally, in being present, and in creating a life that aligns with your values.',
    interests: ['Hiking', 'Camping', 'Reading', 'Cooking', 'Photography'],
    quizAnswers: {
      'Would you move for love?': 'No, my roots are here',
      'How do you handle conflict in relationships?': 'Take time to think, then discuss',
      'What\'s your ideal Friday night?': 'Quiet evening at home',
      'What matters most in a relationship?': 'Shared values and emotional connection',
      'How do you express love?': 'Through acts of service and quality time',
    },
  },
  {
    id: '8',
    name: 'Sophia',
    age: 30,
    location: 'Nashville, TN',
    gender: 'Female',
    bio: 'Musician and coffee enthusiast. I believe music is the universal language and coffee is the fuel that makes everything possible.',
    profileText: 'I\'m a musician—I play guitar and sing, and I perform at local venues around Nashville. Music has always been my way of expressing myself and connecting with others. I love the live music scene here, and I spend a lot of time going to shows and supporting other artists. I\'m also really into coffee—I\'ve learned to make a mean pour-over and I love trying new coffee shops. I enjoy reading, especially biographies of musicians and books about creativity. I\'m also into yoga and meditation, which help me stay grounded amidst the chaos of the music industry. I\'m looking for someone who appreciates music and the arts, who values authenticity and creativity, and who understands that relationships require effort and intentionality. I believe in being genuine, in pursuing your passions, and in building connections that are both deep and meaningful.',
    interests: ['Live Music', 'Coffee', 'Yoga', 'Reading', 'Writing'],
    quizAnswers: {
      'Would you move for love?': 'Maybe, for the right person',
      'How do you handle conflict in relationships?': 'Address it immediately',
      'What\'s your ideal Friday night?': 'Going out to socialize',
      'What matters most in a relationship?': 'Emotional connection and shared interests',
      'How do you express love?': 'Through words of affirmation and quality time',
    },
  },
];

