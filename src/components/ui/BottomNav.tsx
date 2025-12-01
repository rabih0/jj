'use client';

import { Home, FileText, Users, Settings, PlusCircle, Tag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'Start' },
        { href: '/invoices', icon: FileText, label: 'Rechnungen' },
        { href: '/invoices/new', icon: PlusCircle, label: 'Neu', highlight: true },
        { href: '/pricelist', icon: Tag, label: 'Preise' },
        { href: '/clients', icon: Users, label: 'Kunden' },
        { href: '/settings', icon: Settings, label: 'Einstellungen' },
    ];



    return (
        <div className="fixed bottom-0 left-0 right-0 p-3 z-50">
            <nav className="glass mx-auto max-w-md flex justify-around items-center py-2 px-1 rounded-2xl mb-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px]",
                                isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-primary",
                                item.highlight && "bg-primary text-primary-foreground shadow-lg -mt-6 mb-2 border-4 border-background"
                            )}
                        >
                            <item.icon size={item.highlight ? 24 : 20} strokeWidth={1.5} />
                            {!item.highlight && <span className="text-[9px] mt-0.5 font-medium">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
