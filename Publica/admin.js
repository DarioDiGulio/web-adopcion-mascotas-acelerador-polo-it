// ==========================================
// CONFIGURACIÓN Y CONSTANTES
// ==========================================
const CONFIG = {
  API_URL: 'https://misterio07.alwaysdata.net',
  ALERT_TIMEOUT: 5000,
  ENDPOINTS: {
    MASCOTAS: '/mascotas',
    MASCOTA: '/mascota'
  }
};

// ==========================================
// ESTADO DE LA APLICACIÓN
// ==========================================
const appState = {
  modoEdicion: false,
  mascotaAEliminar: null
};

// ==========================================
// ELEMENTOS DEL DOM
// ==========================================
const elementos = {
  form: document.getElementById('mascotaForm'),
  formContainer: document.getElementById('formContainer'),
  formTitle: document.getElementById('formTitle'),
  tablaMascotas: document.getElementById('tablaMascotas'),
  alertContainer: document.getElementById('alertContainer'),
  previewContainer: document.getElementById('previewContainer'),
  btnNuevaMascota: document.getElementById('btnNuevaMascota'),
  btnCancelar: document.getElementById('btnCancelar'),
  btnConfirmarEliminar: document.getElementById('confirmarEliminar'),
  inputFoto: document.getElementById('foto'),
  inputMascotaId: document.getElementById('mascotaId')
};

// ==========================================
// UTILIDADES
// ==========================================
const Utils = {
  /**
   * Muestra una alerta en la interfaz
   * @param {string} mensaje - Mensaje a mostrar
   * @param {string} tipo - Tipo de alerta (success, danger, warning)
   */
  mostrarAlerta(mensaje, tipo = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo} alert-dismissible fade show`;
    alert.innerHTML = `
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    elementos.alertContainer.appendChild(alert);
    
    setTimeout(() => {
      alert.remove();
    }, CONFIG.ALERT_TIMEOUT);
  },

  /**
   * Scroll suave hacia el inicio de la página
   */
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Valida el formulario usando la API de validación de HTML5
   * @param {HTMLFormElement} form - Formulario a validar
   * @returns {boolean} - True si el formulario es válido
   */
  validarFormulario(form) {
    form.classList.add('was-validated');
    return form.checkValidity();
  },

  /**
   * Crea una URL completa para la API
   * @param {string} endpoint - Endpoint de la API
   * @returns {string} - URL completa
   */
  crearURL(endpoint) {
    return `${CONFIG.API_URL}${endpoint}`;
  }
};