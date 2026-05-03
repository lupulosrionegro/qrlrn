import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { lotes, variedades } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import QRCode from 'qrcode'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      variedad_id,
      humedad,
      cosecha,
      fecha_envasado,
      publicado,
    } = body

    if (!variedad_id) {
      return NextResponse.json({ error: 'variedad_id es requerido' }, { status: 400 })
    }

    const variedad = await db.query.variedades.findFirst({
      where: eq(variedades.id, variedad_id)
    })
    if (!variedad) {
      return NextResponse.json({ error: 'Variedad no encontrada' }, { status: 404 })
    }

    const anio = new Date().getFullYear()
    const lotesDelAnio = await db.query.lotes.findMany()
    const numeroCorrelativo = lotesDelAnio
      .map((lote) => {
        const [prefijoAnio, correlativo] = lote.numeroLote.split('-')
        if (prefijoAnio !== String(anio)) return 0
        const valor = Number.parseInt(correlativo, 10)
        return Number.isFinite(valor) ? valor : 0
      })
      .reduce((maximo, actual) => Math.max(maximo, actual), 0)
    const numero = String(numeroCorrelativo + 1).padStart(4, '0')
    const numeroLote = `${anio}-${numero}`

    const baseUrl = process.env.NEXTAUTH_URL || 'https://qr.lupulosrionegro.com.ar'
    const loteUrl = `${baseUrl}/lotes/${numeroLote}`

    const qrDataUrl = await QRCode.toDataURL(loteUrl, { width: 300, margin: 2 })

    const [nuevoLote] = await db.insert(lotes).values({
      numeroLote,
      variedadId: variedad_id,
      // Humedad/temperatura ya no forman parte del flujo operativo actual.
      humedad: typeof humedad === 'number' ? humedad : 0,
      temperatura: null,
      pesoGramos: 1000,
      cosecha: cosecha ?? anio,
      sensorId: null,
      qrUrl: qrDataUrl,
      publicado: publicado ?? true,
      fechaEnvasado: fecha_envasado ? new Date(fecha_envasado) : new Date(),
    }).returning()

    return NextResponse.json({
      ok: true,
      lote: {
        id: nuevoLote.id,
        numero_lote: numeroLote,
        variedad: variedad.nombre,
        url: loteUrl,
        qr_url: qrDataUrl,
        etiqueta_url: `${baseUrl}/api/lotes/${nuevoLote.id}/etiqueta`,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando lote:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// Listar lotes (para el panel admin)
export async function GET() {
  try {
    const todosLosLotes = await db.query.lotes.findMany({
      with: { variedad: true },
      orderBy: (lotes, { desc }) => [desc(lotes.createdAt)],
    })
    return NextResponse.json(todosLosLotes)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
