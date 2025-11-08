'use client';

import { UserProfile } from './types';

const USER_PROFILE_KEY = 'billharmony_user_profile';

export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return {};
  }
  
  try {
    const stored = localStorage.getItem(USER_PROFILE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading user profile:', error);
    return {};
  }
}

export function saveUserProfile(profile: Partial<UserProfile>): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const current = getUserProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

export function clearUserProfile(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(USER_PROFILE_KEY);
  } catch (error) {
    console.error('Error clearing user profile:', error);
  }
}

