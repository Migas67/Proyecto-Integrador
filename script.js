
const TAMANO_TABLERO = 10; // Defino una constante con el valor de 10, representa el tamaño de el tablero.
const POSICION_COFRE = { fila: TAMANO_TABLERO - 1, columna: TAMANO_TABLERO - 1 };
// Se define posicion cofre y se le coloca en la ultima fila y columna.

let nombre = ''; // Nombre del Heroe
let posicionHeroe = { fila: 0, columna: 0 }; // Posicion de inicio del Heroe
let numeroTiradas = 0; // Numero de tiradas
let movimientoPendiente = 0;

//  1. VALIDACIÓN Y PRE-INICIO 

function validarNombre(event) {
    event.preventDefault();  // Evita que se recargue la página.

    // Obtenemos el valor del campo de texto.
    const nombreUsuario = document.getElementById('nombre-heroe').value.trim(); 
    
    nombre = nombreUsuario;
    
    // Limpia cualquier mensaje anterior que esté en el elemento con id 'feedback-nombre'
    document.getElementById('feedback-nombre').textContent = '';

    if (nombre.length < 4) {
        document.getElementById('feedback-nombre').textContent = ' El nombre debe tener 4 o más letras.';
        document.getElementById('btn-jugar').disabled = true;
        return;
    }

    // Si el nombre contiene números
    if (/\d/.test(nombre)) {
        document.getElementById('feedback-nombre').textContent = ' Números no permitidos.';
        document.getElementById('btn-jugar').disabled = true;
        return;
    }

    // Si el nombre es válido muestra mensaje bienvenida
    document.getElementById('feedback-nombre').textContent = `A luchar héroe: ${nombre}`;
    document.getElementById('btn-jugar').disabled = false;
}

// 2. GENERACIÓN DE LA AVENTURA

function iniciarJuego() {
    document.getElementById('inicio').style.display = 'none';  // Oculta la pantalla de inicio
    document.getElementById('juego').style.display = 'block';  // Muestra la pantalla del juego

    document.getElementById('heroe-nombre-display').textContent = nombre;
    numeroTiradas = 0;  // Inicializa contador
    posicionHeroe = { fila: 0, columna: 0 };  // Colocar al héroe en la posición inicial
    document.getElementById('contador-tiradas').textContent = numeroTiradas;  // Actualiza el contador de tiradas en la interfaz
    movimientoPendiente = 0;
    document.getElementById('imagen-dado').src = `img/dado-0.png`;

    resetearTablero();
    mostrarRecord(); 
}


function resetearTablero() {
    const celdas = document.querySelectorAll('#contenedor-tablero td');  // Selecciona todas las celdas del tablero
    celdas.forEach(celda => {
        celda.className = 'celda-suelo';  // Resetea la clase de la celda a 'celda-suelo'
        celda.innerHTML = '';  // Limpia la celda
        
        //obtiene la fina y la columna
        const fila = parseInt(celda.dataset.fila);
        const columna = parseInt(celda.dataset.columna);  

        if (fila === 0 && columna === 0) {
            celda.classList.add('celda-heroe');  // Agrega la clase 'celda-heroe' para resaltar la celda del héroe
            celda.innerHTML = '<img src="img/miguel.png" alt="Héroe">';  // Coloca la imagen del héroe en fila 0 y columna 0
        } 
        else if (fila === POSICION_COFRE.fila && columna === POSICION_COFRE.columna) {
            celda.classList.add('celda-cofre');  // Agrega la clase 'celda-cofre' para resaltar la celda del cofre
            celda.innerHTML = '<img src="img/cofre.png" alt="Cofre">'; 
        }
    });
}


// 3. MOVIMIENTO Y LÓGICA DEL JUEGO

function tirarDado() {
    if (movimientoPendiente > 0) {  // Si hay un movimiento pendiente, no permite tirar el dado
        alert('Debes moverte antes de volver a tirar el dado.');
        return;
    }

    const valorDado = Math.floor(Math.random() * 6) + 1;  // Valor aleatorio entre 1 y 6
    movimientoPendiente = 1;  // Marca el movimiento pendiente
    document.getElementById('imagen-dado').src = `img/dado-${valorDado}.png`;  // Muestra la imagen correspondiente al valor del dado
    desmarcarCeldas();  // Quita las celdas resaltadas de las anteriores tiradas

    resaltarMovimientos(valorDado);
}


// FUNCIÓN MODIFICADA: SOLO MOVIMIENTO HORIZONTAL O VERTICAL
function resaltarMovimientos(pasos) {
    const celdas = document.querySelectorAll('td');  // Selecciona todas las celdas del tablero

    celdas.forEach(celda => {
        // Obtiene la fila y la columna de la celda
        const fila = parseInt(celda.dataset.fila);  
        const columna = parseInt(celda.dataset.columna);

        // Diferencia entre la fila  y columna del héroe y la fila de destino
        const difFila = Math.abs(posicionHeroe.fila - fila);
        const difColumna = Math.abs(posicionHeroe.columna - columna); 

        const distancia = difFila + difColumna;  // Calcula la distancia de filas y columnas reflejando los movimientos necesarios para llegar al destino

        const movimientoValido = (difFila === 0 || difColumna === 0);  // Asegura que el movimiento sea horizontal o vertical

        // Si la distancia es menor o igual a los pasos del dado, resalta la celda
        if (movimientoValido && distancia > 0 && distancia <= pasos) {
            celda.classList.add('movimiento-posible'); 
            celda.addEventListener('click', moverHeroe, { once: true });
        }
    });
}

