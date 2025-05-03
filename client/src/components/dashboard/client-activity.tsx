import { useQuery } from "@tanstack/react-query";
import { RefreshCw, BriefcaseBusiness, CheckCircle, Calendar, MessageSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";

const activityIcons: Record<string, any> = {
  "client-reply": <BriefcaseBusiness className="text-white text-xs" />,
  "approval": <CheckCircle className="text-white text-xs" />,
  "meeting-scheduled": <Calendar className="text-white text-xs" />,
  "information-request": <MessageSquare className="text-white text-xs" />,
  "issue-flagged": <AlertTriangle className="text-white text-xs" />
};

const activityColors: Record<string, string> = {
  "client-reply": "bg-primary-light",
  "approval": "bg-success",
  "meeting-scheduled": "bg-warning",
  "information-request": "bg-info",
  "issue-flagged": "bg-error"
};

export function ClientActivity() {
  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['/api/activities'],
  });

  return (
    <Card className="h-full">
      <CardHeader className="border-b border-neutral-200 p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium text-neutral-500">Recent Client Activity</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-primary">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
        <div className="relative">
          <div className="border-l-2 border-primary-light absolute h-full top-0 left-3"></div>
          
          {isLoading ? (
            Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="mb-4 ml-6 relative">
                <div className="absolute -left-9 mt-1 w-6 h-6 rounded-full bg-primary-light flex items-center justify-center">
                  <Skeleton className="h-3 w-3 rounded-full bg-white" />
                </div>
                <div className="bg-neutral-100 p-3 rounded-lg">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
            ))
          ) : activities && activities.length > 0 ? (
            activities.map((activity: any, idx: number) => (
              <div key={idx} className="mb-4 ml-6 relative">
                <div className={`absolute -left-9 mt-1 w-6 h-6 rounded-full ${activityColors[activity.type]} flex items-center justify-center`}>
                  {activityIcons[activity.type]}
                </div>
                <div className="bg-neutral-100 p-3 rounded-lg">
                  <p className="text-sm">{activity.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-neutral-400">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                    <Button variant="link" size="sm" className="text-xs p-0 h-auto text-primary">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-neutral-400">
              No recent activity to display
            </div>
          )}
        </div>
      </CardContent>
      <div className="border-t border-neutral-200 p-4">
        <Button variant="outline" className="text-primary w-full font-medium border-primary hover:bg-primary hover:bg-opacity-5">
          <RefreshCw className="h-4 w-4 mr-1" />
          View All Activity
        </Button>
      </div>
    </Card>
  );
}
