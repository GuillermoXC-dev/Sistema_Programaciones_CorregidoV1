// ==========================================================
// SISTEMA DE OPERACIONES
// MÓDULOS EXTRA
// Servicio de Patio + Salidas + Locomotoras + Mantenimientos
// ==========================================================

console.log("🚆 operaciones-extra.js cargando...");


// ==========================================================
// VARIABLES
// ==========================================================

let servicioPatioEditandoId = null;
let salidaEditandoId = null;
let locomotoraEditandoId = null;
let mantenimientoEditandoId = null;
let fechaCalendarioActual = new Date();
let miGraficaMantenimiento = null;


// ==========================================================
// FUNCIONES AUXILIARES
// ==========================================================

function obtenerElemento(id) {
    return document.getElementById(id);
}


// Fallback seguro sin redeclarar variables globales const
if (typeof window.escaparHTML === "undefined") {
    window.escaparHTML = function(texto) {
        if (texto === null || texto === undefined) return '';
        return String(texto)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
}
var escaparHTML = window.escaparHTML;

if (typeof window.establecerValor === "undefined") {
    window.establecerValor = function(id, valor) {
        const el = document.getElementById(id);
        if (el) el.value = (valor !== null && valor !== undefined) ? valor : '';
    };
}
var establecerValor = window.establecerValor;



// ==========================================================
// INICIO
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚜 Operaciones extra iniciando...");

    inicializarPestanasExtra();
    inicializarServicioPatio();
    inicializarSalidas();
    inicializarLocomotoras();
    inicializarMantenimientos();
    cargarTodosLosEquiposParaMantenimiento();
    renderizarCalendarioMantenimientos();
    inicializarFiltrosGrafica();
    cargarLocomotoras();
    cargarServiciosPatio();
    cargarSalidas();
    cargarLocomotorasTabla();
    cargarMantenimientos();
    actualizarResumenMantenimientos();
    actualizarContadoresRodante();
});

// ==========================================================
// CONTADORES DE MATERIAL RODANTE (Con nombres exactos de Supabase)
// ==========================================================
async function actualizarContadoresRodante() {
    if (typeof supabaseClient === "undefined") return;

    const tablas = [
        { nombre: "Locomotoras", idHtml: "contador_locomotoras" },
        { nombre: "Gondola", idHtml: "contador_gondolas" },
        { nombre: "Furgon", idHtml: "contador_furgones" },
        { nombre: "CarroTanque", idHtml: "contador_carro_tanque" },
        { nombre: "Tolva", idHtml: "contador_tolvas" },
        { nombre: "plataforma_intermodal", idHtml: "contador_plataformas" }
    ];

    for (let t of tablas) {
        const { count, error } = await supabaseClient
            .from(t.nombre)
            .select('*', { count: 'exact', head: true });

        if (!error) {
            const el = document.getElementById(t.idHtml);
            if (el) el.textContent = count || 0;
        } else {
            console.error(`Error contando la tabla ${t.nombre}:`, error);
        }
    }
}

// ==========================================================
// PESTAÑAS DE LOS MÓDULOS NUEVOS
// ==========================================================

function inicializarPestanasExtra() {
    const tabServicio = obtenerElemento("tabServicioPatio");
    const tabSalidas = obtenerElemento("tabSalidas");
    const tabLocomotoras = obtenerElemento("tabLocomotoras");

    const seccionServicio = obtenerElemento("seccionServicioPatio");
    const seccionSalidas = obtenerElemento("seccionSalidas");
    const seccionLocomotoras = obtenerElemento("seccionLocomotoras");


    if (tabServicio) {
        tabServicio.addEventListener("click", () => {
            ocultarSeccionesExtra();
            if (seccionServicio) seccionServicio.style.display = "block";
            activarTabExtra(tabServicio);
            cargarServiciosPatio();
            cargarLocomotoras();
        });
    }


    if (tabSalidas) {
        tabSalidas.addEventListener("click", () => {
            ocultarSeccionesExtra();
            if (seccionSalidas) seccionSalidas.style.display = "block";
            activarTabExtra(tabSalidas);
            cargarSalidas();
            cargarLocomotoras();
        });
    }


    if (tabLocomotoras) {
        tabLocomotoras.addEventListener("click", () => {
            ocultarSeccionesExtra();
            if (seccionLocomotoras) seccionLocomotoras.style.display = "block";
            activarTabExtra(tabLocomotoras);
            cargarLocomotorasTabla();
            cargarLocomotorasParaMantenimiento();
        });
    }
}


function ocultarSeccionesExtra() {
    const secciones = [
        "seccionServicioPatio",
        "seccionSalidas",
        "seccionLocomotoras"
    ];

    secciones.forEach(id => {
        const seccion = obtenerElemento(id);
        if (seccion) seccion.style.display = "none";
    });
}


function activarTabExtra(tabActiva) {
    const tabs = [
        "tabServicioPatio",
        "tabSalidas",
        "tabLocomotoras"
    ];

    tabs.forEach(id => {
        const tab = obtenerElemento(id);
        if (tab) tab.classList.remove("activa");
    });

    if (tabActiva) tabActiva.classList.add("activa");
}


// ==========================================================
// CAMBIO DE SUB-PESTAÑAS EN MATERIAL RODANTE
// ==========================================================

