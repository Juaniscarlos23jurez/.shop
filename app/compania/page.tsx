import { Building2, Users, MapPin, Phone, Mail, Globe, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export default function CompaniaPage() {
  // Datos de ejemplo para la compañía
  const companyData = {
    name: 'Nombre de la Empresa',
    description: 'Breve descripción de la compañía y su misión principal.',
    address: 'Av. Principal #123, Colonia Centro',
    city: 'Ciudad de México',
    phone: '+52 55 1234 5678',
    email: 'contacto@empresa.com',
    website: 'www.empresa.com',
    schedule: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Compañía</h1>
          <p className="text-slate-600 mt-1">Administra la información de tu empresa</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Sucursal
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Información Principal */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900">{companyData.name}</CardTitle>
                <CardDescription className="text-slate-600">Información general de la compañía</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">{companyData.description}</p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Dirección</h4>
                  <p className="text-slate-600">{companyData.address}</p>
                  <p className="text-slate-600">{companyData.city}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Teléfono</h4>
                  <p className="text-slate-600">{companyData.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Correo Electrónico</h4>
                  <p className="text-slate-600">{companyData.email}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Globe className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Sitio Web</h4>
                  <p className="text-slate-600">{companyData.website}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Horario</h4>
                  <p className="text-slate-600">{companyData.schedule}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100">
            <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
              Editar Información  2
            </Button>
          </CardFooter>
        </Card>

        {/* Sucursales */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900">Sucursales</CardTitle>
                  <CardDescription className="text-slate-600">Administra las sucursales de tu empresa</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((branch) => (
                <div key={branch} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">Sucursal {branch}</h4>
                      <p className="text-sm text-slate-600">Dirección de la sucursal {branch}</p>
                      <div className="mt-2 flex items-center space-x-2 text-sm text-slate-500">
                        <span>5 empleados</span>
                        <span>•</span>
                        <span>Activa</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:bg-slate-100">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
