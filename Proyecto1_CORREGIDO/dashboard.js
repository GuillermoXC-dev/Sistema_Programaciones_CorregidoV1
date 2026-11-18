// ============================================================
// SISTEMA DE GESTIÓN FERROVIARIA
// ============================================================
// ============================================================
// VARIABLES GLOBALES
// ============================================================

let filtroActual = "hoy";

let fechaCalendario = new Date();

let programacionesCalendario = [];

let graficaCostos = null;


// ============================================================
// INICIAR DASHBOARD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    mostrarFechaActual();

    cargarResumen();

    cargarProximasSalidas();

    cargarIncidencias();

    cargarRecepcionesDashboard();

    cargarCombustible();

    cargarCostosDemora();

    cargarCostoTotal();

    cargarGraficaCostos();

    cargarCalendario();

    iniciarControlesCalendario();

    iniciarNavegacionDashboard();

    iniciarFiltrosDashboard();

});


// ============================================================
// FECHA ACTUAL
// ============================================================

function mostrarFechaActual() {

    const elemento =
        document.getElementById("fechaActual");

    if (!elemento) return;

    const fecha = new Date();

    elemento.textContent =
        fecha.toLocaleDateString(
            "es-MX",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
}


// ============================================================
// OBTENER RANGO DEL FILTRO
// ============================================================

function obtenerRangoFiltro() {

    const hoy = new Date();

    hoy.setHours(
        0,
        0,
        0,
        0
    );

    let fechaInicio = new Date(hoy);
    let fechaFin = new Date(hoy);


    // --------------------------------------------------------
    // HOY
    // --------------------------------------------------------

    if (filtroActual === "hoy") {

        return {
            inicio: fechaInicio,
            fin: fechaFin
        };
    }


    // --------------------------------------------------------
    // ESTA SEMANA
    // --------------------------------------------------------

    if (filtroActual === "semana") {

        const diaSemana =
            hoy.getDay();

        const diferencia =
            diaSemana === 0
                ? 6
                : diaSemana - 1;

        fechaInicio.setDate(
            hoy.getDate() - diferencia
        );

        fechaFin =
            new Date(fechaInicio);

        fechaFin.setDate(
            fechaInicio.getDate() + 6
        );

        return {
            inicio: fechaInicio,
            fin: fechaFin
        };
    }


    // --------------------------------------------------------
    // ESTE MES
    // --------------------------------------------------------

    if (filtroActual === "mes") {

        fechaInicio =
            new Date(
                hoy.getFullYear(),
                hoy.getMonth(),
                1
            );

        fechaFin =
            new Date(
                hoy.getFullYear(),
                hoy.getMonth() + 1,
                0
            );

        return {
            inicio: fechaInicio,
            fin: fechaFin
        };
    }


    // --------------------------------------------------------
    // TODO
    // --------------------------------------------------------

    if (filtroActual === "todo") {

        return {
            inicio: null,
            fin: null
        };
    }


    return {
        inicio: null,
        fin: null
    };
}


// ============================================================
// CONVERTIR FECHA A YYYY-MM-DD
// ============================================================

function fechaTextoLocal(fecha) {

    if (!fecha) return "";

    const año =
        fecha.getFullYear();

    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            fecha.getDate()
        ).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
}


// ============================================================
// RESUMEN DE OPERACIONES
// ============================================================

