// Quiz Data Structure

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

// Available Quizzes
export const availableQuizzes: Quiz[] = [
  {
    id: 'dating-style',
    title: 'Dating Style',
    questions: [
      {
        id: 'q1',
        text: 'Would you move for love?',
        options: [
          'Absolutely',
          'Maybe, for the right person',
          'No, my roots are here',
        ],
      },
      {
        id: 'q2',
        text: 'How do you handle conflict in relationships?',
        options: [
          'Address it immediately',
          'Take time to think, then discuss',
          'Avoid confrontation when possible',
        ],
      },
      {
        id: 'q3',
        text: "What's your ideal Friday night?",
        options: [
          'Going out to socialize',
          'Quiet evening at home',
          'Mix of both, depending on mood',
        ],
      },
      {
        id: 'q4',
        text: 'What matters most in a relationship?',
        options: [
          'Emotional connection and shared values',
          'Intellectual compatibility and emotional support',
          'Shared experiences and mutual support',
        ],
      },
      {
        id: 'q5',
        text: 'How do you express love?',
        options: [
          'Through words of affirmation and quality time',
          'Through quality time and acts of service',
          'Through acts of service and physical touch',
        ],
      },
    ],
  },
  {
    id: 'communication-style',
    title: 'Communication Style',
    questions: [
      {
        id: 'q1',
        text: 'How do you prefer to communicate important feelings?',
        options: [
          'Face-to-face conversation',
          'Through text or written messages',
          'A mix of both',
        ],
      },
      {
        id: 'q2',
        text: 'When you have a disagreement, you typically:',
        options: [
          'Want to resolve it immediately',
          'Need time to process before discussing',
          'Prefer to let it go and move on',
        ],
      },
      {
        id: 'q3',
        text: 'How often do you like to check in with your partner?',
        options: [
          'Multiple times a day',
          'Once or twice a day',
          'A few times a week',
        ],
      },
      {
        id: 'q4',
        text: 'What makes you feel most loved?',
        options: [
          'Hearing "I love you" and compliments',
          'Quality time together',
          'Acts of service and thoughtful gestures',
        ],
      },
      {
        id: 'q5',
        text: 'How do you handle stress in relationships?',
        options: [
          'Talk it out with your partner',
          'Take space and process alone',
          'Distract yourself with activities',
        ],
      },
    ],
  },
  {
    id: 'lifestyle-preferences',
    title: 'Lifestyle Preferences',
    questions: [
      {
        id: 'q1',
        text: 'What does your ideal weekend look like?',
        options: [
          'Adventurous activities and exploring',
          'Relaxing at home with good food and company',
          'Mix of social events and downtime',
        ],
      },
      {
        id: 'q2',
        text: 'How do you prefer to spend your free time?',
        options: [
          'Outdoors and active pursuits',
          'Creative and intellectual activities',
          'Socializing and connecting with others',
        ],
      },
      {
        id: 'q3',
        text: 'What is your approach to work-life balance?',
        options: [
          'Work hard, play hard',
          'Prioritize balance and boundaries',
          'Work is important but relationships come first',
        ],
      },
      {
        id: 'q4',
        text: 'How do you feel about travel?',
        options: [
          'Love exploring new places regularly',
          'Enjoy occasional trips',
          'Prefer staying close to home',
        ],
      },
      {
        id: 'q5',
        text: 'What energizes you most?',
        options: [
          'Physical activity and movement',
          'Deep conversations and learning',
          'Social connections and community',
        ],
      },
    ],
  },
  {
    id: 'values-priorities',
    title: 'Values & Priorities',
    questions: [
      {
        id: 'q1',
        text: 'What is most important to you in life?',
        options: [
          'Personal growth and fulfillment',
          'Meaningful relationships',
          'Making a positive impact',
        ],
      },
      {
        id: 'q2',
        text: 'How do you approach decision-making?',
        options: [
          'Trust your intuition',
          'Analyze pros and cons carefully',
          'Seek advice from trusted people',
        ],
      },
      {
        id: 'q3',
        text: 'What role does spirituality play in your life?',
        options: [
          'Central to how I live',
          'Important but not central',
          'Not a significant factor',
        ],
      },
      {
        id: 'q4',
        text: 'How do you view long-term commitment?',
        options: [
          'Essential for a fulfilling relationship',
          'Important but flexible',
          'Prefer to take things as they come',
        ],
      },
      {
        id: 'q5',
        text: 'What matters most when choosing a partner?',
        options: [
          'Shared values and life goals',
          'Emotional connection and chemistry',
          'Intellectual compatibility and interests',
        ],
      },
    ],
  },
];

/**
 * Get a quiz by ID
 */
export const getQuizById = (id: string): Quiz | undefined => {
  return availableQuizzes.find((quiz) => quiz.id === id);
};

