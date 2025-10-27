import { X } from "lucide-react";
import { Badge } from "./ui/badge";

interface FilterChipProps {
  label: string;
  onRemove?: () => void;
  active?: boolean;
}

const FilterChip = ({ label, onRemove, active = false }: FilterChipProps) => {
  return (
    <Badge
      variant={active ? "default" : "secondary"}
      className={`
        rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap
        flex items-center gap-2 transition-all cursor-pointer
        ${active 
          ? "bg-primary text-primary-foreground" 
          : "bg-card text-card-foreground hover:bg-secondary"
        }
      `}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70"
        >
          <X size={14} />
        </button>
      )}
    </Badge>
  );
};

export default FilterChip;
