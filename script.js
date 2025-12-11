const TAMANO_TABLERO = 10;
const POSICION_COFRE = { fila: TAMANO_TABLERO - 1, columna: TAMANO_TABLERO - 1 };

let nombre = '';
let posicionHeroe = { fila: 0, columna: 0 };
let numeroTiradas = 0;
// NOTA: movimientoPendiente ahora solo controla si se ha hecho una SELECCIÓN,
// no el número de pasos individuales, ya que el movimiento es un "salto"
// hasta el valor del dado.
let movimientoPendiente = 0;

// --- 1. VALIDACIÓN Y PRE-INICIO ---

function validarNombre(event) {
    event.preventDefault();
    const nombreUsuario = document.getElementById('nombre-heroe').value.trim();
    nombre = nombreUsuario;
    document.getElementById('feedback-nombre').textContent = '';

    // Requisito: Si el nombre tiene menos de 4 letras
    if (nombre.length < 4) {
        document.getElementById('feedback-nombre').textContent = ' El nombre debe tener 4 o más letras.';
        document.getElementById('btn-jugar').disabled = true;
        return;
    }

    // Requisito: Si contiene números
    if (/\d/.test(nombre)) {
        document.getElementById('feedback-nombre').textContent = ' Números no permitidos.';
        document.getElementById('btn-jugar').disabled = true;
        return;
    }

    // Nombre válido
    document.getElementById('feedback-nombre').textContent = `A luchar héroe: ${nombre}`;
    document.getElementById('btn-jugar').disabled = false;
}

// --- 2. GENERACIÓN DE LA AVENTURA ---

function iniciarJuego() {
    document.getElementById('inicio').style.display = 'none';
    document.getElementById('juego').style.display = 'block';

    document.getElementById('heroe-nombre-display').textContent = nombre;
    numeroTiradas = 0;
    posicionHeroe = { fila: 0, columna: 0 };
    document.getElementById('contador-tiradas').textContent = numeroTiradas;
    movimientoPendiente = 0;
    document.getElementById('imagen-dado').src = `img/dado-0.png`;


    // Si ya hay un tablero (que lo hay porque está en HTML), lo reseteamos
    resetearTablero();
    mostrarRecord();
}

function resetearTablero() {
    const celdas = document.querySelectorAll('#contenedor-tablero td');
    celdas.forEach(celda => {
        // Limpiar clases específicas (menos celda-suelo que es base) y contenido
        celda.className = 'celda-suelo';
        celda.innerHTML = '';

        const fila = parseInt(celda.dataset.fila);
        const columna = parseInt(celda.dataset.columna);

        if (fila === 0 && columna === 0) {
            celda.classList.add('celda-heroe');
            celda.innerHTML = '<img src="img/miguel.png" alt="Héroe">';
        } else if (fila === POSICION_COFRE.fila && columna === POSICION_COFRE.columna) {
            celda.classList.add('celda-cofre');
            celda.innerHTML = '<img src="img/cofre.png" alt="Cofre">';
        }
    });
}



// --- 3. MOVIMIENTO Y LÓGICA DEL JUEGO ---

function tirarDado() {
    // Evitar tirar si hay movimientos pendientes
    if (movimientoPendiente > 0) {
        alert('Debes moverte antes de volver a tirar el dado.');
        return;
    }

    const valorDado = Math.floor(Math.random() * 6) + 1; // [1, 6]
    // movimientoPendiente es 1 porque solo se permite una selección por tirada
    movimientoPendiente = 1;
    document.getElementById('imagen-dado').src = `img/dado-${valorDado}.png`;

    desmarcarCeldas(); // Limpiar antes de resaltar

    resaltarMovimientos(valorDado);
}

// FUNCIÓN MODIFICADA: SOLO MOVIMIENTO HORIZONTAL O VERTICAL
function resaltarMovimientos(pasos) {
    const celdas = document.querySelectorAll('td');

    celdas.forEach(celda => {
        const f = parseInt(celda.dataset.fila);
        const c = parseInt(celda.dataset.columna);

        const difFila = Math.abs(posicionHeroe.fila - f);
        const difColumna = Math.abs(posicionHeroe.columna - c);

        // CÁLCULO DE DISTANCIA (Distancia de Manhattan)
        // La distancia es la SUMA de las diferencias. Esto solo considera movimientos H y V.
        const distancia = difFila + difColumna;

        // **RESTRICCIÓN 1: Quitar movimiento diagonal**
        const esMovimientoOrtogonal = (difFila === 0 || difColumna === 0);

        // **RESTRICCIÓN 2: Limitar por el dado**
        if (esMovimientoOrtogonal && distancia > 0 && distancia <= pasos) {
            celda.classList.add('movimiento-posible');
            celda.addEventListener('click', moverHeroe, { once: true });
        }
    });
}

