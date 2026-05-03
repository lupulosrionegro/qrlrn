import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { variedades } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const todas = await db.query.variedades.findMany({
    where: eq(variedades.activa, true),
    orderBy: (v, { asc }) => [asc(v.id)],
  })
  return NextResponse.json(todas)
}

export async function POST(req: NextRequest) {
  const { nombre, descripcion } = await req.json()
  const [nueva] = await db.insert(variedades).values({ nombre, descripcion }).returning()
  return NextResponse.json(nueva, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const { id, nombre, descripcion, activa } = await req.json()
  const [actualizada] = await db.update(variedades)
    .set({ nombre, descripcion, activa, updatedAt: new Date() })
    .where(eq(variedades.id, id))
    .returning()
  return NextResponse.json(actualizada)
}
