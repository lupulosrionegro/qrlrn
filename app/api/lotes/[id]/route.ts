import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { lotes } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  const lote = await db.query.lotes.findFirst({
    where: eq(lotes.id, parseInt(params.id)),
    with: { variedad: true },
  })
  if (!lote) return NextResponse.json({ error: 'Lote no encontrado' }, { status: 404 })
  return NextResponse.json(lote)
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const body = await req.json()
    const {
      foto_url,
      lab_pdf_url,
      publicado,
      variedad_id,
      cosecha,
      fecha_envasado,
    } = body

    const [actualizado] = await db.update(lotes)
      .set({
        ...(foto_url !== undefined && { fotoUrl: foto_url }),
        ...(lab_pdf_url !== undefined && { labPdfUrl: lab_pdf_url }),
        ...(publicado !== undefined && { publicado }),
        ...(variedad_id !== undefined && { variedadId: Number(variedad_id) }),
        ...(cosecha !== undefined && { cosecha: Number(cosecha) }),
        ...(fecha_envasado !== undefined && { fechaEnvasado: new Date(fecha_envasado) }),
        pesoGramos: 1000,
      })
      .where(eq(lotes.id, parseInt(id)))
      .returning()

    return NextResponse.json({ ok: true, lote: actualizado })
  } catch (error) {
    return NextResponse.json({ error: 'Error actualizando lote' }, { status: 500 })
  }
}
