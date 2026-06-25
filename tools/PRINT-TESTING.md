# Afinar la impresión — Canon PIXMA iP8750 (IPP de red)

Utilidad local, fuera del sitio publicado. Node puro, sin dependencias.
Misma vía IPP que usará luego el botón "Print" del admin.

## Antes de empezar (5 min, mañana)
1. Tener **Node** instalado en el equipo desde el que imprimes (Windows o Mac).
   Comprobar: `node -v`. Si no está → https://nodejs.org (LTS).
2. **IP de la impresora**: en la pantalla de la iP8750 → Config. de red, o en el
   router. Anótala (ej. `192.168.1.50`).
3. Tener a mano un JPEG de prueba (export de una obra a máxima calidad).

## Paso 1 — Ver qué soporta la impresora
```
node tools/print-test.js attrs <IP>
```
Esto vuelca tamaños, **tipos de papel exactos** (los nombres crípticos de Canon),
calidades y si admite **margen 0 (borderless)**. Me pegas la salida y elijo
contigo los valores correctos para tu papel de arte en A4/A3 sin bordes.

## Paso 2 — Impresión de prueba
```
node tools/print-test.js print <IP> prueba.jpg --size a4 --borderless --type <el-que-elijamos>
```
Luego A3:
```
node tools/print-test.js print <IP> prueba.jpg --size a3 --borderless --type <...> --quality high
```
Iteramos sobre el resultado real (bordes, color, calidad) hasta dejarlo fino.

## Notas
- JPEG es lo más seguro por IPP. Si una prueba PNG da error, exporta a JPEG.
- "Borderless" = márgenes a 0. Algunos papeles de bellas artes de Canon *fuerzan*
  margen; si el tamaño elegido no admite 0, lo veremos en `attrs` y ajustamos.
- Nada de esto toca la web ni se publica: vive en `tools/`.
