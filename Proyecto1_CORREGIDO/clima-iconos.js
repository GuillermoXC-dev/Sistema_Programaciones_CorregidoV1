/* Adapta únicamente el icono visual. No consulta datos ni toca los filtros. */
(() => {
 'use strict';
 function dibujar() {
   const icono = document.querySelector('#climaOperativo .clima-icono');
   if (!icono || icono.querySelector('svg')) return;
   const estado = document.querySelector('#climaOperativo .clima-condicion')?.textContent.trim() || '';
   const texto = estado.toLocaleLowerCase('es-MX');
   const nube = '<path d="M18 43a12 12 0 0 1 0-24 17 17 0 0 1 32-2 13 13 0 1 1 3 26Z" fill="url(#clima-nube)" stroke="#abc6dd" stroke-width="1.2"/>';
   const sol = '<circle cx="24" cy="20" r="12" fill="#f3d47d" stroke="#e4bf63"/>';
   let figura;
   if (/tormenta/.test(texto)) figura = nube + '<path d="m37 35-8 13h7l-3 10 13-17h-8l5-6" fill="#7aadd6"/>';
   else if (/lluv|llov|chubasc/.test(texto)) figura = nube + '<path d="m23 49-3 6m16-6-3 6m16-6-3 6" fill="none" stroke="#75aada" stroke-width="3.5" stroke-linecap="round"/>';
   else if (/nieve|nevada/.test(texto)) figura = nube + '<g fill="#77a7d0"><circle cx="24" cy="51" r="2"/><circle cx="36" cy="54" r="2"/><circle cx="48" cy="51" r="2"/></g>';
   else if (/niebla|neblina/.test(texto)) figura = nube + '<path d="M14 48h42M20 54h30" stroke="#a0b9c9" stroke-width="2.5" stroke-linecap="round"/>';
   else if (/despejad|solead/.test(texto)) figura = '<g transform="translate(10 8)">' + sol + '<path d="M24 2v-4m0 44v-4M6 20H2m44 0h-4M11 7 8 4m29 32-3-3M11 33l-3 3M37 4l-3 3" stroke="#e4bf63" stroke-width="2.5" stroke-linecap="round"/></g>';
   else if (/parcial|interval/.test(texto)) figura = sol + nube;
   else if (/nubl|cubiert/.test(texto)) figura = nube;
   else return; // Un estado desconocido conserva el icono de la consulta original.
   const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
   svg.setAttribute('viewBox', '0 0 72 64');
   svg.setAttribute('aria-hidden', 'true');
   svg.innerHTML = '<defs><linearGradient id="clima-nube" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#eff8ff"/><stop offset=".55" stop-color="#c8def2"/><stop offset="1" stop-color="#8bb5d9"/></linearGradient></defs>' + figura;
   icono.setAttribute('role', 'img');
   icono.setAttribute('aria-label', estado);
   icono.replaceChildren(svg);
 }
 function iniciar() {
   const contenido = document.getElementById('climaContenido');
   if (!contenido) return;
   new MutationObserver(dibujar).observe(contenido, { childList:true, subtree:true, characterData:true });
   dibujar();
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once:true });
 else iniciar();
})();
