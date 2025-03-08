// Variables globales
var siguiente = false;
var contador = 0;
var imageSetIndex = 0;
var timerInterval = null;
var segundosRestantes = 180; // 3 minutos
var colorLinea = "#4d4d4d"; // Color por defecto

const imageSets = [
    { x: './img/x1.png', o: './img/o1.png' },
    { x: './img/x2.png', o: './img/o2.png' },
    { x: './img/x3.png', o: './img/o3.png' }
];

const coloresCeldas = [
    { par: "#ffffff", impar: "#ffffff" }, // Sin color alternado
    { par: "#f0f0f0", impar: "#e0e0e0" }, // Gris claro
    { par: "#f5f5dc", impar: "#f0e68c" }, // Beige
    { par: "#e6f2ff", impar: "#cce6ff" }  // Azul claro
];

let colorCeldasIndex = 0;

// Cambiar el conjunto de imágenes
function changeImageSet() {
    imageSetIndex = (imageSetIndex + 1) % imageSets.length;
    updateBoardImages();
}

// Actualizar imágenes en el tablero
function updateBoardImages() {
    const botones = document.querySelectorAll("input[type='button']");
    botones.forEach(boton => {
        if (boton.classList.contains('button-x')) {
            boton.style.backgroundImage = `url(${imageSets[imageSetIndex].x})`;
        } else if (boton.classList.contains('button-o')) {
            boton.style.backgroundImage = `url(${imageSets[imageSetIndex].o})`;
        }
    });
}

// Cambiar color de celdas alternadas
function cambiarColorCeldas() {
    colorCeldasIndex = (colorCeldasIndex + 1) % coloresCeldas.length;
    aplicarColorCeldas();
}

function aplicarColorCeldas() {
    const celdas = document.querySelectorAll("td");
    celdas.forEach((celda, index) => {
        if (index % 2 === 0) {
            celda.style.backgroundColor = coloresCeldas[colorCeldasIndex].par;
        } else {
            celda.style.backgroundColor = coloresCeldas[colorCeldasIndex].impar;
        }
    });
}