function desmarcarCeldas() {
    const celdasResaltadas = document.querySelectorAll('.movimiento-posible');
    celdasResaltadas.forEach(celda => {
        celda.classList.remove('movimiento-posible');
        celda.removeEventListener('click', moverHeroe);
    });
}

function moverHeroe(event) {
    const nuevaCelda = event.currentTarget;
    const nuevaFila = parseInt(nuevaCelda.dataset.fila);
    const nuevaColumna = parseInt(nuevaCelda.dataset.columna);

    // 1. Limpiar posición anterior
    const celdaAnterior = document.querySelector(`.celda-heroe`);
    if (celdaAnterior) {
        celdaAnterior.classList.remove('celda-heroe');

        // Si la celda anterior es la del cofre, aseguramos que la imagen del cofre permanezca
        if (celdaAnterior.dataset.fila === POSICION_COFRE.fila.toString() && celdaAnterior.dataset.columna === POSICION_COFRE.columna.toString()) {
            celdaAnterior.innerHTML = '<img src="img/cofre.png" alt="Cofre">';
        } else {
            celdaAnterior.innerHTML = ''; // Restaura a suelo
        }
    }

    // 2. Mover a la nueva posición
    nuevaCelda.classList.add('celda-heroe');
    nuevaCelda.innerHTML = '<img src="img/heroe.png" alt="Héroe">';

    posicionHeroe.fila = nuevaFila;
    posicionHeroe.columna = nuevaColumna;
    numeroTiradas++;
    document.getElementById('contador-tiradas').textContent = numeroTiradas;
    movimientoPendiente = 0; // Movimiento consumido, obliga a tirar de nuevo

    desmarcarCeldas();

    // 3. Comprobar victoria
    if (nuevaFila === POSICION_COFRE.fila && nuevaColumna === POSICION_COFRE.columna) {
        comprobarVictoria();
    }
}

// --- 4. VICTORIA Y RÉCORD ---

function mostrarRecord() {
    const record = localStorage.getItem('recordTiradas');
    document.getElementById('record-actual').textContent = record ? `Récord actual: ${record} tiradas` : 'Aún no hay récord';
}

function comprobarVictoria() {
    const record = localStorage.getItem('recordTiradas');
    let mensaje = `¡VICTORIA, HÉROE ${nombre.toUpperCase()}! Lo lograste en ${numeroTiradas} tiradas.`;

    // Si existe récord anterior
    if (record) {
        const recordNum = parseInt(record);
        if (numeroTiradas < recordNum) {
            // Nuevo récord
            localStorage.setItem('recordTiradas', numeroTiradas);
            mensaje += '\n¡NUEVO RÉCORD establecido!';
        } else {
            // Récord no superado
            mensaje += `\nRécord no superado, el actual récord es ${recordNum}.`;
        }
    } else {
        // Primer récord
        localStorage.setItem('recordTiradas', numeroTiradas);
        mensaje += '\n¡Has establecido el primer récord!';
    }

    alert(mensaje);
    mostrarRecord();

    // Reiniciar interfaz para volver a jugar
    document.getElementById('btn-jugar').textContent = 'Volver a Jugar';
    document.getElementById('btn-jugar').style.display = 'block';
    document.getElementById('btn-jugar').disabled = false;
    document.getElementById('juego').style.display = 'none';
    document.getElementById('inicio').style.display = 'block';
}

// --- EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-introducir-nombre').addEventListener('click', validarNombre);
    document.getElementById('btn-jugar').addEventListener('click', iniciarJuego);
    document.getElementById('btn-tirar-dado').addEventListener('click', tirarDado);

    // Prevenir el envío del formulario que recarga la página
    document.getElementById('formulario-nombre').addEventListener('submit', (e) => e.preventDefault());

    // Mostrar el récord al cargar
    mostrarRecord();
});