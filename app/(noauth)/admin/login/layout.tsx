"use client";
import React from 'react'

// No-auth layout wrapper for the login page to avoid admin guard redirects
export default function NoAuthAdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
