'use client'

import { useEffect, useState } from 'react'

interface Variedad {
  id: number
  nombre: string
}

export default function NuevoLotePage() {
  const [variedades, setVariedades] = useState<Variedad[]>([])
  const [variedadId, setVariedadId] = useState('')
  const [cosecha, setCosecha] = useState(String(new Date().getFullYear()))
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [resultado, setResultado] = useState<{ numero_lote: string; etiqueta_url: string; url: string } | null>(null)

  useEffect(() => {
    fetch('/api/variedades')
      .then((res) => res.json())
      .then((data) => setVariedades(data.filter((item: { activa?: boolean }) => item.activa !== false)))
  }, [])

  async function crearLote() {
    if (!variedadId) return
    setLoading(true)
    setStatus('Creando lote...')
    setResultado(null)

    try {
      const res = await fetch('/api/lotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variedad_id: Number(variedadId),
          humedad: 0,
          cosecha: cosecha ? Number(cosecha) : undefined,
          publicado: true,
        }),
      })

      if (!res.ok) throw new Error('No se pudo crear el lote')

      const data = await res.json()
      setResultado(data.lote)
      setStatus('Lote creado correctamente. Ya podes descargar la etiqueta.')
    } catch {
      setStatus('Error al crear el lote. Revisa los datos e intentalo otra vez.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    background: '#141f14',
    border: '1px solid #2a4a2a',
    borderRadius: 8,
    color: '#c8e8c8',
    fontSize: 14,
  } as React.CSSProperties

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#c8e8c8', marginBottom: '1.5rem' }}>Crear lote</h1>

      <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 12, padding: '1.5rem', maxWidth: 680 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: 11, color: '#4a7a4a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Variedad</label>
            <select style={inputStyle} value={variedadId} onChange={(e) => setVariedadId(e.target.value)}>
              <option value="">Selecciona una variedad</option>
              {variedades.map((v) => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#4a7a4a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cosecha</label>
            <input style={inputStyle} value={cosecha} onChange={(e) => setCosecha(e.target.value)} placeholder="Ej: 2026" type="number" step="1" />
          </div>
        </div>
        <div style={{ marginBottom: '1rem', fontSize: 12, color: '#6a9a6a' }}>Presentacion fija: 1 kg por lote.</div>

        <button
          onClick={crearLote}
          disabled={!variedadId || loading}
          style={{
            width: '100%',
            padding: '11px',
            background: '#2a5a2a',
            color: '#c8e8c8',
            border: '1px solid #3a6a3a',
            borderRadius: 9,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            opacity: !variedadId ? 0.5 : 1,
          }}
        >
          {loading ? 'Creando...' : 'Crear lote y generar QR'}
        </button>

        {status && (
          <div style={{ marginTop: 12, fontSize: 13, color: status.startsWith('Error') ? '#9a4a4a' : '#4a9a4a' }}>
            {status}
          </div>
        )}

        {resultado && (
          <div style={{ marginTop: 14, background: '#141f14', border: '1px solid #1e321e', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ color: '#a8d4a8', marginBottom: 10, fontWeight: 500 }}>Lote #{resultado.numero_lote}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href={resultado.etiqueta_url} download style={{ fontSize: 12, color: '#a8d4a8', textDecoration: 'none', padding: '6px 10px', border: '1px solid #2a5a2a', borderRadius: 6, background: '#1f3a1f' }}>
                Descargar etiqueta (SVG)
              </a>
              <a href={resultado.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#6a9a6a', textDecoration: 'none', padding: '6px 10px', border: '1px solid #2a4a2a', borderRadius: 6 }}>
                Ver lote publicado
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