async function cargarResumen() {

    const rango =
        obtenerRangoFiltro();

    let consulta =
        supabaseClient
            .from("Programaciones")
            .select(
                "id, estatus, fecha"
            );


    if (rango.inicio && rango.fin) {

        const inicio =
            fechaTextoLocal(
                rango.inicio
            );

        const fin =
            fechaTextoLocal(
                rango.fin
            );

        consulta =
            consulta
                .gte("fecha", inicio)
                .lte("fecha", fin);
    }


    const {
        data,
        error
    } =
        await consulta;


    if (error) {

        console.error(
            "Error al cargar resumen:",
            error
        );

        return;
    }


    const registros =
        data || [];


    const total =
        registros.length;


    const programadas =
        registros.filter(
            p =>
                p.estatus === "Programado"
        ).length;


    const enCurso =
        registros.filter(
            p =>
                p.estatus === "En curso"
        ).length;


    const finalizadas =
        registros.filter(
            p =>
                p.estatus === "Finalizado"
        ).length;


    const canceladas =
        registros.filter(
            p =>
                p.estatus === "Cancelado"
        ).length;


    const totalProgramaciones =
        document.getElementById(
            "totalProgramaciones"
        );


    const totalProgramadas =
        document.getElementById(
            "totalProgramadas"
        );


    const totalCurso =
        document.getElementById(
            "totalCurso"
        );


    const totalFinalizadas =
        document.getElementById(
            "totalFinalizadas"
        );


    const totalCanceladas =
        document.getElementById(
            "totalCanceladas"
        );


    if (totalProgramaciones) {

        totalProgramaciones.textContent =
            total;
    }


    if (totalProgramadas) {

        totalProgramadas.textContent =
            programadas;
    }


    if (totalCurso) {

        totalCurso.textContent =
            enCurso;
    }


    if (totalFinalizadas) {

        totalFinalizadas.textContent =
            finalizadas;
    }


    if (totalCanceladas) {

        totalCanceladas.textContent =
            canceladas;
    }
}


// ============================================================
// PRÓXIMAS SALIDAS
// ============================================================

async function cargarProximasSalidas() {

    const contenedor =
        document.getElementById(
            "proximasSalidas"
        );

    if (!contenedor) return;


    const hoyTexto =
        fechaTextoLocal(
            new Date()
        );


    let consulta =
        supabaseClient
            .from("Programaciones")
            .select(`
                id,
                fecha,
                no_locomotora,
                origen,
                destino,
                hora_salida,
                hora_llegada,
                estatus
            `);


    // ========================================================
    // Las próximas salidas nunca muestran fechas anteriores
    // a la fecha actual.
    // ========================================================

    consulta =
        consulta.gte(
            "fecha",
            hoyTexto
        );


    // ========================================================
    // FILTRO
    // ========================================================

    if (filtroActual !== "todo") {

        const rango =
            obtenerRangoFiltro();

        if (rango.inicio && rango.fin) {

            const inicio =
                fechaTextoLocal(
                    rango.inicio
                );

            const fin =
                fechaTextoLocal(
                    rango.fin
                );

            consulta =
                consulta
                    .gte("fecha", inicio)
                    .lte("fecha", fin);
        }
    }


    const {
        data,
        error
    } =
        await consulta
            .order(
                "fecha",
                {
                    ascending: true
                }
            )
            .order(
                "hora_salida",
                {
                    ascending: true
                }
            )
            .limit(5);


    if (error) {

        console.error(
            "Error al cargar próximas salidas:",
            error
        );

        contenedor.innerHTML = `
            <p class="sin-datos">
                Error al cargar salidas.
            </p>
        `;

        return;
    }


    if (!data || data.length === 0) {

        contenedor.innerHTML = `
            <p class="sin-datos">
                No hay próximas salidas para este período.
            </p>
        `;

        return;
    }


    contenedor.innerHTML = "";


    data.forEach(
        programacion => {

            const elemento =
                document.createElement(
                    "div"
                );


            elemento.className =
                "salida";


            const fechaMostrar =
                formatearFechaCorta(
                    programacion.fecha
                );


            const estatus =
                programacion.estatus ||
                "Sin estatus";


            const estatusClase =
                estatus
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        "-"
                    );


            elemento.classList.add(
                `estatus-${estatusClase}`
            );


            const locomotora =
                programacion.no_locomotora ||
                "Sin locomotora";


            elemento.innerHTML = `

                <div>

                    <strong>
                        🚆 ${escapeHTML(locomotora)}
                    </strong>

                    <span>
                        ${escapeHTML(
                            programacion.origen || ""
                        )}
                        →
                        ${escapeHTML(
                            programacion.destino || ""
                        )}
                    </span>

                    <small>
                        📅 ${fechaMostrar}
                    </small>

                    <small>
                        📌 ${escapeHTML(estatus)}
                    </small>

                </div>

                <div class="hora-salida">

                    🕐 ${formatearHora(
                        programacion.hora_salida
                    )}

                </div>

            `;


            contenedor.appendChild(
                elemento
            );
        }
    );
}


// ============================================================
// INCIDENCIAS
// ============================================================

