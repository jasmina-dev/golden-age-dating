import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { KindredUser } from '@/constants/UserData';
import { getApprovedVouchesByUserId, Vouch } from '@/constants/Vouches';
import { isProfileRevealed, markProfileRevealed } from '@/lib/storage';
import { trackProfileReveal } from '@/lib/tracking';
import { useState, useEffect } from 'react';

interface TeaserProfileCardProps {
  user: KindredUser;
  onReveal: () => void;
}

// Use Colors constants for consistency
const BRAND_COLOR = Colors.gold; // Metallic muted gold
const VOUCH_COLOR = Colors.gold; // Gold for vouched badges

export default function TeaserProfileCard({ user, onReveal }: TeaserProfileCardProps) {
  const [vouch, setVouch] = useState<Vouch | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Get the first approved vouch for this user
    const vouches = getApprovedVouchesByUserId(user.id, 1);
    if (vouches.length > 0) {
      setVouch(vouches[0]);
    }
    
    // Check if this profile has already been revealed (one-way reveal)
    const revealed = isProfileRevealed(user.id);
    setIsRevealed(revealed);
  }, [user.id]);

  const handleReveal = () => {
    // Track the high-intent Profile Reveal event
    trackProfileReveal(user.id);
    
    // Mark profile as revealed (one-way action)
    markProfileRevealed(user.id);
    setIsRevealed(true);
    
    // Call the original onReveal handler (e.g., navigate to profile)
    onReveal();
  };

  return (
    <View style={styles.container}>
      {/* Profile Image - Blurred with vignette if not revealed, clear if revealed */}
      <View style={styles.imageSection}>
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
            {/* Verification Badge */}
            <View style={styles.verifiedBadge}>
              <FontAwesome name="check-circle" size={20} color={Colors.gold} />
            </View>
          </>
        ) : (
          <View style={styles.profileImagePlaceholder} />
        )}
      </View>

      {/* Metadata - Name, Age, Location, Interests */}
      <View style={styles.metadataSection}>
        <Text style={styles.metadataText}>
          {user.name}, {user.age}, {user.location}
        </Text>
        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <View style={styles.interestsMetadata}>
            {user.interests.slice(0, 3).map((interest, index) => (
              <View key={index} style={styles.interestMetadataBadge}>
                <Text style={styles.interestMetadataText}>{interest}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Vouch Card - Primary Content */}
      {vouch ? (
        <View style={styles.vouchCard}>
          <View style={styles.vouchHeader}>
            <View style={styles.vouchHeaderLeft}>
              <FontAwesome name="check-circle" size={18} color={VOUCH_COLOR} />
              <Text style={styles.vouchFriendName}>
                Vouched by {vouch.friendName}
              </Text>
            </View>
          </View>
          <View style={styles.vouchContent}>
            <View style={styles.vouchSection}>
              <Text style={styles.vouchLabel}>Green Flag</Text>
              <Text style={styles.vouchText}>{vouch.greenFlag}</Text>
            </View>
            <View style={styles.vouchSection}>
              <Text style={styles.vouchLabel}>Hidden Talent</Text>
              <Text style={styles.vouchText}>{vouch.hiddenTalent}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noVouchCard}>
          <Text style={styles.noVouchText}>
            {user.bio || `Hi, I'm ${user.name}. Looking forward to connecting!`}
          </Text>
        </View>
      )}

      {/* Reveal Button - Primary CTA (only show if not revealed) */}
      {!isRevealed ? (
        <TouchableOpacity
          style={styles.revealButton}
          onPress={handleReveal}
          activeOpacity={0.8}
        >
          <Text style={styles.revealButtonText}>Reveal Photo & Profile</Text>
          <FontAwesome name="unlock" size={18} color="#fff" />
        </TouchableOpacity>
      ) : (
          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={onReveal}
            activeOpacity={0.8}
          >
            <Text style={styles.viewProfileButtonText}>View Full Profile</Text>
            <FontAwesome name="arrow-right" size={18} color={BRAND_COLOR} />
          </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card, // Dark espresso card background
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.gold, // Golden glow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, // Golden glow effect
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: Colors.gold, // Thin gold border
  },
  imageSection: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  metadataSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  metadataText: {
    fontSize: Typography.body.fontSize.lg,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  interestsMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  interestMetadataBadge: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  interestMetadataText: {
    fontSize: Typography.body.fontSize.xs,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '500',
    color: Colors.text,
  },
  vouchCard: {
    backgroundColor: Colors.card, // Dark espresso card
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: VOUCH_COLOR, // Gold for vouched badges
    shadowColor: VOUCH_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  vouchHeader: {
    flexDirection: 'row',
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
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '700',
    color: VOUCH_COLOR, // Gold
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
    fontWeight: '600',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  vouchText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
    lineHeight: Typography.body.lineHeight.md,
    fontWeight: '500',
  },
  noVouchCard: {
    backgroundColor: Colors.card, // Dark espresso card
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  noVouchText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
    lineHeight: Typography.body.lineHeight.md,
    textAlign: 'center',
  },
  revealButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: BRAND_COLOR, // Metallic muted gold
    borderRadius: 20,
    paddingVertical: 18,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  revealButtonText: {
    fontSize: Typography.body.fontSize.lg,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '700',
    color: Colors.background, // Dark brown text on gold
    letterSpacing: 0.5,
  },
  viewProfileButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: BRAND_COLOR, // Metallic muted gold
    borderRadius: 20,
    paddingVertical: 18,
  },
  viewProfileButtonText: {
    fontSize: Typography.body.fontSize.lg,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '700',
    color: BRAND_COLOR, // Metallic muted gold
    letterSpacing: 0.5,
  },
});

