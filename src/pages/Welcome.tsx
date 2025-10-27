import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-12 text-center">
        {/* Logo */}
        <div className="space-y-6">
          <h1 className="text-7xl font-black text-foreground tracking-tight">
            kindred
          </h1>
          <p className="text-xl font-bold text-foreground tracking-wide">
            DATING BEFORE THE SWIPE
          </p>
        </div>

        {/* Heart Button */}
        <div className="flex flex-col items-center gap-8">
          <Button
            onClick={() => navigate("/explore")}
            className="relative w-48 h-48 rounded-full bg-primary hover:bg-primary/90 shadow-soft transition-all hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart size={64} className="fill-current text-primary-foreground" />
              <span className="absolute text-2xl font-bold text-primary-foreground">
                SIGN UP
              </span>
            </div>
          </Button>

          {/* Input Fields (Placeholder) */}
          <div className="w-full space-y-4">
            <div className="bg-secondary/50 rounded-2xl h-12 w-full" />
            <div className="bg-secondary/50 rounded-2xl h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
