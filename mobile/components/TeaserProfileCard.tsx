import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { KindredUser } from '@/constants/UserData';
import { getApprovedVouchesByUserId, Vouch } from '@/constants/Vouches';
import { isProfileRevealed, markProfileRevealed, getCurrentUser } from '@/lib/storage';
import { trackProfileReveal } from '@/lib/tracking';
import { useState, useEffect, useRef } from 'react';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TeaserProfileCardProps {
  user: KindredUser;
  onReveal: () => void;
}

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

// Use Colors constants for consistency
const BRAND_COLOR = Colors.darkPink; // Dark pink
const VOUCH_COLOR = Colors.darkPink; // Dark pink for vouched badges

export default function TeaserProfileCard({ user, onReveal }: TeaserProfileCardProps) {
  const [vouches, setVouches] = useState<Vouch[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [compatibility, setCompatibility] = useState(0);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Get all approved vouches for this user
    const allVouches = getApprovedVouchesByUserId(user.id);
    setVouches(allVouches);
    
    // Calculate compatibility with current user
    const currentUser = getCurrentUser();
    if (currentUser) {
      const match = calculateKindredMatch(currentUser.interests, user.interests);
      setCompatibility(match);
    }
    
    // Check if this profile has already been revealed (one-way reveal)
    // This reads from storage to ensure state is correct
    const revealed = isProfileRevealed(user.id);
    console.log(`[TeaserProfileCard] Profile ${user.id} revealed status:`, revealed);
    setIsRevealed(revealed);
  }, [user.id]); // Only re-check when user.id changes

  const triggerShake = () => {
    // Reset animation value
    shakeAnimation.setValue(0);
    
    // Create shake animation sequence
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleReveal = () => {
    console.log(`[TeaserProfileCard] handleReveal called for user ${user.id}`);
    // Trigger shake animation
    triggerShake();
    
    // Small delay to let shake animation start before revealing
    setTimeout(() => {
      console.log(`[TeaserProfileCard] Revealing profile ${user.id}`);
      // Track the high-intent Profile Reveal event
      trackProfileReveal(user.id);
      
      // Mark profile as revealed (one-way action) - update storage first
      markProfileRevealed(user.id);
      
      // Verify storage was updated
      const isNowRevealed = isProfileRevealed(user.id);
      console.log(`[TeaserProfileCard] Profile ${user.id} is now revealed in storage:`, isNowRevealed);
      
      // Update local state to show revealed image
      setIsRevealed(true);
      
      // Don't navigate immediately - let user see the revealed image
      // The onReveal will be called when they click "View Full Profile" button
    }, 400); // Wait for shake animation to complete
  };

  const translateX = shakeAnimation.interpolate({
    inputRange: [-10, 10],
    outputRange: [-10, 10],
  });

  return (
    <View style={styles.container}>
      {/* Full Screen Polaroid Frame */}
      <Animated.View 
        style={[
          styles.polaroidFrame,
          { transform: [{ translateX }] }
        ]}
      >
        {/* White border padding around image (top, left, right) */}
        <View style={styles.polaroidBorder}>
          {/* Polaroid Image Area - Takes up most of the screen */}
          <View style={styles.polaroidImageArea}>
            {user.imageUrl ? (
              <>
                <Image
                  source={{ uri: user.imageUrl }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
                {/* Blur Overlay - Only show if profile hasn't been revealed */}
                {!isRevealed && (
                  <BlurView intensity={80} style={styles.blurOverlay}>
                    <View style={styles.blurContent} />
                  </BlurView>
                )}
                {/* Texture overlay for polaroid effect */}
                <View style={styles.textureOverlay} />
                {/* Verification Badge */}
                <View style={styles.verifiedBadge}>
                  <FontAwesome name="check-circle" size={20} color={Colors.gold} />
                </View>
                {/* Unlock/View Profile Button Overlay - on top of image */}
                <View style={styles.unlockButtonOverlay}>
                  {!isRevealed ? (
                    <TouchableOpacity
                      onPress={handleReveal}
                      activeOpacity={0.8}
                    >
                      <View style={styles.unlockButtonContent}>
                        <FontAwesome name="unlock" size={24} color="#fff" />
                        <Text style={styles.unlockButtonText}>Unlock</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={onReveal}
                      activeOpacity={0.8}
                    >
                      <View style={styles.viewProfileButtonContent}>
                        <Text style={styles.viewProfileButtonText}>View Profile</Text>
                        <FontAwesome name="arrow-right" size={20} color={BRAND_COLOR} />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.profileImagePlaceholder} />
            )}
          </View>
        </View>
        
        {/* Polaroid Bottom Section (white space at bottom with info) */}
        <View style={styles.polaroidBottom}>
          <Text style={styles.polaroidName}>{user.name}</Text>
          
          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <View style={styles.polaroidInterests}>
              {user.interests.slice(0, 3).map((interest, index) => (
                <View key={index} style={styles.polaroidInterestBadge}>
                  <Text style={styles.polaroidInterestText}>{interest}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Vouches count and Compatibility */}
          <View style={styles.polaroidStats}>
            {vouches.length > 0 && (
              <View style={styles.statItem}>
                <FontAwesome name="check-circle" size={16} color={VOUCH_COLOR} />
                <Text style={styles.statText}>{vouches.length} {vouches.length === 1 ? 'Vouch' : 'Vouches'}</Text>
              </View>
            )}
            {compatibility > 0 && (
              <View style={styles.statItem}>
                <FontAwesome name="heart" size={16} color={Colors.coral} />
                <Text style={styles.statText}>{compatibility}% Match</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: Colors.background,
  },
  polaroidFrame: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    // Texture effect - subtle paper-like appearance
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    // Add subtle texture using opacity and multiple layers
    opacity: 0.98,
  },
  polaroidBorder: {
    paddingTop: 40,
    paddingHorizontal: 40,
    flex: 1,
  },
  polaroidImageArea: {
    width: '100%',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    // Floating shadow effect - multiple layers for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  textureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Create paper-like texture using subtle noise pattern
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    // Multiple layered overlays for texture depth
    opacity: 0.6,
    zIndex: 1,
    // Add subtle border to enhance texture perception
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  polaroidBottom: {
    paddingHorizontal: 40,
    paddingTop: 32,
    paddingBottom: 120, // Extra padding to account for nav bar
    minHeight: 200,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderTopColor: '#E5E5E5',
    justifyContent: 'center',
  },
  polaroidName: {
    fontSize: 24,
    fontFamily: Typography.heading.fontFamily,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  polaroidInterests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
  },
  polaroidInterestBadge: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  polaroidInterestText: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: '#333',
  },
  polaroidStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: '#333',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  blurContent: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  unlockButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  unlockButtonContent: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 30,
    paddingHorizontal: 28,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: BRAND_COLOR,
    // Glowing outline effect
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  unlockButtonText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: '#fff',
    letterSpacing: 0.5,
  },
  viewProfileButtonContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 28,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: BRAND_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  viewProfileButtonText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: BRAND_COLOR,
    letterSpacing: 0.5,
  },
});

