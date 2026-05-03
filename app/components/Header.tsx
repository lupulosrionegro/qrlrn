import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

export default function Header() {
  const [logoVisible, setLogoVisible] = React.useState(true);
  return (
    <header className="w-full bg-gray-900/90 border-b border-white/10 backdrop-blur z-50">
      <div className="w-full max-w-7xl mx-auto px-4 py-3 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo with simple fallback if image fails to load */}
          {logoVisible ? (
            <img
              src="/logo-lupulos.png"
              alt="Lúpulos Río Negro logo"
              className="h-9 w-9 object-contain"
              onError={() => setLogoVisible(false)}
            />
          ) : (
            <svg viewBox="0 0 36 36" className="h-9 w-9" aria-label="logo-fallback">
              <circle cx="18" cy="18" r="18" fill="#16a34a" />
              <text x="50%" y="54%" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif">LRN</text>
            </svg>
          )}
          <span className="text-white font-semibold text-xl tracking-tight">Lúpulos Río Negro</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm uppercase tracking-wider">
          <Link href="/">Inicio</Link>
          <Link href="/lotes">Lotes</Link>
          <Link href="/variedades">Variedades</Link>
          <Link href="/admin/login">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
