import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface SalesData {
  month: string;
  sales: number;
  revenue: number;
}

interface SalesChartProps {
  data: SalesData[];
  title: string;
  description: string;
  change: string;
}

export function SalesChart({ data, title, description, change }: SalesChartProps) {
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
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            {change}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            sales: {
              label: "Ventas",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
