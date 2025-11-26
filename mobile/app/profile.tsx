import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, FlatList, Modal, Pressable, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Layout from '@/components/Layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { KindredUser } from '@/constants/UserData';
import { saveUser, setCurrentUserId, getCurrentUser } from '@/lib/storage';
import { availableQuizzes, Quiz } from '@/constants/Quizzes';
import { getApprovedVouchesByUserId } from '@/constants/Vouches';

interface ProfileData {
  name: string;
  age: string;
  location: string;
  interests: string[];
}

const PREDEFINED_INTERESTS = [
  'Hiking',
  'Photography',
  'Cooking',
  'Live Music',
  'Philosophy',
  'Reading',
  'Travel',
  'Yoga',
  'Art',
  'Dancing',
  'Gaming',
  'Fitness',
  'Movies',
  'Writing',
  'Volunteering',
  'Wine Tasting',
  'Cycling',
  'Meditation',
  'Theater',
  'Surfing',
];

// Mock list of US cities and states for location autocomplete
const US_LOCATIONS = [
  'Austin, TX',
  'Portland, OR',
  'Brooklyn, NY',
  'Seattle, WA',
  'San Francisco, CA',
  'Denver, CO',
  'Nashville, TN',
  'Chicago, IL',
  'Boston, MA',
  'Los Angeles, CA',
  'Miami, FL',
  'Atlanta, GA',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'Dallas, TX',
  'Houston, TX',
  'San Diego, CA',
  'Portland, ME',
  'Minneapolis, MN',
  'Detroit, MI',
  'New Orleans, LA',
  'Charleston, SC',
  'Savannah, GA',
  'Asheville, NC',
  'Boulder, CO',
  'Santa Fe, NM',
  'Madison, WI',
  'Burlington, VT',
  'Ann Arbor, MI',
];

const TOTAL_STEPS = 3;