async function cargarIncidencias() {

    const totalIncidencias =
        document.getElementById(
            "totalIncidencias"
        );


    const totalDemoras =
        document.getElementById(
            "totalDemoras"
        );


    if (
        !totalIncidencias ||
        !totalDemoras
    ) {

        return;
    }


    const rango =
        obtenerRangoFiltro();


    let consulta =
        supabaseClient
            .from("Incidencias")
            .select(
                "id, minutos_demora, fecha"
            );


    if (
        rango.inicio &&
        rango.fin
    ) {

        const inicio =
            fechaTextoLocal(
                rango.inicio
            );

        const fin =
            fechaTextoLocal(
                rango.fin
            );

        consulta =
            consulta
                .gte("fecha", inicio)
                .lte("fecha", fin);
    }


    const {
        data,
        error
    } =
        await consulta;


    if (error) {

        console.error(
            "Error al cargar incidencias:",
            error
        );

        totalIncidencias.textContent =
            "0";

        totalDemoras.textContent =
            "0 min";

        return;
    }


    const incidencias =
        data || [];


    totalIncidencias.textContent =
        incidencias.length;


    const minutosTotales =
        incidencias.reduce(
            (
                total,
                incidencia
            ) => {

                return total +
                    Number(
                        incidencia.minutos_demora ||
                        0
                    );
            },
            0
        );


    totalDemoras.textContent =
        minutosTotales +
        " min";
}


// ============================================================
// RECEPCIONES
// ============================================================

