(() => {
    const controles = "button,input[type=submit],input[type=button],[role=button]";
    const estilo = document.createElement("style");
    estilo.textContent = [
        "html:not([data-rol-operativo]) body {visibility:hidden!important}",
        "html:not([data-rol-operativo=administrador]) [data-permiso=administrar],",
        "html[data-rol-operativo=consulta] [data-permiso=capturar] {display:none!important}"
    ].join("\n");
    document.head.append(estilo);

    function permiso(control) {
        const accion = (control.getAttribute("onclick") || "").split("(")[0].toLowerCase();
        const nombre = [control.id, control.title, control.value, control.textContent].join(" ").toLowerCase();
        if (/exportar|imprimir/.test(accion)) return "";
        if (/editar|edici[oó]n|eliminar|borrar|retirar|quitar|actualizarvagon|agregarvagon|guardarlista|guardarasistenciamasiva/.test(accion + " " + nombre)
            || /toggleFormulario(Entrada|Salida)/i.test(accion)
            || control.closest("#form-entrada,#form-salida")
            || control.id === "hzGuardar") return "administrar";
        if (/guardar|registrar|añadir|anadir|agregar|nuevo|nueva|insertar|abrirformulario/.test(nombre + " " + accion)
            || control.type === "submit" && control.form) return "capturar";
        return "";
    }
    function marcar(control) {
        const nivel = permiso(control);
        if (nivel) control.dataset.permiso = nivel;
        else delete control.dataset.permiso;
    }
    function revisar(nodo) {
        if (nodo.nodeType !== Node.ELEMENT_NODE) return;
        if (nodo.matches(controles)) marcar(nodo);
        nodo.querySelectorAll(controles).forEach(marcar);
    }
    revisar(document.documentElement);
    new MutationObserver(cambios => {
        for (const cambio of cambios) {
            const control = cambio.target.parentElement?.closest(controles) || cambio.target.closest?.(controles);
            if (control) marcar(control);
            cambio.addedNodes.forEach(revisar);
        }
    }).observe(document.documentElement, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:["title","onclick","value","id"]});

    let version = 0;
    async function verificar() {
        const turno = ++version;
        try {
            const {data:rol,error} = await window.supabaseClient.rpc("rol_operaciones");
            if (turno !== version) return;
            if (error || !["administrador","capturista","consulta"].includes(rol)) {
                location.replace("acceso.html");
                return;
            }
            document.documentElement.dataset.rolOperativo = rol;
        } catch {
            if (turno === version) location.replace("acceso.html");
        }
    }
    window.supabaseClient.auth.onAuthStateChange(evento => {
        if (evento === "SIGNED_OUT") {
            version++;
            delete document.documentElement.dataset.rolOperativo;
            location.replace("acceso.html");
        } else {
            setTimeout(verificar, 0);
        }
    });
    verificar();
})();
