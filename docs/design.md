# Sistema de diseño

La identidad visual de Memora y los componentes que se repiten. Sale de la prueba de concepto de la Fase 1 (`lab-01-layout-tailwind`), así que todo lo que aparece aquí ya está probado: contraste AA en los 3 temas, en claro y en oscuro.

> Regla de oro: si un valor se repite, es un **token** en `@theme`. Si un conjunto de clases se repite, es una **receta** de este documento.

---

## 1. Personalidad

- **Cercana y motivadora**, como un compañero de clase que se lo sabe todo y te echa un cable. No es infantil ni corporativa.
- **Clara antes que bonita:** al estudiar no se puede perder tiempo descifrando la interfaz.
- **Con un toque de chispa:** el acento lima aparece en los momentos de logro (racha, «Más popular», el trofeo).

### Tono de los textos

- Español de España, **tuteando**.
- Frases cortas y verbos de acción: «Crea tu primer test», «Repasar», «Comprobar».
- Celebra sin exagerar («¡Correcto!», «7 días de racha») y corrige sin culpar («No es esa. La buena es la B.»).
- Nada de jerga técnica: «la IA te propone», nunca «el modelo genera».

---

## 2. Color

Los colores se definen en `oklch()`. Mantener la luminosidad (L) y cambiar el tono (H) da escalas coherentes, y así se construyen los temas.

Utiliza la skill perceptual-color-palette.md para generar los colores base de una paleta expresiva y de neutrales ligeramente cálidos con 11 tonos por color. El número de colores será 6 incluyendo el neutral, así tendremos más opciones para construir la paleta semántica. Extrae de esta paleta base los colores de la paleta semántica definitiva. No utilices colores fuera de esa paleta. No hace falta que utilices todos los tonos y puedes descartar el uso de algún color si no es necesario para completar la paleta semática. Escoge aquellos que vayan acordes a la personalidad definida para el proyecto. Tampoco hace falta que incluyas la paleta core en las variables de color definitivas del proyecto, usa el valor del color directamente.

### 2.1 Familias

| Token | Papel | Escala |
| --- | --- | --- |
| `marca-*` | Color principal: botones, enlaces, selección. **Cambia con el tema.** | 50–950 |
| `chispa-*` | Acento lima: logros, etiquetas destacadas, el fondo del logo. | 50-950 |
| `neutral-*` | Neutros: fondos, textos, bordes. Tienen un pelín de naranja para aportar calidez. | 0–1000 |
| `acierto-*` | Feedback positivo. | 50-950 |
| `fallo-*` | Feedback negativo y errores de formulario. | 50-950 |
| `info-*` | Feedback neutral e información. | 50-950 |

### 2.2 Tema por defecto (Teal)

Utiliza color verde tipo teal como principal y construye una paleta expresiva a partir de él.

### 2.3 Uso semántico

Se proporcionan algunos ejemplos. Está permitido añadir más usos o utilizar otros tonos de cada color diferentes a los expresados aquí si el proyecto lo requiere.

| Uso | Claro | Oscuro |
| --- | --- | --- |
| Fondo de página | `bg-neutral-50` | `dark:bg-neutral-950` |
| Superficie (tarjetas, secciones alternas) | `bg-white` | `dark:bg-neutral-900` (o `800` sobre `900`) |
| Texto principal | `text-neutral-900` / títulos `text-neutral-950` | `dark:text-neutral-100` / `dark:text-white` |
| Texto secundario | `text-neutral-600` | `dark:text-neutral-300` o `400` |
| Borde | `border-neutral-200` | `dark:border-neutral-700` (`800` para separadores) |
| Botón principal | `bg-marca-600 text-white` | `dark:bg-marca-400 dark:text-marca-950` |
| Enlace o texto de marca | `text-marca-700` | `dark:text-marca-300` |
| Etiqueta suave | `bg-marca-100 text-marca-800` | `dark:bg-marca-900/60 dark:text-marca-100` |
| Acento | `bg-chispa-300 text-neutral-900` | (igual) |

