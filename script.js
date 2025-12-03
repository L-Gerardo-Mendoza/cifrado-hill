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

// Actualizar contador de caracteres
mensajeInput.addEventListener("input", () => {
    const len = mensajeInput.value.length;
    charCount.textContent = `${len}/200`;
});

// Funciones de utilería
function limpiarTexto(texto) {
    // Quitar todo excepto letras y convertir a mayúsculas
    return texto
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quita acentos
        .replace(/[^A-Z]/g, ""); // solo A-Z
}

function letraANumero(letra) {
    return letra.charCodeAt(0) - 65; // A=0, B=1, ..., Z=25
}

function numeroALetra(num) {
    return String.fromCharCode((num % 26) + 65);
}

// Obtener matriz clave
function obtenerMatrizClave() {
    const a = parseInt(k11.value, 10);
    const b = parseInt(k12.value, 10);
    const c = parseInt(k21.value, 10);
    const d = parseInt(k22.value, 10);

    if ([a, b, c, d].some((v) => Number.isNaN(v))) {
        throw new Error("Todos los elementos de la matriz clave deben ser números.");
    }

    return { a, b, c, d };
}

// Determinante y su inverso módulo 26
function mod(n, m) {
    return ((n % m) + m) % m;
}

function mcd(a, b) {
    while (b !== 0) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
}

function inversoModular(a, m) {
    // Búsqueda simple (como ejemplo educativo)
    a = mod(a, m);
    for (let x = 1; x < m; x++) {
        if (mod(a * x, m) === 1) return x;
    }
    return null;
}

// Inversa de matriz 2x2 módulo 26
function inversaMatriz2x2Mod26({ a, b, c, d }) {
    const det = mod(a * d - b * c, 26);
    if (mcd(det, 26) !== 1) {
        throw new Error(
            `La matriz clave no es invertible módulo 26 (det=${det}, gcd(det, 26) ≠ 1).`
        );
    }

    const detInv = inversoModular(det, 26);
    if (detInv === null) {
        throw new Error("No existe inverso modular del determinante módulo 26.");
    }

    // Inversa de [[a,b],[c,d]] es (1/det)*[[d, -b], [-c, a]] (mod 26)
    const A = mod(detInv * d, 26);
    const B = mod(-detInv * b, 26);
    const C = mod(-detInv * c, 26);
    const D = mod(detInv * a, 26);

    return { a: A, b: B, c: C, d: D };
}

// Mostrar mensajes
function mostrarResultado(texto) {
    resultadoDiv.textContent = texto;
}

function mostrarDebug(info) {
    debugPre.textContent = info;
}

// Cifrado Hill (2x2)
function cifrarHill(texto, matriz) {
    let limpio = limpiarTexto(texto);

    if (limpio.length === 0) {
        throw new Error("El mensaje está vacío o no contiene letras válidas.");
    }

    // Asegurar longitud par (pares de letras). Si es impar, rellenar con X.
    if (limpio.length % 2 !== 0) {
        limpio += "X";
    }

    let resultado = "";
    let debugInfo = "";

    for (let i = 0; i < limpio.length; i += 2) {
        const l1 = limpio[i];
        const l2 = limpio[i + 1];

        const x1 = letraANumero(l1);
        const x2 = letraANumero(l2);

        // Multiplicación de matriz:
        // [y1]   [a b][x1]
        // [y2] = [c d][x2]
        const y1 = mod(matriz.a * x1 + matriz.b * x2, 26);
        const y2 = mod(matriz.c * x1 + matriz.d * x2, 26);

        const c1 = numeroALetra(y1);
        const c2 = numeroALetra(y2);

        resultado += c1 + c2;

        debugInfo += `${l1}${l2} -> [${x1}, ${x2}] -> [${y1}, ${y2}] -> ${c1}${c2}\n`;
    }

    mostrarDebug(debugInfo.trim());
    return resultado;
}

// Descifrado Hill (2x2)
function descifrarHill(textoCifrado, matriz) {
    let limpio = limpiarTexto(textoCifrado);

    if (limpio.length === 0) {
        throw new Error("El mensaje cifrado está vacío o no contiene letras válidas.");
    }

    if (limpio.length % 2 !== 0) {
        throw new Error(
            "El mensaje cifrado debe tener longitud par (porque se formaron pares de letras)."
        );
    }

    const matrizInv = inversaMatriz2x2Mod26(matriz);

    let resultado = "";
    let debugInfo = `Matriz inversa mod 26: [[${matrizInv.a}, ${matrizInv.b}], [${matrizInv.c}, ${matrizInv.d}]]\n\n`;

    for (let i = 0; i < limpio.length; i += 2) {
        const l1 = limpio[i];
        const l2 = limpio[i + 1];

        const y1 = letraANumero(l1);
        const y2 = letraANumero(l2);

        const x1 = mod(matrizInv.a * y1 + matrizInv.b * y2, 26);
        const x2 = mod(matrizInv.c * y1 + matrizInv.d * y2, 26);

        const p1 = numeroALetra(x1);
        const p2 = numeroALetra(x2);

        resultado += p1 + p2;

        debugInfo += `${l1}${l2} -> [${y1}, ${y2}] -> [${x1}, ${x2}] -> ${p1}${p2}\n`;
    }

    mostrarDebug(debugInfo.trim());
    return resultado;
}

// Eventos de botones
btnEncriptar.addEventListener("click", () => {
    try {
        const matriz = obtenerMatrizClave();
        const texto = mensajeInput.value;
        const cifrado = cifrarHill(texto, matriz);

        // 🔹 Poner el cifrado también en el textarea para que luego se pueda desencriptar directo
        mensajeInput.value = cifrado;
        charCount.textContent = `${cifrado.length}/200`;

        mostrarResultado(cifrado); // solo el texto cifrado
    } catch (err) {
        mostrarResultado(`Error: ${err.message}`);
        mostrarDebug("");
    }
});

btnDesencriptar.addEventListener("click", () => {
    try {
        const matriz = obtenerMatrizClave();
        const texto = mensajeInput.value;
        const descifrado = descifrarHill(texto, matriz);

        // 🔹 Poner el texto plano de vuelta en el textarea
        mensajeInput.value = descifrado;
        charCount.textContent = `${descifrado.length}/200`;

        mostrarResultado(descifrado); // solo el texto descifrado
    } catch (err) {
        mostrarResultado(`Error: ${err.message}`);
        mostrarDebug("");
    }
});

const original = texto;
texto = limpiarTexto(texto);
if (texto !== original) {
    alert("Se eliminaron espacios, acentos o caracteres no válidos. Se usará: " + texto);
}

btnLimpiar.addEventListener("click", () => {
    mensajeInput.value = "";
    charCount.textContent = "0/200";
    mostrarResultado("Aquí aparecerá el resultado...");
    mostrarDebug("");
});
