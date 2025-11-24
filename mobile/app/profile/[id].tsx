import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Layout from '@/components/Layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Colors } from '@/constants/Colors';

export default function ProfileView() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('about');

  const tabs = ['about', 'quizzes', 'journal', 'vouches'];

  return (
    <Layout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={20} color={Colors.text} />
          </TouchableOpacity>

          {/* Profile Header */}
          <View style={styles.profileHeader}>
            {/* Verification Badge */}
            <View style={styles.verifiedBadge}>
              <FontAwesome name="check-circle" size={20} color="#fff" />
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <View style={styles.profileCard}>
              <Text style={styles.profileName}>Ben, 29</Text>
              <Text style={styles.profileLocation}>Austin, TX</Text>
              
              {/* Compatibility Badge */}
              <View style={styles.compatibilityBadge}>
                <FontAwesome name="heart" size={32} color={Colors.secondary} />
                <Text style={styles.compatibilityPercent}>85%</Text>
                <Text style={styles.compatibilityLabel}>Compatible</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsList}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'about' && (
              <View style={styles.contentSection}>
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>My perfect Sunday is...</Text>
                  <Text style={styles.contentText}>
                    Starting with a long hike, coming home to cook something new, and ending with a good book or deep conversation over wine.
                  </Text>
                </View>
                
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>Interests</Text>
                  <View style={styles.interestsContainer}>
                    {['Live Music', 'Philosophy', 'Photography', 'Hiking', 'Cooking'].map((interest) => (
                      <View key={interest} style={styles.interestBadge}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'quizzes' && (
              <View style={styles.contentCard}>
                <Text style={styles.emptyContentText}>Quiz results coming soon...</Text>
              </View>
            )}

            {activeTab === 'journal' && (
              <View style={styles.contentCard}>
                <Text style={styles.emptyContentText}>Journal entries coming soon...</Text>
              </View>
            )}

            {activeTab === 'vouches' && (
              <View style={styles.contentCard}>
                <Text style={styles.emptyContentText}>Vouches coming soon...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.messageButton}>
            <FontAwesome name="comment" size={20} color="#fff" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="comment-o" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="gift" size={20} color={Colors.primary} />
          </TouchableOpacity>
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
  headerSection: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    height: 400,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 8,
  },
  profileInfo: {
    paddingHorizontal: 24,
    marginTop: -32,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    marginBottom: 8,
  },
  profileLocation: {
    fontSize: 16,
    color: '#999',
    marginBottom: 16,
  },
  compatibilityBadge: {
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  compatibilityPercent: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000',
  },
  compatibilityLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  tabsContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabContent: {
    marginBottom: 100,
  },
  contentSection: {
    gap: 16,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestBadge: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  emptyContentText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 24,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  iconButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});