### 2.4 Reglas de contraste (aprendidas en la prueba de concepto)

- Los colores de textos pequeños y botones deben cumplir con la norma de contraste mínimo 4.5 respecto al fondo.
- Para textos de más de 16px y textos sobre imágenes o elementos dinámicos debemos cumplir con mínimo 3:1 respecto al fondo.

### 2.5 Temas

Se cambian con `data-theme` en `<html>`, redefiniendo **solo** la escala `marca-*`. El HTML no cambia.

Genera dos temas adicionales que cumplan los requisitos solicitados basados en los colores azul klein y amarillo.

Ejemplo de uso:

```css
@layer base {
  [data-theme="klein"] { --color-marca-50: oklch(0.982 0.008 264); /* … */ }
  [data-theme="amarillo"] { --color-marca-50: oklch(0.975 0.02 95); /* … */ }
}
```

Va en `@layer base` porque las capas posteriores ganan a las anteriores (`base` va después de `theme`).

### 2.6 Modo oscuro

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Lo controla la clase `.dark` en `<html>`. Se combina con cualquier tema: 3 temas × 2 modos = 6 combinaciones, y todas tienen que pasar AA.

---

## 3. Tipografía

| Token | Fuente | Uso |
| --- | --- | --- |
| `font-display` | **Bricolage Grotesque** (variable) | Títulos, cifras grandes, el logo, las letras de las opciones del test. |
| `font-sans` | **Inter** (variable) | Todo lo demás. Es la fuente por defecto del `body`. |

### Escala

| Elemento | Clases |
| --- | --- |
| H1 del hero | `font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance` |
| H1 de pantalla de la app | `font-display text-3xl sm:text-4xl font-bold tracking-tight` |
| H2 de sección | `font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance` |
| Antetítulo (*eyebrow*) | `text-sm font-semibold uppercase tracking-wider text-marca-700 dark:text-marca-300` |
| H3 de tarjeta | `font-display text-xl font-bold` (en el listado de la app, `text-lg`) |
| Párrafo destacado | `text-lg text-neutral-600 dark:text-neutral-300` |
| Cifra grande | `font-display text-3xl`–`text-5xl font-bold` |
| Texto pequeño o metadatos | `text-sm` o `text-xs text-neutral-600 dark:text-neutral-400` |

- Los textos largos llevan `max-w-prose` (65ch) o `max-w-xl`/`max-w-2xl`.
- Los titulares llevan `text-balance`; los párrafos, `text-pretty`.

---

## 4. Espacio, forma y profundidad

| Aspecto | Convención |
| --- | --- |
| Contenedor | Landing: `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8`. App: `max-w-7xl`. Vista test: `max-w-2xl`. |
| Ritmo vertical de secciones | `py-16 sm:py-24` |
| Separación en rejillas | `gap-6` (tarjetas), `gap-4` (listas compactas) |
| Relleno de tarjeta | `p-5`; en tarjetas grandes y planes, `p-6 sm:p-8` |
| Radios | Botones, chips e insignias: `rounded-full`. Tarjetas: `rounded-2xl`. Planes y bloques grandes: `rounded-3xl`. Campos: `rounded-xl`. |
| Sombras | En reposo `shadow-sm`; en hover `shadow-xl`; elementos destacados `shadow-lg shadow-marca-600/25` (sombra teñida de marca) |
| Bordes | `border border-neutral-200 dark:border-neutral-700` |

---

## 5. Componentes (recetas)

### Botón principal

```html
<a class="inline-flex items-center gap-2 rounded-full bg-marca-600 px-6 py-3 font-semibold text-white
          shadow-lg shadow-marca-600/25 transition duration-200 ease-out
          hover:bg-marca-700 hover:shadow-xl motion-safe:hover:-translate-y-0.5
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500
          dark:bg-marca-400 dark:text-marca-950 dark:hover:bg-marca-300">
```

