import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from 'react';

// Define the shape of a payroll record
interface PayrollItem {
  id: number;
  name: string;
  position: string;
  salary: number;
  status: string;
  period: string;
}
export default function NominaPage() {
  const [payrollData, setPayrollData] = useState<PayrollItem[]>([]);

  // Fetch payroll data from API (replace URL with actual endpoint)
  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const res = await fetch('/api/payroll');
        if (!res.ok) throw new Error('Failed to fetch payroll data');
        const data = await res.json();
        setPayrollData(data);
      } catch (error) {
        console.error('Error loading payroll data:', error);
      }
    };
    fetchPayroll();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Pagado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rechazado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Nómina</h2>
        <Button>Generar Nómina</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Registros de Nómina</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-6 gap-4 bg-muted/50 p-4 font-medium">
              <div>Empleado</div>
              <div>Puesto</div>
              <div className="text-right">Salario</div>
              <div>Período</div>
              <div>Estado</div>
              <div className="text-right">Acciones</div>
            </div>
            
            {payrollData.map((item: PayrollItem) => (
              <div key={item.id} className="grid grid-cols-6 gap-4 p-4 border-t items-center">
                <div>{item.name}</div>
                <div>{item.position}</div>
                <div className="text-right">${item.salary.toLocaleString()}</div>
                <div>{item.period}</div>
                <div>{getStatusBadge(item.status)}</div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">Ver</Button>
                  <Button size="sm">Pagar</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
