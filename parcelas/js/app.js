// ============================================
// ENTRY POINT — ORQUESTADOR
// ============================================

// IMPORTANTE: cargar envío primero para que registre listeners
import "./envio.js";

import { cargar } from "./storage.js";
import * as parcelas from "./parcelas.js";
import {
  actualizarSelectorParcelas,
  calcularMetricas,
  inicializarEventosMapa,
  inicializarBotones,
} from "./ui.js";

function init() {
  const { parcelas: datos, activaId } = cargar();
  if (datos.length === 0) {
    parcelas.crearParcela();
  } else {
    parcelas.inicializarParcelas(datos, activaId);
  }
  actualizarSelectorParcelas();
  parcelas.renderizarTodo();
  calcularMetricas();
  inicializarEventosMapa();
  inicializarBotones();

  // Notificar a envio.js que ya hay parcelas listas
  document.dispatchEvent(new CustomEvent("parcela:actualizada"));
}

init();
