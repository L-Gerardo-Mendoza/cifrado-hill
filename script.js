// ========= REFERENCIAS A ELEMENTOS =========
const mensajeInput = document.getElementById("mensaje");
const charCount = document.getElementById("char-count") || document.querySelector(".char-count");
const matrizMensaje = document.getElementById("matrizMensaje");
const k11 = document.getElementById("k11");
const k12 = document.getElementById("k12");
const k21 = document.getElementById("k21");
const k22 = document.getElementById("k22");
const btnEncriptar = document.getElementById("btn-encriptar") || document.getElementById("encriptar");
const btnDesencriptar = document.getElementById("btn-desencriptar") || document.getElementById("desencriptar");
const btnLimpiar = document.getElementById("btn-limpiar");
const resultadoDiv = document.getElementById("resultado");
const debugPre = document.getElementById("debug");

// ========= UTILIDADES DE TEXTO =========

// (Opcional) Para quitar acentos y dejar solo letras A-Z
function limpiarSoloLetras(texto) {
    return texto
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // acentos
        .replace(/[^A-Z]/g, "");         // solo letras
}

// ========= UTILIDADES MATEMÁTICAS =========

function mod(n, m) {
    return ((n % m) + m) % m;
}

function det2x2(mat) {
    return mod(mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0], 26);
}

function inversoMod26(a) {
    a = mod(a, 26);
    for (let i = 1; i < 26; i++) {
        if (mod(a * i, 26) === 1) return i;
    }
    return null;
}

function matrizInversa(key) {
    const det = det2x2(key);
    const detInv = inversoMod26(det);
    if (detInv === null) return null;

    const a = key[0][0], b = key[0][1];
    const c = key[1][0], d = key[1][1];

    // Inversa 2x2: (1/det) * [[d, -b], [-c, a]] mod 26
    return [
        [mod(detInv * d, 26), mod(detInv * -b, 26)],
        [mod(detInv * -c, 26), mod(detInv * a, 26)]
    ];
}

// Hace que la clave SIEMPRE sea invertible módulo 26
function hacerClaveInvertible(key) {
    // Normalizar a 0..25
    let a = mod(key[0][0], 26);
    let b = mod(key[0][1], 26);
    let c = mod(key[1][0], 26);
    let d = mod(key[1][1], 26);

    let base = [
        [a, b],
        [c, d]
    ];

    if (inversoMod26(det2x2(base)) !== null) {
        return base;
    }

    // Probar ajustar sólo 'd'
    for (let delta = 1; delta < 26; delta++) {
        let d2 = mod(d + delta, 26);
        let k = [
            [a, b],
            [c, d2]
        ];
        if (inversoMod26(det2x2(k)) !== null) return k;
    }

    // Probar ajustar 'c'
    for (let delta = 1; delta < 26; delta++) {
        let c2 = mod(c + delta, 26);
        let k = [
            [a, b],
            [c2, d]
        ];
        if (inversoMod26(det2x2(k)) !== null) return k;
    }

    // Probar ajustar 'b'
    for (let delta = 1; delta < 26; delta++) {
        let b2 = mod(b + delta, 26);
        let k = [
            [a, b2],
            [c, d]
        ];
        if (inversoMod26(det2x2(k)) !== null) return k;
    }

    // Probar ajustar 'a'
    for (let delta = 1; delta < 26; delta++) {
        let a2 = mod(a + delta, 26);
        let k = [
            [a2, b],
            [c, d]
        ];
        if (inversoMod26(det2x2(k)) !== null) return k;
    }

    // Si nada funcionó (caso ultra raro), usar una clave fija válida
    return [
        [3, 3],
        [2, 5]
    ];
}

// ========= MATRIZ DEL MENSAJE (para mostrar en pantalla) =========

function mostrarMatrizMensaje() {
    if (!matrizMensaje) return;

    const texto = limpiarSoloLetras(mensajeInput.value);

    if (texto.length === 0) {
        matrizMensaje.textContent = "Escribe un mensaje primero...";
        return;
    }

    const valores = texto.split("").map(char => char.charCodeAt(0) - 65);

    let matriz = "[";
    for (let i = 0; i < valores.length; i += 2) {
        if (i > 0) matriz += " ";
        const v1 = valores[i];
        const v2 = (i + 1 < valores.length) ? valores[i + 1] : 23; // padding X = 23
        matriz += `[${v1}, ${v2}]`;
    }
    matriz += "]";

    matrizMensaje.textContent = matriz;
}

// ========= ACTUALIZAR CONTADOR =========

if (mensajeInput && charCount) {
    mensajeInput.addEventListener("input", () => {
        const len = mensajeInput.value.length;
        // usa 200 o 30 según tu límite
        charCount.textContent = `${len}/200`;
        mostrarMatrizMensaje();
    });
}

// ========= ENCRIPTAR (respetando espacios / signos) =========

