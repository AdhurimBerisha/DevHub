import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Post, Tag } from "@/types/Types";

export type SortOption = {
  id: string;
  label: string;
  value: string;
};

export type FilterCategory = {
  id: string;
  label: string;
  options: SortOption[];
};

interface FilterSortProps {
  categories: FilterCategory[];
  activeSort: string;
  onSortChange: (sortValue: string) => void;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function FilterSort({
  categories,
  activeSort,
  onSortChange,
  className,
  variant = "outline",
  size = "default",
}: FilterSortProps) {
  const getActiveLabel = () => {
    for (const category of categories) {
      const option = category.options.find((opt) => opt.value === activeSort);
      if (option) return option.label;
    }
    return "Sort by";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
        >
          {getActiveLabel()}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {categories.map((category, index) => (
          <div key={category.id}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase">
              {category.label}
            </DropdownMenuLabel>
            {category.options.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => onSortChange(option.value)}
                className={cn(
                  "cursor-pointer",
                  activeSort === option.value &&
                    "bg-accent text-accent-foreground"
                )}
              >
                <span className="flex-1">{option.label}</span>
                {activeSort === option.value && (
                  <span className="ml-2 text-xs">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const POST_SORT_OPTIONS: FilterCategory[] = [
  {
    id: "trending",
    label: "Trending",
    options: [
      { id: "most-liked", label: "Most Liked", value: "most-liked" },
      {
        id: "most-commented",
        label: "Most Commented",
        value: "most-commented",
      },
    ],
  },
  {
    id: "time",
    label: "Time",
    options: [
      { id: "newest", label: "Newest First", value: "newest" },
      { id: "oldest", label: "Oldest First", value: "oldest" },
    ],
  },
];

export const TAG_SORT_OPTIONS: FilterCategory[] = [
  {
    id: "popularity",
    label: "Popularity",
    options: [
      { id: "most-posts", label: "Most Posts", value: "most-posts" },
      { id: "least-posts", label: "Least Posts", value: "least-posts" },
    ],
  },
  {
    id: "alphabetical",
    label: "Alphabetical",
    options: [
      { id: "a-z", label: "A to Z", value: "a-z" },
      { id: "z-a", label: "Z to A", value: "z-a" },
    ],
  },
];

export function sortPosts(posts: Post[], sortValue: string): Post[] {
  const sorted = [...posts];

  switch (sortValue) {
    case "most-liked":
      return sorted.sort((a, b) => {
        const aLikes = a.votes?.filter((v) => v.value === 1).length || 0;
        const bLikes = b.votes?.filter((v) => v.value === 1).length || 0;
        return bLikes - aLikes;
      });

    case "most-commented":
      return sorted.sort(
        (a, b) => (b.commentCount || 0) - (a.commentCount || 0)
      );

    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    default:
      return sorted;
  }
}

export function sortTags(tags: Tag[], sortValue: string): Tag[] {
  const sorted = [...tags];

  switch (sortValue) {
    case "most-posts":
      return sorted.sort((a, b) => (b.postCount || 0) - (a.postCount || 0));

    case "least-posts":
      return sorted.sort((a, b) => (a.postCount || 0) - (b.postCount || 0));

    case "a-z":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case "z-a":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));

    default:
      return sorted;
  }
}
