import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface ActivityItem {
  id: number;
  type: 'sale' | 'comment' | 'user' | 'order';
  title: string;
  description: string;
  time: string;
  bgColor: string;
  iconColor: string;
  user: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    // Simple text indicator instead of icons for now
    switch (type) {
      case 'sale':
        return '💵';
      case 'comment':
        return '💬';
      case 'user':
        return '👤';
      case 'order':
        return '🛒';
      default:
        return '•';
    }
  };

  return (
    <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-900">
          Actividad Reciente
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Últimas acciones en tu negocio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <div className={`p-2 rounded-xl ${activity.bgColor} flex-shrink-0`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${activity.bgColor} text-lg`}>
                {getActivityIcon(activity.type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">
                  {activity.title}
                </p>
                <p className="text-xs text-slate-400">
                  {activity.time}
                </p>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {activity.description}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Por {activity.user}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
