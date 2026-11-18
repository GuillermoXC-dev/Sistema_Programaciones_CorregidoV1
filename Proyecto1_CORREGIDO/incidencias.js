
// ========================================
// INICIO
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    mostrarFechaActual();

    establecerFechaActual();

    cargarProgramaciones();

    cargarIncidencias();
	document.getElementById("tipo")
    	.addEventListener("change", actualizarOpcionesDescripcion);
});


// ========================================
// FECHA ACTUAL
// ========================================

function mostrarFechaActual() {

    const elemento = document.getElementById("fechaActual");

    const ahora = new Date();

    elemento.textContent = ahora.toLocaleDateString(
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
// ESTABLECER FECHA DEL FORMULARIO
// ========================================

function establecerFechaActual() {

    const fecha = new Date();

    const año = fecha.getFullYear();

    const mes = String(fecha.getMonth() + 1).padStart(2, "0");

    const dia = String(fecha.getDate()).padStart(2, "0");

    const horas = String(fecha.getHours()).padStart(2, "0");

    const minutos = String(fecha.getMinutes()).padStart(2, "0");

    document.getElementById("fecha").value =
        `${año}-${mes}-${dia}T${horas}:${minutos}`;

}


// ========================================
// CARGAR PROGRAMACIONES
// ========================================
async function cargarProgramaciones() {
    const select = document.getElementById("programacion_id");
    if (!select) return;

    const { data, error } = await supabaseClient
        .from("Programaciones")
        .select("id, fecha, tren, no_locomotora, origen, destino, hora_salida")
        .order("fecha", { ascending: false });

    if (error) {
        console.error("Error cargando programaciones:",error);
        return;
    }
select.innerHTML = '<option value="">Selecciona una programación</option>';

    data.forEach(programacion => {
        const option = document.createElement("option");
        option.value = programacion.id;
        const trenInfo = programacion.no_locomotora || programacion.tren || "Sin locomotora";
        option.textContent = `${programacion.fecha} | Tren ${programacion.tren} | ${programacion.origen} → ${programacion.destino} | ${formatearHora(programacion.hora_salida)}`;
        select.appendChild(option);
    });
}

// ==========================================
// OPCIONES DE DESCRIPCIÓN SEGÚN TIPO
// ==========================================

const opcionesIncidencias = {

    "Falla mecánica": [
        "Ruedas",
        "Ejes",
        "Rodamientos",
        "Frenos",
        "Compresor de aire",
        "Enganche/acoplador",
        "Suspensión",
        "Caja reductora",
        "Motor diésel",
        "Alternador/generador",
        "Motores de tracción",
        "Sistema de lubricación",
        "Otro"
    ],

    "Falla eléctrica": [
        "Sistema",
        "Baterías",
        "Alternador",
        "Cableado",
        "Fusibles",
        "Contactores",
        "Relés",
        "Motores de tracción",
        "Generador principal",
        "Control de tracción",
        "Inversores/convertidores",
        "Sensores",
        "Sistema de control",
        "Iluminación",
        "Radio/comunicación",
        "Sistema de freno electrónico",
        "Puesta a tierra",
        "Protecciones eléctricas",
        "Otro"
    ],

    "Accidente": [
        "Descarrilamiento",
        "Colisión entre trenes",
        "Choque contra obstáculos",
        "Accidente durante maniobras",
        "Atropellamiento",
        "Incendio",
        "Rotura de acoplamiento",
        "Fallas de vía",
        "Accidentes en pasos a nivel",
        "Caída o desplazamiento de carga",
        "Otro"
    ],

    "Operativa": [
        "Retraso de tren",
        "Problema durante maniobras",
        "Espera de vía",
        "Obstrucción de vía",
        "Problema de señalización",
        "Falla de comunicación",
        "Detención no programada",
        "Problema con la carga",
        "Falta de locomotora/vagones",
        "Otro"
    ],

    "Clima": [
        "Lluvia intensa",
        "Inundación",
        "Tormenta eléctrica",
        "Calor extremo",
        "Neblina",
        "Deslizamiento/inundación",
        "Huracán",
        "Otro"
    ]
};

// ==========================================
// CAMBIAR DESCRIPCIÓN SEGÚN TIPO
// ==========================================

function actualizarOpcionesDescripcion() {

    const tipo =
        document.getElementById("tipo").value;

    const contenedor =
        document.getElementById("descripcion");

    // DEMORA Y OTRA = TEXTO LIBRE
    if (tipo === "Demora" || tipo === "Otra") {

        const textarea =
            document.createElement("textarea");

        textarea.id = "descripcion";
        textarea.placeholder =
            tipo === "Demora"
                ? "Describe la demora..."
                : "Describe la incidencia...";

        textarea.rows = 3;

        contenedor.replaceWith(textarea);

        return;
    }

    // Si anteriormente era texto libre,
    // volver a crear el SELECT
    let descripcion =
        document.getElementById("descripcion");

    if (descripcion.tagName !== "SELECT") {

        const nuevoSelect =
            document.createElement("select");

        nuevoSelect.id = "descripcion";

        descripcion.replaceWith(nuevoSelect);

        descripcion = nuevoSelect;
    }

    descripcion.innerHTML = "";

    // Si no se ha seleccionado un tipo
    if (!tipo) {

        const opcion =
            document.createElement("option");

        opcion.value = "";
        opcion.textContent =
            "Selecciona primero el tipo de incidencia";

        descripcion.appendChild(opcion);

        return;
    }

    // Opción inicial
    const opcionInicial =
        document.createElement("option");

    opcionInicial.value = "";
    opcionInicial.textContent =
        "Selecciona la falla";

    descripcion.appendChild(opcionInicial);

    // Obtener las opciones correspondientes
    const opciones =
        opcionesIncidencias[tipo] || [];

    opciones.forEach(opcionTexto => {

        const opcion =
            document.createElement("option");

        opcion.value = opcionTexto;
        opcion.textContent = opcionTexto;

        descripcion.appendChild(opcion);
    });
}



// ========================================
// GUARDAR INCIDENCIA
// ========================================

document.getElementById("btnGuardarIncidencia")
    .addEventListener("click", guardarIncidencia);


// ========================================
// GUARDAR / ACTUALIZAR INCIDENCIA
// ========================================

async function guardarIncidencia() {

    const programacion_id =
        document.getElementById("programacion_id").value;

    const fecha =
        document.getElementById("fecha").value;

    const tipo =
        document.getElementById("tipo").value;

    const descripcion =
        document.getElementById("descripcion").value.trim();

    const minutos_demora =
        parseInt(
            document.getElementById("minutos_demora").value
        ) || 0;

    const locomotora =
    document.getElementById("locomotora").value.trim();

    const responsable =
    document.getElementById("responsable").value.trim();

    const observaciones =
    document.getElementById("observaciones").value.trim();


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


    if (!tipo) {

        mostrarMensaje(
            "Selecciona el tipo de incidencia.",
            "error"
        );

        return;
    }


    if (!descripcion) {

        mostrarMensaje(
            "Escribe una descripción.",
            "error"
        );

        return;
    }


    // ========================================
    // DATOS
    // ========================================

   const datos = {

    programacion_id: Number(programacion_id),

    fecha: new Date(fecha).toISOString(),

    tipo: tipo,

    descripcion: descripcion,

    minutos_demora: minutos_demora,

    locomotora: locomotora || null,

    responsable: responsable || null,

    observaciones: observaciones || null

	};


    // ========================================
    // COMPROBAR SI ESTAMOS EDITANDO
    // ========================================

    const idEditando =
        document.getElementById(
            "btnGuardarIncidencia"
        ).dataset.editando;


    // ========================================
    // ACTUALIZAR
    // ========================================

    if (idEditando) {

        const { error } = await supabaseClient

            .from("Incidencias")

            .update(datos)

            .eq("id", idEditando);


        if (error) {

            console.error(
                "Error actualizando incidencia:",
                error
            );

            mostrarMensaje(
                "No se pudo actualizar la incidencia.",
                "error"
            );

            return;
        }


        mostrarMensaje(
            "✅ Incidencia actualizada correctamente.",
            "exito"
        );

    }


    // ========================================
    // NUEVA INCIDENCIA
    // ========================================

    else {

        const { error } = await supabaseClient

            .from("Incidencias")

            .insert([datos]);


        if (error) {

            console.error(
                "Error guardando incidencia:",
                error
            );

            mostrarMensaje(
                "No se pudo guardar la incidencia.",
                "error"
            );

            return;
        }


        mostrarMensaje(
            "✅ Incidencia guardada correctamente.",
            "exito"
        );

    }


    // ========================================
    // RESTABLECER FORMULARIO
    // ========================================

    limpiarFormulario();


    const boton =
        document.getElementById(
            "btnGuardarIncidencia"
        );


    boton.textContent = "💾 GUARDAR";


    delete boton.dataset.editando;


    // Actualizar tabla

    cargarIncidencias();

}



// ========================================
// BOTÓN ACTUALIZAR INCIDENCIAS
// ========================================

document
    .getElementById("btnActualizarIncidencias")
    .addEventListener("click", cargarIncidencias);



// ========================================
// CARGAR INCIDENCIAS
// ========================================

let ultimaConsultaHistorial = 0;
const periodoHistorial = document.getElementById("periodoHistorial");
const botonPDF = document.getElementById("exportarPDF");
periodoHistorial.addEventListener("change", cargarIncidencias);

function limitesHistorial(periodo, ahora = new Date()) {
    if (periodo === "todo") return null;
    const inicio = new Date(ahora);
    inicio.setHours(0, 0, 0, 0);
    if (periodo === "semana") inicio.setDate(inicio.getDate() - (inicio.getDay() + 6) % 7);
    if (periodo === "mes") inicio.setDate(1);
    if (periodo === "ano") inicio.setMonth(0, 1);
    const fin = new Date(inicio);
    if (periodo === "ano") fin.setFullYear(fin.getFullYear() + 1);
    else if (periodo === "mes") fin.setMonth(fin.getMonth() + 1);
    else fin.setDate(fin.getDate() + (periodo === "semana" ? 7 : 1));
    return [inicio.toISOString(), fin.toISOString()];
}

botonPDF.addEventListener("click", () => {
    if (!window.jspdf?.jsPDF) return alert("No se pudo cargar el generador de PDF. Revisa la conexión y recarga la página.");
    const pdf = new window.jspdf.jsPDF({orientation: "landscape", format: "a4"});
    if (!pdf.autoTable) return alert("No se pudo cargar el formato de tablas PDF. Recarga la página.");
    const tabla = document.getElementById("tablaIncidencias");
    const columnas = Array.from(tabla.tHead.rows[0].cells).slice(0,-1);
    const filas = Array.from(tabla.tBodies[0].rows, fila =>
        Array.from(fila.cells).slice(0,-1).map(celda =>
            celda.textContent.replace(/[\u{1F300}-\u{1FAFF}\uFE0F]/gu, "").trim()));
    const periodo = periodoHistorial.selectedOptions[0].textContent;
    pdf.save("Incidencias_" + periodoHistorial.value + ".pdf");
      const verde = [0, 83, 73];
    const dorado = [184, 151, 77];
    const ancho = pdf.internal.pageSize.getWidth();
    const alto = pdf.internal.pageSize.getHeight();
    const fechaEmision = new Date().toLocaleString("es-MX");

    const demora = filas.reduce(
        (total, fila) => total + (parseFloat(fila[4]) || 0),
        0
    );

    function dibujarEncabezado() {
        pdf.setFillColor(...verde);
        pdf.rect(0, 0, ancho, 34, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text("TREN MAYA · SERVICIO DE CARGA", 14, 11);

        pdf.setFontSize(20);
        pdf.text("Informe de incidencias", 14, 22);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(
            "Dirección de Control de Operaciones Ferroviarias de Carga",
            14,
            29
        );

        pdf.setFillColor(...dorado);
        pdf.rect(0, 34, ancho, 1.4, "F");
    }

    dibujarEncabezado();

    // Información del reporte
    pdf.setTextColor(...verde);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text("PERIODO CONSULTADO", 14, 43);
    pdf.text("FECHA DE EMISIÓN", 155, 43);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(periodo, 14, 49);
    pdf.text(fechaEmision, 155, 49);

    // Resumen
    pdf.setFillColor(244, 247, 245);
    pdf.roundedRect(14, 55, ancho - 28, 20, 2, 2, "F");

    pdf.setDrawColor(...dorado);
    pdf.setLineWidth(0.5);
    pdf.line(14, 55, ancho - 14, 55);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text(String(filas.length), 20, 64);
    pdf.text(String(demora) + " min", 110, 64);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Incidencias incluidas", 20, 71);
    pdf.text("Demora acumulada", 110, 71);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("Detalle de incidencias", 14, 84);

    // Tabla
    pdf.autoTable({
        startY: 88,
        margin: {
            top: 42,
            bottom: 19,
            left: 14,
            right: 14
        },
        head: [columnas.map(columna => columna.textContent.trim())],
        body: filas,
        theme: "grid",
        styles: {
            font: "helvetica",
            fontSize: 8,
            cellPadding: 2.5,
            overflow: "linebreak",
            textColor: [35, 49, 45],
            lineColor: [219, 227, 222],
            lineWidth: 0.15,
            valign: "top"
        },
        headStyles: {
            fillColor: verde,
            textColor: [255, 255, 255],
            fontStyle: "bold"
        },
        alternateRowStyles: {
            fillColor: [244, 247, 245]
        },
        columnStyles: {
            0: { cellWidth: 28 },
            1: { cellWidth: 25 },
            2: { cellWidth: 22 },
            3: { cellWidth: 35 },
            4: { cellWidth: 18 },
            5: { cellWidth: 25 },
            6: { cellWidth: 36 }
        },
        showHead: "everyPage",
        rowPageBreak: "avoid",
        willDrawPage: datos => {
            if (datos.pageNumber > 1) {
                dibujarEncabezado();
            }
        }
    });

    // Pie de página y numeración
    const paginas = pdf.internal.getNumberOfPages();

    for (let pagina = 1; pagina <= paginas; pagina++) {
        pdf.setPage(pagina);

        pdf.setDrawColor(...dorado);
        pdf.setLineWidth(0.4);
        pdf.line(14, alto - 15, ancho - 14, alto - 15);

        pdf.setTextColor(...verde);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);

        pdf.text(
            "DCOFC · Sistema de Operaciones · Registros del periodo seleccionado",
            14,
            alto - 9
        );

        pdf.text(
            "Página " + pagina + " de " + paginas,
            ancho - 14,
            alto - 9,
            { align: "right" }
        );
    }
    pdf.save("Incidencias_" + periodoHistorial.value + ".pdf");
});


async function cargarIncidencias() {
    const version = ++ultimaConsultaHistorial;
    const tabla = document.getElementById("cuerpoTablaIncidencias");
    botonPDF.disabled = true;
    tabla.innerHTML = '<tr><td colspan="9">Cargando incidencias...</td></tr>';
    const limites = limitesHistorial(periodoHistorial.value);
    const data = [];
    let error;
    let ultimoId;
    try {
        while (true) {
            let consulta = supabaseClient.from("Incidencias").select(
                "id,fecha,tipo,descripcion,minutos_demora,locomotora,responsable,observaciones,programacion_id,Programaciones(tren,no_locomotora)"
            ).order("id", {ascending:true}).limit(500);
            if (limites) consulta = consulta.gte("fecha", limites[0]).lt("fecha", limites[1]);
            if (ultimoId !== undefined) consulta = consulta.gt("id", ultimoId);
            const pagina = await consulta;
            if (version !== ultimaConsultaHistorial) return;
            if (pagina.error) throw pagina.error;
            if (!pagina.data.length) break;
            data.push(...pagina.data);
            ultimoId = pagina.data[pagina.data.length - 1].id;
        }
        data.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
    } catch (fallo) {
        if (version !== ultimaConsultaHistorial) return;
        error = fallo;
    }
    if (error) {

        console.error(
            "Error cargando incidencias:",
            error
        );

        tabla.innerHTML = `
    <tr>
        <td colspan="9">
            Error al cargar las incidencias.
        </td>
    </tr>
`;

        return;

    }


    if (!data || data.length === 0) {

        tabla.innerHTML = `
    <tr>
        <td colspan="9">
            No hay incidencias registradas.
        </td>
    </tr>
`;

        return;

    }


    tabla.innerHTML = "";


    botonPDF.disabled = false;


    data.forEach(incidencia => {

        const fila =
            document.createElement("tr");


        const tren =
            incidencia.Programaciones?.no_locomotora
            ||incidencia.Programaciones?.tren
            || "Sin tren";
	    const fechaHora = incidencia.fecha
    		? new Date(incidencia.fecha).toLocaleString(
        	"es-MX",
        	{
            dateStyle: "short",
            timeStyle: "short"
        	}
    )
    : "";

       
fila.innerHTML = `

<td>
    ${fechaHora}
</td>

<td>
    🚆 ${tren}
</td>

<td>
    ${incidencia.tipo || ""}
</td>

<td>
    ${incidencia.descripcion || ""}
</td>

<td>
    ${incidencia.minutos_demora || 0} min
</td>

<td>
    ${incidencia.locomotora || "Sin locomotora"}
</td>

<td>
    ${incidencia.responsable || "Sin responsable"}
</td>

<td>
    ${incidencia.observaciones || ""}
</td>

<td>

    <button
        class="btn-editar"
        onclick="editarIncidencia(${incidencia.id})">
        ✏️
    </button>

    <button
        class="btn-eliminar"
        onclick="eliminarIncidencia(${incidencia.id})">
        🗑️
    </button>

</td>

`;
        tabla.appendChild(fila);

    });

}


// ========================================
// LIMPIAR FORMULARIO
// ========================================

document.getElementById("btnLimpiarIncidencia")
    .addEventListener("click", limpiarFormulario);


function limpiarFormulario() {

    document.getElementById("programacion_id").value = "";

    document.getElementById("tipo").value = "";

    document.getElementById("descripcion").value = "";

    document.getElementById("minutos_demora").value = "0";

    document.getElementById("locomotora").value = "";

    document.getElementById("responsable").value = "";

    document.getElementById("observaciones").value = "";

    establecerFechaActual();



}


// ========================================
// MENSAJES
// ========================================

function mostrarMensaje(texto, tipo) {

    const mensaje =
        document.getElementById("mensajeIncidencia");


    mensaje.textContent = texto;


    if (tipo === "error") {

        mensaje.style.color = "#dc2626";

    } else {

        mensaje.style.color = "#16a34a";

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
// EDITAR INCIDENCIA
// ========================================

async function editarIncidencia(id) {

    const { data, error } = await supabaseClient

        .from("Incidencias")

        .select("*")

        .eq("id", id)

        .single();


    if (error) {

        console.error(error);

        alert("No se pudo cargar la incidencia.");

        return;

    }


    document.getElementById("programacion_id").value =
        data.programacion_id || "";

    if (data.fecha) {

    const fecha = new Date(data.fecha);

    const año = fecha.getFullYear();

    const mes = String(fecha.getMonth() + 1).padStart(2, "0");

    const dia = String(fecha.getDate()).padStart(2, "0");

    const horas = String(fecha.getHours()).padStart(2, "0");

    const minutos = String(fecha.getMinutes()).padStart(2, "0");

    document.getElementById("fecha").value =
        `${año}-${mes}-${dia}T${horas}:${minutos}`;

}


    document.getElementById("locomotora").value =
    data.locomotora || "";

    document.getElementById("tipo").value =
    data.tipo || "";

// Generar nuevamente las opciones
actualizarOpcionesDescripcion();

// Colocar la descripción guardada
const campoDescripcion =
    document.getElementById("descripcion");

if (campoDescripcion) {
    campoDescripcion.value =
        data.descripcion || "";
}

    document.getElementById("minutos_demora").value =
        data.minutos_demora || 0;

    document.getElementById("responsable").value =
        data.responsable || "";

    document.getElementById("observaciones").value =
        data.observaciones || "";


    document.getElementById("btnGuardarIncidencia").textContent =
        "💾 ACTUALIZAR";


    document.getElementById("btnGuardarIncidencia").dataset.editando =
        id;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ========================================
// ELIMINAR INCIDENCIA
// ========================================

async function eliminarIncidencia(id) {

    const confirmar = confirm(
        "¿Seguro que deseas eliminar esta incidencia?"
    );


    if (!confirmar) return;


    const { error } = await supabaseClient

        .from("Incidencias")

        .delete()

        .eq("id", id);


    if (error) {

        console.error(error);

        alert("No se pudo eliminar la incidencia.");

        return;

    }


    alert("✅ Incidencia eliminada correctamente.");

    cargarIncidencias();

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