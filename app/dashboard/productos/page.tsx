import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function ProductosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Productos</h1>
          <p className="text-slate-600 mt-1">Administra los productos de tu catálogo</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/productos/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 gap-4 p-4 font-medium text-slate-600 border-b">
              <div className="col-span-5">Producto</div>
              <div className="col-span-2">Precio</div>
              <div className="col-span-2">Stock</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-1"></div>
            </div>
            
            {/* Placeholder for empty state */}
            <div className="p-8 text-center text-slate-500">
              <p>No hay productos registrados</p>
              <p className="text-sm mt-2">Comienza agregando tu primer producto</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
