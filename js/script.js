/**
 * ============================================================
 * MG AGRIMENSURA - ARCHIVO PRINCIPAL DE JAVASCRIPT
 * ============================================================
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 MG Agrimensura - Sitio cargado correctamente");

  // ============================================================
  // 1. CARGAR SERVICIOS DESDE JSON
  // ============================================================

  const serviciosContainer = document.getElementById("servicios-container");

  if (serviciosContainer) {
    cargarServicios();
  }

  function cargarServicios() {
    serviciosContainer.innerHTML = `
            <div class="loading-message">
                <i class="fas fa-spinner fa-spin"></i> Cargando servicios...
            </div>
        `;

    const url = "data/servicios.json";

    fetch(url)
      .then(function (respuesta) {
        if (!respuesta.ok) {
          throw new Error("Error al cargar los servicios: " + respuesta.status);
        }
        return respuesta.json();
      })
      .then(function (data) {
        console.log("✅ Servicios cargados:", data);
        renderizarServicios(data.servicios);
      })
      .catch(function (error) {
        console.error("❌ Error al cargar servicios:", error);
        serviciosContainer.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        No se pudieron cargar los servicios. 
                        <br><small>Error: ${error.message}</small>
                        <br><br>
                        <button onclick="location.reload()" class="btn-servicio">
                            <i class="fas fa-sync"></i> Reintentar
                        </button>
                    </div>
                `;
      });
  }

  function renderizarServicios(servicios) {
    serviciosContainer.innerHTML = "";

    servicios.forEach(function (servicio) {
      const item = document.createElement("div");
      item.className = "service-item";
      item.style.cursor = "pointer";

      const urlContacto = `pages/contacto.html?servicio=${encodeURIComponent(servicio.nombre)}&id=${servicio.id}`;

      item.innerHTML = `
                <i class="fas ${servicio.icono} service-icon" aria-hidden="true"></i>
                <div class="service-content">
                    <h3>${servicio.nombre}</h3>
                    <p>${servicio.descripcion}</p>
                    <span class="click-indicator">
                        → Solicitar presupuesto
                    </span>
                </div>
            `;

      item.addEventListener("click", function () {
        console.log(`🔗 Redirigiendo a: ${urlContacto}`);
        window.location.href = urlContacto;
      });

      serviciosContainer.appendChild(item);
    });

    console.log(`✅ Renderizados ${servicios.length} servicios`);
  }

  // ============================================================
  // 2. CARGAR ÁREAS DE TRABAJO DESDE JSON
  // ============================================================

  const areasContainer = document.getElementById("areas-container");

  if (areasContainer) {
    cargarAreas();
  }

  function cargarAreas() {
    areasContainer.innerHTML = `
            <div class="loading-message">
                <i class="fas fa-spinner fa-spin"></i> Cargando áreas de trabajo...
            </div>
        `;

    const url = "data/areas.json";

    fetch(url)
      .then(function (respuesta) {
        if (!respuesta.ok) {
          throw new Error("Error al cargar las áreas: " + respuesta.status);
        }
        return respuesta.json();
      })
      .then(function (data) {
        console.log("✅ Áreas cargadas:", data);
        renderizarAreas(data.areas);
      })
      .catch(function (error) {
        console.error("❌ Error al cargar áreas:", error);
        areasContainer.innerHTML = `
                    <div class="error-message" style="grid-column: 1 / -1;">
                        <i class="fas fa-exclamation-triangle"></i>
                        No se pudieron cargar las áreas de trabajo.
                        <br><small>Error: ${error.message}</small>
                    </div>
                `;
      });
  }

  function renderizarAreas(areas) {
    areasContainer.innerHTML = "";

    areas.forEach(function (area) {
      const item = document.createElement("article");
      item.className = "ubicacion-card";

      item.innerHTML = `
                <i class="fas ${area.icono}" aria-hidden="true"></i>
                <h3>${area.nombre}</h3>
                <p>${area.descripcion}</p>
            `;

      areasContainer.appendChild(item);
    });

    console.log(`✅ Renderizadas ${areas.length} áreas de trabajo`);
  }

  // ============================================================
  // 3. FORMULARIO DE CONTACTO
  // ============================================================

  const formulario = document.getElementById("contacto-form");

  if (formulario) {
    mostrarServicioSeleccionado();

    formulario.addEventListener("submit", function (e) {
      e.preventDefault();

      limpiarErrores();

      const nombre = document.getElementById("nombre").value.trim();
      const email = document.getElementById("email").value.trim();
      const telefono = document.getElementById("telefono").value.trim();
      const servicio = document.getElementById("servicio").value;
      const terminos = document.getElementById("acepto-terminos").checked;

      let esValido = true;

      if (nombre.length < 3) {
        mostrarError(
          "error-nombre",
          "El nombre debe tener al menos 3 caracteres",
        );
        esValido = false;
      }

      if (!validarEmail(email)) {
        mostrarError("error-email", "Ingresá un correo electrónico válido");
        esValido = false;
      }

      const telefonoLimpio = telefono.replace(/\D/g, "");
      if (telefonoLimpio.length < 10) {
        mostrarError("error-telefono", "Ingresá un número de teléfono válido");
        esValido = false;
      }

      if (!servicio) {
        const select = document.getElementById("servicio");
        select.classList.add("error");
        const errorSpan = document.createElement("span");
        errorSpan.className = "mensaje-error";
        errorSpan.textContent = "Seleccioná un servicio";
        select.parentNode.appendChild(errorSpan);
        esValido = false;
      }

      if (!terminos) {
        const checkbox = document.getElementById("acepto-terminos");
        checkbox.classList.add("error");
        const errorSpan = document.createElement("span");
        errorSpan.className = "mensaje-error";
        errorSpan.textContent = "Debés aceptar los términos y condiciones";
        checkbox.parentNode.appendChild(errorSpan);
        esValido = false;
      }

      if (esValido) {
        const boton = formulario.querySelector(".boton-enviar");
        const textoOriginal = boton.innerHTML;
        boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        boton.disabled = true;

        const datos = new FormData(formulario);

        fetch(formulario.action, {
          method: "POST",
          body: datos,
          headers: {
            Accept: "application/json",
          },
        })
          .then(function (respuesta) {
            if (respuesta.ok) {
              formulario.style.display = "none";
              document.getElementById("mensaje-exito").style.display = "block";
              console.log("✅ Consulta enviada a Formspree");
            } else {
              respuesta.json().then(function (data) {
                if (data.errors) {
                  alert(
                    "Error: " + data.errors.map((e) => e.message).join(", "),
                  );
                } else {
                  alert("Hubo un problema al enviar. Intentá nuevamente.");
                }
              });
            }
          })
          .catch(function (error) {
            console.error("Error:", error);
            alert("Error de conexión. Verificá tu internet.");
          })
          .finally(function () {
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
          });
      }
    });
  }

  // ============================================================
  // 4. FUNCIÓN: MOSTRAR SERVICIO SELECCIONADO
  // ============================================================

  function mostrarServicioSeleccionado() {
    const urlParams = new URLSearchParams(window.location.search);
    const servicio = urlParams.get("servicio");
    const id = urlParams.get("id");

    console.log("🔍 Parámetros de URL:", { servicio, id });

    if (servicio) {
      const contenedor = document.getElementById("servicio-seleccionado");
      const nombreSpan = document.getElementById("servicio-nombre");
      const detalleP = document.getElementById("servicio-detalle");

      if (contenedor) {
        contenedor.style.display = "block";
        nombreSpan.textContent = servicio;
        console.log(`📋 Servicio seleccionado: ${servicio}`);
      }

      if (id) {
        fetch("../data/servicios.json")
          .then((r) => r.json())
          .then((data) => {
            const encontrado = data.servicios.find((s) => s.id === id);
            if (encontrado && detalleP) {
              detalleP.textContent = encontrado.detalle || "";
              console.log(`📄 Detalle encontrado: ${encontrado.detalle}`);
            }
          })
          .catch(() => {});
      }

      const select = document.getElementById("servicio");
      if (select) {
        for (let option of select.options) {
          if (option.value === servicio) {
            option.selected = true;
            console.log(`✅ Preseleccionado en select: ${servicio}`);
            break;
          }
        }
      }
    } else {
      console.log("ℹ️ No hay servicio seleccionado en la URL");
    }
  }

  // ============================================================
  // 5. FUNCIONES DE VALIDACIÓN
  // ============================================================

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function mostrarError(id, mensaje) {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.textContent = mensaje;
      const input = elemento.previousElementSibling;
      if (input && input.tagName !== "SPAN") {
        input.classList.add("error");
      }
    }
  }

  function limpiarErrores() {
    document.querySelectorAll(".mensaje-error").forEach(function (el) {
      el.textContent = "";
    });
    document.querySelectorAll(".error").forEach(function (el) {
      el.classList.remove("error");
    });
  }

  // ============================================================
  // 6. BOTÓN WHATSAPP
  // ============================================================

  const waButton = document.getElementById("waButton");

  if (waButton) {
    waButton.addEventListener("click", function () {
      const telefono = "+5492223507394";
      let mensaje = "Hola, me comunico desde la web de MG Agrimensura.";

      if (window.location.pathname.includes("contacto.html")) {
        const servicioSelect = document.getElementById("servicio");
        if (servicioSelect && servicioSelect.value) {
          mensaje += ` Me interesa el servicio de: ${servicioSelect.value}.`;
        }
      }

      const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, "_blank");
    });
  }

  // ============================================================
  // 7. NAVEGACIÓN ACTIVA POR SCROLL (solo en index)
  // ============================================================

  if (!window.location.pathname.includes("contacto.html")) {
    function actualizarNavegacionActiva() {
      const scrollY = window.scrollY;
      const navLinks = document.querySelectorAll(".nav-links a");
      const secciones = document.querySelectorAll("section[id]");

      let seccionActual = "";

      secciones.forEach(function (seccion) {
        const offset = seccion.offsetTop - 150;
        const altura = seccion.offsetHeight;
        const id = seccion.getAttribute("id");

        if (scrollY >= offset && scrollY < offset + altura) {
          seccionActual = id;
        }
      });

      navLinks.forEach(function (link) {
        link.removeAttribute("aria-current");
        const href = link.getAttribute("href");
        if (href === "#" + seccionActual) {
          link.setAttribute("aria-current", "page");
        }
      });
    }

    window.addEventListener("scroll", function () {
      if (!window._scrollTimeout) {
        window._scrollTimeout = true;
        requestAnimationFrame(function () {
          actualizarNavegacionActiva();
          window._scrollTimeout = false;
        });
      }
    });

    actualizarNavegacionActiva();
  }

  // ============================================================
  // 8. SCROLL SUAVE PARA ENLACES INTERNOS
  // ============================================================

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  console.log("✅ MG Agrimensura - Inicialización completa");
});
