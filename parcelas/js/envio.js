// ============================================
// ENVÍO DE PARCELA — Módulo independiente
// ============================================
import { getParcelaActiva } from "./parcelas.js";
import { calcularMetricas } from "./ui.js";

const API_URL = "https://mgagrimensura-backend-2.onrender.com/api/parcelas";

function $(id) {
  return document.getElementById(id);
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

function inicializarEnvio() {
  const form = $("form-envio");
  if (!form) return;

  ["envio-nombre", "envio-email", "envio-telefono", "envio-direccion"].forEach(
    (id) => {
      const el = $(id);
      if (el) el.addEventListener("input", validarBoton);
    },
  );

  form.addEventListener("submit", enviar);
  document.addEventListener("parcela:actualizada", actualizarResumen);
  actualizarResumen();
}

// ============================================================
// RESUMEN
// ============================================================

function actualizarResumen() {
  const p = getParcelaActiva();
  const n = p?.coordenadas?.length || 0;
  const resumen = $("resumen-parcela");
  if (!resumen) return;

  if (n < 3) {
    resumen.innerHTML = `<p class="info-vacia">Dibujá una parcela con al menos 3 vértices en el mapa.</p>`;
    validarBoton();
    return;
  }

  const m = calcularMetricas();
  resumen.innerHTML = `
    <div class="metrica"><span class="metrica-valor">${(m.area / 10000).toFixed(4)} ha</span><span class="metrica-etiqueta">Hectáreas</span></div>
    <div class="metrica"><span class="metrica-valor">${m.area.toLocaleString("es-AR", { maximumFractionDigits: 2 })} m²</span><span class="metrica-etiqueta">Área</span></div>
    <div class="metrica"><span class="metrica-valor">${m.perimetro.toLocaleString("es-AR", { maximumFractionDigits: 2 })} m</span><span class="metrica-etiqueta">Perímetro</span></div>
    <div class="metrica"><span class="metrica-valor">${n}</span><span class="metrica-etiqueta">Vértices</span></div>
  `;
  validarBoton();
}

// ============================================================
// VALIDACIÓN
// ============================================================

function validarBoton() {
  const p = getParcelaActiva();
  const tieneParcela = (p?.coordenadas?.length || 0) >= 3;

  const nombre = $("envio-nombre")?.value?.trim() || "";
  const email = $("envio-email")?.value?.trim() || "";
  const telefono = $("envio-telefono")?.value?.trim() || "";
  const direccion = $("envio-direccion")?.value?.trim() || "";

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const telOk = /^[\d\s\+\-\(\)]{7,}$/.test(telefono);

  const btn = $("btn-enviar");
  if (btn)
    btn.disabled = !(tieneParcela && nombre && emailOk && telOk && direccion);
}

// ============================================================
// ENVÍO
// ============================================================

async function enviar(e) {
  e.preventDefault();
  const btn = $("btn-enviar");
  if (btn?.disabled) return;

  const p = getParcelaActiva();
  const m = calcularMetricas();

  const coords = p.coordenadas.map((pt) => [pt.lng, pt.lat]);
  const primero = coords[0];
  const ultimo = coords[coords.length - 1];
  if (primero[0] !== ultimo[0] || primero[1] !== ultimo[1]) {
    coords.push([...primero]);
  }

  const payload = {
    geoJSON: { type: "Polygon", coordinates: [coords] },
    areaM2: parseFloat(m.area.toFixed(4)),
    perimetroM: parseFloat(m.perimetro.toFixed(4)),
    cliente: {
      nombre: $("envio-nombre").value.trim(),
      email: $("envio-email").value.trim(),
      telefono: $("envio-telefono").value.trim(),
      mensaje: (
        $("envio-mensaje").value.trim() +
        "\nDirección: " +
        $("envio-direccion").value.trim()
      ).trim(),
    },
  };

  const textoOriginal = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Enviando...";
  mostrarEstado("");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 201) {
      const data = await res.json();
      mostrarEstado(`✅ Enviado. ID: ${data.data.id}`, "exito");
      $("form-envio").reset();
      actualizarResumen();
    } else if (res.status === 400) {
      const data = await res.json();
      mostrarEstado(`❌ ${data.message || "Datos inválidos"}`, "error");
    } else {
      mostrarEstado("❌ Error del servidor. Intente más tarde.", "error");
    }
  } catch {
    mostrarEstado("❌ No se pudo conectar con el servidor.", "error");
  } finally {
    btn.textContent = textoOriginal;
    validarBoton();
  }
}

function mostrarEstado(texto, tipo) {
  const el = $("envio-mensaje-estado");
  if (!el) return;
  el.textContent = texto;
  el.className = "mensaje-estado";
  if (tipo === "exito") el.classList.add("mensaje-exito");
  if (tipo === "error") el.classList.add("mensaje-error");
}

inicializarEnvio();
