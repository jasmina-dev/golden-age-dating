import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

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
  verified = true,
  onClick,
}: ProfileCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onClick}
      activeOpacity={0.9}
    >
      {/* Profile Image Placeholder */}
      <View style={styles.imageContainer}>
        {verified && (
          <View style={styles.verifiedBadge}>
            <FontAwesome name="check-circle" size={16} color="#000" />
          </View>
        )}
      </View>
      
      {/* Profile Info */}
      <View style={styles.infoSection}>
        <Text style={styles.name}>
          {name}, {age}
        </Text>

        {/* Compatibility Badge */}
        <View style={styles.compatibilityBadge}>
          <FontAwesome name="heart" size={20} color={Colors.secondary} />
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

        {/* View Profile Button */}
        <TouchableOpacity
          style={styles.viewButton}
          onPress={onClick}
          activeOpacity={0.8}
        >
          <Text style={styles.viewButtonText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    marginBottom: 16,
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 6,
  },
  infoSection: {
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderRadius: 16,
    padding: 16,
  },
  compatibilityText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
  },
  kindredText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
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
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    textTransform: 'capitalize',
  },
  viewButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

