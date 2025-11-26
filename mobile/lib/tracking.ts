// Event Tracking System
// Tracks high-intent user actions like Profile Reveal

export type TrackingEvent = 
  | { type: 'profile_reveal'; userId: string; timestamp: number }
  | { type: 'profile_view'; userId: string; timestamp: number }
  | { type: 'vouch_shared'; userId: string; timestamp: number };

/**
 * Track a Profile Reveal event
 * This is a high-intent event that measures commitment to compatibility
 */
export const trackProfileReveal = (userId: string): void => {
  const event: TrackingEvent = {
    type: 'profile_reveal',
    userId,
    timestamp: Date.now(),
  };
  
  // Log the event (in production, this would send to analytics service)
  console.log('[TRACKING] Profile Reveal:', event);
  
  // In a real app, this would send to analytics:
  // analytics.track('profile_reveal', {
  //   userId,
  //   timestamp: Date.now(),
  //   event_type: 'high_intent',
  // });
};

/**
 * Track other events (for future use)
 */
export const trackEvent = (event: TrackingEvent): void => {
  console.log('[TRACKING]', event);
  
  // In a real app, this would send to analytics:
  // analytics.track(event.type, event);
};

