/* =====================================================
   HORARIO SEMANAL DEL PERSONAL (subpestaña 7 de Personal)

   Lee:   Personal (campo = Patio/Camino, patio base)
          AsignacionGruposPersonal (personal_id, patio, grupo, fecha, jornada)
          AsignacionGrupoPatio / AsignacionGrupoCamino (grupos disponibles)
   Escribe: solo AsignacionGruposPersonal (al asignar o quitar un día)

   Requiere la columna jornada (ver SQL entregado) y que dbPersonal exista
   (script inline de distribucion_personal.html).
====================================================== */
(function () {
    const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

    // Tres jornadas de 8 horas. Para cambiar los horarios, edita solo esta tabla.
    const JORNADAS = {
        J1: { etiqueta: "Jornada 1", horario: "06:00–14:00" },
        J2: { etiqueta: "Jornada 2", horario: "14:00–22:00" },
        J3: { etiqueta: "Jornada 3", horario: "22:00–06:00" }
    };
    const CLAVES_JORNADA = Object.keys(JORNADAS);

    const estado = {
        inicio: lunesDe(new Date()),
        personal: [],
        asignaciones: [],
        grupos: { Patio: [], Camino: [] }
    };
    let opcionesPanel = [];

    const el = id => document.getElementById(id);

    function pad(n) { return String(n).padStart(2, "0"); }

    function iso(d) {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    function lunesDe(d) {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
        return x;
    }

    function diasSemana() {
        return DIAS.map((_, i) => {
            const d = new Date(estado.inicio);
            d.setDate(d.getDate() + i);
            return d;
        });
    }

    function esc(v) {
        return String(v ?? "").replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
        }[c]));
    }

    function normCampo(c) {
        const s = String(c || "").toLowerCase();
        if (s.startsWith("patio")) return "Patio";
        if (s.startsWith("camino")) return "Camino";
        return "";
    }

    function rangoTexto() {
        const d = diasSemana();
        return `${d[0].getDate()} ${MESES[d[0].getMonth()]} – ${d[6].getDate()} ${MESES[d[6].getMonth()]} ${d[6].getFullYear()}`;
    }

    // Asignaciones de una persona en una fecha (YYYY-MM-DD)
    function asignacionesDe(p, fecha) {
        return estado.asignaciones.filter(a =>
            String(a.personal_id) === String(p.id) && String(a.fecha).slice(0, 10) === fecha
        );
    }

    function etiquetaJornada(clave) {
        const j = JORNADAS[clave];
        return j ? `${clave} · ${j.horario}` : "Sin jornada";
    }

    // ---------- Datos ----------
    async function cargarDatos() {
        const dias = diasSemana();
        const [p, a, gp, gc] = await Promise.all([
            dbPersonal.from("Personal").select("id,nombre,id_empleado,campo,patio,estatus").order("nombre", { ascending: true }),
            dbPersonal.from("AsignacionGruposPersonal").select("id,personal_id,patio,grupo,fecha,jornada")
                .gte("fecha", iso(dias[0])).lte("fecha", iso(dias[6])),
            dbPersonal.from("AsignacionGrupoPatio").select("grupo,patio"),
            dbPersonal.from("AsignacionGrupoCamino").select("grupo,patio")
        ]);
        const error = p.error || a.error || gp.error || gc.error;
        if (error) throw error;
        estado.personal = p.data || [];
        estado.asignaciones = a.data || [];
        estado.grupos = { Patio: gp.data || [], Camino: gc.data || [] };
    }

    function llenarPatios() {
        const sel = el("hzPatio");
        const actual = sel.value;
        const patios = new Set();
        estado.personal.forEach(p => p.patio && patios.add(p.patio));
        estado.asignaciones.forEach(a => a.patio && patios.add(a.patio));
        sel.innerHTML = '<option value="">Todos los patios</option>' +
            [...patios].sort().map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join("");
        sel.value = actual;
    }

    // ---------- Filtros ----------
    function personasFiltradas() {
        const campo = el("hzCampo").value;
        const patio = el("hzPatio").value;
        const jornada = el("hzJornada").value;
        const texto = el("hzBuscar").value.trim().toLowerCase();
        const isos = diasSemana().map(iso);

        // Asignaciones de la semana visible
        const enSemana = a => isos.includes(String(a.fecha).slice(0, 10));

        return estado.personal
            .map((p, idx) => ({ p, idx }))
            .filter(({ p }) => {
                if (campo && normCampo(p.campo) !== campo) return false;
                if (texto && !`${p.nombre || ""} ${p.id_empleado || ""}`.toLowerCase().includes(texto)) return false;
                if (patio) {
                    const tiene = estado.asignaciones.some(a =>
                        String(a.personal_id) === String(p.id) && a.patio === patio && enSemana(a));
                    if (p.patio !== patio && !tiene) return false;
                }
                if (jornada) {
                    const tiene = estado.asignaciones.some(a =>
                        String(a.personal_id) === String(p.id) && a.jornada === jornada && enSemana(a));
                    if (!tiene) return false;
                }
                return true;
            });
    }

    // ---------- Render ----------
    function render() {
        el("hzRango").textContent = rangoTexto();
        const dias = diasSemana();
        const isos = dias.map(iso);
        const hoy = iso(new Date());

        el("hzCabeza").innerHTML = `<tr><th>Persona</th><th>Campo</th>` +
            dias.map((d, i) => `<th class="${isos[i] === hoy ? "hz-hoy" : ""}">${DIAS[i]}<br><small>${d.getDate()} ${MESES[d.getMonth()]}</small></th>`).join("") +
            `</tr>`;

        const filas = personasFiltradas();
        const cuerpo = el("hzCuerpo");

        if (!filas.length) {
            cuerpo.innerHTML = `<tr><td colspan="9">No hay personal con esos filtros.</td></tr>`;
            el("hzResumen").innerHTML = "";
            return;
        }

        const conteo = isos.map(() => ({ Patio: 0, Camino: 0, Libre: 0, J1: 0, J2: 0, J3: 0 }));

        cuerpo.innerHTML = filas.map(({ p, idx }) => {
            const campo = normCampo(p.campo);
            const celdas = isos.map((f, i) => {
                const asig = asignacionesDe(p, f);
                const attrs = `data-idx="${idx}" data-fecha="${f}"`;

                if (asig.length === 0) {
                    conteo[i].Libre++;
                    return `<td class="hz-libre hz-clic" ${attrs} title="Clic para asignar">Libre</td>`;
                }
                if (asig.length > 1) {
                    return `<td class="hz-choque hz-clic" ${attrs} title="Tiene más de una asignación este día">⚠ ${asig.length} asignaciones</td>`;
                }

                const a = asig[0];
                if (campo) conteo[i][campo]++;
                if (conteo[i][a.jornada] !== undefined) conteo[i][a.jornada]++;
                const clase = campo === "Camino" ? "hz-camino" : "hz-patio";
                return `<td class="${clase} hz-clic" ${attrs}>
                    <strong>${esc(a.patio)}</strong><br>
                    <small>${esc(a.grupo)}</small><br>
                    <span class="hz-jornada">${esc(a.jornada || "Sin jornada")}</span>
                </td>`;
            }).join("");

            return `<tr>
                <th class="hz-persona">${esc(p.nombre)}<br><small>${esc(p.id_empleado || "")}</small>
                    <span class="acciones-persona">
                        <button type="button" class="btn-mini" title="Editar persona" onclick="irAPersonal(${Number(p.id)})">✏️</button>
                        <button type="button" class="btn-mini btn-mini-borrar" title="Eliminar persona" onclick="borrarPersonalGlobal(${Number(p.id)})">🗑️</button>
                    </span>
                </th>
                <td>${esc(campo || "Sin campo")}</td>
                ${celdas}
            </tr>`;
        }).join("");

        el("hzResumen").innerHTML =
            `<tr><th>Patio / Camino</th><th></th>` +
            conteo.map(c => `<td><small>Patio ${c.Patio} · Camino ${c.Camino}<br>Libres ${c.Libre}</small></td>`).join("") +
            `</tr>` +
            `<tr><th>Jornadas</th><th></th>` +
            conteo.map(c => `<td><small>J1 ${c.J1} · J2 ${c.J2} · J3 ${c.J3}</small></td>`).join("") +
            `</tr>`;
    }

    // ---------- Panel de asignación ----------
    function abrirPanel(idx, fecha) {
        const p = estado.personal[idx];
        if (!p) return;
        const campo = normCampo(p.campo);
        const fuente = campo ? estado.grupos[campo] : [...estado.grupos.Patio, ...estado.grupos.Camino];
        opcionesPanel = fuente.map(g => ({ grupo: g.grupo, patio: g.patio }));

        const sel = el("hzGrupo");
        sel.innerHTML = '<option value="">Selecciona grupo...</option>' +
            opcionesPanel.map((g, i) => `<option value="${i}">${esc(g.grupo)} · ${esc(g.patio)}</option>`).join("");

        el("hzJornadaPanel").innerHTML = CLAVES_JORNADA.map(k =>
            `<option value="${k}">${esc(etiquetaJornada(k))}</option>`).join("");

        const actual = asignacionesDe(p, fecha);
        if (actual.length === 1) {
            const i = opcionesPanel.findIndex(g => g.grupo === actual[0].grupo && g.patio === actual[0].patio);
            if (i >= 0) sel.value = String(i);
            if (CLAVES_JORNADA.includes(actual[0].jornada)) el("hzJornadaPanel").value = actual[0].jornada;
        }

        el("hzPanelTitulo").textContent = `${p.nombre} · ${fecha}`;
        const panel = el("hzPanel");
        panel.dataset.idx = String(idx);
        panel.dataset.fecha = fecha;
        panel.hidden = false;
        panel.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function cerrarPanel() {
        el("hzPanel").hidden = true;
    }

    async function recargar() {
        await cargarDatos();
        llenarPatios();
        render();
    }

    async function guardarAsignacion() {
        const panel = el("hzPanel");
        const p = estado.personal[Number(panel.dataset.idx)];
        const fecha = panel.dataset.fecha;
        const g = opcionesPanel[el("hzGrupo").value];
        const jornada = el("hzJornadaPanel").value;
        if (!p) return;
        if (!g) { alert("Selecciona un grupo."); return; }
        if (!JORNADAS[jornada]) { alert("Selecciona una jornada."); return; }

        // Inserta primero; luego quita la asignación anterior de ese día (no se pierde nada si falla)
        const anteriores = asignacionesDe(p, fecha).map(a => a.id);
        const { error } = await dbPersonal.from("AsignacionGruposPersonal")
            .insert([{ personal_id: p.id, patio: g.patio, grupo: g.grupo, fecha, jornada }]);
        if (error) { alert("Error al guardar la asignación: " + error.message); return; }

        if (anteriores.length) {
            const { error: errDel } = await dbPersonal.from("AsignacionGruposPersonal").delete().in("id", anteriores);
            if (errDel) alert("Se guardó la nueva asignación, pero no se pudo quitar la anterior: " + errDel.message);
        }
        cerrarPanel();
        await recargar();
    }

    async function quitarAsignacion() {
        const panel = el("hzPanel");
        const p = estado.personal[Number(panel.dataset.idx)];
        const fecha = panel.dataset.fecha;
        const ids = p ? asignacionesDe(p, fecha).map(a => a.id) : [];
        if (!ids.length) { cerrarPanel(); return; }
        if (!confirm("¿Quitar la asignación de este día?")) return;

        const { error } = await dbPersonal.from("AsignacionGruposPersonal").delete().in("id", ids);
        if (error) { alert("Error al quitar la asignación: " + error.message); return; }
        cerrarPanel();
        await recargar();
    }

    // Editar o eliminar a la persona del panel (usa las funciones de la página)
    function editarPersonaDelPanel() {
        const p = estado.personal[Number(el("hzPanel").dataset.idx)];
        if (!p) return;
        cerrarPanel();
        irAPersonal(p.id);
    }

    async function eliminarPersonaDelPanel() {
        const p = estado.personal[Number(el("hzPanel").dataset.idx)];
        if (!p) return;
        cerrarPanel();
        await borrarPersonalGlobal(p.id);
    }

    // ---------- Vista (la llama cambiarVistaPersonal) ----------
    window.cambiarVistaHorario = async function () {
        el("vistaHorario").classList.add("visible-vista");
        el("subBtnHorario").classList.add("activo-sub");
        try {
            await recargar();
        } catch (e) {
            console.error("Horario semanal:", e);
            alert("No se pudo cargar el horario semanal.");
        }
    };

    // ---------- Eventos (se registran una sola vez) ----------
    el("hzAnterior").addEventListener("click", async () => {
        estado.inicio.setDate(estado.inicio.getDate() - 7);
        await recargar();
    });
    el("hzSiguiente").addEventListener("click", async () => {
        estado.inicio.setDate(estado.inicio.getDate() + 7);
        await recargar();
    });
    el("hzHoy").addEventListener("click", async () => {
        estado.inicio = lunesDe(new Date());
        await recargar();
    });
    el("hzCampo").addEventListener("change", render);
    el("hzPatio").addEventListener("change", render);
    el("hzJornada").addEventListener("change", render);
    el("hzBuscar").addEventListener("input", render);
    el("hzCuerpo").addEventListener("click", e => {
        if (e.target.closest(".acciones-persona")) return; // los iconos de editar/eliminar tienen su propia acción
        const td = e.target.closest(".hz-clic");
        if (td) abrirPanel(Number(td.dataset.idx), td.dataset.fecha);
    });
    el("hzGuardar").addEventListener("click", guardarAsignacion);
    el("hzQuitar").addEventListener("click", quitarAsignacion);
    el("hzEditarPersona").addEventListener("click", editarPersonaDelPanel);
    el("hzEliminarPersona").addEventListener("click", eliminarPersonaDelPanel);
    el("hzCancelar").addEventListener("click", cerrarPanel);
})();
