'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarNav() {
  const pathname = usePathname();

  const navLinks = [
    { title: 'Getting Started', href: '/docs' },
    { title: 'Trading & Yield', href: '/docs/trading-yield' },
    { title: 'Developers', href: '/docs/developers' },
  ];

  return (
    <nav className="text-sm pb-10">
      <ul role="list" className="space-y-4">
        {navLinks.map((link, idx) => {
          const isActive = pathname === link.href;

          return (
            <li key={idx}>
              <Link 
                href={link.href} 
                className={`block font-semibold transition-colors ${isActive ? 'text-nova-accent' : 'text-white hover:text-nova-accent'}`}
              >
                {link.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
