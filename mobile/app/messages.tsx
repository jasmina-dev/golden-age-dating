import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Layout from '@/components/Layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

export default function Messages() {
  const router = useRouter();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const mockChats = [
    {
      id: 1,
      name: 'Sarah',
      lastMessage: "That sounds amazing! I'd love to...",
      time: '2m ago',
      rating: 4.8,
      unread: true,
    },
    {
      id: 2,
      name: 'David',
      lastMessage: 'Thanks for the recommendation!',
      time: '1h ago',
      rating: 4.9,
      unread: false,
    },
  ];

  const icebreakers = [
    "Ask about their favorite indie film!",
    "What got them into hiking?",
    "Their thoughts on living in Austin?",
  ];

  if (selectedChat) {
    const chat = mockChats.find((c) => c.id === selectedChat);

    return (
      <Layout>
        <View style={styles.chatContainer}>
          {/* Header */}
          <SafeAreaView edges={['top']} style={styles.chatHeader}>
            <View style={styles.chatHeaderTop}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedChat(null)}
              >
                <FontAwesome name="arrow-left" size={20} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.chatName}>{chat?.name}</Text>
            </View>

            {/* Respect Meter */}
            <View style={styles.ratingContainer}>
              <FontAwesome name="shield" size={16} color={Colors.primary} />
              <Text style={styles.ratingText}>
                Community Rating: {chat?.rating}/5.0
              </Text>
            </View>
          </SafeAreaView>

          {/* AI Icebreakers */}
          <View style={styles.icebreakersContainer}>
            <FontAwesome name="lightbulb-o" size={16} color={Colors.primary} style={styles.icebreakerIcon} />
            <View style={styles.icebreakersContent}>
              <Text style={styles.icebreakersLabel}>
                Suggested conversation starters:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.icebreakersList}>
                  {icebreakers.map((suggestion, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.icebreakerChip}
                      onPress={() => setMessage(suggestion)}
                    >
                      <Text style={styles.icebreakerText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Chat Messages */}
          <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
            <View style={styles.messageLeft}>
              <View style={styles.messageBubbleLeft}>
                <Text style={styles.messageTextLeft}>
                  Hey! I saw we both love hiking. Have you done any trails around Austin?
                </Text>
              </View>
            </View>
            <View style={styles.messageRight}>
              <View style={styles.messageBubbleRight}>
                <Text style={styles.messageTextRight}>
                  Yes! Barton Creek Greenbelt is my favorite. The waterfalls are gorgeous this time of year.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              style={styles.input}
              placeholderTextColor="#999"
              multiline
            />
            <TouchableOpacity style={styles.sendButton}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
        </View>

        {mockChats.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="comment" size={64} color="#999" />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              Start a conversation with someone you connect with
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.chatsList} contentContainerStyle={styles.chatsContent}>
            {mockChats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={styles.chatItem}
                onPress={() => setSelectedChat(chat.id)}
                activeOpacity={0.7}
              >
                <View style={styles.chatAvatar} />
                <View style={styles.chatInfo}>
                  <View style={styles.chatInfoTop}>
                    <Text style={styles.chatItemName}>{chat.name}</Text>
                    <Text style={styles.chatTime}>{chat.time}</Text>
                  </View>
                  <Text style={styles.chatLastMessage} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                </View>
                {chat.unread && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  chatsList: {
    flex: 1,
  },
  chatsContent: {
    gap: 12,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
  },
  chatInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatItemName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  chatLastMessage: {
    fontSize: 14,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  chatHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
  },
  chatName: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  icebreakersContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  icebreakerIcon: {
    marginTop: 4,
  },
  icebreakersContent: {
    flex: 1,
  },
  icebreakersLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    marginBottom: 8,
  },
  icebreakersList: {
    flexDirection: 'row',
    gap: 8,
  },
  icebreakerChip: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  icebreakerText: {
    fontSize: 12,
    color: Colors.text,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 24,
    gap: 16,
  },
  messageLeft: {
    alignItems: 'flex-start',
  },
  messageBubbleLeft: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 16,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageTextLeft: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  messageRight: {
    alignItems: 'flex-end',
  },
  messageBubbleRight: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    borderTopRightRadius: 4,
    padding: 16,
    maxWidth: '75%',
  },
  messageTextRight: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

