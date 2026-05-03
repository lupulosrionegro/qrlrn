import { db } from '@/lib/db'
import { lotes } from '@/lib/schema'
import { desc } from 'drizzle-orm'
import Link from 'next/link'

export default async function AdminPage() {
  const todos = await db.query.lotes.findMany({
    with: { variedad: true },
    orderBy: [desc(lotes.createdAt)],
    limit: 50,
  })

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#c8e8c8', marginBottom: 4 }}>Lotes registrados</h1>
        <p style={{ fontSize: 13, color: '#4a7a4a' }}>Gestionados desde admin. Cada lote incluye QR y etiqueta descargable.</p>
      </div>

      <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
            <tr style={{ background: '#141f14' }}>
              <th style={{ textAlign: 'left', padding: '10px 14px', color: '#4a7a4a', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #2a4a2a' }}>🏷 Lote</th>
              <th style={{ textAlign: 'left', padding: '10px 14px', color: '#4a7a4a', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #2a4a2a' }}>🌱 Variedad</th>
              <th style={{ textAlign: 'left', padding: '10px 14px', color: '#4a7a4a', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #2a4a2a' }}>📅 Fecha</th>
              <th style={{ textAlign: 'left', padding: '10px 14px', color: '#4a7a4a', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #2a4a2a' }}>📦 Presentación</th>
              <th style={{ textAlign: 'left', padding: '10px 14px', color: '#4a7a4a', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #2a4a2a' }}>🧪 Lab.</th>
              <th style={{ textAlign: 'left', padding: '10px 14px', color: '#4a7a4a', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #2a4a2a' }}>🖼 Foto</th>
              <th style={{ textAlign: 'left', padding: '10px 14px', color: '#4a7a4a', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #2a4a2a' }}>🔳 QR</th>
              <th style={{ textAlign: 'left', padding: '10px 14px', color: '#4a7a4a', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #2a4a2a' }}>🏷 Etiqueta</th>
              <th style={{ textAlign: 'left', padding: '10px 14px', color: '#4a7a4a', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #2a4a2a' }}>⚙ Acción</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((lote, i) => (
              <tr key={lote.id} style={{ borderBottom: i < todos.length - 1 ? '1px solid #1e321e' : 'none' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: '#a8d4a8' }}>#{lote.numeroLote}</td>
                <td style={{ padding: '12px 14px', color: '#c8e8c8' }}>{lote.variedad.nombre}</td>
                <td style={{ padding: '12px 14px', color: '#6a9a6a' }}>{new Date(lote.fechaEnvasado).toLocaleDateString('es-AR')}</td>
                <td style={{ padding: '12px 14px', color: '#c8e8c8', fontWeight: 500 }}>1 kg</td>
                <td style={{ padding: '12px 14px' }}>
                  <Badge ok={!!lote.labPdfUrl} />
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <Badge ok={!!lote.fotoUrl} />
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <Badge ok={!!lote.qrUrl} />
                </td>
                <td style={{ padding: '12px 14px' }}>
                {lote.labPdfUrl || lote.fotoUrl ? (
                    <img src={`/api/lotes/${lote.id}/etiqueta`} alt={`Etiqueta ${lote.numeroLote}`} style={{ height: 70, width: 'auto', display: 'block' }} />
                  ) : null}
                </td>
                <td style={{ padding: '12px 14px', display: 'flex', gap: 8 }}>
                  <Link href={`/admin/lotes/${lote.id}`} style={{ fontSize: 12, color: '#c8e8c8', textDecoration: 'none', padding: '4px 8px', border: '1px solid #3a6a3a', borderRadius: 6 }}>
                    Editar lote
                  </Link>
                  <Link href={`/admin/cargar?lote=${lote.id}`} style={{ fontSize: 12, color: '#6a9a6a', textDecoration: 'none', padding: '4px 8px', border: '1px solid #2a4a2a', borderRadius: 6 }}>
                    Cargar archivos
                  </Link>
                  <a href={`/api/lotes/${lote.id}/etiqueta`} download style={{ fontSize: 12, color: '#a8d4a8', textDecoration: 'none', padding: '4px 8px', border: '1px solid #2a5a2a', borderRadius: 6, background: '#1f3a1f' }}>
                    Descargar etiqueta
                  </a>
                  <Link href={`/lotes/${lote.numeroLote}`} style={{ fontSize: 12, color: '#c8e8c8', textDecoration: 'none', padding: '4px 8px', border: '1px solid #3a6a3a', borderRadius: 6, background: '#1f3a1f' }}>
                    Ver lote
                  </Link>
                </td>
              </tr>
            ))}
            {todos.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#3a5a3a' }}>Sin lotes todavía. Crea el primero desde "Nuevo lote".</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Badge({ ok }: { ok: boolean }) {
  return (
    <span style={{ background: ok ? '#1f3a1f' : '#2a1f1f', color: ok ? '#4a9a4a' : '#7a4a4a', fontSize: 11, padding: '2px 8px', borderRadius: 20, border: `1px solid ${ok ? '#2a5a2a' : '#4a2a2a'}` }}>
      {ok ? 'Cargado' : 'Pendiente'}
    </span>
  )
}
