import Layout from "@/components/Layout";
import { Heart, MessageCircle } from "lucide-react";

const Community = () => {
  const todaysPrompt = "What's something you learned about love this year?";
  
  const mockPosts = [
    {
      id: 1,
      userName: "Alex M.",
      userAge: 28,
      content: "That it's not about finding someone perfect, but finding someone whose imperfections you can embrace. My partner's quirks are now the things I love most.",
      likes: 42,
      comments: 8
    },
    {
      id: 2,
      userName: "Jamie K.",
      userAge: 31,
      content: "Love languages are real. Once I understood that my partner shows love through actions, not words, everything changed.",
      likes: 38,
      comments: 12
    },
    {
      id: 3,
      userName: "Sam T.",
      userAge: 26,
      content: "Sometimes the best thing you can do for love is to love yourself first. I spent this year working on me, and I'm finally ready to share that with someone else.",
      likes: 56,
      comments: 15
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-6">
        <div className="px-6 pt-6">
          <h1 className="text-3xl font-black text-foreground mb-6">Community Feed</h1>
          
          {/* Shared Prompt Card */}
          <div className="bg-primary rounded-3xl p-6 shadow-soft mb-6">
            <div className="text-center">
              <p className="text-sm font-medium text-primary-foreground/80 mb-2">
                TODAY'S PROMPT
              </p>
              <h2 className="text-xl font-black text-primary-foreground mb-4">
                {todaysPrompt}
              </h2>
              <button className="bg-card hover:bg-card/90 text-primary px-6 py-3 rounded-2xl font-bold transition-colors">
                Share Your Thoughts
              </button>
            </div>
          </div>

          {/* User Posts Feed */}
          <div className="space-y-4">
            {mockPosts.map((post) => (
              <div key={post.id} className="bg-card rounded-2xl p-5 shadow-card">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-warm rounded-full flex-shrink-0" />
                  <div>
                    <h3 className="font-black text-card-foreground">
                      {post.userName}
                    </h3>
                    <p className="text-xs text-muted-foreground">{post.userAge} years old</p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-card-foreground mb-4 leading-relaxed">
                  {post.content}
                </p>

                {/* Interaction Bar */}
                <div className="flex items-center gap-4 pt-3 border-t border-border">
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Heart size={18} />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle size={18} />
                    <span className="text-sm font-medium">{post.comments}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Community;
