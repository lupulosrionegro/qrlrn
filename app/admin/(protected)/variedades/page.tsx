'use client'
import { useState, useEffect } from 'react'

interface Variedad { id: number; nombre: string; descripcion: string | null; activa: boolean }

export default function VariedadesPage() {
  const [variedades, setVariedades] = useState<Variedad[]>([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchVariedades() }, [])

  async function fetchVariedades() {
    const res = await fetch('/api/variedades')
    setVariedades(await res.json())
  }

  async function guardar() {
    setLoading(true)
    const method = editId ? 'PATCH' : 'POST'
    const body = editId ? { id: editId, nombre, descripcion } : { nombre, descripcion }
    await fetch('/api/variedades', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setNombre(''); setDescripcion(''); setEditId(null)
    await fetchVariedades()
    setLoading(false)
  }

  function editar(v: Variedad) {
    setEditId(v.id); setNombre(v.nombre); setDescripcion(v.descripcion ?? '')
  }

  function nuevaVariedad() {
    setEditId(null)
    setNombre('')
    setDescripcion('')
  }

  const s = { input: { width: '100%', padding: '8px 12px', background: '#141f14', border: '1px solid #2a4a2a', borderRadius: 8, color: '#c8e8c8', fontSize: 14 } as React.CSSProperties }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#c8e8c8', marginBottom: '1.5rem' }}>Variedades de lúpulo</h1>

      <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#a8d4a8', marginBottom: 14 }}>{editId ? 'Editar variedad' : 'Nueva variedad'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: '#4a7a4a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nombre</label>
            <input style={s.input} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="ej: Victoria" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#4a7a4a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Descripción (opcional)</label>
            <input style={s.input} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Notas aromáticas, origen, etc." />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={guardar} disabled={!nombre || loading}
            style={{ padding: '8px 18px', background: '#2a5a2a', color: '#c8e8c8', border: '1px solid #3a6a3a', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            {loading ? 'Guardando...' : editId ? 'Actualizar' : 'Agregar variedad'}
          </button>
          <button onClick={nuevaVariedad}
            style={{ padding: '8px 14px', background: 'transparent', color: '#a8d4a8', border: '1px solid #3a6a3a', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
            Nueva variedad
          </button>
          {editId && <button onClick={() => { setEditId(null); setNombre(''); setDescripcion('') }}
            style={{ padding: '8px 14px', background: 'transparent', color: '#6a9a6a', border: '1px solid #2a4a2a', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
            Cancelar
          </button>}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: '#3a5a3a' }}>
          Usa nombres claros y consistentes para que aparezcan correctamente en las etiquetas de impresión.
        </div>
      </div>

      <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', borderRadius: 12, overflow: 'hidden' }}>
        {variedades.map((v, i) => (
          <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < variedades.length - 1 ? '1px solid #1e321e' : 'none' }}>
            <div style={{ width: 28, height: 28, background: '#1f3a1f', border: '1px solid #2a5a2a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#4a9a4a', flexShrink: 0 }}>
              {String(v.id).padStart(2, '0')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#c8e8c8' }}>{v.nombre}</div>
              {v.descripcion && <div style={{ fontSize: 12, color: '#4a7a4a', marginTop: 1 }}>{v.descripcion}</div>}
            </div>
            <button onClick={() => editar(v)}
              style={{ fontSize: 12, color: '#6a9a6a', background: 'transparent', border: '1px solid #2a4a2a', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
              Editar
            </button>
          </div>
        ))}
        {variedades.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#3a5a3a', fontSize: 13 }}>Sin variedades cargadas todavía.</div>
        )}
      </div>
    </div>
  )
}
