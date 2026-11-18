
/* ============================================================
   SUPABASE
============================================================ */

let programacionEditando = null;
let recepcionEditando = null;
let equipoEditando = { tabla: null, id: null };

const elemento = id => document.getElementById(id);
const valor = id => elemento(id)?.value ?? "";

function establecerValor(id, v) {
    const e = elemento(id);
    if (e) e.value = v ?? "";
}

function numero(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}

function escaparHTML(v) {
    return String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatearFecha(f) {
    if (!f) return "";
    const p = String(f).split("-");
    return p.length === 3
        ? `${p[2]}/${p[1]}/${p[0]}`
        : f;
}

function formatearNumero(v) {
    const n = Number(v);

    return Number.isFinite(n)
        ? n.toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
        : "0.00";
}

function mostrarMensaje(id, texto, tipo = "normal") {
    const e = elemento(id);

    if (!e) return;

    e.textContent = texto;

    e.style.color =
        tipo === "error"
            ? "#dc2626"
            : (tipo === "exito" || tipo === "success")
                ? "#059669"
                : "#1f2937";
}

/* ============================================================
   NAVEGACIÓN
============================================================ */

function ocultarSeccionesOperaciones() {
    [
        "seccionProgramaciones",
        "seccionServicioPatio",
        "seccionRecepcion",
        "seccionSalidas",
        "seccionLocomotoras"
    ].forEach(id => {
        const e = elemento(id);
        if (e) {
            e.style.display = "none";
        }
    });
}

function quitarActivoSubpestanas() {
    [
        "tabProgramaciones",
        "tabServicioPatio",
        "tabSalidas",
        "tabRecepcion"
    ].forEach(id => {
        elemento(id)?.classList.remove("activa");
    });
}

function ocultarBotonNuevaOperacion() {
    const e = elemento("btnNueva");
    if (e) {
        e.style.display = "none";
        e.hidden = true;
        e.setAttribute("hidden", "");
    }
}

function mostrarBotonNuevaOperacion() {
    const e = elemento("btnNueva");
    if (e) {
        e.style.display = "inline-block";
        e.hidden = false;
        e.removeAttribute("hidden");
    }
}

function establecerTextoTitulo(t) {
    const e = elemento("tituloFormulario");
    if (e) {
        e.textContent = t;
    }
}

/* ============================================================
   LOCOMOTORAS / CATÁLOGOS MAESTROS
============================================================ */
const catalogosEquipo = {

    locomotoras: {
        tabla: "Locomotoras",
        titulo: "Locomotoras",
        etiqueta: "LOCOMOTORAS",
        idsConteo: ["totalLocomotoras", "conteo_locomotoras", "count_locomotoras", "kpi_locomotoras", "total_locomotoras", "numLocomotoras"],
        tipo: true,
        tbody: "tablaCatalogoLocomotoras"
    },

    gondolas: {
        tabla: "Gondola",
        titulo: "Góndola",
        etiqueta: "GÓNDOLAS",
        idsConteo: ["totalGondolas", "conteo_gondolas", "count_gondolas", "kpi_gondolas", "total_gondolas", "numGondolas"],
        tipo: false,
        tbody: "tablaCatalogoGondola"
    },

    furgones: {
        tabla: "Furgon",
        titulo: "Furgón",
        etiqueta: "FURGONES",
        idsConteo: ["totalFurgones", "conteo_furgones", "count_furgones", "kpi_furgones", "total_furgones", "numFurgones"],
        tipo: false,
        tbody: "tablaCatalogoFurgon"
    },

    carro_tanque: {
        tabla: "CarroTanque",
        titulo: "Carro Tanque",
        etiqueta: "CARRO TANQUE",
        idsConteo: ["totalCarroTanque", "conteo_carro_tanque", "count_carro_tanque", "kpi_carro_tanque", "total_carro_tanque", "numCarroTanque"],
        tipo: false,
        tbody: "tablaCatalogoCarroTanque"
    },

    tolvas: {
        tabla: "Tolva",
        titulo: "Tolva",
        etiqueta: "TOLVAS",
        idsConteo: ["totalTolvas", "conteo_tolvas", "count_tolvas", "kpi_tolvas", "total_tolvas", "numTolvas"],
        tipo: false,
        tbody: "tablaCatalogoTolva"
    },

    plataformas_intermodales: {
        tabla: "plataforma_intermodal", 
        titulo: "Plataforma Intermodal",
        etiqueta: "PLATAFORMAS",
        idsConteo: ["totalPlataformas", "conteo_plataformas", "count_plataformas", "kpi_plataformas", "total_plataformas", "conteo_plataformas_intermodales", "numPlataformas"],
        tipo: false,
        tbody: "tablaCatalogoPlataformas_intermodales"
    }

};

// Función que busca la tarjeta superior y actualiza el número
function actualizarConteoTarjeta(cfg, cantidad) {
    // 1. Intenta por ID directo si existe en el HTML
    for (const id of cfg.idsConteo) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = cantidad;
            return;
        }
    }

    // 2. Busca por el texto del título de la tarjeta (ej. "LOCOMOTORAS", "GÓNDOLAS")
    const normalizar = txt => txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
    const buscado = normalizar(cfg.etiqueta);

    const todos = document.querySelectorAll("div, span, p, h2, h3, h4, h5, strong, small");
    for (const el of todos) {
        if (el.children.length === 0 && normalizar(el.textContent) === buscado) {
            // Si tiene un elemento hermano justo debajo (donde está el 0), lo actualiza
            if (el.nextElementSibling) {
                el.nextElementSibling.textContent = cantidad;
                return;
            }
            // O busca dentro del contenedor padre de la tarjeta el elemento que tiene el número
            const tarjeta = el.parentElement;
            if (tarjeta) {
                for (const hijo of tarjeta.children) {
                    if (hijo !== el && /^\d+$/.test(hijo.textContent.trim())) {
                        hijo.textContent = cantidad;
                        return;
                    }
                }
            }
        }
    }
}

/* ============================================================
   CARGAR CATÁLOGOS
============================================================ */

async function cargarCatalogoEquipo(clave) {

    const cfg = catalogosEquipo[clave];

    if (!cfg) return;

    const tbody = elemento(cfg.tbody);

    if (!tbody) return;

    const { data, error } =
        await supabaseClient
            .from(cfg.tabla)
            .select("*")
            .order("numero", { ascending: true });

    if (error) {

        console.error(
            "Error catálogo",
            cfg.tabla,
            error
        );

        actualizarConteoTarjeta(cfg, 0);

        tbody.innerHTML =
            `<tr>
                <td colspan="${cfg.tipo ? 4 : 3}">
                    Error al cargar registros.
                </td>
            </tr>`;

        return;
    }

    const total = data ? data.length : 0;
    actualizarConteoTarjeta(cfg, total);

    if (!total) {

        tbody.innerHTML =
            `<tr>
                <td colspan="${cfg.tipo ? 4 : 3}">
                    No hay registros.
                </td>
            </tr>`;

        return;
    }

    tbody.innerHTML = data.map(r => {

        if (cfg.tipo) {

            return `
                <tr>

                    <td>
                        ${escaparHTML(r.locomotora)}
                    </td>

                    <td>
                        ${escaparHTML(r.inicial || "TMY")}
                    </td>

                    <td>
                        <strong>
                            ${escaparHTML(r.numero)}
                        </strong>
                    </td>

                    <td>

                        <button
                            type="button"
                            class="loc-btn-editar"
                            onclick="editarEquipo('${clave}',${r.id})">
                            ✏️
                        </button>

                        <button
                            type="button"
                            class="loc-btn-eliminar"
                            onclick="eliminarEquipo('${clave}',${r.id})">
                            🗑️
                        </button>

                    </td>

                </tr>
            `;

        }

        return `
            <tr>

                <td>
                    ${escaparHTML(r.inicial || "TMY")}
                </td>

                <td>
                    <strong>
                        ${escaparHTML(r.numero)}
                    </strong>
                </td>

                <td>

                    <button
                        type="button"
                        class="loc-btn-editar"
                        onclick="editarEquipo('${clave}',${r.id})">
                        ✏️
                    </button>

                    <button
                        type="button"
                        class="loc-btn-eliminar"
                        onclick="eliminarEquipo('${clave}',${r.id})">
                        🗑️
                    </button>

                </td>

            </tr>
        `;

    }).join("");

}

