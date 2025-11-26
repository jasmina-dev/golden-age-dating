import { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';

interface LayoutProps {
  children: ReactNode;
}

// Navigation items with correct icons: Compass (active/gold), Color Wheel, Chat Bubble, Profile User
const navItems = [
  { icon: 'compass', label: 'Explore', path: '/explore' },
  { icon: 'paint-brush', label: 'Community', path: '/community' }, // Color Wheel alternative (paint brush/palette)
  { icon: 'comment', label: 'Messages', path: '/messages' },
  { icon: 'user', label: 'Profile', path: '/profile' },
];

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Floating Pill-Shaped Navigation Bar - Glassmorphism */}
      <View style={styles.navBarContainer}>
        <BlurView intensity={80} tint="light" style={styles.navBarBlur}>
          <View style={styles.navBar}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <TouchableOpacity
                  key={item.path}
                  onPress={() => router.push(item.path)}
                  style={styles.navItem}
                  activeOpacity={0.7}
                >
                  <FontAwesome
                    name={item.icon as any}
                    size={22}
                    color={isActive ? Colors.coral : Colors.textLight}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Warm off-white (sand tone)
  },
  content: {
    flex: 1,
    paddingBottom: 100, // Extra padding for floating nav bar
  },
  navBarContainer: {
    position: 'absolute',
    bottom: 20, // Floating above bottom edge
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navBarBlur: {
    borderRadius: 30, // Pill/capsule shape
    overflow: 'hidden',
    backgroundColor: Colors.navBarBackground, // Frosted white glass
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

