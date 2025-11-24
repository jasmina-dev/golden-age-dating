import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Layout from '@/components/Layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { KindredUser } from '@/constants/UserData';
import { saveUser, setCurrentUserId, getCurrentUser } from '@/lib/storage';

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
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    age: '',
    location: '',
    interests: [],
  });
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef<TextInput>(null);

  // Check if user has a saved profile on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsEditing(false); // Start in view mode
    } else {
      setIsEditing(true); // No profile, start in edit mode
    }
  }, []);

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
              <Text style={styles.title}>MY PROFILE</Text>
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
                <FontAwesome name="edit" size={18} color={Colors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
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
          </SafeAreaView>
        </ScrollView>
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
            <Text style={styles.title}>MY PROFILE</Text>
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
                <FontAwesome name="arrow-left" size={18} color={Colors.primary} />
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
    backgroundColor: Colors.primary,
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
    color: Colors.primary,
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
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
    color: Colors.primary,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
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
    backgroundColor: Colors.primary,
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
    borderColor: Colors.primary,
  },
  editButtonText: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: Colors.primary,
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
    backgroundColor: Colors.primary,
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
});
