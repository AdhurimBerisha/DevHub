import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SidebarCardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
  sticky?: boolean;
  className?: string;
}

export function SidebarCard({
  icon: Icon,
  title,
  description,
  children,
  sticky = false,
  className = "",
}: SidebarCardProps) {
  const content = (
    <Card className={className}>
      <CardContent className="p-4">
        {(Icon || title) && (
          <div className="flex items-center gap-2 mb-3">
            {Icon && <Icon className="h-5 w-5 text-primary" />}
            <h2 className="font-bold">{title}</h2>
          </div>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        {children}
      </CardContent>
    </Card>
  );

  if (sticky) {
    return <div className="sticky top-20">{content}</div>;
  }

  return content;
}

