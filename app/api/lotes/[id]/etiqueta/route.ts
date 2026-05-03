import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { lotes } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import QRCode from 'qrcode'

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const loteId = Number.parseInt(id, 10)
  if (!Number.isFinite(loteId)) {
    return NextResponse.json({ error: 'ID de lote invalido' }, { status: 400 })
  }

  const lote = await db.query.lotes.findFirst({
    where: eq(lotes.id, loteId),
    with: { variedad: true },
  })

  if (!lote) {
    return NextResponse.json({ error: 'Lote no encontrado' }, { status: 404 })
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'https://qr.lupulosrionegro.com.ar'
  const loteUrl = `${baseUrl}/lotes/${lote.numeroLote}`
  const qrDataUrl = lote.qrUrl ?? await QRCode.toDataURL(loteUrl, { width: 300, margin: 2 })

  const fecha = new Date(lote.fechaEnvasado).toLocaleDateString('es-AR')

  // Construir nombre de archivo basado en variedad y lote
  const slugify = (s: string) =>
    (s || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const varNombre = lote.variedad?.nombre ?? ''
  const varSlug = slugify(varNombre)
  const loteSlug = slugify(lote.numeroLote)
  const filename = varSlug ? `etiqueta-${varSlug}-${loteSlug}.svg` : `etiqueta-${loteSlug}.svg`

  // Configuracion de impresion termica:
  // - 203 dpi (8 dots por mm)
  // - ancho maximo imprimible: 108 mm => 864 dots
  // - grosor maximo de linea: 0.3 mm => ~2.4 dots (usamos 2)
  const dotsPerMm = 8
  const widthMm = 108
  const heightMm = 70
  const width = widthMm * dotsPerMm
  const height = heightMm * dotsPerMm
  const borderStroke = 2

  const imageTagInside = lote.fotoUrl ? `\n  <image href="${lote.fotoUrl}" x="${width - 160}" y="${height - 180}" width="120" height="120" />` : ''
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="white" />
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="black" stroke-width="${borderStroke}" />
  <text x="40" y="80" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="black">LUPULOS RIO NEGRO</text>
  <text x="40" y="130" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="black">${escapeXml(lote.variedad.nombre)}</text>
  <text x="40" y="185" font-family="Arial, sans-serif" font-size="26" fill="black">Lote #${escapeXml(lote.numeroLote)}</text>
  <text x="40" y="260" font-family="Arial, sans-serif" font-size="22" fill="black">Envasado: ${escapeXml(fecha)}</text>
  <text x="${width - 170}" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="black">Accedé a todos los estudios de laboratorio</text>
  ${lote.pesoGramos ? `<text x="40" y="295" font-family="Arial, sans-serif" font-size="22" fill="black">Peso: ${lote.pesoGramos} g</text>` : ''}
  ${lote.cosecha ? `<text x="40" y="330" font-family="Arial, sans-serif" font-size="22" fill="black">Cosecha: ${lote.cosecha}</text>` : ''}
  <image href="${qrDataUrl}" x="${width - 280}" y="90" width="220" height="220" />
  <text x="40" y="${height - 40}" font-family="Arial, sans-serif" font-size="16" fill="black">${escapeXml(loteUrl)}</text>${imageTagInside}
</svg>
`.trim()

  const url = req.nextUrl
  const shouldDownload = url.searchParams.get('download') === '1' || url.searchParams.get('download') === 'true'
  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Disposition': shouldDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
