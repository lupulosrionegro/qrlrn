"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ClientHeaderToggle() {
  const path = usePathname() ?? '/';
  // Render header only for admin routes. If you want to hide header on the login page,
  // uncomment the additional exclusion for '/admin/login'.
  if (path.startsWith('/admin')) {
    // if (path === '/admin/login') return null;
    return <Header />;
  }
  return null;
}
