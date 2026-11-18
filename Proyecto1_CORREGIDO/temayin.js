// ==========================================================
// ASISTENTE VIRTUAL TEMAYÍN (Widget Inteligente Tipo IA con Datos Reales)
// ==========================================================

(function () {
    console.log("🤖 Inicializando Temayín (Modo IA con Datos Reales)...");

    // Inyectar estilos específicos del widget
    const estiloWidget = document.createElement("style");
    estiloWidget.innerHTML = `
        .temayin-btn-flotante {
            position: fixed;
            bottom: 25px;
            right: 25px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #62a8d0;
            color: #ffffff;
            border: 3px solid #dfb15b;
            box-shadow: 0 6px 18px rgba(18, 50, 60, 0.35);
            cursor: pointer;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s ease;
            outline: none;
            overflow: hidden;
            padding: 0;
        }
        .temayin-btn-flotante:hover {
            transform: scale(1.08);
            box-shadow: 0 8px 24px rgba(128, 124, 124, 0.45);
        }
        .temayin-btn-flotante:active {
            transform: scale(0.95);
        }
        .temayin-btn-flotante img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
            display: block;
        }
        .temayin-ventana {
            position: fixed;
            bottom: 95px;
            right: 25px;
            width: 380px;
            max-width: calc(100vw - 32px);
            height: 520px;
            max-height: calc(100vh - 120px);
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 12px 36px rgba(0,0,0,0.22);
            border: 2px solid #dfb15b;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transform: translateY(15px) scale(0.95);
            transform-origin: bottom right;
            transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s;
        }
        .temayin-ventana.activa {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
        }
        .temayin-header {
            background: linear-gradient(135deg, #123c2a 0%, #167d5a 100%);
            color: #ffffff;
            padding: 14px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #dfb15b;
        }
        .temayin-header-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .temayin-header-avatar {
            width: 38px;
            height: 38px;
            background: rgba(255,255,255,0.15);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid rgba(223, 177, 91, 0.6);
            overflow: hidden;
        }
        .temayin-header-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
            display: block;
        }
        .temayin-header-text h4 {
            margin: 0;
            font-size: 15px;
            font-weight: 600;
            letter-spacing: 0.3px;
        }
        .temayin-header-text span {
            font-size: 11px;
            color: #dfb15b;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .temayin-status-dot {
            width: 7px;
            height: 7px;
            background-color: #54fc00;
            border-radius: 50%;
            display: inline-block;
        }
        .temayin-btn-cerrar {
            background: transparent;
            border: none;
            color: #e2e8f0;
            font-size: 20px;
            width: 30px;
            height: 30px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.15s ease, color 0.15s ease;
        }
        .temayin-btn-cerrar:hover {
            background: rgba(255,255,255,0.15);
            color: #ffffff;
        }
        .temayin-cuerpo {
            flex: 1;
            padding: 14px;
            overflow-y: auto;
            background: #f8faf9;
            font-size: 13px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            scroll-behavior: smooth;
        }
        .temayin-mensaje {
            padding: 10px 14px;
            border-radius: 12px;
            max-width: 86%;
            line-height: 1.45;
            word-break: break-word;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .temayin-bot {
            background: #ffffff;
            color: #123c2a;
            align-self: flex-start;
            border: 2px solid #dfb15b;
            border-top-left-radius: 2px;
        }
        .temayin-usuario {
            background: #123c2a;
            color: #ffffff;
            align-self: flex-end;
            border-top-right-radius: 2px;
        }
        .temayin-sugerencias {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 6px;
        }
        .temayin-chip {
            background: #eef5f3;
            color: #123c2a;
            border: 1px solid #c2dcd2;
            padding: 4px 10px;
            border-radius: 14px;
            font-size: 11px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.15s ease;
            user-select: none;
        }
        .temayin-chip:hover {
            background: #dfb15b;
            color: #123c2a;
            border-color: #d19f3f;
        }
        .temayin-footer {
            padding: 10px 12px;
            background: #ffffff;
            border-top: 1px solid #edf2f0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .temayin-input {
            flex: 1;
            padding: 9px 12px;
            border: 1px solid #d7cccc;
            border-radius: 8px;
            font-size: 13px;
            outline: none;
            transition: border-color 0.2s;
        }
        .temayin-input:focus {
            border-color: #123c2a;
        }
        .temayin-btn-enviar {
            background: #167d5a;
            color: #ffffff;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.15s, transform 0.1s;
        }
        .temayin-btn-enviar:hover {
            background: #123c2a;
        }
        .temayin-btn-enviar:active {
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(estiloWidget);

    const RUTA_LOGO_TEMAYIN = "img/Temayin_Soporte.png";

    // ==========================================================
    // CONSULTA INTELIGENTE DE DATOS REALES CON SUPABASE E IA
    // ==========================================================
    function escaparHTML(valor) {
        const elemento = document.createElement("span");
        elemento.textContent = String(valor ?? "");
        return elemento.innerHTML;
    }

    const temasTemayin = [
        { palabras: ["operacion", "salida", "tren", "origen", "destino"], titulo: "Operaciones", ruta: "index.html", tabla: "Programaciones", campos: "id,fecha,no_locomotora,origen,destino,estatus",
          detalle: r => [r.fecha, r.no_locomotora, r.origen + " → " + r.destino, r.estatus] },
        { palabras: ["incidencia", "falla", "accidente"], titulo: "Incidencias", ruta: "incidencias.html", tabla: "Incidencias", campos: "id,fecha,tipo,descripcion,minutos_demora",
          detalle: r => [r.fecha, r.tipo, r.descripcion, (r.minutos_demora || 0) + " min"] },
        { palabras: ["combustible", "litro", "diesel"], titulo: "Control de combustible", ruta: "combustible.html", tabla: "Combustible", campos: "id,fecha,tren,litros,costo_total",
          detalle: r => [r.fecha, r.tren, r.litros + " L", Number(r.costo_total || 0).toLocaleString("es-MX", {style:"currency", currency:"MXN"})] },
        { palabras: ["costo", "demora", "gasto"], titulo: "Costos por demora", ruta: "costos.html", tabla: "CostosDemora", campos: "id,fecha,minutos_demora,costo_total,motivo",
          detalle: r => [r.fecha, r.motivo, r.minutos_demora + " min", Number(r.costo_total || 0).toLocaleString("es-MX", {style:"currency", currency:"MXN"})] },
        { palabras: ["personal", "empleado", "trabajador", "vacaciones", "permiso"], titulo: "Distribución del personal", ruta: "distribucion_personal.html" },
        { palabras: ["locomotora", "material", "mantenimiento", "vagon"], titulo: "Material rodante", ruta: "servicio-patio.html" },
        { palabras: ["inicio", "resumen", "dashboard", "calendario"], titulo: "Inicio", ruta: "dashboard.html" }
    ];

    function enlaceTema(tema) {
        return '<a class="temayin-chip" style="display:inline-block;margin-top:8px;text-decoration:underline" href="' +
            tema.ruta + '">Abrir ' + tema.titulo + ' →</a>';
    }

    async function consultarDatosRealesSupabase(pregunta) {
        const texto = pregunta.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const tema = temasTemayin.find(t => t.palabras.some(p => texto.includes(p)));
        if (!tema) {
            return "Elige la información que deseas consultar:<br>" +
                temasTemayin.map(enlaceTema).join(" ");
        }
        const enlace = enlaceTema(tema);
        if (/como|registrar|guardar|agregar|donde/.test(texto)) {
            return "Puedes consultar y gestionar esta información en <strong>" + tema.titulo +
                "</strong>. Abre el módulo para utilizar sus formularios y revisar los registros.<br>" + enlace;
        }
        if (!tema.tabla) return "Encontrarás esta información en <strong>" + tema.titulo + "</strong>.<br>" + enlace;
        const cliente = window.supabaseClient ||
            (typeof supabaseClient !== "undefined" ? supabaseClient : null);
        if (!cliente) return "La conexión a los registros no está disponible. Puedes abrir el módulo.<br>" + enlace;
        try {
            const {data, error} = await cliente.from(tema.tabla).select(tema.campos)
                .order("fecha", {ascending:false}).order("id", {ascending:false}).limit(5);
            if (error) throw error;
            if (!data?.length) return "No hay registros disponibles para consultar en " + tema.titulo + ".<br>" + enlace;
            const lista = data.map(r => "<li>" + tema.detalle(r).filter(v => v !== null && v !== undefined && v !== "")
                .map(escaparHTML).join(" · ") + "</li>").join("");
            return "<strong>" + tema.titulo + "</strong><br>Hasta 5 registros, ordenados por fecha más reciente." +
                "<ul style='padding-left:18px;margin:8px 0'>" + lista + "</ul>" + enlace;
        } catch (error) {
            console.error("Consulta de Temayín:", error);
            return "No pude cargar los registros de " + tema.titulo + ". Abre el módulo para revisar la información.<br>" + enlace;
        }
    }
    // ==========================================================
    // MONTAJE E INTERACCIÓN EN EL DOM
    // ==========================================================
    document.addEventListener("DOMContentLoaded", () => {
        const duplicadoViejo = document.getElementById("widgetTemayinCentral");
        if (duplicadoViejo) duplicadoViejo.remove();

        const contenedor = document.createElement("div");
        contenedor.id = "widgetTemayinCentral";
        contenedor.innerHTML = `
            <button type="button" class="temayin-btn-flotante" id="btnTemayinToggle" title="Temayín - Asistente IA">
                <img src="${RUTA_LOGO_TEMAYIN}" alt="Temayín" onerror="this.outerHTML='🐆'">
            </button>
            <div class="temayin-ventana" id="ventanaTemayin">
                <div class="temayin-header">
                    <div class="temayin-header-info">
                        <div class="temayin-header-avatar">
                            <img src="${RUTA_LOGO_TEMAYIN}" alt="Temayín" onerror="this.outerHTML='🐆'">
                        </div>
                        <div class="temayin-header-text">
                            <h4>Temayín IA</h4>
                            <span><i class="temayin-status-dot"></i> Consultas y accesos rápidos</span>
                        </div>
                    </div>
                    <button type="button" class="temayin-btn-cerrar" id="btnTemayinCerrar" title="Cerrar">✕</button>
                </div>
                <div class="temayin-cuerpo" id="chatTemayinCuerpo">
                    <div class="temayin-mensaje temayin-bot">
                        ¡Hola! 👋 Soy <strong>Temayín IA</strong>. Puedo mostrarte registros recientes y llevarte al módulo que necesitas. Elige una pregunta o escribe operaciones, incidencias, combustible, costos, personal o material rodante.
                        <div class="temayin-sugerencias">
                            <span class="temayin-chip" data-pregunta="¿Cuáles son las operaciones recientes?">Operaciones recientes</span>
                            <span class="temayin-chip" data-pregunta="¿Cómo está el consumo de combustible?">Estado de combustible</span>
                            <span class="temayin-chip" data-pregunta="Mostrar incidencias actuales">Incidencias actuales</span>
                            <span class="temayin-chip" data-pregunta="Mostrar costos por demora">Costos por demora</span>
                            <span class="temayin-chip" data-pregunta="Dónde está el personal">Personal</span>
                            <span class="temayin-chip" data-pregunta="Dónde está material rodante">Material rodante</span>
                        </div>
                    </div>
                </div>
                <div class="temayin-footer">
                    <input type="text" class="temayin-input" id="inputTemayin" placeholder="Pregúntale a Temayín sobre datos reales...">
                    <button type="button" class="temayin-btn-enviar" id="btnTemayinEnviar" title="Enviar">➤</button>
                </div>
            </div>
        `;
        document.body.appendChild(contenedor);

        const btnToggle = document.getElementById("btnTemayinToggle");
        const btnCerrar = document.getElementById("btnTemayinCerrar");
        const ventana = document.getElementById("ventanaTemayin");
        const cuerpoChat = document.getElementById("chatTemayinCuerpo");
        const inputTexto = document.getElementById("inputTemayin");
        const btnEnviar = document.getElementById("btnTemayinEnviar");

        if (btnToggle && ventana) {
            btnToggle.addEventListener("click", () => {
                const abierta = ventana.classList.toggle("activa");
                if (abierta && inputTexto) {
                    setTimeout(() => inputTexto.focus(), 200);
                }
            });
        }

        if (btnCerrar && ventana) {
            btnCerrar.addEventListener("click", () => {
                ventana.classList.remove("activa");
            });
        }

        function agregarMensaje(texto, remitente = "bot") {
            const div = document.createElement("div");
            div.className = `temayin-mensaje temayin-${remitente}`;
            div.innerHTML = texto;
            cuerpoChat.appendChild(div);
            cuerpoChat.scrollTop = cuerpoChat.scrollHeight;
            return div;
        }

        async function enviarMensaje() {
            const consulta = inputTexto.value.trim();
            if (!consulta || btnEnviar.disabled) return;
            btnEnviar.disabled = true;

            agregarMensaje(escaparHTML(consulta), "usuario");
            inputTexto.value = "";

            const mensajeCargando = agregarMensaje("<em>🔍 Consultando bases de datos en tiempo real...</em>", "bot");

            try {
                const respuesta = await consultarDatosRealesSupabase(consulta);
                mensajeCargando.innerHTML = respuesta;
            } catch (err) {
                console.error("Error en consulta de Temayín:", err);
                mensajeCargando.innerHTML = "⚠️ Ocurrió un error al consultar las bases de datos de Supabase.";
            }

            btnEnviar.disabled = false;
            cuerpoChat.scrollTop = cuerpoChat.scrollHeight;
        }

        if (btnEnviar) {
            btnEnviar.addEventListener("click", enviarMensaje);
        }

        if (inputTexto) {
            inputTexto.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    enviarMensaje();
                }
            });
        }

        cuerpoChat.addEventListener("click", (e) => {
            const chip = e.target.closest(".temayin-chip[data-pregunta]");
            if (!chip) return;

            const pregunta = chip.getAttribute("data-pregunta") || chip.textContent;
            inputTexto.value = pregunta;
            enviarMensaje();
        });
    });
})();
