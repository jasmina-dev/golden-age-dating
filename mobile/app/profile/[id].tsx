import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Pressable, FlatList, Dimensions, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Layout from '@/components/Layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { availableQuizzes, Quiz, QuizQuestion } from '@/constants/Quizzes';
import { getCurrentUser, saveUser, getUserById } from '@/lib/storage';
import { KindredUser, sampleUserData } from '@/constants/UserData';
import { getPostsByUserId, CommunityPost } from '@/constants/CommunityPosts';
import { getApprovedVouchesByUserId, Vouch } from '@/constants/Vouches';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_PADDING = 24;
const CAROUSEL_PADDING = 24;
const CARD_WIDTH = SCREEN_WIDTH - (CONTAINER_PADDING * 2) - (CAROUSEL_PADDING * 2); // Account for container and carousel padding

/**
 * Calculate the percentage of shared interests between the current user and a target profile
 * Returns a percentage (0-100) based on the Jaccard similarity coefficient
 */
const calculateKindredMatch = (
  currentUserInterests: string[],
  targetProfileInterests: string[]
): number => {
  // If either user has no interests, return 0
  if (currentUserInterests.length === 0 || targetProfileInterests.length === 0) {
    return 0;
  }

  // Normalize interests to lowercase for comparison
  const currentInterestsLower = currentUserInterests.map((i) => i.toLowerCase());
  const targetInterestsLower = targetProfileInterests.map((i) => i.toLowerCase());

  // Find shared interests
  const sharedInterests = currentInterestsLower.filter((interest) =>
    targetInterestsLower.includes(interest)
  );

  // Calculate Jaccard similarity: intersection / union
  const union = new Set([...currentInterestsLower, ...targetInterestsLower]);
  const intersection = sharedInterests.length;
  const unionSize = union.size;

  // Calculate percentage
  const percentage = Math.round((intersection / unionSize) * 100);

  return percentage;
};

