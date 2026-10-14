# Paleta base (perceptual-color-palette)

Generada con un script de Python 3 (solo `math`) siguiendo `perceptual-color-palette.md` y los requisitos de `design.md`:

- **Intención:** cercana y motivadora, con un toque de chispa; paleta **expresiva** (margen de contraste ≤ 9 %).
- **Familias (6):** `teal` (marca, énfasis, H 185), `lime` (chispa, H 125), `green` (acierto, H 150), `red` (fallo, H 27), `sky` (info, H 235) y `neutral` cálido (H 65, «un pelín de naranja»).
- **Tonos:** 11 por familia (`50`, `100`–`900`, `950`); `neutral` añade `0` (#FFFFFF) y `1000` (#000000).
- **Escala compartida de luminosidad OKLab:** 0.980 · 0.955 · 0.915 · 0.855 · 0.760 · 0.650 · 0.540 · 0.450 · 0.370 · 0.290 · 0.210 (pasos pequeños en claros y oscuros, amplios en medios).
- **Formato de salida:** OKLCH. Los tokens finales (`marca`, `chispa`, `acierto`, `fallo`, `info`, `neutral`) toman el valor directamente, sin variables `--core-*`.
- **Temas adicionales:** Azul Klein (H 264) y Amarillo (H 95), generados con el mismo algoritmo y el mismo objetivo de contraste por nivel, para que el HTML no cambie. Solo redefinen `marca-*`.

## Valores (hex aproximado, solo orientativo)

| Tono | teal      | lime      | green     | red       | sky       | neutral   |
| ---- | --------- | --------- | --------- | --------- | --------- | --------- |
| 50   | `#e4fefa` | `#f3fce6` | `#ebfeee` | `#fff7f6` | `#f3faff` | `#fbf9f6` |
| 100  | `#c5fcf4` | `#e6f7cb` | `#d6fadc` | `#ffedeb` | `#e3f4fe` | `#f5f0ec` |
| 200  | `#92f6e9` | `#d2efa1` | `#b3f4bf` | `#feddd9` | `#c8eafe` | `#e9e4df` |
| 300  | `#25ead8` | `#b7e064` | `#82e79a` | `#fec4bd` | `#9dd9fd` | `#d7d1cb` |
| 400  | `#21c9ba` | `#96c31a` | `#3acd6b` | `#fd998e` | `#44bffd` | `#bab3ac` |
| 500  | `#16a396` | `#799e14` | `#17a750` | `#fc5950` | `#159bd5` | `#989089` |
| 600  | `#107e74` | `#5d7a0c` | `#0e823c` | `#dc1e23` | `#0f78a6` | `#776f68` |
| 700  | `#09625a` | `#475e07` | `#09652d` | `#af0d16` | `#085d82` | `#5c5650` |
| 800  | `#064943` | `#354705` | `#054c20` | `#86080e` | `#054662` | `#45403b` |
| 900  | `#03332e` | `#233102` | `#023414` | `#5e0709` | `#033045` | `#302b28` |
| 950  | `#011d1a` | `#131c01` | `#011e09` | `#390404` | `#011b29` | `#1b1816` |

## Validación

```
Distancia min de matiz: 25 ; requerida (expresivo) >= 20
tono  desv.antes  desv.final  contraste objetivo
  50      1.3%     0.20%   1.054
 100      2.8%     0.21%   1.129
 200      5.2%     0.24%   1.266
 300      8.9%     0.24%   1.517
 400     13.5%     0.30%   2.078
 500     19.3%     0.26%   3.133
 600     19.2%     0.42%   4.918
 700     16.1%     0.39%   7.261
 800     12.2%     0.33%   10.235
 900      7.8%     0.29%   13.940
 950      3.6%     0.15%   17.613
dL max respecto a la escala compartida: 0.033
temas: desviación máx vs objetivo: 0.20%
```

- Desviación de contraste (WCAG frente a blanco, sobre valores cuantizados) entre familias, neutro incluido: **≤ 0,42 %** por nivel; las 5 cromáticas + neutro parten de hasta un 19 % de desviación en los tonos medios con la escala compartida sin ajustar.
- Los dos temas adicionales quedan a ≤ 0,20 % del contraste objetivo de cada nivel.
- Distancia de matiz mínima entre familias cromáticas: 25° (requerido en modo expresivo con n = 5: 20°).

## Qué no se ha comprobado

Daltonismo, percepción real en pantalla y contrastes entre familias distintas más allá de la comparación frente a blanco. El ΔL de hasta 0,033 respecto a la escala compartida se debe a los ajustes de contraste (lime y amarillo necesitan bajar luminosidad para igualar a los fríos). `teal-300` tiene más croma que `teal-400` porque el gamut sRGB limita el croma en claros altos.
