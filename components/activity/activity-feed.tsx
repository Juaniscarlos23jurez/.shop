import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ActivityItem {
  id: string;
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
  const getTypeBadge = (type: ActivityItem['type']) => {
    const map: Record<ActivityItem['type'], { label: string; className: string }> = {
      sale: { label: 'Venta', className: 'bg-emerald-100 text-emerald-700' },
      order: { label: 'Orden', className: 'bg-blue-100 text-blue-700' },
      user: { label: 'Usuario', className: 'bg-purple-100 text-purple-700' },
      comment: { label: 'Anucio', className: 'bg-yellow-100 text-yellow-700' },
    };
    return map[type];
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
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-sm text-slate-500">No hay actividad reciente.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-3">Tipo</th>
                  <th className="py-2 px-3">Título</th>
                  <th className="py-2 px-3">Descripción</th>
                  <th className="py-2 px-3">Usuario</th>
                  <th className="py-2 px-3">Fecha/Hora</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, index) => {
                  const t = getTypeBadge(activity.type);
                  return (
                    <tr key={`${activity.id}-${index}`} className="border-b last:border-0">
                      <td className="py-2 px-3">
                        <span className="mr-1 align-middle">{getActivityIcon(activity.type)}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${t.className}`}>{t.label}</span>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">{activity.title}</td>
                      <td className="py-2 px-3 text-slate-600">{activity.description}</td>
                      <td className="py-2 px-3 text-slate-700">{activity.user}</td>
                      <td className="py-2 px-3 text-slate-500">{activity.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