if (btnEncriptar) {
    btnEncriptar.addEventListener("click", () => {
        if (resultadoDiv) resultadoDiv.classList.remove("error");
        if (debugPre) debugPre.textContent = "";

        let key = [
            [parseInt(k11.value) || 0, parseInt(k12.value) || 0],
            [parseInt(k21.value) || 0, parseInt(k22.value) || 0]
        ];

        // Forzar clave invertible
        key = hacerClaveInvertible(key);

        const textoOriginal = mensajeInput.value.toUpperCase();
        const soloLetras = textoOriginal.replace(/[^A-Z]/g, "");

        if (soloLetras.length === 0) {
            if (resultadoDiv) {
                resultadoDiv.textContent = "Error: Ingresa un mensaje";
                resultadoDiv.classList.add("error");
            }
            return;
        }

        // convertir letras a números
        let numeros = soloLetras.split("").map(char => char.charCodeAt(0) - 65);

        // padding X si impar
        if (numeros.length % 2 !== 0) {
            numeros.push(23); // 'X'
        }

        // encriptar solo letras
        let encriptadoSoloLetras = "";
        for (let i = 0; i < numeros.length; i += 2) {
            const v1 = numeros[i];
            const v2 = numeros[i + 1];

            const c1 = mod(key[0][0] * v1 + key[0][1] * v2, 26);
            const c2 = mod(key[1][0] * v1 + key[1][1] * v2, 26);

            encriptadoSoloLetras += String.fromCharCode(65 + c1);
            encriptadoSoloLetras += String.fromCharCode(65 + c2);
        }

        // reconstruir respetando espacios / signos
        let idx = 0;
        let encriptadoConEspacios = "";
        for (let ch of textoOriginal) {
            const isLetter = ch >= "A" && ch <= "Z";
            if (isLetter) {
                encriptadoConEspacios += encriptadoSoloLetras[idx++] || "";
            } else {
                encriptadoConEspacios += ch;
            }
        }

        // si sobran letras cifradas por padding, agregarlas al final
        if (idx < encriptadoSoloLetras.length) {
            encriptadoConEspacios += encriptadoSoloLetras.slice(idx);
        }

        if (resultadoDiv) resultadoDiv.textContent = encriptadoConEspacios;
        // opcional: también ponerlo en el textarea
        mensajeInput.value = encriptadoConEspacios;
        if (charCount) charCount.textContent = `${mensajeInput.value.length}/200`;
    });
}

// ========= DESENCRIPTAR (respetando espacios / signos) =========

if (btnDesencriptar) {
    btnDesencriptar.addEventListener("click", () => {
        if (resultadoDiv) resultadoDiv.classList.remove("error");
        if (debugPre) debugPre.textContent = "";

        let key = [
            [parseInt(k11.value) || 0, parseInt(k12.value) || 0],
            [parseInt(k21.value) || 0, parseInt(k22.value) || 0]
        ];

        key = hacerClaveInvertible(key);

        const textoCifradoConEspacios = (resultadoDiv?.textContent || mensajeInput.value || "").toUpperCase();
        const soloLetrasCifradas = textoCifradoConEspacios.replace(/[^A-Z]/g, "");

        if (soloLetrasCifradas.length === 0) {
            if (resultadoDiv) {
                resultadoDiv.textContent = "Error: No hay texto cifrado en el resultado";
                resultadoDiv.classList.add("error");
            }
            return;
        }

        const invKey = matrizInversa(key);
        if (!invKey) {
            if (resultadoDiv) {
                resultadoDiv.textContent = "Error inesperado con la clave generada";
                resultadoDiv.classList.add("error");
            }
            return;
        }

        let numeros = soloLetrasCifradas.split("").map(c => c.charCodeAt(0) - 65);
        let textoPlanoSoloLetras = "";

        for (let i = 0; i < numeros.length; i += 2) {
            if (i + 1 >= numeros.length) break; // si queda una sola, era padding
            const c1 = numeros[i];
            const c2 = numeros[i + 1];

            const p1 = mod(invKey[0][0] * c1 + invKey[0][1] * c2, 26);
            const p2 = mod(invKey[1][0] * c1 + invKey[1][1] * c2, 26);

            textoPlanoSoloLetras += String.fromCharCode(65 + p1);
            textoPlanoSoloLetras += String.fromCharCode(65 + p2);
        }

        // reconstruir respetando espacios / signos
        let idx = 0;
        let textoPlanoConEspacios = "";
        for (let ch of textoCifradoConEspacios) {
            const isLetter = ch >= "A" && ch <= "Z";
            if (isLetter && idx < textoPlanoSoloLetras.length) {
                textoPlanoConEspacios += textoPlanoSoloLetras[idx++] || "";
            } else {
                textoPlanoConEspacios += ch;
            }
        }

        // quitar posible padding 'X' al final
        if (textoPlanoConEspacios.endsWith("X")) {
            textoPlanoConEspacios = textoPlanoConEspacios.slice(0, -1);
        }

        if (resultadoDiv) resultadoDiv.textContent = textoPlanoConEspacios;
        mensajeInput.value = textoPlanoConEspacios;
        if (charCount) charCount.textContent = `${mensajeInput.value.length}/200`;
    });
}

// ========= LIMPIAR =========

if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
        mensajeInput.value = "";
        if (charCount) charCount.textContent = "0/200";
        if (resultadoDiv) resultadoDiv.textContent = "Aquí aparecerá el resultado...";
        if (matrizMensaje) matrizMensaje.textContent = "Escribe un mensaje primero...";
        if (debugPre) debugPre.textContent = "";
    });
}
