import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Layout from '@/components/Layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

export default function Quiz() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [explanation, setExplanation] = useState('');

  const quiz = {
    title: "The Romantic's Quiz",
    questions: [
      {
        id: 1,
        text: 'Would you move for love?',
        options: ['Absolutely', 'Maybe, for the right person', "No, my roots are here"],
      },
      {
        id: 2,
        text: 'How do you handle conflict in relationships?',
        options: [
          'Address it immediately',
          'Take time to think, then discuss',
          'Avoid confrontation when possible',
        ],
      },
      {
        id: 3,
        text: "What's your ideal Friday night?",
        options: [
          'Going out to socialize',
          'Quiet evening at home',
          'Mix of both, depending on mood',
        ],
      },
    ],
  };

  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setExplanation('');
    } else {
      // Quiz complete
      router.push('/explore');
    }
  };

  return (
    <Layout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <FontAwesome name="arrow-left" size={20} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.quizTitle}>{quiz.title}</Text>
          </View>

          {/* Progress Tracker */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Question {currentQuestion + 1} of {totalQuestions}
            </Text>
          </View>
        </SafeAreaView>

        {/* Question Card */}
        <View style={styles.questionSection}>
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>
              {quiz.questions[currentQuestion].text}
            </Text>

            {/* Answer Options */}
            <View style={styles.optionsContainer}>
              {quiz.questions[currentQuestion].options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswer === option && styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedAnswer(option)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedAnswer === option && styles.optionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Explanation Box */}
            {selectedAnswer && (
              <View style={styles.explanationSection}>
                <Text style={styles.explanationLabel}>
                  Write an explanation (optional)
                </Text>
                <TextInput
                  value={explanation}
                  onChangeText={setExplanation}
                  placeholder="Why did you choose this answer?"
                  style={styles.explanationInput}
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}
          </View>

          {/* Navigation */}
          {selectedAnswer && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestion < totalQuestions - 1
                  ? 'Next Question'
                  : 'Complete Quiz'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Instant Feedback */}
          {selectedAnswer && (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>
                Your match type is evolving:{' '}
                <Text style={styles.feedbackBold}>The Steady Soul</Text>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
  },
  progressSection: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  questionSection: {
    padding: 24,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#000',
  },
  questionText: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  optionTextActive: {
    color: '#fff',
  },
  explanationSection: {
    gap: 12,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  explanationInput: {
    minHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
  },
  nextButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  feedbackCard: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  feedbackBold: {
    fontWeight: '900',
  },
});

