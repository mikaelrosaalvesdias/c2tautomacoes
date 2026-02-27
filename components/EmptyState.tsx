import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-44 flex-col items-center justify-center gap-2 text-center">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
      </CardContent>
    </Card>
  );
}
