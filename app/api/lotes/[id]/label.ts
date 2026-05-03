import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { lotes } from '@/lib/schema'
import { eq } from 'drizzle-orm'

// GET /api/lotes/[id]/label
// - preview: && download: 1 to trigger attachment download
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const lote = await db.query.lotes.findFirst({
    where: eq(lotes.id, parseInt(id, 10)),
    with: { variedad: true },
  })
  if (!lote) {
    return NextResponse.json({ error: 'Lote no encontrado' }, { status: 404 })
  }

  const label = {
    id: lote.id,
    variedad: lote.variedad?.nombre,
    pesoGramos: lote.pesoGramos,
    labPdfUrl: lote.labPdfUrl,
    fotoUrl: lote.fotoUrl,
    fechaEnvasado: lote.fechaEnvasado?.toISOString(),
  }

  const url = req.nextUrl
  const shouldDownload = url.searchParams.get('download') === '1' || url.searchParams.get('download') === 'true'
  if (shouldDownload) {
    return new NextResponse(JSON.stringify(label), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="lote-${id}.json"`,
      },
    })
  }

  return NextResponse.json(label)
}
