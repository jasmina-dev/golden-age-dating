import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { KindredUser } from '@/constants/UserData';
import { getApprovedVouchesByUserId, Vouch } from '@/constants/Vouches';
import { useState, useEffect } from 'react';

interface TeaserProfileCardProps {
  user: KindredUser;
  onReveal: () => void;
}

const BRAND_PINK = '#E0536F';
const GOLD_COLOR = '#D4AF37';

export default function TeaserProfileCard({ user, onReveal }: TeaserProfileCardProps) {
  const [vouch, setVouch] = useState<Vouch | null>(null);

  useEffect(() => {
    // Get the first approved vouch for this user
    const vouches = getApprovedVouchesByUserId(user.id, 1);
    if (vouches.length > 0) {
      setVouch(vouches[0]);
    }
  }, [user.id]);

  return (
    <View style={styles.container}>
      {/* Blurred Profile Image with Pink Overlay */}
      <View style={styles.imageSection}>
        {user.imageUrl ? (
          <>
            <Image
              source={{ uri: user.imageUrl }}
              style={styles.profileImage}
              resizeMode="cover"
            />
            {/* Pink Overlay - Obscures the image */}
            <View style={styles.pinkOverlay} />
            {/* Verification Badge */}
            <View style={styles.verifiedBadge}>
              <FontAwesome name="check-circle" size={20} color="#fff" />
            </View>
          </>
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <View style={styles.pinkOverlay} />
          </View>
        )}
      </View>

      {/* Metadata - Name, Age, Location */}
      <View style={styles.metadataSection}>
        <Text style={styles.metadataText}>
          {user.name}, {user.age}, {user.location}
        </Text>
      </View>

      {/* Vouch Card - Primary Content */}
      {vouch ? (
        <View style={styles.vouchCard}>
          <View style={styles.vouchHeader}>
            <View style={styles.vouchHeaderLeft}>
              <FontAwesome name="check-circle" size={18} color={GOLD_COLOR} />
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

      {/* Reveal Button - Primary CTA */}
      <TouchableOpacity
        style={styles.revealButton}
        onPress={onReveal}
        activeOpacity={0.8}
      >
        <Text style={styles.revealButtonText}>Reveal Photo & Profile</Text>
        <FontAwesome name="arrow-right" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
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
  pinkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BRAND_PINK,
    opacity: 0.85, // Semi-transparent pink overlay
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
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
  },
  vouchCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: GOLD_COLOR,
    shadowColor: GOLD_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
    color: GOLD_COLOR,
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
    backgroundColor: '#fff',
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
    backgroundColor: BRAND_PINK,
    borderRadius: 20,
    paddingVertical: 18,
    shadowColor: BRAND_PINK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  revealButtonText: {
    fontSize: Typography.body.fontSize.lg,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

