(() => {
    const auth = window.supabaseClient.auth;
    const solicitud = document.querySelector("#solicitud");
    const cambio = document.querySelector("#cambio");
    const mensaje = document.querySelector("#mensaje");
    const destino = new URL("recuperar.html", location.href).href;
    auth.onAuthStateChange(evento => {
        if (evento === "PASSWORD_RECOVERY") {
            solicitud.hidden = true;
            cambio.hidden = false;
            document.querySelector("#titulo").textContent = "Elige tu nueva contraseña";
            mensaje.textContent = "";
        }
    });
    if (/error=/.test(location.hash + location.search)) {
        mensaje.textContent = "El enlace ya no es válido. Solicita uno nuevo.";
    }
    solicitud.onsubmit = async evento => {
        evento.preventDefault();
        const boton = solicitud.querySelector("button");
        boton.disabled = true;
        try {
            const {error} = await auth.resetPasswordForEmail(solicitud.elements.correo.value.trim(), {redirectTo: destino});
            mensaje.textContent = error ? "No se pudo enviar la solicitud. Intenta de nuevo más tarde." : "Si hay una cuenta con ese correo, recibirás un enlace. Revisa también el correo no deseado.";
        } catch {
            mensaje.textContent = "Comprueba tu conexión e intenta de nuevo.";
        } finally {
            boton.disabled = false;
        }
    };
    cambio.onsubmit = async evento => {
        evento.preventDefault();
        const password = cambio.elements.clave.value;
        if (password !== cambio.elements.confirmar.value) {
            mensaje.textContent = "Las contraseñas deben coincidir.";
            return;
        }
        const boton = cambio.querySelector("button");
        boton.disabled = true;
        try {
            const {error} = await auth.updateUser({password});
            if (error) {
                mensaje.textContent = error.message;
                return;
            }
            cambio.reset();
            cambio.hidden = true;
            mensaje.textContent = "Contraseña actualizada. Puedes volver al acceso.";
        } catch {
            mensaje.textContent = "Comprueba tu conexión e intenta de nuevo.";
        } finally {
            boton.disabled = false;
        }
    };
})();
