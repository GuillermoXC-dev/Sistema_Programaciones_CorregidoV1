/* ============================================================
   SALIDAS.JS
   Sistema de Operaciones - Tren Maya
   Módulo: Salidas
   ============================================================ */
const TABLA_SALIDAS = "salidas";

console.log("🚂 salidas.js cargado correctamente");

let idSalidaEditando = null;

/* ============================================================
   INICIALIZACIÓN
============================================================ */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
        console.log("🚂 Inicializando módulo Salidas...");
        configurarSalidas();
    });
} else {
    console.log("🚂 Inicializando módulo Salidas (DOM ya listo)...");
    configurarSalidas();
}

/* ============================================================
   CONFIGURAR EVENTOS
============================================================ */

function configurarSalidas() {
    const btnNueva = document.getElementById("btnNuevaSalida");
    const btnGuardar = document.getElementById("btnGuardarSalida");
    const btnLimpiar = document.getElementById("btnLimpiarSalida");
    const btnCancelar = document.getElementById("btnCancelarSalida");

    /* ========================================================
       VERIFICAR SUPABASE
    ======================================================== */
    if (typeof supabaseClient === "undefined") {
        console.error("❌ supabaseClient no está disponible.");
        mostrarMensajeSalidas("❌ No está disponible la conexión con Supabase.");
        return;
    }

    /* ========================================================
       NUEVA SALIDA
    ======================================================== */
    if (btnNueva) {
        btnNueva.addEventListener("click", function () {
            idSalidaEditando = null;
            limpiarFormularioSalida();

            const formulario = document.getElementById("formularioSalidas");
            if (formulario) {
                formulario.style.display = "block";
                formulario.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    }

    /* ========================================================
       GUARDAR / ACTUALIZAR
    ======================================================== */
    if (btnGuardar) {
        btnGuardar.addEventListener("click", guardarSalida);
    }

    /* ========================================================
       LIMPIAR
    ======================================================== */
    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", function () {
            idSalidaEditando = null;
            limpiarFormularioSalida();
        });
    }

    /* ========================================================
       CANCELAR
    ======================================================== */
    if (btnCancelar) {
        btnCancelar.addEventListener("click", function () {
            idSalidaEditando = null;
            limpiarFormularioSalida();

            const formulario = document.getElementById("formularioSalidas");
            if (formulario) {
                formulario.style.display = "none";
            }
        });
    }

    /* ========================================================
       CARGAR REGISTROS
    ======================================================== */
    cargarSalidas();
}

/* ============================================================
   GUARDAR / ACTUALIZAR SALIDA
============================================================ */

async function guardarSalida() {
    try {
        /* ----------------------------------------------------
           OBTENER DATOS
        ---------------------------------------------------- */
        const fecha = obtenerValor("salida_fecha");
        const locomotora = obtenerValor("salida_locomotora");
        const origen = obtenerValor("salida_origen");
        const destino = obtenerValor("salida_destino");
        const hora = obtenerValor("salida_hora");
        const personal = obtenerValor("salida_personal");
        const combustibleCargado = obtenerNumero("salida_combustible_cargado");
        const responsable = obtenerValor("salida_responsable");
        const combustibleIngresado = obtenerNumero("salida_combustible_ingresado");
        const estatus = obtenerValor("salida_estatus");
        const observaciones = obtenerValor("salida_observaciones");

        /* ----------------------------------------------------
           VALIDACIONES
        ---------------------------------------------------- */
        if (!fecha) {
            alert("⚠️ Selecciona la fecha.");
            return;
        }

        if (!locomotora) {
            alert("⚠️ Ingresa el número de locomotora.");
            return;
        }

        if (!origen) {
            alert("⚠️ Selecciona el origen.");
            return;
        }

        if (!destino) {
            alert("⚠️ Selecciona el destino.");
            return;
        }

        if (origen === destino) {
            alert("⚠️ El origen y el destino no pueden ser iguales.");
            return;
        }

        if (!hora) {
            alert("⚠️ Ingresa la hora de salida.");
            return;
        }

        if (!personal) {
            alert("⚠️ Selecciona el personal.");
            return;
        }

        if (!responsable) {
            alert("⚠️ Ingresa el responsable.");
            return;
        }

        if (!estatus) {
            alert("⚠️ Selecciona el estatus.");
            return;
        }

        /* ----------------------------------------------------
           DATOS PARA SUPABASE
        ---------------------------------------------------- */
        const datos = {
            fecha: fecha,
            no_locomotora: locomotora,
            origen: origen,
            destino: destino,
            hora_salida: hora,
            personal: personal,
            combustible_cargado: combustibleCargado,
            responsable: responsable,
            combustible_ingresado: combustibleIngresado,
            estatus: estatus,
            observaciones: observaciones || null
        };

        console.log("📤 Datos de salida:", datos);

        /* ====================================================
           ACTUALIZAR
        ==================================================== */
        if (idSalidaEditando !== null) {
            const resultado = await supabaseClient
                .from(TABLA_SALIDAS)
                .update(datos)
                .eq("id", idSalidaEditando);

            if (resultado.error) {
                console.error("❌ Error actualizando salida:", resultado.error);
                alert("❌ No se pudo actualizar la salida.\n\n" + resultado.error.message);
                return;
            }

            alert("✅ Salida actualizada correctamente.");
        } 
        /* ====================================================
           INSERTAR NUEVA
        ==================================================== */
        else {
            const resultado = await supabaseClient
                .from(TABLA_SALIDAS)
                .insert([datos]);

            if (resultado.error) {
                console.error("❌ Error guardando salida:", resultado.error);
                alert("❌ No se pudo guardar la salida.\n\n" + resultado.error.message);
                return;
            }

            alert("✅ Salida guardada correctamente.");
        }

        /* ====================================================
           LIMPIAR Y RECARGAR
        ==================================================== */
        idSalidaEditando = null;
        limpiarFormularioSalida();

        const formulario = document.getElementById("formularioSalidas");
        if (formulario) {
            formulario.style.display = "none";
        }

        await cargarSalidas();

    } catch (error) {
        console.error("❌ Error inesperado guardando salida:", error);
        alert("❌ Ocurrió un error al guardar la salida.");
    }
}

