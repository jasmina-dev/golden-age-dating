import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Pressable, FlatList, Dimensions, Image, PanResponder, Animated, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Layout from '@/components/Layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { availableQuizzes, Quiz, QuizQuestion } from '@/constants/Quizzes';
import { getCurrentUser, saveUser, getUserById } from '@/lib/storage';
import { KindredUser, sampleUserData, PolaroidImage } from '@/constants/UserData';
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
  
  // Polaroid stack state
  const [polaroidStack, setPolaroidStack] = useState<PolaroidImage[]>([]);
  const panResponders = useRef<any[]>([]);
  const panValues = useRef<Animated.ValueXY[]>([]);
  const rotationValues = useRef<Animated.Value[]>([]);

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
        
        // Initialize polaroid stack
        if (profile.polaroidImages && profile.polaroidImages.length > 0) {
          setPolaroidStack([...profile.polaroidImages]);
        } else {
          setPolaroidStack([]);
        }
      }
    }
  }, [id]);
  
  // Initialize pan values and rotation values when polaroid stack changes
  useEffect(() => {
    if (polaroidStack.length === 0) return;
    
    // Ensure we have the right number of animated values
    while (panValues.current.length < polaroidStack.length) {
      panValues.current.push(new Animated.ValueXY({ x: 0, y: 0 }));
      rotationValues.current.push(new Animated.Value(0));
    }
    
    // Reset all values to initial state
    panValues.current.forEach((val, idx) => {
      if (idx === 0) {
        // Top polaroid should be at center
        val.setValue({ x: 0, y: 0 });
      } else {
        // Stacked polaroids have offset positions
        const baseX = (idx % 2 === 0 ? 1 : -1) * (10 + idx * 5);
        const baseY = idx * 5;
        val.setValue({ x: baseX, y: baseY });
      }
    });
    
    rotationValues.current.forEach((val, idx) => {
      if (idx === 0) {
        val.setValue(0);
      } else {
        const baseRotation = (idx % 2 === 0 ? 1 : -1) * (3 + idx * 2);
        val.setValue(baseRotation);
      }
    });
  }, [polaroidStack.length]);
  
  // Create pan responders for swipe functionality using useMemo
  // This ensures responders are created during render phase, ready immediately when View needs them
  const panRespondersMemo = useMemo(() => {
    if (polaroidStack.length === 0 || panValues.current.length === 0) {
      return [];
    }
    
    return polaroidStack.map((_, index) => {
      // Only the top polaroid (index 0) should be swipeable
      if (index !== 0) {
        return null;
      }
      
      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          // Only respond to significant movement
          return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
        },
        onPanResponderGrant: () => {
          // Reset any ongoing animations
          if (panValues.current[index]) {
            panValues.current[index].stopAnimation();
          }
          if (rotationValues.current[index]) {
            rotationValues.current[index].stopAnimation();
          }
        },
        onPanResponderMove: (evt, gestureState) => {
          if (panValues.current[index] && rotationValues.current[index]) {
            panValues.current[index].setValue({
              x: gestureState.dx,
              y: gestureState.dy,
            });
            // Add rotation based on horizontal movement (more pronounced)
            rotationValues.current[index].setValue(gestureState.dx / 8);
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (!panValues.current[index] || !rotationValues.current[index]) return;
          
          const SWIPE_THRESHOLD = 80;
          const velocity = Math.sqrt(gestureState.vx * gestureState.vx + gestureState.vy * gestureState.vy);
          
          // Check if swipe is significant enough (distance or velocity)
          if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD || 
              Math.abs(gestureState.dy) > SWIPE_THRESHOLD ||
              velocity > 0.5) {
            // Swipe detected - animate to edge and then send to back
            const screenWidth = Dimensions.get('window').width;
            const exitX = gestureState.dx > 0 ? screenWidth + 300 : -screenWidth - 300;
            const exitY = gestureState.dy + gestureState.vy * 100;
            
            Animated.parallel([
              Animated.timing(panValues.current[index], {
                toValue: { x: exitX, y: exitY },
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(rotationValues.current[index], {
                toValue: gestureState.dx > 0 ? 30 : -30,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start(() => {
              // After animation completes, send to back
              const newStack = [...polaroidStack];
              const topPolaroid = newStack.shift();
              if (topPolaroid) {
                newStack.push(topPolaroid);
                setPolaroidStack(newStack);
                
                // Reorder pan values and rotation values
                const panValue = panValues.current.shift();
                const rotationValue = rotationValues.current.shift();
                if (panValue) {
                  panValue.setValue({ x: 0, y: 0 });
                  panValues.current.push(panValue);
                }
                if (rotationValue) {
                  rotationValue.setValue(0);
                  rotationValues.current.push(rotationValue);
                }
              }
            });
          } else {
            // Snap back to original position
            Animated.parallel([
              Animated.spring(panValues.current[index], {
                toValue: { x: 0, y: 0 },
                tension: 50,
                friction: 7,
                useNativeDriver: true,
              }),
              Animated.spring(rotationValues.current[index], {
                toValue: 0,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
              }),
            ]).start();
          }
        },
      });
    });
  }, [polaroidStack]);
  
  // Update ref with memoized responders
  useEffect(() => {
    panResponders.current = panRespondersMemo;
  }, [panRespondersMemo]);

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

  // Render polaroid stack
  const renderPolaroidStack = () => {
    if (!polaroidStack || polaroidStack.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.polaroidStackContainer}>
        {polaroidStack.map((polaroid, index) => {
          const isTop = index === 0;
          const zIndex = polaroidStack.length - index;
          
          // Get animated values for top polaroid, static values for others
          let translateX: any;
          let translateY: any;
          let rotate: any;
          
          if (isTop && panValues.current[index] && rotationValues.current[index]) {
            translateX = panValues.current[index].x;
            translateY = panValues.current[index].y;
            rotate = rotationValues.current[index].interpolate({
              inputRange: [-100, 0, 100],
              outputRange: ['-30deg', '0deg', '30deg'],
            });
          } else {
            // Static positioning for stacked polaroids
            const baseRotation = (index % 2 === 0 ? 1 : -1) * (3 + index * 2);
            const baseX = (index % 2 === 0 ? 1 : -1) * (10 + index * 5);
            const baseY = index * 5;
            
            // Use animated values for stacked polaroids too (for smooth transitions)
            if (panValues.current[index] && rotationValues.current[index]) {
              translateX = panValues.current[index].x;
              translateY = panValues.current[index].y;
              rotate = rotationValues.current[index].interpolate({
                inputRange: [-10, 0, 10],
                outputRange: [`${baseRotation - 2}deg`, `${baseRotation}deg`, `${baseRotation + 2}deg`],
              });
            } else {
              translateX = new Animated.Value(baseX);
              translateY = new Animated.Value(baseY);
              rotate = `${baseRotation}deg`;
            }
          }
          
          const panResponder = isTop && panRespondersMemo[index] 
            ? panRespondersMemo[index] 
            : null;
          
          return (
            <Animated.View
              key={`${polaroid.id}-${index}`}
              style={[
                styles.polaroidWrapper,
                {
                  zIndex,
                  transform: [
                    { translateX },
                    { translateY },
                    { rotate },
                  ],
                },
              ]}
              {...(isTop && panResponder ? panResponder.panHandlers : {})}
              pointerEvents={isTop ? 'auto' : 'none'}
            >
              <View style={styles.polaroidFrame} pointerEvents="none">
                <View style={styles.polaroidImageContainer}>
                  <Image
                    source={{ uri: polaroid.imageUrl }}
                    style={styles.polaroidImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.polaroidLabelContainer}>
                  <Text style={styles.polaroidLabel}>{polaroid.label}</Text>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  return (
    <Layout>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Polaroid Stack Section */}
          {polaroidStack.length > 0 ? (
            <View style={styles.polaroidSection}>
              {renderPolaroidStack()}
            </View>
          ) : (
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
            </View>
          )}

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {viewedProfile ? `${viewedProfile.name}, ${viewedProfile.age}` : 'Loading...'}
            </Text>
            {!isOwnProfile && currentUser && viewedProfile && (
              <Text style={styles.kindredMatch}>
                {compatibilityPercentage}% kindred spirit
              </Text>
            )}
            {viewedProfile?.interests && viewedProfile.interests.length > 0 && (
              <View style={styles.interestsRow}>
                {viewedProfile.interests.slice(0, 2).map((interest, idx) => (
                  <Text 
                    key={idx} 
                    style={[
                      styles.interestText,
                      idx === 0 && styles.interestTextShared
                    ]}
                  >
                    {interest.toLowerCase()}
                  </Text>
                ))}
              </View>
            )}
          </View>

        {/* Vouches Section - Pinned to Top with Gradient Background */}
        {approvedVouches.length > 0 && (
          <View style={styles.pinnedVouchesSection}>
            {/* Soft Gradient Background */}
            <LinearGradient
              colors={['#FFFBF7', '#FFE8D6']} // Soft Cream to Pale Peach
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            
            {/* Vouch Cards - Solid White */}
            <View style={styles.vouchesContentContainer}>
              {approvedVouches.map((vouch) => (
                <View key={vouch.id} style={styles.vouchCard}>
                  <View style={styles.vouchHeader}>
                    <View style={styles.vouchHeaderLeft}>
                      <FontAwesome name="check-circle" size={18} color={Colors.gold} />
                      <Text style={styles.vouchFriendName}>Vouched by {vouch.friendName}</Text>
                    </View>
                    <LinearGradient
                      colors={['#FFB3BA', '#FFDFBA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.approvedBadge}
                    >
                      <FontAwesome name="check-circle" size={12} color="#FFFFFF" />
                      <Text style={styles.approvedText}>Approved</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.vouchContent}>
                    <View style={styles.vouchSection}>
                      <Text style={styles.vouchLabel}>GREEN FLAG</Text>
                      <Text style={styles.vouchAnswer}>{vouch.greenFlag}</Text>
                    </View>
                    <View style={styles.vouchSection}>
                      <Text style={styles.vouchLabel}>HIDDEN TALENT</Text>
                      <Text style={styles.vouchAnswer}>{vouch.hiddenTalent}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
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
                {/* Soft Gradient Background */}
                <LinearGradient
                  colors={['#FFFBF7', '#FFE8D6']} // Soft Cream to Pale Peach
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                
                <View style={styles.contentCardsContainer}>
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
                                <FontAwesome name="check-circle" size={16} color={Colors.gold} />
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
                                      <FontAwesome name="check-circle" size={20} color={Colors.background} />
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
      </View>

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
                    <FontAwesome name="times" size={24} color={Colors.text} />
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
                            <FontAwesome name="check-circle" size={20} color={Colors.gold} />
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
                    <FontAwesome name="chevron-left" size={16} color={currentQuestionIndex === 0 ? Colors.textLight : Colors.text} />
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
                      <FontAwesome name="chevron-right" size={16} color={Colors.background} />
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
    backgroundColor: '#F5D7D7', // Muted pink background
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  polaroidSection: {
    height: 500,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  polaroidStackContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  polaroidWrapper: {
    position: 'absolute',
    width: 280,
    height: 360,
    // Ensure touch events work properly
    pointerEvents: 'box-none',
  },
  polaroidFrame: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#8B0000', // Dark red outline
  },
  polaroidImageContainer: {
    width: '100%',
    height: '80%',
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  polaroidImage: {
    width: '100%',
    height: '100%',
  },
  polaroidLabelContainer: {
    paddingHorizontal: 8,
  },
  polaroidLabel: {
    fontSize: 14,
    fontFamily: Typography.body.fontFamily,
    color: '#000',
    fontStyle: 'italic',
  },
  profileHeader: {
    height: 400,
    backgroundColor: Colors.border,
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
    backgroundColor: Colors.border,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: Colors.gold, // Champagne gold
    borderRadius: 20,
    padding: 8,
  },
  compatibilityOverlay: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black background
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compatibilityOverlayText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.gold, // Champagne gold
  },
  profileInfo: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontFamily: Typography.heading.fontFamily,
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  kindredMatch: {
    fontSize: 16,
    fontFamily: Typography.body.fontFamily,
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  interestsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  interestText: {
    fontSize: 16,
    fontFamily: Typography.body.fontFamily,
    color: '#999999',
  },
  interestTextShared: {
    color: '#666666',
  },
  profileLocation: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 16,
  },
  pinnedVouchesSection: {
    marginTop: 24,
    marginBottom: 8,
    position: 'relative',
  },
  vouchesContentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 20,
    position: 'relative',
  },
  tabsContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: Colors.card, // Slightly lighter burgundy
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border, // Muted burgundy border
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: Colors.gold, // Champagne gold
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight, // Light cream
  },
  tabTextActive: {
    color: Colors.background, // Deep burgundy (for text on gold)
  },
  tabContent: {
    marginBottom: 200,
    paddingBottom: 20,
  },
  contentSection: {
    gap: 20,
    position: 'relative',
    marginBottom: 24,
  },
  contentCardsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 20,
    position: 'relative',
  },
  contentCard: {
    backgroundColor: '#FFFFFF', // Solid white at 100% opacity
    borderRadius: 24, // Deeply rounded corners
    padding: 28,
    shadowColor: 'rgba(0, 0, 0, 0.08)', // Light grey, low opacity
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12, // Soft, diffused shadow
    elevation: 3,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2C', // Dark charcoal for maximum readability
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: '#2C2C2C', // Dark charcoal for maximum readability
    lineHeight: 24,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestBadge: {
    backgroundColor: '#FFE8D6', // Soft pastel peach fill
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFD4B8', // Slightly darker peach border
  },
  emptyContentText: {
    fontSize: 16,
    color: Colors.textLight, // Light cream
    textAlign: 'center',
    padding: 24,
  },
  actionButtonsTop: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.card, // Slightly lighter burgundy
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: Colors.gold, // Champagne gold glow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  messageButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  iconButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gold, // Champagne gold
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text, // Cream/Off-white
    marginBottom: 16,
  },
  quizCard: {
    backgroundColor: Colors.card, // Slightly lighter burgundy
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.gold, // Champagne gold glow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border, // Muted burgundy border
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
    color: Colors.text, // Cream/Off-white
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
    color: Colors.gold, // Champagne gold
  },
  quizDescription: {
    fontSize: 14,
    color: Colors.textLight, // Light cream
  },
  quizResultsContainer: {
    gap: 16,
  },
  quizResultItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border, // Muted burgundy border
  },
  quizResultQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text, // Cream/Off-white
    marginBottom: 8,
  },
  quizResultAnswer: {
    fontSize: 14,
    color: Colors.textMuted, // Muted cream
  },
  quizComparisonContainer: {
    marginBottom: 32,
  },
  quizComparisonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text, // Cream/Off-white
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
    backgroundColor: Colors.card, // Slightly lighter burgundy
    borderRadius: 20,
    padding: 24,
    marginRight: 16,
    borderWidth: 2,
    borderColor: Colors.border, // Muted burgundy border
    shadowColor: Colors.gold, // Champagne gold glow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 280,
  },
  quizComparisonCardMatch: {
    backgroundColor: 'rgba(212, 165, 116, 0.15)', // Champagne gold with opacity
    borderColor: Colors.gold, // Champagne gold
    borderWidth: 3,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.gold, // Champagne gold
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  matchBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.background, // Deep burgundy text on gold
  },
  comparisonQuestionText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text, // Cream/Off-white
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
    color: Colors.textLight, // Light cream
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  answerText: {
    fontSize: 16,
    color: Colors.text, // Cream/Off-white
    fontWeight: '500',
    lineHeight: 22,
  },
  answerTextMatch: {
    color: Colors.gold, // Champagne gold
    fontWeight: '600',
  },
  noAnswerText: {
    fontSize: 14,
    color: Colors.textLight, // Light cream
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card, // Slightly lighter burgundy
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
    color: Colors.text, // Cream/Off-white
  },
  modalCloseButton: {
    padding: 4,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border, // Muted burgundy
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold, // Champagne gold
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textLight, // Light cream
    textAlign: 'center',
  },
  quizContent: {
    flex: 1,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text, // Cream/Off-white
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
    backgroundColor: Colors.background, // Deep burgundy
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border, // Muted burgundy border
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(212, 165, 116, 0.15)', // Champagne gold with opacity
    borderColor: Colors.gold, // Champagne gold
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text, // Cream/Off-white
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.gold, // Champagne gold
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border, // Muted burgundy border
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
    color: Colors.text, // Cream/Off-white
  },
  navButtonTextDisabled: {
    color: Colors.textLight, // Light cream
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold, // Champagne gold
    borderRadius: 12,
    paddingVertical: 14,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.border, // Muted burgundy
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background, // Deep burgundy text on gold
  },
  journalContainer: {
    gap: 20,
  },
  postsContainer: {
    gap: 20,
  },
  postCard: {
    backgroundColor: Colors.card, // Slightly lighter burgundy
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.gold, // Champagne gold glow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.border, // Muted burgundy
  },
  postUserName: {
    fontSize: Typography.heading.fontSize.xs,
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
    backgroundColor: Colors.card, // Slightly lighter burgundy
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.gold, // Champagne gold border
    shadowColor: Colors.gold, // Champagne gold glow
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
    color: Colors.gold, // Champagne gold
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
    backgroundColor: '#FFFFFF', // Solid white at 100% opacity
    borderRadius: 24, // Deeply rounded corners
    padding: 28,
    shadowColor: 'rgba(0, 0, 0, 0.08)', // Light grey, low opacity
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12, // Soft, diffused shadow
    elevation: 3,
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
    fontSize: Typography.serif.fontSize.md,
    fontWeight: Typography.serif.fontWeight,
    fontFamily: Typography.serif.fontFamily,
    color: '#2C2C2C', // Dark charcoal for maximum readability
    letterSpacing: Typography.serif.letterSpacing,
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20, // Pill shape
    overflow: 'hidden',
  },
  approvedText: {
    fontSize: Typography.body.fontSize.xs,
    fontFamily: Typography.body.fontFamily,
    color: '#FFFFFF',
  },
  vouchContent: {
    gap: 16,
  },
  vouchSection: {
    gap: 8,
  },
  vouchLabel: {
    fontSize: Typography.body.fontSize.xs,
    fontFamily: Typography.body.fontFamily,
    color: '#CD7F32', // Muted bronze - colorful badge
    textTransform: 'uppercase',
    letterSpacing: 2, // Wide letter spacing
    marginBottom: 8,
  },
  vouchAnswer: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: '#2C2C2C', // Dark charcoal for maximum readability
    lineHeight: Typography.body.lineHeight.md,
    fontWeight: '500',
  },
});