/* ============================================================
   CARGAR TODOS LOS CATÁLOGOS
============================================================ */

async function cargarTodosCatalogos() {

    await Promise.all(
        Object.keys(catalogosEquipo)
            .map(cargarCatalogoEquipo)
    );

    await cargarLocomotorasMaestras();

}


/* ============================================================
   ABRIR HOJA DE CATÁLOGO
============================================================ */

function abrirHojaEquipo(clave) {

    const f =
        elemento(`formCatalogo_${clave}`);

    if (!f) return;

    limpiarFormularioEquipo(clave);

    f.style.display = "block";

    elemento(
        `btnAbrirCatalogo_${clave}`
    )?.classList.add("activo");

}


/* ============================================================
   CERRAR HOJA
============================================================ */

function cerrarHojaEquipo(clave) {

    const f =
        elemento(`formCatalogo_${clave}`);

    if (f) {
        f.style.display = "none";
    }

    equipoEditando = {
        tabla: null,
        id: null
    };

}


/* ============================================================
   LIMPIAR FORMULARIO DE CATÁLOGO
============================================================ */

function limpiarFormularioEquipo(clave) {

    establecerValor(
        `equipo_inicial_${clave}`,
        "TMY"
    );

    establecerValor(
        `equipo_numero_${clave}`,
        ""
    );

    const t =
        elemento(`equipo_tipo_${clave}`);

    if (t) {
        t.value = "Camino";
    }

    equipoEditando = {
        tabla: null,
        id: null
    };

    const b =
        elemento(`btnGuardarEquipo_${clave}`);

    if (b) {
        b.textContent = "💾 Guardar";
    }

    mostrarMensaje(
        `mensajeEquipo_${clave}`,
        ""
    );

}


/* ============================================================
   GUARDAR EQUIPO
============================================================ */

async function guardarEquipo(clave) {

    const cfg = catalogosEquipo[clave];
    if (!cfg) return;

    const botonGuardar = document.getElementById(`btnGuardarEquipo_${clave}`);
    if (botonGuardar) {
        botonGuardar.disabled = true;
        botonGuardar.textContent = "⏳ Guardando...";
    }

    try {
        const inicial = (valor(`equipo_inicial_${clave}`) || "TMY").trim() || "TMY";
        const numeroEquipo = valor(`equipo_numero_${clave}`).trim();
        const tipo = cfg.tipo ? valor(`equipo_tipo_${clave}`) : null;

        if (!numeroEquipo) {
            mostrarMensaje(`mensajeEquipo_${clave}`, "Captura el número.", "error");
            return;
        }

        const datos = { inicial, numero: numeroEquipo };
        if (cfg.tipo) {
            datos.locomotora = tipo;
        }

        let q;

        if (equipoEditando.tabla === cfg.tabla && equipoEditando.id) {
            q = await supabaseClient
                .from(cfg.tabla)
                .update(datos)
                .eq("id", equipoEditando.id);
        } else {
            q = await supabaseClient
                .from(cfg.tabla)
                .insert([datos]);
        }

        if (q.error) {
            console.error(q.error);
            mostrarMensaje(`mensajeEquipo_${clave}`, "No se pudo guardar: " + q.error.message, "error");
            return;
        }

        mostrarMensaje(
            `mensajeEquipo_${clave}`,
            equipoEditando.id ? "Registro actualizado correctamente." : "Registro guardado correctamente.",
            "exito"
        );

        limpiarFormularioEquipo(clave);
        await cargarCatalogoEquipo(clave);
        await cargarLocomotorasMaestras();

    } finally {
        if (botonGuardar) {
            botonGuardar.disabled = false;
            if (!equipoEditando.id) {
                botonGuardar.textContent = "💾 Guardar";
            } else {
                botonGuardar.textContent = "💾 Actualizar";
            }
        }
    }
}


/* ============================================================
   EDITAR EQUIPO
============================================================ */

async function editarEquipo(clave, id) {

    const cfg =
        catalogosEquipo[clave];

    if (!cfg) return;

    const {
        data,
        error
    } =
        await supabaseClient
            .from(cfg.tabla)
            .select("*")
            .eq("id", id)
            .single();

    if (error || !data) {

        mostrarMensaje(
            `mensajeEquipo_${clave}`,
            "No se pudo cargar el registro.",
            "error"
        );

        return;
    }

    equipoEditando = {
        tabla: cfg.tabla,
        id
    };

    establecerValor(
        `equipo_inicial_${clave}`,
        data.inicial || "TMY"
    );

    establecerValor(
        `equipo_numero_${clave}`,
        data.numero || ""
    );

    if (cfg.tipo) {

        establecerValor(
            `equipo_tipo_${clave}`,
            data.locomotora || "Camino"
        );

    }

    elemento(
        `formCatalogo_${clave}`
    ).style.display = "block";

    const b =
        elemento(`btnGuardarEquipo_${clave}`);

    if (b) {
        b.textContent = "💾 Actualizar";
    }

    elemento(
        `formCatalogo_${clave}`
    ).scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* ============================================================
   ELIMINAR EQUIPO
============================================================ */

async function eliminarEquipo(clave, id) {

    const cfg =
        catalogosEquipo[clave];

    if (
        !cfg ||
        !confirm("¿Deseas eliminar este registro?")
    ) {
        return;
    }

    const { error } =
        await supabaseClient
            .from(cfg.tabla)
            .delete()
            .eq("id", id);

    if (error) {

        mostrarMensaje(
            `mensajeEquipo_${clave}`,
            "No se pudo eliminar: " +
            error.message,
            "error"
        );

        return;
    }

    mostrarMensaje(
        `mensajeEquipo_${clave}`,
        "Registro eliminado correctamente.",
        "exito"
    );

    await cargarCatalogoEquipo(clave);

    await cargarLocomotorasMaestras();

}


/* ============================================================
   CARGAR LOCOMOTORAS EN DESPLEGABLES
============================================================ */

async function cargarLocomotorasMaestras() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("Locomotoras")
            .select(
                "id,locomotora,inicial,numero"
            )
            .order(
                "numero",
                { ascending: true }
            );

    if (error) {

        console.error(
            "Error cargando locomotoras maestras",
            error
        );

        return;
    }

    const lista = data || [];

    const opciones =
        `<option value="">
            Seleccionar locomotora
        </option>`
        +
        lista.map(r => {

            return `
                <option value="${escaparHTML(
                    r.inicial + " " + r.numero
                )}">
                    ${escaparHTML(
                        r.locomotora +
                        " - " +
                        r.inicial +
                        " " +
                        r.numero
                    )}
                </option>
            `;

        }).join("");

    [
        "no_locomotora",
        "patio_locomotora",
        "salida_locomotora"
    ].forEach(id => {

        const s = elemento(id);

        if (!s) return;

        const actual = s.value;

        s.innerHTML = opciones;

        if (
            actual &&
            [...s.options].some(
                o => o.value === actual
            )
        ) {
            s.value = actual;
        }

    });

}


/* ============================================================
   MOSTRAR LOCOMOTORAS
============================================================ */