async function cargarRecepcionesDashboard() {

    const totalRecepciones =
        document.getElementById(
            "totalRecepciones"
        );


    const combustibleRecepcion =
        document.getElementById(
            "combustibleRecepcion"
        );


    if (
        !totalRecepciones ||
        !combustibleRecepcion
    ) {

        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("Recepción")
            .select(
                "id, combustible_llegada, estatus"
            );


    if (error) {

        console.error(
            "Error al cargar recepciones:",
            error
        );

        totalRecepciones.textContent =
            "0";

        combustibleRecepcion.textContent =
            "0 L";

        return;
    }


    const recepciones =
        data || [];


    const recibidos =
        recepciones.filter(
            recepcion =>
                recepcion.estatus ===
                "Recibido"
        );


    const litros =
        recibidos.reduce(
            (
                total,
                recepcion
            ) => {

                return total +
                    Number(
                        recepcion.combustible_llegada ||
                        0
                    );
            },
            0
        );


    totalRecepciones.textContent =
        recibidos.length;


    combustibleRecepcion.textContent =
        litros.toLocaleString(
            "es-MX",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ) +
        " L";
}


// ============================================================
// COMBUSTIBLE
// ============================================================

async function cargarCombustible() {

    const rango =
        obtenerRangoFiltro();


    let consulta =
        supabaseClient
            .from("Combustible")
            .select(
                "litros, costo_total, fecha"
            );


    if (
        rango.inicio &&
        rango.fin
    ) {

        const inicio =
            fechaTextoLocal(
                rango.inicio
            );

        const fin =
            fechaTextoLocal(
                rango.fin
            );

        consulta =
            consulta
                .gte("fecha", inicio)
                .lte("fecha", fin);
    }


    const {
        data,
        error
    } =
        await consulta;


    if (error) {

        console.error(
            "Error cargando combustible:",
            error
        );

        return;
    }


    const registros =
        data || [];


    const litros =
        registros.reduce(
            (
                total,
                registro
            ) => {

                return total +
                    Number(
                        registro.litros ||
                        0
                    );
            },
            0
        );


    const costo =
        registros.reduce(
            (
                total,
                registro
            ) => {

                return total +
                    Number(
                        registro.costo_total ||
                        0
                    );
            },
            0
        );


    const elementoLitros =
        document.getElementById(
            "totalLitros"
        );


    const elementoCosto =
        document.getElementById(
            "costoCombustible"
        );


    if (elementoLitros) {

        elementoLitros.textContent =
            litros.toFixed(2) +
            " L";
    }


    if (elementoCosto) {

        elementoCosto.textContent =
            formatearMoneda(
                costo
            );
    }
}


// ============================================================
// COSTOS DE DEMORA
// ============================================================

async function cargarCostosDemora() {

    const rango =
        obtenerRangoFiltro();


    let consulta =
        supabaseClient
            .from("CostosDemora")
            .select(
                "minutos_demora, costo_total, fecha"
            );


    if (
        rango.inicio &&
        rango.fin
    ) {

        const inicio =
            fechaTextoLocal(
                rango.inicio
            );

        const fin =
            fechaTextoLocal(
                rango.fin
            );

        consulta =
            consulta
                .gte("fecha", inicio)
                .lte("fecha", fin);
    }


    const {
        data,
        error
    } =
        await consulta;


    if (error) {

        console.error(
            "Error cargando costos:",
            error
        );

        return;
    }


    const registros =
        data || [];


    const minutos =
        registros.reduce(
            (
                total,
                registro
            ) => {

                return total +
                    Number(
                        registro.minutos_demora ||
                        0
                    );
            },
            0
        );


    const costo =
        registros.reduce(
            (
                total,
                registro
            ) => {

                return total +
                    Number(
                        registro.costo_total ||
                        0
                    );
            },
            0
        );


    const elementoMinutos =
        document.getElementById(
            "minutosCosto"
        );


    const elementoCosto =
        document.getElementById(
            "costoDemora"
        );


    if (elementoMinutos) {

        elementoMinutos.textContent =
            minutos +
            " min";
    }


    if (elementoCosto) {

        elementoCosto.textContent =
            formatearMoneda(
                costo
            );
    }
}


// ============================================================
// COSTO TOTAL
// ============================================================

async function cargarCostoTotal() {

    const rango =
        obtenerRangoFiltro();


    // --------------------------------------------------------
    // COMBUSTIBLE
    // --------------------------------------------------------

    let consultaCombustible =
        supabaseClient
            .from("Combustible")
            .select(
                "costo_total, fecha"
            );


    if (
        rango.inicio &&
        rango.fin
    ) {

        const inicio =
            fechaTextoLocal(
                rango.inicio
            );

        const fin =
            fechaTextoLocal(
                rango.fin
            );

        consultaCombustible =
            consultaCombustible
                .gte("fecha", inicio)
                .lte("fecha", fin);
    }


    const {
        data: combustible,
        error: errorCombustible
    } =
        await consultaCombustible;


    if (errorCombustible) {

        console.error(
            "Error cargando costo de combustible:",
            errorCombustible
        );

        return;
    }


    const costoCombustible =
        (
            combustible || []
        ).reduce(
            (
                total,
                registro
            ) => {

                return total +
                    Number(
                        registro.costo_total ||
                        0
                    );
            },
            0
        );


    // --------------------------------------------------------
    // DEMORAS
    // --------------------------------------------------------

    let consultaDemoras =
        supabaseClient
            .from("CostosDemora")
            .select(
                "costo_total, fecha"
            );


    if (
        rango.inicio &&
        rango.fin
    ) {

        const inicio =
            fechaTextoLocal(
                rango.inicio
            );

        const fin =
            fechaTextoLocal(
                rango.fin
            );

        consultaDemoras =
            consultaDemoras
                .gte("fecha", inicio)
                .lte("fecha", fin);
    }


    const {
        data: demoras,
        error: errorDemoras
    } =
        await consultaDemoras;


    if (errorDemoras) {

        console.error(
            "Error cargando costo de demoras:",
            errorDemoras
        );

        return;
    }


    const costoDemoras =
        (
            demoras || []
        ).reduce(
            (
                total,
                registro
            ) => {

                return total +
                    Number(
                        registro.costo_total ||
                        0
                    );
            },
            0
        );


    // --------------------------------------------------------
    // TOTAL
    // --------------------------------------------------------

    const costoTotal =
        costoCombustible +
        costoDemoras;


    const elementoCombustible =
        document.getElementById(
            "costoTotalCombustible"
        );


    const elementoDemoras =
        document.getElementById(
            "costoTotalDemoras"
        );


    const elementoTotal =
        document.getElementById(
            "costoTotalGeneral"
        );


    if (elementoCombustible) {

        elementoCombustible.textContent =
            formatearMoneda(
                costoCombustible
            );
    }


    if (elementoDemoras) {

        elementoDemoras.textContent =
            formatearMoneda(
                costoDemoras
            );
    }


    if (elementoTotal) {

        elementoTotal.textContent =
            formatearMoneda(
                costoTotal
            );
    }
}


// ============================================================
// GRÁFICA DE COSTOS
// ============================================================

async function cargarGraficaCostos() {

    const rango =
        obtenerRangoFiltro();


    // --------------------------------------------------------
    // COMBUSTIBLE
    // --------------------------------------------------------

    let consultaCombustible =
        supabaseClient
            .from("Combustible")
            .select(
                "costo_total, fecha"
            );


    if (
        rango.inicio &&
        rango.fin
    ) {

        const inicio =
            fechaTextoLocal(
                rango.inicio
            );

        const fin =
            fechaTextoLocal(
                rango.fin
            );

        consultaCombustible =
            consultaCombustible
                .gte("fecha", inicio)
                .lte("fecha", fin);
    }


    const {
        data: combustible,
        error: errorCombustible
    } =
        await consultaCombustible;


    if (errorCombustible) {

        console.error(
            "Error cargando costos de combustible:",
            errorCombustible
        );

        return;
    }


    const costoCombustible =
        (
            combustible || []
        ).reduce(
            (
                total,
                registro
            ) => {

                return total +
                    Number(
                        registro.costo_total ||
                        0
                    );
            },
            0
        );


    // --------------------------------------------------------
    // DEMORAS
    // --------------------------------------------------------

    let consultaCostosDemora =
        supabaseClient
            .from("CostosDemora")
            .select(
                "costo_total, fecha"
            );


    if (
        rango.inicio &&
        rango.fin
    ) {

        const inicio =
            fechaTextoLocal(
                rango.inicio
            );

        const fin =
            fechaTextoLocal(
                rango.fin
            );

        consultaCostosDemora =
            consultaCostosDemora
                .gte("fecha", inicio)
                .lte("fecha", fin);
    }


    const {
        data: costosDemora,
        error: errorCostos
    } =
        await consultaCostosDemora;


    if (errorCostos) {

        console.error(
            "Error cargando costos de demora:",
            errorCostos
        );

        return;
    }


    const costoDemora =
        (
            costosDemora || []
        ).reduce(
            (
                total,
                registro
            ) => {

                return total +
                    Number(
                        registro.costo_total ||
                        0
                    );
            },
            0
        );


    const canvas =
        document.getElementById(
            "graficaCostos"
        );


    if (
        !canvas ||
        typeof Chart === "undefined"
    ) {

        console.warn(
            "No se encontró el canvas #graficaCostos o Chart.js no está cargado."
        );

        return;
    }


    // ========================================================
    // EVITAR ERROR:
    // Canvas is already in use
    // ========================================================

    const graficaExistente =
        Chart.getChart(canvas);


    if (graficaExistente) {

        graficaExistente.destroy();
    }


    if (graficaCostos) {

        try {

            graficaCostos.destroy();

        } catch (error) {

            console.warn(
                "No fue posible destruir la gráfica anterior:",
                error
            );
        }

        graficaCostos = null;
    }


    graficaCostos =
        new Chart(
            canvas.getContext("2d"),
            {
                type: "bar",

                data: {

                    labels: [
                        "Combustible",
                        "Demoras"
                    ],

                    datasets: [
                        {
                            label:
                                "Costo (MXN)",

                            data: [
                                costoCombustible,
                                costoDemora
                            ],

                            borderWidth: 1
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return formatearMoneda(
                                            context.raw
                                        );
                                    }
                            }
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                callback:
                                    function (
                                        value
                                    ) {

                                        return formatearMoneda(
                                            value
                                        );
                                    }
                            }
                        }
                    }
                }
            }
        );

    console.log(
        "Gráfica de costos cargada correctamente."
    );
}


