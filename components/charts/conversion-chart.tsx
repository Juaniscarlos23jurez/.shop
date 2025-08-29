import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ConversionData {
  day: string;
  conversions: number;
}

interface ConversionChartProps {
  data: ConversionData[];
  title: string;
  description: string;
  average: string;
}

export function ConversionChart({ data, title, description, average }: ConversionChartProps) {
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
            conversions: {
              label: "Conversiones",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <LineChart data={data}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="conversions"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
