import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, MessageSquare, Compass, Calendar, User } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { icon: Home, label: "Explore", path: "/explore" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: Compass, label: "Community", path: "/community" },
    { icon: Calendar, label: "Tonight", path: "/tonight" },
    { icon: User, label: "Profile", path: "/profile" },
  ];
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-20">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
