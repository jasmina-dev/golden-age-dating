// Simple mock local storage for user profiles
// Can be replaced with AsyncStorage or a real backend later

import { KindredUser } from '@/constants/UserData';

const STORAGE_KEY = 'kindred_users';
const CURRENT_USER_KEY = 'kindred_current_user';

// In-memory storage (mock)
let userStorage: KindredUser[] = [];
let currentUserId: string | null = null;

/**
 * Get all saved users
 */
export const getUsers = (): KindredUser[] => {
  try {
    // In a real app, this would read from AsyncStorage
    // For now, return in-memory storage
    return [...userStorage];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

/**
 * Save a new user profile or update existing one
 */
export const saveUser = (user: KindredUser): void => {
  try {
    // Check if user already exists
    const existingIndex = userStorage.findIndex((u) => u.id === user.id);
    
    if (existingIndex >= 0) {
      // Update existing user
      userStorage[existingIndex] = user;
      console.log('User updated successfully:', user);
    } else {
      // Add new user to in-memory storage
      userStorage.push(user);
      console.log('User saved successfully:', user);
    }
    
    // In a real app, this would save to AsyncStorage:
    // await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userStorage));
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

/**
 * Get a user by ID
 */
export const getUserById = (id: string): KindredUser | undefined => {
  return userStorage.find((user) => user.id === id);
};

/**
 * Clear all users (for testing/reset)
 */
export const clearUsers = (): void => {
  userStorage = [];
  currentUserId = null;
};

/**
 * Get the current user's ID
 */
export const getCurrentUserId = (): string | null => {
  return currentUserId;
};

/**
 * Set the current user's ID
 */
export const setCurrentUserId = (userId: string): void => {
  currentUserId = userId;
  // In a real app, this would save to AsyncStorage:
  // await AsyncStorage.setItem(CURRENT_USER_KEY, userId);
};

/**
 * Get the current user's profile
 */
export const getCurrentUser = (): KindredUser | null => {
  if (!currentUserId) {
    return null;
  }
  return getUserById(currentUserId) || null;
};

