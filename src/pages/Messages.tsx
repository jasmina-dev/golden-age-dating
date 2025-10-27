import Layout from "@/components/Layout";
import { MessageSquare } from "lucide-react";

const Messages = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background px-6 pt-6">
        <h1 className="text-3xl font-black text-foreground mb-6">MESSAGES</h1>
        
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare size={64} className="text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">No messages yet</h2>
          <p className="text-muted-foreground">
            Start a conversation with someone you connect with
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
