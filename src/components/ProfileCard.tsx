import { Badge } from "./ui/badge";
import { CheckCircle2 } from "lucide-react";

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
      {/* Profile Image Placeholder */}
      <div className="relative w-full aspect-[3/4] bg-gradient-warm rounded-2xl mb-4 overflow-hidden">
        {image && <img src={image} alt={name} className="w-full h-full object-cover" />}
        {verified && (
          <div className="absolute top-3 right-3 bg-primary rounded-full p-1">
            <CheckCircle2 size={16} className="text-primary-foreground" />
          </div>
        )}
      </div>
      
      {/* Profile Info */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-2xl font-bold text-card-foreground">
            {name}, {age}
          </h3>
          <span className="text-lg font-bold text-primary">
            {compatibility}% kindred spirit
          </span>
        </div>
        
        {/* Interests */}
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
            >
              {interest}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
