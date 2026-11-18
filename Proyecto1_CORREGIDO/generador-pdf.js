function inicializarBotonPDF(idBoton, idTablaHTML, tituloDocumento) {
    const boton = document.getElementById(idBoton);
    if (!boton) return;
    boton.addEventListener("click", () => {
        if (!window.jspdf?.jsPDF) {
            alert("No se pudo cargar el generador de PDF. Recarga la página.");
            return;
        }
        const tabla = document.getElementById(idTablaHTML);
        const columnas = Array.from(tabla.tHead.rows[0].cells).slice(0, -1);
        const filas = Array.from(tabla.tBodies[0].rows)
            .filter(fila => fila.cells.length === 6 && !fila.hidden)
            .map(fila => Array.from(fila.cells).slice(0, -1).map(celda =>
                celda.textContent.replace(/[\u{1F300}-\u{1FAFF}\uFE0F]/gu, "").trim()));
        if (!filas.length) {
            alert("No hay registros de combustible cargados para exportar.");
            return;
        }
        const pdf = new window.jspdf.jsPDF({orientation: "landscape", format: "a4"});
        if (!pdf.autoTable) {
            alert("No se pudo cargar el formato de tablas PDF. Recarga la página.");
            return;
        }
        const periodo = "Registros mostrados en la tabla";
        function numero(texto) {
            return Number(texto.replace(/[^0-9.-]/g, "")) || 0;
        }
    const verde = [0, 83, 73];
    const dorado = [184, 151, 77];
    const ancho = pdf.internal.pageSize.getWidth();
    const alto = pdf.internal.pageSize.getHeight();
    const fechaEmision = new Date().toLocaleString("es-MX");
    const litros = filas.reduce((total, fila) => total + numero(fila[2]), 0);
    const costo = filas.reduce((total, fila) => total + numero(fila[4]), 0);

    function encabezado() {
        pdf.setFillColor(...verde);
        pdf.rect(0, 0, ancho, 34, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text("TREN MAYA · SERVICIO DE CARGA", 14, 11);
        pdf.setFontSize(20);
        pdf.text("Informe de combustible", 14, 22);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text("Dirección de Control de Operaciones Ferroviarias de Carga", 14, 29);
        pdf.setFillColor(...dorado);
        pdf.rect(0, 34, ancho, 1.4, "F");
    }

    encabezado();
    pdf.setTextColor(...verde);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text("PERIODO CONSULTADO", 14, 43);
    pdf.text("FECHA DE EMISIÓN", 155, 43);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(periodo, 14, 49);
    pdf.text(fechaEmision, 155, 49);

    pdf.setFillColor(244, 247, 245);
    pdf.roundedRect(14, 55, ancho - 28, 20, 2, 2, "F");
    pdf.setDrawColor(...dorado);
    pdf.setLineWidth(0.5);
    pdf.line(14, 55, ancho - 14, 55);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text(String(filas.length), 20, 64);
    pdf.text(litros.toLocaleString("es-MX", {maximumFractionDigits: 2}) + " L", 110, 64);
    pdf.text(costo.toLocaleString("es-MX", {style:"currency", currency:"MXN"}), 200, 64);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Registros incluidos", 20, 71);
    pdf.text("Litros utilizados", 110, 71);
    pdf.text("Costo total", 200, 71);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("Detalle de combustible", 14, 84);

    pdf.autoTable({
        startY: 88,
        margin: {top: 42, bottom: 19, left: 14, right: 14},
        head: [columnas.map(c => c.textContent.trim())],
        body: filas,
        theme: "grid",
        styles: {
            font: "helvetica", fontSize: 8, cellPadding: 2.5,
            overflow: "linebreak", textColor: [35, 49, 45],
            lineColor: [219, 227, 222], lineWidth: 0.15,
            valign: "top"
        },
        headStyles: {fillColor: verde, textColor: [255,255,255], fontStyle: "bold"},
        alternateRowStyles: {fillColor: [244,247,245]},
        columnStyles: {
            0: {cellWidth: 40}, 1: {cellWidth: 65},
            2: {halign: "right"}, 3: {halign: "right"}, 4: {halign: "right"}
        },
        showHead: "everyPage",
        rowPageBreak: "avoid",
        willDrawPage: datos => { if (datos.pageNumber > 1) encabezado(); }
    });

    const paginas = pdf.internal.getNumberOfPages();
    for (let pagina = 1; pagina <= paginas; pagina++) {
        pdf.setPage(pagina);
        pdf.setDrawColor(...dorado);
        pdf.setLineWidth(0.4);
        pdf.line(14, alto - 15, ancho - 14, alto - 15);
        pdf.setTextColor(...verde);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text("DCOFC · Sistema de Operaciones · Registros del periodo seleccionado", 14, alto - 9);
        pdf.text("Página " + pagina + " de " + paginas, ancho - 14, alto - 9, {align: "right"});
    }
        const url = pdf.output("bloburl");
        const ventana = window.open(url, "_blank");
        if (!ventana) pdf.save("Combustible.pdf");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    inicializarBotonPDF("btn-imprimir", "tabla-registros", "Reporte de Combustible");
});