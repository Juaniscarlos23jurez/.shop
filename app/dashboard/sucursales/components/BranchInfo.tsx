import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Branch } from '@/types/branch';

interface BranchInfoProps {
  branch: Branch;
  isEditing: boolean;
  onEditClick: () => void;
}

export function BranchInfo({ branch, isEditing, onEditClick }: BranchInfoProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">
          {branch.name}
          <Badge 
            variant={branch.is_active ? 'default' : 'secondary'} 
            className="ml-3"
          >
            {branch.is_active ? 'Activa' : 'Inactiva'}
          </Badge>
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEditClick}
          disabled={isEditing}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {branch.description && (
            <p className="text-muted-foreground">{branch.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Dirección</p>
                <p className="text-sm text-muted-foreground">
                  {branch.address}
                  {branch.city && `, ${branch.city}`}
                  {branch.state && `, ${branch.state}`}
                  {branch.country && `, ${branch.country}`}
                  {branch.zip_code && ` (${branch.zip_code})`}
                </p>
                {branch.latitude && branch.longitude && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Coordenadas: {branch.latitude}, {branch.longitude}
                  </p>
                )}
              </div>
            </div>

            {branch.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">{branch.phone}</p>
                </div>
              </div>
            )}

            {branch.email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Correo electrónico</p>
                  <p className="text-sm text-muted-foreground">{branch.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
