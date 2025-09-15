import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HorariosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Horarios</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {/* Calendario */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calendario de Horarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                className="rounded-md border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Empleados */}
        <Card>
          <CardHeader>
            <CardTitle>Empleados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border p-3">
                <h4 className="font-medium">Juan Pérez</h4>
                <p className="text-sm text-muted-foreground">Lun-Vie: 9:00 AM - 6:00 PM</p>
              </div>
              <div className="rounded-md border p-3">
                <h4 className="font-medium">María García</h4>
                <p className="text-sm text-muted-foreground">Mar-Sáb: 10:00 AM - 7:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