function mostrarLocomotoras() {

    mostrarModuloPrincipal("locomotoras");

    cargarTodosCatalogos();

}


/* ============================================================
   SERVICIO DE PATIO
============================================================ */

async function cargarServiciosPatio() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("servicio_patio")
            .select("*")
            .order(
                "fecha",
                { ascending: false }
            )
            .order(
                "hora_inicio",
                { ascending: false }
            );

    if (error) {

        console.error(error);

        mostrarMensaje(
            "contenedorMensajeServicioPatio",
            "Error al cargar servicios de patio.",
            "error"
        );

        return;
    }

    mostrarServiciosPatio(data || []);

    actualizarResumenPatio(data || []);

}


function mostrarServiciosPatio(servicios) {

    const tbody =
        elemento("tablaServiciosPatioBody");

    if (!tbody) return;

    if (!servicios.length) {

        tbody.innerHTML =
            `<tr>
                <td colspan="12">
                    No hay servicios registrados.
                </td>
            </tr>`;

        return;
    }

    tbody.innerHTML =
        servicios.map(s => {

            return `
                <tr>

                    <td>
                        ${escaparHTML(s.fecha || "")}
                    </td>

                    <td>
                        ${escaparHTML(s.locomotora || "")}
                    </td>

                    <td>
                        ${escaparHTML(s.empresa || "")}
                    </td>

                    <td>
                        ${escaparHTML(
                            s.conductor_maquinista || ""
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            s.tipo_operacion || ""
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            s.tipo_mercancia || ""
                        )}
                    </td>

                    <td>
                        ${numero(s.cantidad_carros)}
                    </td>

                    <td>
                        ${numero(s.toneladas)}
                    </td>

                    <td>
                        ${escaparHTML(
                            s.patio_destino || ""
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            s.responsable || ""
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            s.estado || ""
                        )}
                    </td>

                    <td>
                        ✏️ 🗑️
                    </td>

                </tr>
            `;

        }).join("");

}


function actualizarResumenPatio(servicios) {

    elemento("patio_total_realizados") &&
        (
            elemento("patio_total_realizados").textContent =
                servicios.filter(
                    s =>
                        String(s.estado || "")
                            .toLowerCase() ===
                        "realizado"
                ).length
        );

    elemento("patio_total_curso") &&
        (
            elemento("patio_total_curso").textContent =
                servicios.filter(
                    s =>
                        String(s.estado || "")
                            .toLowerCase() ===
                        "en curso"
                ).length
        );

    elemento("patio_total_pendientes") &&
        (
            elemento("patio_total_pendientes").textContent =
                servicios.filter(
                    s =>
                        String(s.estado || "")
                            .toLowerCase() ===
                        "pendiente"
                ).length
        );

    elemento("patio_tiempo_promedio") &&
        (
            elemento("patio_tiempo_promedio").textContent =
                "0 min"
        );

}


async function guardarServicioPatio(event) {

    event?.preventDefault();

    const datos = {

        fecha:
            valor("patio_fecha"),

        locomotora:
            valor("patio_locomotora"),

        hora_inicio:
            valor("patio_hora_inicio"),

        empresa:
            valor("patio_empresa"),

        conductor_maquinista:
            valor("patio_maquinista"),

        tipo_operacion:
            valor("patio_tipo_operacion"),

        tipo_mercancia:
            valor("patio_mercancia") || null,

        cantidad_carros:
            numero(valor("patio_carros")),

        toneladas:
            numero(valor("patio_toneladas")),

        patio_destino:
            valor("patio_destino"),

        responsable:
            valor("patio_responsable"),

        estado:
            valor("patio_estado"),

        observaciones:
            valor("patio_observaciones") || null

    };

    if (
        !datos.fecha ||
        !datos.locomotora ||
        !datos.hora_inicio ||
        !datos.empresa ||
        !datos.conductor_maquinista ||
        !datos.tipo_operacion ||
        !datos.patio_destino ||
        !datos.responsable ||
        !datos.estado
    ) {

        mostrarMensaje(
            "contenedorMensajeServicioPatio",
            "Completa los campos obligatorios.",
            "error"
        );

        return;
    }

    const { error } =
        await supabaseClient
            .from("servicio_patio")
            .insert([datos]);

    if (error) {

        console.error(error);

        mostrarMensaje(
            "contenedorMensajeServicioPatio",
            "No se pudo guardar: " +
            error.message,
            "error"
        );

        return;
    }

    mostrarMensaje(
        "contenedorMensajeServicioPatio",
        "Servicio de Patio guardado correctamente.",
        "exito"
    );

    elemento("formServicioPatio")?.reset();

    await cargarServiciosPatio();

    await cargarLocomotorasMaestras();

}


function mostrarServicioPatio() {

    ocultarSeccionesOperaciones();

    elemento("seccionServicioPatio") &&
        (
            elemento("seccionServicioPatio").style.display =
                "block"
        );

    quitarActivoSubpestanas();

    elemento("tabServicioPatio")
        ?.classList.add("activa");

    ocultarBotonNuevaOperacion();

    cargarServiciosPatio();

    cargarLocomotorasMaestras();

}


/* ============================================================
   OPERACIONES
============================================================ */

function sincronizarDatosCarga() {

    establecerValor(
        "fecha_carga",
        valor("fecha")
    );

    establecerValor(
        "no_locomotora_carga",
        valor("no_locomotora")
    );

}


function actualizarTotalCargamento() {

    const ids = [

        "furgon_toneladas",
        "tolva_toneladas",
        "plataforma_toneladas",
        "gondola_toneladas",
        "carrotanque_toneladas"

    ];

    const total =
        ids.reduce(
            (a, id) =>
                a + numero(valor(id)),
            0
        );

    establecerValor(
        "total_toneladas",
        total.toFixed(2)
    );

    establecerValor(
        "tonelaje",
        total.toFixed(2)
    );

}


function obtenerDatosDistribucion() {

    return {

        fecha:
            valor("fecha_carga") ||
            valor("fecha"),

        no_locomotora:
            valor("no_locomotora_carga") ||
            valor("no_locomotora"),

        furgon_serie:
            valor("furgon_serie").trim(),

        furgon_toneladas:
            numero(valor("furgon_toneladas")),

        tolva_serie:
            valor("tolva_serie").trim(),

        tolva_toneladas:
            numero(valor("tolva_toneladas")),

        plataforma_serie:
            valor("plataforma_serie").trim(),

        plataforma_toneladas:
            numero(valor("plataforma_toneladas")),

        gondola_serie:
            valor("gondola_serie").trim(),

        gondola_toneladas:
            numero(valor("gondola_toneladas")),

        carrotanque_serie:
            valor("carrotanque_serie").trim(),

        carrotanque_toneladas:
            numero(valor("carrotanque_toneladas")),

        total_toneladas:
            numero(valor("total_toneladas"))

    };

}


function validarDistribucion(d) {

    const tipos = [

        {
            n: "Furgón",
            s: d.furgon_serie,
            t: d.furgon_toneladas
        },

        {
            n: "Tolva",
            s: d.tolva_serie,
            t: d.tolva_toneladas
        },

        {
            n: "Plataforma multimodal",
            s: d.plataforma_serie,
            t: d.plataforma_toneladas
        },

        {
            n: "Góndola",
            s: d.gondola_serie,
            t: d.gondola_toneladas
        },

        {
            n: "Carrotanque",
            s: d.carrotanque_serie,
            t: d.carrotanque_toneladas
        }

    ];

    for (const t of tipos) {

        if (t.s && !t.t) {

            mostrarMensaje(
                "mensaje",
                `El ${t.n} tiene número de serie, pero no tiene toneladas.`,
                "error"
            );

            return false;
        }

        if (!t.s && t.t) {

            mostrarMensaje(
                "mensaje",
                `El ${t.n} tiene toneladas, pero falta el número de serie.`,
                "error"
            );

            return false;
        }

    }

    return true;

}


