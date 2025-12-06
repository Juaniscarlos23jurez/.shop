import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

// Icon mapping using simple non-emoji glyphs (no external icon dependency)
const iconMap: Record<string, ReactNode> = {
  dollar: (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/70 text-xs font-bold">
      $
    </span>
  ),
  users: (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/70 text-[10px] font-semibold">
      UX
    </span>
  ),
  "shopping-cart": (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/70 text-xs font-semibold">
      CT
    </span>
  ),
  "message-square": (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/70 text-[10px] font-semibold">
      MSG
    </span>
  ),
  star: (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/70 text-xs font-semibold">
      *
    </span>
  ),
  "arrow-up": (
    <span className="inline-flex items-center justify-center w-3 h-3 mr-1 text-[10px] font-semibold">
      ▲
    </span>
  ),
  "arrow-down": (
    <span className="inline-flex items-center justify-center w-3 h-3 mr-1 text-[10px] font-semibold">
      ▼
    </span>
  ),
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
            {iconMap[icon] || <span className="w-5 h-5 rounded-full bg-slate-300 inline-block" />}
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
              <span className="inline-flex items-center justify-center w-3 h-3 mr-1 text-[10px] font-semibold text-green-500">
                ▲
              </span>
            ) : (
              <span className="inline-flex items-center justify-center w-3 h-3 mr-1 text-[10px] font-semibold text-red-500">
                ▼
              </span>
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
