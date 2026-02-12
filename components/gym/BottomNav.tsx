import * as Lucide from 'lucide-react';

const { Dumbbell, CreditCard, MessageSquare, Calendar, Activity } = Lucide as any;

export type Section = 'activity' | 'workout' | 'messaging' | 'attendance' | 'payments';

interface BottomNavProps {
    activeSection: Section;
    onSectionChange: (section: Section) => void;
    backgroundColor?: string;
    activeItemColor?: string;
}

export function BottomNav({ activeSection, onSectionChange, backgroundColor, activeItemColor }: BottomNavProps) {
    const navItems = [
        { id: 'activity', label: 'Actividad', icon: Activity },
        { id: 'workout', label: 'Ejercicio', icon: Dumbbell },
        { id: 'messaging', label: 'Mensaje', icon: MessageSquare },
        { id: 'attendance', label: 'Asistencia', icon: Calendar },
        { id: 'payments', label: 'Pago', icon: CreditCard },
    ] as const;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none pb-safe">
            <div className="mx-auto max-w-lg px-4 pb-6">
                <div
                    className="pointer-events-auto bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-2"
                    style={{ backgroundColor: backgroundColor || 'rgba(9, 9, 11, 0.95)' }}
                >
                    <div className="flex items-center justify-around gap-1">
                        {navItems.map((item) => {
                            const isActive = activeSection === item.id;
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.id}
                                    className={`flex flex-col items-center justify-center gap-1.5 px-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-500 flex-1 ${isActive
                                        ? `text-white shadow-2xl scale-110 ${!activeItemColor ? 'bg-blue-600 shadow-[0_0_25px_rgba(37,99,235,0.4)]' : ''}`
                                        : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                    style={isActive && activeItemColor ? { backgroundColor: activeItemColor } : {}}
                                    onClick={() => onSectionChange(item.id)}
                                >
                                    <Icon className={`h-5 w-5 ${isActive ? 'stroke-[3px]' : 'stroke-2'}`} />
                                    <span className="truncate w-full text-center leading-none">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
