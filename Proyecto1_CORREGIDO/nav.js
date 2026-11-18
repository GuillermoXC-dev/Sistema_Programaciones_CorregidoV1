// ==========================================================
// NAVEGACIÓN UNIFICADA DINÁMICA
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
    const navContainer = document.getElementById("nav-container");
    if (!navContainer) return;

    const rutaActual = window.location.pathname.split("/").pop() || "index.html";

    const enlaces = [
        { href: "index.html", texto: "Material Rodante", icono: "img/tema_v7/icono-material.svg" },
        { href: "dashboard.html", texto: "Panel Principal", icono: "img/tema_v7/icono-inicio.svg" },
        { href: "combustible.html", texto: "Combustible", icono: "img/tema_v7/icono-combustible.svg" },
        { href: "costos.html", texto: "Costos y Gastos", icono: "img/tema_v7/icono-costos.svg" },
        { href: "incidencias.html", texto: "Incidencias", icono: "img/tema_v7/icono-incidencias.svg" },
        { href: "distribucion_personal.html", texto: "Personal", icono: "img/tema_v7/icono-personal.svg" },
        { href: "servicio-patio.html", texto: "Servicio de Patio", icono: "img/tema_v7/icono-patio.svg" }
    ];

    let htmlNav = `<nav class="menu-dashboard" style="background:#ffffff; border-radius:14px; padding:8px 16px; margin:16px auto; display:flex; flex-wrap:wrap; gap:8px; box-shadow:0 4px 14px rgba(0,0,0,0.06); border:1px solid #dfe7e4; justify-content:center; max-width:1200px;">`;

    enlaces.forEach(link => {
        const activo = rutaActual === link.href ? 'style="border:none; background:#123c2a; color:#fff; padding:8px 16px; border-radius:20px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;"' : 'style="border:none; background:#f0f4f2; color:#2c3e50; padding:8px 16px; border-radius:20px; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s;"';
        
        htmlNav += `<a href="${link.href}" ${activo}>${link.texto}</a>`;
    });

    htmlNav += `</nav>`;
    navContainer.innerHTML = htmlNav;
});
