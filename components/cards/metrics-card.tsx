import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Simple icon mapping
const iconMap = {
  'dollar': '💵',
  'users': '👥',
  'shopping-cart': '🛒',
  'message-square': '💬',
  'star': '⭐',
  'arrow-up': '↑',
  'arrow-down': '↓'
};

interface MetricsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: keyof typeof iconMap;
  bgColor: string;
  iconColor: string;
  description: string;
}

export function MetricsCard({
  title,
  value,
  change,
  trend,
  icon,
  bgColor,
  iconColor,
  description
}: MetricsCardProps) {
  return (
    <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${bgColor} ${iconColor} text-lg`}>
            {iconMap[icon] || '•'}
          </div>
          <Badge 
            variant="secondary" 
            className={`text-xs font-medium px-2 py-1 ${
              trend === 'up' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {trend === 'up' ? (
              <span className="text-green-500">{iconMap['arrow-up']}</span>
            ) : (
              <span className="text-red-500">{iconMap['arrow-down']}</span>
            )}
            {change}
          </Badge>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900">
            {value}
          </p>
          <p className="text-xs text-slate-400">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
