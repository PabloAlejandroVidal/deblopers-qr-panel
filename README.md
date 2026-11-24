# Deb&Lopers - Panel Web Estático de QR

Panel web estático para mostrar en pantalla o imprimir los QR del sistema La Comanda. Las mesas se consultan en modo lectura a la función pública de Supabase al abrir Inicio o Mesas.

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
- `app.js`: consulta las mesas, define propinas, deep links y generación de QR.

## Actualizar los QR de mesas

La página carga automáticamente las mesas actuales desde `public-table-qr-codes`. También podés pulsar **Actualizar QR** para volver a consultarlas durante la presentación.

El número de mesa (`number`) se muestra como etiqueta y el identificador (`id`) forma el deep link `deblopers://table/{id}`. Si la API no responde durante una recarga, el panel conserva las últimas mesas válidas y muestra una advertencia. La web solo envía una petición GET y usa una clave publicable; no incluye credenciales privadas ni escribe en Supabase.

Ingreso: `deblopers://entrance`. Propinas: `deblopers://tip/0`, `/5`, `/10`, `/15` y `/20`.

## Impresión

Usá el control **Imprimir** del pie de página o la opción de impresión del navegador. Los controles se ocultan en papel y cada tarjeta QR se mantiene completa al paginar.

## Importante

Esta web no es una APK ni reemplaza la app móvil. Solo muestra QR que abren la app instalada mediante deep links. Para incorporar mesas nuevas o cambios de número, actualizá los datos en La Comanda y luego pulsá **Actualizar QR** en el panel.
