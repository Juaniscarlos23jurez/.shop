import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const alt = 'Producto';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Esta función genera la imagen OG dinámicamente
export default async function Image({ params }: { params: { companySlug: string; locationId: string } }) {
  const { companySlug, locationId } = params;

  try {
    // Aquí deberías hacer fetch a tu API para obtener los datos
    // Por ahora retornamos una imagen básica
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(to bottom, #059669, #047857)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 'bold', marginBottom: 20 }}>
            {companySlug}
          </div>
          <div style={{ fontSize: 32 }}>
            Sucursal #{locationId}
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (e) {
    console.error('Error generating OG image:', e);
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: '#059669',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          Tienda
        </div>
      ),
      {
        ...size,
      }
    );
  }
}
