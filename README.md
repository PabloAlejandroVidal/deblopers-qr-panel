# Deb&Lopers - Panel Web Estático de QR

Panel web estático para mostrar en pantalla o imprimir los QR del sistema La Comanda.

## Flujo de uso

1. Subir esta carpeta a GitHub Pages, Netlify, Vercel, Firebase Hosting o cualquier hosting estático.
2. Abrir la web desde PC, notebook, tablet o iPhone.
3. Escanear los QR con un Android que tenga instalada la APK.
4. La app Android debe reconocer el esquema de deep link `deblopers://`.

## Archivos

- `index.html`: página principal del panel.
- `entrance.html`: QR de entrada al restaurante.
- `tables.html`: QR de mesas.
- `tips.html`: QR de propinas.
- `styles.css`: estilos compartidos.
- `app.js`: datos de mesas, propinas, deep links y generación de QR.

## Cambiar mesas o propinas

Editar los arrays `TABLES` y `TIPS` dentro de `app.js`.

## Importante

Esta web no es una APK ni reemplaza la app móvil. Solo muestra QR que abren la app instalada mediante deep links.
