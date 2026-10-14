---
name: perceptual-color-palette
description: Genera paletas cromáticas perceptualmente uniformes a partir de las especificaciones de design.md.
---

# Perceptual Color Palette

## Objetivo

Generar paletas de color basadas en luminosidad percibida mediante OKLab/OKLCH, con escalas tonales coherentes entre diferentes familias cromáticas.

Esta paleta será la base cromática del sistema de diseño. Otra skill podrá utilizarla para generar los tokens semánticos correspondientes.

## 0. Instrucción inicial

Antes de generar la paleta, comprueba si el usuario ha proporcionado un archivo `design.md` o ha indicado dónde encontrarlo.

- **Si existe**, léelo y contrasta su contenido con los requisitos de la sección 1. Pregunta únicamente por los datos que falten o sean ambiguos.
- **Si no existe o no está disponible**, recoge los requisitos de la sección 1 preguntando al usuario **en secuencia**, para no abrumarle:
  - Haz una pregunta cada vez, siguiendo el orden de la lista.
  - Espera la respuesta antes de formular la siguiente.
  - Cuando sea razonable, propón un valor por defecto que el usuario pueda aceptar con una palabra.
  - Si una respuesta ya cubre varios requisitos, no los vuelvas a preguntar.

No generes la paleta hasta que todos los requisitos estén definidos.

Comunícate con un lenguaje amable, directo y conciso. Evita preguntas innecesarias y no solicites información que ya esté disponible. Limita las decisiones que recaen en el usuario a las imprescindibles: decide tú el resto aplicando los criterios de esta skill. Mantén las preguntas en lenguaje de diseño y evita exponer al usuario detalles técnicos de cálculo (porcentajes, grados, ratios), salvo que los pida.

## 1. Requisitos

Para generar la paleta deben estar definidos todos estos aspectos. La decisión puede provenir de `design.md` o de las respuestas del usuario:

- **Intención visual:** estilo y personalidad de la interfaz.
- **Colores de referencia:** colores proporcionados por el usuario o criterios para seleccionarlos.
- **Número de tonos:** cantidad total de tonos por familia cromática, **siempre incluyendo los semitonos** (por ejemplo, 11 = `50`, `100`–`900` y `950`). Solo se interpreta de otra forma si el usuario lo expresa en `design.md` o en el chat.
- **Cláusula de variabilidad:** si las relaciones de contraste y las distancias de matiz aceptan más variabilidad de la normal, con el fin de lograr una interfaz más expresiva en detrimento de la consistencia. Si no se define, se aplica el modo estricto.
  - **Cómo preguntarlo:** formula la pregunta de forma clara y sin tecnicismos. Pregunta si la paleta debe ser **estricta** o **expresiva**, y explica solo la prioridad de cada una: si es estricta, se prioriza la accesibilidad; si es expresiva, se prioriza la riqueza de tonos.
  - No menciones porcentajes, grados, ratios ni otros valores técnicos. Propón la opción que mejor encaje con la intención visual, indicando brevemente por qué.
- **Color neutral:** temperatura del tinte, cálida o fría.
- **Formato de salida:** OKLCH, RGB o HEX.

## 2. Generar las paletas

Utiliza OKLab/OKLCH para generar escalas tonales basadas en niveles compartidos de luminosidad perceptiva.

### Uniformidad perceptiva

- Define una escala compartida de luminosidad OKLab para todas las familias cromáticas.
- Genera cada paleta a partir de esa escala, adaptando el croma y el matiz para conservar la identidad de cada color.
- Valida las relaciones de contraste entre niveles equivalentes de las distintas familias cromáticas.
- Ajusta los colores cuando sea necesario para mantener relaciones de contraste similares sin comprometer innecesariamente la identidad cromática.
- No generes las escalas modificando únicamente la luminosidad de los colores originales sin validar los resultados.

La luminosidad compartida es el criterio de generación; la similitud de las relaciones de contraste entre niveles equivalentes es el criterio de validación.

Prioriza la coherencia de la escala. Si necesitas desviarte de ella para mejorar la similitud del contraste, minimiza y registra la desviación.

### Margen de variabilidad

