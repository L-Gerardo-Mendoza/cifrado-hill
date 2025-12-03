# Cifrado Hill 2×2 - Proyecto Web

## Datos del alumno

- **Nombre completo:** Luis Gerardo Sánchez Mendoza  
- **Grupo:** (Salon B)  
- **Materia:** Fundamentos de Álgebra  

---

## Descripción del proyecto

Este proyecto es una pequeña aplicación web que implementa el **Cifrado Hill** con una matriz clave de tamaño **2×2**.  

La página permite:

- Encriptar un mensaje de texto usando una matriz clave 2×2.
- Desencriptar un mensaje cifrado usando la misma matriz.
- Ver el proceso interno como pares de números (A=0…Z=25).

Está hecha con **HTML, CSS y JavaScript** y se despliega como página web (por ejemplo, en GitHub Pages).

---

## ¿Cómo funciona el Cifrado Hill?

### Alfabeto

Se usa el alfabeto en mayúsculas:

> A = 0, B = 1, C = 2, ..., Z = 25

El texto que escribe el usuario se limpia:

- Se pasa a mayúsculas.
- Se quitan acentos.
- Se eliminan caracteres que no sean letras (espacios, números, signos, etc.).

### Matriz clave 2×2

La clave es una matriz:

\[
K =
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\]

Los valores \(a, b, c, d\) los escribe el usuario en la interfaz.

Para que el cifrado funcione, la matriz debe ser **invertible módulo 26**.  
Eso significa que su determinante:

\[
\det(K) = ad - bc
\]

no debe ser múltiplo de 2 ni de 13, y se debe cumplir:

\[
\gcd(\det(K), 26) = 1
\]

En el código se revisa esto y, si la matriz no es válida, se muestra un mensaje de error.

### Encriptar (cifrar)

1. El texto limpio se agrupa en **pares de letras**.  
   - Si hay una cantidad impar de letras, se agrega una letra de relleno (por ejemplo, `X`).
2. Cada letra se convierte a número (A=0…Z=25).
3. Para cada par \((x_1, x_2)\) se aplica la matriz:

\[
\begin{pmatrix}
y_1 \\
y_2
\end{pmatrix}
=
K
\begin{pmatrix}
x_1 \\
x_2
\end{pmatrix}
\mod 26
\]

4. Los valores \(y_1\) y \(y_2\) se convierten de nuevo a letras y forman el texto cifrado.

### Desencriptar

Para desencriptar se usa la **matriz inversa de K módulo 26**.

1. Se calcula la inversa:

\[
K^{-1} = (\det(K))^{-1}
\begin{pmatrix}
d & -b \\
-c & a
\end{pmatrix}
\mod 26
\]

donde \((\det(K))^{-1}\) es el número que cumple:

\[
\det(K) \cdot (\det(K))^{-1} \equiv 1 \pmod{26}
\]

2. El texto cifrado se agrupa en pares \((y_1, y_2)\).
3. Se aplica la matriz inversa:

\[
\begin{pmatrix}
x_1 \\
x_2
\end{pmatrix}
=
K^{-1}
\begin{pmatrix}
y_1 \\
y_2
\end{pmatrix}
\mod 26
\]

4. Estos valores se convierten a letras y se obtiene el mensaje original (tal vez con una `X` extra al final, si se usó como relleno).

---

## Instrucciones de uso

### Cómo ejecutar la aplicación

1. Clona el repositorio o descarga los archivos.
2. Asegúrate de tener en la carpeta estos archivos:
   - `index.html`
   - `style.css`
   - `script.js`
3. Abre el archivo `index.html` en tu navegador (doble clic).

### Cómo usar el encriptador / desencriptador

1. **Escribe el mensaje**  
   - En el cuadro de texto escribe el mensaje que quieres cifrar o descifrar.  
   - Solo se usarán letras A–Z; el resto se ignora.

2. **Configura la matriz clave**  
   - Escribe los valores de la matriz 2×2 en los cuatro campos.  
   - Puedes usar como ejemplo la matriz:

     \[
     \begin{pmatrix}
     3 & 3 \\
     2 & 5
     \end{pmatrix}
     \]

     que es una clave válida (invertible mod 26).

3. **Encriptar**  
   - Escribe un texto normal.
   - Haz clic en **“Encriptar”**.
   - El resultado cifrado aparece en la sección de resultado y también sustituye el contenido del cuadro de texto.

4. **Desencriptar**  
   - Asegúrate de que el cuadro de texto tenga el texto cifrado (por ejemplo, el resultado del paso anterior).
   - Usa la misma matriz clave.
   - Haz clic en **“Desencriptar”**.
   - El mensaje original se mostrará en el resultado y en el cuadro de texto.

5. **Limpiar**  
   - Haz clic en **“Limpiar”** para borrar mensaje, resultado y detalle numérico.

---

## Personalización del diseño

Para la parte de diseño se hizo una interfaz con estilo:

- Fondo **negro** con un leve brillo verde.
- Tarjetas oscuras con bordes suaves.
- Botones redondeados con color verde de acento.
- Tipografía sencilla del sistema, fácil de leer.
- Un panel de “detalle numérico” donde se ve el proceso del cifrado:
  - Letras convertidas a números.
  - Multiplicación por la matriz.
  - Conversión de regreso a letras.

La idea es un diseño **minimalista**, limpio, con un tema **negro y verde** que combina con el concepto de cifrado y matrices.

---

## Control de versiones (Git/GitHub)

Ejemplo de cómo se manejó el historial de commits:

- `git commit -m "Crear estructura base del proyecto (HTML/CSS/JS)"`  
- `git commit -m "Implementar cifrado Hill 2x2"`  
- `git commit -m "Agregar función de desencriptado y matriz inversa mod 26"`  
- `git commit -m "Aplicar diseño minimalista negro y verde"`  
- `git commit -m "Documentar proyecto en README"`  

El repositorio se sube a GitHub y se despliega con GitHub Pages para tener una URL pública donde se puede probar la aplicación.

---
