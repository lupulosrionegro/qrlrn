'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Lote = {
  id: number;
  numeroLote: string;
  fechaEnvasado: string; // ISO string
  variedad: { nombre: string };
  qrUrl?: string | null;
  labPdfUrl?: string | null;
  fotoUrl?: string | null;
};

export default function HomePage() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<Lote[]>([]);

  // Load lotes from API
  useEffect(() => {
    fetch('/api/lotes')
      .then((r) => r.json())
      .then((data) => {
        setLotes(data);
        setFiltered(data);
      })
      .catch((e) => console.error('Error loading lotes:', e));
  }, []);

  // Filter on search change
  useEffect(() => {
    const term = search.toLowerCase().trim();
    if (!term) {
      setFiltered(lotes);
      return;
    }
    setFiltered(
      lotes.filter((l) =>
        l.numeroLote.toLowerCase().includes(term) ||
        l.variedad.nombre.toLowerCase().includes(term)
      )
    );
  }, [search, lotes]);

  return (
    <main style={{ minHeight: '100vh', background: '#0b0f12', color: '#e5f0e5', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '48px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 48, lineHeight: 1.1, color: '#c8e8c8' }}>Lúpulos Río Negro</h1>
          <p style={{ marginTop: 8, color: '#a9c9a9' }}>Trazabilidad simple y fiable desde el lote hasta tu cerveza</p>
        </header>

        <input
          type="text"
          placeholder="Buscar por número o variedad…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            marginBottom: '20px',
            borderRadius: 6,
            border: '1px solid #2a4a2a',
            background: '#111614',
            color: '#c8e8c8',
          }}
        />

        {filtered.length === 0 ? (
          <p style={{ color: '#a8d4a8', textAlign: 'center' }}>No se encontraron lotes.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#141f14' }}>
                <th style={thStyle}>🏷 Lote</th>
                <th style={thStyle}>🌱 Variedad</th>
                <th style={thStyle}>📅 Fecha</th>
                <th style={thStyle}>🔳 QR</th>
                <th style={thStyle}>🏷 Etiqueta</th>
                <th style={thStyle}>Ver</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid #1e321e' }}>
                  <td style={tdStyle}>#{l.numeroLote}</td>
                  <td style={tdStyle}>{l.variedad.nombre}</td>
                  <td style={tdStyle}>{new Date(l.fechaEnvasado).toLocaleDateString('es-AR')}</td>
                  <td style={tdStyle}>{l.qrUrl ? <img src={l.qrUrl} alt="QR" style={{ height: 40 }} /> : '–'}</td>
                  <td style={tdStyle}>{l.labPdfUrl || l.fotoUrl ? (
                    <img src={`/api/lotes/${l.id}/etiqueta`} alt={`Etiqueta ${l.numeroLote}`} style={{ height: 50 }} />
                  ) : '–'}
                  </td>
                  <td style={tdStyle}>
                    <Link href={`/lotes/${l.numeroLote}`} style={linkStyle}>Ver detalle</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <section style={{ textAlign: 'center', padding: '40px 0', color: '#93a999' }}>
          <p style={{ margin: 0 }}>Patagonia Argentina — Lúpulos Río Negro</p>
        </section>
      </div>
    </main>
  );
}

const thStyle = {
  textAlign: 'left' as const,
  padding: '10px 14px',
  color: '#4a7a4a',
  fontWeight: 500,
  fontSize: 11,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  borderBottom: '1px solid #2a4a2a',
};

const tdStyle = {
  padding: '10px 14px',
  color: '#c8e8c8',
};

const linkStyle = {
  fontSize: 12,
  color: '#c8e8c8',
  textDecoration: 'none',
  padding: '4px 8px',
  border: '1px solid #3a6a3a',
  borderRadius: 6,
  background: '#1f3a1f',
};
