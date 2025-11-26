import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Layout from '@/components/Layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

export default function Community() {
  const todaysPrompt = "What's something you learned about love this year?";
  
  const mockPosts = [
    {
      id: 1,
      userName: 'Alex M.',
      userAge: 28,
      content: "That it's not about finding someone perfect, but finding someone whose imperfections you can embrace. My partner's quirks are now the things I love most.",
      likes: 42,
      comments: 8,
    },
    {
      id: 2,
      userName: 'Jamie K.',
      userAge: 31,
      content: 'Love languages are real. Once I understood that my partner shows love through actions, not words, everything changed.',
      likes: 38,
      comments: 12,
    },
    {
      id: 3,
      userName: 'Sam T.',
      userAge: 26,
      content: "Sometimes the best thing you can do for love is to love yourself first. I spent this year working on me, and I'm finally ready to share that with someone else.",
      likes: 56,
      comments: 15,
    },
  ];

  return (
    <Layout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <Text style={styles.title}>Community Feed</Text>
          
          {/* Shared Prompt Card */}
          <View style={styles.promptCard}>
            <Text style={styles.promptLabel}>TODAY'S PROMPT</Text>
            <Text style={styles.promptText}>{todaysPrompt}</Text>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share Your Thoughts</Text>
            </TouchableOpacity>
          </View>

          {/* User Posts Feed */}
          <View style={styles.postsContainer}>
            {mockPosts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                {/* User Info */}
                <View style={styles.postHeader}>
                  <View style={styles.postAvatar} />
                  <View>
                    <Text style={styles.postUserName}>{post.userName}</Text>
                    <Text style={styles.postUserAge}>{post.userAge} years old</Text>
                  </View>
                </View>

                {/* Post Content */}
                <Text style={styles.postContent}>{post.content}</Text>

                {/* Interaction Bar */}
                <View style={styles.postInteractions}>
                  <TouchableOpacity style={styles.postInteraction}>
                    <FontAwesome name="heart" size={18} color={Colors.secondary} />
                    <Text style={styles.postInteractionText}>{post.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postInteraction}>
                    <FontAwesome name="comment" size={18} color={Colors.textLight} />
                    <Text style={styles.postInteractionText}>{post.comments}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  title: {
    fontSize: Typography.heading.fontSize.lg,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    marginBottom: 32,
    letterSpacing: Typography.heading.letterSpacing,
  },
  promptCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 28,
    marginBottom: 32,
    alignItems: 'center',
  },
  promptLabel: {
    fontSize: Typography.body.fontSize.xs,
    fontWeight: '500',
    color: Colors.background,
    opacity: 0.9,
    marginBottom: 12,
    fontFamily: Typography.body.fontFamily,
  },
  promptText: {
    fontSize: Typography.heading.fontSize.sm,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.background,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: Typography.heading.letterSpacing,
  },
  shareButton: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  shareButtonText: {
    fontSize: Typography.body.fontSize.md,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: Typography.body.fontFamily,
  },
  postsContainer: {
    gap: 20,
  },
  postCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
  },
  postUserName: {
    fontSize: Typography.heading.fontSize.xs,
    fontFamily: Typography.heading.fontFamily,
    color: Colors.text,
    letterSpacing: Typography.heading.letterSpacing,
  },
  postUserAge: {
    fontSize: Typography.body.fontSize.xs,
    color: Colors.textLight,
    fontFamily: Typography.body.fontFamily,
    marginTop: 2,
  },
  postContent: {
    fontSize: Typography.body.fontSize.md,
    fontFamily: Typography.body.fontFamily,
    color: Colors.text,
    lineHeight: Typography.body.lineHeight.md,
    marginBottom: 20,
  },
  postInteractions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  postInteraction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postInteractionText: {
    fontSize: Typography.body.fontSize.sm,
    fontWeight: '500',
    color: Colors.textMuted,
    fontFamily: Typography.body.fontFamily,
  },
});

