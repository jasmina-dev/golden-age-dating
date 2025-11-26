// Tonight Mode Plan Data Structure

export interface TonightPlan {
  id: string;
  hostUserId: string;
  hostName: string;
  hostAge?: number;
  planType: string; // e.g., "Coffee", "Live Music", "A Walk"
  locationName: string; // e.g., "Barton Springs", "The Local Coffee Shop"
  meetingTime: string; // e.g., "7:30 PM" or "8:00 PM"
  guestSpots: number; // Total guest spots (default 1, max 2)
  filledSpots: number; // Currently filled spots
  createdAt: number; // Timestamp
  status: 'active' | 'full' | 'expired'; // Plan status
}

export interface JoinRequest {
  id: string;
  planId: string;
  requesterUserId: string;
  requesterName: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: number;
}

// In-memory storage for plans (mock - replace with backend later)
let tonightPlans: TonightPlan[] = [];
let joinRequests: JoinRequest[] = [];

/**
 * Get all active plans
 */
export const getActivePlans = (): TonightPlan[] => {
  return tonightPlans.filter((plan) => plan.status === 'active' && plan.filledSpots < plan.guestSpots);
};

/**
 * Get plan by ID
 */
export const getPlanById = (planId: string): TonightPlan | undefined => {
  return tonightPlans.find((plan) => plan.id === planId);
};

/**
 * Create a new plan
 */
export const createPlan = (plan: Omit<TonightPlan, 'id' | 'createdAt' | 'status' | 'filledSpots'>): TonightPlan => {
  const newPlan: TonightPlan = {
    ...plan,
    id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    status: 'active',
    filledSpots: 0,
  };
  
  tonightPlans.push(newPlan);
  return newPlan;
};

/**
 * Update a plan
 */
export const updatePlan = (planId: string, updates: Partial<TonightPlan>): TonightPlan | null => {
  const index = tonightPlans.findIndex((plan) => plan.id === planId);
  if (index === -1) return null;
  
  tonightPlans[index] = { ...tonightPlans[index], ...updates };
  return tonightPlans[index];
};

/**
 * Delete a plan
 */
export const deletePlan = (planId: string): boolean => {
  const index = tonightPlans.findIndex((plan) => plan.id === planId);
  if (index === -1) return false;
  
  tonightPlans.splice(index, 1);
  // Also remove related join requests
  joinRequests = joinRequests.filter((req) => req.planId !== planId);
  return true;
};

/**
 * Create a join request
 */
export const createJoinRequest = (
  planId: string,
  requesterUserId: string,
  requesterName: string
): JoinRequest => {
  const newRequest: JoinRequest = {
    id: `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    planId,
    requesterUserId,
    requesterName,
    status: 'pending',
    createdAt: Date.now(),
  };
  
  joinRequests.push(newRequest);
  return newRequest;
};

/**
 * Get join requests for a plan
 */
export const getJoinRequestsForPlan = (planId: string): JoinRequest[] => {
  return joinRequests.filter((req) => req.planId === planId);
};

/**
 * Get join requests for a user (as host)
 */
export const getJoinRequestsForHost = (userId: string): JoinRequest[] => {
  const userPlanIds = tonightPlans
    .filter((plan) => plan.hostUserId === userId)
    .map((plan) => plan.id);
  
  return joinRequests.filter((req) => userPlanIds.includes(req.planId));
};

/**
 * Update join request status
 */
export const updateJoinRequestStatus = (
  requestId: string,
  status: 'approved' | 'declined'
): JoinRequest | null => {
  const request = joinRequests.find((req) => req.id === requestId);
  if (!request) return null;
  
  request.status = status;
  
  // If approved, increment filled spots
  if (status === 'approved') {
    const plan = getPlanById(request.planId);
    if (plan) {
      plan.filledSpots += 1;
      // Mark plan as full if all spots are filled
      if (plan.filledSpots >= plan.guestSpots) {
        plan.status = 'full';
      }
    }
  }
  
  return request;
};

/**
 * Get join requests for a user (as requester)
 */
export const getJoinRequestsForRequester = (userId: string): JoinRequest[] => {
  return joinRequests.filter((req) => req.requesterUserId === userId);
};

/**
 * Check if user has already requested to join a plan
 */
export const hasRequestedToJoin = (planId: string, userId: string): boolean => {
  return joinRequests.some(
    (req) => req.planId === planId && req.requesterUserId === userId && req.status === 'pending'
  );
};

/**
 * Clear all plans (for testing)
 */
export const clearAllPlans = (): void => {
  tonightPlans = [];
  joinRequests = [];
};

/**
 * Initialize with sample plans for testing
 */
export const initializeSamplePlans = (): void => {
  clearAllPlans();
  
  // Add some sample plans
  createPlan({
    hostUserId: '2', // Sarah
    hostName: 'Sarah',
    hostAge: 31,
    planType: 'Coffee',
    locationName: 'The Local Coffee Shop',
    meetingTime: '7:30 PM',
    guestSpots: 1,
  });
  
  createPlan({
    hostUserId: '3', // Michael
    hostName: 'Michael',
    hostAge: 28,
    planType: 'Live Music',
    locationName: 'The Continental Club',
    meetingTime: '8:00 PM',
    guestSpots: 2,
  });
  
  createPlan({
    hostUserId: '4', // Emma
    hostName: 'Emma',
    hostAge: 27,
    planType: 'A Walk',
    locationName: 'Barton Springs',
    meetingTime: '7:45 PM',
    guestSpots: 1,
  });
};

