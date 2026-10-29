export const MAX_PDF_BYTES = 5 * 1024 * 1024

export const isPdf = (file: File) =>
  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

// Convierte el PDF a texto plano. Solo se llama desde el servidor (generate-test):
// el texto no se devuelve al navegador.
export const extractPdfText = async (file: File) => {
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
}
