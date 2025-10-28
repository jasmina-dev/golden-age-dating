import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, ArrowLeft, Shield, Lightbulb } from "lucide-react";

const Messages = () => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const mockChats = [
    {
      id: 1,
      name: "Sarah",
      lastMessage: "That sounds amazing! I'd love to...",
      time: "2m ago",
      rating: 4.8,
      unread: true
    },
    {
      id: 2,
      name: "David",
      lastMessage: "Thanks for the recommendation!",
      time: "1h ago",
      rating: 4.9,
      unread: false
    }
  ];

  const icebreakers = [
    "Ask about their favorite indie film!",
    "What got them into hiking?",
    "Their thoughts on living in Austin?"
  ];

  if (selectedChat) {
    const chat = mockChats.find(c => c.id === selectedChat);
    
    return (
      <Layout>
        <div className="min-h-screen bg-background flex flex-col">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border bg-card">
            <div className="flex items-center gap-4 mb-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="bg-background rounded-full p-2"
              >
                <ArrowLeft size={20} className="text-foreground" />
              </button>
              <div className="flex-1">
                <h2 className="text-xl font-black text-foreground">{chat?.name}</h2>
              </div>
            </div>
            
            {/* Respect Meter */}
            <div className="flex items-center gap-2 bg-accent/5 rounded-2xl px-4 py-2">
              <Shield size={16} className="text-accent" />
              <span className="text-sm font-medium text-accent">
                Community Rating: {chat?.rating}/5.0
              </span>
            </div>
          </div>

          {/* AI Icebreakers */}
          <div className="px-6 py-4 bg-primary/5 border-b border-primary/20">
            <div className="flex items-start gap-2">
              <Lightbulb size={16} className="text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Suggested conversation starters:
                </p>
                <div className="flex flex-wrap gap-2">
                  {icebreakers.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setMessage(suggestion)}
                      className="text-xs bg-card hover:bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/30 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex justify-start">
                <div className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 max-w-[75%] shadow-card">
                  <p className="text-card-foreground">Hey! I saw we both love hiking. Have you done any trails around Austin?</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%] shadow-soft">
                  <p className="text-primary-foreground">Yes! Barton Creek Greenbelt is my favorite. The waterfalls are gorgeous this time of year.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Input Bar */}
          <div className="px-6 py-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-2xl h-12"
              />
              <Button className="rounded-2xl px-6 h-12 font-bold">
                Send
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background px-6 pt-6">
        <h1 className="text-3xl font-black text-foreground mb-6">Messages</h1>
        
        {mockChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MessageSquare size={64} className="text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No messages yet</h2>
            <p className="text-muted-foreground">
              Start a conversation with someone you connect with
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className="w-full bg-card rounded-2xl p-4 shadow-card hover:shadow-soft transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-warm rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-black text-card-foreground">{chat.name}</h3>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Messages;
