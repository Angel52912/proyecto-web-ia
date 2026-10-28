## 💬 Prompts utilizados

Para desarrollar **Ghibli Explorer** primero se redactó un **prompt maestro** (`PROMPT_OPENCODE.md`) con todos los requisitos de la Tarea 3: API de Studio Ghibli, restricciones, requisitos funcionales, trabajo por fases y preparación para la defensa oral. Los demás prompts se derivan de ese documento, uno por cada archivo del proyecto.

**Herramienta de IA utilizada:** Claude *(ajustar si usaron otra)*

---

### 🧱 Prompt 1: Estructura HTML (`index.html`)

**Prompt:**

> Actúa como tutor y desarrollador web senior. Estamos haciendo un proyecto de clase llamado **Ghibli Explorer**, un explorador interactivo de películas de Studio Ghibli que consume la API `https://ghibliapi.vercel.app/films`.
>
> Crea el archivo **`index.html`** con HTML puro (sin frameworks), comentarios en español y lenguaje sencillo. Debe incluir:
> - Encabezado con título, subtítulo y navegación entre dos vistas: **Películas** y **Favoritos** (con contador).
> - Un **buscador** por título y **filtros** por director y por década, más un botón **Limpiar**.
> - Un contador de resultados.
> - Mensajes visibles para: **cargando**, **error de la API** (con botón Reintentar), **sin resultados** y **sin favoritos**.
> - Contenedores vacíos donde JavaScript dibujará las tarjetas de películas y de favoritos.
> - Un `<template>` de tarjeta con imagen, título, título original, director, año, duración, puntuación, descripción y botón de favorito ❤️.
> - Etiqueta `viewport` para que sea adaptable a celulares, fuente de Google Fonts y enlaces a `style.css` y `script.js`.
>
> Usa `id` y clases claros (por ejemplo `buscador`, `filtro-director`, `contenedor-peliculas`) para poder conectarlos después con CSS y JavaScript. Al final explica qué hace cada bloque.

**¿Para qué lo usamos?** Para obtener la estructura base de la página con todos los elementos que pide la tarea.

---

### 🎨 Prompt 2: Estilos anime y diseño responsivo (`style.css`)

**Prompt:**

> Con el `index.html` anterior, crea el archivo **`style.css`** para Ghibli Explorer, con temática de **anime**: rosa sakura, azul cielo y verde bosque, fondo con degradado tipo atardecer, tarjetas redondeadas con sombras suaves y la fuente *Zen Maru Gothic*.
>
> Requisitos:
> - Empieza con un **índice comentado** de secciones y usa **variables CSS** (`:root`) para los colores.
> - Estilos para encabezado, navegación, buscador y filtros, botones, mensajes (carga, error, sin resultados) y tarjetas con proporción de póster.
> - Efecto al pasar el mouse sobre las tarjetas y el corazón de favorito, con un estado activo cuando `aria-pressed="true"`.
> - Una clase `.oculto` que esconda elementos.
> - **Diseño responsivo** para celular y computadora con CSS Grid, Flexbox y `@media`.
> - Foco visible para teclado y respeto a `prefers-reduced-motion`.
>
> Usa exactamente las clases e ids del `index.html`. Comenta en español y explica cómo funciona el diseño responsivo.

**¿Para qué lo usamos?** Para generar los estilos temáticos y que la interfaz se adapte a celulares y computadoras.

---

### ⚙️ Prompt 3: Lógica con `fetch()`, buscador, filtros y favoritos (`script.js`)

**Prompt:**

> Con el `index.html` y el `style.css` anteriores, crea el archivo **`script.js`** en JavaScript puro, sin librerías, con comentarios en español y nivel básico. Debe:
> - Conectarse a `https://ghibliapi.vercel.app/films` con **`fetch()`**, usando `async/await` y `try/catch`, y revisando `respuesta.ok`.
> - Mostrar al menos 10 películas como tarjetas, copiando el `<template>` del HTML.
> - Implementar un **buscador** por título que funcione mientras se escribe e ignore mayúsculas y acentos.
> - Crear **filtros** por director y por década con los datos reales de la API, que funcionen junto con el buscador.
> - Permitir marcar **favoritos** con un botón ❤️, guardarlos en **`localStorage`** y mostrarlos en su propia sección con un contador.
> - Mostrar mensajes de **cargando**, **error de conexión** (con botón Reintentar), **sin resultados** y **sin favoritos**.
> - Tener un índice comentado de secciones y usar los mismos ids y clases del HTML.
>
> Al final explica cómo funcionan `fetch()`, `.filter()` y `localStorage`, para poder defender el código en la presentación.

**¿Para qué lo usamos?** Para obtener la lógica completa de la aplicación: consumo de la API, búsqueda, filtros, favoritos y manejo de errores.

---

### 🔎 Nota sobre el uso de los prompts

- Los tres prompts se derivan del **prompt maestro**, que contiene los requisitos de la tarea.
- Cada prompt generó **un archivo**, por lo que corresponden a **al menos tres commits** distintos.
- El código generado se **revisó y probó** antes de subirlo al repositorio. *(Escriban aquí qué revisaron, qué corrigieron y qué errores encontraron; así completan las secciones de respuesta corregida y error resuelto del README.)*
