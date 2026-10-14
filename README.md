# Memora · Landing v4 (Fase 1)

Cuarta versión de la portada, con los mismos requisitos del Lab 01 y el mismo contenido, aplicando el sistema de diseño **actual** del proyecto (`docs/design.md`, copiado de `lemoncode-project`). Mantiene el nombre Memora y su logo abstracto, sobre el fondo `chispa` que pide el diseño.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build && npm run preview
```

## Qué se aplica de design.md

- **Paleta (§2):** generada con la skill `perceptual-color-palette` (script en Python, 6 familias × 11 tonos, neutro cálido, modo expresivo). Detalle y validación en [`docs/paleta.md`](docs/paleta.md).
- **Tokens:** `marca-*` (teal), `chispa-*` (lima), `acierto-*`, `fallo-*`, `info-*` (50–950) y `neutral-*` (0–1000) en `@theme`, con el valor OKLCH directo. No hay colores fuera de la paleta: ni siquiera el blanco (se usa `neutral-0`) ni las ilustraciones SVG, que salen de los tonos de la paleta.
- **Temas (§2.5):** Teal (por defecto), Azul Klein y Amarillo, con selector en la cabecera. Solo se redefine `marca-*` en `@layer base`; el HTML no cambia. Se guarda en `memora-tema`.
- **Modo oscuro (§2.6):** `@custom-variant dark`, botón con `aria-pressed`, preferencia en `memora-oscuro` y script anti-parpadeo.
- **Tipografía (§3), forma (§4), recetas (§5), iconos (§6) y movimiento (§7):** Bricolage Grotesque + Inter, contenedor `max-w-6xl`, botón principal/secundario/acento, tarjeta de contenido, plan destacado, FAQ con `<details>`, campo con `user-invalid:`, cabecera `sticky` con cristal, `animate-aparecer` y `animate-flotar` con `motion-safe:`.

## Decisiones donde los documentos no coinciden

- `design.md` §2.1 llama `neutral-*` a los neutros, mientras que sus recetas (y `AGENTS.md`) decían `tinta-*`. Ya se han corregido a `neutral-*` en los documentos del proyecto.
- `design.md` no fija el formato de salida de la paleta: se eligió OKLCH, como el resto del proyecto.

## Contraste

Comprobado por cálculo en los 3 temas para las parejas de texto/botón/etiqueta usadas (claro y oscuro): **mínimo 4,68:1**. Falta pasar axe/Lighthouse y las capturas.
