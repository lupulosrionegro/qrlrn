import React, { useEffect, useState } from 'react'

type Props = {
  loteId: number | string | null
}

// Simple visual preview of la etiqueta SVG para un lote. Se renderiza como una <img> que apunta al endpoint
// /api/lotes/{id}/etiqueta para conseguir el SVG. También ofrecemos un enlace de descarga opcional.
export const EtiquetaPreview: React.FC<Props> = ({ loteId }) => {
  if (!loteId) return null
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!loteId) return
    const t = setInterval(() => setTick(x => x + 1), 15000)
    return () => clearInterval(t)
  }, [loteId])
  const src = `/api/lotes/${loteId}/etiqueta?cb=${tick}`
  const downloadHref = `/api/lotes/${loteId}/etiqueta?download=1`
  return (
    <section aria-label="Etiqueta preview" style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>Previsualización de etiqueta</strong>
        <a href={downloadHref} target="_blank" rel="noreferrer" style={{ fontSize: 14 }}>Descargar JSON/SVG</a>
      </div>
      {/* The SVG is fetched and rendered by the browser when using an img tag. */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <img src={src} alt={`Etiqueta lote ${loteId}`} style={{ maxWidth: '100%', height: 'auto' }} />
      </div>
    </section>
  )
}

export default EtiquetaPreview
