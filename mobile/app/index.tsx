import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <Text style={styles.logo}>kindred</Text>
            <Text style={styles.tagline}>DATING BEFORE THE SWIPE</Text>
          </View>

          {/* Heart Button */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.heartButton}
              onPress={() => router.push('/explore')}
              activeOpacity={0.8}
            >
              <View style={styles.heartButtonContent}>
                <FontAwesome name="heart" size={64} color={Colors.secondary} />
                <Text style={styles.signUpText}>SIGN UP</Text>
              </View>
            </TouchableOpacity>

            {/* Input Fields (Placeholder) */}
            <View style={styles.inputPlaceholders}>
              <View style={styles.inputPlaceholder} />
              <View style={styles.inputPlaceholder} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 56,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
    marginBottom: 24,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  buttonSection: {
    width: '100%',
    alignItems: 'center',
    gap: 32,
  },
  heartButton: {
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  heartButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 80,
  },
  inputPlaceholders: {
    width: '100%',
    gap: 16,
  },
  inputPlaceholder: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
});

