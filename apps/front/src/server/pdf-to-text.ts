import { createServerFn } from '@tanstack/react-start'

export const MAX_PDF_BYTES = 5 * 1024 * 1024

export const isPdf = (file: File) =>
  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

// Convierte el PDF a texto plano en el servidor. El navegador ya valida el fichero,
// pero se vuelve a comprobar aquí porque la petición puede llegar de cualquier sitio.
export const pdfToText = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error('Formato de petición no válido')
    const file = data.get('file')
    if (!(file instanceof File)) throw new Error('Falta el fichero')
    if (!isPdf(file)) throw new Error('El fichero debe ser un PDF')
    if (file.size > MAX_PDF_BYTES) throw new Error('El PDF no puede superar 5 MB')
    return file
  })
  .handler(async ({ data: file }) => {
    // Import dinámico: pdf-parse (y pdfjs) no debe acabar en el bundle del navegador.
    // pdf-parse/worker va primero: define en Node los globales que pdfjs espera (DOMMatrix…)
    const { CanvasFactory } = await import('pdf-parse/worker')
    const { PDFParse } = await import('pdf-parse')
    const parser = new PDFParse({
      data: new Uint8Array(await file.arrayBuffer()),
      CanvasFactory,
    })
    try {
      // Sin las marcas "-- 1 of 3 --" entre páginas
      const result = await parser.getText({ pageJoiner: '' })
      return { text: result.text.trim(), pages: result.total }
    } finally {
      await parser.destroy()
    }
  })
