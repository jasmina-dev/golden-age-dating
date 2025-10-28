import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coffee, Music, Footprints, UtensilsCrossed, MapPin, Clock } from "lucide-react";

const Tonight = () => {
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: "coffee", label: "Coffee", icon: Coffee },
    { id: "music", label: "Live Music", icon: Music },
    { id: "walk", label: "A Walk", icon: Footprints },
    { id: "dinner", label: "Dinner", icon: UtensilsCrossed }
  ];

  const mockMatches = [
    {
      id: 1,
      name: "Emma",
      age: 27,
      distance: "2.3 miles away",
      category: "coffee",
      availability: "Available 6-8pm"
    },
    {
      id: 2,
      name: "Lucas",
      age: 29,
      distance: "1.8 miles away",
      category: "coffee",
      availability: "Available 7-9pm"
    },
    {
      id: 3,
      name: "Olivia",
      age: 26,
      distance: "3.1 miles away",
      category: "coffee",
      availability: "Available now"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-6">
        <div className="px-6 pt-6">
          <h1 className="text-3xl font-black text-foreground mb-6">Tonight Mode</h1>
          
          {/* Availability Toggle */}
          <div className="bg-card rounded-3xl p-6 shadow-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-card-foreground mb-1">
                  Available Tonight?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Find spontaneous connections near you
                </p>
              </div>
              <Switch
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {/* Category Selection */}
            {isAvailable && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  What kind of date?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground shadow-soft"
                            : "bg-card border-primary/30 text-card-foreground hover:border-primary/50"
                        }`}
                      >
                        <Icon size={24} className="mx-auto mb-2" />
                        <p className="text-sm font-bold">{category.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Local Matches Feed */}
          {isAvailable && selectedCategory && (
            <div>
              <h3 className="text-lg font-black text-foreground mb-4">
                Available Near You
              </h3>
              <div className="space-y-4">
                {mockMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-card rounded-2xl p-5 shadow-card"
                  >
                    <div className="flex gap-4">
                      {/* Profile Photo */}
                      <div className="w-20 h-20 bg-gradient-warm rounded-2xl flex-shrink-0" />
                      
                      {/* Match Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-black text-card-foreground mb-1">
                          {match.name}, {match.age}
                        </h4>
                        
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin size={14} />
                            <span>{match.distance}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-accent font-medium">
                            <Clock size={14} />
                            <span>{match.availability}</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => navigate(`/profile/${match.id}`)}
                          className="w-full rounded-2xl h-10 font-bold text-sm"
                        >
                          Propose a Time
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isAvailable && (
            <div className="bg-card rounded-2xl p-8 text-center">
              <p className="text-muted-foreground">
                Toggle "Available Tonight" to see local matches ready to meet up spontaneously.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Tonight;
