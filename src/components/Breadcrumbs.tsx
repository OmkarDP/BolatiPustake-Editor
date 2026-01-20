import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  id: string;
  name: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  onNavigate: (id: string) => void;
};

export const Breadcrumbs = ({ items, onNavigate }: BreadcrumbsProps) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 py-1">
        <span>Select a folder to browse</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm overflow-x-auto px-2 py-1">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onNavigate(item.id)}
            className={cn(
              "hover:text-primary transition-colors",
              index === items.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            {item.name}
          </button>
          {index < items.length - 1 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  );
};
