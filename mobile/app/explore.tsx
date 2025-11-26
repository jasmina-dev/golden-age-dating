import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { sampleUserData, KindredUser } from '@/constants/UserData';
import { getCurrentUser } from '@/lib/storage';
import Layout from '@/components/Layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Filter {
  type: 'gender' | 'age' | 'interest';
  value: string;
  id: string;
}

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

const filterProfiles = (profiles: KindredUser[], filters: Filter[]): KindredUser[] => {
  return profiles.filter((profile) => {
    for (const filter of filters) {
      if (filter.type === 'gender') {
        const normalizedFilter = normalizeGender(filter.value);
        const normalizedProfile = normalizeGender(profile.gender);
        if (normalizedFilter && normalizedProfile !== normalizedFilter) return false;
      }
      if (filter.type === 'age') {
        const ageMatch = filter.value.match(/over (\d+)/i);
        if (ageMatch) {
          const minAge = parseInt(ageMatch[1]);
          if (profile.age <= minAge) return false;
        }
      }
      if (filter.type === 'interest') {
        const profileInterestsLower = profile.interests.map((i) => i.toLowerCase());
        if (!profileInterestsLower.includes(filter.value.toLowerCase())) return false;
      }
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

// Parse search query into filters
const parseSearchQuery = (query: string): Filter[] => {
  const filters: Filter[] = [];
  const words = query.toLowerCase().split(/\s+/);
  let filterId = 1;

  // Check for gender
  const genderMatch = query.match(/\b(men|man|male|women|woman|female|girls|boys)\b/i);
  if (genderMatch) {
    const gender = normalizeGender(genderMatch[1]);
    if (gender) {
      filters.push({ type: 'gender', value: gender, id: String(filterId++) });
    }
  }

  // Check for age (e.g., "over 25", "above 30")
  const ageMatch = query.match(/\b(over|above|older than)\s+(\d+)\b/i);
  if (ageMatch) {
    const age = parseInt(ageMatch[2], 10);
    filters.push({ type: 'age', value: `Over ${age}`, id: String(filterId++) });
  }

  // Check for interests (common interests from sample data)
  const commonInterests = [
    'hiking', 'photography', 'cooking', 'live music', 'philosophy', 'reading',
    'travel', 'yoga', 'art', 'dancing', 'gaming', 'fitness', 'movies', 'writing',
    'volunteering', 'wine tasting', 'cycling', 'meditation', 'theater', 'surfing',
    'ceramics', 'indie films', 'camping'
  ];
  
  for (const interest of commonInterests) {
    if (query.toLowerCase().includes(interest)) {
      // Capitalize first letter
      const capitalized = interest.charAt(0).toUpperCase() + interest.slice(1);
      filters.push({ type: 'interest', value: capitalized, id: String(filterId++) });
      break; // Only add first matching interest
    }
  }

  return filters;
};

export default function Explore() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<KindredUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('men over 25 who like to hike');
  const [activeFilters, setActiveFilters] = useState<Filter[]>([
    { type: 'gender', value: 'Male', id: '1' },
    { type: 'age', value: 'Over 25', id: '2' },
    { type: 'interest', value: 'Hiking', id: '3' },
  ]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Update filters when search query changes (with debounce)
  useEffect(() => {
    if (searchQuery.trim()) {
      const parsedFilters = parseSearchQuery(searchQuery);
      if (parsedFilters.length > 0) {
        setActiveFilters(parsedFilters);
      }
    }
  }, [searchQuery]);

  const filteredProfiles = useMemo(() => {
    return filterProfiles(sampleUserData, activeFilters);
  }, [activeFilters]);

  const profileCards = useMemo(() => {
    const currentUserInterests = currentUser?.interests || [];
    
    return filteredProfiles
      .filter((profile) => {
        if (currentUser?.id === profile.id) return false;
        return true;
      })
      .map((profile) => {
        const kindredMatch = calculateKindredMatch(currentUserInterests, profile.interests);
        return { profile, kindredMatch };
      })
      .filter((item) => item.kindredMatch >= 70) // Only show 70%+ compatible profiles
      .sort((a, b) => b.kindredMatch - a.kindredMatch);
  }, [filteredProfiles, currentUser]);

  const removeFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter(f => f.id !== filterId));
  };

  const renderProfileCard = ({ item }: { item: { profile: KindredUser; kindredMatch: number } }) => {
    const { profile, kindredMatch } = item;
    const interestsText = profile.interests.slice(0, 2).join(', ').toLowerCase();
    
    return (
      <View style={styles.profileCard}>
        <TouchableOpacity
          style={styles.profileCardContent}
          onPress={() => router.push(`/profile/${profile.id}`)}
          activeOpacity={0.8}
        >
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name.toLowerCase()}, {profile.age}</Text>
            <Text style={styles.kindredMatch}>{kindredMatch}% kindred spirit</Text>
            <Text style={styles.interests}>{interestsText}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={() => router.push(`/profile/${profile.id}`)}
          activeOpacity={0.8}
        >
          <FontAwesome name="unlock" size={20} color={Colors.darkPink} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Layout>
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={18} color="#999999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="men over 25 who like to hike"
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tags */}
        {activeFilters.length > 0 && (
          <View style={styles.filterContainer}>
            {activeFilters.map((filter) => (
              <View key={filter.id} style={styles.filterTag}>
                <Text style={styles.filterText}>{filter.value}</Text>
                <TouchableOpacity
                  onPress={() => removeFilter(filter.id)}
                  style={styles.filterClose}
                >
                  <Text style={styles.filterCloseText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Profile Cards List */}
        <FlatList
          data={profileCards}
          renderItem={renderProfileCard}
          keyExtractor={(item) => item.profile.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        </SafeAreaView>
      </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: Typography.body.fontFamily,
    color: '#000000',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    fontFamily: Typography.body.fontFamily,
    color: Colors.darkPink,
  },
  filterClose: {
    padding: 2,
  },
  filterCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkPink,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileCardContent: {
    flex: 1,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: Typography.heading.fontFamily,
    color: '#000000',
    marginBottom: 8,
  },
  kindredMatch: {
    fontSize: 16,
    fontFamily: Typography.body.fontFamily,
    color: '#000000',
    marginBottom: 8,
  },
  interests: {
    fontSize: 16,
    fontFamily: Typography.body.fontFamily,
    color: '#666666',
  },
  unlockButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.darkPink,
    marginLeft: 16,
  },
});
