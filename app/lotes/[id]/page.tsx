import { db } from '@/lib/db'
import { lotes } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Image from 'next/image'

interface PageProps {
  params: { id: string }
}

export default async function LotePage({ params }: PageProps) {
  // Unwrap possible Promise-like params
  const id = (typeof params?.id === 'string') ? params.id : (await (params as unknown as Promise<{ id: string }>)).id
  const lote = await db.query.lotes.findFirst({
    where: eq(lotes.numeroLote, id),
    with: { variedad: true },
  })

  if (!lote) notFound()

  const fecha = new Date(lote.fechaEnvasado).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <main style={{ minHeight: '100vh', background: '#0f1a0f', color: '#e8f0e8', fontFamily: 'system-ui, sans-serif', padding: '0' }}>
      {
        lote && lote.publicado === false ? (
          <div style={{ background: '#3a2a00', color: '#ffd8a8', padding: '8px 12px', textAlign: 'center' }}>
            Este lote no está publicado. La información puede no estar disponible en la versión pública.
          </div>
        ) : null
      }
      {/* Header */}
      <div style={{ background: '#1a2e1a', borderBottom: '1px solid #2a4a2a', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 36, height: 36, background: '#4a7c4a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌿</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Lúpulos Río Negro</div>
          <div style={{ fontSize: 12, color: '#6a9a6a' }}>Patagonia Argentina</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#4a7a4a', background: '#1f3a1f', padding: '4px 10px', borderRadius: 20, border: '1px solid #2a5a2a' }}>
          ✓ Verificado
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem' }}>
  {/* Variedad + foto thumbnail (foto antes del nombre) */}
  <div style={{ marginBottom: '1.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 110, height: 74, background: '#fff', border: '1px solid #e6e6e6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {lote.fotoUrl ? (
          <Image src={lote.fotoUrl} alt={`Foto lote ${lote.numeroLote}`} width={120} height={90} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: '#aaa', fontSize: 12 }}>No foto</span>
        )}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px', color: '#c8e8c8' }}>{lote.variedad.nombre}</div>
    </div>
    <div style={{ fontSize: 14, color: '#6a9a6a', marginTop: 4 }}>Lote #{lote.numeroLote} · {fecha}</div>
  </div>

        {/* Datos principales */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.5rem' }}>
          <StatCard label="Presentación" value="1 kg" highlight />
          {lote.cosecha && <StatCard label="Cosecha" value={String(lote.cosecha)} />}
        </div>

        {/* Foto del lote retirado (solo se muestra en header) */}

        {/* PDF laboratorio */}
        {lote.labPdfUrl && (
          <a href={lote.labPdfUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#1a2e1a', border: '1px solid #2a5a2a', borderRadius: 10, textDecoration: 'none', color: '#a8d4a8', marginBottom: '1.5rem' }}>
            <div style={{ width: 36, height: 36, background: '#2a5a2a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📄</div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Informe de laboratorio</div>
              <div style={{ fontSize: 12, color: '#4a7a4a', marginTop: 2 }}>Ver análisis completo — abre en PDF</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 18 }}>↗</div>
          </a>
        )}

        {/* Trazabilidad */}
        <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 10, padding: '1rem' }}>
          <div style={{ fontSize: 11, color: '#4a7a4a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontWeight: 500 }}>Trazabilidad</div>
          <InfoRow label="Envasado" value={fecha} />
          <InfoRow label="Lote" value={`#${lote.numeroLote}`} />
          <InfoRow label="Presentación" value="1 kg" />
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ background: highlight ? '#1f3a1f' : '#141f14', border: `1px solid ${highlight ? '#3a6a3a' : '#1e321e'}`, borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, color: '#4a7a4a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: highlight ? '#90c890' : '#c8e8c8' }}>{value}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e321e', fontSize: 13 }}>
      <span style={{ color: '#4a7a4a' }}>{label}</span>
      <span style={{ color: '#a8d4a8', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const id = (typeof params?.id === 'string') ? params.id : (await (params as unknown as Promise<{ id: string }>)).id
  return { title: `Lote #${id} — Lúpulos Río Negro` }
}
