// ==========================================================
// TREN MAYA DE CARGA - ALERTAS Y SUPABASE REALTIME
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
    inicializarRealtimeSupabase();
    verificarAlertasOperativas();
});

// 1. ESCUCHADOR DE SUPABASE REALTIME
function inicializarRealtimeSupabase() {
    if (typeof supabaseClient === "undefined") {
        console.warn("Supabase no está disponible para Realtime.");
        return;
    }

    // Suscripción a la tabla de Programaciones y Operaciones
    supabaseClient
      .channel('cambios-sistema-tren-maya')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Programaciones' },
        (payload) => {
            console.log('🔄 Actualización en tiempo real detectada:', payload);
            mostrarNotificacionFlotante("¡Se actualizó una operación en tiempo real!", "info");
            
            // Recargar funciones de la interfaz si existen
            if (typeof cargarProgramaciones === 'function') cargarProgramaciones();
            if (typeof cargarGraficaEstatus === 'function') cargarGraficaEstatus();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'combustible' },
        (payload) => {
            console.log('⛽ Nuevo registro de combustible:', payload);
            validarCombustibleAtipico(payload.new);
        }
      )
      .subscribe();
}

// 2. VALIDACIÓN DE COMBUSTIBLE ATÍPICO
function validarConsumoCombustibleAtipico(litrosConsumidos, promedioHistoricoRuta) {
    if (!promedioHistoricoRuta || promedioHistoricoRuta <= 0) return false;
    const desviacion = (litrosConsumidos - promedioHistoricoRuta) / promedioHistoricoRuta;
    return desviacion > 0.25; // Retorna true si supera un 25% el promedio
}

async function validarCombustibleAtipico(registroNuevo) {
    const litros = Number(registroNuevo.litros || 0);
    // Supongamos un promedio estándar de ruta de 400 litros por viaje de referencia
    if (validarConsumoCombustibleAtipico(litros, 400)) {
        mostrarNotificacionFlotante(`⚠️ Alerta de Combustible: Consumo atípico detectado (${litros} L) en el tren ${registroNuevo.tren || 'N/D'}.`, "warning");
    }
}

// 3. EVALUACIÓN DE MANTENIMIENTO PREVENTIVO
function evaluarAlertaMantenimiento(locomotora) {
    const diasServicio = locomotora.dias_desde_ultimo_servicio || 0;
    const kilometraje = locomotora.kilometraje_actual || 0;

    if (diasServicio > 30 || kilometraje > 15000) {
        return { nivel: "rojo", mensaje: `🚨 Mantenimiento Urgente: Locomotora ${locomotora.no_locomotora} excede límites operativos.` };
    } else if (diasServicio > 25 || kilometraje > 12000) {
        return { nivel: "amarillo", mensaje: `⚠️ Aviso Preventivo: Locomotora ${locomotora.no_locomotora} cercana a revisión.` };
    }
    return { nivel: "verde", mensaje: "Óptima" };
}

async function verificarAlertasOperativas() {
    if (typeof supabaseClient === "undefined") return;
    try {
        const { data, error } = await supabaseClient.from("Locomotoras").select("*");
        if (!error && data) {
            data.forEach(loc => {
                const alerta = evaluarAlertaMantenimiento(loc);
                if (alerta.nivel === "rojo") {
                    console.warn(alerta.mensaje);
                }
            });
        }
    } catch (e) {
        console.error("Error verificando alertas:", e);
    }
}

// 4. NOTIFICACIONES VISUALES FLOTANTES EN PANTALLA
function mostrarNotificacionFlotante(mensaje, tipo = "info") {
    let contenedor = document.getElementById("contenedorNotificacionesTrenMaya");
    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "contenedorNotificacionesTrenMaya";
        contenedor.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px;";
        document.body.appendChild(contenedor);
    }

    const toast = document.createElement("div");
    let colorFondo = "#2563eb"; // Azul info
    if (tipo === "warning") colorFondo = "#d97706"; // Ámbar
    if (tipo === "error" || tipo === "rojo") colorFondo = "#dc2626"; // Rojo

    toast.style.cssText = `background: ${colorFondo}; color: white; padding: 12px 18px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 13px; font-weight: 600; opacity: 0; transition: opacity 0.3s ease;`;
    toast.textContent = mensaje;
    contenedor.appendChild(toast);

    setTimeout(() => { toast.style.opacity = "1"; }, 50);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}