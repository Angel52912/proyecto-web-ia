/* =====================================================
   GHIBLI EXPLORER · script.js

   ÍNDICE
   1. Configuración y estado de la aplicación
   2. Referencias a elementos del HTML
   3. Utilidades (mostrar/ocultar, normalizar texto)
   4. Conexión con la API usando fetch()
   5. Filtros: llenar los selectores
   6. Buscador y filtros: aplicar y mostrar resultados
   7. Tarjetas: crearlas a partir de la plantilla
   8. Favoritos con localStorage
   9. Navegación entre Películas y Favoritos
   10. Eventos (clics, escritura, cambios)
   11. Inicio de la aplicación
   ===================================================== */


/* =====================================================
   1. CONFIGURACIÓN Y ESTADO DE LA APLICACIÓN
   ===================================================== */

// Dirección de la API de Studio Ghibli
const URL_API = 'https://ghibliapi.vercel.app/films';

// Nombre con el que guardamos los favoritos en localStorage
const CLAVE_FAVORITOS = 'ghibli-favoritos';

// Imagen de respaldo (un SVG sencillo) por si una imagen de la API no carga
const IMAGEN_RESPALDO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">' +
    '<rect width="100%" height="100%" fill="#a8d8f0"/>' +
    '<text x="50%" y="50%" font-size="64" text-anchor="middle">🌸</text>' +
    '</svg>'
  );

// Estado: aquí guardamos los datos mientras la página está abierta
let todasLasPeliculas = [];   // películas que llegan de la API
let favoritos = [];           // lista de ids de películas favoritas


/* =====================================================
   2. REFERENCIAS A ELEMENTOS DEL HTML
   (buscamos cada elemento una sola vez por su id)
   ===================================================== */
const seccionPeliculas   = document.getElementById('seccion-peliculas');
const seccionFavoritos   = document.getElementById('seccion-favoritos');

const btnVerPeliculas    = document.getElementById('btn-ver-peliculas');
const btnVerFavoritos    = document.getElementById('btn-ver-favoritos');
const contadorFavoritos  = document.getElementById('contador-favoritos');

const inputBuscador      = document.getElementById('buscador');
const filtroDirector     = document.getElementById('filtro-director');
const filtroDecada       = document.getElementById('filtro-decada');
const btnLimpiar         = document.getElementById('btn-limpiar');
const contadorResultados = document.getElementById('contador-resultados');

const mensajeCarga       = document.getElementById('mensaje-carga');
const mensajeError       = document.getElementById('mensaje-error');
const mensajeVacio       = document.getElementById('mensaje-vacio');
const btnReintentar      = document.getElementById('btn-reintentar');

const contenedorPeliculas = document.getElementById('contenedor-peliculas');
const contenedorFavoritos = document.getElementById('contenedor-favoritos');
const mensajeSinFavoritos = document.getElementById('mensaje-sin-favoritos');

const plantillaTarjeta   = document.getElementById('plantilla-tarjeta');


/* =====================================================
   3. UTILIDADES
   ===================================================== */

// Muestra un elemento quitando la clase "oculto"
function mostrar(elemento) {
  elemento.classList.remove('oculto');
}

// Oculta un elemento agregando la clase "oculto"
function ocultar(elemento) {
  elemento.classList.add('oculto');
}

// Convierte un texto a minúsculas y le quita los acentos,
// para que "Mononoké" y "mononoke" se consideren iguales
function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Calcula la década de una película, ejemplo: "1988" -> 1980
function obtenerDecada(pelicula) {
  const anio = parseInt(pelicula.release_date, 10);
  return Math.floor(anio / 10) * 10;
}


/* =====================================================
   4. CONEXIÓN CON LA API USANDO fetch()
   ===================================================== */

// fetch() pide los datos a la API por internet.
// Es "asíncrona": el programa espera la respuesta sin congelar la página.
async function cargarPeliculas() {
  // Antes de pedir los datos: mostramos "Cargando" y ocultamos lo demás
  mostrar(mensajeCarga);
  ocultar(mensajeError);
  ocultar(mensajeVacio);
  contenedorPeliculas.innerHTML = '';
  contadorResultados.textContent = '';

  try {
    // 1) Pedimos los datos a la API
    const respuesta = await fetch(URL_API);

    // 2) Si el servidor respondió con error (404, 500...), lanzamos un error
    if (!respuesta.ok) {
      throw new Error('La API respondió con el código ' + respuesta.status);
    }

    // 3) Convertimos la respuesta (JSON) en un arreglo de JavaScript
    todasLasPeliculas = await respuesta.json();

    // 4) Preparamos los filtros y mostramos las películas
    llenarFiltros();
    aplicarFiltros();
    renderizarFavoritos();

  } catch (error) {
    // Si algo falla (sin internet, API caída...), mostramos el mensaje de error
    console.error('Error al consultar la API:', error);
    todasLasPeliculas = [];
    mostrar(mensajeError);
    renderizarFavoritos();

  } finally {
    // Pase lo que pase, quitamos el mensaje de "Cargando"
    ocultar(mensajeCarga);
  }
}


