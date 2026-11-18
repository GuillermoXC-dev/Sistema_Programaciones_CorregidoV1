
// ==========================================
// INICIO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    mostrarFechaActual();
    establecerFechaActual();
    cargarProgramaciones();
    cargarCostos();

    document
        .getElementById("programacion_id")
        .addEventListener("change", cargarDatosProgramacion);

    document
        .getElementById("btnGuardarCosto")
        .addEventListener("click", guardarCosto);

    document
        .getElementById("btnLimpiarCosto")
        .addEventListener("click", limpiarFormulario);

});


// ==========================================
// MOSTRAR FECHA ACTUAL
// ==========================================

function mostrarFechaActual() {

    const ahora = new Date();

    console.log(
        "Sistema de Costos cargado:",
        ahora.toLocaleDateString("es-MX")
    );

}


// ==========================================
// ESTABLECER FECHA ACTUAL
// ==========================================

function establecerFechaActual() {

    const campoFecha = document.getElementById("fecha");

    if (!campoFecha) return;

    const ahora = new Date();

    const anio = ahora.getFullYear();

    const mes = String(
        ahora.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        ahora.getDate()
    ).padStart(2, "0");

    campoFecha.value = `${anio}-${mes}-${dia}`;

}


// ==========================================
// CARGAR PROGRAMACIONES
// ==========================================

async function cargarProgramaciones() {
    const select = document.getElementById("programacion_id");
    if (!select) return;

    const { data, error } = await supabaseClient
        .from("Programaciones")
        .select(`
            id,
            fecha,
            tren,
            no_locomotora,
            origen,
            destino,
            hora_salida
        `)
        .order("fecha", { ascending: false });

    if (error) {

        console.error( "Error al cargar programaciones:", error );
        mostrarMensaje( "❌ No se pudieron cargar las programaciones.", "error" );
        return;
    }

    select.innerHTML = '<option value="">Selecciona una programación</option>';

    if (!data || data.length === 0) {
    const opcion = document.createElement("option");
    opcion.value = "";
    opcion.textContent = "No hay programaciones disponibles";
    opcion.disabled = true;
    select.appendChild(opcion);
    return;
    }
data.forEach(programacion => {
    const option = document.createElement("option");
    option.value = programacion.id;
    const trenInfo = programacion.no_locomotora || programacion.tren || "N/D";
    option.textContent = `${programacion.fecha} | Tren ${trenInfo} | ${programacion.origen || ''} → ${programacion.destino || ''} | ${formatearHora(programacion.hora_salida)}`;
    select.appendChild(option);
    });
    }

// ==========================================
// CARGAR DATOS DE PROGRAMACIÓN
// ==========================================

async function cargarDatosProgramacion() {

    const id =
        document.getElementById("programacion_id").value;


    if (!id) {

        document.getElementById("fecha").value = "";

        return;
    }


    const { data, error } = await supabaseClient
        .from("Programaciones")
        .select("fecha,tren,no_locomotora")
        .eq("id", id)
        .single();

    if (error) {

        console.error(
            "Error al obtener programación:",
            error
        );

        return;
    }


    document.getElementById("fecha").value =
        data.fecha || "";

}


// ==========================================
// GUARDAR / ACTUALIZAR COSTO
// ==========================================

async function guardarCosto() {

    const programacion_id =
        document.getElementById("programacion_id").value;

    const fecha =
        document.getElementById("fecha").value;

    const minutos_demora =
        parseInt(
            document.getElementById("minutos_demora").value,
            10
        );

    const costo_por_minuto =
        parseFloat(
            document.getElementById("costo_por_minuto").value
        );

    const motivo =
        document.getElementById("motivo").value.trim();

    const observaciones =
        document.getElementById("observaciones").value.trim();


    // ======================================
    // VALIDACIONES
    // ======================================

    if (!programacion_id) {

        mostrarMensaje(
            "Selecciona una programación.",
            "error"
        );

        return;
    }


    if (!fecha) {

        mostrarMensaje(
            "Selecciona la fecha.",
            "error"
        );

        return;
    }


    if (
        isNaN(minutos_demora) ||
        minutos_demora <= 0
    ) {

        mostrarMensaje(
            "Ingresa los minutos de demora.",
            "error"
        );

        return;
    }


    if (
        isNaN(costo_por_minuto) ||
        costo_por_minuto < 0
    ) {

        mostrarMensaje(
            "Ingresa un costo por minuto válido.",
            "error"
        );

        return;
    }


    if (!motivo) {

        mostrarMensaje(
            "Escribe el motivo de la demora.",
            "error"
        );

        return;
    }


    // ======================================
    // DATOS
    // ======================================

   const datos = {

    programacion_id,

    fecha,

    minutos_demora,

    costo_por_minuto,

    motivo,

    observaciones:
        observaciones || null

};


    const boton =
        document.getElementById("btnGuardarCosto");

    const idEditando =
        boton.dataset.editando;


    let error = null;


    // ======================================
    // ACTUALIZAR
    // ======================================

    if (idEditando) {

        const resultado =
            await supabaseClient
                .from("CostosDemora")
                .update(datos)
                .eq("id", idEditando);

        error = resultado.error;

    }

    // ======================================
    // INSERTAR
    // ======================================

    else {

        const resultado =
            await supabaseClient
                .from("CostosDemora")
                .insert([datos]);

        error = resultado.error;

    }


    // ======================================
    // ERROR
    // ======================================

    if (error) {

        console.error(
            "Error al guardar costo:",
            error
        );

        mostrarMensaje(
            "❌ Error: " + error.message,
            "error"
        );

        return;
    }


    // ======================================
    // ÉXITO
    // ======================================

    if (idEditando) {

        mostrarMensaje(
            "✅ Costo por demora actualizado correctamente.",
            "exito"
        );

    } else {

        mostrarMensaje(
            "✅ Costo por demora guardado correctamente.",
            "exito"
        );

    }


    limpiarFormulario();

    boton.textContent = "💾 GUARDAR";

    delete boton.dataset.editando;

    cargarCostos();

}


