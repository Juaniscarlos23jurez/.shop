import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AvgPurchaseMonthlyData {
  month: string; // label (Ene, Feb, ...)
  avg: number;   // average purchase value per user (MXN)
  users: number; // users with purchases that month
}

interface ConversionChartProps {
  data: AvgPurchaseMonthlyData[];
  title: string;
  description: string;
  average: string; // formatted average to show in badge
}

export function ConversionChart({ data, title, description, average }: ConversionChartProps) {
  const currencyFmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
  return (
    <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              {title}
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              {description}
            </CardDescription>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
            {average} avg
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            avg: {
              label: "Ticket Promedio (MXN)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <LineChart data={data} margin={{ left: 12, right: 12, top: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis width={60} tickFormatter={(v: number) => currencyFmt(Number(v))} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