/* ============================================================
   CARGAR SALIDAS
============================================================ */

async function cargarSalidas() {
    const tbody = document.getElementById("tablaSalidasBody");

    if (!tbody) {
        console.warn("⚠️ No existe tablaSalidasBody.");
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="12">Cargando salidas...</td>
        </tr>
    `;

    try {
        if (typeof supabaseClient === "undefined") {
            throw new Error("supabaseClient no está disponible.");
        }

        const resultado = await supabaseClient
            .from(TABLA_SALIDAS)
            .select("*")
            .order("fecha", { ascending: false })
            .order("hora_salida", { ascending: false });

        if (resultado.error) {
            console.error("❌ Error cargando salidas:", resultado.error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="12">
                        ❌ Error al cargar las salidas.<br>
                        <small>${escaparHTML(resultado.error.message)}</small>
                    </td>
                </tr>
            `;
            return;
        }

        const salidas = resultado.data || [];

        if (salidas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12">No hay salidas registradas.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = "";

        salidas.forEach(function (salida) {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${formatearFecha(salida.fecha)}</td>
                <td>${escaparHTML(salida.no_locomotora)}</td>
                <td>${escaparHTML(salida.origen)}</td>
                <td>${escaparHTML(salida.destino)}</td>
                <td>${formatearHora(salida.hora_salida)}</td>
                <td>${escaparHTML(salida.personal)}</td>
                <td>${salida.combustible_cargado ?? ""}</td>
                <td>${escaparHTML(salida.responsable)}</td>
                <td>${salida.combustible_ingresado ?? ""}</td>
                <td>
                    <span class="estado-salida estado-${normalizarClase(salida.estatus)}">
                        ${escaparHTML(salida.estatus)}
                    </span>
                </td>
                <td>${escaparHTML(salida.observaciones)}</td>
                <td>
                    <div class="salidas-acciones-tabla">
                        <button type="button" onclick="verSalida('${salida.id}')">👁️ Ver</button>
                        <button type="button" onclick="editarSalida('${salida.id}')">✏️ Editar</button>
                        <button type="button" onclick="eliminarSalida('${salida.id}')">🗑️ Eliminar</button>
                    </div>
                </td>
            `;

            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error("❌ Error inesperado cargando salidas:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="12">
                    ❌ No se pudieron cargar las salidas.<br>
                    <small>${escaparHTML(error.message)}</small>
                </td>
            </tr>
        `;
    }
}

/* ============================================================
   EDITAR SALIDA
============================================================ */

async function editarSalida(id) {
    if (typeof supabaseClient === "undefined") return;

    try {
        const { data, error } = await supabaseClient
            .from(TABLA_SALIDAS)
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            alert("❌ No se pudo obtener la salida.");
            return;
        }

        /* ----------------------------------------------------
           CARGAR DATOS AL FORMULARIO
        ---------------------------------------------------- */
        const setVal = (elemId, val) => {
            const el = document.getElementById(elemId);
            if (el) el.value = val !== null && val !== undefined ? val : "";
        };

        setVal("salida_fecha", data.fecha);
        setVal("salida_locomotora", data.no_locomotora);
        setVal("salida_origen", data.origen);
        setVal("salida_destino", data.destino);
        setVal("salida_hora", formatearHora(data.hora_salida));
        setVal("salida_personal", data.personal);
        setVal("salida_combustible_cargado", data.combustible_cargado);
        setVal("salida_responsable", data.responsable);
        setVal("salida_combustible_ingresado", data.combustible_ingresado);
        setVal("salida_estatus", data.estatus || "Finalizado");
        setVal("salida_observaciones", data.observaciones);

        /* ----------------------------------------------------
           GUARDAR ID Y PREPARAR VISTA
        ---------------------------------------------------- */
        idSalidaEditando = id;

        const btnGuardar = document.getElementById("btnGuardarSalida");
        if (btnGuardar) {
            btnGuardar.textContent = "💾 ACTUALIZAR";
        }

        const formulario = document.getElementById("formularioSalidas");
        if (formulario) {
            formulario.style.display = "block";
            formulario.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    } catch (error) {
        console.error("❌ Error editando salida:", error);
        alert("❌ Ocurrió un error al editar la salida.");
    }
}

/* ============================================================
   ELIMINAR SALIDA
============================================================ */

async function eliminarSalida(id) {
    const confirmar = confirm("¿Estás seguro de eliminar esta salida?");
    if (!confirmar) return;

    try {
        const resultado = await supabaseClient
            .from(TABLA_SALIDAS)
            .delete()
            .eq("id", id);

        if (resultado.error) {
            console.error("❌ Error eliminando salida:", resultado.error);
            alert("❌ No se pudo eliminar la salida.\n\n" + resultado.error.message);
            return;
        }

        alert("✅ Salida eliminada correctamente.");
        await cargarSalidas();

    } catch (error) {
        console.error("❌ Error inesperado eliminando salida:", error);
        alert("❌ Error al eliminar la salida.");
    }
}

/* ============================================================
   VER SALIDA
============================================================ */

async function verSalida(id) {
    try {
        const resultado = await supabaseClient
            .from(TABLA_SALIDAS)
            .select("*")
            .eq("id", id)
            .single();

        if (resultado.error) {
            console.error("❌ Error consultando salida:", resultado.error);
            alert("❌ No se pudo consultar la salida.");
            return;
        }

        const s = resultado.data;

        const mensaje = `🚂 DETALLE DE SALIDA

Fecha: ${formatearFecha(s.fecha)}
No. de locomotora: ${s.no_locomotora || "-"}
Origen: ${s.origen || "-"}
Destino: ${s.destino || "-"}
Hora de salida: ${formatearHora(s.hora_salida) || "-"}
Personal: ${s.personal || "-"}
Combustible cargado: ${s.combustible_cargado ?? "-"} L
Responsable: ${s.responsable || "-"}
Combustible ingresado: ${s.combustible_ingresado ?? "-"} L
Estatus: ${s.estatus || "-"}
Observaciones: ${s.observaciones || "-"}`;

        alert(mensaje);

    } catch (error) {
        console.error("❌ Error mostrando salida:", error);
    }
}

/* ============================================================
   LIMPIAR FORMULARIO
============================================================ */

function limpiarFormularioSalida() {
    const campos = [
        "salida_fecha",
        "salida_locomotora",
        "salida_origen",
        "salida_destino",
        "salida_hora",
        "salida_personal",
        "salida_combustible_cargado",
        "salida_responsable",
        "salida_combustible_ingresado",
        "salida_estatus",
        "salida_observaciones"
    ];

    campos.forEach(function (id) {
        const elemento = document.getElementById(id);
        if (!elemento) return;

        if (elemento.tagName === "SELECT") {
            elemento.selectedIndex = 0;
        } else {
            elemento.value = "";
        }
    });

    const btnGuardar = document.getElementById("btnGuardarSalida");
    if (btnGuardar) {
        btnGuardar.textContent = "💾 GUARDAR";
    }
}

/* ============================================================
   MENSAJE
============================================================ */

function mostrarMensajeSalidas(mensaje) {
    const elemento = document.getElementById("mensajeSalidas");
    if (elemento) {
        elemento.textContent = mensaje;
    }
}

/* ============================================================
   OBTENER VALOR
============================================================ */

function obtenerValor(id) {
    const elemento = document.getElementById(id);
    if (!elemento) return "";
    return String(elemento.value || "").trim();
}

/* ============================================================
   OBTENER NÚMERO
============================================================ */

function obtenerNumero(id) {
    const elemento = document.getElementById(id);
    if (!elemento || elemento.value === "" || elemento.value === null) return null;

    const numero = Number(elemento.value);
    return Number.isNaN(numero) ? null : numero;
}

/* ============================================================
   FORMATEAR FECHA
============================================================ */

function formatearFecha(fecha) {
    if (!fecha) return "";
    const partes = String(fecha).split("-");
    if (partes.length === 3) {
        return partes[2] + "/" + partes[1] + "/" + partes[0];
    }
    return fecha;
}

/* ============================================================
   FORMATEAR HORA
============================================================ */

function formatearHora(hora) {
    if (!hora) return "";
    return String(hora).substring(0, 5);
}

/* ============================================================
   ESCAPAR HTML
============================================================ */

function escaparHTML(valor) {
    if (valor === null || valor === undefined) return "";
    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ============================================================
   NORMALIZAR CLASE
============================================================ */

function normalizarClase(valor) {
    return String(valor || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

/* ============================================================
   EXPORTAR FUNCIONES
============================================================ */

window.cargarSalidas = cargarSalidas;
window.guardarSalida = guardarSalida;
window.editarSalida = editarSalida;
window.eliminarSalida = eliminarSalida;
window.verSalida = verSalida;
window.limpiarFormularioSalida = limpiarFormularioSalida;
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