function cambiarSubPestanaRodante(modulo) {
    const secCatalogo = document.getElementById("subSeccionCatalogo");
    const secMantenimientos = document.getElementById("subSeccionMantenimientos");
    const tabCatalogo = document.getElementById("subTabCatalogo");
    const tabMantenimientos = document.getElementById("subTabMantenimientos");

    if (!secCatalogo || !secMantenimientos) return;

    secCatalogo.style.display = "none";
    secMantenimientos.style.display = "none";
    if (tabCatalogo) tabCatalogo.classList.remove("activa");
    if (tabMantenimientos) tabMantenimientos.classList.remove("activa");

    if (modulo === 'catalogo') {
        secCatalogo.style.display = "block";
        if (tabCatalogo) tabCatalogo.classList.add("activa");
    } else if (modulo === 'mantenimientos') {
        secMantenimientos.style.display = "block";
        if (tabMantenimientos) tabMantenimientos.classList.add("activa");
        cargarTodosLosEquiposParaMantenimiento();
        renderizarCalendarioMantenimientos();
        cargarMantenimientos();
        actualizarResumenMantenimientos();
        actualizarGraficaMantenimientos();
    }
}


// ==========================================================
// SERVICIO DE PATIO
// ==========================================================

function inicializarServicioPatio() {
    const btnGuardar = obtenerElemento("btnGuardarServicioPatio");
    const btnLimpiar = obtenerElemento("btnLimpiarServicioPatio");
    const btnCancelar = obtenerElemento("btnCancelarServicioPatio");

    if (btnGuardar) btnGuardar.addEventListener("click", guardarServicioPatio);
    if (btnLimpiar) btnLimpiar.addEventListener("click", limpiarServicioPatio);
    if (btnCancelar) {
        btnCancelar.addEventListener("click", () => {
            servicioPatioEditandoId = null;
            limpiarServicioPatio();
        });
    }
}

async function guardarServicioPatio() {
    if (typeof supabaseClient === "undefined") {
        alert("❌ No se encontró la conexión con Supabase.");
        return;
    }

    const fecha = obtenerElemento("fechaServicioPatio")?.value || "";
    const locomotora = obtenerElemento("locomotoraServicioPatio")?.value.trim() || "";
    const horaInicio = obtenerElemento("horaInicioServicioPatio")?.value || "";
    const empresa = obtenerElemento("empresaServicioPatio")?.value.trim() || "";
    const conductor = obtenerElemento("conductorServicioPatio")?.value.trim() || "";
    const tipoOperacion = obtenerElemento("tipoOperacionServicioPatio")?.value || "";
    const tipoMercancia = obtenerElemento("tipoMercanciaServicioPatio")?.value.trim() || "";
    const cantidadCarros = Number(obtenerElemento("cantidadCarrosServicioPatio")?.value || 0);
    const toneladas = Number(obtenerElemento("toneladasServicioPatio")?.value || 0);
    const patioDestino = obtenerElemento("patioDestinoServicioPatio")?.value || "";
    const responsable = obtenerElemento("responsableServicioPatio")?.value.trim() || "";
    const estado = obtenerElemento("estadoServicioPatio")?.value || "Programado";
    const observaciones = obtenerElemento("observacionesServicioPatio")?.value.trim() || "";

    if (!fecha || !locomotora || !horaInicio || !empresa || !conductor || !tipoOperacion || !patioDestino || !responsable) {
        alert("Completa los campos obligatorios.");
        return;
    }

    const datos = {
        fecha, locomotora, hora_inicio: horaInicio, empresa,
        conductor_maquinista: conductor, tipo_operacion: tipoOperacion,
        tipo_mercancia: tipoMercancia, cantidad_carros: cantidadCarros,
        toneladas, patio_destino: patioDestino, responsable, estado, observaciones
    };

    if (servicioPatioEditandoId) {
        const { error } = await supabaseClient.from("servicio_patio").update(datos).eq("id", servicioPatioEditandoId);
        if (error) { alert("❌ Error al actualizar: " + error.message); return; }
        alert("✅ Servicio actualizado correctamente.");
    } else {
        const { error } = await supabaseClient.from("servicio_patio").insert([datos]);
        if (error) { alert("❌ Error al guardar: " + error.message); return; }
        alert("✅ Servicio registrado correctamente.");
    }

    servicioPatioEditandoId = null;
    limpiarServicioPatio();
    cargarServiciosPatio();
}

