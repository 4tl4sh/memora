// Variables de entorno del navegador, leídas en un único sitio y ya convertidas
// (VITE_SHOW_DEVTOOLS llega como texto: aquí pasa a ser un booleano de verdad)

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Studia'

export const SHOW_DEVTOOLS = import.meta.env.VITE_SHOW_DEVTOOLS === 'true'
