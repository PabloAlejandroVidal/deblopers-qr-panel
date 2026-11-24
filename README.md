# Deb&Lopers - Panel Web Est�tico de QR

Panel web est�tico para mostrar en pantalla o imprimir los QR del sistema La Comanda. Las mesas se consultan en modo lectura a la funci�n p�blica de Supabase al abrir Inicio o Mesas.

## Flujo de uso

1. Subir esta carpeta a GitHub Pages, Netlify, Vercel, Firebase Hosting o cualquier hosting est�tico.
2. Abrir la web desde PC, notebook, tablet o iPhone.
3. Escanear los QR con un Android que tenga instalada la APK.
4. La app Android debe reconocer el esquema de deep link `deblopers://`.

## Archivos

- `index.html`: p�gina principal del panel.
- `entrance.html`: QR de entrada al restaurante.
- `tables.html`: QR de mesas.
- `tips.html`: QR de propinas.
- `styles.css`: estilos compartidos.
- `app.js`: consulta las mesas, define propinas, deep links y generaci�n de QR.

## Actualizar los QR de mesas

La p�gina carga autom�ticamente las mesas actuales desde `public-table-qr-codes`. Tambi�n pod�s pulsar **Actualizar QR** para volver a consultarlas durante la presentaci�n.

El n�mero de mesa (`number`) se muestra como etiqueta y el identificador (`id`) forma el deep link `deblopers://table/{id}`. Si la API no responde durante una recarga, el panel conserva las �ltimas mesas v�lidas y muestra una advertencia. La web solo env�a una petici�n GET y usa una clave publicable; no incluye credenciales privadas ni escribe en Supabase.

Ingreso: `deblopers://entrance`. Propinas: `deblopers://tip/0`, `/5`, `/10`, `/15` y `/20`.

## Impresi�n

Us� el control **Imprimir** del pie de p�gina o la opci�n de impresi�n del navegador. Los controles se ocultan en papel y cada tarjeta QR se mantiene completa al paginar.

## Importante

Esta web no es una APK ni reemplaza la app m�vil. Solo muestra QR que abren la app instalada mediante deep links. Para incorporar mesas nuevas o cambios de n�mero, actualiz� los datos en La Comanda y luego puls� **Actualizar QR** en el panel.

