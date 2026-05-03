'use client'

import { useState } from 'react'

interface Variedad {
  id: number
  nombre: string
}

interface Props {
  loteId: number
  numeroLote: string
  variedadId: number
  cosecha: number
  fechaEnvasado: string
  publicado: boolean
  variedades: Variedad[]
}

export default function EditarLoteForm(props: Props) {
  const [variedadId, setVariedadId] = useState(String(props.variedadId))
  const [cosecha, setCosecha] = useState(String(props.cosecha))
  const [fechaEnvasado, setFechaEnvasado] = useState(props.fechaEnvasado)
  const [publicado, setPublicado] = useState(props.publicado)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  async function guardar() {
    setLoading(true)
    setStatus('Guardando cambios...')
    try {
      const res = await fetch(`/api/lotes/${props.loteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variedad_id: Number(variedadId),
          cosecha: Number(cosecha),
          fecha_envasado: fechaEnvasado,
          publicado,
        }),
      })

      if (!res.ok) throw new Error('Error')
      setStatus('Cambios guardados correctamente.')
    } catch {
      setStatus('No se pudieron guardar los cambios.')
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
    <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 12, padding: '1.5rem', maxWidth: 680 }}>
      <div style={{ marginBottom: 14, fontSize: 13, color: '#6a9a6a' }}>
        Lote: #{props.numeroLote} · Presentacion fija: 1 kg
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
        <div>
          <label style={{ fontSize: 11, color: '#4a7a4a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Variedad</label>
          <select style={inputStyle} value={variedadId} onChange={(e) => setVariedadId(e.target.value)}>
            {props.variedades.map((v) => (
              <option key={v.id} value={v.id}>{v.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#4a7a4a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cosecha</label>
          <input style={inputStyle} value={cosecha} onChange={(e) => setCosecha(e.target.value)} type="number" step="1" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#4a7a4a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fecha de envasado</label>
          <input style={inputStyle} value={fechaEnvasado} onChange={(e) => setFechaEnvasado(e.target.value)} type="date" />
        </div>
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c8e8c8', fontSize: 14 }}>
            <input type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} />
            Publicado
          </label>
        </div>
      </div>
      <button
        onClick={guardar}
        disabled={loading}
        style={{ width: '100%', padding: '11px', background: '#2a5a2a', color: '#c8e8c8', border: '1px solid #3a6a3a', borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
      >
        {loading ? 'Guardando...' : 'Guardar lote'}
      </button>
      {status && <div style={{ marginTop: 12, fontSize: 13, color: status.startsWith('No') ? '#9a4a4a' : '#4a9a4a' }}>{status}</div>}
    </div>
  )
}