// ==========================================
// CARGAR COSTOS
// ==========================================

async function cargarCostos() {

    const tabla =
    document.getElementById("cuerpoTablaCostos");

    if (!tabla) return;


    tabla.innerHTML = "";


    const { data, error } =
        await supabaseClient
            .from("CostosDemora")
            .select(`
                id,
                fecha,
                minutos_demora,
                costo_por_minuto,
                costo_total,
                motivo,
                observaciones,
                programacion_id,
                Programaciones (
                    tren,
                    no_locomotora
                )
            `)
            .order("fecha", {
                ascending: false
            });


    if (error) {

        console.error(
            "Error al cargar costos:",
            error
        );

        document.getElementById(
            "mensajeTabla"
        ).textContent =
            "❌ No se pudieron cargar los costos.";

        return;
    }


    if (!data || data.length === 0) {

        document.getElementById(
            "mensajeTabla"
        ).textContent =
            "No hay registros de costos por demora.";

        return;
    }


    document.getElementById(
        "mensajeTabla"
    ).textContent = "";


    data.forEach(registro => {

        const fila =
            document.createElement("tr");


        const tren =
            registro.Programaciones?.no_locomotora
            || registro.Programaciones?.tren
            || "";

        fila.innerHTML = `

            <td>
                ${registro.fecha || ""}
            </td>

            <td>
                🚆 ${tren}
            </td>

            <td>
                ${registro.minutos_demora || 0} min
            </td>

            <td>
                ${formatearMoneda(
                    registro.costo_por_minuto
                )}
            </td>

            <td>
                ${formatearMoneda(
                    registro.costo_total
                )}
            </td>

            <td>
                ${registro.motivo || ""}
            </td>
            <td>
                ${registro.observaciones || ""}
            </td>

            <td>

                <button
                    class="btn-editar"
                    onclick="editarCosto(${registro.id})"
                >
                    ✏️
                </button>

                <button
                    class="btn-eliminar"
                    onclick="eliminarCosto(${registro.id})"
                >
                    🗑️
                </button>

            </td>

        `;


        tabla.appendChild(fila);

    });

}


// ==========================================
// EDITAR COSTO
// ==========================================

async function editarCosto(id) {

    const { data, error } =
        await supabaseClient
            .from("CostosDemora")
            .select(`
                id,
                programacion_id,
                fecha,
                minutos_demora,
                costo_por_minuto,
                motivo,
                observaciones
            `)
            .eq("id", id)
            .single();


    if (error) {

        console.error(
            "Error al obtener costo:",
            error
        );

        mostrarMensaje(
            "❌ No se pudo cargar el registro.",
            "error"
        );

        return;
    }


    document.getElementById(
        "programacion_id"
    ).value = data.programacion_id;


    document.getElementById(
        "fecha"
    ).value = data.fecha;


    document.getElementById(
        "minutos_demora"
    ).value = data.minutos_demora;


    document.getElementById(
        "costo_por_minuto"
    ).value = data.costo_por_minuto;


    document.getElementById(
        "motivo"
    ).value = data.motivo || "";


    document.getElementById(
        "observaciones"
    ).value = data.observaciones || "";


    const boton =
        document.getElementById(
            "btnGuardarCosto"
        );


    boton.textContent =
        "💾 ACTUALIZAR";


    boton.dataset.editando = id;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// ELIMINAR COSTO
// ==========================================

async function eliminarCosto(id) {

    const confirmar =
        confirm(
            "¿Estás seguro de que deseas eliminar este costo por demora?"
        );


    if (!confirmar) return;


    const { error } =
        await supabaseClient
            .from("CostosDemora")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(
            "Error al eliminar costo:",
            error
        );

        mostrarMensaje(
            "❌ Error: " + error.message,
            "error"
        );

        return;
    }


    mostrarMensaje(
        "✅ Costo por demora eliminado correctamente.",
        "exito"
    );


    cargarCostos();

}


// ==========================================
// LIMPIAR FORMULARIO
// ==========================================

function limpiarFormulario() {

    document.getElementById(
        "programacion_id"
    ).value = "";


    establecerFechaActual();


    document.getElementById(
        "minutos_demora"
    ).value = "";


    document.getElementById(
        "costo_por_minuto"
    ).value = "";


    document.getElementById(
        "motivo"
    ).value = "";


    document.getElementById(
        "observaciones"
    ).value = "";


    const boton =
        document.getElementById(
            "btnGuardarCosto"
        );


    boton.textContent =
        "💾 GUARDAR";


    delete boton.dataset.editando;

}


// ==========================================
// MENSAJES
// ==========================================

function mostrarMensaje(texto, tipo) {

    const mensaje =
        document.getElementById(
            "mensajeCosto"
        );


    if (!mensaje) return;


    mensaje.textContent = texto;

    mensaje.className =
        "mensaje " + tipo;


    setTimeout(() => {

        mensaje.textContent = "";

        mensaje.className =
            "mensaje";

    }, 4000);

}


// ==========================================
// FORMATEAR HORA
// ==========================================

function formatearHora(hora) {

    if (!hora) return "";

    return hora.substring(0, 5);

}


// ==========================================
// FORMATEAR MONEDA
// ==========================================

function formatearMoneda(valor) {

    return new Intl.NumberFormat(
        "es-MX",
        {
            style: "currency",
            currency: "MXN"
        }
    ).format(
        Number(valor) || 0
    );

}
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