// ============================================================
// CALENDARIO
// ============================================================

async function cargarCalendario() {

    const año =
        fechaCalendario.getFullYear();

    const mes =
        String(
            fechaCalendario.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const ultimoDia =
        new Date(
            fechaCalendario.getFullYear(),
            fechaCalendario.getMonth() + 1,
            0
        );


    const primerDiaTexto =
        `${año}-${mes}-01`;


    const ultimoDiaTexto =
        `${año}-${mes}-${String(
            ultimoDia.getDate()
        ).padStart(
            2,
            "0"
        )}`;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("Programaciones")
            .select(`
                id,
                fecha,
                no_locomotora,
                origen,
                destino,
                hora_salida,
                estatus
            `)
            .gte(
                "fecha",
                primerDiaTexto
            )
            .lte(
                "fecha",
                ultimoDiaTexto
            );


    if (error) {

        console.error(
            "Error cargando calendario:",
            error
        );

        return;
    }


    programacionesCalendario =
        data || [];


    mostrarCalendario();


    // ========================================================
    // AL ABRIR EL DASHBOARD:
    // seleccionar automáticamente HOY
    // ========================================================

    const hoy =
        fechaTextoLocal(
            new Date()
        );


    const mesActual =
        fechaCalendario.getMonth();

    const añoActual =
        fechaCalendario.getFullYear();


    const fechaHoy =
        new Date();


    if (
        mesActual === fechaHoy.getMonth() &&
        añoActual === fechaHoy.getFullYear()
    ) {

        mostrarDetalleDia(hoy);
    }
}


// ============================================================
// MOSTRAR CALENDARIO
// ============================================================

function mostrarCalendario() {

    const contenedor =
        document.getElementById(
            "diasCalendario"
        );


    const titulo =
        document.getElementById(
            "mesAnio"
        );


    if (
        !contenedor ||
        !titulo
    ) {

        return;
    }


    const nombresMeses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    ];


    titulo.textContent =
        `${nombresMeses[
            fechaCalendario.getMonth()
        ]} ${fechaCalendario.getFullYear()}`;


    contenedor.innerHTML = "";


    const año =
        fechaCalendario.getFullYear();


    const mes =
        fechaCalendario.getMonth();


    const primerDia =
        new Date(
            año,
            mes,
            1
        );


    let diaSemana =
        primerDia.getDay();


    diaSemana =
        diaSemana === 0
            ? 6
            : diaSemana - 1;


    const diasMes =
        new Date(
            año,
            mes + 1,
            0
        ).getDate();


    // --------------------------------------------------------
    // ESPACIOS
    // --------------------------------------------------------

    for (
        let i = 0;
        i < diaSemana;
        i++
    ) {

        const espacio =
            document.createElement(
                "div"
            );

        espacio.className =
            "dia calendario-vacio";

        contenedor.appendChild(
            espacio
        );
    }


  // --------------------------------------------------------
    // DÍAS
    // --------------------------------------------------------

    for (
        let dia = 1;
        dia <= diasMes;
        dia++
    ) {

        const elemento =
            document.createElement(
                "div"
            );

        const fechaTexto =
            `${año}-${String(
                mes + 1
            ).padStart(
                2,
                "0"
            )}-${String(
                dia
            ).padStart(
                2,
                "0"
            )}`;

        const programaciones =
            programacionesCalendario.filter(
                p =>
                    p.fecha ===
                    fechaTexto
            );

        // ====================================================
        // MARCAR EL DÍA DE HOY Y CLASES DEL CALENDARIO
        // ====================================================

        const fechaActual = new Date();
        const esHoy = dia === fechaActual.getDate() &&
                      mes === fechaActual.getMonth() &&
                      año === fechaActual.getFullYear();

        elemento.className = "dia dia-calendario";

        if (esHoy) {
            elemento.classList.add("hoy");
        }

        // Estructura base del día con su número
        elemento.innerHTML = `
            <span class="numero-dia dia-numero">${dia}</span>
            <div class="dia-programaciones"></div>
        `;

        // Indicador si hay programaciones
        if (programaciones.length > 0) {
            elemento.classList.add("dia-con-programacion");

            const indicador = document.createElement("div");
            indicador.className = "indicador-programaciones";
            indicador.textContent = `🚆 ${programaciones.length}`;

            const contenedorProg = elemento.querySelector(".dia-programaciones");
            if (contenedorProg) {
                contenedorProg.appendChild(indicador);
            } else {
                elemento.appendChild(indicador);
            }
        }

        elemento.addEventListener("click", () => {
            mostrarDetalleDia(fechaTexto);
        });

        contenedor.appendChild(elemento);
    }
}
// ============================================================
// DETALLE DEL DÍA
// ============================================================

