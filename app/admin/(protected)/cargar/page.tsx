'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { EtiquetaPreview } from '@/app/components/EtiquetaPreview'

interface Lote { id: number; numeroLote: string; variedad: { nombre: string }; labPdfUrl: string | null; fotoUrl: string | null }

export default function CargarPage() {
  const params = useSearchParams()
  const loteIdParam = params.get('lote')

  const [lotes, setLotes] = useState<Lote[]>([])
  const [loteId, setLoteId] = useState(loteIdParam ?? '')
  const [pdf, setPdf] = useState<File | null>(null)
  const [foto, setFoto] = useState<File | null>(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const r = await fetch('/api/lotes')
        if (!r.ok) return
        const data = await r.json()
        if (mounted) setLotes(data)
      } catch {
        // ignore transient errors
      }
    }
    load()
    const interval = setInterval(() => load(), 5000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  const loteSeleccionado = lotes.find(l => String(l.id) === loteId)

  async function cargar() {
    if (!loteId || (!pdf && !foto)) return
    setLoading(true); setStatus('Subiendo archivos...')

    try {
      const lote = lotes.find(l => String(l.id) === loteId)!
      let pdfUrl = lote.labPdfUrl
      let fotoUrl = lote.fotoUrl

      if (pdf) {
        const fd = new FormData()
        fd.append('file', pdf); fd.append('tipo', 'pdf'); fd.append('lote_numero', lote.numeroLote)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        pdfUrl = data.url
      }

      if (foto) {
        const fd = new FormData()
        fd.append('file', foto); fd.append('tipo', 'foto'); fd.append('lote_numero', lote.numeroLote)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        fotoUrl = data.url
      }

      await fetch(`/api/lotes/${loteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_pdf_url: pdfUrl, foto_url: fotoUrl })
      })

      setStatus('✓ Archivos cargados correctamente')
      setPdf(null); setFoto(null)
      fetch('/api/lotes').then(r => r.json()).then(setLotes)
    } catch {
      setStatus('Error al subir los archivos. Intentá de nuevo.')
    }
    setLoading(false)
  }

  const inputStyle = { width: '100%', padding: '8px 12px', background: '#141f14', border: '1px solid #2a4a2a', borderRadius: 8, color: '#c8e8c8', fontSize: 14 } as React.CSSProperties

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#c8e8c8', marginBottom: '1.5rem' }}>Cargar laboratorio y foto</h1>

      <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 12, padding: '1.5rem', maxWidth: 560 }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: 11, color: '#4a7a4a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Seleccionar lote</label>
          <select style={inputStyle} value={loteId} onChange={e => setLoteId(e.target.value)}>
            <option value="">— Elegí un lote —</option>
            {lotes.map(l => (
              <option key={l.id} value={l.id}>#{l.numeroLote} — {l.variedad.nombre}{!l.labPdfUrl ? ' (sin lab)' : ''}{!l.fotoUrl ? ' (sin foto)' : ''}</option>
            ))}
          </select>
        </div>

        {loteSeleccionado && (
          <div style={{ background: '#141f14', border: '1px solid #1e321e', borderRadius: 8, padding: '10px 14px', marginBottom: '1.25rem', fontSize: 13 }}>
            <div style={{ color: '#a8d4a8', fontWeight: 500 }}>{loteSeleccionado.variedad.nombre} — #{loteSeleccionado.numeroLote}</div>
            <div style={{ color: '#4a7a4a', marginTop: 4 }}>
              Lab: {loteSeleccionado.labPdfUrl ? '✓ cargado' : '✗ pendiente'} &nbsp;|&nbsp; Foto: {loteSeleccionado.fotoUrl ? '✓ cargada' : '✗ pendiente'}
            </div>
          </div>
        )}

        {loteId && (
          <EtiquetaPreview loteId={loteId} />
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: 11, color: '#4a7a4a', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>PDF de laboratorio</label>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', border: '1.5px dashed #2a4a2a', borderRadius: 10, cursor: 'pointer', background: pdf ? '#1f3a1f' : 'transparent' }}>
            <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setPdf(e.target.files?.[0] ?? null)} />
            <span style={{ fontSize: 24, marginBottom: 6 }}>📄</span>
            <span style={{ fontSize: 13, color: '#6a9a6a' }}>{pdf ? pdf.name : 'Seleccionar PDF'}</span>
          </label>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: 11, color: '#4a7a4a', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Foto del lote</label>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', border: '1.5px dashed #2a4a2a', borderRadius: 10, cursor: 'pointer', background: foto ? '#1f3a1f' : 'transparent' }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFoto(e.target.files?.[0] ?? null)} />
            <span style={{ fontSize: 24, marginBottom: 6 }}>🖼️</span>
            <span style={{ fontSize: 13, color: '#6a9a6a' }}>{foto ? foto.name : 'Seleccionar imagen JPG/PNG'}</span>
          </label>
        </div>

        <button onClick={cargar} disabled={!loteId || (!pdf && !foto) || loading}
          style={{ width: '100%', padding: '11px', background: '#2a5a2a', color: '#c8e8c8', border: '1px solid #3a6a3a', borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: (!loteId || (!pdf && !foto)) ? 0.5 : 1 }}>
          {loading ? 'Subiendo...' : 'Guardar y publicar'}
        </button>

        {status && <div style={{ marginTop: 12, fontSize: 13, color: status.startsWith('✓') ? '#4a9a4a' : '#9a4a4a', textAlign: 'center' }}>{status}</div>}
      </div>
    </div>
  )
}
