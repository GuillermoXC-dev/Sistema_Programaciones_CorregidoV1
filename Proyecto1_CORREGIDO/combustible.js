
// ========================================
// INICIO
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    mostrarFechaActual();

    establecerFechaActual();

    cargarProgramaciones();

    cargarCombustible();

    document
        .getElementById("programacion_id")
        .addEventListener("change", cargarDatosProgramacion);

    document
        .getElementById("btnGuardarCombustible")
        .addEventListener("click", guardarCombustible);

    document
        .getElementById("btnLimpiarCombustible")
        .addEventListener("click", limpiarFormulario);

    const btnActualizar =
        document.getElementById("btnActualizarCombustible");

    if (btnActualizar) {
        btnActualizar.addEventListener(
            "click",
            cargarCombustible
        );
    }

});


// ========================================
// FECHA ACTUAL
// ========================================

function mostrarFechaActual() {

    const elemento =
        document.getElementById("fechaActual");

    if (!elemento) return;

    const ahora = new Date();

    elemento.textContent =
        ahora.toLocaleDateString(
            "es-MX",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
}


// ========================================
// ESTABLECER FECHA
// ========================================

function establecerFechaActual() {

    const elemento =
        document.getElementById("fecha");

    if (!elemento) return;

    const fecha = new Date();

    const año =
        fecha.getFullYear();

    const mes =
        String(fecha.getMonth() + 1).padStart(2, "0");

    const dia =
        String(fecha.getDate()).padStart(2, "0");

    elemento.value =
        `${año}-${mes}-${dia}`;
}


// ========================================
// CARGAR PROGRAMACIONES
// ========================================
async function cargarProgramaciones() {
    const select = document.getElementById("programacion_id");
    if (!select) return;

    const { data, error } = await supabaseClient
            .from("Programaciones")
            .select( "id, fecha, tren, no_locomotora, origen, destino, hora_salida")
            .order("fecha", { ascending: false });

    if (error) {

        console.error("Error cargando programaciones:",error);
        mostrarMensaje("❌ No se pudieron cargar las programaciones.","error");
        return;
    }

    select.innerHTML = '<option value="">Selecciona una programación</option>';

    if (!data || data.length === 0) {
        const opcionVacia = document.createElement("option");
        opcionVacia.value = "";
        opcionVacia.textContent = "No hay programaciones disponibles";
        select.appendChild(opcionVacia);
        return;
    }

    data.forEach(programacion => {
        const option = document.createElement("option");
        option.value = programacion.id;
        const trenInfo = programacion.no_locomotora || programacion.tren || "Sin locomotora";
        option.textContent = `${programacion.fecha} | Tren ${trenInfo} | ${programacion.origen || ''} → ${programacion.destino || ''} | ${formatearHora(programacion.hora_salida)}`;
        select.appendChild(option);
    });
}

// ========================================
// CUANDO SE SELECCIONA UNA PROGRAMACIÓN
// ========================================

async function cargarDatosProgramacion() {
    const id = document.getElementById("programacion_id").value;
    if (!id) {
        document.getElementById("tren").value = "";
        return;
    }

    const { data, error } = await supabaseClient
            .from("Programaciones")
            .select("fecha, tren, no_locomotora")
            .eq("id", id)
            .single();

    if (error) {
        console.error("Error cargando programación:",error);
        return;
    }

    document.getElementById("fecha").value = data.fecha || "";
    document.getElementById("tren").value = data.no_locomotora|| data.tren|| "";
}

// ========================================
// GUARDAR / ACTUALIZAR COMBUSTIBLE
// ========================================

async function guardarCombustible() {

    const programacion_id =
        document.getElementById("programacion_id").value;

    const fecha =
        document.getElementById("fecha").value;

    const tren =
        document.getElementById("tren").value.trim();

    const litros =
        parseFloat(
            document.getElementById("litros").value
        );

    const precio_litro =
        parseFloat(
            document.getElementById("precio_litro").value
        );

    const observaciones =
        document
            .getElementById("observaciones")
            .value
            .trim();


    // ========================================
    // VALIDACIONES
    // ========================================

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


    if (!tren) {

        mostrarMensaje(
            "El tren es obligatorio.",
            "error"
        );

        return;
    }


    if (isNaN(litros) || litros <= 0) {

        mostrarMensaje(
            "Ingresa una cantidad de litros válida.",
            "error"
        );

        return;
    }


    if (
        isNaN(precio_litro) ||
        precio_litro <= 0
    ) {

        mostrarMensaje(
            "Ingresa un precio por litro válido.",
            "error"
        );

        return;
    }


    // ========================================
    // DATOS
    // ========================================

    const datos = {

        programacion_id:
            programacion_id,

        fecha:
            fecha,

        tren:
            tren,

        litros:
            litros,

        precio_litro:
            precio_litro,

        observaciones:
            observaciones || null
    };


    // ========================================
    // COMPROBAR SI ES EDICIÓN
    // ========================================

    const boton =
        document.getElementById(
            "btnGuardarCombustible"
        );

    const idEditando =
        boton.dataset.editando;


    let error = null;


    // ========================================
    // ACTUALIZAR
    // ========================================

    if (idEditando) {

        const resultado =
            await supabaseClient
                .from("Combustible")
                .update(datos)
                .eq("id", idEditando);

        error =
            resultado.error;

    }

    // ========================================
    // INSERTAR
    // ========================================

    else {

        const resultado =
            await supabaseClient
                .from("Combustible")
                .insert([datos]);

        error =
            resultado.error;
    }


    // ========================================
    // ERROR
    // ========================================

    if (error) {

        console.error(
            "Error guardando combustible:",
            error
        );

        mostrarMensaje(
            "❌ No se pudo guardar el registro de combustible.",
            "error"
        );

        return;
    }


    // ========================================
    // MENSAJE
    // ========================================

    if (idEditando) {

        mostrarMensaje(
            "✅ Registro de combustible actualizado correctamente.",
            "exito"
        );

    } else {

        mostrarMensaje(
            "✅ Combustible guardado correctamente.",
            "exito"
        );

    }


    // ========================================
    // LIMPIAR
    // ========================================

    limpiarFormulario();


    // Restaurar botón

    boton.textContent =
        "💾 GUARDAR";

    delete boton.dataset.editando;


    // Recargar tabla

    cargarCombustible();

}


// ========================================
// CARGAR COMBUSTIBLE
// ========================================

async function cargarCombustible() {

    const tabla =
        document.getElementById(
            "tablaCombustible"
        );

    if (!tabla) return;


    tabla.innerHTML = `
        <tr>
            <td colspan="6">
                Cargando registros...
            </td>
        </tr>
    `;


    const { data, error } =
        await supabaseClient
            .from("Combustible")
            .select(`
                id,
                fecha,
                tren,
                litros,
                precio_litro,
                costo_total,
                observaciones
            `)
            .order(
                "fecha",
                { ascending: false }
            );


    if (error) {

        console.error(
            "Error cargando combustible:",
            error
        );

        tabla.innerHTML = `
            <tr>
                <td colspan="6">
                    Error al cargar los registros.
                </td>
            </tr>
        `;

        return;
    }


    if (!data || data.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="6">
                    No hay registros de combustible.
                </td>
            </tr>
        `;

        return;
    }


    tabla.innerHTML = "";


    data.forEach(registro => {

        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>
                ${registro.fecha || ""}
            </td>

            <td>
                🚆 ${registro.tren || ""}
            </td>

            <td>
                ${Number(registro.litros).toFixed(2)} L
            </td>

            <td>
                ${formatearMoneda(
                    registro.precio_litro
                )}
            </td>

            <td>
                ${formatearMoneda(
                    registro.costo_total
                )}
            </td>

            <td>

                <button
                    class="btn-editar"
                    onclick="editarCombustible(${registro.id})">
                    ✏️
                </button>

                <button
                    class="btn-eliminar"
                    onclick="eliminarCombustible(${registro.id})">
                    🗑️
                </button>

            </td>
        `;


        tabla.appendChild(fila);

    });

}