function mostrarDetalleDia(
    fecha
) {

    const detalle =
        document.getElementById(
            "detalleDia"
        );


    if (!detalle) return;


    const programaciones =
        programacionesCalendario.filter(
            p =>
                p.fecha === fecha
        );


    const fechaMostrar =
        formatearFechaLarga(
            fecha
        );


    if (
        programaciones.length === 0
    ) {

        detalle.innerHTML = `

            <h3>
                📅 ${fechaMostrar}
            </h3>

            <p>
                No hay operaciones para este día.
            </p>

        `;

        return;
    }


    let html = `

        <h3>
            📅 ${fechaMostrar}
        </h3>

    `;


    programaciones.forEach(
        programacion => {

            html += `

                <div class="detalle-programacion">

                    <strong>
                        🚆 ${
                            escapeHTML(
                                programacion.no_locomotora ||
                                "Sin locomotora"
                            )
                        }
                    </strong>

                    <span>
                        ${
                            escapeHTML(
                                programacion.origen ||
                                ""
                            )
                        }
                        →
                        ${
                            escapeHTML(
                                programacion.destino ||
                                ""
                            )
                        }
                    </span>

                    <span>
                        🕐 ${
                            formatearHora(
                                programacion.hora_salida
                            )
                        }
                    </span>

                    <span>
                        ${
                            escapeHTML(
                                programacion.estatus ||
                                "Sin estatus"
                            )
                        }
                    </span>

                </div>

            `;
        }
    );


    detalle.innerHTML =
        html;
}


