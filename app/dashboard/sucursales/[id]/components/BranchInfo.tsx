import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Branch } from "@/types/branch";

interface BranchInfoProps {
  branch: Branch;
  onEditClick: () => void;
}

export function BranchInfo({ branch, onEditClick }: BranchInfoProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">{branch.name}</CardTitle>
          <CardDescription className="text-base">
            {branch.description || 'Sin descripción'}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={branch.isActive ? 'default' : 'secondary'}>
            {branch.isActive ? 'Activa' : 'Inactiva'}
          </Badge>
          <Button variant="outline" size="sm" onClick={onEditClick}>
            Editar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">Dirección</h4>
            <p className="text-sm">
              {branch.address}, {branch.city}, {branch.state}, {branch.country} {branch.zipCode}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">Contacto</h4>
            <p className="text-sm">
              {branch.phone} • {branch.email}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