function desmarcarCeldas() {
    const celdasResaltadas = document.querySelectorAll('.movimiento-posible');  // Selecciona todas las celdas resaltadas

    celdasResaltadas.forEach(celda => {
        celda.classList.remove('movimiento-posible');  // Elimina el resaltado de la celda
        celda.removeEventListener('click', moverHeroe); 
    });
}

function moverHeroe(event) {
    // Obtiene la celda , la fila y columna donde el usuario ha hecho clic
    const nuevaCelda = event.currentTarget; 
    const nuevaFila = parseInt(nuevaCelda.dataset.fila);  
    const nuevaColumna = parseInt(nuevaCelda.dataset.columna); 

    const celdaAnterior = document.querySelector(`.celda-heroe`);  // Busca la celda donde estaba el héroe
    if (celdaAnterior) {
        celdaAnterior.classList.remove('celda-heroe');  // Elimina la clase que resaltaba al héroe

        // Si el héroe llega al cofre aseguramos que la imagen del cofre siga ahí
        if (celdaAnterior.dataset.fila === POSICION_COFRE.fila.toString() && celdaAnterior.dataset.columna === POSICION_COFRE.columna.toString()) {
            celdaAnterior.innerHTML = '<img src="img/cofre.png" alt="Cofre">';
        } else {
            celdaAnterior.innerHTML = '';  // Limpia la celda
        }
    }

    // Coloca al héroe en la nueva celda
    nuevaCelda.classList.add('celda-heroe');
    nuevaCelda.innerHTML = '<img src="img/miguel.png" alt="Héroe">';

    posicionHeroe.fila = nuevaFila;  // Actualiza la posición del héroe
    posicionHeroe.columna = nuevaColumna;
    numeroTiradas++;  
    document.getElementById('contador-tiradas').textContent = numeroTiradas;  // Actualiza el contador de tiradas
    movimientoPendiente = 0;

    desmarcarCeldas();

    // Comprueba si el héroe ha llegado a la posición del cofre
    if (nuevaFila === POSICION_COFRE.fila && nuevaColumna === POSICION_COFRE.columna) {
        comprobarVictoria();
    }
}

// 4. VICTORIA Y RÉCORD

function mostrarRecord() {
    // Almacena en localStorage el record con la clave 'recordTiradas'
    const record = localStorage.getItem('recordTiradas');
    document.getElementById('record-actual').textContent = record ? `Récord actual: ${record} tiradas` : 'Aún no hay récord';// Comprueba si hay record
}

function comprobarVictoria() {
    // Recoge el valor del récord de tiradas de localStorage
    const record = localStorage.getItem('recordTiradas');
    let mensaje = `¡VICTORIA, HÉROE ${nombre.toUpperCase()}! Lo lograste en ${numeroTiradas} tiradas.`;

    if (record) {
        // Convierte el récord a un número entero
        const recordNum = parseInt(record);
        
        if (numeroTiradas < recordNum) {
            // Actualiza el récord en localStorage con el nuevo valor
            localStorage.setItem('recordTiradas', numeroTiradas);
            mensaje += '\n¡NUEVO RÉCORD establecido!';
        } else {
            mensaje += `\nRécord no superado, el actual récord es ${recordNum}.`;
        }
    } else {
        // Si no existe récord, establece el primer récord
        localStorage.setItem('recordTiradas', numeroTiradas);
        mensaje += '\n¡Has establecido el primer récord!';
    }
    alert(mensaje);

    mostrarRecord();

    // Cambia el texto del botón de "Jugar" para indicar "Volver a Jugar"
    document.getElementById('btn-jugar').textContent = 'Volver a Jugar';
    // Muestra el botón "Volver a Jugar"
    document.getElementById('btn-jugar').style.display = 'block';
    document.getElementById('btn-jugar').disabled = false;
    // Oculta la sección de juego actual
    document.getElementById('juego').style.display = 'none';
    // Muestra la sección de inicio
    document.getElementById('inicio').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-introducir-nombre').addEventListener('click', validarNombre);
    document.getElementById('btn-jugar').addEventListener('click', iniciarJuego);
    document.getElementById('btn-tirar-dado').addEventListener('click', tirarDado);

    // Prevenir que recargue la página 
    document.getElementById('formulario-nombre').addEventListener('submit', (e) => e.preventDefault());

    // Muestra el record cuando la página se carga por primera vez
    mostrarRecord();
});