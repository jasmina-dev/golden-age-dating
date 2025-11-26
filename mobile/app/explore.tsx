import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  Pressable, 
  Dimensions,
  Image,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
// Using gradient colors - will implement with View and backgroundColor for now
// Can install expo-linear-gradient for better gradients: npm install expo-linear-gradient
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { sampleUserData, KindredUser } from '@/constants/UserData';
import { getCurrentUser, isProfileRevealed, markProfileRevealed } from '@/lib/storage';
import { trackProfileReveal } from '@/lib/tracking';
// Gradient component helper - using solid colors for now
const GradientView = ({ colors, children, style }: { colors: string[]; children: React.ReactNode; style?: any }) => {
  return (
    <View style={[style, { backgroundColor: colors[0] }]}>
      {children}
    </View>
  );
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Filter {
  type: 'gender' | 'age' | 'interest' | 'location';
  value: string;
  id: string;
}

interface FilterCriteria {
  gender?: string;
  minimumAge?: number;
  maximumAge?: number;
  interests?: string[];
  location?: string;
  distance?: number;
  price?: { min: number; max: number };
}

// Category bubbles with pastel gradients
const categories = [
  { id: 'all', label: 'All', gradient: Colors.gradient1 },
  { id: 'nearby', label: 'Nearby', gradient: Colors.gradient2 },
  { id: 'new', label: 'New', gradient: Colors.gradient3 },
  { id: 'verified', label: 'Verified', gradient: Colors.gradient4 },
  { id: 'online', label: 'Online', gradient: Colors.gradient5 },
];

const normalizeGender = (genderTerm: string): string | null => {
  const normalized = genderTerm.toLowerCase().trim();
  const femaleSynonyms = ['female', 'woman', 'women', 'girl', 'girls', 'f', 'w'];
  const maleSynonyms = ['male', 'man', 'men', 'boy', 'boys', 'm'];
  
  if (femaleSynonyms.includes(normalized)) return 'Female';
  if (maleSynonyms.includes(normalized)) return 'Male';
  if (normalized === 'female' || normalized === 'male') {
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  return null;
};

const filterProfiles = (profiles: KindredUser[], criteria: FilterCriteria): KindredUser[] => {
  return profiles.filter((profile) => {
    if (criteria.gender) {
      const normalizedCriteria = normalizeGender(criteria.gender);
      const normalizedProfile = normalizeGender(profile.gender);
      if (normalizedCriteria && normalizedProfile !== normalizedCriteria) return false;
    }
    if (criteria.minimumAge && profile.age < criteria.minimumAge) return false;
    if (criteria.maximumAge && profile.age > criteria.maximumAge) return false;
    if (criteria.interests && criteria.interests.length > 0) {
      const profileInterestsLower = profile.interests.map((i) => i.toLowerCase());
      const hasMatchingInterest = criteria.interests.some((interest) =>
        profileInterestsLower.includes(interest.toLowerCase())
      );
      if (!hasMatchingInterest) return false;
    }
    if (criteria.location) {
      if (!profile.location.toLowerCase().includes(criteria.location.toLowerCase())) return false;
    }
    return true;
  });
};

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

// Profile Card Component - Separate component to use hooks
interface ProfileCardItemProps {
  item: KindredUser;
  kindredMatch: number;
  onProfilePress: () => void;
  onMessagePress: () => void;
}

const ProfileCardItem = ({ item, kindredMatch, onProfilePress, onMessagePress }: ProfileCardItemProps) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const revealed = isProfileRevealed(item.id);
    setIsRevealed(revealed);
  }, [item.id]);

  const handleReveal = () => {
    // Track the reveal and mark as revealed
    trackProfileReveal(item.id);
    markProfileRevealed(item.id);
    // Reveal the image in place
    setIsRevealed(true);
  };

  return (
    <View style={styles.profileCard}>
      {/* Full-screen profile image */}
      {item.imageUrl ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          {/* Blur Overlay - Only show if profile hasn't been revealed */}
          {!isRevealed && (
            <BlurView intensity={80} style={styles.blurOverlay}>
              <View style={styles.blurContent} />
            </BlurView>
          )}
        </View>
      ) : (
        <View style={[styles.profileImage, styles.profileImagePlaceholder]} />
      )}

      {/* Profile details overlay - bottom left */}
      <View style={styles.profileDetailsOverlay}>
        <Text style={styles.profileName}>
          {item.name}, {item.age}
        </Text>
        <Text style={styles.profileLocation}>{item.location}</Text>
        {/* Interests in overlay */}
        {item.interests && item.interests.length > 0 && (
          <View style={styles.interestsOverlay}>
            {item.interests.slice(0, 3).map((interest, index) => (
              <View key={index} style={styles.interestOverlayBadge}>
                <Text style={styles.interestOverlayText}>{interest}</Text>
              </View>
            ))}
          </View>
        )}
        {kindredMatch > 0 && (
          <View style={styles.matchBadge}>
            <FontAwesome name="heart" size={14} color={Colors.coral} />
            <Text style={styles.matchText}>{kindredMatch}% Match</Text>
          </View>
        )}
      </View>

      {/* Action buttons - bottom right */}
      <View style={styles.actionButtons}>
        {!isRevealed ? (
          // Show unlock icon when not revealed
          <TouchableOpacity
            style={styles.unlockButton}
            onPress={handleReveal}
            activeOpacity={0.8}
          >
            <FontAwesome name="unlock" size={24} color={Colors.text} />
          </TouchableOpacity>
        ) : (
          // Show profile and message buttons when revealed
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onProfilePress}
            >
              <FontAwesome name="user" size={20} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onMessagePress}
            >
              <FontAwesome name="comment" size={20} color={Colors.text} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default function Explore() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<KindredUser | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({});
  const [ageRange, setAgeRange] = useState([18, 50]);
  const [distanceRange, setDistanceRange] = useState([0, 50]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [genderFilter, setGenderFilter] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const filteredProfiles = useMemo(() => {
    const criteria: FilterCriteria = {
      ...filterCriteria,
      minimumAge: ageRange[0],
      maximumAge: ageRange[1],
    };
    return filterProfiles(sampleUserData, criteria);
  }, [filterCriteria, ageRange]);

  const profileCards = useMemo(() => {
    const currentUserInterests = currentUser?.interests || [];
    
    return filteredProfiles
      .filter((profile) => {
        if (currentUser?.id === profile.id) return false;
        const kindredMatch = calculateKindredMatch(currentUserInterests, profile.interests);
        return kindredMatch >= 70;
      })
      .map((profile) => {
        const kindredMatch = calculateKindredMatch(currentUserInterests, profile.interests);
        return { profile, kindredMatch };
      })
      .sort((a, b) => b.kindredMatch - a.kindredMatch)
      .map((item) => item.profile);
  }, [filteredProfiles, currentUser]);

  const renderProfileCard = ({ item }: { item: KindredUser }) => {
    const kindredMatch = currentUser
      ? calculateKindredMatch(currentUser.interests, item.interests)
      : 0;

    return (
      <ProfileCardItem
        item={item}
        kindredMatch={kindredMatch}
        onProfilePress={() => router.push(`/profile/${item.id}`)}
        onMessagePress={() => router.push('/messages')}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Category bubbles - top overlay */}
      <SafeAreaView edges={['top']} style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryBubble}
              onPress={() => setActiveCategory(category.id)}
              activeOpacity={0.8}
            >
              <GradientView colors={category.gradient} style={styles.categoryGradient}>
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </GradientView>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filter button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <BlurView intensity={80} tint="light" style={styles.filterButtonBlur}>
            <FontAwesome name="sliders" size={18} color={Colors.text} />
          </BlurView>
            </TouchableOpacity>
        </SafeAreaView>

      {/* Vertical feed */}
      <FlatList
        ref={flatListRef}
        data={profileCards}
        renderItem={renderProfileCard}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
      />

      {/* Floating Navigation Bar */}
      <View style={styles.navBarContainer}>
        <BlurView intensity={80} tint="light" style={styles.navBarBlur}>
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push('/explore')}
              activeOpacity={0.7}
            >
              <FontAwesome name="compass" size={22} color={Colors.coral} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push('/community')}
              activeOpacity={0.7}
            >
              <FontAwesome name="paint-brush" size={22} color={Colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push('/messages')}
              activeOpacity={0.7}
            >
              <FontAwesome name="comment" size={22} color={Colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push('/profile')}
              activeOpacity={0.7}
            >
              <FontAwesome name="user" size={22} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      {/* Filter Modal - Bottom Sheet */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.modalCloseButton}
              >
                <FontAwesome name="times" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Gender Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Gender</Text>
                <View style={styles.toggleContainer}>
                  {['Male', 'Female', 'All'].map((gender) => (
                  <TouchableOpacity
                      key={gender}
                      style={[
                        styles.toggleButton,
                        genderFilter === gender && styles.toggleButtonActive,
                      ]}
                      onPress={() => setGenderFilter(gender === 'All' ? '' : gender)}
                    >
                      <Text
                        style={[
                          styles.toggleText,
                          genderFilter === gender && styles.toggleTextActive,
                        ]}
                      >
                        {gender}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>

              {/* Age Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>
                  Age: {ageRange[0]} - {ageRange[1]}
                </Text>
                <View style={styles.rangeInputContainer}>
                  <Text style={styles.rangeValue}>{ageRange[0]}</Text>
                  <View style={styles.rangeTrack}>
                    <View style={[styles.rangeFill, { width: `${((ageRange[0] - 18) / (50 - 18)) * 100}%` }]} />
                    <View style={[styles.rangeFill, { 
                      left: `${((ageRange[0] - 18) / (50 - 18)) * 100}%`,
                      width: `${((ageRange[1] - ageRange[0]) / (50 - 18)) * 100}%`
                    }]} />
                    <View style={[styles.rangeThumb, { left: `${((ageRange[0] - 18) / (50 - 18)) * 100}%` }]} />
                    <View style={[styles.rangeThumb, { left: `${((ageRange[1] - 18) / (50 - 18)) * 100}%` }]} />
                  </View>
                  <Text style={styles.rangeValue}>{ageRange[1]}</Text>
                </View>
                <Text style={styles.rangeHint}>Tap and drag to adjust range</Text>
              </View>

              {/* Distance Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>
                  Distance: {distanceRange[0]} - {distanceRange[1]} miles
                </Text>
                <View style={styles.rangeInputContainer}>
                  <Text style={styles.rangeValue}>{distanceRange[0]}</Text>
                  <View style={styles.rangeTrack}>
                    <View style={[styles.rangeFill, { width: `${(distanceRange[0] / 50) * 100}%` }]} />
                    <View style={[styles.rangeFill, { 
                      left: `${(distanceRange[0] / 50) * 100}%`,
                      width: `${((distanceRange[1] - distanceRange[0]) / 50) * 100}%`
                    }]} />
                  </View>
                  <Text style={styles.rangeValue}>{distanceRange[1]}</Text>
                </View>
                <Text style={styles.rangeHint}>Tap and drag to adjust range</Text>
              </View>

              {/* Price Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </Text>
                <View style={styles.rangeInputContainer}>
                  <Text style={styles.rangeValue}>${priceRange[0]}</Text>
                  <View style={styles.rangeTrack}>
                    <View style={[styles.rangeFill, { width: `${(priceRange[0] / 100) * 100}%` }]} />
                    <View style={[styles.rangeFill, { 
                      left: `${(priceRange[0] / 100) * 100}%`,
                      width: `${((priceRange[1] - priceRange[0]) / 100) * 100}%`
                    }]} />
                  </View>
                  <Text style={styles.rangeValue}>${priceRange[1]}</Text>
                </View>
                <Text style={styles.rangeHint}>Tap and drag to adjust range</Text>
              </View>

              {/* Apply Button */}
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setFilterCriteria({
                    ...filterCriteria,
                    gender: genderFilter,
                    price: { min: priceRange[0], max: priceRange[1] },
                    distance: distanceRange[1],
                  });
                  setShowFilterModal(false);
                }}
              >
                <GradientView colors={Colors.primaryGradient} style={styles.applyButtonGradient}>
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </GradientView>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  categoryContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  categoryScrollContent: {
    paddingRight: 60, // Space for filter button
    gap: 8,
  },
  categoryBubble: {
    marginRight: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryTextActive: {
    fontWeight: '700',
  },
  filterButton: {
    position: 'absolute',
    right: 16,
    top: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterButtonBlur: {
    padding: 12,
    borderRadius: 20,
  },
  profileCard: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
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
    backgroundColor: Colors.border,
  },
  profileDetailsOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 24,
    right: 100,
    zIndex: 5,
  },
  profileName: {
    fontSize: 32,
    fontFamily: Typography.heading.fontFamily,
    fontWeight: Typography.heading.fontWeight,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 18,
    fontFamily: Typography.body.fontFamily,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  matchText: {
    fontSize: 14,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  interestsOverlay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  interestOverlayBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  interestOverlayText: {
    fontSize: 12,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    gap: 16,
    zIndex: 5,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  unlockButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  feedContent: {
    paddingBottom: 0,
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
    fontSize: 28,
    fontFamily: Typography.heading.fontFamily,
    fontWeight: Typography.heading.fontWeight,
    color: Colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    flex: 1,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterLabel: {
    fontSize: 18,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.coral,
    borderColor: Colors.coral,
  },
  toggleText: {
    fontSize: 16,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '600',
    color: Colors.text,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  rangeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  rangeValue: {
    fontSize: 16,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '600',
    color: Colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  rangeTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    position: 'relative',
  },
  rangeFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: Colors.coral,
    borderRadius: 3,
  },
  rangeThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.coral,
    top: -7,
    marginLeft: -10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rangeHint: {
    fontSize: 12,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  applyButton: {
    marginTop: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 18,
    fontFamily: Typography.body.fontFamily,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  navBarBlur: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: Colors.navBarBackground,
    borderWidth: 1,
    borderColor: Colors.navBarBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 280,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
