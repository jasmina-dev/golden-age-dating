import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Layout from '@/components/Layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

export default function Tonight() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'coffee', label: 'Coffee', icon: 'coffee' },
    { id: 'music', label: 'Live Music', icon: 'music' },
    { id: 'walk', label: 'A Walk', icon: 'map-signs' },
    { id: 'dinner', label: 'Dinner', icon: 'cutlery' },
  ];

  const mockMatches = [
    {
      id: 1,
      name: 'Emma',
      age: 27,
      distance: '2.3 miles away',
      category: 'coffee',
      availability: 'Available 6-8pm',
    },
    {
      id: 2,
      name: 'Lucas',
      age: 29,
      distance: '1.8 miles away',
      category: 'coffee',
      availability: 'Available 7-9pm',
    },
    {
      id: 3,
      name: 'Olivia',
      age: 26,
      distance: '3.1 miles away',
      category: 'coffee',
      availability: 'Available now',
    },
  ];

  return (
    <Layout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <Text style={styles.title}>Tonight Mode</Text>
          
          {/* Availability Toggle */}
          <View style={styles.availabilityCard}>
            <View style={styles.availabilityHeader}>
              <View>
                <Text style={styles.availabilityTitle}>Available Tonight?</Text>
                <Text style={styles.availabilitySubtitle}>
                  Find spontaneous connections near you
                </Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={isAvailable ? '#fff' : '#f4f3f4'}
              />
            </View>

            {/* Category Selection */}
            {isAvailable && (
              <View style={styles.categoriesSection}>
                <Text style={styles.categoriesLabel}>What kind of date?</Text>
                <View style={styles.categoriesGrid}>
                  {categories.map((category) => {
                    const isSelected = selectedCategory === category.id;
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryButton,
                          isSelected && styles.categoryButtonActive,
                        ]}
                        onPress={() => setSelectedCategory(category.id)}
                        activeOpacity={0.8}
                      >
                        <FontAwesome
                          name={category.icon as any}
                          size={24}
                          color={isSelected ? '#fff' : '#000'}
                        />
                        <Text
                          style={[
                            styles.categoryLabel,
                            isSelected && styles.categoryLabelActive,
                          ]}
                        >
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Local Matches Feed */}
          {isAvailable && selectedCategory && (
            <View style={styles.matchesSection}>
              <Text style={styles.matchesTitle}>Available Near You</Text>
              <View style={styles.matchesList}>
                {mockMatches.map((match) => (
                  <View key={match.id} style={styles.matchCard}>
                    <View style={styles.matchContent}>
                      {/* Profile Photo */}
                      <View style={styles.matchAvatar} />
                      
                      {/* Match Info */}
                      <View style={styles.matchInfo}>
                        <Text style={styles.matchName}>
                          {match.name}, {match.age}
                        </Text>
                        
                        <View style={styles.matchDetails}>
                          <View style={styles.matchDetail}>
                            <FontAwesome name="map-marker" size={14} color="#999" />
                            <Text style={styles.matchDetailText}>{match.distance}</Text>
                          </View>
                          <View style={styles.matchDetail}>
                            <FontAwesome name="clock-o" size={14} color="#000" />
                            <Text style={[styles.matchDetailText, styles.matchDetailTextAccent]}>
                              {match.availability}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.proposeButton}
                          onPress={() => router.push(`/profile/${match.id}`)}
                        >
                          <Text style={styles.proposeButtonText}>Propose a Time</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {!isAvailable && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Toggle "Available Tonight" to see local matches ready to meet up spontaneously.
              </Text>
            </View>
          )}
        </SafeAreaView>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  title: {
    fontSize: Typography.heading.fontSize.lg,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    marginBottom: 32,
    letterSpacing: Typography.heading.letterSpacing,
  },
  availabilityCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 28,
    marginBottom: 32,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  availabilityTitle: {
    fontSize: Typography.heading.fontSize.sm,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: Typography.heading.letterSpacing,
  },
  availabilitySubtitle: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
  },
  categoriesSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  categoriesLabel: {
    fontSize: Typography.body.fontSize.sm,
    fontWeight: '500',
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  categoryButton: {
    flex: 1,
    minWidth: '45%',
    padding: 18,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 10,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryLabel: {
    fontSize: Typography.body.fontSize.sm,
    fontWeight: '700',
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
  },
  categoryLabelActive: {
    color: Colors.background,
  },
  matchesSection: {
    marginTop: 12,
  },
  matchesTitle: {
    fontSize: Typography.heading.fontSize.xs,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    marginBottom: 20,
    letterSpacing: Typography.heading.letterSpacing,
  },
  matchesList: {
    gap: 20,
  },
  matchCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  matchContent: {
    flexDirection: 'row',
    gap: 18,
  },
  matchAvatar: {
    width: 84,
    height: 84,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
  },
  matchInfo: {
    flex: 1,
    minWidth: 0,
  },
  matchName: {
    fontSize: Typography.heading.fontSize.sm,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    marginBottom: 10,
    letterSpacing: Typography.heading.letterSpacing,
  },
  matchDetails: {
    gap: 6,
    marginBottom: 14,
  },
  matchDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchDetailText: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
  },
  matchDetailTextAccent: {
    color: Colors.primary,
    fontWeight: '500',
  },
  proposeButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  proposeButtonText: {
    fontSize: Typography.body.fontSize.sm,
    fontWeight: '700',
    fontFamily: Typography.body.fontFamily,
    color: Colors.background,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: Typography.body.lineHeight.md,
  },
});

