import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

interface ComplianceItem {
  name: string;
  percentage: number;
  status: "success" | "warning" | "error" | "info";
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "success":
      return "text-success";
    case "warning":
      return "text-warning";
    case "error":
      return "text-error";
    case "info":
      return "text-info";
    default:
      return "text-neutral-500";
  }
};

const getProgressColor = (status: string): string => {
  switch (status) {
    case "success":
      return "bg-success";
    case "warning":
      return "bg-warning";
    case "error":
      return "bg-error";
    case "info":
      return "bg-info";
    default:
      return "bg-neutral-500";
  }
};

export function ComplianceStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/compliance'],
  });

  const compliance: ComplianceItem[] = data?.compliance || [];
  const alert = data?.alert;
  
  return (
    <Card className="shadow">
      <CardHeader className="border-b border-neutral-200 p-4">
        <CardTitle className="text-lg font-medium text-neutral-500">Compliance Status</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          Array(4).fill(0).map((_, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <div className="h-4 w-32 bg-neutral-100 rounded-full animate-pulse"></div>
                <div className="h-4 w-8 bg-neutral-100 rounded-full animate-pulse"></div>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full">
                <div className="h-2 bg-neutral-200 rounded-full animate-pulse" style={{ width: "50%" }}></div>
              </div>
            </div>
          ))
        ) : (
          <>
            {compliance.map((item, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-neutral-500">{item.name}</span>
                  <span className={`text-xs ${getStatusColor(item.status)}`}>
                    {item.percentage}%
                  </span>
                </div>
                <Progress 
                  value={item.percentage} 
                  max={100} 
                  className="h-2 bg-neutral-100"
                >
                  <div 
                    className={`h-full ${getProgressColor(item.status)} rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </Progress>
              </div>
            ))}

            {alert && (
              <Alert className="mt-4 bg-warning bg-opacity-10 border border-warning border-opacity-20">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertTitle className="text-sm font-medium text-neutral-500">{alert.title}</AlertTitle>
                <AlertDescription className="text-xs text-neutral-400 mt-1">
                  {alert.message}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