// ============================================================
// CONTROLES DEL CALENDARIO
// ============================================================

function iniciarControlesCalendario() {

    const mesAnterior =
        document.getElementById(
            "mesAnterior"
        );


    const mesSiguiente =
        document.getElementById(
            "mesSiguiente"
        );


    if (mesAnterior) {

        mesAnterior.addEventListener(
            "click",
            () => {

                fechaCalendario.setMonth(
                    fechaCalendario.getMonth() - 1
                );

                cargarCalendario();
            }
        );
    }


    if (mesSiguiente) {

        mesSiguiente.addEventListener(
            "click",
            () => {

                fechaCalendario.setMonth(
                    fechaCalendario.getMonth() + 1
                );

                cargarCalendario();
            }
        );
    }
}


// ============================================================
// NAVEGACIÓN DEL DASHBOARD
// ============================================================

function iniciarNavegacionDashboard() {

    // --------------------------------------------------------
    // INICIO
    // --------------------------------------------------------

    const btnDashboard =
        document.getElementById(
            "btnDashboard"
        );


    if (btnDashboard) {

        btnDashboard.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        );
    }


    // --------------------------------------------------------
    // CALENDARIO
    // --------------------------------------------------------

    const btnCalendario =
        document.getElementById(
            "btnCalendario"
        );


    if (btnCalendario) {

        btnCalendario.addEventListener(
            "click",
            () => {

                const seccion =
                    document.getElementById(
                        "seccionCalendario"
                    );


                if (seccion) {

                    seccion.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }
        );
    }


    // --------------------------------------------------------
    // OPERACIONES
    // --------------------------------------------------------

    const btnProgramaciones =
        document.getElementById(
            "btnProgramaciones"
        );


    if (btnProgramaciones) {

        btnProgramaciones.addEventListener(
            "click",
            () => {

                window.location.href =
                    "index.html";
            }
        );
    }
// --------------------------------------------------------
// LOCOMOTORAS
// --------------------------------------------------------

    const btnLocomotoras =
        document.getElementById(
            "btnLocomotoras"
        );


    if (btnLocomotoras) {

        btnLocomotoras.addEventListener(
            "click",
            () => {

                window.location.href =
                    "servicio-patio.html#locomotoras";
            }
        );
    }

    // --------------------------------------------------------
    // INCIDENCIAS
    // --------------------------------------------------------

    const btnIncidencias =
        document.getElementById(
            "btnIncidencias"
        );


    if (btnIncidencias) {

        btnIncidencias.addEventListener(
            "click",
            () => {

                window.location.href =
                    "incidencias.html";
            }
        );
    }


    // --------------------------------------------------------
    // COMBUSTIBLE
    // --------------------------------------------------------

    const btnCombustible =
        document.getElementById(
            "btnCombustible"
        );


    if (btnCombustible) {

        btnCombustible.addEventListener(
            "click",
            () => {

                window.location.href =
                    "combustible.html";
            }
        );
    }


    // --------------------------------------------------------
    // COSTOS
    // --------------------------------------------------------

    const btnCostos =
        document.getElementById(
            "btnCostos"
        );


    if (btnCostos) {

        btnCostos.addEventListener(
            "click",
            () => {

                window.location.href =
                    "costos.html";
            }
        );
    }
}


