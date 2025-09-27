// New Mobile Navigation (complete rewrite)
// Goals:
// 1. Reliable navigation (no preventDefault / manual fallbacks unless truly needed)
// 2. Close menu automatically after successful route change
// 3. Accessible: proper aria attributes & keyboard navigation
// 4. Non-intrusive: doesn't interfere with desktop; keeps same props contract used by Header
// 5. Body scroll locking while open; overlay click to dismiss; smooth slide / fade animation

import { ChevronDown, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./button";
import { apiFetch } from "../../lib/apiFetch";
import { useEffect, useRef, useCallback, useState } from "react";

export interface MobileNavCategoryItem { name: string; href: string; description?: string }
export interface MobileNavCategory { title: string; href?: string; items: MobileNavCategoryItem[] }
export interface MobileNavItem {
    name: string;
    href: string;
    highlight?: boolean;
    hasDropdown?: boolean;
    dropdownContent?: { categories: MobileNavCategory[] };
}

interface MobileNavProps {
    navItems: MobileNavItem[];
    isOpen: boolean;
    isHeaderVisible: boolean;
    clickedDropdown: string | null; // controlled (for backward compat)
    setClickedDropdown: (v: string | null) => void;
    setIsMenuOpen: (v: boolean) => void;
    isAuthenticated: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
    navItems,
    isOpen,
    isHeaderVisible,
    clickedDropdown,
    setClickedDropdown,
    setIsMenuOpen,
    isAuthenticated,
}) => {
    const location = useLocation();
    const initialPathRef = useRef(location.pathname + location.search + location.hash);
    const panelRef = useRef<HTMLDivElement | null>(null);

    // Body scroll lock while menu open
    useEffect(() => {
        if (isOpen) {
            const { body } = document;
            const prev = body.style.overflow;
            body.style.overflow = 'hidden';
            return () => { body.style.overflow = prev; };
        }
    }, [isOpen]);

    // Close menu automatically after a route change
    useEffect(() => {
        const current = location.pathname + location.search + location.hash;
        if (isOpen && current !== initialPathRef.current) {
            // route changed => close
            setIsMenuOpen(false);
            setClickedDropdown(null);
            initialPathRef.current = current;
        }
    }, [location, isOpen, setIsMenuOpen, setClickedDropdown]);

    // Focus management: focus first focusable element when opening
    useEffect(() => {
        if (isOpen && panelRef.current) {
            const btn = panelRef.current.querySelector<HTMLElement>('button, a');
            btn?.focus();
        }
    }, [isOpen]);

    // Local state for mobile dropdown (decoupled from desktop header's dropdown state)
    const [openDropdown, setOpenDropdown] = useState<string | null>(clickedDropdown);

    // Sync external reset when menu closes
    useEffect(() => {
        if (!isOpen) {
            setOpenDropdown(null);
        }
    }, [isOpen]);

    const toggleDropdown = useCallback((name: string) => {
        setOpenDropdown(prev => prev === name ? null : name);
    }, []);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[59] animate-fadeIn"
                onClick={() => setIsMenuOpen(false)}
                aria-hidden="true"
            />
            {/* Panel */}
            <div
                ref={panelRef}
                className={`fixed z-[60] top-${isHeaderVisible ? '16' : '4'} right-0 left-0 mx-4 origin-top rounded-2xl border border-glass-border bg-card/95 backdrop-blur-xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden animate-slideDown`}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
            >
                <div className="flex items-center px-5 pt-4 pb-2">
                    <span className="text-sm font-medium text-foreground/70">Menu</span>
                </div>
                <div className="overflow-y-auto px-4 pb-6 custom-scrollbar">
                    <nav className="flex flex-col" aria-label="Mobile primary">
                        {navItems.map(item => (
                            <div key={item.name} className="">
                                {item.hasDropdown ? (
                                    <>
                                        <button
                                            className="w-full text-left py-3 flex items-center justify-between font-semibold text-sm text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring ring-primary/40"
                                            onClick={() => toggleDropdown(item.name)}
                                            aria-expanded={openDropdown === item.name}
                                            aria-controls={`mn-sec-${item.name}`}
                                        >
                                            <span>{item.name}</span>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                                        </button>
                                        <div
                                            id={`mn-sec-${item.name}`}
                                            className={`transition-all duration-300 ease-in-out overflow-hidden ${openDropdown === item.name ? 'max-h-[1400px] opacity-100' : 'max-h-0 opacity-0'}`}
                                            aria-hidden={openDropdown === item.name ? 'false' : 'true'}
                                        >
                                            <div className="pb-4 pl-2 pr-1 space-y-5">
                                                {item.dropdownContent?.categories.map((cat, ci) => (
                                                    <div key={ci} className="">
                                                        {cat.href ? (
                                                            <Link
                                                                to={cat.href}
                                                                className="block text-xs font-bold uppercase tracking-wide text-primary hover:text-primary/80 mb-2 focus:outline-none focus-visible:ring ring-primary/40 rounded px-1 py-1"
                                                                onClick={() => {
                                                                    // Route-change effect handles closing
                                                                }}
                                                            >
                                                                {cat.title}
                                                            </Link>
                                                        ) : (
                                                            <h4 className="text-xs font-bold uppercase tracking-wide text-primary mb-2">{cat.title}</h4>
                                                        )}
                                                        <ul className="space-y-2">
                                                            {cat.items.map((sub, si) => (
                                                                <li key={si}>
                                                                    <Link
                                                                        to={sub.href}
                                                                        className="block text-sm text-foreground/80 hover:text-foreground focus:outline-none focus-visible:ring ring-primary/40 rounded px-1 py-1"
                                                                        onClick={() => {
                                                                            // Route-change effect handles closing
                                                                        }}
                                                                    >
                                                                        {sub.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        to={item.href}
                                        className={`block py-3 font-semibold text-sm transition-colors focus:outline-none focus-visible:ring ring-primary/40 ${item.highlight ? 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent' : 'text-foreground hover:text-primary'}`}
                                        onClick={() => {/* close handled after route change */ }}
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Theme Toggle */}
                    <div className="mt-5 pt-5 border-t border-glass-border flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground/60">Theme</span>
                        <ThemeToggle />
                    </div>

                    {/* Auth Buttons */}
                    {/* <div className="mt-5 pt-5 border-t border-glass-border flex flex-col space-y-2">
                        {isAuthenticated ? (
                            <Button
                                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white"
                                onClick={() => {
                                    // Dispatch logout event BEFORE removing session data
                                    window.dispatchEvent(new CustomEvent('user-logout'));

                                    localStorage.removeItem('manacle_session');
                                    apiFetch('/api/logout').then(() => {
                                        // Hard redirect to ensure clean state
                                        window.location.href = '/login';
                                    });
                                }}
                            >
                                Logout
                            </Button>
                        ) : (
                            <>
                                <Link to="/login" className="w-full" onClick={() => { }}>
                                    <Button className="w-full bg-gradient-to-r from-primary to-accent">Login</Button>
                                </Link>
                                <Link to="/signup" className="w-full" onClick={() => { }}>
                                    <Button className="w-full bg-gradient-to-r from-[#8A2BE2] to-[#4169E1] text-white">Sign Up</Button>
                                </Link>
                            </>
                        )}
                    </div> */}
                </div>
            </div>
            {/* Animations (utility) */}
            <style>{`
        @keyframes mn-fadeIn { from { opacity:0 } to { opacity:1 } }
        .animate-fadeIn { animation: mn-fadeIn .25s ease; }
        @keyframes mn-slideDown { 0% { transform: translateY(-8px) scale(.98); opacity:0 } 100% { transform: translateY(0) scale(1); opacity:1 } }
        .animate-slideDown { animation: mn-slideDown .3s cubic-bezier(.22,.61,.36,1); }
      `}</style>
        </>
    );
};
