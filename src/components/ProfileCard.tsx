import { Badge } from "./ui/badge";
import { CheckCircle2, Heart } from "lucide-react";
import { Button } from "./ui/button";

interface ProfileCardProps {
  name: string;
  age: number;
  compatibility: number;
  interests: string[];
  image?: string;
  verified?: boolean;
  onClick?: () => void;
}

const ProfileCard = ({
  name,
  age,
  compatibility,
  interests,
  image,
  verified = true,
  onClick,
}: ProfileCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-3xl p-6 shadow-card cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="relative w-full aspect-[3/4] bg-gradient-warm rounded-2xl mb-4 overflow-hidden">
        {image && <img src={image} alt={name} className="w-full h-full object-cover" />}
        {verified && (
          <div className="absolute top-3 right-3 bg-card rounded-full p-1.5 shadow-soft">
            <CheckCircle2 size={16} className="text-primary" />
          </div>
        )}
      </div>
      
      {/* Profile Info */}
      <div className="space-y-3">
        <h3 className="text-2xl font-black text-card-foreground">
          {name}, {age}
        </h3>

        {/* Compatibility Badge - Prominent */}
        <div className="bg-accent/5 border-2 border-accent rounded-2xl p-4 flex items-center justify-center gap-2">
          <Heart size={20} className="text-accent fill-accent" />
          <div className="text-3xl font-black text-accent">{compatibility}%</div>
          <span className="text-sm font-bold text-accent">Kindred Match</span>
        </div>
        
        {/* Interests */}
        <div className="flex flex-wrap gap-2">
          {interests.slice(0, 3).map((interest, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="rounded-full capitalize"
            >
              {interest}
            </Badge>
          ))}
        </div>

        {/* View Profile Button */}
        <Button 
          className="w-full rounded-2xl font-bold"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default ProfileCard;
