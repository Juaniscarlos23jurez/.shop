'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as Lucide from "lucide-react";
const { Loader2, ShieldCheck, Users, MapPin, Building } = Lucide as any;

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api/api";
import { publicWebApiClient } from "@/lib/api/public-web";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  EMPLOYEE_ROLE_DISPLAY,
  EmployeeRoleType,
} from "@/types/branch";
import type { PublicCompanyLocation } from "@/types/api";

interface LocationOption {
  id: string;
  name: string;
  city?: string;
  state?: string;
  status?: string;
}

interface AccountRow {
  id: string;
  email: string;
  employeeName: string;
  roleType?: EmployeeRoleType;
  isActive: boolean;
  locationId?: string;
  lastActive?: string;
}

const normalizeLocation = (location: any): LocationOption => ({
  id:
    location.id?.toString?.() ||
    location.location_id?.toString?.() ||
    `loc-${Math.random().toString(36).slice(2, 9)}`,
  name: location.name || location.title || "Sucursal sin nombre",
  city: location.city || location.city_name || "",
  state: location.state || location.state_name || "",
  status:
    location.status ||
    (typeof location.is_active === "boolean"
      ? location.is_active
        ? "active"
        : "inactive"
      : "unknown"),
});

const normalizeAccount = (account: any): AccountRow => {
  const role = account.role_type as EmployeeRoleType | undefined;
  return {
    id:
      account.user_id?.toString?.() ||
      account.id?.toString?.() ||
      `acc-${Math.random().toString(36).slice(2, 9)}`,
    email: account.email || "",
    employeeName:
      account.employee?.name ||
      [account.employee?.first_name, account.employee?.last_name]
        .filter(Boolean)
        .join(" ") ||
      account.employee_name ||
      "Empleado sin nombre",
    roleType: role,
    isActive: account.is_active ?? true,
    locationId:
      account.location_id?.toString?.() ||
      account.employee?.location_id?.toString?.() ||
      account.employee?.location?.id?.toString?.() ||
      undefined,
    lastActive:
      account.employee?.last_login ||
      account.employee?.updated_at ||
      account.updated_at ||
      account.created_at ||
      undefined,
  };
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function EmployeeAccountsPage() {
  const { user, token, loading } = useAuth();
  const { toast } = useToast();

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [activeLocationId, setActiveLocationId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingLocationDetails, setLoadingLocationDetails] = useState(false);
  const [locationDetails, setLocationDetails] =
    useState<PublicCompanyLocation | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || !token) {
      setCompanyId(null);
      setLocations([]);
      setAccounts([]);
      return;
    }

    const bootstrap = async () => {
      setIsInitializing(true);
      try {
        let resolvedCompanyId = user.company_id
          ? String(user.company_id)
          : undefined;

        if (!resolvedCompanyId) {
          const companyResponse = await api.userCompanies.get(token);
          const companyData: any = companyResponse.data;
          if (companyData) {
            if (companyData.data?.id) resolvedCompanyId = String(companyData.data.id);
            else if (companyData.company?.id) resolvedCompanyId = String(companyData.company.id);
            else if (companyData.id) resolvedCompanyId = String(companyData.id);
          }
        }

        if (!resolvedCompanyId) {
          throw new Error("No se pudo determinar la compañía del usuario");
        }
        setCompanyId(resolvedCompanyId);

        const [locationsResponse, accountsResponse] = await Promise.all([
          api.userCompanies.getLocations(token),
          api.userCompanies.getEmployeeAccounts(resolvedCompanyId, token),
        ]);

          if (!locationsResponse.success) {
            throw new Error(
              locationsResponse.message || "No se pudieron cargar las sucursales"
            );
          }

        const rawLocations =
          (locationsResponse.data as any)?.locations ?? locationsResponse.data ?? [];
        const parsedLocations: LocationOption[] = Array.isArray(rawLocations)
          ? rawLocations.map(normalizeLocation)
          : [];
        setLocations(parsedLocations);

        if (!accountsResponse.success) {
          throw new Error(
            accountsResponse.message ||
              "No se pudieron cargar las cuentas de empleados"
          );
        }
        const accountsArray: any[] = Array.isArray(accountsResponse.data)
          ? accountsResponse.data
          : Array.isArray((accountsResponse.data as any)?.data)
          ? (accountsResponse.data as any).data
          : [];
        setAccounts(accountsArray.map(normalizeAccount));

        if (parsedLocations.length) {
          setActiveLocationId(parsedLocations[0].id);
        } else if (accountsArray.length) {
          const firstAccount = normalizeAccount(accountsArray[0]);
          setActiveLocationId(firstAccount.locationId || "");
        }
      } catch (error: any) {
        console.error("[EmployeeAccounts] bootstrap error", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.message || "No se pudo cargar la información inicial",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    bootstrap();
  }, [loading, user, token, toast]);

  useEffect(() => {
    if (!activeLocationId) {
      setLocationDetails(null);
      return;
    }
    setLoadingLocationDetails(true);
    publicWebApiClient
      .getLocationDetailsById(activeLocationId)
      .then((response) => {
        if (response.success) {
          setLocationDetails(response.data || null);
        } else {
          setLocationDetails(null);
        }
      })
      .catch(() => {
        setLocationDetails(null);
      })
      .finally(() => setLoadingLocationDetails(false));
  }, [activeLocationId]);

  const accountsByLocation = useMemo(() => {
    return accounts.reduce<Record<string, AccountRow[]>>((acc, account) => {
      const key = account.locationId || "sin-sucursal";
      if (!acc[key]) acc[key] = [];
      acc[key].push(account);
      return acc;
    }, {});
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    const list = accountsByLocation[activeLocationId] || [];
    if (!search.trim()) return list;
    const needle = search.toLowerCase();
    return list.filter((account) => {
      return (
        account.employeeName.toLowerCase().includes(needle) ||
        account.email.toLowerCase().includes(needle) ||
        (account.roleType &&
          EMPLOYEE_ROLE_DISPLAY[account.roleType]
            .toLowerCase()
            .includes(needle))
      );
    });
  }, [accountsByLocation, activeLocationId, search]);

  const stats = useMemo(() => {
    const totalAccounts = accounts.length;
    const activeAccounts = accounts.filter((acc) => acc.isActive).length;
    const inactiveAccounts = totalAccounts - activeAccounts;
    return {
      locations: locations.length,
      totalAccounts,
      activeAccounts,
      inactiveAccounts,
    };
  }, [locations, accounts]);

  const activeLocation = locations.find(
    (location) => location.id === activeLocationId
  );

  const isLoadingPage = isInitializing || loading;

  const locationCards = locations.map((location) => {
    const list = accountsByLocation[location.id] || [];
    const activeCount = list.filter((item) => item.isActive).length;
    return {
      location,
      total: list.length,
      active: activeCount,
      inactive: list.length - activeCount,
    };
  });

  const showUnassignedCard = accountsByLocation["sin-sucursal"]?.length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-600">Equipo</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Cuentas de Empleados
        </h1>
        
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-slate-100 p-3 text-slate-700">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sucursales</p>
              <p className="text-2xl font-semibold">{stats.locations}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cuentas activas</p>
              <p className="text-2xl font-semibold">{stats.activeAccounts}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-sky-100 p-3 text-sky-700">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de cuentas</p>
              <p className="text-2xl font-semibold">{stats.totalAccounts}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-rose-100 p-3 text-rose-700">
              <Loader2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cuentas inactivas</p>
              <p className="text-2xl font-semibold">{stats.inactiveAccounts}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Sucursales y acceso</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fuente directa: https://laravel-pkpass-backend-development-pfaawl.laravel.cloud/api/locations
          </p>
        </CardHeader>
        <CardContent>
          {isLoadingPage ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Cargando sucursales...
            </div>
          ) : locationCards.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aún no hay sucursales registradas.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {locationCards.map(({ location, total, active, inactive }) => (
                <button
                  key={location.id}
                  onClick={() => setActiveLocationId(location.id)}
                  className={`text-left rounded-lg border p-4 transition hover:border-emerald-400 focus:outline-none ${
                    activeLocationId === location.id
                      ? "border-emerald-500 shadow-md"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {location.name}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {location.city || "Ciudad no registrada"}
                        {location.state ? `, ${location.state}` : ""}
                      </p>
                    </div>
                    <Badge
                      variant={
                        location.status === "active" ? "default" : "secondary"
                      }
                    >
                      {location.status === "active" ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 text-center text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-semibold">{total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Activas</p>
                      <p className="font-semibold text-emerald-600">{active}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Inactivas</p>
                      <p className="font-semibold text-rose-600">{inactive}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/sucursales/${location.id}?tab=employees`}>
                        Gestionar
                      </Link>
                    </Button>
                  </div>
                </button>
              ))}

              {showUnassignedCard ? (
                <div
                  className={`rounded-lg border p-4 ${
                    activeLocationId === "sin-sucursal"
                      ? "border-emerald-500 shadow-md"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        Sin sucursal
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cuentas que aún no se asignan a una ubicación.
                      </p>
                    </div>
                    <Badge variant="secondary">Asignar</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 text-center text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-semibold">
                        {accountsByLocation["sin-sucursal"].length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Activas</p>
                      <p className="font-semibold text-emerald-600">
                        {
                          accountsByLocation["sin-sucursal"].filter(
                            (item) => item.isActive
                          ).length
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Inactivas</p>
                      <p className="font-semibold text-rose-600">
                        {
                          accountsByLocation["sin-sucursal"].filter(
                            (item) => !item.isActive
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveLocationId("sin-sucursal")}
                    >
                      Revisar
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {activeLocationId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Detalle de la sucursal</CardTitle>
            <p className="text-sm text-muted-foreground">
              Datos obtenidos desde /api/locations/{activeLocationId}/details
            </p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            {loadingLocationDetails ? (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando detalles...
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Nombre
                    </p>
                    <p className="font-medium">
                      {locationDetails?.name || activeLocation?.name || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Ciudad
                    </p>
                    <p className="font-medium">
                      {locationDetails?.city || activeLocation?.city || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Estado
                    </p>
                    <p className="font-medium">
                      {locationDetails?.state || activeLocation?.state || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      País
                    </p>
                    <p className="font-medium">
                      {locationDetails?.country || "—"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Dirección
                  </p>
                  <p className="font-medium">
                    {locationDetails?.address || "No registrada"}
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="mt-4"
                >
                  <Link href={`/dashboard/sucursales/${activeLocationId}?tab=employees`}>
                    Gestionar empleados de esta sucursal
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl">Cuentas en la sucursal seleccionada</CardTitle>
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredAccounts.length} de{" "}
                {accountsByLocation[activeLocationId]?.length || 0} cuentas.
              </p>
            </div>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, correo o rol"
              className="w-full lg:w-80"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPage ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando cuentas...
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg font-medium text-gray-900">
                No hay cuentas registradas en esta sucursal
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Puedes crearlas desde la vista de la sucursal.
              </p>
              <Button asChild className="mt-4">
                <Link href={`/dashboard/sucursales/${activeLocationId}?tab=employees`}>
                  Crear cuenta
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última actividad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        {account.employeeName}
                      </TableCell>
                      <TableCell>{account.email || "—"}</TableCell>
                      <TableCell>
                        {account.roleType ? (
                          <Badge variant="outline">
                            {EMPLOYEE_ROLE_DISPLAY[account.roleType]}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.isActive ? "default" : "secondary"}>
                          {account.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(account.lastActive)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
