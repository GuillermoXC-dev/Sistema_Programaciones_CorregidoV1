(() => {
    const elemento = id => document.getElementById(id);
    const cliente = window.supabaseClient;
    const form = elemento("formulario");
    const mensaje = elemento("mensaje");
    const enviar = elemento("enviar");
    let registro = false;

    function modo(nuevo) {
        registro = nuevo;
        elemento("olvido").hidden = nuevo;
        elemento("entrar").setAttribute("aria-pressed", String(!nuevo));
        elemento("alta").setAttribute("aria-pressed", String(nuevo));
        elemento("repetir").hidden = elemento("aviso").hidden = !nuevo;
        elemento("confirmacion").required = nuevo;
        elemento("confirmacion").value = elemento("clave").value = "";
        elemento("clave").autocomplete = nuevo ? "new-password" : "current-password";
        enviar.textContent = nuevo ? "Crear cuenta" : "Entrar";
        mensaje.textContent = "";
    }

    async function mostrarCuenta(usuario) {
        elemento("olvido").hidden = form.hidden = elemento("tabs").hidden = true;
        elemento("cuenta").hidden = false;
        elemento("continuar").hidden = true;
        elemento("titulo").textContent = "Mi cuenta";
        const {data: rol, error} = await cliente.rpc("rol_operaciones");
        if (error) throw error;
        const nombres = {administrador:"Administrador", capturista:"Capturista", consulta:"Consulta"};
        const autorizado = Object.hasOwn(nombres, rol);
        elemento("continuar").hidden = !autorizado;
        mensaje.textContent = usuario.email + " · " + (autorizado ? nombres[rol] : "Tu cuenta está pendiente de asignación de rol.");
    }

    elemento("entrar").onclick = () => modo(false);
    elemento("alta").onclick = () => modo(true);
    elemento("salir").onclick = async () => {
        const {error} = await cliente.auth.signOut({scope:"local"});
        if (error) mensaje.textContent = "No se pudo cerrar la sesión. Intenta de nuevo.";
        else location.reload();
    };
    form.onsubmit = async evento => {
        evento.preventDefault();
        if (enviar.disabled) return;
        const email = elemento("correo").value.trim();
        const password = elemento("clave").value;
        if (registro && password !== elemento("confirmacion").value) {
            mensaje.textContent = "Las contraseñas deben coincidir.";
            return;
        }
        enviar.disabled = elemento("alta").disabled = elemento("entrar").disabled = true;
        mensaje.textContent = "Procesando…";
        try {
            const resultado = registro
                ? await cliente.auth.signUp({email,password,options:{emailRedirectTo:location.href.split(/[?#]/)[0]}})
                : await cliente.auth.signInWithPassword({email,password});
            if (resultado.error) throw resultado.error;
            form.reset();
            if (resultado.data.session) await mostrarCuenta(resultado.data.session.user);
            else mensaje.textContent = "Revisa tu correo para confirmar el registro. Si ya tienes cuenta, inicia sesión.";
        } catch (error) {
            mensaje.textContent = error.code === "invalid_credentials" ? "Verifica tu correo y contraseña." : "No se pudo completar la solicitud. " + error.message;
        } finally {
            enviar.disabled = elemento("alta").disabled = elemento("entrar").disabled = false;
        }
    };
    async function iniciar() {
        enviar.disabled = true;
        try {
            const {data,error} = await cliente.auth.getSession();
            if (error) throw error;
            if (data.session) await mostrarCuenta(data.session.user);
            enviar.disabled = false;
        } catch {
            mensaje.textContent = "No se pudo verificar el acceso. Revisa la conexión y recarga la página.";
        }
    }
    iniciar();
})();

