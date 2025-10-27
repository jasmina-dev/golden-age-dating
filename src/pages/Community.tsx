import Layout from "@/components/Layout";
import { Compass } from "lucide-react";

const Community = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background px-6 pt-6">
        <h1 className="text-3xl font-black text-foreground mb-6">COMMUNITY</h1>
        
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Compass size={64} className="text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Community Feed</h2>
          <p className="text-muted-foreground">
            Discover others through shared thoughts and philosophies
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Community;
