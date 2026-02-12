import * as Lucide from 'lucide-react';

const { Dumbbell, Gift, Award, WalletCards, Package, Activity } = Lucide as any;

type Section = 'home' | 'promotions' | 'points' | 'coupons' | 'wallet';

interface BottomNavProps {
    activeSection: Section;
    onSectionChange: (section: Section) => void;
    backgroundColor?: string;
    activeItemColor?: string;
}

export function BottomNav({ activeSection, onSectionChange, backgroundColor, activeItemColor }: BottomNavProps) {
    const navItems = [
        { id: 'home', label: 'Box', icon: Dumbbell },
        { id: 'promotions', label: 'Especiales', icon: Gift },
        { id: 'points', label: 'Stats', icon: Activity },
        { id: 'wallet', label: 'Wallet', icon: WalletCards },
        { id: 'coupons', label: 'Bonos', icon: Package },
    ] as const;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none pb-safe">
            <div className="mx-auto max-w-md px-4 pb-6">
                <div
                    className="pointer-events-auto bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-2"
                    style={{ backgroundColor: backgroundColor || 'rgba(24, 24, 27, 0.95)' }}
                >
                    <div className="flex items-center justify-around gap-1">
                        {navItems.map((item) => {
                            const isActive = activeSection === item.id;
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.id}
                                    className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-tighter transition-all duration-300 flex-1 ${isActive
                                        ? `text-white shadow-2xl scale-110 ${!activeItemColor ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : ''}`
                                        : 'text-zinc-500 hover:text-zinc-300 hover:scale-105'
                                        }`}
                                    style={isActive && activeItemColor ? { backgroundColor: activeItemColor } : {}}
                                    onClick={() => onSectionChange(item.id)}
                                >
                                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                                    <span className="truncate w-full text-center">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