Versión compacta (cabeceras y tarjetas): `px-4 py-2 text-sm`, sin sombra.

### Botón secundario

```html
<a class="inline-flex items-center rounded-full border border-neutral-300 bg-white px-6 py-3 font-semibold text-neutral-900
          transition hover:border-marca-400 hover:text-marca-700
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500
          dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:text-marca-300">
```

### Botón de acento (sobre fondos de marca)

`bg-chispa-300 text-neutral-900 hover:bg-chispa-200 focus-visible:outline-chispa-300` (o `outline-white`).

### Botón de icono

`grid size-9 place-items-center rounded-full` + el icono + `<span class="sr-only">Acción</span>`.

### Botón desactivado

`disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-400`. Siempre con un texto que explique **por qué** está desactivado (`aria-describedby`).

### Etiquetas

- **Asignatura o tipo:** `rounded-full bg-marca-100 px-2.5 py-0.5 text-xs font-semibold text-marca-800`.
- **IA:** `rounded-full bg-chispa-200 px-2 py-0.5 text-xs font-semibold text-neutral-900` + icono `sparkles`.
- **«Más popular»:** acento, colocada con `absolute -top-4 left-1/2 -translate-x-1/2` sobre una tarjeta `relative`.

### Chip seleccionable (checkbox)

```html
<label class="cursor-pointer rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium
              hover:border-marca-400 has-checked:border-marca-600 has-checked:bg-marca-600 has-checked:text-white
              has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-marca-500">
  <input type="checkbox" class="sr-only" /> Respuesta única
</label>
```

### Interruptor (*toggle*)

`<label>` con el texto, después `input.peer.sr-only` y por último un `span` que hace de pista: `relative h-6 w-11 rounded-full bg-neutral-300 peer-checked:bg-marca-600`. La bolita es un pseudo-elemento: `after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white peer-checked:after:translate-x-5 motion-safe:after:transition-transform`.

### Campo de texto

```html
<input class="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5
              focus:border-marca-500 focus:bg-white focus:ring-2 focus:ring-marca-500/30 focus:outline-none
              user-invalid:border-fallo-500 user-invalid:ring-2 user-invalid:ring-fallo-500/20
              dark:border-neutral-700 dark:bg-neutral-950" />
<p class="hidden text-sm font-medium text-fallo-700 peer-user-invalid:block">Mensaje de error</p>
```

- Etiqueta siempre visible encima: `text-sm font-semibold text-neutral-800 dark:text-neutral-100`.
- Se usa `user-invalid:`, no `invalid:`: el error solo aparece cuando el usuario ya ha tocado el campo.

### Tarjeta de contenido (portada)

`<article class="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition duration-300 hover:shadow-xl motion-safe:hover:-translate-y-1">`

- La imagen va dentro de un `div.overflow-hidden`, con `aspect-video w-full object-cover motion-safe:group-hover:scale-105`.
- El cuerpo es `flex flex-1 flex-col p-5` y el pie lleva `mt-auto`, para que los botones queden alineados.

### Tarjeta de test (app, adaptable al contenedor)

```html
<li class="@container">
  <article class="flex flex-col … @md:flex-row">
    <img class="aspect-video w-full object-cover @md:aspect-square @md:w-36 @md:shrink-0 @2xl:w-48" />
    …
  </article>
</li>
```

Vertical si su hueco mide menos de 28rem y horizontal si mide más, sea cual sea el ancho de la ventana.

### Barra de progreso o dominio

`div.h-2.overflow-hidden.rounded-full.bg-neutral-100` > `div.h-full.rounded-full.bg-marca-500` con `style="width: N%"`. Es decorativa (`aria-hidden`); el porcentaje se escribe en texto al lado.

### Tarjeta de estadística

Normal: borde y fondo blanco. **Destacada:** `bg-marca-600 text-white shadow-lg shadow-marca-600/25` y un icono grande de fondo al 10 % (`text-white/10`).

### Plan destacado

