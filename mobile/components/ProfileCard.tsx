import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { isProfileRevealed, markProfileRevealed } from '@/lib/storage';
import { trackProfileReveal } from '@/lib/tracking';
import { useState, useEffect } from 'react';

interface ProfileCardProps {
  name: string;
  age: number;
  compatibility: number;
  interests: string[];
  image?: string;
  verified?: boolean;
  onClick?: () => void;
}

export default function ProfileCard({
  name,
  age,
  compatibility,
  interests,
  image,
  verified = true,
  onClick,
}: ProfileCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  // Use a unique ID based on name and age for tracking reveals
  const profileId = `${name}-${age}`;

  useEffect(() => {
    const revealed = isProfileRevealed(profileId);
    setIsRevealed(revealed);
  }, [profileId]);

  const handleReveal = () => {
    trackProfileReveal(profileId);
    markProfileRevealed(profileId);
    setIsRevealed(true);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onClick}
      activeOpacity={0.9}
    >
      {/* Profile Image */}
      <View style={styles.imageContainer}>
        {image ? (
          <>
            <Image
              source={{ uri: image }}
              style={styles.profileImage}
              resizeMode="cover"
            />
            {/* Blur Overlay - Only show if profile hasn't been revealed */}
            {!isRevealed && (
              <BlurView intensity={80} style={styles.blurOverlay}>
                <View style={styles.blurContent} />
              </BlurView>
            )}
          </>
        ) : (
          <View style={styles.profileImagePlaceholder} />
        )}
        {verified && (
          <View style={styles.verifiedBadge}>
            <FontAwesome name="check-circle" size={16} color={Colors.gold} />
          </View>
        )}
      </View>
      
      {/* Profile Info */}
      <View style={styles.infoSection}>
        <Text style={styles.name}>
          {name}, {age}
        </Text>

        {/* Compatibility Badge - Prominently displayed with primary brand color */}
        <View style={styles.compatibilityBadge}>
          <FontAwesome name="heart" size={20} color={Colors.primary} />
          <Text style={styles.compatibilityText}>{compatibility}%</Text>
          <Text style={styles.kindredText}>Kindred Match</Text>
        </View>
        
        {/* Interests */}
        <View style={styles.interestsContainer}>
          {interests.slice(0, 3).map((interest, i) => (
            <View key={i} style={styles.interestBadge}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>

        {/* Reveal Button - Only show if not revealed */}
        {!isRevealed ? (
          <TouchableOpacity
            style={styles.revealButton}
            onPress={handleReveal}
            activeOpacity={0.8}
          >
            <FontAwesome name="unlock" size={18} color={Colors.background} />
            <Text style={styles.revealButtonText}>Reveal Photo</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.viewButton}
            onPress={onClick}
            activeOpacity={0.8}
          >
            <Text style={styles.viewButtonText}>View Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
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
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  infoSection: {
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text, // Off-white text
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(201, 169, 97, 0.15)', // Gold with 15% opacity
    borderWidth: 2,
    borderColor: Colors.gold,
    borderRadius: 16,
    padding: 16,
  },
  compatibilityText: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.gold,
  },
  kindredText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gold,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestBadge: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  interestText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  revealButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  revealButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background, // Dark brown text on gold
  },
  viewButton: {
    width: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background, // Dark brown text on gold
  },
});

