import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProfileCard from "@/components/ProfileCard";
import FilterChip from "@/components/FilterChip";
import { Input } from "@/components/ui/input";
import { Search, Heart } from "lucide-react";

const Explore = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState(["Male", "Over 25", "Hiking"]);
  
  const mockProfiles = [
    {
      id: 1,
      name: "David",
      age: 33,
      compatibility: 92,
      interests: ["hiking", "ceramics"],
      verified: true,
    },
    {
      id: 2,
      name: "Sarah",
      age: 31,
      compatibility: 88,
      interests: ["indie films", "hiking", "cooking"],
      verified: true,
    },
    {
      id: 3,
      name: "Ben",
      age: 29,
      compatibility: 85,
      interests: ["live music", "philosophy", "photography"],
      verified: true,
    },
  ];

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background px-6 pt-6 pb-4 sticky top-0 z-10 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-black text-foreground tracking-tight">kindred</h1>
            <button 
              onClick={() => navigate("/profile")}
              className="bg-primary rounded-full p-3 shadow-soft hover:bg-primary/90 transition-colors"
            >
              <Heart size={24} className="text-primary-foreground fill-current" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              placeholder="men over 25 who like to hike"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-card text-card-foreground border-none shadow-card"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto mt-4 pb-2 scrollbar-hide">
            {activeFilters.map((filter) => (
              <FilterChip
                key={filter}
                label={filter}
                active
                onRemove={() => removeFilter(filter)}
              />
            ))}
            <FilterChip label="Add Filter" />
          </div>
        </div>

        {/* Profile Grid */}
        <div className="px-6 py-4 space-y-6">
          {mockProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              {...profile}
              onClick={() => navigate(`/profile/${profile.id}`)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Explore;
