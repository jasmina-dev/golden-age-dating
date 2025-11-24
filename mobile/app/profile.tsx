import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Layout from '@/components/Layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

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

const TOTAL_STEPS = 3;

export default function Profile() {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    age: '',
    location: '',
    interests: [],
  });

  const updateProfileData = (field: keyof ProfileData, value: string | string[]) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
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

  const handleSave = () => {
    // Validate interests
    if (profileData.interests.length === 0) {
      return; // Don't save if no interests selected
    }
    
    // Save profile data (in a real app, this would call an API)
    console.log('Saving profile:', profileData);
    
    // Navigate to explore or show success message
    // For now, just log it
    alert('Profile saved successfully!');
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;
  const canProceed = 
    (currentStep === 1 && profileData.name.trim() && profileData.age.trim()) ||
    (currentStep === 2 && profileData.location.trim()) ||
    (currentStep === 3 && profileData.interests.length > 0);

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
                  <TextInput
                    style={styles.input}
                    placeholder="City, State (e.g., Austin, TX)"
                    placeholderTextColor={Colors.textLight}
                    value={profileData.location}
                    onChangeText={(text) => updateProfileData('location', text)}
                    autoCapitalize="words"
                  />
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
                onPress={handleSave}
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
});