async function guardarDistribucion(id, d) {

    const hay =
        Object.keys(d).some(
            k =>
                k.endsWith("_serie") &&
                d[k]
        )
        ||
        [
            "furgon_toneladas",
            "tolva_toneladas",
            "plataforma_toneladas",
            "gondola_toneladas",
            "carrotanque_toneladas"
        ].some(
            k => d[k] > 0
        );

    const {
        data: ex,
        error: eq
    } =
        await supabaseClient
            .from("DistribucionCargamento")
            .select("id")
            .eq("programacion_id", id)
            .order(
                "id",
                { ascending: true }
            );

    if (eq) throw eq;

    if (!hay) {

        if (ex?.length) {

            await supabaseClient
                .from("DistribucionCargamento")
                .delete()
                .in(
                    "id",
                    ex.map(x => x.id)
                );

        }

        return;
    }

    const datos = {
        programacion_id: id,
        ...d
    };

    if (ex?.length) {

        const { error } =
            await supabaseClient
                .from("DistribucionCargamento")
                .update(d)
                .eq("id", ex[0].id);

        if (error) throw error;

        if (ex.length > 1) {

            await supabaseClient
                .from("DistribucionCargamento")
                .delete()
                .in(
                    "id",
                    ex.slice(1).map(x => x.id)
                );

        }

    } else {

        const { error } =
            await supabaseClient
                .from("DistribucionCargamento")
                .insert([datos]);

        if (error) throw error;

    }

}


/* ============================================================
   GUARDAR OPERACIÓN
============================================================ */

async function guardarProgramacion() {

    mostrarMensaje(
        "mensaje",
        "Guardando operación..."
    );

    const datos = {

        fecha:
            valor("fecha"),

        no_locomotora:
            valor("no_locomotora").trim(),

        origen:
            valor("origen"),

        destino:
            valor("destino"),

        hora_salida:
            valor("hora_salida"),

        hora_llegada:
            valor("hora_llegada"),

        combustible_estimado:
            valor("combustible_estimado")
                ? numero(valor("combustible_estimado"))
                : null,

        personal:
            valor("personal") || null,

        tonelaje:
            numero(valor("tonelaje")),

        precio_combustible:
            valor("precio_combustible")
                ? numero(valor("precio_combustible"))
                : null,

        estatus:
            valor("estatus") ||
            "Programado",

        observaciones:
            valor("observaciones")
                .trim() || null

    };

    if (
        !datos.fecha ||
        !datos.no_locomotora ||
        !datos.origen ||
        !datos.destino ||
        !datos.hora_salida ||
        !datos.hora_llegada
    ) {

        mostrarMensaje(
            "mensaje",
            "Completa los campos obligatorios.",
            "error"
        );

        return;
    }

    // Validación temporal antes de enviar a Supabase
const horaSalida = valor("hora_salida");
const horaLlegada = valor("hora_llegada");

if (horaSalida && horaLlegada && horaLlegada <= horaSalida) {
    mostrarMensaje("mensaje", "⚠️ La hora de llegada debe ser estrictamente posterior a la hora de salida.", "error");
    return; // Detiene el envío de la operación
}
    sincronizarDatosCarga();

    actualizarTotalCargamento();

    const d =
        obtenerDatosDistribucion();

    if (!validarDistribucion(d)) {
        return;
    }

    let id = programacionEditando;

    let error;

    if (id) {

        ({ error } =
            await supabaseClient
                .from("Programaciones")
                .update(datos)
                .eq("id", id));

    } else {

        const r =
            await supabaseClient
                .from("Programaciones")
                .insert([datos])
                .select("id")
                .single();

        error = r.error;

        if (!error) {
            id = r.data.id;
        }

    }

    if (error) {

        mostrarMensaje(
            "mensaje",
            "Error al guardar: " +
            error.message,
            "error"
        );

        return;
    }

    try {

        await guardarDistribucion(
            id,
            d
        );

    } catch (e) {

        mostrarMensaje(
            "mensaje",
            "La operación se guardó, pero hubo un error en la distribución: " +
            e.message,
            "error"
        );

        return;
    }

    mostrarMensaje(
        "mensaje",
        "Operación guardada correctamente.",
        "exito"
    );

    programacionEditando = null;

    limpiarFormulario();

    await cargarProgramaciones();

    await cargarDistribuciones();

    await cargarProgramacionesRecepcion();

    setTimeout(() => {

        elemento("formularioSeccion") &&
            (
                elemento("formularioSeccion").style.display =
                    "none"
            );

    }, 500);

}


/* ============================================================
   CARGAR PROGRAMACIONES
============================================================ */

async function cargarProgramaciones() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("Programaciones")
            .select("*")
            .order(
                "fecha",
                { ascending: false }
            )
            .order(
                "hora_salida",
                { ascending: true }
            );

    if (error) {

        console.error(error);

        mostrarMensaje(
            "mensaje",
            "No se pudieron cargar las operaciones: " +
            error.message,
            "error"
        );

        return;
    }

    mostrarProgramaciones(
        data || []
    );

}