La igualdad exacta de contraste entre familias no es alcanzable (cuantización del formato, límites del gamut y diferencias entre luminosidad OKLab y luminancia WCAG). Por eso la similitud se mide con un margen relativo por nivel tonal.

**Medición de contraste (referencia única de la skill):** el contraste se calcula con la fórmula WCAG frente a blanco, sobre los valores finales ya cuantizados al formato de salida.

`desviación = (ratio máximo ÷ ratio mínimo) − 1`, calculada entre todas las familias, neutral incluido, en un mismo nivel.

| | Modo estricto (por defecto) | Modo expresivo (cláusula activa) |
|---|---|---|
| Desviación de contraste por nivel | ≤ **2 %** | ≤ **9 %** (≈ 0.4 puntos de ratio en el umbral AA, 4.5:1) |
| ΔL respecto a la escala compartida | ≤ **0.025** | Sin límite propio, acotada por el margen de contraste |
| Distancia mínima de matiz entre familias cromáticas | `min(40°, 288° ÷ n)` | `min(20°, 144° ÷ n)` |

`n` es el número de familias cromáticas, sin contar el neutral. Cuantas más familias, más se reduce la distancia exigida (por ejemplo, con n = 5: 40° estricto y 20° expresivo; con n = 10: 28.8° y 14.4°). La distancia se mide sobre el matiz base de cada familia, de forma circular. El límite se aplica a los colores que elige la skill; si los colores de referencia del usuario están más cerca, se respetan y se indica.

Minimiza la desviación dentro del margen aplicable y registra la desviación real obtenida por nivel.

### Distribución tonal

Distribuye los niveles de luminosidad siguiendo estas reglas:

- **Tonos claros:** distancias pequeñas entre niveles para obtener fondos sutiles.
- **Tonos medios:** distancias más amplias para diferenciar claramente los colores.
- **Tonos oscuros:** distancias pequeñas para permitir superficies diferenciadas pero visualmente próximas en modo oscuro.

Genera la distribución en función del número de tonos solicitado, respetando estas reglas.

### Nomenclatura tonal

- La nomenclatura predeterminada utilizará incrementos de 100: `100`, `200`, `300`, `400`, etc.
- El número de tonos incluye siempre los semitonos: `50` entre el blanco y el primer nivel, y el semitono final (`950` en una escala de `100` a `900`) entre el último nivel y el negro. Con N tonos, hay N − 2 niveles de incremento 100 (`100` … `(N−2)·100`) más los dos semitonos.
- No cambies la nomenclatura predeterminada salvo que el usuario lo solicite expresamente.
- Todas las familias cromáticas tendrán el mismo número de tonos y seguirán la misma estructura tonal.

### Selección de colores

- Si no se proporcionan colores concretos, selecciónalos según la intención visual, respetando las distancias de matiz de la sección anterior, y señala cuál es la familia de énfasis.
- Utiliza nombres de color en inglés que describan el color representado: `red`, `blue`, `violet`, `green`, etc.

#### Colores de referencia

Si el usuario proporciona colores de referencia, inclúyelos como base de sus respectivas familias cromáticas (como mínimo, una familia por color). Para ubicarlos:

1. Espera a conocer el número de tonos y define la escala compartida de luminosidad.
2. Calcula la luminosidad OKLab de cada color y asígnalo al nivel de la escala más cercano.
3. Comprueba si, en ese nivel, el color encaja en el margen de variabilidad elegido: su contraste debe quedar dentro del margen respecto al de las demás familias en ese nivel.
4. Si todos encajan, se incorporan tal cual en su nivel.
5. Si alguno no encaja, pide al usuario que **priorice** cuál de los colores proporcionados debe servir de base para generar la paleta. Esta es la única decisión adicional que se le plantea. El color prioritario se considera la familia de énfasis y tiene prioridad en croma e identidad.
6. Con el color prioritario, ajusta lo mínimo la escala compartida para que ocupe su nivel, manteniendo las reglas de distribución tonal. Evalúa el resto frente a la escala ajustada. Los que sigan sin encajar aportan únicamente matiz y croma a su familia, y se registra.

### Paleta neutral