// ============================================================
// FILTROS DEL DASHBOARD
// ============================================================

function iniciarFiltrosDashboard() {

    const filtroHoy =
        document.getElementById(
            "filtroHoy"
        );


    const filtroSemana =
        document.getElementById(
            "filtroSemana"
        );


    const filtroMes =
        document.getElementById(
            "filtroMes"
        );


    const filtroTodo =
        document.getElementById(
            "filtroTodo"
        );


    if (
        !filtroHoy ||
        !filtroSemana ||
        !filtroMes ||
        !filtroTodo
    ) {

        console.warn(
            "No se encontraron todos los filtros del dashboard."
        );

        return;
    }


    // --------------------------------------------------------
    // HOY
    // --------------------------------------------------------

    filtroHoy.addEventListener(
        "click",
        () => {

            filtroActual =
                "hoy";

            activarFiltro(
                filtroHoy
            );

            actualizarDashboard();
        }
    );


    // --------------------------------------------------------
    // SEMANA
    // --------------------------------------------------------

    filtroSemana.addEventListener(
        "click",
        () => {

            filtroActual =
                "semana";

            activarFiltro(
                filtroSemana
            );

            actualizarDashboard();
        }
    );


    // --------------------------------------------------------
    // MES
    // --------------------------------------------------------

    filtroMes.addEventListener(
        "click",
        () => {

            filtroActual =
                "mes";

            activarFiltro(
                filtroMes
            );

            actualizarDashboard();
        }
    );


    // --------------------------------------------------------
    // TODO
    // --------------------------------------------------------

    filtroTodo.addEventListener(
        "click",
        () => {

            filtroActual =
                "todo";

            activarFiltro(
                filtroTodo
            );

            actualizarDashboard();
        }
    );


    activarFiltro(
        filtroHoy
    );
}


// ============================================================
// ACTUALIZAR DASHBOARD
// ============================================================

function actualizarDashboard() {

    cargarResumen();

    cargarProximasSalidas();

    cargarIncidencias();

    cargarCombustible();

    cargarCostosDemora();

    cargarCostoTotal();

    cargarGraficaCostos();
}


// ============================================================
// ACTIVAR FILTRO
// ============================================================

function activarFiltro(
    botonActivo
) {

    if (!botonActivo) return;


    const botones =
        document.querySelectorAll(
            ".filtro-opciones button"
        );


    botones.forEach(
        boton => {

            boton.classList.remove(
                "filtro-activo"
            );
        }
    );


    botonActivo.classList.add(
        "filtro-activo"
    );
}


// ============================================================
// FORMATEAR HORA
// ============================================================

function formatearHora(
    hora
) {

    if (!hora) {
        return "--:--";
    }


    return String(
        hora
    ).substring(
        0,
        5
    );
}


// ============================================================
// FORMATEAR FECHA CORTA
// ============================================================

function formatearFechaCorta(
    fecha
) {

    if (!fecha) {
        return "--/--/----";
    }


    const partes =
        String(
            fecha
        ).split("-");


    if (
        partes.length !== 3
    ) {

        return fecha;
    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


// ============================================================
// FORMATEAR FECHA LARGA
// ============================================================

function formatearFechaLarga(
    fecha
) {

    if (!fecha) return "";


    const partes =
        String(
            fecha
        ).split("-");


    if (
        partes.length !== 3
    ) {

        return fecha;
    }


    const fechaObjeto =
        new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2])
        );


    return fechaObjeto.toLocaleDateString(
        "es-MX",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


// ============================================================
// FORMATEAR MONEDA
// ============================================================

function formatearMoneda(
    valor
) {

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


// ============================================================
// PROTECCIÓN HTML
// ============================================================

function escapeHTML(
    valor
) {

    return String(
        valor ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
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