export default function ProfileView() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('about');
  const [currentUser, setCurrentUser] = useState<KindredUser | null>(null);
  const [viewedProfile, setViewedProfile] = useState<KindredUser | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [questionId: string]: string }>({});
  const [approvedVouches, setApprovedVouches] = useState<Vouch[]>([]);
  const [allApprovedVouches, setAllApprovedVouches] = useState<Vouch[]>([]);

  const tabs = ['about', 'quizzes', 'journal'];

  // Load profile data
  useEffect(() => {
    const loggedInUser = getCurrentUser();
    setCurrentUser(loggedInUser);
    
    // Load the profile being viewed
    if (id) {
      // First check in saved users
      let profile: KindredUser | null = getUserById(id as string) || null;
      
      // If not found, check sample data
      if (!profile) {
        profile = sampleUserData.find((user) => user.id === id) || null;
      }
      
      setViewedProfile(profile);
      
      // Check if viewing own profile
      if (loggedInUser && id === loggedInUser.id) {
        setIsOwnProfile(true);
        setViewedProfile(loggedInUser);
      }

      // Load approved vouches for this profile
      if (profile) {
        // Get all approved vouches to display at the top
        const allVouches = getApprovedVouchesByUserId(profile.id);
        setApprovedVouches(allVouches);
        setAllApprovedVouches(allVouches);
      }
    }
  }, [id]);

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setQuizAnswers({});
    setShowQuizModal(true);
  };

  const handleAnswerSelect = (answer: string) => {
    if (!selectedQuiz) return;
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    setQuizAnswers({
      ...quizAnswers,
      [currentQuestion.text]: answer,
    });
  };

  const handleNextQuestion = () => {
    if (!selectedQuiz) return;
    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleCompleteQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleCompleteQuiz = () => {
    if (!selectedQuiz || !currentUser) return;

    // Merge new quiz answers with existing ones
    const updatedQuizAnswers = {
      ...(currentUser.quizAnswers || {}),
      ...quizAnswers,
    };

    // Update user profile
    const updatedUser: KindredUser = {
      ...currentUser,
      quizAnswers: updatedQuizAnswers,
    };

    saveUser(updatedUser);
    setCurrentUser(updatedUser);
    
    // Also update viewedProfile if viewing own profile
    if (isOwnProfile) {
      setViewedProfile(updatedUser);
    }
    
    setShowQuizModal(false);
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setQuizAnswers({});
  };

  const getCurrentAnswer = (): string | null => {
    if (!selectedQuiz) return null;
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    return quizAnswers[currentQuestion.text] || null;
  };

  // Get quiz comparison data for viewing someone else's profile
  const getQuizComparisons = () => {
    if (!currentUser || !viewedProfile || isOwnProfile) return [];

    const comparisons: Array<{
      quiz: Quiz;
      questions: Array<{
        question: QuizQuestion;
        viewerAnswer: string | null;
        profileAnswer: string | null;
        isMatch: boolean;
      }>;
    }> = [];

    availableQuizzes.forEach((quiz) => {
      const questionComparisons = quiz.questions.map((question) => {
        const viewerAnswer = currentUser.quizAnswers?.[question.text] || null;
        const profileAnswer = viewedProfile.quizAnswers?.[question.text] || null;
        const isMatch = viewerAnswer !== null && profileAnswer !== null && viewerAnswer === profileAnswer;

        return {
          question,
          viewerAnswer,
          profileAnswer,
          isMatch,
        };
      });

      // Only include quizzes where at least one question has answers from both users
      const hasComparableAnswers = questionComparisons.some(
        (qc) => qc.viewerAnswer !== null && qc.profileAnswer !== null
      );

      if (hasComparableAnswers) {
        comparisons.push({
          quiz,
          questions: questionComparisons,
        });
      }
    });

    return comparisons;
  };

  const quizComparisons = getQuizComparisons();

  // Calculate compatibility percentage
  const compatibilityPercentage = !isOwnProfile && currentUser && viewedProfile
    ? calculateKindredMatch(currentUser.interests || [], viewedProfile.interests || [])
    : 0;

  // Get journal posts for the viewed profile
  const journalPosts = viewedProfile ? getPostsByUserId(viewedProfile.id) : [];

  return (
    <Layout>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        scrollEnabled={true}
      >
        {/* Header with Back Button */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={20} color={Colors.text} />
          </TouchableOpacity>

          {/* Profile Header */}
          <View style={styles.profileHeader}>
            {viewedProfile?.imageUrl ? (
              <Image
                source={{ uri: viewedProfile.imageUrl }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profileImagePlaceholder} />
            )}
            {/* Verification Badge */}
            <View style={styles.verifiedBadge}>
              <FontAwesome name="check-circle" size={20} color="#fff" />
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <View style={styles.profileCard}>
              <Text style={styles.profileName}>
                {viewedProfile ? `${viewedProfile.name}, ${viewedProfile.age}` : 'Loading...'}
              </Text>
              <Text style={styles.profileLocation}>
                {viewedProfile?.location || ''}
              </Text>
              
              {/* Compatibility Badge - Only show if not own profile */}
              {!isOwnProfile && currentUser && viewedProfile && (
                <>
                  <View style={styles.compatibilityBadge}>
                    <FontAwesome name="heart" size={32} color={Colors.primary} />
                    <Text style={styles.compatibilityPercent}>{compatibilityPercentage}%</Text>
                    <Text style={styles.compatibilityLabel}>Kindred Match</Text>
                  </View>
                  
                  {/* Action Buttons - Moved to top */}
                  <View style={styles.actionButtonsTop}>
                    <TouchableOpacity style={styles.messageButton}>
                      <FontAwesome name="comment" size={20} color="#fff" />
                      <Text style={styles.messageButtonText}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                      <FontAwesome name="comment-o" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                      <FontAwesome name="gift" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Vouches Section - Pinned to Top */}
        {approvedVouches.length > 0 && (
          <View style={styles.pinnedVouchesSection}>
            {approvedVouches.map((vouch) => (
              <View key={vouch.id} style={styles.vouchCard}>
                <View style={styles.vouchHeader}>
                  <View style={styles.vouchHeaderLeft}>
                    <FontAwesome name="check-circle" size={18} color="#D4AF37" />
                    <Text style={styles.vouchFriendName}>Vouched by {vouch.friendName}</Text>
                  </View>
                  <View style={styles.approvedBadge}>
                    <FontAwesome name="check-circle" size={14} color={Colors.primary} />
                    <Text style={styles.approvedText}>Approved</Text>
                  </View>
                </View>
                <View style={styles.vouchContent}>
                  <View style={styles.vouchSection}>
                    <Text style={styles.vouchLabel}>Green Flag</Text>
                    <Text style={styles.vouchAnswer}>{vouch.greenFlag}</Text>
                  </View>
                  <View style={styles.vouchSection}>
                    <Text style={styles.vouchLabel}>Hidden Talent</Text>
                    <Text style={styles.vouchAnswer}>{vouch.hiddenTalent}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsList}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'about' && viewedProfile && (
              <View style={styles.contentSection}>
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>About</Text>
                  <Text style={styles.contentText}>
                    {viewedProfile.bio}
                  </Text>
                </View>
                
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>Interests</Text>
                  <View style={styles.interestsContainer}>
                    {viewedProfile.interests.map((interest) => (
                      <View key={interest} style={styles.interestBadge}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'quizzes' && (
              <View style={styles.contentSection}>
                {isOwnProfile ? (
                  <>
                    <Text style={styles.sectionTitle}>Available Quizzes</Text>
                    {availableQuizzes.map((quiz) => {
                      const isCompleted = currentUser?.quizAnswers && 
                        quiz.questions.every((q) => currentUser.quizAnswers[q.text]);
                      
                      return (
                        <TouchableOpacity
                          key={quiz.id}
                          style={styles.quizCard}
                          onPress={() => handleStartQuiz(quiz)}
                        >
                          <View style={styles.quizCardHeader}>
                            <Text style={styles.quizTitle}>{quiz.title}</Text>
                            {isCompleted && (
                              <View style={styles.completedBadge}>
                                <FontAwesome name="check-circle" size={16} color={Colors.primary} />
                                <Text style={styles.completedText}>Completed</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.quizDescription}>
                            {quiz.questions.length} questions
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {quizComparisons.length > 0 ? (
                      quizComparisons.map((comparison) => (
                        <View key={comparison.quiz.id} style={styles.quizComparisonContainer}>
                          <Text style={styles.quizComparisonTitle}>{comparison.quiz.title}</Text>
                          <View style={styles.carouselWrapper}>
                            <FlatList
                              horizontal
                              data={comparison.questions}
                              keyExtractor={(item, index) => `${comparison.quiz.id}-${item.question.id}-${index}`}
                              renderItem={({ item }) => {
                              const hasViewerAnswer = item.viewerAnswer !== null;
                              const hasProfileAnswer = item.profileAnswer !== null;
                              
                              return (
                                <View
                                  style={[
                                    styles.quizComparisonCard,
                                    item.isMatch && styles.quizComparisonCardMatch,
                                  ]}
                                >
                                  {item.isMatch && (
                                    <View style={styles.matchBadge}>
                                      <FontAwesome name="check-circle" size={20} color="#fff" />
                                      <Text style={styles.matchBadgeText}>Match!</Text>
                                    </View>
                                  )}
                                  <Text style={styles.comparisonQuestionText}>
                                    {item.question.text}
                                  </Text>
                                  
                                  {hasViewerAnswer && hasProfileAnswer ? (
                                    <>
                                      <View style={styles.answerContainer}>
                                        <Text style={styles.answerLabel}>You:</Text>
                                        <Text
                                          style={[
                                            styles.answerText,
                                            item.isMatch && styles.answerTextMatch,
                                          ]}
                                        >
                                          {item.viewerAnswer}
                                        </Text>
                                      </View>
                                      <View style={styles.answerContainer}>
                                        <Text style={styles.answerLabel}>{viewedProfile?.name}:</Text>
                                        <Text
                                          style={[
                                            styles.answerText,
                                            item.isMatch && styles.answerTextMatch,
                                          ]}
                                        >
                                          {item.profileAnswer}
                                        </Text>
                                      </View>
                                    </>
                                  ) : (
                                    <View style={styles.answerContainer}>
                                      {hasViewerAnswer && (
                                        <>
                                          <Text style={styles.answerLabel}>You:</Text>
                                          <Text style={styles.answerText}>{item.viewerAnswer}</Text>
                                        </>
                                      )}
                                      {hasProfileAnswer && (
                                        <>
                                          <Text style={styles.answerLabel}>{viewedProfile?.name}:</Text>
                                          <Text style={styles.answerText}>{item.profileAnswer}</Text>
                                        </>
                                      )}
                                      {!hasViewerAnswer && !hasProfileAnswer && (
                                        <Text style={styles.noAnswerText}>No answer yet</Text>
                                      )}
                                    </View>
                                  )}
                                </View>
                              );
                            }}
                              showsHorizontalScrollIndicator={false}
                              snapToInterval={CARD_WIDTH + 16}
                              snapToAlignment="start"
                              decelerationRate="fast"
                              pagingEnabled={false}
                              nestedScrollEnabled={true}
                              scrollEnabled={true}
                              bounces={false}
                              removeClippedSubviews={false}
                              contentContainerStyle={styles.carouselContent}
                              style={styles.carouselFlatList}
                              directionalLockEnabled={true}
                            />
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.contentCard}>
                        <Text style={styles.emptyContentText}>
                          {currentUser?.quizAnswers && Object.keys(currentUser.quizAnswers).length === 0
                            ? 'Complete quizzes to see comparisons'
                            : 'No quiz comparisons available yet'}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            {activeTab === 'journal' && (
              <View style={styles.journalContainer}>
                {journalPosts.length > 0 ? (
                  <View style={styles.postsContainer}>
                    {journalPosts.map((post) => (
                      <View key={post.id} style={styles.postCard}>
                        {/* User Info */}
                        <View style={styles.postHeader}>
                          <View style={styles.postAvatar} />
                          <View>
                            <Text style={styles.postUserName}>{post.userName}</Text>
                            <Text style={styles.postUserAge}>{post.userAge} years old</Text>
                          </View>
                        </View>

                        {/* Post Content */}
                        <Text style={styles.postContent}>{post.content}</Text>

                        {/* Interaction Bar */}
                        <View style={styles.postInteractions}>
                          <TouchableOpacity style={styles.postInteraction}>
                            <FontAwesome name="heart" size={18} color={Colors.secondary} />
                            <Text style={styles.postInteractionText}>{post.likes}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.postInteraction}>
                            <FontAwesome name="comment" size={18} color={Colors.textLight} />
                            <Text style={styles.postInteractionText}>{post.comments}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.contentCard}>
                    <Text style={styles.emptyContentText}>This user hasn't journaled yet.</Text>
                  </View>
                )}
              </View>
            )}

          </View>
        </View>

      </ScrollView>

      {/* Quiz Modal */}
      <Modal
        visible={showQuizModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowQuizModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowQuizModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {selectedQuiz && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedQuiz.title}</Text>
                  <TouchableOpacity
                    onPress={() => setShowQuizModal(false)}
                    style={styles.modalCloseButton}
                  >
                    <FontAwesome name="times" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                  </Text>
                </View>

                <ScrollView style={styles.quizContent}>
                  <Text style={styles.questionText}>
                    {selectedQuiz.questions[currentQuestionIndex].text}
                  </Text>

                  <View style={styles.optionsContainer}>
                    {selectedQuiz.questions[currentQuestionIndex].options.map((option, index) => {
                      const isSelected = getCurrentAnswer() === option;
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.optionButton,
                            isSelected && styles.optionButtonSelected,
                          ]}
                          onPress={() => handleAnswerSelect(option)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              isSelected && styles.optionTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                          {isSelected && (
                            <FontAwesome name="check-circle" size={20} color={Colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[
                      styles.navButton,
                      currentQuestionIndex === 0 && styles.navButtonDisabled,
                    ]}
                    onPress={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <FontAwesome name="chevron-left" size={16} color={currentQuestionIndex === 0 ? '#999' : '#000'} />
                    <Text
                      style={[
                        styles.navButtonText,
                        currentQuestionIndex === 0 && styles.navButtonTextDisabled,
                      ]}
                    >
                      Previous
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      !getCurrentAnswer() && styles.nextButtonDisabled,
                    ]}
                    onPress={handleNextQuestion}
                    disabled={!getCurrentAnswer()}
                  >
                    <Text style={styles.nextButtonText}>
                      {currentQuestionIndex === selectedQuiz.questions.length - 1
                        ? 'Complete'
                        : 'Next'}
                    </Text>
                    {currentQuestionIndex < selectedQuiz.questions.length - 1 && (
                      <FontAwesome name="chevron-right" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerSection: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    height: 400,
    backgroundColor: '#f0f0f0',
    position: 'relative',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 8,
  },
  profileInfo: {
    paddingHorizontal: 24,
    marginTop: -32,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    marginBottom: 8,
  },
  profileLocation: {
    fontSize: 16,
    color: '#999',
    marginBottom: 16,
  },
  compatibilityBadge: {
    backgroundColor: 'rgba(220, 104, 116, 0.05)',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  compatibilityPercent: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.primary,
  },
  compatibilityLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  pinnedVouchesSection: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 8,
    gap: 16,
  },
  tabsContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabContent: {
    marginBottom: 200,
    paddingBottom: 20,
  },
  contentSection: {
    gap: 16,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestBadge: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  emptyContentText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 24,
  },
  actionButtonsTop: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  iconButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  quizCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  quizCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  quizDescription: {
    fontSize: 14,
    color: '#666',
  },
  quizResultsContainer: {
    gap: 16,
  },
  quizResultItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  quizResultQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  quizResultAnswer: {
    fontSize: 14,
    color: '#666',
  },
  quizComparisonContainer: {
    marginBottom: 32,
  },
  quizComparisonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  carouselContent: {
    paddingHorizontal: 24,
  },
  carouselWrapper: {
    height: 320,
  },
  carouselFlatList: {
    flex: 1,
  },
  quizComparisonCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 280,
  },
  quizComparisonCardMatch: {
    backgroundColor: 'rgba(220, 104, 116, 0.08)',
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  matchBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  comparisonQuestionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    lineHeight: 26,
  },
  answerContainer: {
    marginBottom: 16,
    gap: 6,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  answerText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    lineHeight: 22,
  },
  answerTextMatch: {
    color: Colors.primary,
    fontWeight: '600',
  },
  noAnswerText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  modalCloseButton: {
    padding: 4,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e5e5',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  quizContent: {
    flex: 1,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(220, 104, 116, 0.15)',
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  nextButtonDisabled: {
    backgroundColor: '#e5e5e5',
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  journalContainer: {
    gap: 20,
  },
  postsContainer: {
    gap: 20,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
  },
  postUserName: {
    fontSize: Typography.heading.fontSize.xs,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    letterSpacing: Typography.heading.letterSpacing,
  },
  postUserAge: {
    fontSize: Typography.body.fontSize.xs,
    color: Colors.textLight,
    fontFamily: Typography.body.fontFamily,
    marginTop: 2,
  },
  postContent: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
    lineHeight: Typography.body.lineHeight.md,
    marginBottom: 20,
  },
  postInteractions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  postInteraction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postInteractionText: {
    fontSize: Typography.body.fontSize.sm,
    fontWeight: '500',
    color: Colors.textMuted,
    fontFamily: Typography.body.fontFamily,
  },
  vouchesSection: {
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  verifiedReviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#D4AF37', // Gold border
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  verifiedReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  verifiedReviewBadge: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '700',
    color: '#D4AF37',
  },
  verifiedReviewContent: {
    gap: 16,
  },
  verifiedReviewItem: {
    gap: 8,
  },
  verifiedReviewLabel: {
    fontSize: Typography.body.fontSize.xs,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '600',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedReviewText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
    lineHeight: Typography.body.lineHeight.md,
    fontWeight: '500',
  },
  vouchesTabContainer: {
    gap: 16,
  },
  vouchesList: {
    gap: 16,
  },
  vouchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vouchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vouchHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  vouchFriendName: {
    fontSize: Typography.heading.fontSize.sm,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    letterSpacing: Typography.heading.letterSpacing,
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(220, 104, 116, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  approvedText: {
    fontSize: Typography.body.fontSize.xs,
    fontFamily: Typography.body.fontFamily,
    color: Colors.primary,
    fontWeight: '600',
  },
  vouchContent: {
    gap: 16,
  },
  vouchSection: {
    gap: 8,
  },
  vouchLabel: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '600',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vouchAnswer: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
    lineHeight: Typography.body.lineHeight.md,
  },
});