export default function Profile() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentUser, setCurrentUser] = useState<KindredUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [questionId: string]: string }>({});
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    age: '',
    location: '',
    interests: [],
  });
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef<TextInput>(null);
  const [approvedVouches, setApprovedVouches] = useState<any[]>([]);

  const tabs = ['about', 'quizzes', 'journal'];

  // Check if user has a saved profile on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsEditing(false); // Start in view mode
      // Load approved vouches for the user
      const userVouches = getApprovedVouchesByUserId(user.id);
      setApprovedVouches(userVouches);
    } else {
      setIsEditing(true); // No profile, start in edit mode
    }
  }, []);

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

  const handleGetVouched = async () => {
    if (!currentUser) return;

    const vouchLink = `/vouch/${currentUser.id}`;
    const shareMessage = `Hey, I need a wingman. Write a vouch for my dating profile? ${vouchLink}`;

    try {
      const result = await Share.share({
        message: shareMessage,
        title: 'Get Vouched',
      });

      if (result.action === Share.sharedAction) {
        console.log('Vouch link shared successfully');
      }
    } catch (error) {
      console.error('Error sharing vouch link:', error);
      Alert.alert('Error', 'Failed to share link. Please try again.');
    }
  };

  const updateProfileData = (field: keyof ProfileData, value: string | string[]) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    
    // Filter location suggestions when location field is updated
    if (field === 'location' && typeof value === 'string') {
      filterLocationSuggestions(value);
    }
  };

  const filterLocationSuggestions = (query: string) => {
    if (!query.trim()) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = US_LOCATIONS.filter((location) =>
      location.toLowerCase().includes(query.toLowerCase())
    );
    
    setLocationSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleLocationSelect = (location: string) => {
    updateProfileData('location', location);
    setShowSuggestions(false);
    // Dismiss keyboard
    locationInputRef.current?.blur();
  };

  const toggleInterest = (interest: string) => {
    setProfileData((prev) => {
      const currentInterests = prev.interests;
      if (currentInterests.includes(interest)) {
        // Remove interest
        return { ...prev, interests: currentInterests.filter((i) => i !== interest) };
      } else {
        // Add interest (max 5)
        if (currentInterests.length < 5) {
          return { ...prev, interests: [...currentInterests, interest] };
        }
        return prev;
      }
    });
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      // Validate current step before proceeding
      if (currentStep === 1 && (!profileData.name.trim() || !profileData.age.trim())) {
        return; // Don't proceed if validation fails
      }
      if (currentStep === 2 && !profileData.location.trim()) {
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveProfile = () => {
    // Validate interests
    if (profileData.interests.length === 0) {
      return; // Don't save if no interests selected
    }

    // Validate all required fields
    if (!profileData.name.trim() || !profileData.age.trim() || !profileData.location.trim()) {
      return; // Don't save if required fields are missing
    }

    // Use existing user ID if editing, otherwise generate new one
    const userId = currentUser?.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create or update KindredUser object from the form data
    const updatedUser: KindredUser = {
      id: userId,
      name: profileData.name.trim(),
      age: parseInt(profileData.age, 10),
      location: profileData.location.trim(),
      gender: currentUser?.gender || 'Not specified', // Keep existing gender or use default
      bio: currentUser?.bio || `Hi, I'm ${profileData.name.trim()}. I love ${profileData.interests.slice(0, 2).join(' and ')}.`, // Keep existing bio or generate new one
      profileText: currentUser?.profileText || `I'm ${profileData.name.trim()}, ${profileData.age} years old, based in ${profileData.location.trim()}. I'm passionate about ${profileData.interests.join(', ')}. Looking forward to connecting with like-minded people!`, // Keep existing profileText or generate new one
      interests: profileData.interests,
      quizAnswers: currentUser?.quizAnswers || {}, // Keep existing quiz answers or use empty object
    };

    try {
      // Save or update the user in storage
      saveUser(updatedUser);

      // Set as current user
      setCurrentUserId(userId);
      
      // Update current user state
      setCurrentUser(updatedUser);
      
      // Switch to view mode
      setIsEditing(false);

      // Log the user object to console
      console.log('User profile saved:', updatedUser);

      // Clear the form (but keep data for view)
      setCurrentStep(1);

      // Navigate to Explore screen
      router.push('/explore');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;
  const canProceed = 
    (currentStep === 1 && profileData.name.trim() && profileData.age.trim()) ||
    (currentStep === 2 && profileData.location.trim()) ||
    (currentStep === 3 && profileData.interests.length > 0);

  // If user has a saved profile and not editing, show profile view
  if (currentUser && !isEditing) {
    return (
      <Layout>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <SafeAreaView edges={['top']} style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>My Profile</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  // Load existing data into form for editing
                  setProfileData({
                    name: currentUser.name,
                    age: currentUser.age.toString(),
                    location: currentUser.location,
                    interests: currentUser.interests,
                  });
                  setCurrentStep(1);
                  setIsEditing(true);
                }}
                activeOpacity={0.7}
              >
                <FontAwesome name="edit" size={18} color={Colors.gold} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Test Friend View Voucher Button */}
            <View style={styles.testButtonContainer}>
              <TouchableOpacity
                style={styles.testButton}
                onPress={() => router.push(`/vouch/${currentUser.id}`)}
                activeOpacity={0.7}
              >
                <FontAwesome name="users" size={16} color={Colors.gold} />
                <Text style={styles.testButtonText}>Test Friend View Voucher</Text>
              </TouchableOpacity>
            </View>

            {/* Vouches Section - Pinned to Top */}
            <View style={styles.pinnedVouchesSection}>
              {/* Get Vouched Button - Always visible */}
              <TouchableOpacity
                style={styles.getVouchedButtonTop}
                onPress={handleGetVouched}
                activeOpacity={0.8}
              >
                <FontAwesome name="share" size={18} color={Colors.background} />
                <Text style={styles.getVouchedButtonText}>Get Vouched</Text>
              </TouchableOpacity>

              {approvedVouches.length > 0 ? (
                approvedVouches.map((vouch) => (
                  <View key={vouch.id} style={styles.vouchCard}>
                    <View style={styles.vouchHeader}>
                      <View style={styles.vouchHeaderLeft}>
                        <FontAwesome name="check-circle" size={18} color={Colors.gold} />
                        <Text style={styles.vouchFriendName}>Vouched by {vouch.friendName}</Text>
                      </View>
                      <View style={styles.approvedBadge}>
                        <FontAwesome name="check-circle" size={14} color={Colors.gold} />
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
                ))
              ) : (
                <View style={styles.emptyStateCard}>
                  <View style={styles.emptyStateIcon}>
                    <FontAwesome name="heart" size={48} color={Colors.gold} />
                  </View>
                  <Text style={styles.emptyStateTitle}>No vouches yet</Text>
                  <Text style={styles.emptyStateText}>
                    Your friends know you best. Get them to hype you up.
                  </Text>
                  <TouchableOpacity
                    style={styles.getVouchedButton}
                    onPress={handleGetVouched}
                    activeOpacity={0.8}
                  >
                    <FontAwesome name="share" size={18} color={Colors.background} />
                    <Text style={styles.getVouchedButtonText}>Get Vouched</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

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
                {activeTab === 'about' && (
                  <View style={styles.contentSection}>
                    <View style={styles.profileCard}>
                      <Text style={styles.profileName}>{currentUser.name}, {currentUser.age}</Text>
                      <Text style={styles.profileLocation}>{currentUser.location}</Text>
                      <Text style={styles.profileBio}>{currentUser.bio}</Text>
                    </View>

                    {/* Interests */}
                    <View style={styles.profileCard}>
                      <Text style={styles.sectionTitle}>Interests</Text>
                      <View style={styles.interestsContainer}>
                        {currentUser.interests.map((interest) => (
                          <View key={interest} style={styles.interestBadge}>
                            <Text style={styles.interestText}>{interest}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* About */}
                    <View style={styles.profileCard}>
                      <Text style={styles.sectionTitle}>About</Text>
                      <Text style={styles.profileText}>{currentUser.profileText}</Text>
                    </View>
                  </View>
                )}

                {activeTab === 'quizzes' && (
                  <View style={styles.contentSection}>
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
                  </View>
                )}

                {activeTab === 'journal' && (
                  <View style={styles.profileCard}>
                    <Text style={styles.emptyContentText}>Journal entries coming soon...</Text>
                  </View>
                )}
              </View>
            </View>
          </SafeAreaView>
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
                      <FontAwesome name="times" size={24} color={Colors.text} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.quizProgressContainer}>
                    <View style={styles.quizProgressBar}>
                      <View
                        style={[
                          styles.quizProgressFill,
                          {
                            width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.quizProgressText}>
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
                        styles.quizNextButton,
                        !getCurrentAnswer() && styles.quizNextButtonDisabled,
                      ]}
                      onPress={handleNextQuestion}
                      disabled={!getCurrentAnswer()}
                    >
                      <Text style={styles.quizNextButtonText}>
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

  // Show form for creating/editing profile
  return (
    <Layout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Profile</Text>
            <Text style={styles.stepIndicator}>Step {currentStep} of {TOTAL_STEPS}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Step 1: Name and Age */}
            {currentStep === 1 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Tell us about yourself</Text>
                <Text style={styles.stepDescription}>
                  Let's start with the basics
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor={Colors.textLight}
                    value={profileData.name}
                    onChangeText={(text) => updateProfileData('name', text)}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your age"
                    placeholderTextColor={Colors.textLight}
                    value={profileData.age}
                    onChangeText={(text) => updateProfileData('age', text.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
              </View>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Where are you located?</Text>
                <Text style={styles.stepDescription}>
                  Help others find you nearby
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Location</Text>
                  <View style={styles.locationInputContainer}>
                    <TextInput
                      ref={locationInputRef}
                      style={styles.input}
                      placeholder="City, State (e.g., Austin, TX)"
                      placeholderTextColor={Colors.textLight}
                      value={profileData.location}
                      onChangeText={(text) => updateProfileData('location', text)}
                      onFocus={() => {
                        if (profileData.location) {
                          filterLocationSuggestions(profileData.location);
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow click events
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      autoCapitalize="words"
                    />
                    {showSuggestions && locationSuggestions.length > 0 && (
                      <View style={styles.suggestionsContainer}>
                        <FlatList
                          data={locationSuggestions}
                          keyExtractor={(item, index) => `${item}-${index}`}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={styles.suggestionItem}
                              onPress={() => handleLocationSelect(item)}
                              activeOpacity={0.7}
                            >
                              <FontAwesome name="map-marker" size={16} color={Colors.textLight} style={styles.suggestionIcon} />
                              <Text style={styles.suggestionText}>{item}</Text>
                            </TouchableOpacity>
                          )}
                          style={styles.suggestionsList}
                          nestedScrollEnabled={true}
                          keyboardShouldPersistTaps="handled"
                        />
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Step 3: Interests */}
            {currentStep === 3 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>What are you into?</Text>
                <Text style={styles.stepDescription}>
                  Select up to 5 interests that describe you
                </Text>

                <View style={styles.selectedCount}>
                  <Text style={styles.selectedCountText}>
                    {profileData.interests.length} of 5 selected
                  </Text>
                </View>

                <View style={styles.interestsGrid}>
                  {PREDEFINED_INTERESTS.map((interest) => {
                    const isSelected = profileData.interests.includes(interest);
                    const isDisabled = !isSelected && profileData.interests.length >= 5;
                    
                    return (
                      <TouchableOpacity
                        key={interest}
                        style={[
                          styles.interestChip,
                          isSelected && styles.interestChipSelected,
                          isDisabled && styles.interestChipDisabled,
                        ]}
                        onPress={() => toggleInterest(interest)}
                        disabled={isDisabled}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.interestChipText,
                            isSelected && styles.interestChipTextSelected,
                            isDisabled && styles.interestChipTextDisabled,
                          ]}
                        >
                          {interest}
                        </Text>
                        {isSelected && (
                          <FontAwesome name="check" size={14} color={Colors.background} style={styles.checkIcon} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <FontAwesome name="arrow-left" size={18} color={Colors.gold} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            <View style={styles.spacer} />

            {currentStep < TOTAL_STEPS ? (
              <TouchableOpacity
                style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={!canProceed}
                activeOpacity={0.8}
              >
                <Text style={[styles.nextButtonText, !canProceed && styles.nextButtonTextDisabled]}>
                  Next
                </Text>
                <FontAwesome name="arrow-right" size={18} color={canProceed ? Colors.background : Colors.textLight} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.saveButton, !canProceed && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={!canProceed}
                activeOpacity={0.8}
              >
                <FontAwesome name="check" size={18} color={canProceed ? Colors.background : Colors.textLight} />
                <Text style={[styles.saveButtonText, !canProceed && styles.saveButtonTextDisabled]}>
                  Save Profile
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: Typography.heading.fontSize.lg,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: Typography.heading.letterSpacing,
  },
  stepIndicator: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  stepContainer: {
    gap: 24,
  },
  stepTitle: {
    fontSize: Typography.heading.fontSize.md,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    letterSpacing: Typography.heading.letterSpacing,
  },
  stepDescription: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
    lineHeight: Typography.body.lineHeight.md,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedCount: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  selectedCountText: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: Colors.gold,
    fontWeight: '600',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    gap: 8,
  },
  interestChipSelected: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  interestChipDisabled: {
    opacity: 0.4,
  },
  interestChipText: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
    fontWeight: '500',
  },
  interestChipTextSelected: {
    color: Colors.background,
  },
  interestChipTextDisabled: {
    color: Colors.textLight,
  },
  checkIcon: {
    marginLeft: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.gold,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.border,
  },
  nextButtonText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.background,
    fontWeight: '700',
  },
  nextButtonTextDisabled: {
    color: Colors.textLight,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.border,
  },
  saveButtonText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.background,
    fontWeight: '700',
  },
  saveButtonTextDisabled: {
    color: Colors.textLight,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  editButtonText: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: Colors.gold,
    fontWeight: '600',
  },
  profileInfo: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  profileName: {
    fontSize: Typography.heading.fontSize.lg,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: Typography.heading.letterSpacing,
  },
  profileLocation: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
    marginBottom: 12,
  },
  profileBio: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
    lineHeight: Typography.body.lineHeight.md,
  },
  sectionTitle: {
    fontSize: Typography.heading.fontSize.sm,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: Typography.heading.letterSpacing,
  },
  profileText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
    lineHeight: Typography.body.lineHeight.md,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestBadge: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  interestText: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: Colors.background,
    fontWeight: '500',
  },
  locationInputContainer: {
    position: 'relative',
    zIndex: 1,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
    flex: 1,
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
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: Colors.gold,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.background,
  },
  tabContent: {
    marginBottom: 100,
  },
  contentSection: {
    gap: 16,
  },
  emptyContentText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    padding: 24,
  },
  quizCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
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
    color: Colors.gold,
  },
  quizDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
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
    color: Colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  quizProgressContainer: {
    marginBottom: 24,
  },
  quizProgressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  quizProgressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  quizProgressText: {
    fontSize: 12,
    color: Colors.textLight,
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
    borderColor: Colors.gold,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.gold,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
    color: Colors.text,
  },
  navButtonTextDisabled: {
    color: Colors.textLight,
  },
  quizNextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
  },
  quizNextButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  quizNextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background,
  },
  vouchesContainer: {
    gap: 16,
  },
  emptyStateCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: Typography.heading.fontSize.md,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: Typography.heading.letterSpacing,
  },
  emptyStateText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: Typography.body.lineHeight.md,
  },
  getVouchedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  getVouchedButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  getVouchedButtonText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.background,
    fontWeight: '700',
  },
  vouchesList: {
    gap: 16,
  },
  vouchCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
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
    color: Colors.gold,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: Typography.body.fontSize.xs,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
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
  testButtonContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 165, 97, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.gold,
    borderStyle: 'dashed',
  },
  testButtonText: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: Colors.gold,
    fontWeight: '600',
  },
});