`bg-marca-900 text-marca-50 ring-2 ring-marca-500 shadow-2xl lg:py-12`. El resto de planes van con borde y `bg-neutral-50`.

### FAQ / plegable

`<details class="group">` + `<summary class="list-none [&::-webkit-details-marker]:hidden …">`. La flecha lleva `group-open:rotate-180 motion-safe:transition-transform`.

### Opción de respuesta (vista test)

Una tarjeta grande (`rounded-2xl border-2 p-4`) con una letra en un cuadrado `size-9 rounded-xl font-display`. Estados:

| Estado | Cómo se activa | Aspecto |
| --- | --- | --- |
| Reposo | – | `border-neutral-200 bg-white` |
| Elegida | `has-checked:` | `border-marca-500 bg-marca-50`; la letra en `bg-marca-600 text-white` |
| Correcta | `data-[estado=correcta]:` | `border-acierto-500 bg-acierto-100`; la letra en `bg-acierto-700` |
| Incorrecta | `data-[estado=incorrecta]:` | `border-fallo-500 bg-fallo-100`; la letra en `bg-fallo-700` |

### Cabecera fija con efecto cristal

`sticky top-0 z-50 border-b border-neutral-200/70 bg-neutral-50/75 backdrop-blur-md`, con `scroll-padding-top: 6rem` en `html` para que los anclajes no queden tapados.

---

## 6. Iconos e ilustraciones

- **Iconos de interfaz:** [Lucide](https://lucide.dev), como SVG inline con `stroke="currentColor"`, `stroke-width="2"` y `aria-hidden="true"`. Tamaños: `size-4` (en texto pequeño), `size-5` (en botones) y `size-9` (en los pasos).
- **Redes sociales:** [Simple Icons](https://simpleicons.org), relleno con `currentColor`.
- Iconos habituales: `list-checks` (logo), `sparkles` (IA), `brain-circuit` (repasar), `pencil` (editar), `flame` (racha), `trophy` (resultado), `check` / `x`, `chevron-down`.
- **Ilustraciones de asignatura** (`public/img/*.svg`, 640×360): un degradado del color de la asignatura, una trama de puntos, dos fichas flotantes y el icono de Lucide grande en blanco. Sin texto. Son decorativas (`alt=""`), porque el título de la tarjeta ya informa.
- **Ilustración del hero** (`hero.svg`): unos apuntes subrayados se transforman en un test en el móvil. Lleva `alt` descriptivo.
- Las ilustraciones **no cambian con el tema**. Es intencionado: funcionan como «fotos».

---

## 7. Movimiento

| Animación | Token o clase | Uso |
| --- | --- | --- |
| Entrada | `animate-aparecer` (0.6 s ease-out) | Elementos del hero en cascada, con `[animation-delay:100ms]`, `200ms`… También la caja de feedback. |
| Flotar | `animate-flotar` (5 s, infinito) | La tarjeta de racha del hero. |
| Rebote | `animate-bounce` | El trofeo del resultado. |
| Hover | `transition duration-200 ease-out` + `-translate-y-0.5` / `-translate-y-1` | Botones y tarjetas. |
| Zoom | `group-hover:scale-105` (`duration-500`) | Imágenes de las tarjetas. |

**Siempre** con `motion-safe:` si hay desplazamiento, escala o giro. Los cambios de color y sombra no lo necesitan.

---

## 8. Puntos de corte

Los de Tailwind por defecto, **mobile first**:

| Prefijo | Desde | Cambios típicos |
| --- | --- | --- |
| *(ninguno)* | 0 | Una columna, menú en segunda fila, barra de acción pegada abajo |
| `sm:` | 640 px | Tarjetas a 2 columnas, botones en fila |
| `md:` | 768 px | Hero a 2 columnas, pasos en fila, menú junto al logo |
| `lg:` | 1024 px | Tarjetas a 3 columnas, planes en fila, app con columna lateral |

Container queries (`@container`, `@md:`, `@2xl:`) para los componentes que viven en huecos de ancho variable.