function mostrarProgramaciones(lista) {

    const tbody =
        elemento("tablaProgramaciones");

    if (!tbody) return;

    const b =
        valor("buscar")
            .toLowerCase()
            .trim();

    const f =
        valor("filtroFecha");

    const a =
        lista.filter(p => {

            return (
                (
                    !b ||
                    `${p.no_locomotora || p.tren || ""} ${p.origen || ""} ${p.destino || ""}`
                        .toLowerCase()
                        .includes(b)
                )
                &&
                (
                    !f ||
                    p.fecha === f
                )
            );

        });

    if (!a.length) {

        tbody.innerHTML =
            `<tr>
                <td colspan="9">
                    No hay operaciones registradas.
                </td>
            </tr>`;

        return;
    }

    tbody.innerHTML =
        a.map(p => {

            return `
                <tr
                    data-programacion-id="${p.id}"
                >

                    <td>
                        ${formatearFecha(p.fecha)}
                    </td>

                    <td>
                        <strong>
                            ${escaparHTML(
                                p.no_locomotora ||
                                p.tren ||
                                ""
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escaparHTML(
                            p.origen || ""
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            p.destino || ""
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            p.hora_salida || ""
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            p.hora_llegada || ""
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            p.personal || ""
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            p.estatus ||
                            "Programado"
                        )}
                    </td>

                    <td>

                        <div class="acciones-tabla">

                            <button
                                class="btn-ver-carga boton-carga"
                                onclick="verDistribucion(${p.id})">
                                📦 Carga
                            </button>

                            <button
                                class="btn-editar"
                                onclick="editarProgramacion(${p.id})">
                                ✏️
                            </button>

                            <button
                                class="btn-eliminar"
                                onclick="eliminarProgramacion(${p.id})">
                                🗑️
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");

}


function filtrarProgramaciones() {

    cargarProgramaciones();

}
/* ============================================================
   PANTALLA DE CARGA - CIERRE SUAVE
============================================================ */

function ocultarPantallaCarga() {
    const loader = document.getElementById("pantallaCarga");
    if (loader) {
        loader.classList.add("oculta");
        loader.style.setProperty("opacity", "0", "important");
        loader.style.setProperty("pointer-events", "none", "important");

        setTimeout(() => {
            loader.style.setProperty("display", "none", "important");
            loader.style.setProperty("visibility", "hidden", "important");
        }, 500);
    }
}

/* ============================================================
   FUNCIONES GLOBALES
============================================================ */

/* ============================================================
   EDITAR PROGRAMACIÓN
============================================================ */

async function editarProgramacion(id) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("Programaciones")
            .select("*")
            .eq("id", id)
            .single();

    if (error || !data) {

        mostrarMensaje(
            "mensaje",
            "No se pudo cargar la operación.",
            "error"
        );

        return;
    }

    programacionEditando = id;

    establecerValor(
        "fecha",
        data.fecha
    );

    establecerValor(
        "no_locomotora",
        data.no_locomotora ||
        data.tren ||
        ""
    );

    establecerValor(
        "origen",
        data.origen
    );

    establecerValor(
        "destino",
        data.destino
    );

    establecerValor(
        "hora_salida",
        data.hora_salida
    );

    establecerValor(
        "hora_llegada",
        data.hora_llegada
    );

    establecerValor(
        "combustible_estimado",
        data.combustible_estimado
    );

    establecerValor(
        "personal",
        data.personal
    );

    establecerValor(
        "tonelaje",
        data.tonelaje
    );

    establecerValor(
        "precio_combustible",
        data.precio_combustible
    );

    establecerValor(
        "estatus",
        data.estatus ||
        "Programado"
    );

    establecerValor(
        "observaciones",
        data.observaciones ||
        ""
    );

    const {
        data: d
    } =
        await supabaseClient
            .from("DistribucionCargamento")
            .select("*")
            .eq(
                "programacion_id",
                id
            )
            .order(
                "id",
                { ascending: true }
            );

    const carga = d?.[0];

    if (carga) {

        establecerValor(
            "fecha_carga",
            carga.fecha
        );

        establecerValor(
            "no_locomotora_carga",
            carga.no_locomotora
        );

        establecerValor(
            "furgon_serie",
            carga.furgon_serie
        );

        establecerValor(
            "furgon_toneladas",
            carga.furgon_toneladas
        );

        establecerValor(
            "tolva_serie",
            carga.tolva_serie
        );

        establecerValor(
            "tolva_toneladas",
            carga.tolva_toneladas
        );

        establecerValor(
            "plataforma_serie",
            carga.plataforma_serie
        );

        establecerValor(
            "plataforma_toneladas",
            carga.plataforma_toneladas
        );

        establecerValor(
            "gondola_serie",
            carga.gondola_serie
        );

        establecerValor(
            "gondola_toneladas",
            carga.gondola_toneladas
        );

        establecerValor(
            "carrotanque_serie",
            carga.carrotanque_serie
        );

        establecerValor(
            "carrotanque_toneladas",
            carga.carrotanque_toneladas
        );

        establecerValor(
            "total_toneladas",
            carga.total_toneladas
        );

    } else {

        sincronizarDatosCarga();

    }

    actualizarTotalCargamento();

    establecerTextoTitulo(
        "✏️ Editar Operación"
    );

    elemento("formularioSeccion") &&
        (
            elemento("formularioSeccion").style.display =
                "block"
        );

    elemento("formularioSeccion")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


/* ============================================================
   LIMPIAR FORMULARIO OPERACIÓN
============================================================ */

function limpiarFormulario() {

    const ids = [

        "fecha",
        "no_locomotora",
        "origen",
        "destino",
        "hora_salida",
        "hora_llegada",
        "combustible_estimado",
        "personal",
        "tonelaje",
        "precio_combustible",
        "observaciones",

        "fecha_carga",
        "no_locomotora_carga",

        "furgon_serie",
        "furgon_toneladas",

        "tolva_serie",
        "tolva_toneladas",

        "plataforma_serie",
        "plataforma_toneladas",

        "gondola_serie",
        "gondola_toneladas",

        "carrotanque_serie",
        "carrotanque_toneladas",

        "total_toneladas"

    ];

    ids.forEach(
        id => establecerValor(id, "")
    );

    establecerValor(
        "estatus",
        "Programado"
    );

    programacionEditando = null;

    sincronizarDatosCarga();

    actualizarTotalCargamento();

}


function cancelarFormulario() {

    limpiarFormulario();

    elemento("formularioSeccion") &&
        (
            elemento("formularioSeccion").style.display =
                "none"
        );

}


/* ============================================================
   ELIMINAR PROGRAMACIÓN
============================================================ */

async function eliminarProgramacion(id) {

    if (
        !confirm(
            "¿Deseas eliminar esta operación?"
        )
    ) {
        return;
    }

    await supabaseClient
        .from("DistribucionCargamento")
        .delete()
        .eq(
            "programacion_id",
            id
        );

    const {
        error
    } =
        await supabaseClient
            .from("Programaciones")
            .delete()
            .eq("id", id);

    if (error) {

        mostrarMensaje(
            "mensaje",
            "No se pudo eliminar: " +
            error.message,
            "error"
        );

        return;
    }

    await cargarProgramaciones();

    await cargarDistribuciones();

    await cargarProgramacionesRecepcion();

}


/* ============================================================
   DISTRIBUCIÓN DE CARGAMENTO
============================================================ */

async function cargarDistribuciones() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("DistribucionCargamento")
            .select("*")
            .order(
                "fecha",
                { ascending: false }
            )
            .order(
                "id",
                { ascending: false }
            );

    if (error) {

        console.error(error);

        return;
    }

    mostrarDistribuciones(
        data || []
    );

}


function mostrarDistribuciones(a) {

    const tbody =
        elemento("tablaDistribuciones");

    if (!tbody) return;

    if (!a.length) {

        tbody.innerHTML =
            `<tr>
                <td colspan="9">
                    No hay distribución de cargamento registrada.
                </td>
            </tr>`;

        return;
    }

    tbody.innerHTML =
        a.map(d => {

            return `
                <tr
                    data-programacion-id="${d.programacion_id}"
                >

                    <td>
                        ${formatearFecha(d.fecha)}
                    </td>

                    <td>
                        ${escaparHTML(
                            d.no_locomotora || ""
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            d.furgon_serie || ""
                        )}

                        ${
                            d.furgon_toneladas
                                ? " / " +
                                  formatearNumero(
                                      d.furgon_toneladas
                                  ) +
                                  " t"
                                : ""
                        }
                    </td>

                    <td>
                        ${escaparHTML(
                            d.tolva_serie || ""
                        )}

                        ${
                            d.tolva_toneladas
                                ? " / " +
                                  formatearNumero(
                                      d.tolva_toneladas
                                  ) +
                                  " t"
                                : ""
                        }
                    </td>

                    <td>
                        ${escaparHTML(
                            d.plataforma_serie || ""
                        )}

                        ${
                            d.plataforma_toneladas
                                ? " / " +
                                  formatearNumero(
                                      d.plataforma_toneladas
                                  ) +
                                  " t"
                                : ""
                        }
                    </td>

                    <td>
                        ${escaparHTML(
                            d.gondola_serie || ""
                        )}

                        ${
                            d.gondola_toneladas
                                ? " / " +
                                  formatearNumero(
                                      d.gondola_toneladas
                                  ) +
                                  " t"
                                : ""
                        }
                    </td>

                    <td>
                        ${escaparHTML(
                            d.carrotanque_serie || ""
                        )}

                        ${
                            d.carrotanque_toneladas
                                ? " / " +
                                  formatearNumero(
                                      d.carrotanque_toneladas
                                  ) +
                                  " t"
                                : ""
                        }
                    </td>

                    <td>
                        ${formatearNumero(
                            d.total_toneladas
                        )}
                    </td>

                    <td>

                        <button
                            class="btn-ver-operacion"
                            onclick="irAOperacion(${d.programacion_id})">
                            🚆 Ver operación
                        </button>

                    </td>

                </tr>
            `;

        }).join("");

}


function verDistribucion(id) {

    mostrarOperaciones();

    const f =
        document.querySelector(
            `#tablaDistribuciones tr[data-programacion-id="${id}"]`
        );

    if (f) {

        f.classList.add(
            "fila-carga-seleccionada"
        );

        f.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}


async function irAOperacion(id) {

    mostrarOperaciones();

    establecerValor(
        "buscar",
        ""
    );

    establecerValor(
        "filtroFecha",
        ""
    );

    await cargarProgramaciones();

    const f =
        document.querySelector(
            `#tablaProgramaciones tr[data-programacion-id="${id}"]`
        );

    if (f) {

        f.classList.add(
            "fila-operacion-seleccionada"
        );

        f.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}


function mostrarOperaciones() {

    ocultarSeccionesOperaciones();

    elemento("seccionProgramaciones") &&
        (
            elemento("seccionProgramaciones").style.display =
                "block"
        );

    quitarActivoSubpestanas();

    elemento("tabProgramaciones")
        ?.classList.add("activa");

    mostrarBotonNuevaOperacion();

    cargarProgramaciones();

    cargarDistribuciones();

    cargarLocomotorasMaestras();

}


/* ============================================================
   RECEPCIÓN
============================================================ */

async function cargarProgramacionesRecepcion() {

    const s =
        elemento("programacion_recepcion");

    if (!s) return;

    const {
        data,
        error
    } =
        await supabaseClient
            .from("Programaciones")
            .select(
                "id,fecha,no_locomotora,tren,origen,destino,hora_salida,hora_llegada"
            )
            .order(
                "fecha",
                { ascending: false }
            )
            .order(
                "hora_salida",
                { ascending: true }
            );

    if (error) {

        console.error(error);

        return;
    }

    const actual = s.value;

    s.innerHTML =
        `<option value="">
            Selecciona una operación...
        </option>`;

    (data || []).forEach(p => {

        const o =
            document.createElement("option");

        o.value = p.id;

        o.textContent =
            `${formatearFecha(p.fecha)} | Locomotora ${
                p.no_locomotora ||
                p.tren ||
                ""
            } | ${
                p.origen || ""
            } → ${
                p.destino || ""
            } | ${
                p.hora_salida || ""
            }`;

        o.dataset.fecha =
            p.fecha || "";

        o.dataset.locomotora =
            p.no_locomotora ||
            p.tren ||
            "";

        o.dataset.origen =
            p.origen || "";

        o.dataset.destino =
            p.destino || "";

        s.appendChild(o);

    });

    if (actual) {
        s.value = actual;
    }

}


function cargarDatosOperacionRecepcion() {

    const s =
        elemento("programacion_recepcion");

    if (!s) return;

    const o =
        s.options[s.selectedIndex];

    establecerValor(
        "fecha_recepcion",
        o?.dataset.fecha || ""
    );

    establecerValor(
        "no_locomotora_recepcion",
        o?.dataset.locomotora || ""
    );

    establecerValor(
        "origen_recepcion",
        o?.dataset.origen || ""
    );

    establecerValor(
        "destino_recepcion",
        o?.dataset.destino || ""
    );

}


function calcularPromedioCombustible() {

    const a =
        parseFloat(
            valor("combustible_restante_1")
        );

    const b =
        parseFloat(
            valor("combustible_restante_2")
        );

    const p =
        Number.isFinite(a) &&
        Number.isFinite(b)

            ? ((a + b) / 2).toFixed(2)

            : Number.isFinite(a)

                ? a.toFixed(2)

                : Number.isFinite(b)

                    ? b.toFixed(2)

                    : "";

    establecerValor(
        "promedio_combustible",
        p
    );

}


async function guardarRecepcion() {

    calcularPromedioCombustible();

    const pid =
        valor("programacion_recepcion");

    const fecha =
        valor("fecha_recepcion");

    const hora =
        valor("hora_recepcion");

    const personal =
        valor("personal_recibio")
            .trim();

    if (
        !pid ||
        !fecha ||
        !hora ||
        !personal
    ) {

        mostrarMensaje(
            "mensajeRecepcion",
            "Completa operación, fecha, hora y personal.",
            "error"
        );

        return;
    }

    const datos = {

        programacion_id:
            Number(pid),

        fecha,

        hora,

        fecha_hora_recepcion:
            `${fecha}T${hora}:00`,

        personal_recibio:
            personal,

        no_locomotora:
            valor(
                "no_locomotora_recepcion"
            ) || null,

        origen:
            valor(
                "origen_recepcion"
            ) || null,

        destino:
            valor(
                "destino_recepcion"
            ) || null,

        tren:
            valor(
                "no_locomotora_recepcion"
            ) || null,

        combustible_utilizado:
            valor(
                "combustible_utilizado"
            )
                ? numero(
                    valor(
                        "combustible_utilizado"
                    )
                )
                : null,

        combustible_llegada:
            valor(
                "promedio_combustible"
            )
                ? numero(
                    valor(
                        "promedio_combustible"
                    )
                )
                : null,

        incidencias:
            valor(
                "incidencias_recepcion"
            ) || null,

        responsable:
            valor(
                "responsable_recepcion"
            ) || null,

        combustible_restante_1:
            valor(
                "combustible_restante_1"
            )
                ? numero(
                    valor(
                        "combustible_restante_1"
                    )
                )
                : null,

        combustible_restante_2:
            valor(
                "combustible_restante_2"
            )
                ? numero(
                    valor(
                        "combustible_restante_2"
                    )
                )
                : null,

        promedio_combustible:
            valor(
                "promedio_combustible"
            )
                ? numero(
                    valor(
                        "promedio_combustible"
                    )
                )
                : null,

        estatus:
            valor("estatus_recepcion") ||
            "Recibido",

        observaciones:
            valor(
                "observaciones_recepcion"
            ) || null

    };

    let q;

    if (recepcionEditando) {

        q =
            await supabaseClient
                .from("Recepción")
                .update(datos)
                .eq(
                    "id",
                    recepcionEditando
                );

    } else {

        q =
            await supabaseClient
                .from("Recepción")
                .insert([datos]);

    }

    if (q.error) {

        mostrarMensaje(
            "mensajeRecepcion",
            "Error al guardar: " +
            q.error.message,
            "error"
        );

        return;
    }

    await supabaseClient
        .from("Programaciones")
        .update({
            estatus: datos.estatus
        })
        .eq(
            "id",
            Number(pid)
        );

    mostrarMensaje(
        "mensajeRecepcion",
        "Recepción guardada correctamente.",
        "exito"
    );

    limpiarRecepcion();

    recepcionEditando = null;

    elemento("formularioRecepcion") &&
        (
            elemento("formularioRecepcion").style.display =
                "none"
        );

    await cargarRecepciones();

    await cargarProgramaciones();

    await cargarProgramacionesRecepcion();

}


async function cargarRecepciones() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("Recepción")
            .select("*")
            .order(
                "fecha_hora_recepcion",
                { ascending: false }
            );

    if (error) {

        console.error(error);

        mostrarMensaje(
            "mensajeRecepcion",
            "No se pudieron cargar las recepciones: " +
            error.message,
            "error"
        );

        return;
    }

    mostrarRecepciones(
        data || []
    );

}


function mostrarRecepciones(a) {

    const tbody =
        elemento("tablaRecepciones");

    if (!tbody) return;

    if (!a.length) {

        tbody.innerHTML =
            `<tr>
                <td colspan="12">
                    No hay recepciones registradas.
                </td>
            </tr>`;

        return;
    }

    tbody.innerHTML =
        a.map(r => {

            return `
                <tr>

                    <td>
                        ${formatearFecha(
                            r.fecha ||
                            String(
                                r.fecha_hora_recepcion ||
                                ""
                            ).substring(0, 10)
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            r.hora ||
                            String(
                                r.fecha_hora_recepcion ||
                                ""
                            ).substring(11, 16)
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            r.no_locomotora ||
                            r.tren ||
                            ""
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            r.origen || ""
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            r.destino || ""
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            r.personal_recibio || ""
                        )}
                    </td>

                    <td>
                        ${
                            r.combustible_utilizado != null
                                ? formatearNumero(
                                    r.combustible_utilizado
                                ) + " L"
                                : ""
                        }
                    </td>

                    <td>
                        ${escaparHTML(
                            r.incidencias ||
                            "Sin incidencias"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            r.responsable || ""
                        )}
                    </td>

                    <td>
                        ${
                            r.promedio_combustible != null
                                ? formatearNumero(
                                    r.promedio_combustible
                                ) + " L"
                                : ""
                        }
                    </td>

                    <td>
                        ${escaparHTML(
                            r.estatus || ""
                        )}
                    </td>

                    <td>

                        <button
                            class="btn-editar"
                            onclick="editarRecepcion(${r.id})">
                            ✏️
                        </button>

                        <button
                            class="btn-eliminar"
                            onclick="eliminarRecepcion(${r.id})">
                            🗑️
                        </button>

                    </td>

                </tr>
            `;

        }).join("");

}


async function editarRecepcion(id) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("Recepción")
            .select("*")
            .eq("id", id)
            .single();

    if (error || !data) return;

    recepcionEditando = id;

    [
        "fecha_recepcion",
        "hora_recepcion",
        "programacion_recepcion",
        "no_locomotora_recepcion",
        "origen_recepcion",
        "destino_recepcion",
        "personal_recibio",
        "combustible_utilizado",
        "incidencias_recepcion",
        "responsable_recepcion",
        "combustible_restante_1",
        "combustible_restante_2",
        "promedio_combustible",
        "estatus_recepcion",
        "observaciones_recepcion"
    ].forEach(id2 => {

        establecerValor(
            id2,
            data[
                id2.replace(
                    "_recepcion",
                    ""
                )
            ] ??
            data[id2] ??
            ""
        );

    });

    establecerValor(
        "fecha_recepcion",
        data.fecha ||
        String(
            data.fecha_hora_recepcion ||
            ""
        ).substring(0, 10)
    );

    establecerValor(
        "hora_recepcion",
        data.hora ||
        String(
            data.fecha_hora_recepcion ||
            ""
        ).substring(11, 16)
    );

    establecerValor(
        "programacion_recepcion",
        data.programacion_id
    );

    establecerValor(
        "no_locomotora_recepcion",
        data.no_locomotora ||
        data.tren ||
        ""
    );

    establecerValor(
        "origen_recepcion",
        data.origen || ""
    );

    establecerValor(
        "destino_recepcion",
        data.destino || ""
    );

    establecerValor(
        "personal_recibio",
        data.personal_recibio || ""
    );

    establecerValor(
        "combustible_utilizado",
        data.combustible_utilizado
    );

    establecerValor(
        "incidencias_recepcion",
        data.incidencias || ""
    );

    establecerValor(
        "responsable_recepcion",
        data.responsable || ""
    );

    establecerValor(
        "combustible_restante_1",
        data.combustible_restante_1
    );

    establecerValor(
        "combustible_restante_2",
        data.combustible_restante_2
    );

    establecerValor(
        "promedio_combustible",
        data.promedio_combustible ??
        data.combustible_llegada
    );

    establecerValor(
        "estatus_recepcion",
        data.estatus ||
        "Recibido"
    );

    establecerValor(
        "observaciones_recepcion",
        data.observaciones ||
        ""
    );

    elemento("formularioRecepcion") &&
        (
            elemento("formularioRecepcion").style.display =
                "block"
        );

}


function limpiarRecepcion() {

    [
        "fecha_recepcion",
        "hora_recepcion",
        "programacion_recepcion",
        "no_locomotora_recepcion",
        "origen_recepcion",
        "destino_recepcion",
        "personal_recibio",
        "combustible_utilizado",
        "incidencias_recepcion",
        "responsable_recepcion",
        "combustible_restante_1",
        "combustible_restante_2",
        "promedio_combustible",
        "observaciones_recepcion"
    ].forEach(
        id => establecerValor(id, "")
    );

    establecerValor(
        "estatus_recepcion",
        "Recibido"
    );

    recepcionEditando = null;

}


function cancelarRecepcion() {

    limpiarRecepcion();

    elemento("formularioRecepcion") &&
        (
            elemento("formularioRecepcion").style.display =
                "none"
        );

    mostrarMensaje(
        "mensajeRecepcion",
        ""
    );

}


async function eliminarRecepcion(id) {

    if (
        !confirm(
            "¿Deseas eliminar esta recepción?"
        )
    ) {
        return;
    }

    const {
        data: r
    } =
        await supabaseClient
            .from("Recepción")
            .select("programacion_id")
            .eq("id", id)
            .single();

    const {
        error
    } =
        await supabaseClient
            .from("Recepción")
            .delete()
            .eq("id", id);

    if (error) {

        mostrarMensaje(
            "mensajeRecepcion",
            "No se pudo eliminar: " +
            error.message,
            "error"
        );

        return;
    }

    if (r?.programacion_id) {

        await supabaseClient
            .from("Programaciones")
            .update({
                estatus: "Programado"
            })
            .eq(
                "id",
                r.programacion_id
            );

    }

    await cargarRecepciones();

    await cargarProgramaciones();

}


function mostrarRecepcion() {

    ocultarSeccionesOperaciones();

    elemento("seccionRecepcion") &&
        (
            elemento("seccionRecepcion").style.display =
                "block"
        );

    quitarActivoSubpestanas();

    elemento("tabRecepcion")
        ?.classList.add("activa");

    ocultarBotonNuevaOperacion();

    cargarProgramacionesRecepcion();

    cargarRecepciones();

}


/* ============================================================
   SALIDAS
============================================================ */

function mostrarSalidas() {

    ocultarSeccionesOperaciones();

    elemento("seccionSalidas") &&
        (
            elemento("seccionSalidas").style.display =
                "block"
        );

    quitarActivoSubpestanas();

    elemento("tabSalidas")
        ?.classList.add("activa");

    ocultarBotonNuevaOperacion();

    cargarLocomotorasMaestras();

}


/* ============================================================
   NAVEGACIÓN PRINCIPAL
============================================================ */

function mostrarModuloPrincipal(modulo) {
    const menu = document.getElementById("menuPrincipal") || document.querySelector(".menu-dashboard");
    const sub = document.getElementById("subMenuOperaciones") || document.querySelector(".pestanas");

    if (menu) {
        menu.querySelectorAll(".pestana, button").forEach(t => {
            t.classList.remove("activa", "menu-activo");
        });
    }

    if (modulo === "operaciones") {
        if (menu) menu.style.display = "none";
        if (sub) sub.style.display = "flex";
        
        const tabOp = document.getElementById("tabProgramacionesNav");
        if (tabOp) tabOp.classList.add("menu-activo");

        mostrarOperaciones();
        return;
    }

    if (menu) menu.style.display = "flex";
    if (sub) sub.style.display = "none";

    ocultarSeccionesOperaciones();
    ocultarBotonNuevaOperacion();

    const ids = {
        inicio: "tabInicio",
        calendario: "tabCalendario",
        distribucion: "tabDistribucionPersonal",
        incidencias: "tabIncidencias",
        combustible: "tabCombustible",
        costos: "tabCostos",
        locomotoras: "tabLocomotorasNav"
    };

    const tabActiva = document.getElementById(ids[modulo]);
    if (tabActiva) {
        tabActiva.classList.add("menu-activo");
    }

    if (modulo === "locomotoras") {
        const seccion = document.getElementById("seccionLocomotoras");
        if (seccion) {
            seccion.style.display = "block";
        }
        cargarTodosCatalogos();
    }
}


/* ============================================================
   EVENTOS
============================================================ */

function configurarEventos() {


    elemento(
        "btnNuevaServicioPatio"
    )?.addEventListener(
        "click",
        () => {

            const f =
                elemento(
                    "contenedorFormularioServicioPatio"
                );

            if (f) {

                const o =
                    f.style.display === "none";

                f.style.display =
                    o
                        ? "block"
                        : "none";

                elemento(
                    "btnNuevaServicioPatio"
                ).textContent =
                    o
                        ? "❌ Cerrar hoja"
                        : "➕ Llenar hoja";

            }

        }
    );


    elemento(
        "formServicioPatio"
    )?.addEventListener(
        "submit",
        guardarServicioPatio
    );


    elemento(
        "btnNueva"
    )?.addEventListener(
        "click",
        () => {

            limpiarFormulario();

            establecerTextoTitulo(
                "➕ Nueva Operación"
            );

            elemento(
                "formularioSeccion"
            ) &&
                (
                    elemento(
                        "formularioSeccion"
                    ).style.display =
                        "block"
                );

            sincronizarDatosCarga();

        }
    );


    elemento(
        "btnGuardar"
    )?.addEventListener(
        "click",
        guardarProgramacion
    );

    elemento(
        "btnLimpiar"
    )?.addEventListener(
        "click",
        limpiarFormulario
    );

    elemento(
        "btnCancelar"
    )?.addEventListener(
        "click",
        cancelarFormulario
    );


    elemento(
        "btnActualizar"
    )?.addEventListener(
        "click",
        async () => {

            await cargarProgramaciones();

            await cargarDistribuciones();

        }
    );


    elemento(
        "buscar"
    )?.addEventListener(
        "input",
        filtrarProgramaciones
    );

    elemento(
        "filtroFecha"
    )?.addEventListener(
        "change",
        filtrarProgramaciones
    );


    elemento(
        "fecha"
    )?.addEventListener(
        "change",
        sincronizarDatosCarga
    );

    elemento(
        "no_locomotora"
    )?.addEventListener(
        "change",
        sincronizarDatosCarga
    );


    [
        "furgon_toneladas",
        "tolva_toneladas",
        "plataforma_toneladas",
        "gondola_toneladas",
        "carrotanque_toneladas"
    ].forEach(id => {

        elemento(id)?.addEventListener(
            "input",
            actualizarTotalCargamento
        );

    });


    elemento(
        "tabProgramaciones"
    )?.addEventListener(
        "click",
        mostrarOperaciones
    );

    elemento(
        "tabServicioPatio"
    )?.addEventListener(
        "click",
        mostrarServicioPatio
    );

    elemento(
        "tabSalidas"
    )?.addEventListener(
        "click",
        mostrarSalidas
    );

    elemento(
        "tabRecepcion"
    )?.addEventListener(
        "click",
        mostrarRecepcion
    );


    [
        "tabInicio",
        "tabCalendario",
        "tabDistribucionPersonal",
        "tabIncidencias",
        "tabCombustible",
        "tabCostos"
    ].forEach(id => {

        elemento(id)?.addEventListener(
            "click",
            () =>
                mostrarModuloPrincipal(
                    id
                        .replace("tab", "")
                        .replace(
                            "DistribucionPersonal",
                            "distribucion"
                        )
                        .replace(
                            "Incidencias",
                            "incidencias"
                        )
                        .replace(
                            "Combustible",
                            "combustible"
                        )
                        .replace(
                            "Costos",
                            "costos"
                        )
                        .replace(
                            "Calendario",
                            "calendario"
                        )
                        .replace(
                            "Inicio",
                            "inicio"
                        )
                )
        );

    });


    elemento("tabOperacionesPrincipal")?.addEventListener("click",() => mostrarModuloPrincipal("operaciones"));


    elemento("programacion_recepcion"
)?.addEventListener("change",cargarDatosOperacionRecepcion);


    elemento("combustible_restante_1")?.addEventListener("input",calcularPromedioCombustible);

    elemento("combustible_restante_2")?.addEventListener("input",calcularPromedioCombustible);


    elemento(
        "btnNuevaRecepcion"
    )?.addEventListener(
        "click",
        () => {

            limpiarRecepcion();

            elemento(
                "formularioRecepcion"
            ) &&
                (
                    elemento(
                        "formularioRecepcion"
                    ).style.display =
                        "block"
                );

        }
    );


    elemento(
        "btnGuardarRecepcion"
    )?.addEventListener(
        "click",
        guardarRecepcion
    );

    elemento(
        "btnLimpiarRecepcion"
    )?.addEventListener(
        "click",
        limpiarRecepcion
    );

    elemento(
        "btnCancelarRecepcion"
    )?.addEventListener(
        "click",
        cancelarRecepcion
    );


    Object
        .keys(catalogosEquipo)
        .forEach(k => {

            elemento(
                `btnAbrirCatalogo_${k}`
            )?.addEventListener(
                "click",
                () =>
                    abrirHojaEquipo(k)
            );

            elemento(
                `btnCancelarCatalogo_${k}`
            )?.addEventListener(
                "click",
                () =>
                    cerrarHojaEquipo(k)
            );

            elemento(
                `btnGuardarEquipo_${k}`
            )?.addEventListener(
                "click",
                () =>
                    guardarEquipo(k)
            );

        });


    elemento(
        "btnReintentarConexion"
    )?.addEventListener(
        "click",
        async () => {

            await cargarProgramaciones();

            await cargarDistribuciones();

            await cargarProgramacionesRecepcion();

            await cargarRecepciones();

            await cargarTodosCatalogos();

        }
    );


    window.addEventListener(
        "online",
        ocultarSinConexion
    );

    window.addEventListener(
        "offline",
        mostrarSinConexion
    );

}


/* ============================================================
   SIN CONEXIÓN
============================================================ */

function mostrarSinConexion() {

    elemento(
        "pantallaSinConexion"
    ) &&
        (
            elemento(
                "pantallaSinConexion"
            ).style.display =
                "flex"
        );

}


function ocultarSinConexion() {

    elemento(
        "pantallaSinConexion"
    ) &&
        (
            elemento(
                "pantallaSinConexion"
            ).style.display =
                "none"
        );

}


/* ============================================================
   FUNCIONES GLOBALES
============================================================ */

window.editarProgramacion = editarProgramacion;
window.eliminarProgramacion = eliminarProgramacion;
window.verDistribucion = verDistribucion;
window.irAOperacion = irAOperacion;
window.editarRecepcion = editarRecepcion;
window.eliminarRecepcion = eliminarRecepcion;
window.mostrarSalidas = mostrarSalidas;
window.mostrarOperaciones = mostrarOperaciones;
window.mostrarServicioPatio = mostrarServicioPatio;
window.mostrarRecepcion = mostrarRecepcion;
window.mostrarLocomotoras = mostrarLocomotoras;
window.editarEquipo = editarEquipo;
window.eliminarEquipo = eliminarEquipo;

/* ============================================================
   ARRANQUE AUTOMÁTICO AL CARGAR LA PÁGINA
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
    configurarEventos();

    // Si la página tiene las tablas del catálogo (como en servicio_patio.html), las carga:
    if (document.getElementById("tablaCatalogoLocomotoras")) {
        await cargarTodosCatalogos();
    }

    // Si la página tiene la tabla de servicios de patio, la carga:
    if (document.getElementById("tablaServiciosPatioBody")) {
        await cargarServiciosPatio();
    }

    // Si la página tiene la tabla de programaciones, la carga:
    if (document.getElementById("tablaProgramaciones")) {
        await cargarProgramaciones();
        await cargarDistribuciones();
    }

    ocultarPantallaCarga();
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