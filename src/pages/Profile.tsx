import Layout from "@/components/Layout";
import { User } from "lucide-react";

const Profile = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background px-6 pt-6">
        <h1 className="text-3xl font-black text-foreground mb-6">MY PROFILE</h1>
        
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <User size={64} className="text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Your Profile</h2>
          <p className="text-muted-foreground">
            Build your authentic profile
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