- Incluye blanco puro (`#FFFFFF`) y negro puro (`#000000`) como extremos, con los niveles `0` y `1000` respectivamente (`neutral-0` y `neutral-1000`). No cuentan para el número de tonos.
- Genera los tonos intermedios con el tinte cálido o frío especificado en `design.md` o indicado por el usuario.
- Mantén una distribución tonal coherente con el resto de las familias cromáticas.

### Cálculo

Todos los valores (OKLab/OKLCH, gamut, contrastes, desviaciones y cuantización) deben calcularse con un script, nunca estimarse a mano. Usa el método más eficiente, que aquí es el menor tiempo de cálculo y el menor consumo de tokens sin perder precisión:

- **Herramienta:** un único script en Python 3 con la biblioteca estándar (`math`), sin dependencias. Escríbelo en un directorio temporal, fuera de los archivos del proyecto.
- **Conversiones:** OKLCH ↔ sRGB lineal mediante las matrices de OKLab, con gamma sRGB para la cuantización al formato de salida.
- **Gamut:** croma máximo para cada luminosidad y matiz por bisección (unas 40 iteraciones), usando como máximo el 97 % para evitar recortes.
- **Contraste:** luminancia relativa WCAG sobre el valor cuantizado, no sobre el teórico.
- **Ajuste:**
  1. Genera cada familia sobre la escala compartida, con croma limitado por el gamut.
  2. Calcula la desviación por nivel.
  3. Si un nivel supera el margen, corrige solo la luminosidad de las familias desviadas por bisección hacia el contraste objetivo (el del neutral en modo estricto, la mediana del nivel en modo expresivo).
  4. Entre los valores cuantizados vecinos, elige el más cercano al objetivo.
- **Ejecución:** hazlo todo en una sola ejecución, con el algoritmo completo dentro del script, y haz que imprima únicamente el resultado final: los valores, la desviación por nivel, el ΔL máximo y las distancias de matiz. No imprimas trazas intermedias.

## 3. Nomenclatura y formato de salida

Genera las variables utilizando exactamente esta nomenclatura:

`--core-color-$colorname-$colorshade: $value`

Ejemplo:

`--core-color-red-500: #EA5B0C`

El formato de los valores será el especificado en `design.md` o indicado por el usuario: OKLCH, RGB o HEX.

Mantén una nomenclatura consistente y la misma estructura tonal en todas las familias cromáticas.

## 4. Validación

Antes de entregar la paleta, comprueba que:

- Todas las familias contienen el número de tonos solicitado, incluyendo los semitonos.
- La nomenclatura respeta las convenciones definidas.
- La desviación de contraste de cada nivel, medida según la sección 2, está dentro del margen del modo aplicable.
- El ΔL respeta el límite del modo estricto, si aplica.
- La distancia de matiz entre familias respeta el límite del modo aplicable.
- La distribución tonal respeta las reglas establecidas para fondos claros, tonos medios y superficies oscuras.
- Los colores de referencia se han incorporado según el procedimiento de la sección 2.
- El formato de salida es consistente.
- Los colores son reproducibles en el espacio de color de destino.

Si la paleta no cumple estos criterios, corrígela antes de entregarla.

No afirmes que las relaciones de contraste son idénticas si no se ha comprobado. Indica siempre qué no se ha comprobado (por ejemplo, contrastes entre familias distintas, daltonismo o percepción real en pantalla) y las desviaciones relevantes que persistan.

## 5. Entrega

La paleta es lo primero que se entrega: completa, en el formato solicitado y con todas las variables ordenadas por familia cromática y nivel tonal.

- **Si la solicitud proviene de un sistema de agentes**, el resultado es únicamente el código con la paleta, sin texto adicional, para que el modelo pueda continuar con otros pasos.
- **En el resto de los casos**, añade después de la paleta:
  1. Un resumen de las especificaciones aplicadas.
  2. La tabla de validación por nivel (desviación de contraste, ΔL máximo y distancias de matiz).
  3. Lo que no se ha comprobado y cualquier desviación relevante.

No generes tokens semánticos. Esta tarea corresponde exclusivamente a la capa cromática del sistema de diseño.