/* =====================================================
   5. FILTROS: LLENAR LOS SELECTORES
   ===================================================== */

// Crea las opciones de director y década con los datos reales de la API
function llenarFiltros() {
  // Directores sin repetir y en orden alfabético
  const directores = [...new Set(todasLasPeliculas.map(p => p.director))]
    .sort((a, b) => a.localeCompare(b));

  // Décadas sin repetir y de menor a mayor
  const decadas = [...new Set(todasLasPeliculas.map(obtenerDecada))]
    .sort((a, b) => a - b);

  // Dejamos solo la primera opción ("Todos...") y agregamos las demás
  filtroDirector.innerHTML = '<option value="todos">Todos los directores</option>';
  directores.forEach(director => {
    const opcion = document.createElement('option');
    opcion.value = director;
    opcion.textContent = director;
    filtroDirector.appendChild(opcion);
  });

  filtroDecada.innerHTML = '<option value="todas">Todas las décadas</option>';
  decadas.forEach(decada => {
    const opcion = document.createElement('option');
    opcion.value = decada;
    opcion.textContent = decada + 's';
    filtroDecada.appendChild(opcion);
  });
}


/* =====================================================
   6. BUSCADOR Y FILTROS
   ===================================================== */

// Revisa el texto escrito y los filtros elegidos, y muestra solo
// las películas que cumplen TODAS las condiciones.
function aplicarFiltros() {
  const textoBusqueda = normalizar(inputBuscador.value);
  const directorElegido = filtroDirector.value;
  const decadaElegida = filtroDecada.value;

  // .filter() se queda solo con las películas que devuelven "true"
  const resultados = todasLasPeliculas.filter(pelicula => {

    // ¿El texto aparece en el título (español, original o romanizado)?
    const coincideTexto =
      normalizar(pelicula.title).includes(textoBusqueda) ||
      normalizar(pelicula.original_title).includes(textoBusqueda) ||
      normalizar(pelicula.original_title_romanised).includes(textoBusqueda);

    // ¿Coincide el director? ("todos" significa sin filtro)
    const coincideDirector =
      directorElegido === 'todos' || pelicula.director === directorElegido;

    // ¿Coincide la década?
    const coincideDecada =
      decadaElegida === 'todas' || obtenerDecada(pelicula) === Number(decadaElegida);

    return coincideTexto && coincideDirector && coincideDecada;
  });

  mostrarPeliculas(resultados);
}

// Dibuja las tarjetas de una lista de películas y actualiza mensajes
function mostrarPeliculas(lista) {
  contenedorPeliculas.innerHTML = '';

  // Si hubo error de conexión, no mostramos el mensaje de "sin resultados"
  const hayError = !mensajeError.classList.contains('oculto');

  if (lista.length === 0) {
    if (!hayError) {
      mostrar(mensajeVacio);
    }
    contadorResultados.textContent = '';
    return;
  }

  ocultar(mensajeVacio);
  contadorResultados.textContent =
    'Mostrando ' + lista.length + ' de ' + todasLasPeliculas.length + ' películas';

  lista.forEach(pelicula => {
    contenedorPeliculas.appendChild(crearTarjeta(pelicula));
  });
}

// Quita la búsqueda y los filtros y vuelve a mostrar todo
function limpiarFiltros() {
  inputBuscador.value = '';
  filtroDirector.value = 'todos';
  filtroDecada.value = 'todas';
  aplicarFiltros();
}


/* =====================================================
   7. TARJETAS
   ===================================================== */

// Copia la plantilla del HTML y la rellena con los datos de una película
function crearTarjeta(pelicula) {
  const copia = plantillaTarjeta.content.cloneNode(true);

  // Imagen: usamos el póster; si no existe, el banner; si no, la de respaldo
  const imagen = copia.querySelector('.tarjeta__imagen');
  imagen.src = pelicula.image || pelicula.movie_banner || IMAGEN_RESPALDO;
  imagen.alt = 'Póster de ' + pelicula.title;
  // Si la imagen falla al cargar, ponemos la de respaldo
  imagen.addEventListener('error', () => {
    imagen.src = IMAGEN_RESPALDO;
  }, { once: true });

  // Textos (usamos textContent, que es seguro frente a código raro)
  copia.querySelector('.tarjeta__titulo').textContent = pelicula.title;
  copia.querySelector('.tarjeta__original').textContent =
    pelicula.original_title + ' · ' + pelicula.original_title_romanised;
  copia.querySelector('.tarjeta__director').textContent = pelicula.director;
  copia.querySelector('.tarjeta__anio').textContent = pelicula.release_date;
  copia.querySelector('.tarjeta__duracion').textContent = pelicula.running_time + ' min';
  copia.querySelector('.tarjeta__puntuacion').textContent = pelicula.rt_score + '/100';
  copia.querySelector('.tarjeta__descripcion').textContent = pelicula.description;

  // Botón de favorito: guardamos el id de la película dentro del botón
  const botonFavorito = copia.querySelector('.tarjeta__favorito');
  botonFavorito.dataset.id = pelicula.id;
  pintarCorazon(botonFavorito, esFavorito(pelicula.id));

  return copia;
}


