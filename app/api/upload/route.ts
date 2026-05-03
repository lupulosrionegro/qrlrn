import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const tipo = formData.get('tipo') as string  // 'pdf' | 'foto'
  const loteNumero = formData.get('lote_numero') as string

  if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })

  const extension = file.name.split('.').pop()
  const filename = `lotes/${loteNumero}/${tipo}.${extension}`

  const blob = await put(filename, file, {
    access: 'public',
    contentType: file.type,
    allowOverwrite: true,
  })

  return NextResponse.json({ url: blob.url })
}
