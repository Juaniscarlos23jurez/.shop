import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { User, CheckSquare as CheckIcon } from 'lucide-react';

export interface MembershipCardProps {
  name: string;
  description: string;
  price: number | string;
  duration: number | string;
  durationUnit: 'months' | 'years' | string;
  badgeText: string;
  isPopular: boolean;
  maxUsers?: number | string | null;
  welcomeGift?: boolean;
  birthdayGift?: boolean;
  benefits: Array<{ text: string; description?: string }>;
  cardColorHex?: string | null;
  textColorHex?: string | null;
  accentColorHex?: string | null;
  backgroundImageUrl?: string | null;
  imageUrl?: string | null;
  children?: React.ReactNode;
}

export function MembershipCard({
  name,
  description,
  price,
  duration,
  durationUnit,
  badgeText,
  isPopular,
  maxUsers,
  welcomeGift,
  birthdayGift,
  benefits,
  cardColorHex = '#ffffff',
  textColorHex = '#0f172a',
  accentColorHex = '#10b981',
  backgroundImageUrl,
  imageUrl,
  children,
}: MembershipCardProps) {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  const numDuration = typeof duration === 'string' ? parseInt(duration || '1') : duration;

  return (
    <Card className="group overflow-hidden border-none shadow-xl transition-all hover:shadow-2xl h-full flex flex-col" 
          style={{ 
            backgroundColor: cardColorHex || '#ffffff',
            color: textColorHex || '#0f172a'
          }}>
      <CardHeader className="relative p-6 overflow-hidden min-h-[160px] flex flex-col justify-between"
                  style={{ 
                    backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent z-0 pointer-events-none" />
        
        <div className="relative z-10 w-full">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold tracking-tight">{name || 'Nombre del Plan'}</CardTitle>
                {isPopular && (
                  <span className="inline-flex items-center rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950 uppercase tracking-wider">
                    POPULAR
                  </span>
                )}
              </div>
              <CardDescription className="line-clamp-2 text-xs" style={{ color: textColorHex ? `${textColorHex}CC` : undefined }}>
                {description || 'Describe tu membresía aquí...'}
              </CardDescription>
            </div>
            <div className="flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} className="h-16 w-16 object-contain drop-shadow-md" alt="" />
              ) : (
                <CheckIcon className="h-16 w-16 opacity-20" />
              )}
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black">
              {(numericPrice || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
            </span>
            <span className="text-xs font-medium opacity-70">
              /{duration || 1} {numDuration === 1 ? 'mes' : 'meses'}
            </span>
          </div>
          {badgeText && (
            <div className="mt-2">
              <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest border border-current opacity-80"
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      color: textColorHex || '#0f172a'
                    }}>
                {badgeText}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 bg-white/10 backdrop-blur-sm flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {Boolean(maxUsers) && parseInt(maxUsers as string) !== 0 && (
            <div className="flex items-center text-[11px] p-2 rounded-lg border border-current opacity-80" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              <User className="mr-2 h-4 w-4 opacity-70" />
              <span>Límite: <strong>{maxUsers}</strong> usuarios</span>
            </div>
          )}

          {(welcomeGift || birthdayGift) && (
            <div className="flex flex-wrap gap-1.5">
              {welcomeGift && (
                <span className="inline-flex items-center rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-widest border border-current opacity-80" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                  REGALO BIENVENIDA
                </span>
              )}
              {birthdayGift && (
                <span className="inline-flex items-center rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-widest border border-current opacity-80" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                  REGALO CUMPLEAÑOS
                </span>
              )}
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest opacity-60">Beneficios</h4>
            <ul className="grid gap-2.5">
              {benefits && benefits.length > 0 ? benefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="flex items-start text-xs group">
                  <CheckIcon className="mr-2 mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColorHex || '#10b981' }} />
                  <div className="flex flex-col">
                    <span className="font-semibold leading-tight">{benefit.text}</span>
                    {benefit.description && (
                      <p className="text-[11px] opacity-70 line-clamp-1 mt-0.5">{benefit.description}</p>
                    )}
                  </div>
                </li>
              )) : (
                <li className="text-[10px] opacity-40 italic pl-5">No hay beneficios agregados...</li>
              )}
              
              {benefits && benefits.length > 3 && (
                <li className="text-xs opacity-60 font-medium italic pl-7 pt-1">
                  + {benefits.length - 3} beneficios adicionales...
                </li>
              )}
            </ul>
          </div>
        </div>
        
        {/* Dynamic actions section rendering (e.g. Buttons at the bottom) */}
        {children && (
          <div className="pt-6 mt-auto">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
