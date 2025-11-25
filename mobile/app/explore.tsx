import { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Layout from '@/components/Layout';
import ProfileCard from '@/components/ProfileCard';
import FilterChip from '@/components/FilterChip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { sampleUserData, KindredUser } from '@/constants/UserData';
import { getCurrentUser } from '@/lib/storage';

type FilterType = 'gender' | 'age' | 'interest' | 'location';

interface Filter {
  type: FilterType;
  value: string;
  id: string; // Unique identifier for the filter
}

interface FilterCriteria {
  gender?: string;
  minimumAge?: number;
  interests?: string[];
  location?: string;
}

/**
 * Normalize gender terms to canonical values
 * Maps common synonyms to 'Male' or 'Female'
 */
const normalizeGender = (genderTerm: string): string | null => {
  const normalized = genderTerm.toLowerCase().trim();
  
  // Female synonyms
  const femaleSynonyms = ['female', 'woman', 'women', 'girl', 'girls', 'f', 'w'];
  if (femaleSynonyms.includes(normalized)) {
    return 'Female';
  }
  
  // Male synonyms
  const maleSynonyms = ['male', 'man', 'men', 'boy', 'boys', 'm'];
  if (maleSynonyms.includes(normalized)) {
    return 'Male';
  }
  
  // If it's already a canonical value, return it
  if (normalized === 'female' || normalized === 'male') {
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  
  return null;
};

/**
 * Core function to filter profiles based on criteria
 * This function exclusively uses criteria from activeFilters state
 */
const filterProfiles = (profiles: KindredUser[], criteria: FilterCriteria): KindredUser[] => {
  return profiles.filter((profile) => {
    // Filter by gender - use flexible matching with synonyms
    if (criteria.gender) {
      const normalizedCriteria = normalizeGender(criteria.gender);
      const normalizedProfile = normalizeGender(profile.gender);
      
      // If we can't normalize the criteria, try direct match
      if (!normalizedCriteria) {
        if (profile.gender.toLowerCase() !== criteria.gender.toLowerCase()) {
          return false;
        }
      } else {
        // Use normalized matching
        if (normalizedProfile !== normalizedCriteria) {
          return false;
        }
      }
    }

    // Filter by minimum age
    if (criteria.minimumAge !== undefined) {
      if (profile.age < criteria.minimumAge) {
        return false;
      }
    }

    // Filter by interests (check if profile has any of the specified interests)
    if (criteria.interests && criteria.interests.length > 0) {
      const profileInterestsLower = profile.interests.map((i) => i.toLowerCase());
      const hasMatchingInterest = criteria.interests.some((interest) =>
        profileInterestsLower.includes(interest.toLowerCase())
      );
      if (!hasMatchingInterest) {
        return false;
      }
    }

    // Filter by location
    if (criteria.location) {
      const profileLocationLower = profile.location.toLowerCase();
      const searchLocationLower = criteria.location.toLowerCase();
      if (!profileLocationLower.includes(searchLocationLower)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Convert filter objects to FilterCriteria
 */
const filtersToCriteria = (filters: Filter[]): FilterCriteria => {
  const criteria: FilterCriteria = {};
  const interests: string[] = [];

  filters.forEach((filter) => {
    switch (filter.type) {
      case 'gender':
        const normalizedGender = normalizeGender(filter.value);
        if (normalizedGender) {
          criteria.gender = normalizedGender;
        }
        break;
      case 'age':
        const ageMatch = filter.value.match(/\d+/);
        if (ageMatch) {
          criteria.minimumAge = parseInt(ageMatch[0], 10);
        }
        break;
      case 'interest':
        interests.push(filter.value);
        break;
      case 'location':
        criteria.location = filter.value;
        break;
    }
  });

  if (interests.length > 0) {
    criteria.interests = interests;
  }

  return criteria;
};

/**
 * Parse search text and extract filters
 */
const parseSearchText = (searchText: string): Filter[] => {
  const filters: Filter[] = [];
  if (!searchText.trim()) {
    return filters;
  }
  
  const words = searchText.toLowerCase().split(/\s+/);
  const timestamp = Date.now();
  
  // Extract gender
  for (const word of words) {
    const normalizedGender = normalizeGender(word);
    if (normalizedGender) {
      filters.push({
        type: 'gender',
        value: normalizedGender,
        id: `gender-${timestamp}-${Math.random()}`,
      });
      break; // Only take first gender match
    }
  }
  
  // Extract age (look for "over X" or "X+" patterns)
  const agePatterns = [
    /over\s+(\d+)/i,
    /(\d+)\+/i,
    /age\s+(\d+)/i,
  ];
  
  for (const pattern of agePatterns) {
    const match = searchText.match(pattern);
    if (match) {
      const age = parseInt(match[1], 10);
      filters.push({
        type: 'age',
        value: `Over ${age}`,
        id: `age-${timestamp}-${Math.random()}`,
      });
      break;
    }
  }
  
  // Extract interests (check against known interests from sampleUserData)
  const allInterests = new Set<string>();
  sampleUserData.forEach((user) => {
    user.interests.forEach((interest) => allInterests.add(interest.toLowerCase()));
  });
  
  for (const word of words) {
    if (allInterests.has(word)) {
      // Find the original case version
      const originalInterest = sampleUserData
        .flatMap((u) => u.interests)
        .find((i) => i.toLowerCase() === word);
      if (originalInterest && !filters.some((f) => f.type === 'interest' && f.value.toLowerCase() === word)) {
        filters.push({
          type: 'interest',
          value: originalInterest,
          id: `interest-${timestamp}-${Math.random()}`,
        });
      }
    }
  }
  
  return filters;
};

/**
 * Generate display label for a filter
 */
const getFilterLabel = (filter: Filter): string => {
  switch (filter.type) {
    case 'gender':
      return filter.value;
    case 'age':
      return filter.value;
    case 'interest':
      return filter.value;
    case 'location':
      return filter.value;
    default:
      return filter.value;
  }
};

/**
 * Calculate the percentage of shared interests between the current user and a target profile
 * Returns a percentage (0-100) based on the Jaccard similarity coefficient
 */
const calculateKindredMatch = (
  currentUserInterests: string[],
  targetProfileInterests: string[]
): number => {
  // If either user has no interests, return 0
  if (currentUserInterests.length === 0 || targetProfileInterests.length === 0) {
    return 0;
  }

  // Normalize interests to lowercase for comparison
  const currentInterestsLower = currentUserInterests.map((i) => i.toLowerCase());
  const targetInterestsLower = targetProfileInterests.map((i) => i.toLowerCase());

  // Find shared interests
  const sharedInterests = currentInterestsLower.filter((interest) =>
    targetInterestsLower.includes(interest)
  );

  // Calculate Jaccard similarity: intersection / union
  const union = new Set([...currentInterestsLower, ...targetInterestsLower]);
  const intersection = sharedInterests.length;
  const unionSize = union.size;

  // Calculate percentage
  const percentage = Math.round((intersection / unionSize) * 100);

  return percentage;
};

export default function Explore() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]); // No default filters
  const [showAddFilterModal, setShowAddFilterModal] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState<FilterType | null>(null);
  const [filterInputValue, setFilterInputValue] = useState('');
  const [currentUser, setCurrentUser] = useState<KindredUser | null>(null);

  // Get current user on component mount
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Convert activeFilters to criteria
  const filterCriteria = useMemo((): FilterCriteria => {
    return filtersToCriteria(activeFilters);
  }, [activeFilters]);

  // Filter profiles based on criteria
  const filteredProfiles = useMemo(() => {
    return filterProfiles(sampleUserData, filterCriteria);
  }, [filterCriteria]);

  // Map KindredUser to ProfileCard props with calculated Kindred Match
  // Filter out profiles below 70% match, exclude current user, and sort by match percentage (highest first)
  const profileCards = useMemo(() => {
    const currentUserInterests = currentUser?.interests || [];
    
    return filteredProfiles
      .filter((profile) => {
        // Exclude the current user from matches
        return currentUser?.id !== profile.id;
      })
      .map((profile) => {
        // Calculate Kindred Match based on shared interests
        const kindredMatch = calculateKindredMatch(currentUserInterests, profile.interests);
        
        return {
          name: profile.name,
          age: profile.age,
          compatibility: kindredMatch,
          interests: profile.interests.slice(0, 3), // Show first 3 interests
          image: profile.imageUrl,
          verified: true,
          onClick: () => router.push(`/profile/${profile.id}`),
        };
      })
      .filter((card) => card.compatibility >= 70) // Only show profiles with 70% or above match
      .sort((a, b) => b.compatibility - a.compatibility); // Sort by match percentage descending (highest first)
  }, [filteredProfiles, currentUser]);

  const removeFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter((f) => f.id !== filterId));
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    // Parse search text and update filters
    const parsedFilters = parseSearchText(text);
    
    // Update filters: replace conflicting ones, add new ones
    if (parsedFilters.length > 0) {
      setActiveFilters((prevFilters) => {
        const newFilters = [...prevFilters];
        
        // Remove conflicting filters of the same type
        parsedFilters.forEach((parsedFilter) => {
          const existingIndex = newFilters.findIndex((f) => f.type === parsedFilter.type);
          if (existingIndex >= 0) {
            newFilters.splice(existingIndex, 1);
          }
          newFilters.push(parsedFilter);
        });
        
        return newFilters;
      });
    }
  };

  const handleAddFilter = () => {
    setShowAddFilterModal(true);
    setSelectedFilterType(null);
    setFilterInputValue('');
  };

  const handleSelectFilterType = (type: FilterType) => {
    setSelectedFilterType(type);
    setFilterInputValue('');
  };

  const handleConfirmFilter = () => {
    if (!selectedFilterType || !filterInputValue.trim()) {
      return;
    }

    let value = filterInputValue.trim();
    
    // Normalize gender values
    if (selectedFilterType === 'gender') {
      const normalized = normalizeGender(value);
      if (normalized) {
        value = normalized;
      }
    }
    
    // Format age values
    if (selectedFilterType === 'age') {
      const ageMatch = value.match(/\d+/);
      if (ageMatch) {
        value = `Over ${ageMatch[0]}`;
      }
    }

    // Check if filter already exists
    const exists = activeFilters.some(
      (f) => f.type === selectedFilterType && f.value.toLowerCase() === value.toLowerCase()
    );

    if (!exists) {
      const newFilter: Filter = {
        type: selectedFilterType,
        value,
        id: `filter-${Date.now()}-${Math.random()}`,
      };

      // Remove conflicting filter of the same type
      setActiveFilters((prev) => {
        const filtered = prev.filter((f) => f.type !== selectedFilterType);
        return [...filtered, newFilter];
      });
    }

    setShowAddFilterModal(false);
    setSelectedFilterType(null);
    setFilterInputValue('');
  };

  // Get available options for filter types
  const getFilterOptions = (type: FilterType): string[] => {
    switch (type) {
      case 'gender':
        return ['Male', 'Female'];
      case 'age':
        return ['Over 25', 'Over 30', 'Over 35'];
      case 'interest':
        const allInterests = new Set<string>();
        sampleUserData.forEach((user) => {
          user.interests.forEach((interest) => allInterests.add(interest));
        });
        return Array.from(allInterests).sort();
      case 'location':
        const allLocations = new Set<string>();
        sampleUserData.forEach((user) => {
          allLocations.add(user.location);
        });
        return Array.from(allLocations).sort();
      default:
        return [];
    }
  };

  return (
    <Layout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>kindred</Text>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <FontAwesome name="heart" size={24} color={Colors.secondary} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <FontAwesome name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              placeholder="men over 25 who like to hike"
              value={searchQuery}
              onChangeText={handleSearchChange}
              style={styles.searchInput}
              placeholderTextColor="#999"
            />
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {activeFilters.map((filter) => (
              <FilterChip
                key={filter.id}
                label={getFilterLabel(filter)}
                active
                onRemove={() => removeFilter(filter.id)}
              />
            ))}
            <TouchableOpacity onPress={handleAddFilter}>
              <FilterChip label="Add Filter" />
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>

        {/* Profile Grid */}
        <View style={styles.profilesContainer}>
          {profileCards.length > 0 ? (
            profileCards.map((profile, index) => (
              <ProfileCard
                key={`${profile.name}-${index}`}
                {...profile}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No profiles match your filters</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Filter Modal */}
      <Modal
        visible={showAddFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddFilterModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAddFilterModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Filter</Text>
              <TouchableOpacity
                onPress={() => setShowAddFilterModal(false)}
                style={styles.modalCloseButton}
              >
                <FontAwesome name="times" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {!selectedFilterType ? (
              <View style={styles.filterTypeContainer}>
                <Text style={styles.filterTypeLabel}>Select Filter Type</Text>
                {(['gender', 'age', 'interest', 'location'] as FilterType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.filterTypeButton}
                    onPress={() => handleSelectFilterType(type)}
                  >
                    <Text style={styles.filterTypeButtonText}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                    <FontAwesome name="chevron-right" size={16} color="#999" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.filterValueContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setSelectedFilterType(null)}
                >
                  <FontAwesome name="chevron-left" size={16} color="#000" />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <Text style={styles.filterValueLabel}>
                  Select {selectedFilterType.charAt(0).toUpperCase() + selectedFilterType.slice(1)}
                </Text>

                {getFilterOptions(selectedFilterType).length > 0 ? (
                  <ScrollView style={styles.optionsList}>
                    {getFilterOptions(selectedFilterType).map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.optionButton,
                          filterInputValue === option && styles.optionButtonSelected,
                        ]}
                        onPress={() => setFilterInputValue(option)}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            filterInputValue === option && styles.optionButtonTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                        {filterInputValue === option && (
                          <FontAwesome name="check" size={16} color={Colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <TextInput
                    style={styles.filterInput}
                    placeholder={`Enter ${selectedFilterType}...`}
                    value={filterInputValue}
                    onChangeText={setFilterInputValue}
                    placeholderTextColor="#999"
                  />
                )}

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    (!filterInputValue.trim() && styles.confirmButtonDisabled),
                  ]}
                  onPress={handleConfirmFilter}
                  disabled={!filterInputValue.trim()}
                >
                  <Text style={styles.confirmButtonText}>Add Filter</Text>
                </TouchableOpacity>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
  },
  profileButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  filtersContainer: {
    marginTop: 8,
  },
  filtersContent: {
    gap: 8,
    paddingRight: 24,
  },
  profilesContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  modalCloseButton: {
    padding: 4,
  },
  filterTypeContainer: {
    gap: 12,
  },
  filterTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  filterTypeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  filterTypeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  filterValueContainer: {
    gap: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  filterValueLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary + '20',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  optionButtonTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  filterInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#e5e5e5',
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