// ========================================
// EDITAR COMBUSTIBLE
// ========================================

async function editarCombustible(id) {

    const { data, error } =
        await supabaseClient
            .from("Combustible")
            .select(`
                id,
                programacion_id,
                fecha,
                tren,
                litros,
                precio_litro,
                observaciones
            `)
            .eq("id", id)
            .single();


    if (error) {

        console.error(
            "Error al cargar combustible:",
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
    ).value =
        data.programacion_id;


    document.getElementById(
        "fecha"
    ).value =
        data.fecha;


    document.getElementById(
        "tren"
    ).value =
        data.tren;


    document.getElementById(
        "litros"
    ).value =
        data.litros;


    document.getElementById(
        "precio_litro"
    ).value =
        data.precio_litro;


    document.getElementById(
        "observaciones"
    ).value =
        data.observaciones || "";


    const boton =
        document.getElementById(
            "btnGuardarCombustible"
        );


    boton.textContent =
        "💾 ACTUALIZAR";


    boton.dataset.editando =
        id;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ========================================
// ELIMINAR COMBUSTIBLE
// ========================================

async function eliminarCombustible(id) {

    const confirmar =
        confirm(
            "¿Estás seguro de que deseas eliminar este registro de combustible?"
        );


    if (!confirmar) {

        return;
    }


    const { error } =
        await supabaseClient
            .from("Combustible")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(
            "Error al eliminar combustible:",
            error
        );

        mostrarMensaje(
            "❌ No se pudo eliminar el registro.",
            "error"
        );

        return;
    }


    mostrarMensaje(
        "✅ Registro de combustible eliminado correctamente.",
        "exito"
    );


    cargarCombustible();

}


// ========================================
// LIMPIAR FORMULARIO
// ========================================

function limpiarFormulario() {

    document.getElementById(
        "programacion_id"
    ).value = "";


    document.getElementById(
        "litros"
    ).value = "";


    document.getElementById(
        "precio_litro"
    ).value = "";


    document.getElementById(
        "tren"
    ).value = "";


    document.getElementById(
        "observaciones"
    ).value = "";


    establecerFechaActual();


    const boton =
        document.getElementById(
            "btnGuardarCombustible"
        );


    if (boton) {

        boton.textContent =
            "💾 GUARDAR";

        delete boton.dataset.editando;
    }

}


// ========================================
// MENSAJES
// ========================================

function mostrarMensaje(texto, tipo) {

    const mensaje =
        document.getElementById(
            "mensajeCombustible"
        );


    if (!mensaje) return;


    mensaje.textContent =
        texto;


    if (tipo === "error") {

        mensaje.style.color =
            "#dc2626";

    } else {

        mensaje.style.color =
            "#16a34a";
    }


    setTimeout(() => {

        mensaje.textContent = "";

    }, 4000);

}


// ========================================
// FORMATEAR HORA
// ========================================

function formatearHora(hora) {

    if (!hora) return "";

    return hora.substring(0, 5);

}


// ========================================
// FORMATEAR MONEDA
// ========================================

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

// Ocultar pantalla de carga cuando la página y los datos estén listos

window.addEventListener('load', () => {
    setTimeout(() => {
        const pantallaCarga = document.getElementById('pantallaCarga');
        if (pantallaCarga) {
            pantallaCarga.style.opacity = '0';
            setTimeout(() => {
                pantallaCarga.style.display = 'none';
            }, 600); // Tiempo de desvanecimiento
        }
    }, 2000); // 2000 milisegundos = 2 segundos visibles
});
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