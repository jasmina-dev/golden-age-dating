import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { useEffect, useState, useMemo } from 'react';
import { getCurrentUser } from '@/lib/storage';
import { sampleUserData, KindredUser } from '@/constants/UserData';
import Layout from '@/components/Layout';
import TeaserProfileCard from '@/components/TeaserProfileCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Calculate compatibility percentage
const calculateKindredMatch = (
  currentUserInterests: string[],
  targetProfileInterests: string[]
): number => {
  if (currentUserInterests.length === 0 || targetProfileInterests.length === 0) return 0;
  const currentInterestsLower = currentUserInterests.map((i) => i.toLowerCase());
  const targetInterestsLower = targetProfileInterests.map((i) => i.toLowerCase());
  const sharedInterests = currentInterestsLower.filter((interest) =>
    targetInterestsLower.includes(interest)
  );
  const union = new Set([...currentInterestsLower, ...targetInterestsLower]);
  return Math.round((sharedInterests.length / union.size) * 100);
};

export default function Discovery() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<KindredUser | null>(null);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Filter and sort profiles with 70%+ compatibility
  const compatibleProfiles = useMemo(() => {
    if (!currentUser) return [];
    
    return sampleUserData
      .filter((profile) => {
        // Exclude current user
        if (profile.id === currentUser.id) return false;
        
        // Calculate compatibility
        const match = calculateKindredMatch(currentUser.interests, profile.interests);
        
        // Only include profiles with 70%+ compatibility
        return match >= 70;
      })
      .map((profile) => {
        const match = calculateKindredMatch(currentUser.interests, profile.interests);
        return { profile, match };
      })
      .sort((a, b) => b.match - a.match); // Sort by highest compatibility first
  }, [currentUser]);

  const handleReveal = () => {
    // Navigate to profile view
    if (compatibleProfiles[currentProfileIndex]) {
      router.push(`/profile/${compatibleProfiles[currentProfileIndex].profile.id}`);
    }
  };

  const handleNext = () => {
    if (currentProfileIndex < compatibleProfiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      // Loop back to start or show message
      setCurrentProfileIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentProfileIndex > 0) {
      setCurrentProfileIndex(currentProfileIndex - 1);
    } else {
      // Loop to end
      setCurrentProfileIndex(compatibleProfiles.length - 1);
    }
  };

  // Show welcome screen if no user
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.logoSection}>
            <Text style={styles.logo}>kindred</Text>
            <Text style={styles.tagline}>DATING BEFORE THE SWIPE</Text>
          </View>
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.heartButton}
              onPress={() => router.push('/explore')}
              activeOpacity={0.8}
            >
              <FontAwesome name="heart" size={80} color="#FFFFFF" />
              <Text style={styles.signUpText}>SIGN UP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no compatible profiles
  if (compatibleProfiles.length === 0) {
    return (
      <Layout>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.emptyContainer}>
            <FontAwesome name="heart" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptyText}>
              Complete your profile and add more interests to find kindred spirits!
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/explore')}
            >
              <Text style={styles.exploreButtonText}>Explore All Profiles</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Layout>
    );
  }

  const currentProfile = compatibleProfiles[currentProfileIndex];

  return (
    <Layout>
      <View style={styles.discoveryContainer}>
        {currentProfile && (
          <TeaserProfileCard
            user={currentProfile.profile}
            onReveal={handleReveal}
          />
        )}
        
        {/* Navigation dots */}
        <View style={styles.navDots}>
          {compatibleProfiles.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentProfileIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Navigation buttons */}
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handlePrevious}
            disabled={compatibleProfiles.length <= 1}
          >
            <FontAwesome
              name="chevron-left"
              size={24}
              color={compatibleProfiles.length > 1 ? Colors.text : Colors.textLight}
            />
          </TouchableOpacity>
          
          <View style={styles.profileCounter}>
            <Text style={styles.counterText}>
              {currentProfileIndex + 1} / {compatibleProfiles.length}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNext}
            disabled={compatibleProfiles.length <= 1}
          >
            <FontAwesome
              name="chevron-right"
              size={24}
              color={compatibleProfiles.length > 1 ? Colors.text : Colors.textLight}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 64,
    fontFamily: Typography.heading.fontFamily,
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0,
  },
  tagline: {
    fontSize: 16,
    fontFamily: Typography.body.fontFamily,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  buttonSection: {
    width: '100%',
    alignItems: 'center',
    gap: 32,
  },
  heartButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.darkPink,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  signUpText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  discoveryContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: Typography.heading.fontFamily,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: Colors.darkPink,
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  exploreButtonText: {
    fontSize: 16,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textLight,
    opacity: 0.4,
  },
  dotActive: {
    backgroundColor: Colors.darkPink,
    opacity: 1,
    width: 24,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileCounter: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterText: {
    fontSize: 14,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '600',
    color: Colors.text,
  },
});

