import { db } from '@/lib/db'
import { lotes } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import EditarLoteForm from './ui'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarLotePage({ params }: PageProps) {
  const { id } = await params
  const loteId = Number.parseInt(id, 10)
  if (!Number.isFinite(loteId)) notFound()

  const [lote, variedades] = await Promise.all([
    db.query.lotes.findFirst({
      where: eq(lotes.id, loteId),
      with: { variedad: true },
    }),
    db.query.variedades.findMany({
      where: (variedades, { eq }) => eq(variedades.activa, true),
      orderBy: (variedades, { asc }) => [asc(variedades.nombre)],
    }),
  ])

  if (!lote) notFound()

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#c8e8c8', marginBottom: '1.5rem' }}>
        Editar lote #{lote.numeroLote}
      </h1>
      <EditarLoteForm
        loteId={lote.id}
        numeroLote={lote.numeroLote}
        variedadId={lote.variedadId}
        cosecha={lote.cosecha ?? new Date().getFullYear()}
        fechaEnvasado={new Date(lote.fechaEnvasado).toISOString().slice(0, 10)}
        publicado={lote.publicado}
        variedades={variedades.map((v) => ({ id: v.id, nombre: v.nombre }))}
      />
    </div>
  )
}
