import type { Metadata } from 'next'
import './globals.css'
import '../styles/globals.css'
import ClientHeaderToggle from './components/ClientHeaderToggle'

export const metadata: Metadata = {
  title: 'Lúpulos Río Negro',
  description: 'Trazabilidad de lúpulos patagónicos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ClientHeaderToggle />
        {children}
      </body>
    </html>
  )
}
