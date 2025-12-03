// Referencias a elementos
const mensajeInput = document.getElementById("mensaje");
const charCount = document.getElementById("char-count");
const k11 = document.getElementById("k11");
const k12 = document.getElementById("k12");
const k21 = document.getElementById("k21");
const k22 = document.getElementById("k22");
const btnEncriptar = document.getElementById("btn-encriptar");
const btnDesencriptar = document.getElementById("btn-desencriptar");
const btnLimpiar = document.getElementById("btn-limpiar");
const resultadoDiv = document.getElementById("resultado");
const debugPre = document.getElementById("debug");

// Función para espaciar el texto: "HOLA" -> "H O L A"
function espaciarTexto(texto) {
    return texto.split("").join(" ");
}

// Actualizar contador del textarea
mensajeInput.addEventListener("input", () => {
    const len = mensajeInput.value.length;
    charCount.textContent = `${len}/200`;
});

// Funciones de utilería
function limpiarTexto(texto) {
    return texto
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z]/g, "");
}

function letraANumero(letra) {
    return letra.charCodeAt(0) - 65;
}

function numeroALetra(num) {
    return String.fromCharCode((num % 26) + 65);
}

function obtenerMatrizClave() {
    const a = parseInt(k11.value, 10);
    const b = parseInt(k12.value, 10);
    const c = parseInt(k21.value, 10);
    const d = parseInt(k22.value, 10);

    if ([a, b, c, d].some(v => Number.isNaN(v))) {
        throw new Error("Todos los elementos de la matriz clave deben ser números.");
    }

    return { a, b, c, d };
}

// Matemáticas
function mod(n, m) {
    return ((n % m) + m) % m;
}

function mcd(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

function inversoModular(a, m) {
    a = mod(a, m);
    for (let x = 1; x < m; x++) {
        if (mod(a * x, m) === 1) return x;
    }
    return null;
}

function inversaMatriz2x2Mod26({ a, b, c, d }) {
    const det = mod(a * d - b * c, 26);
    if (mcd(det, 26) !== 1) throw new Error("La matriz clave no es invertible.");

    const detInv = inversoModular(det, 26);
    if (detInv === null) throw new Error("No existe inverso modular del determinante.");

    return {
        a: mod(detInv * d, 26),
        b: mod(-detInv * b, 26),
        c: mod(-detInv * c, 26),
        d: mod(detInv * a, 26)
    };
}

// ⭐⭐ CIFRAR HILL – ACEPTA LONGITUD IMPAR ⭐⭐
function cifrarHill(texto, matriz) {
    let limpio = limpiarTexto(texto);

    if (limpio.length === 0) {
        throw new Error("El mensaje está vacío o no contiene letras válidas.");
    }

    let resultado = "";
    let debugInfo = "";

    // Cifrar solo pares
    for (let i = 0; i < limpio.length - 1; i += 2) {
        const l1 = limpio[i];
        const l2 = limpio[i + 1];

        const x1 = letraANumero(l1);
        const x2 = letraANumero(l2);

        const y1 = mod(matriz.a * x1 + matriz.b * x2, 26);
        const y2 = mod(matriz.c * x1 + matriz.d * x2, 26);

        const c1 = numeroALetra(y1);
        const c2 = numeroALetra(y2);

        resultado += c1 + c2;

        debugInfo += `${l1}${l2} -> [${x1}, ${x2}] -> [${y1}, ${y2}] -> ${c1}${c2}\n`;
    }

    // ⭐ Si sobra una letra impar → NO se cifra ⭐
    if (limpio.length % 2 !== 0) {
        const sobrante = limpio[limpio.length - 1];
        resultado += sobrante;
        debugInfo += `Letra sobrante sin cifrar: ${sobrante}`;
    }

    mostrarDebug(debugInfo.trim());
    return resultado;
}

// ⭐⭐ DESCIFRAR HILL – acepta letra sobrante ⭐⭐
function descifrarHill(texto, matriz) {
    let limpio = limpiarTexto(texto);

    if (limpio.length === 0) {
        throw new Error("El mensaje cifrado está vacío.");
    }

    const matrizInv = inversaMatriz2x2Mod26(matriz);

    let resultado = "";
    let debugInfo = "";

    // Procesar solo pares
    for (let i = 0; i < limpio.length - 1; i += 2) {
        const l1 = limpio[i];
        const l2 = limpio[i + 1];

        const y1 = letraANumero(l1);
        const y2 = letraANumero(l2);

        const x1 = mod(matrizInv.a * y1 + matrizInv.b * y2, 26);
        const x2 = mod(matrizInv.c * y1 + matrizInv.d * y2, 26);

        resultado += numeroALetra(x1) + numeroALetra(x2);

        debugInfo += `${l1}${l2} -> ${numeroALetra(x1)}${numeroALetra(x2)}\n`;
    }

    // Agregar letra sobrante sin descifrar
    if (limpio.length % 2 !== 0) {
        const sobrante = limpio[limpio.length - 1];
        resultado += sobrante;
        debugInfo += `Letra sobrante sin descifrar: ${sobrante}`;
    }

    mostrarDebug(debugInfo.trim());
    return resultado;
}

// BOTONES
btnEncriptar.addEventListener("click", () => {
    try {
        const matriz = obtenerMatrizClave();
        const cifrado = cifrarHill(mensajeInput.value, matriz);

        mensajeInput.value = cifrado;
        charCount.textContent = `${cifrado.length}/200`;

        mostrarResultado(espaciarTexto(cifrado));
    } catch (err) {
        mostrarResultado(`Error: ${err.message}`);
        mostrarDebug("");
    }
});

btnDesencriptar.addEventListener("click", () => {
    try {
        const matriz = obtenerMatrizClave();
        const descifrado = descifrarHill(mensajeInput.value, matriz);

        mensajeInput.value = descifrado;
        charCount.textContent = `${descifrado.length}/200`;

        mostrarResultado(espaciarTexto(descifrado));
    } catch (err) {
        mostrarResultado(`Error: ${err.message}`);
        mostrarDebug("");
    }
});

btnLimpiar.addEventListener("click", () => {
    mensajeInput.value = "";
    charCount.textContent = "0/200";
    mostrarResultado("Aquí aparecerá el resultado...");
    mostrarDebug("");
});
