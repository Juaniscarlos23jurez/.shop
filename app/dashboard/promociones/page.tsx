"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { getProducts } from "@/lib/api/products";
import { api } from "@/lib/api/api";
import type { Product } from "@/types/product";

export default function PromocionesPage() {
  const { token, user } = useAuth();
  const companyId = user?.company_id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Array<{ id: string | number; name: string }>>([]);

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [promoPrice, setPromoPrice] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [quantityLimit, setQuantityLimit] = useState<string>("");
  const [perUserLimit, setPerUserLimit] = useState<string>("");
  const [promotions, setPromotions] = useState<any[]>([]);
  const [promosLoading, setPromosLoading] = useState<boolean>(false);
  const [filterProductId, setFilterProductId] = useState<string>("all");
  const [filterLocationId, setFilterLocationId] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);

  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === String(selectedProductId)),
    [products, selectedProductId]
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !companyId) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch products (first page, up to 50 to populate selector)
        const prodResp = await getProducts(companyId, token, { per_page: 50, page: 1 });
        const payload: any = prodResp?.data;
        const normalized: Product[] = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.products)
          ? payload.products
          : Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data?.products)
          ? payload.data.products
          : [];
        setProducts(normalized);

        // Fetch locations (sucursales)
        const locResp = await api.userCompanies.getLocations(token);
        const locs = (locResp?.data?.locations || []).map((l: any) => ({ id: l.id, name: l.name }));
        setLocations(locs);

        // Fetch promotions list
        await fetchPromotions(1, perPage, filterProductId, filterLocationId);
      } catch (e) {
        setError("No se pudieron cargar los datos iniciales");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, companyId]);

  const fetchPromotions = async (
    pageParam: number = page,
    perPageParam: number = perPage,
    productId?: string,
    locationId?: string
  ) => {
    if (!companyId) return;
    setPromosLoading(true);
    try {
      const res = await api.publicGeo.listPublicProductPromotions(String(companyId), {
        per_page: perPageParam,
        page: pageParam,
        product_id: productId && productId !== 'all' ? productId : undefined,
        location_id: locationId && locationId !== 'all' ? locationId : undefined,
      });
      const payload: any = res?.data ?? res;
      // Server returns { success, data: { data: [...], last_page, ... } }
      const pageObj = payload?.data || payload; // prefer nested data
      const list: any[] = Array.isArray(pageObj?.data)
        ? pageObj.data
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];
      setPromotions(list);
      const lastPage = pageObj?.last_page ?? payload?.meta?.last_page ?? 1;
      setTotalPages(Number.isFinite(lastPage) ? Number(lastPage) : 1);
      setPage(pageParam);
    } catch (e) {
      console.error('Error fetching promotions', e);
    } finally {
      setPromosLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || !companyId) return;
    // Basic validation
    if (!selectedProductId) return setError("Selecciona un producto");
    if (!selectedLocationId) return setError("Selecciona una sucursal");
    const priceNum = Number(promoPrice);
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setError("Ingresa un precio promocional válido");
    // quantity_limit optional validation
    let qty: number | null = null;
    if (quantityLimit.trim() !== "") {
      const parsed = Number(quantityLimit);
      if (!Number.isInteger(parsed) || parsed < 1) {
        return setError("La cantidad límite debe ser un entero mayor o igual a 1");
      }
      qty = parsed;
    }

    // per_user_limit optional validation
    let userQty: number | null = null;
    if (perUserLimit.trim() !== "") {
      const parsed = Number(perUserLimit);
      if (!Number.isInteger(parsed) || parsed < 1) {
        return setError("El límite por usuario debe ser un entero mayor o igual a 1");
      }
      userQty = parsed;
    }
    // Rule: promotional price must not exceed current product price
    const currentPrice = Number(selectedProduct?.price);
    if (selectedProduct && Number.isFinite(currentPrice) && priceNum > currentPrice) {
      return setError(`El precio promocional no puede ser mayor que el precio actual ($${currentPrice.toFixed(2)})`);
    }
    // Date range validation (optional dates)
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return setError("La fecha de fin no puede ser anterior a la fecha de inicio");
      }
    }

    setError(null);
    setSaving(true);
    try {
      // Call backend API
      const payload = {
        product_id: Number(selectedProductId),
        location_id: Number(selectedLocationId),
        promo_price: priceNum,
        // send date-only, backend normalizes to start/end of day
        start_at: startDate ? startDate : null,
        end_at: endDate ? endDate : null,
        is_active: isActive,
        quantity_limit: qty,
        per_user_limit: userQty,
      } as const;
      const res = await api.companies.createProductPromotion(String(companyId), token, payload as any);
      if (!res?.success) {
        throw new Error(res?.message || "Error al crear la promoción");
      }
      alert("Promoción creada correctamente");

      // Reset opcional
      setSelectedProductId("");
      setSelectedLocationId("");
      setPromoPrice("");
      setStartDate("");
      setEndDate("");
      setIsActive(true);
      setQuantityLimit(""); // Reset quantity_limit field
      setPerUserLimit("");

      // Refresh promotions list
      fetchPromotions(1, perPage, filterProductId, filterLocationId);
    } catch (e) {
      setError("No se pudo guardar la promoción");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Promociones</h1>
        <p className="text-slate-600 mt-1">Crea descuentos por producto y sucursal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900">Nueva promoción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Producto</Label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loading ? "Cargando productos..." : "Selecciona un producto"} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProduct && (
                <p className="text-xs text-slate-500">Precio actual: {selectedProduct.price ? `$${Number(selectedProduct.price).toFixed(2)}` : "N/A"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Sucursal</Label>
              <Select
                value={selectedLocationId}
                onValueChange={setSelectedLocationId}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loading ? "Cargando sucursales..." : "Selecciona una sucursal"} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Precio promocional</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value)}
                max={
                  selectedProduct && selectedProduct.price !== undefined
                    ? Number(selectedProduct.price)
                    : undefined
                }
                onBlur={() => {
                  const priceNum = Number(promoPrice);
                  const currentPrice = Number(selectedProduct?.price);
                  if (
                    selectedProduct &&
                    Number.isFinite(priceNum) &&
                    Number.isFinite(currentPrice) &&
                    priceNum > currentPrice
                  ) {
                    setPromoPrice(String(currentPrice));
                  }
                }}
                placeholder="0.00"
              />
              {selectedProduct?.price !== undefined && (
                <p className="text-xs text-slate-500">
                  Máximo permitido: ${Number(selectedProduct.price).toFixed(2)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de inicio (opcional)</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fecha de fin (opcional)</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="is_active">Activo</Label>
            </div>

            <div className="space-y-2">
              <Label>Límite de cantidad (opcional)</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={quantityLimit}
                onChange={(e) => setQuantityLimit(e.target.value)}
                placeholder="Ej. 50"
              />
              <p className="text-xs text-slate-500">Si se deja vacío, no hay límite de cantidad.</p>
            </div>

            <div className="space-y-2">
              <Label>Límite por usuario (opcional)</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
                placeholder="Ej. 1"
              />
              <p className="text-xs text-slate-500">Si se deja vacío, no hay límite por usuario.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || loading} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? "Guardando..." : "Guardar promoción"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Listado de promociones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-900">Promociones</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); fetchPromotions(1, Number(v), filterProductId, filterLocationId); }}>
                <SelectTrigger className="w-[100px]"><SelectValue placeholder="15" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => fetchPromotions(page, perPage, filterProductId, filterLocationId)} disabled={promosLoading}>{promosLoading ? 'Actualizando...' : 'Actualizar'}</Button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Filtrar por producto</Label>
              <Select value={filterProductId} onValueChange={(v) => { setFilterProductId(v); fetchPromotions(1, perPage, v, filterLocationId); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {products.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filtrar por sucursal</Label>
              <Select value={filterLocationId} onValueChange={(v) => { setFilterLocationId(v); fetchPromotions(1, perPage, filterProductId, v); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {locations.map(l => (
                    <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 && !promosLoading && (
            <p className="text-slate-500 text-sm">No hay promociones públicas.</p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2 pr-4">Producto</th>
                  <th className="py-2 pr-4">Sucursal</th>
                  <th className="py-2 pr-4">Precio promo</th>
                  <th className="py-2 pr-4">Límite</th>
                  <th className="py-2 pr-4">Límite x usuario</th>
                  <th className="py-2 pr-4">Inicio</th>
                  <th className="py-2 pr-4">Fin</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo) => {
                  const productName = promo.product?.name || products.find(p => String(p.id) === String(promo.product_id))?.name || `Producto #${promo.product_id}`;
                  const locationName = promo.location?.name || locations.find(l => String(l.id) === String(promo.location_id))?.name || `Sucursal #${promo.location_id}`;
                  return (
                    <tr key={promo.id || `${promo.product_id}-${promo.location_id}-${promo.start_at || 'na'}`} className="border-t">
                      <td className="py-2 pr-4">{productName}</td>
                      <td className="py-2 pr-4">{locationName}</td>
                      <td className="py-2 pr-4">${Number(promo.promo_price).toFixed(2)}</td>
                      <td className="py-2 pr-4">{promo.quantity_limit ?? '-'}</td>
                      <td className="py-2 pr-4">{promo.per_user_limit ?? '-'}</td>
                      <td className="py-2 pr-4">{promo.start_at ? new Date(promo.start_at).toLocaleString() : '-'}</td>
                      <td className="py-2 pr-4">{promo.end_at ? new Date(promo.end_at).toLocaleString() : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchPromotions(page - 1, perPage, filterProductId, filterLocationId)}>Anterior</Button>
            <p className="text-xs text-slate-500">Página {page} de {totalPages}</p>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchPromotions(page + 1, perPage, filterProductId, filterLocationId)}>Siguiente</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
