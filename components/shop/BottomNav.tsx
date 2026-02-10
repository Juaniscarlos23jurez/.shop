import * as Lucide from 'lucide-react';

const { Store, Package, Gift, Award, WalletCards } = Lucide as any;

type Section = 'home' | 'promotions' | 'points' | 'coupons' | 'wallet';

interface BottomNavProps {
    activeSection: Section;
    onSectionChange: (section: Section) => void;
    backgroundColor?: string;
}

export function BottomNav({ activeSection, onSectionChange, backgroundColor }: BottomNavProps) {
    const navItems = [
        { id: 'home', label: 'Inicio', icon: Store },
        { id: 'promotions', label: 'Promos', icon: Gift },
        { id: 'points', label: 'Puntos', icon: Award },
        { id: 'wallet', label: 'Wallet', icon: WalletCards },
        { id: 'coupons', label: 'Cupones', icon: Package },
    ] as const;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none pb-safe">
            <div className="mx-auto max-w-md px-4 pb-6">
                <div
                    className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl p-2"
                    style={{ backgroundColor: backgroundColor || 'rgba(255, 255, 255, 0.95)' }}
                >
                    <div className="flex items-center justify-around gap-1">
                        {navItems.map((item) => {
                            const isActive = activeSection === item.id;
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.id}
                                    className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl text-[10px] sm:text-xs font-medium transition-all duration-200 flex-1 ${isActive
                                        ? 'text-white bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-lg scale-105'
                                        : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
                                        }`}
                                    onClick={() => onSectionChange(item.id)}
                                >
                                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                                    <span className="font-semibold truncate w-full text-center">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
