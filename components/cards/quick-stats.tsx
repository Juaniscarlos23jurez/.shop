import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StatItem {
  label: string;
  value: string;
  percentage: number;
  color: string;
}

interface QuickStatsProps {
  stats?: StatItem[];
}

const defaultStats: StatItem[] = [
  { label: 'Ventas Hoy', value: '$1,234', percentage: 12, color: 'bg-blue-500' },
  { label: 'Órdenes', value: '45', percentage: 8, color: 'bg-green-500' },
  { label: 'Tasa de Conversión', value: '3.2%', percentage: 1.5, color: 'bg-yellow-500' },
];

export function QuickStats({ stats = defaultStats }: QuickStatsProps) {
  return (
    <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-900">
          Resumen Rápido
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Métricas clave de hoy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{stat.label}</span>
              <span className="text-sm font-bold text-slate-900">{stat.value}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${stat.color}`} 
                style={{ width: `${stat.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-slate-100">
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            Ver Reporte Completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
