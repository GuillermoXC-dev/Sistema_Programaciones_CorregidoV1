// ==========================================================
// CONFIGURACIÓN CENTRALIZADA DEL SISTEMA
// Cliente de Supabase + Utilidades Compartidas
// ==========================================================
console.log("⚙️ Cargando config.js...");

const SUPABASE_URL = "https://ugjxtqaxpjifgtspvfbh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_j49jkdJd5VzDvNgQJX7Z9A_Z_IWK_fp";

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
var supabaseClient = window.supabaseClient;

// Variable global disponible para servicio_patio.html y todos tus demás archivos
var supabaseClient = window.supabaseClient;

console.log("✅ config.js inicializado correctamente.");

// ==========================================================
// FUNCIONES Y UTILIDADES GLOBALES COMPARTIDAS
// ==========================================================

window.obtenerElemento = function(id) {
    return document.getElementById(id);
};

window.escaparHTML = function(texto) {
    if (texto === null || texto === undefined) return "";
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

window.establecerValor = function(id, valor) {
    const el = document.getElementById(id);
    if (el) {
        el.value = (valor !== null && valor !== undefined) ? valor : "";
    }
};

window.formatearHora = function(hora) {
    if (!hora) return "";
    return String(hora).substring(0, 5);
};

window.formatearMoneda = function(valor) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN"
    }).format(Number(valor) || 0);
};

window.mostrarMensaje = function(texto, tipo = "info", contenedorId = null) {
    const idsPosibles = [contenedorId, "mensajeIncidencia", "mensajeCosto", "mensajeCombustible", "mensajeGlobal", "mensaje"];
    let elemento = null;
    for (const id of idsPosibles) {
        if (id) {
            elemento = document.getElementById(id);
            if (elemento) break;
        }
    }

    if (!elemento) {
        if (tipo === "error") console.error(texto);
        else console.log(texto);
        return;
    }

    elemento.textContent = texto;
    elemento.className = `mensaje ${tipo}`;
    elemento.style.color = tipo === "error" ? "#dc2626" : (tipo === "exito" ? "#16a34a" : "#2563eb");

    setTimeout(() => {
        elemento.textContent = "";
        elemento.className = "mensaje";
    }, 4000);
};

console.log("✅ config.js inicializado correctamente.");
// ==========================================================
// FUNCIÓN PARA EXPORTAR A EXCEL
// ==========================================================
function exportarTablaAExcel(idTabla, nombreArchivo = 'reporte_tren_maya.xlsx') {
    const tabla = document.getElementById(idTabla);
    if (!tabla) {
        alert("No se encontró la tabla para exportar.");
        return;
    }
    const wb = XLSX.utils.table_to_book(tabla, { sheet: "Reporte" });
    XLSX.writeFile(wb, nombreArchivo);
}