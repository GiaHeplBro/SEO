import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
    label: string;
  };
  icon: React.ReactNode;
  iconBgColor: string;
}

export function MetricCard({
  title,
  value,
  trend,
  icon,
  iconBgColor,
}: MetricCardProps) {
  return (
    <Card className="card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral-400 text-sm">{title}</p>
            <h3 className="text-2xl font-medium text-neutral-500 mt-1">{value}</h3>
            {trend && (
              <p 
                className={`text-xs flex items-center mt-2 ${
                  trend.direction === "up" 
                    ? "text-success" 
                    : trend.direction === "down" 
                    ? "text-error" 
                    : "text-neutral-400"
                }`}
              >
                {trend.direction === "up" ? (
                  <ArrowUp className="mr-1 h-3 w-3" />
                ) : trend.direction === "down" ? (
                  <ArrowDown className="mr-1 h-3 w-3" />
                ) : null}
                {trend.value} {trend.label}
              </p>
            )}
          </div>
          <div className={`${iconBgColor} bg-opacity-10 p-2 rounded-full`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