/* =====================================================
   8. FAVORITOS CON localStorage
   localStorage guarda datos en el navegador aunque
   se cierre la página. Solo guarda texto, por eso
   usamos JSON.stringify (guardar) y JSON.parse (leer).
   ===================================================== */

// Lee los favoritos guardados (si no hay, devuelve una lista vacía)
function leerFavoritos() {
  try {
    const guardado = localStorage.getItem(CLAVE_FAVORITOS);
    const lista = guardado ? JSON.parse(guardado) : [];
    return Array.isArray(lista) ? lista : [];
  } catch (error) {
    console.error('No se pudieron leer los favoritos:', error);
    return [];
  }
}

// Guarda la lista actual de favoritos
function guardarFavoritos() {
  try {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
  } catch (error) {
    console.error('No se pudieron guardar los favoritos:', error);
  }
}

// ¿Esta película está en favoritos?
function esFavorito(id) {
  return favoritos.includes(id);
}

// Agrega la película a favoritos, o la quita si ya estaba
function alternarFavorito(id) {
  if (esFavorito(id)) {
    favoritos = favoritos.filter(favId => favId !== id);
  } else {
    favoritos.push(id);
  }

  guardarFavoritos();
  actualizarCorazones();
  actualizarContadorFavoritos();
  renderizarFavoritos();
}

// Cambia el dibujo y el estado de accesibilidad de un corazón
function pintarCorazon(boton, activo) {
  boton.textContent = activo ? '❤️' : '🤍';
  boton.setAttribute('aria-pressed', String(activo));
  boton.setAttribute(
    'aria-label',
    activo ? 'Quitar de favoritos' : 'Agregar a favoritos'
  );
}

// Actualiza todos los corazones que están en pantalla
function actualizarCorazones() {
  document.querySelectorAll('.tarjeta__favorito').forEach(boton => {
    pintarCorazon(boton, esFavorito(boton.dataset.id));
  });
}

// Actualiza el número que aparece junto al botón "Favoritos"
function actualizarContadorFavoritos() {
  contadorFavoritos.textContent = favoritos.length;
}

// Dibuja en la sección de favoritos solo las películas guardadas
function renderizarFavoritos() {
  contenedorFavoritos.innerHTML = '';

  const peliculasFavoritas = todasLasPeliculas.filter(p => esFavorito(p.id));

  if (peliculasFavoritas.length === 0) {
    mostrar(mensajeSinFavoritos);
    return;
  }

  ocultar(mensajeSinFavoritos);
  peliculasFavoritas.forEach(pelicula => {
    contenedorFavoritos.appendChild(crearTarjeta(pelicula));
  });
}


/* =====================================================
   9. NAVEGACIÓN ENTRE PELÍCULAS Y FAVORITOS
   ===================================================== */

function mostrarVista(vista) {
  const verFavoritos = vista === 'favoritos';

  // Mostramos una sección y ocultamos la otra
  if (verFavoritos) {
    mostrar(seccionFavoritos);
    ocultar(seccionPeliculas);
  } else {
    mostrar(seccionPeliculas);
    ocultar(seccionFavoritos);
  }

  // Marcamos como activo el botón correspondiente
  btnVerFavoritos.classList.toggle('navegacion__boton--activo', verFavoritos);
  btnVerPeliculas.classList.toggle('navegacion__boton--activo', !verFavoritos);
}


/* =====================================================
   10. EVENTOS
   ===================================================== */

// Buscador: se ejecuta cada vez que el usuario escribe una letra
inputBuscador.addEventListener('input', aplicarFiltros);

// Filtros: se ejecutan cuando el usuario cambia una opción
filtroDirector.addEventListener('change', aplicarFiltros);
filtroDecada.addEventListener('change', aplicarFiltros);

// Botones
btnLimpiar.addEventListener('click', limpiarFiltros);
btnReintentar.addEventListener('click', cargarPeliculas);
btnVerPeliculas.addEventListener('click', () => mostrarVista('peliculas'));
btnVerFavoritos.addEventListener('click', () => mostrarVista('favoritos'));

// Favoritos: un solo "oído" para todas las tarjetas (delegación de eventos).
// Como las tarjetas se crean dinámicamente, escuchamos en el contenedor
// y revisamos si el clic fue en un botón de corazón.
function manejarClicFavorito(evento) {
  const boton = evento.target.closest('.tarjeta__favorito');
  if (boton) {
    alternarFavorito(boton.dataset.id);
  }
}
contenedorPeliculas.addEventListener('click', manejarClicFavorito);
contenedorFavoritos.addEventListener('click', manejarClicFavorito);


/* =====================================================
   11. INICIO DE LA APLICACIÓN
   ===================================================== */
favoritos = leerFavoritos();     // 1) leemos los favoritos guardados
actualizarContadorFavoritos();   // 2) mostramos cuántos hay
cargarPeliculas();               // 3) pedimos las películas a la API
