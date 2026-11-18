/* Presentación exclusivamente: fecha común para todos los encabezados. */
(() => {
  'use strict';
  const zona = 'America/Mexico_City';
  const formato = new Intl.DateTimeFormat('es-MX', {
    timeZone: zona, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const iso = new Intl.DateTimeFormat('en-CA', {
    timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit'
  });
  function actualizarFecha() {
    const ahora = new Date();
    const partes = Object.fromEntries(iso.formatToParts(ahora).map(p => [p.type, p.value]));
    document.querySelectorAll('.p1-header .p1-fecha').forEach(elemento => {
      elemento.textContent = formato.format(ahora);
      elemento.setAttribute('datetime', `${partes.year}-${partes.month}-${partes.day}`);
    });
  }
  function iniciar() {
    actualizarFecha();
    // Ejecuta después de los formateadores antiguos que escuchan DOMContentLoaded.
    requestAnimationFrame(actualizarFecha);
    setInterval(actualizarFecha, 60000);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();
document.addEventListener("DOMContentLoaded", async () => {
    const menu = document.querySelector("nav");
    if (!menu) return;
    const enlace = document.createElement("a");
    enlace.href = "acceso.html";
    enlace.className = menu.querySelector("button,a")?.className.replace(/\b(active|activo|activa)\b/g, "") || "";
    enlace.textContent = "Iniciar sesión";
    menu.append(enlace);
    const sesion = await window.supabaseClient?.auth.getSession();
    if (sesion?.data?.session) enlace.textContent = "Mi cuenta";
});
