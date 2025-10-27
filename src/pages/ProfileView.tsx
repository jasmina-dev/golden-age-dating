import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, MessageSquare, Gift, MessageCircle } from "lucide-react";

const ProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-6">
        {/* Header with Back Button */}
        <div className="relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 z-10 bg-card rounded-full p-3 shadow-card"
          >
            <ArrowLeft size={20} className="text-card-foreground" />
          </button>

          {/* Profile Header */}
          <div className="relative h-[400px] bg-gradient-warm">
            {/* Profile Image Placeholder */}
            <div className="absolute inset-0" />
            
            {/* Verification Badge */}
            <div className="absolute top-6 right-6 bg-primary rounded-full p-2">
              <CheckCircle2 size={20} className="text-primary-foreground" />
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 -mt-8">
            <div className="bg-card rounded-3xl p-6 shadow-soft">
              <h1 className="text-3xl font-black text-card-foreground mb-2">
                Ben, 29
              </h1>
              <p className="text-muted-foreground mb-4">3.9a, Austin, TX</p>
              
              {/* Compatibility Badge */}
              <div className="bg-primary/10 rounded-2xl p-6 text-center mb-4">
                <div className="text-5xl font-black text-primary mb-2">85%</div>
                <div className="text-lg font-bold text-card-foreground">Compatible</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 mt-6">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full bg-card rounded-2xl p-1 mb-6">
              <TabsTrigger value="about" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                About Me
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Quizzes
              </TabsTrigger>
              <TabsTrigger value="journal" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Journal
              </TabsTrigger>
              <TabsTrigger value="vouches" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Vouches
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-4">
              <div className="bg-card rounded-2xl p-6">
                <h3 className="font-bold text-card-foreground mb-3">My perfect Sunday is...</h3>
                <p className="text-card-foreground/80">
                  Starting with a long hike, coming home to cook something new, and ending with a good book or deep conversation over wine.
                </p>
              </div>
              
              <div className="bg-card rounded-2xl p-6">
                <h3 className="font-bold text-card-foreground mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {["Live Music", "Philosophy", "Photography", "Hiking", "Cooking"].map((interest) => (
                    <Badge key={interest} variant="secondary" className="rounded-full">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quizzes">
              <div className="bg-card rounded-2xl p-6 text-center text-muted-foreground">
                Quiz results coming soon...
              </div>
            </TabsContent>

            <TabsContent value="journal">
              <div className="bg-card rounded-2xl p-6 text-center text-muted-foreground">
                Journal entries coming soon...
              </div>
            </TabsContent>

            <TabsContent value="vouches">
              <div className="bg-card rounded-2xl p-6 text-center text-muted-foreground">
                Vouches coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-20 left-0 right-0 px-6">
          <div className="max-w-md mx-auto bg-card rounded-3xl p-4 shadow-soft flex gap-3">
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-14 font-bold">
              <MessageSquare className="mr-2" size={20} />
              Message
            </Button>
            <Button variant="outline" className="rounded-2xl h-14 px-6 border-2 border-primary text-primary">
              <MessageCircle size={20} />
            </Button>
            <Button variant="outline" className="rounded-2xl h-14 px-6 border-2 border-primary text-primary">
              <Gift size={20} />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileView;