// Cambiar color de línea ganadora
function cambiarColorLinea() {
    const colores = ["#4d4d4d", "#ff5733", "#33ff57", "#3357ff", "#ff33f5"];
    const colorIndex = colores.indexOf(colorLinea);
    colorLinea = colores[(colorIndex + 1) % colores.length];
    
    // Actualizar el color del botón para mostrar el color seleccionado
    const botonColor = document.getElementById("cambiarColorLinea");
    botonColor.style.borderBottom = `5px solid ${colorLinea}`;
    
    // Si hay una línea ganadora visible, actualizar su color
    const estilos = document.querySelectorAll("style");
    estilos.forEach((estilo) => {
        if (estilo.textContent.includes('::after')) {
            let contenido = estilo.textContent;
            // Reemplazar el color actual con el nuevo color
            contenido = contenido.replace(/background-color: #[0-9a-f]{6}/g, `background-color: ${colorLinea}`);
            contenido = contenido.replace(/rgb\([^)]+\)/g, colorLinea);
            // Actualizar gradientes lineales
            contenido = contenido.replace(/#[0-9a-f]{6} calc/g, `${colorLinea} calc`);
            estilo.textContent = contenido;
        }
    });
}

// Iniciar temporizador
function iniciarTemporizador() {
    if (timerInterval) clearInterval(timerInterval);
    segundosRestantes = 180; // 3 minutos
    actualizarDisplayTiempo();
    
    timerInterval = setInterval(() => {
        segundosRestantes--;
        actualizarDisplayTiempo();
        
        if (segundosRestantes <= 0) {
            clearInterval(timerInterval);
            document.getElementById("Turno").innerHTML = "Tiempo agotado - Empate";
            bloquear();
        }
    }, 1000);
}

function actualizarDisplayTiempo() {
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;
    document.getElementById("temporizador").textContent = 
        `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
    
    // Agregar advertencia visual cuando queden menos de 30 segundos
    if (segundosRestantes <= 30) {
        document.getElementById("temporizador").classList.add("warning");
    } else {
        document.getElementById("temporizador").classList.remove("warning");
    }
}

function turno(boton) {
    if (boton.disabled) return;

    if (!siguiente) {
        boton.value = "";
        boton.className = "button-x";
        boton.style.backgroundImage = `url(${imageSets[imageSetIndex].x})`;
    } else {
        boton.value = "";
        boton.className = "button-o";
        boton.style.backgroundImage = `url(${imageSets[imageSetIndex].o})`;
    }
    boton.disabled = true;
    siguiente = !siguiente;
    document.getElementById("Turno").innerHTML = siguiente ? "Turno: O" : "Turno: X";
    verificar();
}

function verificar() {
    var botones = document.querySelectorAll("input[type='button']");
    const estilo = document.createElement("style");
    if (++contador == 9) {
        document.getElementById("Turno").innerHTML = `Empate`;
        finalizarJuego();
        return;
    }

    function mismaMarca(b1, b2, b3) {
        return b1.className && b1.className === b2.className && b2.className === b3.className;
    }

    function aplicarLineaHorizontal(fila) {
        estilo.textContent = `tr:nth-child(${fila}) td::after { 
            content: ""; 
            position: absolute; 
            top: 50%; 
            left: 0; 
            width: 100%; 
            height: 5px; 
            background-color: ${colorLinea}; 
            z-index: 10; 
            pointer-events: none; 
        }`;
        document.head.appendChild(estilo);
    }

    function aplicarLineaVertical(columna) {
        estilo.textContent = `td:nth-child(${columna})::after { 
            content: ""; 
            position: absolute; 
            left: 50%; 
            top: 0; 
            height: 100%; 
            width: 5px; 
            background-color: ${colorLinea}; 
            z-index: 10; 
            pointer-events: none; 
        }`;
        document.head.appendChild(estilo);
    }

    function aplicarLineaDiagonalPrincipal() {
        estilo.textContent = `
        table::after { 
            content: ""; 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: linear-gradient(45deg, transparent calc(50% - 2.5px), ${colorLinea} calc(50% - 2.5px), ${colorLinea} calc(50% + 2.5px), transparent calc(50% + 2.5px));
            z-index: 10; 
            pointer-events: none; 
        }`;
        document.head.appendChild(estilo);
    }

    function aplicarLineaDiagonalSecundaria() {
        estilo.textContent = `
        table::after { 
            content: ""; 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: linear-gradient(135deg, transparent calc(50% - 2.5px), ${colorLinea} calc(50% - 2.5px), ${colorLinea} calc(50% + 2.5px), transparent calc(50% + 2.5px));
            z-index: 10; 
            pointer-events: none; 
        }`;
        document.head.appendChild(estilo);
    }

    // Verificar filas horizontales
    if (mismaMarca(botones[0], botones[1], botones[2])) {
        document.getElementById("Turno").innerHTML = `Gana: ${botones[0].className === 'button-x' ? 'X' : 'O'}`;
        finalizarJuego();
        aplicarLineaHorizontal(1);
        return;
    }
    if (mismaMarca(botones[3], botones[4], botones[5])) {
        document.getElementById("Turno").innerHTML = `Gana: ${botones[3].className === 'button-x' ? 'X' : 'O'}`;
        finalizarJuego();
        aplicarLineaHorizontal(2);
        return;
    }
    if (mismaMarca(botones[6], botones[7], botones[8])) {
        document.getElementById("Turno").innerHTML = `Gana: ${botones[6].className === 'button-x' ? 'X' : 'O'}`;
        finalizarJuego();
        aplicarLineaHorizontal(3);
        return;
    }

    // Verificar columnas verticales
    if (mismaMarca(botones[0], botones[3], botones[6])) {
        document.getElementById("Turno").innerHTML = `Gana: ${botones[0].className === 'button-x' ? 'X' : 'O'}`;
        finalizarJuego();
        aplicarLineaVertical(1);
        return;
    }
    if (mismaMarca(botones[1], botones[4], botones[7])) {
        document.getElementById("Turno").innerHTML = `Gana: ${botones[1].className === 'button-x' ? 'X' : 'O'}`;
        finalizarJuego();
        aplicarLineaVertical(2);
        return;
    }
    if (mismaMarca(botones[2], botones[5], botones[8])) {
        document.getElementById("Turno").innerHTML = `Gana: ${botones[2].className === 'button-x' ? 'X' : 'O'}`;
        finalizarJuego();
        aplicarLineaVertical(3);
        return;
    }

    // Verificar diagonales
    if (mismaMarca(botones[0], botones[4], botones[8])) {
        document.getElementById("Turno").innerHTML = `Gana: ${botones[0].className === 'button-x' ? 'X' : 'O'}`;
        finalizarJuego();
        aplicarLineaDiagonalPrincipal();
        return;
    }
    if (mismaMarca(botones[2], botones[4], botones[6])) {
        document.getElementById("Turno").innerHTML = `Gana: ${botones[2].className === 'button-x' ? 'X' : 'O'}`;
        finalizarJuego();
        aplicarLineaDiagonalSecundaria();
        return;
    }
}

function finalizarJuego() {
    bloquear();
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

function bloquear() {
    var botones = document.querySelectorAll("input[type='button']");
    botones.forEach(boton => {
        boton.disabled = true;
    });
}

function reiniciar() {
    var botones = document.querySelectorAll("input[type='button']");
    botones.forEach(boton => {
        boton.value = "";
        boton.disabled = false;
        boton.className = "";
        boton.style.backgroundImage = "none";
    });
    siguiente = false;
    contador = 0;
    document.getElementById("Turno").innerHTML = "Turno: X";

    var estilos = document.querySelectorAll("style");
    estilos.forEach((estilo) => {
        if (estilo.textContent.includes('::after')) estilo.remove();
    });
    
    // Reiniciar temporizador
    iniciarTemporizador();
}

// Inicializar el juego al cargar la página
window.onload = function() {
    iniciarTemporizador();
    aplicarColorCeldas();
};