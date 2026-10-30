// Validación del PDF compartida entre el navegador (PdfDropzone) y el servidor (generate-test)

export const MAX_PDF_BYTES = 5 * 1024 * 1024

export const isPdf = (file: File) =>
  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
