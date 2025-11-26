import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Modal, Pressable, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Layout from '@/components/Layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { useTonightModeTimer } from '@/lib/useTonightModeTimer';
import { getCurrentUser } from '@/lib/storage';
import {
  TonightPlan,
  getActivePlans,
  createPlan,
  createJoinRequest,
  hasRequestedToJoin,
  initializeSamplePlans,
} from '@/constants/TonightPlans';
import { KindredUser } from '@/constants/UserData';

export default function Tonight() {
  const router = useRouter();
  const { isUnlocked, formattedCountdown } = useTonightModeTimer();
  const [isAvailable, setIsAvailable] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<KindredUser | null>(null);
  const [activePlans, setActivePlans] = useState<TonightPlan[]>([]);
  
  // Plan form state
  const [planType, setPlanType] = useState<string>('');
  const [locationName, setLocationName] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [guestSpots, setGuestSpots] = useState(1);
  
  // Initialize sample plans on mount
  useEffect(() => {
    initializeSamplePlans();
    loadActivePlans();
  }, []);
  
  // Load current user
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);
  
  // Load active plans
  const loadActivePlans = () => {
    setActivePlans(getActivePlans());
  };
  
  // Refresh plans periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadActivePlans();
    }, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Reset availability when feature locks
  useEffect(() => {
    if (!isUnlocked && isAvailable) {
      setIsAvailable(false);
      setShowPlanForm(false);
    }
  }, [isUnlocked, isAvailable]);
  
  // Handle toggle - show plan form when toggling on
  const handleToggle = (value: boolean) => {
    if (value) {
      setShowPlanForm(true);
    } else {
      setIsAvailable(false);
    }
  };
  
  // Handle plan creation
  const handleCreatePlan = () => {
    if (!currentUser) {
      Alert.alert('Error', 'Please set up your profile first');
      return;
    }
    
    if (!planType || !locationName || !meetingTime) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    // Validate meeting time is in the 7-9 PM window
    const timeMatch = meetingTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) {
      Alert.alert('Invalid Time', 'Please enter time in format like "7:30 PM" or "8:00 PM"');
      return;
    }
    
    const hours = parseInt(timeMatch[1], 10);
    const period = timeMatch[3].toUpperCase();
    
    // Convert to 24-hour format
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    
    if (hour24 < 19 || hour24 >= 21) {
      Alert.alert('Invalid Time', 'Meeting time must be between 7:00 PM and 9:00 PM');
      return;
    }
    
    // Create the plan
    const newPlan = createPlan({
      hostUserId: currentUser.id,
      hostName: currentUser.name,
      hostAge: currentUser.age,
      planType,
      locationName,
      meetingTime,
      guestSpots,
    });
    
    setIsAvailable(true);
    setShowPlanForm(false);
    
    // Reset form
    setPlanType('');
    setLocationName('');
    setMeetingTime('');
    setGuestSpots(1);
    
    loadActivePlans();
    
    Alert.alert('Success', 'Your plan has been created!');
  };
  
  // Handle join request
  const handleJoinPlan = (plan: TonightPlan) => {
    if (!currentUser) {
      Alert.alert('Error', 'Please set up your profile first');
      return;
    }
    
    if (plan.hostUserId === currentUser.id) {
      Alert.alert('Cannot Join', "You can't join your own plan");
      return;
    }
    
    if (hasRequestedToJoin(plan.id, currentUser.id)) {
      Alert.alert('Already Requested', 'You have already requested to join this plan');
      return;
    }
    
    if (plan.filledSpots >= plan.guestSpots) {
      Alert.alert('Plan Full', 'This plan is already full');
      return;
    }
    
    createJoinRequest(plan.id, currentUser.id, currentUser.name);
    Alert.alert('Request Sent', `Your request to join has been sent to ${plan.hostName}`);
    loadActivePlans();
  };
  
  const planTypes = [
    { id: 'Coffee', label: 'Coffee', icon: 'coffee' },
    { id: 'Live Music', label: 'Live Music', icon: 'music' },
    { id: 'A Walk', label: 'A Walk', icon: 'map-signs' },
    { id: 'Dinner', label: 'Dinner', icon: 'cutlery' },
  ];
  
  const timeOptions = ['7:00 PM', '7:15 PM', '7:30 PM', '7:45 PM', '8:00 PM', '8:15 PM', '8:30 PM', '8:45 PM'];

  return (
    <Layout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <Text style={styles.title}>Tonight Mode</Text>
          
          {/* Availability Toggle */}
          <View style={[styles.availabilityCard, !isUnlocked && styles.availabilityCardLocked]}>
            <View style={styles.availabilityHeader}>
              <View style={styles.availabilityHeaderLeft}>
                <Text style={[styles.availabilityTitle, !isUnlocked && styles.availabilityTitleLocked]}>
                  Available Tonight?
                </Text>
                {isUnlocked ? (
                  <Text style={styles.availabilitySubtitle}>
                    Create a plan and find spontaneous connections
                  </Text>
                ) : (
                  <Text style={styles.availabilitySubtitle}>
                    The Golden Hour: Available 7-9 PM
                  </Text>
                )}
              </View>
              {isUnlocked && (
              <Switch
                value={isAvailable}
                  onValueChange={handleToggle}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={isAvailable ? '#fff' : '#f4f3f4'}
              />
              )}
            </View>
            {!isUnlocked && (
              <View style={styles.countdownWrapper}>
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownText} numberOfLines={2} adjustsFontSizeToFit>
                    {formattedCountdown}
                        </Text>
                </View>
              </View>
            )}
          </View>

          {/* Plans Feed */}
          {isUnlocked && (
            <View style={styles.plansSection}>
              <Text style={styles.plansTitle}>Plans Feed</Text>
              {activePlans.length > 0 ? (
                <View style={styles.plansList}>
                  {activePlans
                    .filter((plan) => !currentUser || plan.hostUserId !== currentUser.id)
                    .map((plan) => {
                      const spotsLeft = plan.guestSpots - plan.filledSpots;
                      const hasRequested = currentUser ? hasRequestedToJoin(plan.id, currentUser.id) : false;
                      
                      return (
                        <View key={plan.id} style={styles.planCard}>
                          <View style={styles.planHeader}>
                            <View style={styles.planHeaderLeft}>
                              <Text style={styles.planHeadline}>
                                {plan.planType} with {plan.hostName}
                        </Text>
                              <Text style={styles.planDetails}>
                                {plan.locationName} at {plan.meetingTime}
                            </Text>
                          </View>
                        </View>
                          
                          {spotsLeft > 0 && (
                            <View style={styles.urgencyMeter}>
                              <Text style={styles.urgencyText}>
                                {spotsLeft === 1 ? '1 Guest Spot Left!' : `${spotsLeft} Guest Spots Left!`}
                              </Text>
                            </View>
                          )}
                          
                          {spotsLeft === 0 && (
                            <View style={styles.fullBadge}>
                              <Text style={styles.fullBadgeText}>Full</Text>
                            </View>
                          )}

                        <TouchableOpacity
                            style={[
                              styles.joinButton,
                              (spotsLeft === 0 || hasRequested) && styles.joinButtonDisabled,
                            ]}
                            onPress={() => handleJoinPlan(plan)}
                            disabled={spotsLeft === 0 || hasRequested}
                          >
                            <Text style={styles.joinButtonText}>
                              {hasRequested ? 'Request Sent' : 'Join'}
                            </Text>
                        </TouchableOpacity>
                      </View>
                      );
                    })}
                    </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    No active plans yet. Be the first to create one!
                  </Text>
                  </View>
              )}
            </View>
          )}

          {/* Empty State */}
          {!isUnlocked && (
            <View style={styles.emptyCard}>
              <FontAwesome name="clock-o" size={48} color={Colors.textLight} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>
                Tonight Mode is locked until The Golden Hour (7-9 PM). Come back then to find spontaneous connections!
              </Text>
            </View>
          )}
        </SafeAreaView>
      </ScrollView>
      
      {/* Plan Creation Modal */}
      <Modal
        visible={showPlanForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlanForm(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPlanForm(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Your Plan</Text>
              <TouchableOpacity
                onPress={() => setShowPlanForm(false)}
                style={styles.modalCloseButton}
              >
                <FontAwesome name="times" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* Plan Type */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Plan Type *</Text>
                <View style={styles.planTypesGrid}>
                  {planTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.planTypeButton,
                        planType === type.id && styles.planTypeButtonActive,
                      ]}
                      onPress={() => setPlanType(type.id)}
                    >
                      <FontAwesome
                        name={type.icon as any}
                        size={24}
                        color={planType === type.id ? '#fff' : '#000'}
                      />
                      <Text
                        style={[
                          styles.planTypeLabel,
                          planType === type.id && styles.planTypeLabelActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Location Name */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Location Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Barton Springs, The Local Coffee Shop"
                  value={locationName}
                  onChangeText={setLocationName}
                  placeholderTextColor="#999"
                />
              </View>
              
              {/* Meeting Time */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Meeting Time *</Text>
                <Text style={styles.formHint}>Must be between 7:00 PM - 9:00 PM</Text>
                <View style={styles.timeOptionsGrid}>
                  {timeOptions.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeOptionButton,
                        meetingTime === time && styles.timeOptionButtonActive,
                      ]}
                      onPress={() => setMeetingTime(time)}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          meetingTime === time && styles.timeOptionTextActive,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={[styles.textInput, styles.textInputSmall]}
                  placeholder="Or enter custom time (e.g., 7:30 PM)"
                  value={meetingTime}
                  onChangeText={setMeetingTime}
                  placeholderTextColor="#999"
                />
              </View>
              
              {/* Guest Spots */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Guest Spots *</Text>
                <View style={styles.guestSpotsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.guestSpotButton,
                      guestSpots === 1 && styles.guestSpotButtonActive,
                    ]}
                    onPress={() => setGuestSpots(1)}
                  >
                    <Text
                      style={[
                        styles.guestSpotText,
                        guestSpots === 1 && styles.guestSpotTextActive,
                      ]}
                    >
                      1 Guest
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.guestSpotButton,
                      guestSpots === 2 && styles.guestSpotButtonActive,
                    ]}
                    onPress={() => setGuestSpots(2)}
                  >
                    <Text
                      style={[
                        styles.guestSpotText,
                        guestSpots === 2 && styles.guestSpotTextActive,
                      ]}
                    >
                      2 Guests
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!planType || !locationName || !meetingTime) && styles.createButtonDisabled,
                ]}
                onPress={handleCreatePlan}
                disabled={!planType || !locationName || !meetingTime}
              >
                <Text style={styles.createButtonText}>Create Plan</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef8e6', // Golden background for Golden Hour theme
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
    color: '#b8860b', // Dark golden color for title
    marginBottom: 32,
    letterSpacing: Typography.heading.letterSpacing,
  },
  availabilityCard: {
    backgroundColor: '#fffef5', // Slightly golden-tinted white
    borderRadius: 24,
    padding: 28,
    marginBottom: 32,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f5e6b3',
  },
  availabilityCardLocked: {
    opacity: 0.6,
    backgroundColor: '#f8f8f8',
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  availabilityHeaderLeft: {
    flex: 1,
    minWidth: 0, // Allows text to shrink
  },
  countdownWrapper: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  availabilityTitle: {
    fontSize: Typography.heading.fontSize.sm,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: Typography.heading.letterSpacing,
  },
  availabilityTitleLocked: {
    color: Colors.textLight,
  },
  availabilitySubtitle: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
  },
  plansSection: {
    marginTop: 12,
  },
  plansTitle: {
    fontSize: Typography.heading.fontSize.xs,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    marginBottom: 20,
    letterSpacing: Typography.heading.letterSpacing,
  },
  plansList: {
    gap: 20,
  },
  planCard: {
    backgroundColor: '#fffef5',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f5e6b3',
  },
  planHeader: {
    marginBottom: 12,
  },
  planHeaderLeft: {
    flex: 1,
  },
  planHeadline: {
    fontSize: Typography.heading.fontSize.sm,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: Typography.heading.letterSpacing,
  },
  planDetails: {
    fontSize: Typography.body.fontSize.sm,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
  },
  urgencyMeter: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  urgencyText: {
    fontSize: Typography.body.fontSize.xs,
    fontWeight: '700',
    fontFamily: Typography.body.fontFamily,
    color: Colors.primary,
  },
  fullBadge: {
    backgroundColor: Colors.textLight + '40',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  fullBadgeText: {
    fontSize: Typography.body.fontSize.xs,
    fontWeight: '700',
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
  },
  joinButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  joinButtonText: {
    fontSize: Typography.body.fontSize.sm,
    fontWeight: '700',
    fontFamily: Typography.body.fontFamily,
    color: Colors.background,
  },
  emptyCard: {
    backgroundColor: '#fffef5',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f5e6b3',
  },
  emptyText: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: Typography.body.lineHeight.md,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  countdownContainer: {
    backgroundColor: '#d4af37', // Golden color
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start', // Align to left
  },
  countdownText: {
    fontSize: Typography.body.fontSize.xs,
    fontWeight: '700',
    fontFamily: Typography.body.fontFamily,
    color: '#fff',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: Typography.heading.fontSize.md,
    fontWeight: Typography.heading.fontWeight,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    letterSpacing: Typography.heading.letterSpacing,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    maxHeight: 500,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: Typography.body.fontSize.sm,
    fontWeight: '600',
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
    marginBottom: 8,
  },
  formHint: {
    fontSize: Typography.body.fontSize.xs,
    fontFamily: Typography.body.fontFamily,
    color: Colors.textLight,
    marginBottom: 12,
  },
  planTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  planTypeButton: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 8,
  },
  planTypeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  planTypeLabel: {
    fontSize: Typography.body.fontSize.sm,
    fontWeight: '600',
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
  },
  planTypeLabelActive: {
    color: Colors.background,
  },
  textInput: {
    backgroundColor: Colors.border + '40',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textInputSmall: {
    marginTop: 12,
  },
  timeOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  timeOptionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  timeOptionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeOptionText: {
    fontSize: Typography.body.fontSize.sm,
    fontWeight: '500',
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
  },
  timeOptionTextActive: {
    color: Colors.background,
  },
  guestSpotsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  guestSpotButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  guestSpotButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  guestSpotText: {
    fontSize: Typography.body.fontSize.md,
    fontWeight: '600',
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
  },
  guestSpotTextActive: {
    color: Colors.background,
  },
  modalFooter: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: Typography.body.fontSize.md,
    fontWeight: '700',
    fontFamily: Typography.body.fontFamily,
    color: Colors.background,
  },
});
