import { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: 'home', label: 'Explore', path: '/explore' },
  { icon: 'comment', label: 'Messages', path: '/messages' },
  { icon: 'compass', label: 'Community', path: '/community' },
  { icon: 'calendar', label: 'Tonight', path: '/tonight' },
  { icon: 'user', label: 'Profile', path: '/profile' },
];

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {children}
      </View>
      
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
                size={20}
                color={isActive ? Colors.primary : Colors.textLight}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingBottom: 80,
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 80,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingBottom: 20,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textLight,
  },
  navLabelActive: {
    color: Colors.primary,
  },
});