async function cargarServiciosPatio() {
    if (typeof supabaseClient === "undefined") return;
    const tabla = obtenerElemento("tablaServicioPatio") || obtenerElemento("tablaServiciosPatio");
    if (!tabla) return;

    const { data, error } = await supabaseClient.from("servicio_patio").select("*").order("fecha", { ascending: false }).order("hora_inicio", { ascending: false });
    if (error) return;

    tabla.innerHTML = "";
    if (!data || data.length === 0) {
        tabla.innerHTML = `<tr><td colspan="7">No hay servicios de patio registrados.</td></tr>`;
        return;
    }

    data.forEach(servicio => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${escaparHTML(servicio.fecha)}</td>
            <td>${escaparHTML(servicio.locomotora)}</td>
            <td>${escaparHTML(servicio.hora_inicio)}</td>
            <td>${escaparHTML(servicio.empresa)}</td>
            <td>${escaparHTML(servicio.conductor_maquinista)}</td>
            <td>${escaparHTML(servicio.tipo_operacion)}</td>
            <td>
                <button type="button" onclick="editarServicioPatio(${servicio.id})">✏️ Editar</button>
                <button type="button" onclick="eliminarServicioPatio(${servicio.id})">🗑️ Eliminar</button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

async function editarServicioPatio(id) {
    const { data, error } = await supabaseClient.from("servicio_patio").select("*").eq("id", id).single();
    if (error || !data) return;

    servicioPatioEditandoId = id;
    establecerValor("fechaServicioPatio", data.fecha);
    establecerValor("locomotoraServicioPatio", data.locomotora);
    establecerValor("horaInicioServicioPatio", data.hora_inicio);
    establecerValor("empresaServicioPatio", data.empresa);
    establecerValor("conductorServicioPatio", data.conductor_maquinista);
    establecerValor("tipoOperacionServicioPatio", data.tipo_operacion);
    establecerValor("tipoMercanciaServicioPatio", data.tipo_mercancia);
    establecerValor("cantidadCarrosServicioPatio", data.cantidad_carros);
    establecerValor("toneladasServicioPatio", data.toneladas);
    establecerValor("patioDestinoServicioPatio", data.patio_destino);
    establecerValor("responsableServicioPatio", data.responsable);
    establecerValor("estadoServicioPatio", data.estado);
    establecerValor("observacionesServicioPatio", data.observaciones);

    const boton = obtenerElemento("btnGuardarServicioPatio");
    if (boton) boton.textContent = "💾 ACTUALIZAR";
}

async function eliminarServicioPatio(id) {
    if (!confirm("¿Deseas eliminar este servicio de patio?")) return;
    const { error } = await supabaseClient.from("servicio_patio").delete().eq("id", id);
    if (error) { alert("❌ Error al eliminar."); return; }
    alert("✅ Servicio eliminado.");
    cargarServiciosPatio();
}

function limpiarServicioPatio() {
    servicioPatioEditandoId = null;
    const boton = obtenerElemento("btnGuardarServicioPatio");
    if (boton) boton.textContent = "💾 GUARDAR";
}


// ==========================================================
// SALIDAS
// ==========================================================

function inicializarSalidas() {
    const btnNuevaSalida = obtenerElemento("btnNuevaSalida");
    const formularioSalidas = obtenerElemento("formularioSalidas");
    const btnGuardar = obtenerElemento("btnGuardarSalida");
    const btnLimpiar = obtenerElemento("btnLimpiarSalida");
    const btnCancelar = obtenerElemento("btnCancelarSalida");

    if (btnNuevaSalida && formularioSalidas) {
        btnNuevaSalida.addEventListener("click", () => {
            formularioSalidas.style.display = "block";
            formularioSalidas.scrollIntoView({ behavior: "smooth" });
        });
    }

    if (btnCancelar && formularioSalidas) {
        btnCancelar.addEventListener("click", () => {
            formularioSalidas.style.display = "none";
            salidaEditandoId = null;
            limpiarSalida();
        });
    }

    if (btnGuardar) btnGuardar.addEventListener("click", guardarSalida);
    if (btnLimpiar) btnLimpiar.addEventListener("click", limpiarSalida);
}

async function guardarSalida() {
    const fecha = obtenerElemento("salida_fecha")?.value || "";
    const locomotora = obtenerElemento("salida_locomotora")?.value || "";
    const origen = obtenerElemento("salida_origen")?.value || "";
    const destino = obtenerElemento("salida_destino")?.value || "";
    const horaSalida = obtenerElemento("salida_hora")?.value || "";
    const personal = obtenerElemento("salida_personal")?.value.trim() || "";
    const combustibleCargado = Number(obtenerElemento("salida_combustible_cargado")?.value || 0);
    const responsable = obtenerElemento("salida_responsable")?.value.trim() || "";
    const combustibleIngresado = Number(obtenerElemento("salida_combustible_ingresado")?.value || 0);
    const estatus = obtenerElemento("salida_estatus")?.value || "Finalizado";
    const observaciones = obtenerElemento("salida_observaciones")?.value.trim() || "";

    if (!fecha || !locomotora || !origen || !destino || !horaSalida || !personal || !responsable) {
        alert("Completa los campos obligatorios de salida.");
        return;
    }

    const datos = {
        fecha, no_locomotora: locomotora, origen, destino,
        hora_salida: horaSalida, personal, combustible_cargado: combustibleCargado,
        responsable, combustible_ingresado: combustibleIngresado, estatus, observaciones
    };

    if (salidaEditandoId) {
        await supabaseClient.from("salidas").update(datos).eq("id", salidaEditandoId);
        alert("✅ Salida actualizada.");
    } else {
        await supabaseClient.from("salidas").insert([datos]);
        alert("✅ Salida registrada.");
    }

    salidaEditandoId = null;
    limpiarSalida();
    const formularioSalidas = obtenerElemento("formularioSalidas");
    if (formularioSalidas) formularioSalidas.style.display = "none";
    cargarSalidas();
}

async function cargarSalidas() {
    const tabla = obtenerElemento("tablaSalidasBody");
    if (!tabla) return;
    const { data } = await supabaseClient.from("salidas").select("*").order("fecha", { ascending: false });
    tabla.innerHTML = "";
    if (!data || data.length === 0) {
        tabla.innerHTML = `<tr><td colspan="12">No hay salidas registradas.</td></tr>`;
        return;
    }
    data.forEach(salida => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${escaparHTML(salida.fecha)}</td>
            <td>${escaparHTML(salida.no_locomotora)}</td>
            <td>${escaparHTML(salida.origen)}</td>
            <td>${escaparHTML(salida.destino)}</td>
            <td>${escaparHTML(salida.hora_salida)}</td>
            <td>${escaparHTML(salida.personal)}</td>
            <td>${escaparHTML(salida.combustible_cargado)}</td>
            <td>${escaparHTML(salida.responsable)}</td>
            <td>${escaparHTML(salida.combustible_ingresado)}</td>
            <td>${escaparHTML(salida.estatus)}</td>
            <td>${escaparHTML(salida.observaciones)}</td>
            <td>
                <button type="button" onclick="editarSalida(${salida.id})">✏️ Editar</button>
                <button type="button" onclick="eliminarSalida(${salida.id})">🗑️ Eliminar</button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

async function editarSalida(id) {
    if (typeof supabaseClient === "undefined") return;

    const { data, error } = await supabaseClient
        .from("salidas")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        alert("❌ No se pudo obtener la salida.");
        return;
    }

    salidaEditandoId = id;

    establecerValor("salida_fecha", data.fecha);
    establecerValor("salida_locomotora", data.no_locomotora);
    establecerValor("salida_origen", data.origen);
    establecerValor("salida_destino", data.destino);
    establecerValor("salida_hora", data.hora_salida);
    establecerValor("salida_personal", data.personal);
    establecerValor("salida_combustible_cargado", data.combustible_cargado);
    establecerValor("salida_responsable", data.responsable);
    establecerValor("salida_combustible_ingresado", data.combustible_ingresado);
    establecerValor("salida_estatus", data.estatus);
    establecerValor("salida_observaciones", data.observaciones);

    const boton = obtenerElemento("btnGuardarSalida");
    if (boton) {
        boton.textContent = "💾 ACTUALIZAR";
    }

    const formularioSalidas = obtenerElemento("formularioSalidas");
    if (formularioSalidas) {
        formularioSalidas.style.display = "block";
        formularioSalidas.scrollIntoView({ behavior: "smooth" });
    }
}

async function eliminarSalida(id) {
    if (!confirm("¿Deseas eliminar esta salida?")) return;
    await supabaseClient.from("salidas").delete().eq("id", id);
    alert("✅ Salida eliminada.");
    cargarSalidas();
}

function limpiarSalida() {
    salidaEditandoId = null;
    const camposId = [
        "salida_fecha", "salida_locomotora", "salida_origen", "salida_destino",
        "salida_hora", "salida_personal", "salida_combustible_cargado",
        "salida_responsable", "salida_combustible_ingresado", "salida_observaciones"
    ];
    camposId.forEach(id => establecerValor(id, ""));
    const boton = obtenerElemento("btnGuardarSalida");
    if (boton) boton.textContent = "💾 GUARDAR";
}


// ==========================================================
// LOCOMOTORAS (FLOTA)
// ==========================================================

function inicializarLocomotoras() {
    const btnGuardar = obtenerElemento("btnGuardarLocomotora");
    if (btnGuardar) btnGuardar.addEventListener("click", guardarLocomotora);
}

async function guardarLocomotora() {
    const locomotora = obtenerElemento("locomotoraFlota")?.value.trim() || "";
    if (!locomotora) { alert("Escribe el número de locomotora."); return; }

    const datos = { locomotora };

    if (locomotoraEditandoId) {
        await supabaseClient.from("Locomotoras").update(datos).eq("id", locomotoraEditandoId);
        alert("✅ Locomotora actualizada.");
    } else {
        await supabaseClient.from("Locomotoras").insert([datos]);
        alert("✅ Locomotora registrada.");
    }

    locomotoraEditandoId = null;
    limpiarLocomotora();
    cargarLocomotoras();
    cargarLocomotorasTabla();
}

async function cargarLocomotoras() {
    const { data } = await supabaseClient.from("Locomotoras").select("id, locomotora");
    const select = obtenerElemento("locomotoraServicioPatio");
    const selectSalida = obtenerElemento("salida_locomotora");
    
    if (data) {
        const opcionesHtml = '<option value="">Selecciona locomotora...</option>' + 
            data.map(loc => `<option value="${loc.locomotora}">${loc.locomotora}</option>`).join("");
        
        if (select) select.innerHTML = opcionesHtml;
        if (selectSalida) selectSalida.innerHTML = opcionesHtml;
    }
}

async function cargarLocomotorasTabla() {
    const tabla = obtenerElemento("tablaLocomotoras");
    if (!tabla) return;
    const { data } = await supabaseClient.from("Locomotoras").select("*");
    tabla.innerHTML = "";
    if (!data || data.length === 0) {
        tabla.innerHTML = `<tr><td colspan="8">No hay locomotoras registradas.</td></tr>`;
        return;
    }
    data.forEach(loc => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${escaparHTML(loc.locomotora)}</td>
            <td>${escaparHTML(loc.numero_serie || "")}</td>
            <td>${escaparHTML(loc.modelo || "")}</td>
            <td>${escaparHTML(loc.estado_operativo)}</td>
            <td>${escaparHTML(loc.condicion)}</td>
            <td>${loc.rtms ? "Sí" : "No"}</td>
            <td>${escaparHTML(loc.patio || "")}</td>
            <td>
                <button type="button" onclick="editarLocomotora(${loc.id})">✏️ Editar</button>
                <button type="button" onclick="eliminarLocomotora(${loc.id})">🗑️ Eliminar</button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

async function editarLocomotora(id) {
    const { data, error } = await supabaseClient.from("Locomotoras").select("*").eq("id", id).single();
    if (error || !data) return;
    locomotoraEditandoId = id;
    establecerValor("locomotoraFlota", data.locomotora);
}

async function eliminarLocomotora(id) {
    if (!confirm("¿Deseas eliminar esta locomotora?")) return;
    await supabaseClient.from("Locomotoras").delete().eq("id", id);
    cargarLocomotoras();
    cargarLocomotorasTabla();
}

function limpiarLocomotora() {
    locomotoraEditandoId = null;
}


// ==========================================================
// MÓDULO DE MANTENIMIENTOS
// ==========================================================

function inicializarMantenimientos() {
    const btnGuardarMant = document.getElementById("btnGuardarMantenimiento");
    const btnLimpiarMant = document.getElementById("btnLimpiarMantenimiento");

    if (btnGuardarMant) btnGuardarMant.addEventListener("click", guardarMantenimiento);
    if (btnLimpiarMant) btnLimpiarMant.addEventListener("click", limpiarFormularioMantenimiento);
}

async function cargarLocomotorasParaMantenimiento() {
    cargarTodosLosEquiposParaMantenimiento();
}

async function guardarMantenimiento() {
    if (typeof supabaseClient === "undefined") {
        alert("❌ No se encontró la conexión con Supabase.");
        return;
    }

    const btnGuardar = document.getElementById("btnGuardarMantenimiento");
    if (btnGuardar) {
        btnGuardar.disabled = true;
        btnGuardar.textContent = "⏳ Guardando...";
    }

    try {
        const locomotora = document.getElementById("mant_equipo_general")?.value || "";
        const tipo = document.getElementById("mant_tipo")?.value || "";
        const estatus = document.getElementById("mant_estatus")?.value || "Programada";
        const fecha_inicio = document.getElementById("mant_fecha_inicio")?.value || "";
        const hora_inicio = document.getElementById("mant_hora_inicio")?.value || "";
        const fecha_termino = document.getElementById("mant_fecha_termino")?.value || "";
        const hora_termino = document.getElementById("mant_hora_termino")?.value || "";
        const responsable = document.getElementById("mant_responsable")?.value.trim() || "Sin responsable";
        const descripcion = document.getElementById("mant_descripcion")?.value.trim() || "";
        const requiere_refaccion = document.getElementById("mant_requiere_refaccion")?.value || "No";
        const refaccion_desc = document.getElementById("mant_refaccion_desc")?.value.trim() || "";
        const refaccion_costo = parseFloat(document.getElementById("mant_refaccion_costo")?.value) || 0;
        const observaciones = document.getElementById("mant_observaciones")?.value.trim() || "";

        if (!locomotora || !tipo || !estatus || !fecha_inicio || !hora_inicio || !fecha_termino || !hora_termino || !descripcion) {
            alert("⚠️ Por favor, completa todos los campos obligatorios marcados con *");
            if (btnGuardar) {
                btnGuardar.disabled = false;
                btnGuardar.textContent = mantenimientoEditandoId ? "💾 Actualizar mantenimiento" : "💾 Guardar";
            }
            return;
        }

        const datos = {
            locomotora, tipo, estatus, fecha_inicio, hora_inicio, fecha_termino,
            hora_termino, responsable, descripcion, requiere_refaccion,
            refaccion_desc, refaccion_costo, observaciones
        };

        let resultado;
        if (mantenimientoEditandoId) {
            resultado = await supabaseClient.from("MantenimientosLocomotoras").update(datos).eq("id", mantenimientoEditandoId);
        } else {
            resultado = await supabaseClient.from("MantenimientosLocomotoras").insert([datos]);
        }

        if (resultado.error) throw resultado.error;

        alert(`✅ Mantenimiento ${mantenimientoEditandoId ? 'actualizado' : 'registrado'} correctamente.`);
        limpiarFormularioMantenimiento();
        await cargarMantenimientos();
        await actualizarResumenMantenimientos();
        await renderizarCalendarioMantenimientos();
        await actualizarGraficaMantenimientos();

    } catch (error) {
        console.error("Error guardando mantenimiento:", error);
        alert("❌ Ocurrió un error al guardar: " + error.message);
    } finally {
        if (btnGuardar) {
            btnGuardar.disabled = false;
            btnGuardar.textContent = mantenimientoEditandoId ? "💾 Actualizar mantenimiento" : "💾 Guardar";
        }
    }
}

async function cargarMantenimientos() {
    const tbody = document.getElementById("tbodyMantenimientos");
    if (!tbody || typeof supabaseClient === "undefined") return;

    tbody.innerHTML = '<tr><td colspan="8">Cargando mantenimientos...</td></tr>';

    const { data, error } = await supabaseClient
        .from("MantenimientosLocomotoras")
        .select("*")
        .order("fecha_inicio", { ascending: false })
        .order("hora_inicio", { ascending: false });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="8">❌ Error al cargar los registros.</td></tr>';
        return;
    }

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">No hay mantenimientos registrados.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(mant => {
        const fInicio = mant.fecha_inicio ? mant.fecha_inicio.split('-').reverse().join('/') : '';
        const fTermino = mant.fecha_termino ? mant.fecha_termino.split('-').reverse().join('/') : '';
        
        let colorEstatus = "#64736b"; 
        if (mant.estatus === "Programada") colorEstatus = "#2563eb"; 
        if (mant.estatus === "En curso") colorEstatus = "#f59e0b"; 
        if (mant.estatus === "Finalizada") colorEstatus = "#16a34a"; 
        if (mant.estatus === "Cancelada") colorEstatus = "#dc2626"; 

        return `
            <tr data-fecha-inicio="${mant.fecha_inicio || ''}">
                <td><strong>${escaparHTML(mant.locomotora)}</strong></td>
                <td>${escaparHTML(mant.tipo)}</td>
                <td>${fInicio}<br><small>${mant.hora_inicio ? mant.hora_inicio.substring(0,5) : ''}</small></td>
                <td>${fTermino}<br><small>${mant.hora_termino ? mant.hora_termino.substring(0,5) : ''}</small></td>
                <td>${escaparHTML(mant.responsable)}</td>
                <td style="color: ${colorEstatus}; font-weight: bold;">${escaparHTML(mant.estatus)}</td>
                <td>${mant.requiere_refaccion === 'Sí' ? '✅ Sí' : '❌ No'}</td>
                <td>
                    <button class="btn-editar" onclick="editarMantenimiento(${mant.id})" style="border:none; border-radius:5px; padding:5px 8px; cursor:pointer; background:#f59e0b; color:white;">✏️</button>
                    <button class="btn-eliminar" onclick="eliminarMantenimiento(${mant.id})" style="border:none; border-radius:5px; padding:5px 8px; cursor:pointer; background:#dc2626; color:white;">🗑️</button>
                </td>
            </tr>
        `;
    }).join("");
}

async function actualizarResumenMantenimientos() {
    if (typeof supabaseClient === "undefined") return;

    const { data, error } = await supabaseClient.from("MantenimientosLocomotoras").select("estatus");
    if (error || !data) return;

    const resumen = { "Programada": 0, "En curso": 0, "Finalizada": 0, "Cancelada": 0 };
    data.forEach(mant => { if (resumen[mant.estatus] !== undefined) resumen[mant.estatus]++; });

    const elProg = document.getElementById("mant_programados");
    const elCur = document.getElementById("mant_curso");
    const elFin = document.getElementById("mant_finalizados");
    const elCanc = document.getElementById("mant_cancelados");

    if (elProg) elProg.textContent = resumen["Programada"];
    if (elCur) elCur.textContent = resumen["En curso"];
    if (elFin) elFin.textContent = resumen["Finalizada"];
    if (elCanc) elCanc.textContent = resumen["Cancelada"];
}

async function editarMantenimiento(id) {
    const { data, error } = await supabaseClient.from("MantenimientosLocomotoras").select("*").eq("id", id).single();
    if (error || !data) {
        alert("❌ No se pudo cargar el mantenimiento.");
        return;
    }

    mantenimientoEditandoId = id;
    const selectEquipo = document.getElementById("mant_equipo_general");
    if (selectEquipo) selectEquipo.value = data.locomotora || "";

    document.getElementById("mant_tipo").value = data.tipo || "";
    document.getElementById("mant_estatus").value = data.estatus || "Programada";
    document.getElementById("mant_fecha_inicio").value = data.fecha_inicio || "";
    document.getElementById("mant_hora_inicio").value = data.hora_inicio || "";
    document.getElementById("mant_fecha_termino").value = data.fecha_termino || "";
    document.getElementById("mant_hora_termino").value = data.hora_termino || "";
    document.getElementById("mant_responsable").value = data.responsable === "Sin responsable" ? "" : data.responsable;
    document.getElementById("mant_descripcion").value = data.descripcion || "";
    document.getElementById("mant_requiere_refaccion").value = data.requiere_refaccion || "No";
    document.getElementById("mant_refaccion_desc").value = data.refaccion_desc || "";
    document.getElementById("mant_refaccion_costo").value = data.refaccion_costo || "";
    document.getElementById("mant_observaciones").value = data.observaciones || "";

    const btnGuardar = document.getElementById("btnGuardarMantenimiento");
    if (btnGuardar) btnGuardar.textContent = "💾 Actualizar mantenimiento";

    const detalles = document.querySelector("#subSeccionMantenimientos details");
    if (detalles && !detalles.open) detalles.open = true;
    document.getElementById("formulario_mantenimiento").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function eliminarMantenimiento(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este registro de mantenimiento?")) return;
    const { error } = await supabaseClient.from("MantenimientosLocomotoras").delete().eq("id", id);
    if (error) {
        alert("❌ Ocurrió un error al intentar eliminar el registro.");
        return;
    }
    alert("✅ Registro eliminado correctamente.");
    await cargarMantenimientos();
    await actualizarResumenMantenimientos();
    await renderizarCalendarioMantenimientos();
    await actualizarGraficaMantenimientos();
}

function limpiarFormularioMantenimiento() {
    const camposId = ["mant_equipo_general", "mant_tipo", "mant_fecha_inicio", "mant_hora_inicio", "mant_fecha_termino", "mant_hora_termino", "mant_responsable", "mant_descripcion", "mant_refaccion_desc", "mant_refaccion_costo", "mant_observaciones"];
    camposId.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
    document.getElementById("mant_estatus").value = "Programada";
    document.getElementById("mant_requiere_refaccion").value = "No";
    mantenimientoEditandoId = null;
    const btnGuardar = document.getElementById("btnGuardarMantenimiento");
    if (btnGuardar) btnGuardar.textContent = "💾 Guardar";
}


// ==========================================================
// MÓDULO DE MANTENIMIENTOS AVANZADO (Calendario, Selectores y Gráfica)
// ==========================================================

async function cargarTodosLosEquiposParaMantenimiento() {
    if (typeof supabaseClient === "undefined") return;

    const select = document.getElementById("mant_equipo_general");
    if (!select) return;

    select.innerHTML = '<option value="">Seleccionar equipo de material rodante...</option>';

    const fuentes = [
        { tabla: "Locomotoras", etiqueta: "Locomotora" },
        { tabla: "Gondola", etiqueta: "Góndola" },
        { tabla: "Furgon", etiqueta: "Furgón" },
        { tabla: "CarroTanque", etiqueta: "Carro Tanque" },
        { tabla: "Tolva", etiqueta: "Tolva" },
        { tabla: "plataforma_intermodal", etiqueta: "Plataforma Intermodal" }
    ];

    for (let fuente of fuentes) {
        const { data, error } = await supabaseClient.from(fuente.tabla).select("*");
        if (!error && data) {
            data.forEach(item => {
                let idItem = item.locomotora || item.numero || item.id || "";
                let inicialItem = item.inicial || "TMY";
                let nombreCompleto = `${fuente.etiqueta}: ${inicialItem} ${idItem}`;

                const option = document.createElement("option");
                option.value = nombreCompleto;
                option.textContent = nombreCompleto;
                select.appendChild(option);
            });
        }
    }
}

async function renderizarCalendarioMantenimientos() {
    const contenedorCalendario = document.getElementById("contenedorCalendarioMantenimientos");
    if (!contenedorCalendario || typeof supabaseClient === "undefined") return;

    const anio = fechaCalendarioActual.getFullYear();
    const mes = fechaCalendarioActual.getMonth();

    const { data: mantenimientos, error } = await supabaseClient
        .from("MantenimientosLocomotoras")
        .select("*");

    if (error) return;

    const primerDiaMes = new Date(anio, mes, 1).getDay();
    const ultimoDiaMes = new Date(anio, mes + 1, 0).getDate();
    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <button type="button" onclick="cambiarMesCalendario(-1)" style="padding: 5px 10px; cursor: pointer;">◀ Mes Anterior</button>
            <h3 style="margin: 0; color: #123c2a;">${nombresMeses[mes]} ${anio}</h3>
            <button type="button" onclick="cambiarMesCalendario(1)" style="padding: 5px 10px; cursor: pointer;">Mes Siguiente ▶</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; font-weight: bold; margin-bottom: 5px; color: #64736b;">
            <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px;">
    `;

    for (let i = 0; i < primerDiaMes; i++) {
        html += `<div style="background: #f0f0f0; min-height: 80px; border-radius: 4px; opacity: 0.3;"></div>`;
    }

    for (let dia = 1; dia <= ultimoDiaMes; dia++) {
        let fechaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        
        let eventosDelDia = [];
        let esDiaTermino = false;
        let esRangoActivo = false;

        if (mantenimientos) {
            mantenimientos.forEach(m => {
                if (m.fecha_inicio && m.fecha_termino) {
                    if (fechaStr >= m.fecha_inicio && fechaStr <= m.fecha_termino) {
                        esRangoActivo = true;
                        if (fechaStr === m.fecha_termino) esDiaTermino = true;
                        eventosDelDia.push(m);
                    }
                }
            });
        }

        let estiloFondo = "background: #f8faf9; border: 1px solid #dfe7e4;";
        if (esDiaTermino) {
            estiloFondo = "background: #d4edda; border: 2px solid #28a745;";
        } else if (esRangoActivo) {
            estiloFondo = "background: #e2f0cb; border: 1px solid #b5d68d;";
        }

        html += `
            <div style="${estiloFondo} border-radius: 6px; padding: 5px; min-height: 80px; font-size: 11px; position: relative; overflow: hidden;">
                <strong style="display: block; font-size: 13px; color: #333;">${dia}</strong>
        `;

        eventosDelDia.forEach(ev => {
            let colorBadge = "#2563eb";
            if (ev.estatus === "En curso") colorBadge = "#f59e0b";
            if (ev.estatus === "Finalizada") colorBadge = "#16a34a";
            if (ev.estatus === "Cancelada") colorBadge = "#dc2626";

            html += `<div style="background: ${colorBadge}; color: white; border-radius: 3px; padding: 1px 3px; margin-top: 2px; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${ev.locomotora} - ${ev.tipo}">${ev.locomotora}</div>`;
        });

        html += `</div>`;
    }

    html += `</div>`;
    contenedorCalendario.innerHTML = html;
}

function cambiarMesCalendario(direccion) {
    fechaCalendarioActual.setMonth(fechaCalendarioActual.getMonth() + direccion);
    renderizarCalendarioMantenimientos();
}

function filtrarTablaMantenimientos() {
    const inputBuscador = document.getElementById("buscadorMantenimientos")?.value.toLowerCase() || "";
    const fechaFiltroInicio = document.getElementById("filtroFechaInicio")?.value || "";
    const fechaFiltroFin = document.getElementById("filtroFechaFin")?.value || "";

    const filas = document.querySelectorAll("#tbodyMantenimientos tr");

    filas.forEach(fila => {
        let textoFila = fila.textContent.toLowerCase();
        let fechaInicioFila = fila.getAttribute("data-fecha-inicio") || "";

        let coincideTexto = textoFila.includes(inputBuscador);
        let coincideFecha = true;

        if (fechaFiltroInicio && fechaInicioFila < fechaFiltroInicio) coincideFecha = false;
        if (fechaFiltroFin && fechaInicioFila > fechaFiltroFin) coincideFecha = false;

        if (coincideTexto && coincideFecha) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}

// 4. GRÁFICA INTELIGENTE Y FILTROS
function cambiarTipoPeriodoFiltro() {
    const tipo = document.getElementById("filtroTipoPeriodo")?.value;
    const divMes = document.getElementById("contenedorFiltroMes");
    const divAnio = document.getElementById("contenedorFiltroAnio");

    if (tipo === "mensual") {
        if (divMes) divMes.style.display = "block";
        if (divAnio) divAnio.style.display = "none";
    } else {
        if (divMes) divMes.style.display = "none";
        if (divAnio) divAnio.style.display = "block";
    }
    actualizarGraficaMantenimientos();
}

async function inicializarFiltrosGrafica() {
    const selectEquipo = document.getElementById("filtroEquipoGrafica");
    if (!selectEquipo || typeof supabaseClient === "undefined") return;

    const inputMes = document.getElementById("filtroMesAnio");
    if (inputMes && !inputMes.value) {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        inputMes.value = `${anio}-${mes}`;
    }

    const inputAnio = document.getElementById("filtroAnioUnico");
    if (inputAnio && !inputAnio.value) {
        inputAnio.value = new Date().getFullYear();
    }

    selectEquipo.innerHTML = '<option value="todos">Todos (General)</option>';
    
    const fuentes = [
        { tabla: "Locomotoras", etiqueta: "Locomotora" },
        { tabla: "Gondola", etiqueta: "Góndola" },
        { tabla: "Furgon", etiqueta: "Furgón" },
        { tabla: "CarroTanque", etiqueta: "Carro Tanque" },
        { tabla: "Tolva", etiqueta: "Tolva" },
        { tabla: "plataforma_intermodal", etiqueta: "Plataforma Intermodal" }
    ];

    for (let fuente of fuentes) {
        const { data } = await supabaseClient.from(fuente.tabla).select("*");
        if (data) {
            data.forEach(item => {
                let idItem = item.locomotora || item.numero || item.id || "";
                let inicialItem = item.inicial || "TMY";
                let nombreCompleto = `${fuente.etiqueta}: ${inicialItem} ${idItem}`;
                
                const opt = document.createElement("option");
                opt.value = nombreCompleto;
                opt.textContent = nombreCompleto;
                selectEquipo.appendChild(opt);
            });
        }
    }

    actualizarGraficaMantenimientos();
}

async function actualizarGraficaMantenimientos() {
    if (typeof supabaseClient === "undefined") return;

    const { data: mantenimientos, error } = await supabaseClient
        .from("MantenimientosLocomotoras")
        .select("*");

    if (error || !mantenimientos) return;

    const tipoPeriodo = document.getElementById("filtroTipoPeriodo")?.value || "mensual";
    const valorEquipo = document.getElementById("filtroEquipoGrafica")?.value || "todos";
    let mesAnioFiltro = document.getElementById("filtroMesAnio")?.value || "";
    let anioFiltro = document.getElementById("filtroAnioUnico")?.value || "";

    const datosFiltrados = mantenimientos.filter(m => {
        if (!m.fecha_inicio) return false;

        if (valorEquipo !== "todos" && m.locomotora !== valorEquipo) {
            return false;
        }

        if (tipoPeriodo === "mensual" && mesAnioFiltro) {
            if (!m.fecha_inicio.startsWith(mesAnioFiltro)) return false;
        } else if (tipoPeriodo === "anual" && anioFiltro) {
            if (!m.fecha_inicio.startsWith(anioFiltro)) return false;
        }

        return true;
    });

    let conteoTipos = { "Preventivo": 0, "Predictivo": 0, "Correctivo": 0 };
    datosFiltrados.forEach(m => {
        let tipo = m.tipo || "Preventivo";
        if (conteoTipos[tipo] !== undefined) {
            conteoTipos[tipo]++;
        } else {
            conteoTipos[tipo] = 1;
        }
    });

    const ctx = document.getElementById("graficaTiposMantenimiento")?.getContext("2d");
    if (!ctx) return;

    const labels = Object.keys(conteoTipos);
    const valores = Object.values(conteoTipos);

    if (miGraficaMantenimiento) {
        miGraficaMantenimiento.data.labels = labels;
        miGraficaMantenimiento.data.datasets[0].data = valores;
        miGraficaMantenimiento.update();
    } else {
        miGraficaMantenimiento = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cantidad de Mantenimientos',
                    data: valores,
                    backgroundColor: ['#167D5A', '#2563eb', '#f59e0b'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
}


// ==========================================================
// FUNCIONES GLOBALES
// ==========================================================

window.editarServicioPatio = editarServicioPatio;
window.eliminarServicioPatio = eliminarServicioPatio;
window.editarSalida = editarSalida;
window.eliminarSalida = eliminarSalida;
window.editarLocomotora = editarLocomotora;
window.eliminarLocomotora = eliminarLocomotora;
window.editarMantenimiento = editarMantenimiento;
window.eliminarMantenimiento = eliminarMantenimiento;
window.cambiarSubPestanaRodante = cambiarSubPestanaRodante;
window.cambiarMesCalendario = cambiarMesCalendario;
window.filtrarTablaMantenimientos = filtrarTablaMantenimientos;
window.cambiarTipoPeriodoFiltro = cambiarTipoPeriodoFiltro;
window.actualizarGraficaMantenimientos = actualizarGraficaMantenimientos;
window.guardarMantenimiento = guardarMantenimiento;
window.limpiarFormularioMantenimiento = limpiarFormularioMantenimiento;
window.guardarServicioPatio = guardarServicioPatio;
window.limpiarServicioPatio = limpiarServicioPatio;
window.guardarSalida = guardarSalida;
window.limpiarSalida = limpiarSalida;
console.log("✅ operaciones-extra.js cargado correctamente.");
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