import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Share } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { getUserById, getUsers } from '@/lib/storage';
import { KindredUser, sampleUserData } from '@/constants/UserData';
import { saveVouch } from '@/constants/Vouches';

// Use Colors.primary instead (Deep Burgundy)

export default function VouchPage() {
  const { userId } = useLocalSearchParams();
  const [user, setUser] = useState<KindredUser | null>(null);
  const [hiddenTalent, setHiddenTalent] = useState('');
  const [greenFlag, setGreenFlag] = useState('');
  const [worstHabit, setWorstHabit] = useState('');
  const [friendName, setFriendName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user data
  useEffect(() => {
    if (userId) {
      // First check in saved users
      let profile: KindredUser | null = getUserById(userId as string) || null;
      
      // If not found, check sample data
      if (!profile) {
        profile = sampleUserData.find((u) => u.id === userId) || null;
      }
      
      setUser(profile);
    }
  }, [userId]);

  const handleSubmit = async () => {
    // Validation
    if (!hiddenTalent.trim() || !greenFlag.trim() || !worstHabit.trim() || !friendName.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields before submitting.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create vouch object
      const vouch = {
        id: `vouch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        friendName: friendName.trim(),
        greenFlag: greenFlag.trim(),
        hiddenTalent: hiddenTalent.trim(),
        worstHabit: worstHabit.trim(), // Store worst habit even though we don't display it in the profile
        status: 'pending' as const,
        createdAt: Date.now(),
      };

      // Save vouch
      saveVouch(vouch);

      // Show success state
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting vouch:', error);
      Alert.alert('Error', 'Failed to submit vouch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareAppLink = async () => {
    const appLink = 'https://kindred.app'; // Replace with actual app link
    const shareMessage = `Know two people who should meet? Check out Kindred: ${appLink}`;
    
    try {
      const result = await Share.share({
        message: shareMessage,
        title: 'Share Kindred',
      });

      if (result.action === Share.sharedAction) {
        console.log('App link shared successfully');
      }
    } catch (error) {
      console.error('Error sharing link:', error);
      Alert.alert('Error', 'Failed to share link. Please try again.');
    }
  };

  const userFirstName = user?.name.split(' ')[0] || 'them';

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <FontAwesome name="check-circle" size={64} color={Colors.primary} />
            </View>
            <Text style={styles.successHeadline}>Thanks for being a good wingman.</Text>
            <Text style={styles.successSubtext}>
              Your vouch has been submitted and will be reviewed by {userFirstName}.
            </Text>
            
            <View style={styles.viralSection}>
              <Text style={styles.viralTitle}>Know two other people who should meet?</Text>
              <Text style={styles.viralSubtext}>Send them a match link.</Text>
              <TouchableOpacity
                style={styles.copyLinkButton}
                onPress={handleShareAppLink}
                activeOpacity={0.8}
              >
                <FontAwesome name="share" size={18} color="#fff" />
                <Text style={styles.copyLinkButtonText}>Share App Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Tell us the truth about {userFirstName}.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Hidden Talent */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                What is {userFirstName}'s hidden talent?
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Can bake a soufflé in 20 mins..."
                placeholderTextColor={Colors.textLight}
                value={hiddenTalent}
                onChangeText={setHiddenTalent}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Green Flag */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Green Flag: Why date them?
              </Text>
              <TextInput
                style={styles.input}
                placeholder="They actually go to therapy..."
                placeholderTextColor={Colors.textLight}
                value={greenFlag}
                onChangeText={setGreenFlag}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Worst Habit */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Roast them gently: What's their worst habit?
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Steals the blankets..."
                placeholderTextColor={Colors.textLight}
                value={worstHabit}
                onChangeText={setWorstHabit}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Friend Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={Colors.textLight}
                value={friendName}
                onChangeText={setFriendName}
                autoCapitalize="words"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : `Vouch for ${userFirstName}`}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    fontFamily: Typography.heading.fontFamily,
    color: Colors.primary,
    letterSpacing: Typography.heading.letterSpacing,
    lineHeight: 40,
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 12,
  },
  label: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
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
    minHeight: 56,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.background,
  },
  successCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  successIcon: {
    marginBottom: 24,
  },
  successHeadline: {
    fontSize: Typography.heading.fontSize.lg,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: Typography.heading.letterSpacing,
  },
  successSubtext: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: Typography.body.lineHeight.md,
    marginBottom: 32,
  },
  viralSection: {
    width: '100%',
    backgroundColor: 'rgba(139, 74, 107, 0.08)', // Deep burgundy with 8% opacity
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 74, 107, 0.2)', // Deep burgundy with 20% opacity
  },
  viralTitle: {
    fontSize: Typography.heading.fontSize.sm,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: Typography.heading.letterSpacing,
  },
  viralSubtext: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  copyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  copyLinkButtonText: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: Colors.background,
  },
});

