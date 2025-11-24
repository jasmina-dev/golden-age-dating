import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Layout from '@/components/Layout';
import ProfileCard from '@/components/ProfileCard';
import FilterChip from '@/components/FilterChip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

export default function Explore() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState(['Male', 'Over 25', 'Hiking']);
  
  const mockProfiles = [
    {
      id: 1,
      name: 'David',
      age: 33,
      compatibility: 92,
      interests: ['hiking', 'ceramics'],
      verified: true,
    },
    {
      id: 2,
      name: 'Sarah',
      age: 31,
      compatibility: 88,
      interests: ['indie films', 'hiking', 'cooking'],
      verified: true,
    },
    {
      id: 3,
      name: 'Ben',
      age: 29,
      compatibility: 85,
      interests: ['live music', 'philosophy', 'photography'],
      verified: true,
    },
  ];

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));
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
              onChangeText={setSearchQuery}
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
                key={filter}
                label={filter}
                active
                onRemove={() => removeFilter(filter)}
              />
            ))}
            <FilterChip label="Add Filter" />
          </ScrollView>
        </SafeAreaView>

        {/* Profile Grid */}
        <View style={styles.profilesContainer}>
          {mockProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              {...profile}
              onClick={() => router.push(`/profile/${profile.id}`)}
            />
          ))}
        </View>
      </ScrollView>
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
});

